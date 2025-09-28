import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, conversationId, fileIds = [] } = await req.json();
    
    const openaiApiKey = Deno.env.get('PediaAIKey');
    if (!openaiApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user from JWT
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    console.log('Processing message for user:', user.id);

    // Save user message to database
    const { data: userMessage, error: userMsgError } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        role: 'user',
        content: message,
        metadata: { fileIds }
      })
      .select()
      .single();

    if (userMsgError) {
      console.error('Error saving user message:', userMsgError);
      throw userMsgError;
    }

    console.log('Saved user message:', userMessage.id);

    // Prepare OpenAI request with specific prompt - using Responses API format
    const tools = [
      {
        "name": "calculate_pediatric_dosage",
        "type": "function",
        "description": "Calculate medication dosage for pediatric patients based on weight, age, and medication type",
        "parameters": {
          "type": "object",
          "properties": {
            "medication": { "type": "string", "description": "Name of the medication" },
            "weight_kg": { "type": "number", "description": "Patient weight in kilograms" },
            "age_months": { "type": "number", "description": "Patient age in months" },
            "indication": { "type": "string", "description": "Medical indication for the medication" }
          },
          "required": ["medication", "weight_kg"]
        }
      },
      {
        "name": "analyze_growth_chart",
        "type": "function", 
        "description": "Analyze pediatric growth parameters and provide percentile information",
        "parameters": {
          "type": "object",
          "properties": {
            "height_cm": { "type": "number", "description": "Height in centimeters" },
            "weight_kg": { "type": "number", "description": "Weight in kilograms" },
            "age_months": { "type": "number", "description": "Age in months" },
            "sex": { "type": "string", "enum": ["male", "female"], "description": "Patient sex" }
          },
          "required": ["height_cm", "weight_kg", "age_months", "sex"]
        }
      }
    ];

    // Note: File search would be configured differently in production
    // For now, we'll handle file context through regular message content

    const openaiRequest = {
      model: "gpt-5-2025-08-07",
      prompt: {
        id: "pmpt_68d880ea8b0c8194897a498de096ee0f0859affba435451f",
        version: "2"
      },
      input: message,
      stream: true,
      tools: tools,
      max_output_tokens: 1000,
      store: true
    };

    console.log('Making OpenAI request with prompt ID pmpt_68d880ea8b0c8194897a498de096ee0f0859affba435451f');

    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(openaiRequest),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status} ${errorText}`);
    }

    // Create a readable stream for the response
    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body!.getReader();
        let assistantContent = '';

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = new TextDecoder().decode(value);
            const lines = chunk.split('\n');

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const data = line.slice(6);
                if (data === '[DONE]') continue;

                try {
                  const parsed = JSON.parse(data);
                  
                  // Handle different event types
                  if (parsed.type === 'response.output_text.delta') {
                    assistantContent += parsed.delta;
                    controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify(parsed)}\n\n`));
                  } else if (parsed.type === 'response.function_call.start') {
                    controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify(parsed)}\n\n`));
                  } else if (parsed.type === 'response.function_call.arguments.delta') {
                    controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify(parsed)}\n\n`));
                  } else if (parsed.type === 'response.function_call.done') {
                    // Execute the function call
                    const result = await handleFunctionCall(parsed);
                    controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({
                      type: 'function_result',
                      function_name: parsed.function.name,
                      result
                    })}\n\n`));
                  } else if (parsed.type === 'response.done') {
                    // Save assistant message to database
                    if (assistantContent.trim()) {
                      const { error: assistantMsgError } = await supabase
                        .from('messages')
                        .insert({
                          conversation_id: conversationId,
                          role: 'assistant',
                          content: assistantContent,
                          metadata: { openai_response: parsed }
                        });

                      if (assistantMsgError) {
                        console.error('Error saving assistant message:', assistantMsgError);
                      } else {
                        console.log('Saved assistant message to database');
                      }
                    }
                    
                    controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify(parsed)}\n\n`));
                  } else {
                    controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify(parsed)}\n\n`));
                  }
                } catch (parseError) {
                  console.error('Error parsing SSE data:', parseError);
                }
              }
            }
          }
        } catch (error) {
          console.error('Streaming error:', error);
          controller.error(error);
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
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function handleFunctionCall(functionCall: any) {
  const { name, arguments: args } = functionCall.function;
  
  try {
    const parsedArgs = JSON.parse(args);
    
    switch (name) {
      case 'calculate_pediatric_dosage':
        return calculatePediatricDosage(parsedArgs);
      case 'analyze_growth_chart':
        return analyzeGrowthChart(parsedArgs);
      default:
        return { error: `Unknown function: ${name}` };
    }
  } catch (error) {
    console.error(`Error executing function ${name}:`, error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return { error: `Function execution failed: ${errorMessage}` };
  }
}

function calculatePediatricDosage(params: any) {
  const { medication, weight_kg, age_months, indication } = params;
  
  // Simplified dosage calculation - in reality this would use comprehensive drug database
  const dosages: { [key: string]: { mg_per_kg: number, max_dose?: number, frequency: string } } = {
    'amoxicillin': { mg_per_kg: 20, max_dose: 875, frequency: 'twice daily' },
    'ibuprofen': { mg_per_kg: 10, max_dose: 600, frequency: 'every 6-8 hours' },
    'acetaminophen': { mg_per_kg: 15, max_dose: 1000, frequency: 'every 4-6 hours' },
    'azithromycin': { mg_per_kg: 10, max_dose: 500, frequency: 'once daily' }
  };

  const drugInfo = dosages[medication.toLowerCase()];
  if (!drugInfo) {
    return {
      error: `Dosage information not available for ${medication}. Please consult pediatric drug reference.`,
      recommendation: 'Verify with current pediatric prescribing guidelines'
    };
  }

  const calculatedDose = weight_kg * drugInfo.mg_per_kg;
  const finalDose = drugInfo.max_dose ? Math.min(calculatedDose, drugInfo.max_dose) : calculatedDose;

  return {
    medication,
    weight_kg,
    age_months,
    calculated_dose_mg: finalDose,
    frequency: drugInfo.frequency,
    calculation: `${weight_kg} kg × ${drugInfo.mg_per_kg} mg/kg = ${calculatedDose} mg`,
    final_dose: drugInfo.max_dose && calculatedDose > drugInfo.max_dose 
      ? `Capped at maximum dose of ${drugInfo.max_dose} mg`
      : `${finalDose} mg`,
    warning: age_months < 6 ? 'Caution: Dosing in infants <6 months requires special consideration' : null
  };
}

function analyzeGrowthChart(params: any) {
  const { height_cm, weight_kg, age_months, sex } = params;
  
  // Simplified growth analysis - in reality this would use WHO/CDC growth charts
  const bmi = weight_kg / Math.pow(height_cm / 100, 2);
  
  // Rough percentile estimates (would need actual growth chart data)
  let heightPercentile = 50; // Default to 50th percentile
  let weightPercentile = 50;
  let bmiPercentile = 50;

  // Very simplified logic for demonstration
  if (height_cm < 85) heightPercentile = 25;
  if (height_cm > 120) heightPercentile = 75;
  
  if (weight_kg < 12) weightPercentile = 25;
  if (weight_kg > 25) weightPercentile = 75;

  return {
    height_cm,
    weight_kg,
    age_months,
    sex,
    bmi: Math.round(bmi * 10) / 10,
    height_percentile: heightPercentile,
    weight_percentile: weightPercentile,
    bmi_percentile: bmiPercentile,
    assessment: heightPercentile < 5 || weightPercentile < 5 
      ? 'Below 5th percentile - consider evaluation for growth concerns'
      : heightPercentile > 95 || weightPercentile > 95
      ? 'Above 95th percentile - monitor growth trajectory'
      : 'Growth parameters within normal range',
    recommendation: 'Plot on age and sex-appropriate growth charts for accurate percentiles'
  };
}