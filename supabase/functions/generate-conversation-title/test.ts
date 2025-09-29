import { assertEquals, assertExists } from "https://deno.land/std@0.168.0/testing/asserts.ts";

// Mock data for different OpenAI response formats
const mockResponses = {
  // Format 1: Output array with content structure (most common)
  outputArrayFormat: {
    id: "resp_test123",
    status: "completed",
    output: [
      {
        content: [
          {
            type: "output_text",
            text: "Pediatric dosage calculation question"
          }
        ]
      }
    ]
  },
  
  // Format 2: Direct text field as string
  directTextFormat: {
    id: "resp_test456",
    status: "completed",
    text: "Growth chart analysis"
  },
  
  // Format 3: Output as direct string
  directOutputFormat: {
    id: "resp_test789",
    status: "completed",
    output: "Drug interaction check"
  },
  
  // Format 4: Multiple content items
  multipleContentFormat: {
    id: "resp_test101112",
    status: "completed",
    output: [
      {
        content: [
          {
            type: "output_text",
            text: "Complex medical"
          },
          {
            type: "output_text", 
            text: "consultation summary"
          }
        ]
      }
    ]
  },
  
  // Format 5: Long text that needs truncation
  longTextFormat: {
    id: "resp_test131415",
    status: "completed",
    output: [
      {
        content: [
          {
            type: "output_text",
            text: "This is a very long medical consultation summary that exceeds four words and should be truncated"
          }
        ]
      }
    ]
  },
  
  // Format 6: Empty or invalid response
  emptyFormat: {
    id: "resp_test161718",
    status: "completed",
    output: []
  }
};

// Extract the title generation logic for testing
function extractTitleFromResponse(responseData: any): string {
  let generatedText = '';
  
  // 1) First try responseData.text if it's a string
  if (typeof responseData.text === 'string' && responseData.text.trim()) {
    generatedText = responseData.text.trim();
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
  }
  
  // 3) Fallback: direct string output
  if (!generatedText && typeof responseData.output === 'string') {
    generatedText = responseData.output.trim();
  }
  
  if (generatedText) {
    // Clean and sanitize the text
    const cleaned = generatedText.replace(/[\r\n]+/g, ' ').replace(/\s+/g, ' ').trim();
    const words = cleaned.split(' ').filter((word: string) => word.length > 0);
    return words.slice(0, 4).join(' ');
  } else {
    return 'New Conversation';
  }
}

// Unit Tests
Deno.test("Title extraction - Output array format", () => {
  const title = extractTitleFromResponse(mockResponses.outputArrayFormat);
  assertEquals(title, "Pediatric dosage calculation question");
});

Deno.test("Title extraction - Direct text format", () => {
  const title = extractTitleFromResponse(mockResponses.directTextFormat);
  assertEquals(title, "Growth chart analysis");
});

Deno.test("Title extraction - Direct output format", () => {
  const title = extractTitleFromResponse(mockResponses.directOutputFormat);
  assertEquals(title, "Drug interaction check");
});

Deno.test("Title extraction - Multiple content items", () => {
  const title = extractTitleFromResponse(mockResponses.multipleContentFormat);
  assertEquals(title, "Complex medical consultation summary");
});

Deno.test("Title extraction - Long text truncation", () => {
  const title = extractTitleFromResponse(mockResponses.longTextFormat);
  assertEquals(title, "This is a very");
});

Deno.test("Title extraction - Empty response fallback", () => {
  const title = extractTitleFromResponse(mockResponses.emptyFormat);
  assertEquals(title, "New Conversation");
});

Deno.test("Title extraction - Undefined response fallback", () => {
  const title = extractTitleFromResponse({});
  assertEquals(title, "New Conversation");
});

// Edge case tests
Deno.test("Title extraction - Special characters and whitespace", () => {
  const response = {
    status: "completed",
    output: [
      {
        content: [
          {
            type: "output_text",
            text: "  \n  Medical\r\n\t  consultation   notes  \n  "
          }
        ]
      }
    ]
  };
  const title = extractTitleFromResponse(response);
  assertEquals(title, "Medical consultation notes");
});

Deno.test("Title extraction - Single word", () => {
  const response = {
    status: "completed",
    text: "Pediatrics"
  };
  const title = extractTitleFromResponse(response);
  assertEquals(title, "Pediatrics");
});

Deno.test("Title extraction - Exactly four words", () => {
  const response = {
    status: "completed",
    text: "Exactly four word title"
  };
  const title = extractTitleFromResponse(response);
  assertEquals(title, "Exactly four word title");
});