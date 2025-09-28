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
      taskType?: 'medical_research' | 'drug_interaction' | 'diagnosis_analysis';
      options?: {
        reasoningEffort?: 'low' | 'medium' | 'high';
        includeReasoningSummary?: boolean;
        maxTokens?: number;
      };
    }) => {
      if (!user) throw new Error('User not authenticated');
      
      let conversationIdToUse = currentConversationId;
      
      // Create conversation if none exists
      if (!conversationIdToUse) {
        const conversation = await createConversationMutation.mutateAsync('New Conversation');
        conversationIdToUse = conversation.id;
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

      // Handle background tasks
      if (taskType) {
        const response = await fetch(`https://pgypyipdmrhrutegapsx.supabase.co/functions/v1/pediatric-ai-chat`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBneXB5aXBkbXJocnV0ZWdhcHN4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkwMTQzNDcsImV4cCI6MjA3NDU5MDM0N30.nJivPOj9ygfDFJZ6xyVFYTeM1-BUsTy7MaOUvtF882E'
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
      const response = await fetch(`https://pgypyipdmrhrutegapsx.supabase.co/functions/v1/pediatric-ai-chat`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBneXB5aXBkbXJocnV0ZWdhcHN4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkwMTQzNDcsImV4cCI6MjA3NDU5MDM0N30.nJivPOj9ygfDFJZ6xyVFYTeM1-BUsTy7MaOUvtF882E'
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
                setAccumulatedContent: (content: string) => { accumulatedContent = content; },
                setAccumulatedReasoning: (reasoning: string) => { accumulatedReasoning = reasoning; }
              });
            } catch (parseError) {
              console.error('Error parsing streaming data:', parseError);
            }
          }
        }
      }
    } finally {
      // Don't clear streaming message here - let response_complete handle it
      
      // Invalidate queries to refresh messages
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

      case 'response_complete':
        // Keep message visible during database save
        setStreamingState(prev => ({
          ...prev,
          progress: { type: 'text', status: 'Saving message...' }
        }));
        
        // Store the response for potential fallback
        const finalContent = event.content || context.accumulatedContent || '';
        let fallbackTimeout: NodeJS.Timeout | null = null;
        
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
                    isPersisted: false // Mark as not yet persisted
                  }
                } as AdvancedMessage
              ];
            });

            // Set up fallback timeout for client-side persistence
            fallbackTimeout = setTimeout(async () => {
              console.log('Fallback: Edge function did not confirm save, persisting from client...');
              try {
                // Check if already saved by looking for response_id in DB
                const { data: existingMessage } = await supabase
                  .from('messages')
                  .select('id')
                  .eq('response_id', event.responseId)
                  .eq('conversation_id', context.conversationId)
                  .single();

                if (!existingMessage && finalContent.trim()) {
                  // Save from client as fallback
                  const { data: fallbackMessage, error: fallbackError } = await supabase
                    .from('messages')
                    .insert({
                      conversation_id: context.conversationId,
                      role: 'assistant',
                      content: finalContent.trim(),
                      response_id: event.responseId,
                      metadata: {
                        tokens: event.usage,
                        reasoningSummary: context.accumulatedReasoning || undefined,
                        fallbackSave: true
                      }
                    })
                    .select()
                    .single();

                  if (fallbackError) {
                    console.error('Fallback save failed:', fallbackError);
                  } else {
                    console.log('Fallback save successful:', fallbackMessage.id);
                    
                    // Update conversation metadata
                    await supabase
                      .from('conversations')
                      .update({
                        metadata: {
                          responseId: event.responseId,
                          lastResponseAt: new Date().toISOString()
                        }
                      })
                      .eq('id', context.conversationId);

                    // Update the optimistic message to mark as persisted
                    queryClient.setQueryData<AdvancedMessage[] | undefined>(['messages', context.conversationId], (old) => {
                      return (old || []).map(msg => 
                        msg.metadata?.responseId === event.responseId
                          ? { ...msg, id: fallbackMessage.id, metadata: { ...msg.metadata, isPersisted: true } }
                          : msg
                      );
                    });
                  }
                }
              } catch (fallbackErr) {
                console.error('Fallback persistence error:', fallbackErr);
              }
            }, 2000); // 2 second timeout for fallback
          }
        } catch (e) {
          console.warn('Optimistic update failed:', e);
        }
        
        // Enhanced token usage logging for Responses API
        if (event.usage) {
          console.log('Token usage:', event.usage);
          if (event.reasoningTokens) {
            console.log('Reasoning tokens:', event.reasoningTokens);
          }
          
          // Show reasoning token usage to user if significant
          if (event.reasoningTokens && event.reasoningTokens > 1000) {
            toast({
              title: "Complex Analysis Completed",
              description: `Used ${event.reasoningTokens} reasoning tokens for thorough analysis`,
              variant: "default",
            });
          }
        }

        // Display response ID for debugging
        if (event.responseId) {
          console.log('Response ID for conversation continuity:', event.responseId);
        }

        // Clear streaming state after a short delay
        setTimeout(() => {
          setStreamingState(prev => ({
            ...prev,
            isStreaming: false,
            streamingMessage: '',
            progress: { type: 'text', status: 'Complete' }
          }));
        }, 600);
        break;

      case 'response_saved':
        console.log('Edge function confirmed message saved:', event.messageId);
        // Clear any pending fallback timeout since save was confirmed
        // Update optimistic message to mark as persisted and use real ID
        queryClient.setQueryData<AdvancedMessage[] | undefined>(['messages', context.conversationId], (old) => {
          return (old || []).map(msg => 
            msg.metadata?.responseId === event.responseId
              ? { ...msg, id: event.messageId, metadata: { ...msg.metadata, isPersisted: true } }
              : msg
          );
        });
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
  const uploadFiles = async (files: File[]): Promise<string[]> => {
    const fileIds: string[] = [];
    
    for (const file of files) {
      try {
        // Upload to Supabase storage
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const filePath = `${user?.id}/${fileName}`;

        const { data, error } = await supabase.storage
          .from('documents')
          .upload(filePath, file);

        if (error) throw error;

        // Store file metadata
        const { data: fileRecord, error: dbError } = await supabase
          .from('conversation_files')
          .insert({
            conversation_id: currentConversationId,
            filename: file.name,
            content_type: file.type,
            size_bytes: file.size,
            openai_file_id: data.path // Using storage path as file ID
          })
          .select()
          .single();

        if (dbError) throw dbError;

        fileIds.push(fileRecord.openai_file_id);
      } catch (error) {
        console.error('File upload error:', error);
        toast({
          title: "Upload Error",
          description: `Failed to upload ${file.name}`,
          variant: "destructive",
        });
      }
    }

    return fileIds;
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
    
    // Setters
    setPatientContext,
    setUploadedFiles,
  };
};