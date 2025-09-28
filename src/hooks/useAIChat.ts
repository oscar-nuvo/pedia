import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  created_at: string;
  metadata?: any;
}

export interface Conversation {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  patient_id?: string;
  metadata?: any;
}

export const useAIChat = (conversationId?: string) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState('');
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(conversationId || null);
  const abortControllerRef = useRef<AbortController | null>(null);

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
      return data as Conversation[];
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
      return data as Message[];
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
        })
        .select()
        .single();
      
      if (error) throw error;
      return data as Conversation;
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

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async ({ message, fileIds = [] }: { message: string; fileIds?: string[] }) => {
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

      setIsStreaming(true);
      setStreamingMessage('');

      // Get the session for authentication
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No active session');

      const { data, error } = await supabase.functions.invoke('pediatric-ai-chat', {
        body: {
          message,
          conversationId: conversationIdToUse,
          fileIds,
        },
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        throw new Error(error.message || 'Failed to send message');
      }

      // Handle streaming response  
      const reader = data.getReader();
      let accumulatedContent = '';

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
                
                if (parsed.type === 'response.output_text.delta') {
                  accumulatedContent += parsed.delta;
                  setStreamingMessage(accumulatedContent);
                } else if (parsed.type === 'function_result') {
                  // Handle function call results
                  console.log('Function result:', parsed);
                } else if (parsed.type === 'response.done') {
                  console.log('Response completed');
                }
              } catch (parseError) {
                console.error('Error parsing streaming data:', parseError);
              }
            }
          }
        }
      } finally {
        setIsStreaming(false);
        setStreamingMessage('');
        
        // Invalidate queries to refresh messages
        queryClient.invalidateQueries({ queryKey: ['messages', conversationIdToUse] });
        queryClient.invalidateQueries({ queryKey: ['conversations'] });
      }

      return conversationIdToUse;
    },
    onError: (error) => {
      setIsStreaming(false);
      setStreamingMessage('');
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
      console.error('Error sending message:', error);
    },
  });

  // Set up real-time subscriptions
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
          console.log('New message received:', payload);
          queryClient.invalidateQueries({ queryKey: ['messages', currentConversationId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentConversationId, user, queryClient]);

  const startNewConversation = () => {
    setCurrentConversationId(null);
    setStreamingMessage('');
  };

  const selectConversation = (id: string) => {
    setCurrentConversationId(id);
    setStreamingMessage('');
  };

  const stopStreaming = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsStreaming(false);
      setStreamingMessage('');
    }
  };

  return {
    conversations,
    messages,
    currentConversationId,
    isStreaming,
    streamingMessage,
    conversationsLoading,
    messagesLoading,
    sendMessage: sendMessageMutation.mutate,
    isSendingMessage: sendMessageMutation.isPending,
    startNewConversation,
    selectConversation,
    stopStreaming,
  };
};