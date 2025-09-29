import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.58.0";

const openaiApiKey = Deno.env.get('PediaAIKey');
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

const supabase = createClient(supabaseUrl!, supabaseServiceKey!);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting conversation title generation');
    
    const { conversationId, userMessage } = await req.json();
    
    if (!conversationId || !userMessage) {
      console.error('Missing required parameters:', { conversationId, userMessage });
      return new Response(JSON.stringify({ error: 'Missing conversationId or userMessage' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!openaiApiKey) {
      console.error('OpenAI API key not found');
      return new Response(JSON.stringify({ error: 'OpenAI API key not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Generating title for conversation: ${conversationId}`);

    // Step 1: Create a response with OpenAI Responses API
    const createResponse = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5-nano',
        input: `Write a 4 word summary of the following text: ${userMessage}`
      }),
    });

    if (!createResponse.ok) {
      const errorText = await createResponse.text();
      console.error('OpenAI create response error:', errorText);
      return new Response(JSON.stringify({ error: 'Failed to create OpenAI response' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const createData = await createResponse.json();
    const responseId = createData.id;
    
    console.log(`Created OpenAI response with ID: ${responseId}`);

    // Step 2: Poll for the response completion
    let title = 'New Conversation'; // Fallback
    let pollAttempts = 0;
    const maxPollAttempts = 30; // 30 seconds max
    
    while (pollAttempts < maxPollAttempts) {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
      pollAttempts++;
      
      const getResponse = await fetch(`https://api.openai.com/v1/responses/${responseId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${openaiApiKey}`,
        },
      });

      if (!getResponse.ok) {
        console.error(`Poll attempt ${pollAttempts} failed:`, await getResponse.text());
        continue;
      }

      const responseData = await getResponse.json();
      console.log(`Poll attempt ${pollAttempts}, status:`, responseData.status);

      if (responseData.status === 'completed') {
        // Debug: Log the full response structure to understand the format
        console.log('Full responseData:', JSON.stringify(responseData, null, 2));
        
        // Extract text from the response output structure
        let generatedText = '';
        
        // Check different possible response formats
        if (responseData.output) {
          console.log('responseData.output exists:', typeof responseData.output);
          console.log('responseData.output content:', JSON.stringify(responseData.output, null, 2));
          
          if (Array.isArray(responseData.output) && responseData.output.length > 0) {
            const firstOutput = responseData.output[0];
            console.log('firstOutput:', JSON.stringify(firstOutput, null, 2));
            
            if (firstOutput.content && firstOutput.content.length > 0) {
              const firstContent = firstOutput.content[0];
              console.log('firstContent:', JSON.stringify(firstContent, null, 2));
              
              if (firstContent.type === 'output_text' && firstContent.text) {
                generatedText = firstContent.text.trim();
                console.log('Extracted from output_text:', generatedText);
              }
            }
          } else if (typeof responseData.output === 'string') {
            // Maybe output is directly a string
            generatedText = responseData.output.trim();
            console.log('Extracted from direct string:', generatedText);
          }
        }
        
        // Check for other possible response fields
        if (!generatedText && responseData.response) {
          console.log('Checking responseData.response:', JSON.stringify(responseData.response, null, 2));
          if (typeof responseData.response === 'string') {
            generatedText = responseData.response.trim();
            console.log('Extracted from response field:', generatedText);
          }
        }
        
        if (!generatedText && responseData.content) {
          console.log('Checking responseData.content:', JSON.stringify(responseData.content, null, 2));
          if (typeof responseData.content === 'string') {
            generatedText = responseData.content.trim();
            console.log('Extracted from content field:', generatedText);
          }
        }
        
        if (generatedText) {
          // Sanitize the title to ensure it's max 4 words
          const words = generatedText.split(' ').filter((word: string) => word.length > 0);
          title = words.slice(0, 4).join(' ');
          console.log(`Generated title: "${title}"`);
        } else {
          console.log('No generatedText found, using fallback title');
          console.log('Available responseData keys:', Object.keys(responseData));
        }
        break;
      } else if (responseData.status === 'failed') {
        console.error('OpenAI response failed:', responseData);
        break;
      }
    }

    // Step 3: Update the conversation with the generated title
    const { error: updateError } = await supabase
      .from('conversations')
      .update({ title })
      .eq('id', conversationId);

    if (updateError) {
      console.error('Error updating conversation title:', updateError);
      return new Response(JSON.stringify({ error: 'Failed to update conversation title' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log(`Successfully updated conversation ${conversationId} with title: "${title}"`);

    return new Response(JSON.stringify({ 
      success: true, 
      title,
      conversationId 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-conversation-title function:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});