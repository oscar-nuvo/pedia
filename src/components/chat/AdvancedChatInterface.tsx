import React, { useState, useRef, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { validateFile } from "@/utils/fileUpload";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { 
  Bot, 
  Send, 
  StopCircle, 
  MessageSquare, 
  Plus, 
  Upload, 
  Paperclip,
  Brain,
  Calculator,
  Search,
  FileText,
  Image,
  Activity,
  Clock,
  CheckCircle,
  AlertTriangle,
  User,
  Stethoscope,
  Settings,
  Download,
  Trash2
} from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useAdvancedAIChat, AdvancedMessage, Citation, FunctionCall, BackgroundTask } from "@/hooks/useAdvancedAIChat";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";
import { Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

const AdvancedChatInterface = () => {
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [inputMessage, setInputMessage] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [showContextPanel, setShowContextPanel] = useState(false);
  const { toast } = useToast();

  const {
    conversations,
    messages,
    currentConversationId,
    patientContext,
    streamingState,
    backgroundTasks,
    conversationsLoading,
    messagesLoading,
    isSendingMessage,
    sendMessage,
    startNewConversation,
    selectConversation,
    stopStreaming,
    toggleReasoning,
    startBackgroundTask,
    uploadFiles,
    setPatientContext,
    deleteConversation,
  } = useAdvancedAIChat();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingState.streamingMessage]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isSendingMessage) return;

    const message = inputMessage.trim();
    setInputMessage("");

    // Upload files if any - get both fileIds AND conversationId to avoid race conditions
    let fileIds: string[] = [];
    let uploadConversationId: string | null = null;
    if (selectedFiles.length > 0) {
      const uploadResult = await uploadFiles(selectedFiles);
      fileIds = uploadResult.fileIds;
      uploadConversationId = uploadResult.conversationId;
      setSelectedFiles([]);
    }

    try {
      // Pass the conversationId from upload to ensure files and message use the same conversation
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

    // Reset input to allow re-selecting the same file
    e.target.value = '';
  }, [toast]);

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleQuickAction = (action: string, input: string) => {
    setInputMessage(input);
    if (action === 'background') {
      startBackgroundTask('medical_research', input);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Bot className="w-12 h-12 text-muted-foreground mx-auto" />
          <div>
            <h2 className="text-xl font-semibold">Please log in</h2>
            <p className="text-muted-foreground">You need to be logged in to access the AI Assistant.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-background">
        {/* Conversations Sidebar */}
        <Sidebar className="border-r">
          <SidebarHeader className="border-b p-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">Conversations</h2>
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
                <div className="p-4 text-center text-muted-foreground">Loading...</div>
              ) : conversations.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">No conversations yet</div>
              ) : (
                conversations.map((conversation) => (
                  <SidebarMenuItem key={conversation.id}>
                    <div className="flex items-center group w-full">
                      <SidebarMenuButton
                        onClick={() => selectConversation(conversation.id)}
                        isActive={currentConversationId === conversation.id}
                        className="flex-1 mr-2"
                      >
                        <MessageSquare className="w-4 h-4 mr-2" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{conversation.title}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {format(new Date(conversation.updated_at), 'MMM d, HH:mm')}
                          </p>
                        </div>
                      </SidebarMenuButton>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0 flex-shrink-0"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Conversation</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{conversation.title}"? 
                              This action cannot be undone and will permanently delete all messages in this conversation.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => deleteConversation(conversation.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </SidebarMenuItem>
                ))
              )}
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {/* Chat Header */}
          <div className="border-b px-6 py-4 bg-card">
            <div className="flex items-center gap-3">
              <SidebarTrigger />
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-primary" />
                <h1 className="font-semibold">Rezzy</h1>
              </div>
              
              {/* Patient Context Indicator */}
              {patientContext && (
                <Badge variant="secondary" className="ml-2">
                  <User className="w-3 h-3 mr-1" />
                  {patientContext.name}
                </Badge>
              )}

              {/* Stream Controls */}
              <div className="ml-auto flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={toggleReasoning}
                  className={streamingState.showReasoning ? "bg-accent" : ""}
                >
                  <Brain className="w-4 h-4 mr-1" />
                  Reasoning
                </Button>
                
                {streamingState.isStreaming && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={stopStreaming}
                  >
                    <StopCircle className="w-4 h-4 mr-1" />
                    Stop
                  </Button>
                )}

                {/* Context Panel Toggle */}
                <Sheet open={showContextPanel} onOpenChange={setShowContextPanel}>
                  <SheetTrigger asChild>
                    <Button size="sm" variant="outline">
                      <Settings className="w-4 h-4" />
                    </Button>
                  </SheetTrigger>
                  <ContextPanel 
                    patientContext={patientContext}
                    setPatientContext={setPatientContext}
                    backgroundTasks={backgroundTasks}
                    onStartBackgroundTask={startBackgroundTask}
                  />
                </Sheet>
              </div>
            </div>
          </div>

          {/* Progress Indicator */}
          {streamingState.isStreaming && streamingState.progress && (
            <div className="border-b bg-muted/50 px-6 py-2">
              <div className="flex items-center gap-3">
                <ActivityIndicator type={streamingState.progress.type} />
                <span className="text-sm text-muted-foreground">{streamingState.progress.status}</span>
                {streamingState.progress.percentage && (
                  <Progress value={streamingState.progress.percentage} className="w-24" />
                )}
              </div>
            </div>
          )}

          {/* Messages Area */}
          <ScrollArea className="flex-1">
            <div className="max-w-4xl mx-auto">
              {/* Welcome message */}
              {messages.length === 0 && !streamingState.streamingMessage && (
                <WelcomeSection onQuickAction={handleQuickAction} />
              )}
              
              {/* Messages */}
              {messages.map(message => (
                <MessageBubble 
                  key={message.id} 
                  message={message}
                  showReasoning={streamingState.showReasoning}
                />
              ))}
              
              {/* Streaming message */}
              {streamingState.streamingMessage && (
                <div className="group flex items-start gap-4 px-4 py-6 bg-card">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                    <Bot className="w-4 h-4 animate-pulse" />
                  </div>
                  <div className="flex-1 space-y-3">
                    {/* Reasoning Display */}
                    {streamingState.reasoningText && streamingState.showReasoning && (
                      <ReasoningDisplay text={streamingState.reasoningText} />
                    )}
                    
                    {/* Main Response */}
                    <div className="prose prose-neutral max-w-none">
                      <p className="whitespace-pre-wrap leading-relaxed">{streamingState.streamingMessage}</p>
                      <div className="w-2 h-4 bg-primary rounded animate-pulse inline-block ml-1"></div>
                    </div>

                    {/* Function Calls */}
                    {streamingState.functionCalls.map(call => (
                      <FunctionCallDisplay key={call.id} functionCall={call} />
                    ))}

                    {/* Current Function */}
                    {streamingState.currentFunction && (
                      <div className="border border-border rounded-lg p-3 bg-muted/50">
                        <div className="flex items-center gap-2">
                          <Calculator className="w-4 h-4 animate-spin" />
                          <span className="text-sm font-medium">Executing {streamingState.currentFunction.name}...</span>
                        </div>
                      </div>
                    )}

                    {/* Images */}
                    {streamingState.images.map((url, index) => (
                      <img key={index} src={url} alt="Generated" className="rounded-lg max-w-sm" />
                    ))}
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          </ScrollArea>

          {/* Input Area */}
          <div className="border-t bg-card">
            <div className="max-w-4xl mx-auto p-4">
              {/* File attachments */}
              {selectedFiles.length > 0 && (
                <div className="mb-3 flex flex-wrap gap-2">
                  {selectedFiles.map((file, index) => (
                    <div key={index} className="flex items-center gap-2 bg-muted rounded-lg px-3 py-2 text-sm">
                      <Paperclip className="w-4 h-4" />
                      <span className="truncate max-w-32">{file.name}</span>
                      <button
                        onClick={() => removeFile(index)}
                        className="text-muted-foreground hover:text-foreground"
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
                    disabled={isSendingMessage || streamingState.isStreaming}
                    className="min-h-[52px] max-h-32 resize-none pr-12"
                    rows={1}
                  />
                  <div className="absolute right-2 bottom-2 flex items-center gap-1">
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept=".pdf,.jpg,.jpeg,.png,.gif,.webp"
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
                  disabled={!inputMessage.trim() || isSendingMessage || streamingState.isStreaming}
                  className="h-12 w-12 rounded-full p-0"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>

              {/* Quick Actions */}
              <QuickActions onAction={handleQuickAction} />
            </div>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

// Component for activity indicators
const ActivityIndicator = ({ type }: { type: string }) => {
  const icons = {
    text: <Bot className="w-4 h-4 animate-pulse" />,
    reasoning: <Brain className="w-4 h-4 animate-pulse" />,
    function: <Calculator className="w-4 h-4 animate-spin" />,
    search: <Search className="w-4 h-4 animate-pulse" />,
    image: <Image className="w-4 h-4 animate-pulse" />
  };

  return icons[type] || <Activity className="w-4 h-4 animate-pulse" />;
};

// Welcome section with quick actions
const WelcomeSection = ({ onQuickAction }: { onQuickAction: (action: string, input: string) => void }) => (
  <div className="px-4 py-12 text-center">
    <Bot className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
    <h2 className="text-xl font-semibold mb-2">
      Welcome to Rezzy
    </h2>
    <p className="text-muted-foreground mb-8 max-w-md mx-auto">
      I can help with clinical questions, drug dosing, guidelines, patient-specific insights, 
      and complex medical research. What can I assist you with today?
    </p>
    
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
      {[
        {
          title: "Quick Dosing",
          icon: <Calculator className="w-5 h-5" />,
          example: "What's the amoxicillin dose for a 15kg child with otitis media?",
          action: "quick"
        },
        {
          title: "Clinical Guidelines",
          icon: <FileText className="w-5 h-5" />,
          example: "Latest AAP guidelines for fever management in children?",
          action: "guidelines"
        },
        {
          title: "Growth Analysis",
          icon: <Activity className="w-5 h-5" />,
          example: "Analyze growth chart for 3-year-old: 95cm, 14kg",
          action: "growth"
        },
        {
          title: "Drug Interactions",
          icon: <AlertTriangle className="w-5 h-5" />,
          example: "Check interactions between amoxicillin and acetaminophen",
          action: "interactions"
        },
        {
          title: "Differential Diagnosis",
          icon: <Stethoscope className="w-5 h-5" />,
          example: "3yo with fever, rash, and joint pain - differential diagnosis?",
          action: "background"
        },
        {
          title: "Research Analysis",
          icon: <Search className="w-5 h-5" />,
          example: "Latest evidence on childhood asthma management",
          action: "background"
        }
      ].map((item, index) => (
        <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              {item.icon}
              {item.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground mb-3">{item.example}</p>
            <Button 
              size="sm" 
              variant="outline" 
              className="w-full"
              onClick={() => onQuickAction(item.action, item.example)}
            >
              Try this
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
);

// Message bubble component
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
    <div className={`group flex items-start gap-4 px-4 py-6 ${isUser ? "bg-muted/50" : "bg-card"}`}>
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
        isUser ? "bg-accent text-accent-foreground" : "bg-primary text-primary-foreground"
      }`}>
        {isUser ? "Y" : <Bot className="w-4 h-4" />}
      </div>
      <div className="flex-1 space-y-3">
        <div className="prose prose-neutral max-w-none">
          <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
        </div>

        {/* Reasoning summary */}
        {message.metadata?.reasoning && showReasoning && (
          <Collapsible open={expandReasoning} onOpenChange={setExpandReasoning}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-2">
                <Brain className="w-4 h-4" />
                <span>View reasoning process</span>
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <ReasoningDisplay text={message.metadata.reasoning} />
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* Citations */}
        {message.metadata?.citations && message.metadata.citations.length > 0 && (
          <CitationsList citations={message.metadata.citations} />
        )}

        {/* Function calls */}
        {message.metadata?.functionCalls && message.metadata.functionCalls.length > 0 && (
          <div className="space-y-2">
            {message.metadata.functionCalls.map(call => (
              <FunctionCallDisplay key={call.id} functionCall={call} />
            ))}
          </div>
        )}

        {/* Images */}
        {message.metadata?.images && message.metadata.images.length > 0 && (
          <div className="grid grid-cols-2 gap-2">
            {message.metadata.images.map((url, index) => (
              <img key={index} src={url} alt="Generated" className="rounded-lg" />
            ))}
          </div>
        )}

        <div className="text-xs text-muted-foreground flex items-center gap-2">
          <Clock className="w-3 h-3" />
          {format(new Date(message.created_at), 'MMM d, HH:mm')}
          {message.metadata?.confidence && (
            <Badge variant="outline" className="text-xs">
              {Math.round(message.metadata.confidence * 100)}% confidence
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
};

// Reasoning display component
const ReasoningDisplay = ({ text }: { text: string }) => (
  <div className="border border-border rounded-lg p-4 bg-muted/30">
    <div className="flex items-center gap-2 mb-2">
      <Brain className="w-4 h-4" />
      <span className="text-sm font-medium">Chain of Thought</span>
    </div>
    <p className="text-sm text-muted-foreground leading-relaxed">{text}</p>
  </div>
);

// Function call display component
const FunctionCallDisplay = ({ functionCall }: { functionCall: FunctionCall }) => (
  <div className="border border-border rounded-lg p-3 bg-muted/50">
    <div className="flex items-center gap-2 mb-2">
      {functionCall.status === 'success' ? (
        <CheckCircle className="w-4 h-4 text-green-600" />
      ) : (
        <AlertTriangle className="w-4 h-4 text-red-600" />
      )}
      <span className="text-sm font-medium">{functionCall.name}</span>
      <Badge variant="outline" className="text-xs">
        {functionCall.duration}ms
      </Badge>
    </div>
    <div className="text-sm">
      <pre className="bg-background p-2 rounded text-xs overflow-x-auto">
        {JSON.stringify(functionCall.result, null, 2)}
      </pre>
    </div>
  </div>
);

// Citations list component
const CitationsList = ({ citations }: { citations: Citation[] }) => (
  <div className="border border-border rounded-lg p-3">
    <div className="flex items-center gap-2 mb-2">
      <FileText className="w-4 h-4" />
      <span className="text-sm font-medium">Sources</span>
    </div>
    <div className="space-y-1">
      {citations.map(citation => (
        <div key={citation.id} className="text-xs">
          <a href={citation.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
            {citation.title}
          </a>
          <span className="text-muted-foreground ml-2">({citation.source})</span>
        </div>
      ))}
    </div>
  </div>
);

// Quick actions component
const QuickActions = ({ onAction }: { onAction: (action: string, input: string) => void }) => (
  <div className="mt-3 flex flex-wrap gap-2">
    {[
      { label: "Drug Interaction Check", input: "Check drug interactions for " },
      { label: "Growth Percentiles", input: "Calculate growth percentiles for " },
      { label: "Dosage Calculator", input: "Calculate pediatric dose for " },
      { label: "Clinical Guidelines", input: "What are the current guidelines for " }
    ].map((action, index) => (
      <Button
        key={index}
        variant="outline"
        size="sm"
        onClick={() => onAction("quick", action.input)}
        className="text-xs"
      >
        {action.label}
      </Button>
    ))}
  </div>
);

// Context panel component
const ContextPanel = ({ 
  patientContext, 
  setPatientContext, 
  backgroundTasks,
  onStartBackgroundTask 
}: {
  patientContext: any;
  setPatientContext: (context: any) => void;
  backgroundTasks: BackgroundTask[];
  onStartBackgroundTask: (type: any, input: string) => void;
}) => (
  <SheetContent>
    <SheetHeader>
      <SheetTitle>Context & Tools</SheetTitle>
    </SheetHeader>
    <div className="space-y-6">
      {/* Patient Context */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-4 h-4" />
            Patient Context
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {patientContext ? (
            <div className="text-sm">
              <p><strong>Name:</strong> {patientContext.name}</p>
              <p><strong>Age:</strong> {patientContext.age}</p>
              <p><strong>Weight:</strong> {patientContext.weight}kg</p>
              <Button size="sm" variant="outline" onClick={() => setPatientContext(null)}>
                Clear
              </Button>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No patient context set</p>
          )}
        </CardContent>
      </Card>

      {/* Background Tasks */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-4 h-4" />
            Background Tasks
          </CardTitle>
        </CardHeader>
        <CardContent>
          {backgroundTasks.length === 0 ? (
            <p className="text-sm text-muted-foreground">No background tasks</p>
          ) : (
            <div className="space-y-2">
              {backgroundTasks.map(task => (
                <div key={task.id} className="border border-border rounded p-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{task.type.replace('_', ' ')}</span>
                    <Badge variant={task.status === 'completed' ? 'default' : 'secondary'}>
                      {task.status}
                    </Badge>
                  </div>
                  {task.estimatedTime && (
                    <p className="text-xs text-muted-foreground">Est: {task.estimatedTime}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Tools */}
      <Card>
        <CardHeader>
          <CardTitle>Medical Tools</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button 
            size="sm" 
            variant="outline" 
            className="w-full justify-start"
            onClick={() => onStartBackgroundTask('drug_interaction', 'Comprehensive drug interaction analysis')}
          >
            <AlertTriangle className="w-4 h-4 mr-2" />
            Drug Interaction Analysis
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            className="w-full justify-start"
            onClick={() => onStartBackgroundTask('diagnosis_analysis', 'Differential diagnosis analysis')}
          >
            <Stethoscope className="w-4 h-4 mr-2" />
            Differential Diagnosis
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            className="w-full justify-start"
            onClick={() => onStartBackgroundTask('medical_research', 'Latest medical research')}
          >
            <Search className="w-4 h-4 mr-2" />
            Medical Research
          </Button>
        </CardContent>
      </Card>
    </div>
  </SheetContent>
);

export default AdvancedChatInterface;