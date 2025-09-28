import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { Bot, Send, StopCircle, MessageSquare, Plus, Upload, Paperclip } from "lucide-react";
import { useAIChat, Message } from "@/hooks/useAIChat";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";
import { Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

const AICopilot = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [inputMessage, setInputMessage] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    setSelectedFiles([]);
    
    try {
      await sendMessage({ message });
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles(prev => [...prev, ...files]);
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const renderMessage = (message: Message) => {
    const isUser = message.role === "user";
    return (
      <div key={message.id} className={`group flex items-start gap-4 px-4 py-6 ${isUser ? "bg-neutral-50" : "bg-white"}`}>
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
          isUser ? "bg-brand-yellow text-black" : "bg-black text-white"
        }`}>
          {isUser ? "Y" : <Bot className="w-4 h-4" />}
        </div>
        <div className="flex-1 space-y-2">
          <div className="prose prose-neutral max-w-none">
            <p className="whitespace-pre-wrap text-neutral-800 leading-relaxed">{message.content}</p>
          </div>
          <div className="text-xs text-neutral-500">
            {format(new Date(message.created_at), 'MMM d, HH:mm')}
          </div>
        </div>
      </div>
    );
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <Bot className="w-12 h-12 text-neutral-400 mx-auto" />
          <div>
            <h2 className="text-xl font-semibold text-neutral-900">Please log in</h2>
            <p className="text-neutral-600">You need to be logged in to access the AI Assistant.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-white">
        {/* Conversations Sidebar */}
        <Sidebar className="border-r border-neutral-200">
          <SidebarHeader className="border-b border-neutral-200 p-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-neutral-900">Conversations</h2>
              <Button 
                size="sm" 
                variant="ghost"
                onClick={startNewConversation}
                className="h-8 w-8 p-0"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              {conversationsLoading ? (
                <div className="p-4 text-center text-neutral-500">Loading...</div>
              ) : conversations.length === 0 ? (
                <div className="p-4 text-center text-neutral-500">No conversations yet</div>
              ) : (
                conversations.map((conversation) => (
                  <SidebarMenuItem key={conversation.id}>
                    <SidebarMenuButton
                      onClick={() => selectConversation(conversation.id)}
                      isActive={currentConversationId === conversation.id}
                      className="w-full justify-start text-left"
                    >
                      <MessageSquare className="w-4 h-4 mr-2" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{conversation.title}</p>
                        <p className="text-xs text-neutral-500 truncate">
                          {format(new Date(conversation.updated_at), 'MMM d, HH:mm')}
                        </p>
                      </div>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))
              )}
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Chat Header */}
          <div className="border-b border-neutral-200 px-6 py-4 bg-white">
            <div className="flex items-center gap-3">
              <SidebarTrigger />
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5" />
                <h1 className="font-semibold text-neutral-900">Pediatric AI Assistant</h1>
              </div>
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
            </div>
          </div>

          {/* Messages Area */}
          <ScrollArea className="flex-1">
            <div className="max-w-4xl mx-auto">
              {/* Welcome message */}
              {messages.length === 0 && !streamingMessage && (
                <div className="px-4 py-12 text-center">
                  <Bot className="w-12 h-12 text-neutral-300 mx-auto mb-4" />
                  <h2 className="text-xl font-semibold text-neutral-900 mb-2">
                    Welcome to your Pediatric AI Assistant
                  </h2>
                  <p className="text-neutral-600 mb-8 max-w-md mx-auto">
                    I can help with clinical questions, drug dosing, guidelines, and patient-specific insights. 
                    What can I assist you with today?
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {[
                      "What's the amoxicillin dose for a 15kg child?",
                      "Normal heart rate range for a 3-year-old?",
                      "When should I refer for growth concerns?"
                    ].map((query, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        onClick={() => setInputMessage(query)}
                        className="text-sm"
                      >
                        {query}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Messages */}
              {messages.map(renderMessage)}
              
              {/* Streaming message */}
              {streamingMessage && (
                <div className="group flex items-start gap-4 px-4 py-6 bg-white">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-black text-white flex items-center justify-center">
                    <Bot className="w-4 h-4 animate-pulse" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="prose prose-neutral max-w-none">
                      <p className="whitespace-pre-wrap text-neutral-800 leading-relaxed">{streamingMessage}</p>
                      <div className="w-2 h-4 bg-black rounded animate-pulse inline-block ml-1"></div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Input Area */}
          <div className="border-t border-neutral-200 bg-white">
            <div className="max-w-4xl mx-auto p-4">
              {/* File attachments */}
              {selectedFiles.length > 0 && (
                <div className="mb-3 flex flex-wrap gap-2">
                  {selectedFiles.map((file, index) => (
                    <div key={index} className="flex items-center gap-2 bg-neutral-100 rounded-lg px-3 py-2 text-sm">
                      <Paperclip className="w-4 h-4" />
                      <span className="truncate max-w-32">{file.name}</span>
                      <button
                        onClick={() => removeFile(index)}
                        className="text-neutral-500 hover:text-neutral-700"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-end gap-3">
                <div className="flex-1 relative">
                  <Textarea
                    ref={textareaRef}
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask about dosing, guidelines, patient care..."
                    disabled={isSendingMessage || isStreaming}
                    className="min-h-[52px] max-h-32 resize-none border-neutral-300 focus:border-brand-yellow pr-12"
                    rows={1}
                  />
                  <div className="absolute right-2 bottom-2 flex items-center gap-1">
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => fileInputRef.current?.click()}
                      className="h-8 w-8 p-0"
                    >
                      <Upload className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <Button 
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() || isSendingMessage || isStreaming}
                  className="h-12 w-12 rounded-full bg-black hover:bg-neutral-800 text-white p-0"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AICopilot;