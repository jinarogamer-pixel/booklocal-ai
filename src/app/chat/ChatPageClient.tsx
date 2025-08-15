"use client";
import { useState, useEffect, useRef } from 'react';
import { createClient } from '@/utils/supabase/client';
import { captureError, addBreadcrumb } from '@/lib/errorMonitoring';
import type { User } from '@supabase/supabase-js';

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

interface Conversation {
  id: string;
  title: string;
  lastMessage: string;
  updatedAt: Date;
}

interface DatabaseConversation {
  id: string;
  title: string;
  last_message: string;
  updated_at: string;
}

interface DatabaseMessage {
  id: string;
  content: string;
  is_user: boolean;
  created_at: string;
}

export default function ChatPageClient() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionUser, setSessionUser] = useState<User | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();

  // Initialize user session
  useEffect(() => {
    const initializeSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          captureError(new Error(`Session error: ${error.message}`));
          return;
        }
        setSessionUser(session?.user || null);
        if (session?.user) {
          await loadConversations();
        }
      } catch (error) {
        captureError(error instanceof Error ? error : new Error('Session initialization failed'));
      }
    };

    initializeSession();
  }, []);

  // Load conversations
  const loadConversations = async () => {
    try {
      addBreadcrumb('Loading conversations');
      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) {
        captureError(new Error(`Failed to load conversations: ${error.message}`));
        return;
      }

      if (data) {
        const formattedConversations: Conversation[] = data.map((conv: DatabaseConversation) => ({
          id: conv.id,
          title: conv.title || 'New Conversation',
          lastMessage: conv.last_message || '',
          updatedAt: new Date(conv.updated_at)
        }));
        setConversations(formattedConversations);
      }
    } catch (error) {
      captureError(error instanceof Error ? error : new Error('Failed to load conversations'));
    }
  };

  // Load messages for a conversation
  const loadMessages = async (conversationId: string) => {
    try {
      addBreadcrumb('Loading messages');
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) {
        captureError(new Error(`Failed to load messages: ${error.message}`));
        return;
      }

      if (data) {
        const formattedMessages: Message[] = data.map((msg: DatabaseMessage) => ({
          id: msg.id,
          content: msg.content,
          isUser: msg.is_user,
          timestamp: new Date(msg.created_at)
        }));
        setMessages(formattedMessages);
      }
    } catch (error) {
      captureError(error instanceof Error ? error : new Error('Failed to load messages'));
    }
  };

  // Create new conversation
  const createNewConversation = async () => {
    if (!sessionUser) return;

    try {
      const { data, error } = await supabase
        .from('conversations')
        .insert([{
          title: 'New Conversation',
          user_id: sessionUser.id
        }])
        .select()
        .single();

      if (error) {
        captureError(new Error(`Failed to create conversation: ${error.message}`));
        return;
      }

      if (data) {
        setCurrentConversationId(data.id);
        setMessages([]);
        await loadConversations();
      }
    } catch (error) {
      captureError(error instanceof Error ? error : new Error('Failed to create conversation'));
    }
  };

  // Send message
  const sendMessage = async () => {
    if (!inputMessage.trim() || !currentConversationId || !sessionUser) return;

    setIsLoading(true);
    try {
      // Add user message
      const userMessage: Message = {
        id: Date.now().toString(),
        content: inputMessage,
        isUser: true,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, userMessage]);
      setInputMessage('');

      // Save user message to database
      await supabase
        .from('messages')
        .insert([{
          conversation_id: currentConversationId,
          content: inputMessage,
          is_user: true,
          user_id: sessionUser.id
        }]);

      // Simulate AI response (replace with actual AI integration)
      setTimeout(async () => {
        const aiResponse: Message = {
          id: (Date.now() + 1).toString(),
          content: `Thank you for your message: "${inputMessage}". This is a simulated AI response. In a real implementation, this would connect to your AI service.`,
          isUser: false,
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, aiResponse]);

        // Save AI response to database
        await supabase
          .from('messages')
          .insert([{
            conversation_id: currentConversationId,
            content: aiResponse.content,
            is_user: false,
            user_id: sessionUser.id
          }]);

        // Update conversation last message
        await supabase
          .from('conversations')
          .update({
            last_message: aiResponse.content,
            updated_at: new Date().toISOString()
          })
          .eq('id', currentConversationId);

        setIsLoading(false);
      }, 1000);

    } catch (error) {
      captureError(error instanceof Error ? error : new Error('Failed to send message'));
      setIsLoading(false);
    }
  };

  // Scroll to bottom of messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Handle conversation selection
  const selectConversation = (conversationId: string) => {
    setCurrentConversationId(conversationId);
    loadMessages(conversationId);
  };

  if (!sessionUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Please Sign In</h1>
          <p className="text-gray-600">You need to be signed in to use the chat feature.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-1/4 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <button
            onClick={createNewConversation}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
          >
            New Conversation
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {conversations.map((conversation) => (
            <div
              key={conversation.id}
              onClick={() => selectConversation(conversation.id)}
              className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                currentConversationId === conversation.id ? 'bg-blue-50 border-blue-200' : ''
              }`}
            >
              <h3 className="font-medium text-gray-900 truncate">{conversation.title}</h3>
              <p className="text-sm text-gray-600 truncate mt-1">{conversation.lastMessage}</p>
              <p className="text-xs text-gray-400 mt-1">
                {conversation.updatedAt.toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {currentConversationId ? (
          <>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.isUser
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-900'
                    }`}
                  >
                    <p>{message.content}</p>
                    <p className={`text-xs mt-1 ${
                      message.isUser ? 'text-blue-100' : 'text-gray-500'
                    }`}>
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-gray-200 text-gray-900 max-w-xs lg:max-w-md px-4 py-2 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                      <span>AI is typing...</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="border-t border-gray-200 p-4">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !isLoading && sendMessage()}
                  placeholder="Type your message..."
                  className="flex-1 border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={isLoading}
                />
                <button
                  onClick={sendMessage}
                  disabled={isLoading || !inputMessage.trim()}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-2 px-6 rounded-md transition-colors"
                >
                  Send
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Welcome to Chat</h2>
              <p className="text-gray-600">Select a conversation or create a new one to start chatting.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
