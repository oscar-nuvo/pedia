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
        console.log('Response completed, extracting title from output structure');
        
        let generatedText = '';
        
        // 1) First try responseData.text if it's a string
        if (typeof responseData.text === 'string' && responseData.text.trim()) {
          generatedText = responseData.text.trim();
          console.log('Extracted from responseData.text (string):', generatedText);
        }
        
        // 2) Otherwise parse the output array structure
        if (!generatedText && Array.isArray(responseData.output)) {
          const parts: string[] = [];
          for (const item of responseData.output) {
            const content = item?.content;
            if (Array.isArray(content)) {
              for (const c of content) {
                if (c && c.type === 'output_text' && typeof c.text === 'string') {
                  parts.push(c.text);
                } else if (c && typeof c.text === 'string') {
                  parts.push(c.text);
                } else if (typeof c === 'string') {
                  parts.push(c);
                }
              }
            }
          }
          generatedText = parts.join(' ').trim();
          console.log('Extracted from output[].content[].text:', generatedText);
        }
        
        // 3) Fallback: direct string output
        if (!generatedText && typeof responseData.output === 'string') {
          generatedText = responseData.output.trim();
          console.log('Extracted from responseData.output (string):', generatedText);
        }
        
        if (!generatedText) {
          console.log('No generatedText found, available keys:', Object.keys(responseData));
        }
        
        if (generatedText) {
          // Sanitize the title to ensure it's max 4 words
          const words = generatedText.split(' ').filter((word: string) => word.length > 0);
          title = words.slice(0, 4).join(' ');
          console.log(`Generated title: "${title}"`);
        } else {
          console.log('No generatedText found, using fallback title');
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