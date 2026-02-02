import React, { useState, useRef, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { validateFile } from "@/utils/fileUpload";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import RezzyLogo from "@/components/RezzyLogo";
import ThinkingIndicator from "./ThinkingIndicator";
import {
  Send,
  StopCircle,
  Plus,
  Paperclip,
  Brain,
  ChevronLeft,
  Menu,
  Trash2
} from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { useAdvancedAIChat, AdvancedMessage, FunctionCall, Citation } from "@/hooks/useAdvancedAIChat";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

const TITLE_MAX_LENGTH = 36;

const truncateTitle = (title: string, maxLength: number = TITLE_MAX_LENGTH): string => {
  if (title.length <= maxLength) return title;
  return title.slice(0, maxLength).trimEnd() + '...';
};

const AdvancedChatInterface = () => {
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [inputMessage, setInputMessage] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isUploadingFiles, setIsUploadingFiles] = useState(false);
  const { toast } = useToast();

  const {
    conversations,
    messages,
    currentConversationId,
    streamingState,
    conversationsLoading,
    isSendingMessage,
    sendMessage,
    startNewConversation,
    selectConversation,
    stopStreaming,
    toggleReasoning,
    uploadFiles,
    deleteConversation,
  } = useAdvancedAIChat();

  // Calculate thinking indicator visibility
  const showThinkingIndicator =
    (isUploadingFiles || isSendingMessage || streamingState.isStreaming) &&
    !streamingState.streamingMessage &&
    !streamingState.currentFunction;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingState.streamingMessage, showThinkingIndicator]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isSendingMessage) return;

    const message = inputMessage.trim();
    setInputMessage("");

    let fileIds: string[] = [];
    let uploadConversationId: string | null = null;
    if (selectedFiles.length > 0) {
      setIsUploadingFiles(true);
      try {
        const uploadResult = await uploadFiles(selectedFiles);
        fileIds = uploadResult.fileIds;
        uploadConversationId = uploadResult.conversationId;
      } finally {
        setIsUploadingFiles(false);
      }
      setSelectedFiles([]);
    }

    try {
      await sendMessage({ message, fileIds, conversationId: uploadConversationId });
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles: File[] = [];
    const rejectedFiles: string[] = [];

    for (const file of files) {
      const validation = validateFile(file);
      if (validation.isValid) {
        validFiles.push(file);
      } else {
        rejectedFiles.push(`${file.name}: ${validation.error}`);
      }
    }

    if (rejectedFiles.length > 0) {
      toast({
        title: "Some files were rejected",
        description: rejectedFiles.join('\n'),
        variant: "destructive",
      });
    }

    if (validFiles.length > 0) {
      setSelectedFiles(prev => [...prev, ...validFiles]);
    }

    e.target.value = '';
  }, [toast]);

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="mx-auto flex justify-center">
            <RezzyLogo size={48} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-rezzy-ink">Please log in</h2>
            <p className="text-rezzy-ink-muted text-sm">You need to be logged in to access Rezzy.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full bg-white">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-[280px]' : 'w-0'} transition-all duration-200 overflow-hidden border-r border-rezzy-cream-deep bg-rezzy-cream/30`}>
        <div className="w-[280px] h-full flex flex-col">
          {/* Sidebar Header */}
          <div className="p-4 flex items-center justify-between">
            <span className="text-sm font-medium text-rezzy-ink-muted">Conversations</span>
            <Button
              size="sm"
              variant="ghost"
              onClick={startNewConversation}
              className="h-8 w-8 p-0 text-rezzy-ink-muted hover:text-rezzy-ink hover:bg-rezzy-cream"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          {/* Conversations List */}
          <ScrollArea className="flex-1">
            <TooltipProvider>
              <div className="px-2 space-y-0.5">
                {conversationsLoading ? (
                  <p className="px-3 py-2 text-sm text-rezzy-ink-light">Loading...</p>
                ) : conversations.length === 0 ? (
                  <p className="px-3 py-2 text-sm text-rezzy-ink-light">No conversations</p>
                ) : (
                  conversations.map((conversation) => {
                    const isTruncated = conversation.title.length > TITLE_MAX_LENGTH;
                    const displayTitle = truncateTitle(conversation.title);

                    const conversationButton = (
                      <button
                        onClick={() => selectConversation(conversation.id)}
                        className={`flex-1 text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                          currentConversationId === conversation.id
                            ? 'bg-white text-rezzy-ink shadow-sm'
                            : 'text-rezzy-ink-muted hover:bg-white/50'
                        }`}
                      >
                        <p className="font-medium">{displayTitle}</p>
                        <p className="text-xs text-rezzy-ink-light mt-0.5">
                          {format(new Date(conversation.updated_at), 'MMM d')}
                        </p>
                      </button>
                    );

                    return (
                      <div key={conversation.id} className="group flex items-center">
                        {isTruncated ? (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              {conversationButton}
                            </TooltipTrigger>
                            <TooltipContent side="right" className="max-w-[300px]">
                              <p>{conversation.title}</p>
                            </TooltipContent>
                          </Tooltip>
                        ) : (
                          conversationButton
                        )}
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <button className="p-2 ml-2 opacity-0 group-hover:opacity-100 text-rezzy-ink-light hover:text-rezzy-coral transition-all">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete conversation?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently delete "{conversation.title}" and all its messages.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteConversation(conversation.id)}
                                className="bg-rezzy-coral text-white hover:bg-rezzy-coral/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    );
                  })
                )}
              </div>
            </TooltipProvider>
          </ScrollArea>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header - Minimal */}
        <div className="h-14 px-4 flex items-center gap-3 border-b border-rezzy-cream-deep">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 -ml-2 text-rezzy-ink-muted hover:text-rezzy-ink rounded-lg hover:bg-rezzy-cream transition-colors"
          >
            {sidebarOpen ? <ChevronLeft className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className="flex items-center gap-2">
            <RezzyLogo size={28} />
            <span className="font-display font-semibold text-rezzy-ink">Rezzy</span>
          </div>

          <div className="ml-auto flex items-center gap-1">
            {streamingState.showReasoning && (
              <span className="text-xs text-rezzy-ink-light mr-2">Reasoning visible</span>
            )}
            <button
              onClick={toggleReasoning}
              className={`p-2 rounded-lg transition-colors ${
                streamingState.showReasoning
                  ? 'bg-rezzy-sage-pale text-rezzy-sage'
                  : 'text-rezzy-ink-light hover:text-rezzy-ink hover:bg-rezzy-cream'
              }`}
            >
              <Brain className="w-4 h-4" />
            </button>

            {streamingState.isStreaming && (
              <button
                onClick={stopStreaming}
                className="p-2 text-rezzy-coral hover:bg-rezzy-coral-pale rounded-lg transition-colors"
              >
                <StopCircle className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Messages Area */}
        <ScrollArea className="flex-1">
          <div className="max-w-2xl mx-auto py-8">
            {/* Welcome State */}
            {messages.length === 0 && !streamingState.streamingMessage && !showThinkingIndicator && (
              <div className="px-4 py-16 text-center">
                <div className="mx-auto mb-6 flex justify-center">
                  <RezzyLogo size={56} />
                </div>
                <h2 className="text-xl font-display font-semibold text-rezzy-ink mb-2">
                  How can I help?
                </h2>
                <p className="text-rezzy-ink-muted text-sm max-w-sm mx-auto">
                  Ask about dosing, clinical guidelines, differential diagnosis, or any pediatric question.
                </p>
              </div>
            )}

            {/* Messages */}
            {messages.map(message => (
              <MessageBubble
                key={message.id}
                message={message}
                showReasoning={streamingState.showReasoning}
              />
            ))}

            {/* Thinking indicator - shows before response text arrives */}
            <ThinkingIndicator visible={showThinkingIndicator} />

            {/* Streaming message */}
            {streamingState.streamingMessage && (
              <div className="px-4 py-6">
                <div className="flex gap-3">
                  <div className="w-7 h-7 flex-shrink-0">
                    <RezzyLogo size={28} />
                  </div>
                  <div className="flex-1 min-w-0">
                    {/* Reasoning */}
                    {streamingState.reasoningText && streamingState.showReasoning && (
                      <div className="mb-3 text-sm text-rezzy-ink-muted italic border-l-2 border-rezzy-sage-lighter pl-3">
                        {streamingState.reasoningText}
                      </div>
                    )}

                    {/* Response */}
                    <p className="text-rezzy-ink leading-relaxed whitespace-pre-wrap">
                      {streamingState.streamingMessage}
                      <span className="inline-block w-0.5 h-4 bg-rezzy-sage ml-0.5 animate-pulse" />
                    </p>

                    {/* Function calls */}
                    {streamingState.functionCalls.map(call => (
                      <FunctionCallDisplay key={call.id} functionCall={call} />
                    ))}

                    {/* Current function being executed */}
                    {streamingState.currentFunction && (
                      <p className="mt-2 text-sm text-rezzy-ink-muted">
                        <span className="inline-block w-1.5 h-1.5 bg-rezzy-sage rounded-full mr-2 animate-pulse" />
                        Running {streamingState.currentFunction.name}...
                      </p>
                    )}

                    {/* Streaming images */}
                    {streamingState.images.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {streamingState.images.map((url, index) => (
                          <img
                            key={index}
                            src={url}
                            alt="Generated"
                            className="rounded-lg max-w-xs"
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input Area - Clean and minimal */}
        <div className="border-t border-rezzy-cream-deep bg-white">
          <div className="max-w-2xl mx-auto p-4">
            {/* File attachments */}
            {selectedFiles.length > 0 && (
              <div className="mb-3 flex flex-wrap gap-2">
                {selectedFiles.map((file, index) => (
                  <div key={index} className="flex items-center gap-2 bg-rezzy-cream rounded-full px-3 py-1.5 text-sm text-rezzy-ink-muted">
                    <Paperclip className="w-3 h-3" />
                    <span className="truncate max-w-[120px]">{file.name}</span>
                    <button
                      onClick={() => removeFile(index)}
                      className="text-rezzy-ink-light hover:text-rezzy-ink"
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
                  placeholder="Ask anything..."
                  disabled={isSendingMessage || streamingState.isStreaming}
                  className="min-h-[48px] max-h-32 resize-none border-rezzy-cream-deep bg-rezzy-cream/30
                           text-rezzy-ink placeholder:text-rezzy-ink-light rounded-2xl pr-12
                           focus:border-rezzy-sage focus:ring-1 focus:ring-rezzy-sage/20"
                  rows={1}
                />
                <div className="absolute right-2 bottom-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png,.gif,.webp"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="p-2 text-rezzy-ink-light hover:text-rezzy-ink rounded-lg hover:bg-rezzy-cream transition-colors"
                  >
                    <Paperclip className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <Button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isSendingMessage || streamingState.isStreaming}
                className="h-12 w-12 rounded-full p-0 bg-rezzy-sage hover:bg-rezzy-sage-light text-white shadow-none"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Clean message bubble
const MessageBubble = ({
  message,
  showReasoning
}: {
  message: AdvancedMessage;
  showReasoning: boolean;
}) => {
  const isUser = message.role === "user";
  const [expandReasoning, setExpandReasoning] = useState(false);

  return (
    <div className="px-4 py-6">
      <div className="flex gap-3">
        {/* Avatar */}
        {isUser ? (
          <div className="w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center bg-rezzy-ink text-white text-xs font-medium">
            Y
          </div>
        ) : (
          <div className="w-7 h-7 flex-shrink-0">
            <RezzyLogo size={28} />
          </div>
        )}

        <div className="flex-1 min-w-0">
          {/* Message content */}
          <p className="text-rezzy-ink leading-relaxed whitespace-pre-wrap">
            {message.content}
          </p>

          {/* Reasoning (collapsible) */}
          {message.metadata?.reasoning && showReasoning && (
            <Collapsible open={expandReasoning} onOpenChange={setExpandReasoning}>
              <CollapsibleTrigger className="mt-3 text-xs text-rezzy-ink-light hover:text-rezzy-ink-muted flex items-center gap-1">
                <Brain className="w-3 h-3" />
                {expandReasoning ? 'Hide' : 'Show'} reasoning
              </CollapsibleTrigger>
              <CollapsibleContent>
                <p className="mt-2 text-sm text-rezzy-ink-muted italic border-l-2 border-rezzy-sage-lighter pl-3">
                  {message.metadata.reasoning}
                </p>
              </CollapsibleContent>
            </Collapsible>
          )}

          {/* Function calls */}
          {message.metadata?.functionCalls && message.metadata.functionCalls.length > 0 && (
            <div className="mt-3 space-y-2">
              {message.metadata.functionCalls.map(call => (
                <FunctionCallDisplay key={call.id} functionCall={call} />
              ))}
            </div>
          )}

          {/* Citations */}
          {message.metadata?.citations && message.metadata.citations.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {message.metadata.citations.map(citation => (
                <a
                  key={citation.id}
                  href={citation.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-rezzy-sage hover:text-rezzy-sage-light hover:underline"
                >
                  {citation.title}
                </a>
              ))}
            </div>
          )}

          {/* Images */}
          {message.metadata?.images && message.metadata.images.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {message.metadata.images.map((url, index) => (
                <img
                  key={index}
                  src={url}
                  alt="Generated"
                  className="rounded-lg max-w-xs"
                />
              ))}
            </div>
          )}

          {/* Timestamp - subtle */}
          <p className="mt-2 text-xs text-rezzy-ink-light">
            {format(new Date(message.created_at), 'h:mm a')}
          </p>
        </div>
      </div>
    </div>
  );
};

// Minimal function call display
const FunctionCallDisplay = ({ functionCall }: { functionCall: FunctionCall }) => (
  <div className="mt-3 text-sm">
    <div className="flex items-center gap-2 text-rezzy-ink-muted">
      <span className={`w-1.5 h-1.5 rounded-full ${functionCall.status === 'success' ? 'bg-rezzy-sage' : 'bg-rezzy-coral'}`} />
      <span>{functionCall.name}</span>
      <span className="text-rezzy-ink-light">· {functionCall.duration}ms</span>
    </div>
    {functionCall.result && (
      <pre className="mt-2 p-3 bg-rezzy-cream/50 rounded-lg text-xs text-rezzy-ink-muted overflow-x-auto">
        {JSON.stringify(functionCall.result, null, 2)}
      </pre>
    )}
  </div>
);

export default AdvancedChatInterface;
