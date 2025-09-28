import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { Bot, MessageSquare, Lightbulb, Search, Brain, Stethoscope, Plus, Send, StopCircle } from "lucide-react";
import { useAIChat, Message } from "@/hooks/useAIChat";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";

const AICopilot = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [inputMessage, setInputMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    conversations,
    messages,
    currentConversationId,
    isStreaming,
    streamingMessage,
    conversationsLoading,
    messagesLoading,
    sendMessage,
    isSendingMessage,
    startNewConversation,
    selectConversation,
    stopStreaming,
  } = useAIChat();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingMessage]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isSendingMessage) return;
    
    const message = inputMessage.trim();
    setInputMessage("");
    
    try {
      await sendMessage({ message });
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const renderMessage = (message: Message) => {
    const isUser = message.role === "user";
    return (
      <div key={message.id} className={`flex items-start space-x-3 ${isUser ? "flex-row-reverse space-x-reverse" : ""}`}>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
          isUser ? "bg-brand-yellow text-black" : "bg-primary text-white"
        }`}>
          {isUser ? "U" : <Bot className="w-4 h-4" />}
        </div>
        <div className={`p-3 rounded-xl max-w-md ${
          isUser ? "bg-brand-yellow text-black" : "bg-white text-neutral-800"
        }`}>
          <p className="whitespace-pre-wrap">{message.content}</p>
          <p className="text-xs opacity-70 mt-1">
            {format(new Date(message.created_at), 'HH:mm')}
          </p>
        </div>
      </div>
    );
  };

  const exampleQueries = [
    "What's the amoxicillin dose for a 15kg child with otitis media?",
    "Normal heart rate range for a 3-year-old?",
    "When should I refer for growth concerns?"
  ];

  if (!user) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <p className="text-center text-neutral-600">Please log in to access the AI Assistant.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <div className="bg-white border-b border-neutral-200 px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-neutral-900">Pediatric AI Co-Pilot</h1>
          <p className="text-neutral-600 mt-1">Your intelligent assistant for clinical decision support and medical queries</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Conversation History Sidebar */}
          <div className="lg:col-span-1">
            <Card className="h-[600px] flex flex-col">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Conversations</CardTitle>
                  <Button size="sm" onClick={startNewConversation} className="h-8 w-8 p-0">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="flex-1 p-0">
                <ScrollArea className="h-full px-4">
                  {conversationsLoading ? (
                    <div className="text-center text-neutral-500 py-4">Loading...</div>
                  ) : conversations.length === 0 ? (
                    <div className="text-center text-neutral-500 py-4">No conversations yet</div>
                  ) : (
                    <div className="space-y-2">
                      {conversations.map((conversation) => (
                        <button
                          key={conversation.id}
                          onClick={() => selectConversation(conversation.id)}
                          className={`w-full p-3 text-left rounded-lg transition-colors ${
                            currentConversationId === conversation.id
                              ? "bg-brand-yellow text-black"
                              : "bg-neutral-100 hover:bg-neutral-200 text-neutral-800"
                          }`}
                        >
                          <p className="font-medium truncate">{conversation.title}</p>
                          <p className="text-xs opacity-70">
                            {format(new Date(conversation.updated_at), 'MMM d, HH:mm')}
                          </p>
                        </button>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* AI Chat Interface */}
          <div className="lg:col-span-2">
            <Card className="h-[600px] flex flex-col">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bot className="w-5 h-5 mr-2 text-primary" />
                  AI Assistant
                  {isStreaming && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={stopStreaming}
                      className="ml-auto"
                    >
                      <StopCircle className="w-4 h-4 mr-1" />
                      Stop
                    </Button>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <ScrollArea className="flex-1 bg-neutral-50 rounded-xl p-4 mb-4">
                  <div className="space-y-4">
                    {/* Welcome message */}
                    {messages.length === 0 && !streamingMessage && (
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                          <Bot className="w-4 h-4 text-white" />
                        </div>
                        <div className="bg-white p-3 rounded-xl max-w-md">
                          <p className="text-neutral-800">
                            Hello! I'm your pediatric AI assistant. I can help with clinical questions, 
                            drug dosing, guidelines, and patient-specific insights. What can I assist you with today?
                          </p>
                        </div>
                      </div>
                    )}
                    
                    {/* Messages */}
                    {messages.map(renderMessage)}
                    
                    {/* Streaming message */}
                    {streamingMessage && (
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                          <Bot className="w-4 h-4 text-white animate-pulse" />
                        </div>
                        <div className="bg-white p-3 rounded-xl max-w-md">
                          <p className="text-neutral-800 whitespace-pre-wrap">{streamingMessage}</p>
                          <div className="w-2 h-4 bg-primary rounded animate-pulse inline-block ml-1"></div>
                        </div>
                      </div>
                    )}
                    
                    <div ref={messagesEndRef} />
                  </div>
                </ScrollArea>
                
                {/* Input area */}
                <div className="flex space-x-2">
                  <Input
                    ref={inputRef}
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask about dosing, guidelines, patient care..."
                    disabled={isSendingMessage || isStreaming}
                    className="flex-1"
                  />
                  <Button 
                    size="sm" 
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim() || isSendingMessage || isStreaming}
                    className="rounded-full px-4"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
                
                {/* Example queries */}
                {messages.length === 0 && !streamingMessage && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {exampleQueries.map((query, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        onClick={() => setInputMessage(query)}
                        className="text-xs"
                      >
                        {query}
                      </Button>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar - Quick Features */}
          <div className="lg:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Features</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => setInputMessage("Calculate dosage for ")}
                  >
                    <Brain className="w-4 h-4 mr-2" />
                    Clinical Decision Support
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => setInputMessage("Check drug interactions for ")}
                  >
                    <Search className="w-4 h-4 mr-2" />
                    Drug Interaction Checker
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => setInputMessage("Differential diagnosis for ")}
                  >
                    <Stethoscope className="w-4 h-4 mr-2" />
                    Differential Diagnosis
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => setInputMessage("Screening recommendations for ")}
                  >
                    <Lightbulb className="w-4 h-4 mr-2" />
                    Screening Reminders
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AICopilot;