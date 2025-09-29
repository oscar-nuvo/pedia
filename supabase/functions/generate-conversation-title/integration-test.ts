import { assertEquals, assertExists } from "https://deno.land/std@0.168.0/testing/asserts.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.58.0";

// Integration test configuration
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const FUNCTION_URL = `${SUPABASE_URL}/functions/v1/generate-conversation-title`;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Mock OpenAI API server for testing
let mockServer: Deno.HttpServer | null = null;
let mockServerPort = 8888;

async function startMockOpenAIServer() {
  const handler = async (req: Request): Promise<Response> => {
    const url = new URL(req.url);
    
    if (req.method === 'POST' && url.pathname === '/v1/responses') {
      // Create response
      return new Response(JSON.stringify({
        id: "resp_mock_test_123",
        object: "response",
        created_at: Date.now(),
        status: "in_progress"
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    } else if (req.method === 'GET' && url.pathname.startsWith('/v1/responses/')) {
      // Get response - simulate completed response
      return new Response(JSON.stringify({
        id: "resp_mock_test_123",
        status: "completed",
        output: [
          {
            content: [
              {
                type: "output_text",
                text: "Test conversation title"
              }
            ]
          }
        ]
      }), {
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    return new Response('Not Found', { status: 404 });
  };

  mockServer = Deno.serve({ port: mockServerPort }, handler);
  
  // Wait a bit for server to start
  await new Promise(resolve => setTimeout(resolve, 100));
}

async function stopMockOpenAIServer() {
  if (mockServer) {
    await mockServer.shutdown();
    mockServer = null;
  }
}

// Test data setup
async function createTestConversation(userId: string) {
  const { data, error } = await supabase
    .from('conversations')
    .insert({
      user_id: userId,
      title: null
    })
    .select()
    .single();
    
  if (error) throw error;
  return data;
}

async function createTestUser() {
  const { data, error } = await supabase.auth.admin.createUser({
    email: `test-${Date.now()}@example.com`,
    password: 'test-password-123',
    email_confirm: true
  });
  
  if (error) throw error;
  return data.user;
}

async function cleanupTestData(userId: string, conversationId: string) {
  // Delete conversation
  await supabase
    .from('conversations')
    .delete()
    .eq('id', conversationId);
    
  // Delete user
  await supabase.auth.admin.deleteUser(userId);
}

// Integration Tests
Deno.test({
  name: "Integration - Title generation end-to-end flow",
  async fn() {
    // Skip if no service key available
    if (!SUPABASE_SERVICE_KEY) {
      console.log("Skipping integration test - no service key");
      return;
    }

    await startMockOpenAIServer();
    
    try {
      // Create test user and conversation
      const user = await createTestUser();
      const conversation = await createTestConversation(user.id);
      
      // Mock the OpenAI API key environment variable
      const originalOpenAIKey = Deno.env.get('PediaAIKey');
      Deno.env.set('PediaAIKey', 'mock-key-for-testing');
      
      try {
        // Call the title generation function
        const response = await fetch(FUNCTION_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`
          },
          body: JSON.stringify({
            conversationId: conversation.id,
            userMessage: "What is the recommended dosage for pediatric patients?"
          })
        });
        
        assertExists(response);
        assertEquals(response.status, 200);
        
        const result = await response.json();
        assertEquals(result.success, true);
        assertEquals(result.conversationId, conversation.id);
        assertExists(result.title);
        
        // Verify the title was updated in the database
        const { data: updatedConversation } = await supabase
          .from('conversations')
          .select('title')
          .eq('id', conversation.id)
          .single();
          
        assertExists(updatedConversation);
        assertEquals(updatedConversation.title, result.title);
        
        // Cleanup
        await cleanupTestData(user.id, conversation.id);
        
      } finally {
        // Restore original API key
        if (originalOpenAIKey) {
          Deno.env.set('PediaAIKey', originalOpenAIKey);
        } else {
          Deno.env.delete('PediaAIKey');
        }
      }
    } finally {
      await stopMockOpenAIServer();
    }
  },
  sanitizeResources: false,
  sanitizeOps: false
});

Deno.test({
  name: "Integration - Missing conversation ID validation",
  async fn() {
    if (!SUPABASE_SERVICE_KEY) {
      console.log("Skipping integration test - no service key");
      return;
    }

    const response = await fetch(FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`
      },
      body: JSON.stringify({
        userMessage: "Test message"
        // Missing conversationId
      })
    });
    
    assertEquals(response.status, 400);
    
    const result = await response.json();
    assertExists(result.error);
    assertEquals(result.error, "Missing conversationId or userMessage");
  }
});

Deno.test({
  name: "Integration - Missing user message validation", 
  async fn() {
    if (!SUPABASE_SERVICE_KEY) {
      console.log("Skipping integration test - no service key");
      return;
    }

    const response = await fetch(FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`
      },
      body: JSON.stringify({
        conversationId: "test-id"
        // Missing userMessage
      })
    });
    
    assertEquals(response.status, 400);
    
    const result = await response.json();
    assertExists(result.error);
    assertEquals(result.error, "Missing conversationId or userMessage");
  }
});

Deno.test({
  name: "Integration - CORS preflight request",
  async fn() {
    if (!SUPABASE_SERVICE_KEY) {
      console.log("Skipping integration test - no service key");
      return;
    }

    const response = await fetch(FUNCTION_URL, {
      method: 'OPTIONS',
      headers: {
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`
      }
    });
    
    assertEquals(response.status, 200);
    assertEquals(response.headers.get('Access-Control-Allow-Origin'), '*');
    assertExists(response.headers.get('Access-Control-Allow-Headers'));
  }
});