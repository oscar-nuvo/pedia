import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

/**
 * Get CORS headers with restricted origin
 * Restricts requests to your own domain to prevent abuse
 */
const getCorsHeaders = (origin?: string) => {
  const allowedOrigins = [
    'https://pedia.lovable.app',  // Production (Lovable)
    'https://pedia-app.vercel.app',  // Production (Vercel)
    'https://staging.pedia-app.vercel.app', // Staging
    'http://localhost:3000',  // Local dev
    'http://localhost:5173',  // Vite dev server
    'http://localhost:8080',  // Vite dev server (configured port)
  ];

  const corsOrigin = (origin && allowedOrigins.includes(origin))
    ? origin
    : allowedOrigins[0];

  return {
    'Access-Control-Allow-Origin': corsOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Max-Age': '86400',
  };
};

serve(async (req) => {
  // Get origin for CORS
  const origin = req.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin || undefined);

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    const { message, conversationId, fileIds = [], patientContext, taskType, options = {} } = await req.json();

    const openaiApiKey = Deno.env.get('PediaAIKey');
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // ✅ SECURITY: Check auth header exists before using
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // ✅ SECURITY: Verify conversation belongs to user before saving messages
    const { data: conversation, error: convError } = await supabase
      .from('conversations')
      .select('id, user_id, metadata')
      .eq('id', conversationId)
      .single();

    if (convError || !conversation) {
      return new Response(
        JSON.stringify({ error: 'Conversation not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (conversation.user_id !== user.id) {
      console.error('Unauthorized conversation access attempt', {
        userId: user.id,
        conversationOwnerId: conversation.user_id,
        conversationId,
      });
      return new Response(
        JSON.stringify({ error: 'Not authorized to access this conversation' }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Processing message for user: ${user.id}`);
    console.log(`Received fileIds: ${JSON.stringify(fileIds)}`);

    // Handle background tasks
    if (taskType && ['medical_research', 'drug_interaction', 'diagnosis_analysis'].includes(taskType)) {
      const result = await handleBackgroundTask(message, taskType, patientContext, openaiApiKey);
      return new Response(JSON.stringify({
        id: crypto.randomUUID(),
        type: taskType,
        status: 'completed',
        result,
        createdAt: new Date(),
        estimatedTime: '2-5 minutes'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Save user message
    const { data: userMessage, error: userMsgError } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        role: 'user',
        content: message,
        metadata: { fileIds, patientContext }
      })
      .select()
      .single();

    if (userMsgError) {
      console.error('Error saving user message:', userMsgError);
      throw userMsgError;
    }

    console.log(`Saved user message: ${userMessage.id}`);

    // Check if this is the first user message in the conversation
    const { count: userMessageCount } = await supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('conversation_id', conversationId)
      .eq('role', 'user');

    // If this is the first user message, trigger title generation (fire-and-forget)
    if (userMessageCount === 1) {
      console.log('First user message detected, triggering title generation');
      supabase.functions.invoke('generate-conversation-title', {
        body: { conversationId, userMessage: message }
      }).catch(error => console.error('Title generation failed:', error));
    }

    // Build conversation context - exclude the just-saved message so we can add it with files
    const { data: recentMessages } = await supabase
      .from('messages')
      .select('role, content, created_at')
      .eq('conversation_id', conversationId)
      .neq('id', userMessage.id)  // Exclude the current message - we'll add it with files
      .order('created_at', { ascending: true })
      .limit(20);

    // Get file metadata for content type detection
    let fileMetadata: { openai_file_id: string; content_type: string }[] = [];
    if (fileIds.length > 0) {
      const { data: files, error: filesError } = await supabase
        .from('conversation_files')
        .select('openai_file_id, content_type')
        .in('openai_file_id', fileIds);

      if (filesError) {
        console.error(`Failed to fetch file metadata: ${JSON.stringify(filesError)}`);
      }

      fileMetadata = files || [];
      console.log(`File metadata query: fileIds=${JSON.stringify(fileIds)}, found=${fileMetadata.length}`);

      // Warn if some files don't have metadata (could indicate upload DB error)
      const missingFiles = fileIds.filter(id => !fileMetadata.find(f => f.openai_file_id === id));
      if (missingFiles.length > 0) {
        console.warn(`Missing metadata for files: ${JSON.stringify(missingFiles)}. These will be treated as documents.`);
      }
    }

    // Helper to check if a file is an image based on content_type
    const isImageFile = (fileId: string): boolean => {
      const file = fileMetadata.find(f => f.openai_file_id === fileId);
      if (!file) {
        console.warn(`No metadata found for file ${fileId}, treating as document`);
        return false;
      }
      return file.content_type?.startsWith('image/') || false;
    };

    // Build input messages for prompt library with content parts format
    const buildConversationInput = (recentMessages: any[], message: string, patientContext: any, fileIds: string[]) => {
      const messages: any[] = [];

      // Add patient context as system message if provided
      if (patientContext) {
        messages.push({
          role: "system",
          content: [
            {
              type: "input_text",
              text: `Patient Context: ${JSON.stringify(patientContext)}`
            }
          ]
        });
      }

      // Add conversation history
      if (recentMessages?.length > 0) {
        messages.push(...recentMessages.map(msg => ({
          role: msg.role,
          content: [
            {
              type: msg.role === "assistant" ? "output_text" : "input_text",
              text: msg.content
            }
          ]
        })));
      }

      // Add current message with files if not already in recent messages
      if (!recentMessages?.some(msg => msg.content === message)) {
        const userMessageContent: any[] = [
          {
            type: "input_text",
            text: message
          }
        ];

        // Add file content blocks with correct type based on content type
        // Images use "input_image", documents use "input_file"
        if (fileIds.length > 0) {
          for (const fileId of fileIds) {
            if (isImageFile(fileId)) {
              // Image format per OpenAI Responses API docs
              userMessageContent.push({
                type: "input_image",
                file_id: fileId
              });
            } else {
              // Document/file format per OpenAI Responses API docs
              userMessageContent.push({
                type: "input_file",
                file_id: fileId
              });
            }
          }
        }

        messages.push({
          role: "user",
          content: userMessageContent
        });
      }

      return messages;
    };

    // Tools disabled - function calling requires submitting results back to OpenAI
    // which isn't currently implemented. The model can still reason about dosages
    // using its training data without needing to call external functions.
    // TODO: Implement proper function calling with result submission if needed
    // const tools = [
    //   {
    //     name: "calculate_pediatric_dosage",
    //     type: "function",
    //     description: "Calculate medication dosage for pediatric patients with safety checks",
    //     parameters: {
    //       type: "object",
    //       properties: {
    //         medication: { type: "string" },
    //         weight_kg: { type: "number" },
    //         age_years: { type: "number" },
    //         indication: { type: "string" },
    //         route: { type: "string", default: "oral" }
    //       },
    //       required: ["medication", "weight_kg", "age_years", "indication"]
    //     }
    //   },
    //   {
    //     name: "analyze_growth_chart",
    //     type: "function",
    //     description: "Analyze pediatric growth parameters and provide percentile estimates",
    //     parameters: {
    //       type: "object",
    //       properties: {
    //         height_cm: { type: "number" },
    //         weight_kg: { type: "number" },
    //         age_months: { type: "number" },
    //         sex: { type: "string", enum: ["male", "female"] }
    //       },
    //       required: ["height_cm", "weight_kg", "age_months", "sex"]
    //     }
    //   }
    // ];

    // Get previous response ID for conversation continuity (using already-fetched conversation)
    const previousResponseId = conversation?.metadata?.responseId;

    // Build the input for OpenAI
    const openaiInput = buildConversationInput(recentMessages || [], message, patientContext, fileIds);

    // Log the request for debugging
    console.log(`OpenAI request input: ${JSON.stringify(openaiInput, null, 2)}`);

    // Create OpenAI Responses API request with prompt library
    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5',
        prompt: {
          id: "pmpt_68d880ea8b0c8194897a498de096ee0f0859affba435451f"
        },
        input: openaiInput,
        // tools disabled - see comment above
        stream: true,
        store: true,
        background: options.background || false,
        ...(previousResponseId && { previous_response_id: previousResponseId }),
        max_output_tokens: 4000
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
    }

    console.log(`Making OpenAI Responses API request for conversation: ${conversationId}`);

    let assistantContent = '';
    let currentResponseId = '';
    let reasoningSummary = '';
    let sawFinalEvent = false;

    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body?.getReader();
        if (!reader) {
          controller.close();
          return;
        }

        let lineBuffer = '';

        const persistAssistantMessage = async () => {
          // Handle edge case: OpenAI returned reasoning but no text output
          if (!assistantContent.trim()) {
            const trimmedReasoning = reasoningSummary.trim();
            if (trimmedReasoning) {
              // This is an error condition - OpenAI should produce output if it produces reasoning
              console.error('ERROR: OpenAI returned reasoning but no text output', {
                conversationId,
                responseId: currentResponseId,
                reasoningLength: trimmedReasoning.length
              });
              assistantContent = `**System Notice: Incomplete Response**\n\nThe AI system was unable to complete its response. The partial reasoning below is provided for reference only and should not be used for clinical decision-making.\n\n---\n\n**Partial Reasoning:**\n${trimmedReasoning}\n\n---\n\n**Recommended Actions:**\n1. Please rephrase your question and try again\n2. If this issue persists, contact technical support\n3. For urgent clinical decisions, consult standard medical references`;
            } else {
              console.error('ERROR: No content to persist - OpenAI returned empty response', {
                conversationId,
                responseId: currentResponseId
              });
              return;
            }
          }

          console.log('Persisting assistant message...', {
            conversationId,
            responseId: currentResponseId,
            contentLength: assistantContent.trim().length
          });

          try {
            const { data: savedMessage, error: assistantMsgError } = await supabase
              .from('messages')
              .insert({
                conversation_id: conversationId,
                role: 'assistant',
                content: assistantContent.trim(),
                response_id: currentResponseId,
                metadata: { 
                  prompt_id: "pmpt_68d880ea8b0c8194897a498de096ee0f0859affba435451f", 
                  responseId: currentResponseId,
                  reasoningSummary: reasoningSummary || undefined
                }
              })
              .select()
              .single();

            if (assistantMsgError) {
              console.error('Error saving assistant message:', JSON.stringify(assistantMsgError));
              controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({
                type: 'db_error',
                details: assistantMsgError.message
              })}\n\n`));
            } else {
              console.log('Successfully saved assistant message:', savedMessage.id);
              
              // Update conversation metadata
              const { error: updateError } = await supabase
                .from('conversations')
                .update({
                  metadata: {
                    ...conversation?.metadata,
                    responseId: currentResponseId,
                    lastResponseAt: new Date().toISOString()
                  }
                })
                .eq('id', conversationId);

              if (updateError) {
                console.error('Error updating conversation metadata:', updateError);
              }

              controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({
                type: 'response_saved',
                messageId: savedMessage.id,
                responseId: currentResponseId
              })}\n\n`));
            }
          } catch (dbError) {
            console.error('Database operation failed:', JSON.stringify(dbError));
            controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({
              type: 'db_error',
              details: dbError instanceof Error ? dbError.message : 'Database error'
            })}\n\n`));
          }
        };

        try {
          controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({
            type: 'response_started'
          })}\n\n`));

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            // Append to line buffer and process complete lines
            lineBuffer += new TextDecoder().decode(value);
            const parts = lineBuffer.split('\n');
            lineBuffer = parts.pop() || ''; // Keep last partial line for next chunk

            for (const line of parts) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6);
                if (data === '[DONE]') continue;

                try {
                  const parsed = JSON.parse(data);
                  console.log('Responses API event:', parsed.type);
                  
                  // Capture response ID early
                  if (parsed.response?.id && !currentResponseId) {
                    currentResponseId = parsed.response.id;
                    console.log('Response ID captured:', currentResponseId);
                    controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({
                      type: 'response_id',
                      responseId: currentResponseId
                    })}\n\n`));
                  }
                  
                  // Handle streaming events
                  if (parsed.type === 'response.output_text.delta') {
                    assistantContent += parsed.delta;
                    controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({
                      type: 'text_delta',
                      delta: parsed.delta
                    })}\n\n`));
                  } else if (parsed.type === 'response.reasoning.summary.delta') {
                    reasoningSummary += parsed.delta;
                    controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({
                      type: 'reasoning_delta',
                      delta: parsed.delta
                    })}\n\n`));
                  } else if (parsed.type === 'response.reasoning.summary.done') {
                    controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({
                      type: 'reasoning_complete',
                      summary: reasoningSummary
                    })}\n\n`));
                  } else if (parsed.type === 'response.function_call.arguments.delta') {
                    controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({
                      type: 'function_arguments_delta',
                      callId: parsed.call_id,
                      delta: parsed.delta
                    })}\n\n`));
                  } else if (parsed.type === 'response.function_call.arguments.done') {
                    try {
                      const result = await handleFunctionCall({
                        name: parsed.name,
                        arguments: parsed.arguments
                      });
                      
                      controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({
                        type: 'function_result',
                        function_name: parsed.name,
                        callId: parsed.call_id,
                        result
                      })}\n\n`));
                    } catch (fnError) {
                      console.error('Function call error:', fnError);
                      controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({
                        type: 'function_result',
                        function_name: parsed.name,
                        callId: parsed.call_id,
                        result: { error: fnError instanceof Error ? fnError.message : 'Function execution failed' }
                      })}\n\n`));
                    }
                  } else if (parsed.type === 'response.completed' || parsed.type === 'response.done' || parsed.type === 'response.output_text.done') {
                    console.log('Final event received:', parsed.type);
                    sawFinalEvent = true;
                    
                    if (!currentResponseId && parsed.response?.id) {
                      currentResponseId = parsed.response.id;
                    }
                    
                    await persistAssistantMessage();

                    controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({
                      type: 'response_complete',
                      usage: parsed.response?.usage,
                      responseId: currentResponseId,
                      reasoningTokens: parsed.response?.usage?.reasoning_tokens,
                      content: assistantContent.trim()
                    })}\n\n`));
                  }
                } catch (parseError) {
                  console.error('Error parsing Responses API data:', parseError);
                }
              }
            }
          }

          // Safety finalization: persist content even if no final event was received
          if (!sawFinalEvent && assistantContent.trim()) {
            console.log('Safety finalization: persisting content without final event');
            await persistAssistantMessage();
            
            controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({
              type: 'response_complete',
              responseId: currentResponseId,
              content: assistantContent.trim(),
              safetyFinalization: true
            })}\n\n`));
          }

        } catch (error) {
          console.error('Streaming error:', error);
          controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({
            type: 'stream_error',
            error: error instanceof Error ? error.message : 'Unknown error'
          })}\n\n`));
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('Error in pediatric-ai-chat function:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function handleBackgroundTask(input: string, taskType: string, patientContext: any, openaiApiKey: string) {
  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openaiApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt: {
        id: "pmpt_68d880ea8b0c8194897a498de096ee0f0859affba435451f"
      },
      input: [
        {
          role: "system",
          content: [
            {
              type: "input_text",
              text: `Task Type: ${taskType}. Patient Context: ${JSON.stringify(patientContext || {})}`
            }
          ]
        },
        {
          role: "user", 
          content: [
            {
              type: "input_text",
              text: input
            }
          ]
        }
      ],
      store: true,
      background: true,
      max_output_tokens: 8000
    }),
  });

  const result = await response.json();
  return result.response?.output_text || result.choices?.[0]?.message?.content || 'Analysis completed';
}

async function handleFunctionCall(functionCall: any) {
  const { name, arguments: args } = functionCall;
  
  try {
    const parsedArgs = typeof args === 'string' ? JSON.parse(args) : args;
    
    switch (name) {
      case 'calculate_pediatric_dosage':
        return await calculatePediatricDosage(parsedArgs);
      case 'analyze_growth_chart':
        return await analyzeGrowthChart(parsedArgs);
      default:
        return { error: `Unknown function: ${name}` };
    }
  } catch (error) {
    console.error(`Error in function ${name}:`, error);
    return { error: `Function execution failed: ${error instanceof Error ? error.message : 'Unknown error'}` };
  }
}

async function calculatePediatricDosage(params: any) {
  const { medication, weight_kg, age_years, indication, route = 'oral' } = params;
  
  const medications = {
    amoxicillin: {
      oral: { dose_mg_kg_day: 40, max_dose_mg_day: 3000, frequency: 'BID', duration: '7-10 days' }
    },
    acetaminophen: {
      oral: { dose_mg_kg_dose: 15, max_dose_mg_dose: 1000, frequency: 'q6h PRN', max_daily: 4000 }
    },
    ibuprofen: {
      oral: { dose_mg_kg_dose: 10, max_dose_mg_dose: 800, frequency: 'q6-8h PRN', max_daily: 2400 }
    }
  };

  const med = medications[medication.toLowerCase() as keyof typeof medications];
  if (!med || !med[route as keyof typeof med]) {
    return {
      error: `Dosing information not available for ${medication} via ${route} route`,
      recommendation: 'Please consult drug reference or pharmacist for accurate dosing'
    };
  }

  const dosing = med[route as keyof typeof med];
  let calculatedDose = 0;
  const warnings = [];

  if ('dose_mg_kg_day' in dosing) {
    calculatedDose = weight_kg * dosing.dose_mg_kg_day;
    if (dosing.max_dose_mg_day && calculatedDose > dosing.max_dose_mg_day) {
      calculatedDose = dosing.max_dose_mg_day;
      warnings.push(`Dose capped at maximum daily dose of ${dosing.max_dose_mg_day}mg`);
    }
  } else if ('dose_mg_kg_dose' in dosing) {
    calculatedDose = weight_kg * dosing.dose_mg_kg_dose;
    if (dosing.max_dose_mg_dose && calculatedDose > dosing.max_dose_mg_dose) {
      calculatedDose = dosing.max_dose_mg_dose;
      warnings.push(`Single dose capped at ${dosing.max_dose_mg_dose}mg`);
    }
  }

  if (age_years < 2 && medication.toLowerCase() === 'ibuprofen') {
    warnings.push('Ibuprofen not recommended for children under 6 months');
  }

  return {
    medication,
    patient: { weight_kg, age_years, indication },
    calculated_dose_mg: Math.round(calculatedDose * 100) / 100,
    frequency: dosing.frequency,
    route,
    duration: 'duration' in dosing ? dosing.duration : 'As directed',
    warnings,
    calculation_notes: `${weight_kg}kg × ${'dose_mg_kg_day' in dosing ? dosing.dose_mg_kg_day : dosing.dose_mg_kg_dose}mg/kg = ${Math.round(calculatedDose * 100) / 100}mg`,
    safety_note: 'Always verify dosing with current references and consider patient-specific factors'
  };
}

async function analyzeGrowthChart(params: any) {
  const { height_cm, weight_kg, age_months, sex } = params;
  
  const bmi = weight_kg / Math.pow(height_cm / 100, 2);
  
  const estimatePercentile = (value: number, mean: number, sd: number) => {
    const zscore = (value - mean) / sd;
    if (zscore < -2) return '<3rd';
    if (zscore < -1) return '3rd-15th';
    if (zscore < 0) return '15th-50th';
    if (zscore < 1) return '50th-85th';
    if (zscore < 2) return '85th-97th';
    return '>97th';
  };

  const heightMean = sex === 'male' ? 70 + (age_months * 0.6) : 68 + (age_months * 0.55);
  const weightMean = sex === 'male' ? 3.5 + (age_months * 0.25) : 3.3 + (age_months * 0.23);
  const bmiMean = 16 + (age_months * 0.01);

  return {
    patient: { age_months, sex, height_cm, weight_kg },
    bmi: Math.round(bmi * 10) / 10,
    percentiles: {
      height: estimatePercentile(height_cm, heightMean, 5),
      weight: estimatePercentile(weight_kg, weightMean, 2),
      bmi: estimatePercentile(bmi, bmiMean, 1.5)
    },
    assessment: bmi < 16 ? 'Underweight' : bmi > 19 ? 'Overweight risk' : 'Normal range',
    recommendations: [
      'Plot on official WHO/CDC growth charts for accurate percentiles',
      'Consider growth velocity and family history',
      'Monitor trends rather than single measurements'
    ],
    note: 'This is a simplified analysis. Use official growth charts for clinical decisions.'
  };
}