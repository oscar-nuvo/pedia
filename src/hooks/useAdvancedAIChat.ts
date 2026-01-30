import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export interface AdvancedMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  created_at: string;
  metadata?: {
    reasoning?: string;
    citations?: Citation[];
    functionCalls?: FunctionCall[];
    confidence?: number;
    tokens?: any;
    images?: string[];
    calculations?: any[];
    responseId?: string;
    isPersisted?: boolean;
  };
}

export interface Citation {
  id: string;
  title: string;
  url?: string;
  source: string;
  relevance_score?: number;
}

export interface FunctionCall {
  id: string;
  name: string;
  arguments: any;
  result: any;
  duration: number;
  status: 'success' | 'error';
}

export interface ConversationState {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  patient_id?: string;
  metadata?: {
    responseId?: string;
    messageCount?: number;
    reasoningItems?: string[];
    fileIds?: string[];
    model?: string;
    performance?: any;
  };
}

export interface StreamingState {
  isStreaming: boolean;
  streamingMessage: string;
  reasoningText: string;
  showReasoning: boolean;
  functionCalls: FunctionCall[];
  currentFunction?: {
    name: string;
    arguments: string;
    startTime: number;
  };
  images: string[];
  progress?: {
    type: 'text' | 'reasoning' | 'function' | 'search' | 'image';
    status: string;
    percentage?: number;
  };
}

export interface BackgroundTask {
  id: string;
  type: 'medical_research' | 'drug_interaction' | 'diagnosis_analysis';
  status: 'queued' | 'in_progress' | 'completed' | 'failed';
  createdAt: Date;
  completedAt?: Date;
  result?: any;
  estimatedTime?: string;
  progress?: number;
}

