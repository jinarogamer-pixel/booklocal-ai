import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { 
  ChatMessage, 
  sendMessage, 
  getMessages, 
  subscribeToMessages, 
  uploadMessageFile,
  setTypingIndicator,
  subscribeToTyping
} from '../../lib/chat';

interface ChatWidgetProps {
  conversationId: string;
  providerId: string;
  clientId: string;
}

// Extend the session user type to include id
interface ExtendedUser {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
}

interface ExtendedSession {
  user: ExtendedUser;
}

export default function ChatWidget({ conversationId, providerId, clientId }: ChatWidgetProps) {
  const { data: session } = useSession();
  const extendedSession = session as ExtendedSession | null;
  
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (!extendedSession?.user?.id) return;

    // Load initial messages
    const loadMessages = async () => {
      try {
        const initialMessages = await getMessages(conversationId);
        setMessages(initialMessages);
      } catch (error) {
        console.error('Failed to load messages:', error);
      }
    };

    loadMessages();

    // Subscribe to new messages
    const messageChannel = subscribeToMessages(
      conversationId,
      (message) => {
        setMessages(prev => [...prev, message]);
      },
      (error) => {
        console.error('Message subscription error:', error);
      }
    );

    // Subscribe to typing indicators
    const typingChannel = subscribeToTyping(
      conversationId,
      (userId, isTyping) => {
        if (userId !== extendedSession.user.id) {
          setTypingUsers(prev => {
            if (isTyping) {
              return prev.includes(userId) ? prev : [...prev, userId];
            } else {
              return prev.filter(id => id !== userId);
            }
          });
        }
      }
    );

    return () => {
      messageChannel.unsubscribe();
      typingChannel.unsubscribe();
    };
  }, [conversationId, extendedSession?.user?.id]);

  const handleSend = async () => {
    if (!input.trim() || !extendedSession?.user?.id || isLoading) return;

    const userId = extendedSession.user.id;
    const userName = extendedSession.user.name || extendedSession.user.email || 'Unknown User';
    const userType = userId === providerId ? 'provider' : 'client';

    setIsLoading(true);
    try {
      await sendMessage(
        conversationId,
        userId,
        userName,
        userType,
        input.trim(),
        'text'
      );
      setInput('');

      // Clear typing indicator
      await setTypingIndicator(conversationId, userId, false);
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !extendedSession?.user?.id) return;

    const userId = extendedSession.user.id;
    const userName = extendedSession.user.name || extendedSession.user.email || 'Unknown User';
    const userType = userId === providerId ? 'provider' : 'client';

    setUploadProgress(0);
    try {
      // Simulate upload progress
      const uploadTimer = setInterval(() => {
        setUploadProgress(prev => {
          if (prev === null || prev >= 90) return prev;
          return prev + 10;
        });
      }, 200);

      const fileUrl = await uploadMessageFile(conversationId, file);
      
      clearInterval(uploadTimer);
      setUploadProgress(100);

      // Send file message
      await sendMessage(
        conversationId,
        userId,
        userName,
        userType,
        file.name,
        'file'
      );

      setTimeout(() => setUploadProgress(null), 500);
    } catch (error) {
      console.error('Failed to upload file:', error);
      setUploadProgress(null);
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleInputChange = async (value: string) => {
    setInput(value);

    if (!extendedSession?.user?.id) return;

    const userId = extendedSession.user.id;

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set typing indicator
    if (value.trim()) {
      await setTypingIndicator(conversationId, userId, true);
      
      // Clear typing after 2 seconds of no typing
      typingTimeoutRef.current = setTimeout(async () => {
        await setTypingIndicator(conversationId, userId, false);
      }, 2000);
    } else {
      await setTypingIndicator(conversationId, userId, false);
    }
  };

  const formatMessageTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const isCurrentUser = (senderId: string) => {
    return extendedSession?.user?.id === senderId;
  };

  return (
    <div className="glass-card" style={{ maxWidth: 420, margin: '2rem auto', height: '600px', display: 'flex', flexDirection: 'column' }}>
      {/* Chat Header */}
      <div style={{ padding: '1rem', borderBottom: '1px solid #e5e7eb', background: 'rgba(255, 255, 255, 0.1)' }}>
        <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '600' }}>
          Chat with {extendedSession?.user?.id === providerId ? 'Client' : 'Provider'}
        </h3>
        {typingUsers.length > 0 && (
          <div style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '0.25rem' }}>
            {typingUsers.length === 1 ? 'Someone is' : `${typingUsers.length} people are`} typing...
          </div>
        )}
      </div>

      {/* Messages Container */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', minHeight: 0 }}>
        {messages.map((message) => (
          <div
            key={message.id}
            style={{
              display: 'flex',
              justifyContent: isCurrentUser(message.sender_id) ? 'flex-end' : 'flex-start',
              marginBottom: '1rem'
            }}
          >
            <div
              style={{
                maxWidth: '70%',
                background: isCurrentUser(message.sender_id) ? '#3b82f6' : '#f3f4f6',
                color: isCurrentUser(message.sender_id) ? 'white' : '#1f2937',
                borderRadius: '1rem',
                padding: '0.75rem 1rem',
                position: 'relative'
              }}
            >
              {message.message_type === 'file' ? (
                <div>
                  <div style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>📎 File attachment</div>
                  <div
                    style={{
                      color: isCurrentUser(message.sender_id) ? '#dbeafe' : '#3b82f6',
                      textDecoration: 'underline',
                      cursor: 'pointer'
                    }}
                    onClick={() => {
                      // For now, we'll just show the filename since we need to implement file URL handling
                      alert(`File: ${message.message}`);
                    }}
                  >
                    {message.message}
                  </div>
                </div>
              ) : (
                <div>{message.message}</div>
              )}
              <div
                style={{
                  fontSize: '0.7rem',
                  opacity: 0.7,
                  marginTop: '0.25rem',
                  textAlign: 'right'
                }}
              >
                {formatMessageTime(message.created_at)}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Upload Progress */}
      {uploadProgress !== null && (
        <div style={{ padding: '0.5rem 1rem', background: 'rgba(59, 130, 246, 0.1)' }}>
          <div style={{ fontSize: '0.8rem', marginBottom: '0.25rem' }}>Uploading file...</div>
          <div style={{ width: '100%', height: '4px', background: '#e5e7eb', borderRadius: '2px', overflow: 'hidden' }}>
            <div
              style={{
                width: `${uploadProgress}%`,
                height: '100%',
                background: '#3b82f6',
                transition: 'width 0.3s ease'
              }}
            />
          </div>
        </div>
      )}

      {/* Input Area */}
      <div style={{ padding: '1rem', borderTop: '1px solid #e5e7eb' }}>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileUpload}
            style={{ display: 'none' }}
            accept="image/*,.pdf,.doc,.docx,.txt"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            style={{
              padding: '0.5rem',
              border: '1px solid #d1d5db',
              borderRadius: '0.5rem',
              background: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title="Attach file"
          >
            📎
          </button>
          <input
            value={input}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder="Type a message..."
            style={{
              flex: 1,
              borderRadius: '0.5rem',
              border: '1px solid #d1d5db',
              padding: '0.75rem 1rem',
              fontSize: '0.9rem'
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            disabled={isLoading}
          />
          <button
            className="btn-primary"
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            style={{
              borderRadius: '0.5rem',
              padding: '0.75rem 1.5rem',
              opacity: (!input.trim() || isLoading) ? 0.5 : 1,
              cursor: (!input.trim() || isLoading) ? 'not-allowed' : 'pointer'
            }}
          >
            {isLoading ? '...' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  );
}
