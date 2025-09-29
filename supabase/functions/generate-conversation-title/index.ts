import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

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
    const { conversationId, userMessage } = await req.json();
    
    if (!conversationId || !userMessage) {
      return new Response(
        JSON.stringify({ error: 'Missing conversationId or userMessage' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Generating conversation title...', { conversationId, messageLength: userMessage.length });
    
    const openaiApiKey = Deno.env.get('PediaAIKey');
    if (!openaiApiKey) {
      console.error('OpenAI API key not found');
      return new Response(
        JSON.stringify({ error: 'API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Create a response for title generation
    const titleResponse = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'Generate a very short, exactly 4-word title that summarizes the main topic of this conversation. Return only the title, no quotes or extra text.'
          },
          {
            role: 'user',
            content: `Create a 4-word title for this message: "${userMessage.substring(0, 200)}"`
          }
        ],
        max_tokens: 20,
        temperature: 0.3,
        store: true
      }),
    });

    if (!titleResponse.ok) {
      const errorText = await titleResponse.text();
      console.error('Failed to create title response:', errorText);
      return new Response(
        JSON.stringify({ error: 'Failed to generate title' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const titleData = await titleResponse.json();
    const responseId = titleData.id;
    console.log('Title response created:', { responseId });

    // Poll for completion with timeout
    const maxAttempts = 30; // 30 seconds timeout
    let attempts = 0;
    let titleResult = null;

    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second
      attempts++;

      try {
        const getResponse = await fetch(`https://api.openai.com/v1/responses/${responseId}`, {
          headers: {
            'Authorization': `Bearer ${openaiApiKey}`,
          },
        });

        if (getResponse.ok) {
          const data = await getResponse.json();
          console.log(`Title polling attempt ${attempts}:`, { status: data.status });
          
          if (data.status === 'completed' && data.output && data.output.length > 0) {
            const output = data.output[0];
            if (output.content && output.content.length > 0) {
              titleResult = output.content[0].text;
              console.log('Title generation completed:', { title: titleResult });
              break;
            }
          } else if (data.status === 'failed') {
            console.error('Title generation failed:', data);
            break;
          }
        } else {
          console.error(`Failed to get title response (attempt ${attempts}):`, await getResponse.text());
        }
      } catch (error) {
        console.error(`Error polling title (attempt ${attempts}):`, error);
      }
    }

    // Use fallback if no title generated
    let finalTitle = 'New Conversation';
    
    if (titleResult) {
      // Sanitize and ensure 4 words max
      const sanitizedTitle = titleResult
        .replace(/[^\w\s]/g, '') // Remove special characters
        .split(/\s+/) // Split by whitespace
        .filter((word: string) => word.length > 0) // Remove empty strings
        .slice(0, 4) // Take only first 4 words
        .join(' '); // Join with single spaces

      if (sanitizedTitle) {
        finalTitle = sanitizedTitle;
        console.log('Sanitized title:', finalTitle);
      } else {
        console.log('Title sanitization resulted in empty string, using fallback');
      }
    } else {
      console.log('Title generation timed out or failed, using fallback');
    }

    // Update conversation title in database
    const { error: updateError } = await supabase
      .from('conversations')
      .update({ 
        title: finalTitle,
        updated_at: new Date().toISOString()
      })
      .eq('id', conversationId);

    if (updateError) {
      console.error('Error updating conversation title:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to update title in database' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Conversation title updated successfully:', { conversationId, title: finalTitle });

    return new Response(
      JSON.stringify({ 
        success: true, 
        title: finalTitle,
        conversationId 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-conversation-title:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});