export const useAdvancedAIChat = (conversationId?: string) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Core state
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(conversationId || null);
  const [patientContext, setPatientContext] = useState<any>(null);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  
  // Streaming state
  const [streamingState, setStreamingState] = useState<StreamingState>({
    isStreaming: false,
    streamingMessage: '',
    reasoningText: '',
    showReasoning: true,
    functionCalls: [],
    images: [],
  });
  
  // Background tasks
  const [backgroundTasks, setBackgroundTasks] = useState<BackgroundTask[]>([]);
  
  // Stream control
  const abortControllerRef = useRef<AbortController | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Fetch conversations
  const { data: conversations = [], isLoading: conversationsLoading } = useQuery({
    queryKey: ['conversations', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });
      
      if (error) throw error;
      return data as ConversationState[];
    },
    enabled: !!user,
  });

  // Fetch messages for current conversation
  const { data: messages = [], isLoading: messagesLoading } = useQuery({
    queryKey: ['messages', currentConversationId],
    queryFn: async () => {
      if (!currentConversationId) return [];
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', currentConversationId)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return data as AdvancedMessage[];
    },
    enabled: !!currentConversationId,
  });

  // Delete conversation
  const deleteConversationMutation = useMutation({
    mutationFn: async (conversationId: string) => {
      const { error } = await supabase
        .from('conversations')
        .delete()
        .eq('id', conversationId);
      
      if (error) throw error;
      
      return { id: conversationId };
    },
    onSuccess: (deletedConversation) => {
      toast({
        title: "Success",
        description: "Conversation deleted successfully",
      });
      
      // If deleting current conversation, start a new one
      if (currentConversationId === deletedConversation.id) {
        setCurrentConversationId(null);
        setStreamingState({
          isStreaming: false,
          streamingMessage: '',
          reasoningText: '',
          showReasoning: true,
          functionCalls: [],
          images: [],
        });
      }
      
      // Invalidate queries to refresh conversation list
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
    onError: (error) => {
      console.error('Error deleting conversation:', error);
      toast({
        title: "Error",
        description: "Failed to delete conversation. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Create new conversation
  const createConversationMutation = useMutation({
    mutationFn: async (title: string = 'New Conversation') => {
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('conversations')
        .insert({
          user_id: user.id,
          title,
          metadata: {
            prompt_id: 'pmpt_68d880ea8b0c8194897a498de096ee0f0859affba435451f',
            messageCount: 0,
            fileIds: [],
            reasoningItems: []
          }
        })
        .select()
        .single();
      
      if (error) throw error;
      return data as ConversationState;
    },
    onSuccess: (data) => {
      setCurrentConversationId(data.id);
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create conversation",
        variant: "destructive",
      });
      console.error('Error creating conversation:', error);
    },
  });

  // Enhanced message sending with full streaming support
  const sendMessageMutation = useMutation({
    mutationFn: async ({ 
      message, 
      fileIds = [], 
      taskType,
      options = {} 
    }: { 
      message: string;
      fileIds?: string[];
      conversationId?: string | null;  // Explicit conversation ID (to avoid race conditions with file uploads)
      taskType?: 'medical_research' | 'drug_interaction' | 'diagnosis_analysis';
      options?: {
        reasoningEffort?: 'low' | 'medium' | 'high';
        includeReasoningSummary?: boolean;
        maxTokens?: number;
      };
    }) => {
      if (!user) throw new Error('User not authenticated');

      // Use explicit conversationId if provided (from file upload), otherwise use state
      let conversationIdToUse = conversationId || currentConversationId;

      // Create conversation if none exists
      if (!conversationIdToUse) {
        const conversation = await createConversationMutation.mutateAsync('New Conversation');
        conversationIdToUse = conversation.id;
        setCurrentConversationId(conversationIdToUse);
      }

      // Cancel any existing stream
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create new abort controller
      abortControllerRef.current = new AbortController();

      // Reset streaming state
      setStreamingState(prev => ({
        ...prev,
        isStreaming: true,
        streamingMessage: '',
        reasoningText: '',
        functionCalls: [],
        images: [],
        progress: { type: 'text', status: 'Starting...' }
      }));

      // Get the session for authentication
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No active session');

      // Prepare request body
      const requestBody = {
        message,
        conversationId: conversationIdToUse,
        fileIds,
        patientContext,
        taskType,
        options: {
          reasoningEffort: options.reasoningEffort || 'high',
          includeReasoningSummary: options.includeReasoningSummary ?? streamingState.showReasoning,
          background: taskType ? true : false,
          ...options
        }
      };

      // Get Supabase URL from environment or client
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://pgypyipdmrhrutegapsx.supabase.co';

      // Handle background tasks
      if (taskType) {
        const response = await fetch(`${supabaseUrl}/functions/v1/pediatric-ai-chat`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
            // ✅ SECURE: Edge Function handles credentials via Supabase Secrets
          },
          body: JSON.stringify(requestBody),
        });

        const task = await response.json();
        setBackgroundTasks(prev => [...prev, task]);
        
        toast({
          title: "Background Task Started",
          description: `${taskType.replace('_', ' ')} analysis started. Estimated time: ${task.estimatedTime || '2-5 minutes'}`,
        });

        return conversationIdToUse;
      }

      // Regular streaming response
      const response = await fetch(`${supabaseUrl}/functions/v1/pediatric-ai-chat`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
          // ✅ SECURE: Edge Function handles credentials via Supabase Secrets
        },
        body: JSON.stringify(requestBody),
        signal: abortControllerRef.current?.signal
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Handle streaming response with comprehensive event processing
      await handleStreamingResponse(response, conversationIdToUse);

      return conversationIdToUse;
    },
    onError: (error) => {
      setStreamingState(prev => ({ ...prev, isStreaming: false }));
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
      console.error('Error sending message:', error);
    },
  });

  const handleStreamingResponse = async (response: Response, conversationId: string) => {
    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('Failed to get response reader');
    }

    let accumulatedContent = '';
    let accumulatedReasoning = '';
    let currentResponseId = '';
    let receivedResponseComplete = false;
    const functionCallsBuffer: Map<string, any> = new Map();

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = new TextDecoder().decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;

            try {
              const parsed = JSON.parse(data);
              await processStreamEvent(parsed, {
                accumulatedContent,
                accumulatedReasoning,
                functionCallsBuffer,
                conversationId,
                currentResponseId,
                setAccumulatedContent: (content: string) => { accumulatedContent = content; },
                setAccumulatedReasoning: (reasoning: string) => { accumulatedReasoning = reasoning; },
                setCurrentResponseId: (id: string) => { currentResponseId = id; },
                setReceivedResponseComplete: (received: boolean) => { receivedResponseComplete = received; }
              });
            } catch (parseError) {
              console.error('Error parsing streaming data:', parseError);
            }
          }
        }
      }

      // Secondary fallback: if stream ended without response_complete but we have content
      if (!receivedResponseComplete && accumulatedContent.trim()) {
        console.log('Secondary fallback: stream ended without response_complete, triggering fallback save');
        
        setTimeout(async () => {
          try {
            // Check if message was already persisted
            if (currentResponseId) {
              const { data: existing } = await supabase
                .from('messages')
                .select('id')
                .eq('response_id', currentResponseId)
                .eq('conversation_id', conversationId)
                .single();
              
              if (existing) {
                console.log('Message already persisted via response_id:', currentResponseId);
                return;
              }
            }

            // Save as fallback
            const { data: fallbackMessage } = await supabase
              .from('messages')
              .insert({
                conversation_id: conversationId,
                role: 'assistant',
                content: accumulatedContent.trim(),
                response_id: currentResponseId || null,
                metadata: {
                  reasoningSummary: accumulatedReasoning || undefined,
                  fallbackSave: true,
                  secondaryFallback: true
                }
              })
              .select()
              .single();

            if (fallbackMessage) {
              console.log('Secondary fallback save successful:', fallbackMessage.id);
              queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
            }
          } catch (error) {
            console.error('Secondary fallback save failed:', error);
          }
        }, 2000);
      }

    } finally {
      // Invalidate queries to refresh messages and conversations (will pick up title updates)
      queryClient.invalidateQueries({ queryKey: ['messages', conversationId] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    }
  };

  const processStreamEvent = async (event: any, context: any) => {
    switch (event.type) {
      case 'response_started':
        setStreamingState(prev => ({
          ...prev,
          progress: { type: 'text', status: 'AI started thinking...' }
        }));
        break;

      case 'response_id':
        console.log('Response ID received:', event.responseId);
        context.setCurrentResponseId(event.responseId);
        break;

      case 'text_delta':
        context.setAccumulatedContent(context.accumulatedContent + event.delta);
        setStreamingState(prev => ({
          ...prev,
          streamingMessage: context.accumulatedContent,
          progress: { type: 'text', status: 'Generating response...' }
        }));
        break;

      case 'reasoning_delta':
        if (streamingState.showReasoning) {
          context.setAccumulatedReasoning(context.accumulatedReasoning + event.delta);
          setStreamingState(prev => ({
            ...prev,
            reasoningText: context.accumulatedReasoning,
            progress: { type: 'reasoning', status: 'Thinking through the problem...' }
          }));
        }
        break;

      case 'reasoning_complete':
        if (streamingState.showReasoning) {
          setStreamingState(prev => ({
            ...prev,
            reasoningText: event.summary
          }));
        }
        break;

      case 'function_arguments_delta':
        const callId = event.callId;
        const existing = context.functionCallsBuffer.get(callId) || { 
          name: event.function_name || 'unknown', 
          arguments: '', 
          startTime: Date.now() 
        };
        existing.arguments += event.delta;
        context.functionCallsBuffer.set(callId, existing);
        
        setStreamingState(prev => ({
          ...prev,
          currentFunction: {
            name: existing.name,
            arguments: existing.arguments,
            startTime: existing.startTime
          },
          progress: { type: 'function', status: `Calling ${existing.name}...` }
        }));
        break;

      case 'function_result':
        const functionCall: FunctionCall = {
          id: crypto.randomUUID(),
          name: event.function_name,
          arguments: context.functionCallsBuffer.get(event.callId)?.arguments || '{}',
          result: event.result,
          duration: Date.now() - (context.functionCallsBuffer.get(event.callId)?.startTime || Date.now()),
          status: event.result.error ? 'error' : 'success'
        };

        setStreamingState(prev => ({
          ...prev,
          functionCalls: [...prev.functionCalls, functionCall],
          currentFunction: undefined,
          progress: { type: 'function', status: `${event.function_name} completed` }
        }));

        // Clean up function call buffer
        context.functionCallsBuffer.delete(event.callId);
        break;

      case 'response_saved':
        console.log('Response saved successfully by Edge Function:', event.messageId);
        // Clear any pending fallback since Edge Function succeeded
        setStreamingState(prev => ({
          ...prev,
          progress: { type: 'text', status: 'Response saved successfully' }
        }));
        break;

      case 'db_error':
        console.log('Edge Function DB error, client fallback will handle:', event.details);
        break;

      case 'response_complete':
        context.setReceivedResponseComplete(true);
        
        // Keep message visible during database save
        setStreamingState(prev => ({
          ...prev,
          progress: { type: 'text', status: 'Finalizing response...' }
        }));
        
        // Store the response for potential fallback
        const finalContent = event.content || context.accumulatedContent || '';
        
        // Optimistically append the assistant message so it persists immediately
        try {
          if (finalContent.trim() && context.conversationId) {
            queryClient.setQueryData<AdvancedMessage[] | undefined>(['messages', context.conversationId], (old) => {
              const existing = old || [];
              const tempId = `temp-${event.responseId || crypto.randomUUID()}`;
              // Avoid duplicating if already present
              if (existing.some(m => m.id === tempId)) return existing;
              return [
                ...existing,
                {
                  id: tempId,
                  role: 'assistant',
                  content: finalContent.trim(),
                  created_at: new Date().toISOString(),
                  metadata: {
                    tokens: event.usage,
                    responseId: event.responseId,
                    isPersisted: false, // Will be updated when response_saved is received
                    safetyFinalization: event.safetyFinalization
                  }
                } as AdvancedMessage
              ];
            });

            // Set up fallback timeout for client-side persistence (only if no response_saved yet)
            setTimeout(async () => {
              console.log('Primary fallback: checking if Edge Function saved the message...');
              try {
                // Check if already saved by looking for response_id in DB
                let existingMessage = null;
                if (event.responseId) {
                  const { data } = await supabase
                    .from('messages')
                    .select('id')
                    .eq('response_id', event.responseId)
                    .eq('conversation_id', context.conversationId)
                    .single();
                  existingMessage = data;
                }

                if (!existingMessage && finalContent.trim()) {
                  // Save from client as fallback
                  const { data: fallbackMessage, error: fallbackError } = await supabase
                    .from('messages')
                    .insert({
                      conversation_id: context.conversationId,
                      role: 'assistant',
                      content: finalContent.trim(),
                      response_id: event.responseId || null,
                      metadata: {
                        tokens: event.usage,
                        reasoningSummary: context.accumulatedReasoning || undefined,
                        fallbackSave: true
                      }
                    })
                    .select()
                    .single();

                  if (!fallbackError && fallbackMessage) {
                    console.log('Primary fallback save successful:', fallbackMessage.id);
                    
                    // Update conversation metadata
                    const { data: currentConversation } = await supabase
                      .from('conversations')
                      .select('metadata')
                      .eq('id', context.conversationId)
                      .single();

                    const existingMetadata = (currentConversation?.metadata as any) || {};
                    await supabase
                      .from('conversations')
                      .update({
                        metadata: {
                          ...existingMetadata,
                          responseId: event.responseId,
                          lastResponseAt: new Date().toISOString()
                        }
                      })
                      .eq('id', context.conversationId);

                    queryClient.invalidateQueries({ queryKey: ['messages', context.conversationId] });
                  } else {
                    console.error('Primary fallback save failed:', fallbackError);
                  }
                } else if (existingMessage) {
                  console.log('Message already persisted by Edge Function:', existingMessage.id);
                }
              } catch (error) {
                console.error('Primary fallback error:', error);
              }
            }, 3000); // Wait 3 seconds for response_saved
          }
        } catch (error) {
          console.error('Error setting optimistic message:', error);
        }

        // Final cleanup
        setTimeout(() => {
          setStreamingState(prev => ({
            ...prev,
            isStreaming: false,
            streamingMessage: '',
            reasoningText: '',
            functionCalls: [],
            progress: undefined
          }));
        }, 1000);
        break;

      case 'db_error':
        console.error('Database error from edge function:', event.details);
        // The fallback will kick in after timeout, no need to do anything special here
        break;

      case 'stream_error':
        console.error('Stream error:', event.error);
        if (event.recoverable) {
          // Implement retry logic for recoverable errors
          toast({
            title: "Temporary Error",
            description: "Retrying...",
            variant: "default",
          });
        } else {
          toast({
            title: "Error",
            description: event.error || "An error occurred",
            variant: "destructive",
          });
        }
        break;

      // Handle legacy events for backward compatibility
      case 'processing':
        setStreamingState(prev => ({
          ...prev,
          progress: { type: 'reasoning', status: 'Processing request...' }
        }));
        break;

      case 'image_preview':
        setStreamingState(prev => ({
          ...prev,
          images: [...prev.images, event.previewUrl],
          progress: { 
            type: 'image', 
            status: 'Generating image...', 
            percentage: event.progress 
          }
        }));
        break;

      default:
        console.log('Unhandled Responses API event:', event);
    }
  };

  // File upload functionality
  // Uses Edge Function to upload to OpenAI Files API securely
  // Returns both fileIds and the conversationId used (to avoid race conditions)
  const uploadFiles = async (files: File[]): Promise<{ fileIds: string[]; conversationId: string | null }> => {
    const fileIds: string[] = [];

    // Import utilities at runtime to avoid circular dependencies
    const { uploadFileToOpenAI, validateFile } = await import('@/utils/fileUpload');

    // Get session for auth token
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;

    if (!token) {
      const authError = new Error('You must be signed in to upload files');
      toast({
        title: "Authentication Error",
        description: authError.message,
        variant: "destructive",
      });
      // Throw instead of returning empty - prevents message being sent without intended attachments
      throw authError;
    }

    // Get Supabase URL from environment (no hardcoded fallbacks for security)
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

    if (!supabaseUrl) {
      const configError = new Error('Supabase URL not configured');
      toast({
        title: "Configuration Error",
        description: "Supabase environment variables not configured",
        variant: "destructive",
      });
      // Throw instead of returning empty - prevents message being sent without intended attachments
      throw configError;
    }

    // Create conversation if none exists (files must belong to a conversation)
    let conversationId = currentConversationId;
    if (!conversationId) {
      try {
        const conversation = await createConversationMutation.mutateAsync('New Conversation');
        conversationId = conversation.id;
        // Also update state for UI consistency
        setCurrentConversationId(conversationId);
      } catch (error) {
        console.error('Failed to create conversation for file upload:', error);
        toast({
          title: "Error",
          description: "Failed to create conversation for file upload",
          variant: "destructive",
        });
        return { fileIds: [], conversationId: null };
      }
    }

    const failedFiles: string[] = [];

    for (const file of files) {
      // Client-side validation first - fail fast to save bandwidth
      const validation = validateFile(file);
      if (!validation.isValid) {
        failedFiles.push(file.name);
        toast({
          title: "Validation Error",
          description: `${file.name}: ${validation.error}`,
          variant: "destructive",
        });
        continue; // Skip invalid files
      }

      try {
        // Upload to OpenAI via Edge Function
        const openaiFileId = await uploadFileToOpenAI(
          file,
          conversationId,
          token,
          supabaseUrl
        );

        fileIds.push(openaiFileId);
      } catch (error) {
        console.error('File upload error:', error);
        failedFiles.push(file.name);
        toast({
          title: "Upload Error",
          description: `Failed to upload ${file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`,
          variant: "destructive",
        });
      }
    }

    // Show explicit warning if some files failed but others succeeded
    if (failedFiles.length > 0 && fileIds.length > 0) {
      toast({
        title: "Partial Upload",
        description: `${fileIds.length} of ${files.length} files uploaded. Failed: ${failedFiles.join(', ')}. Your message will only include the successfully uploaded files.`,
        variant: "destructive",
      });
    }

    // If ALL files failed, return empty to prevent sending message without attachments
    if (failedFiles.length === files.length) {
      toast({
        title: "All Uploads Failed",
        description: "No files were uploaded. Please try again or send your message without attachments.",
        variant: "destructive",
      });
      return { fileIds: [], conversationId };
    }

    // Return both fileIds and conversationId to avoid race conditions
    return { fileIds, conversationId };
  };

  // Utility functions
  const startNewConversation = useCallback(() => {
    setCurrentConversationId(null);
    setStreamingState(prev => ({ 
      ...prev, 
      streamingMessage: '', 
      reasoningText: '',
      functionCalls: [],
      images: []
    }));
    setPatientContext(null);
    setUploadedFiles([]);
  }, []);

  const selectConversation = useCallback((id: string) => {
    setCurrentConversationId(id);
    setStreamingState(prev => ({ 
      ...prev, 
      streamingMessage: '', 
      reasoningText: '',
      functionCalls: [],
      images: []
    }));
  }, []);

  const stopStreaming = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setStreamingState(prev => ({ ...prev, isStreaming: false, streamingMessage: '' }));
    }
  }, []);

  const toggleReasoning = useCallback(() => {
    setStreamingState(prev => ({ ...prev, showReasoning: !prev.showReasoning }));
  }, []);

  const startBackgroundTask = useCallback(async (
    taskType: 'medical_research' | 'drug_interaction' | 'diagnosis_analysis',
    input: string
  ) => {
    await sendMessageMutation.mutateAsync({
      message: input,
      taskType,
      options: { reasoningEffort: 'high' }
    });
  }, [sendMessageMutation]);

  const deleteConversation = useCallback((conversationId: string) => {
    deleteConversationMutation.mutate(conversationId);
  }, [deleteConversationMutation]);

  // Real-time subscriptions
  useEffect(() => {
    if (!currentConversationId || !user) return;

    const channel = supabase
      .channel(`conversation:${currentConversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${currentConversationId}`,
        },
        (payload) => {
          queryClient.invalidateQueries({ queryKey: ['messages', currentConversationId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentConversationId, user, queryClient]);

  return {
    // Core data
    conversations,
    messages,
    currentConversationId,
    patientContext,
    uploadedFiles,
    
    // Streaming state
    streamingState,
    
    // Background tasks
    backgroundTasks,
    
    // Loading states
    conversationsLoading,
    messagesLoading,
    isSendingMessage: sendMessageMutation.isPending,
    
    // Actions
    sendMessage: sendMessageMutation.mutate,
    startNewConversation,
    selectConversation,
    stopStreaming,
    toggleReasoning,
    startBackgroundTask,
    uploadFiles,
    deleteConversation,
    
    // Setters
    setPatientContext,
    setUploadedFiles,
  };
};