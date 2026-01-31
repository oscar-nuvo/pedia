// Shared types for the interactive demo component

export type DemoState =
  | "idle"           // Waiting for question
  | "awaiting_email" // Question submitted, asking for email
  | "validating"     // Validating email
  | "thinking"       // Waiting for AI to start responding
  | "streaming"      // AI response streaming
  | "complete"       // Response done
  | "exhausted";     // 3 queries used

export interface Message {
  type: "system" | "user" | "assistant" | "error";
  content: string;
}

export type DemoVariant = "terminal" | "chat";
