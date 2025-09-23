'use client';

import { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Send, 
  MessageCircle, 
  Users, 
  Bot,
  User,
  Minimize2,
  Maximize2
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface ChatMessage {
  id: string;
  userId: string;
  message: string;
  isAdmin: boolean;
  createdAt: string;
  user?: {
    name: string;
    email: string;
  };
}

export function Chat() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(0);
  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;
    // Ensure server is initialized (pages/api/socketio.ts will boot on first hit)
    fetch('/api/socketio').finally(() => {});
    const socket = io({ path: '/api/socketio' });
    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
      socket.emit('join', { userId: user.id });
    });

    socket.on('chat-message', (data: any) => {
      setMessages(prev => [...prev, data]);
    });

    socket.on('online-users', (count: number) => {
      setOnlineUsers(count);
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    // Listen for admin support replies
    socket.on('support-message', (payload: any) => {
      // if admin reply to this user, append
      if (payload?.userId === user.id) {
        setMessages(prev => [
          ...prev,
          {
            id: payload.id,
            userId: payload.userId,
            message: payload.message,
            isAdmin: !!payload.isAdmin,
            createdAt: payload.createdAt,
            user: { name: payload.user?.name || 'Admin', email: payload.user?.email || '' }
          }
        ]);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // removed old websocket connect

  const sendMessage = () => {
    if (newMessage.trim()) {
      const message = {
        id: Date.now().toString(),
        userId: user?.id || 'unknown',
        message: newMessage.trim(),
        isAdmin: user?.isAdmin || false,
        createdAt: new Date().toISOString(),
        user: {
          name: user?.name || 'User',
          email: user?.email || ''
        }
      };

      // emit to server
      if (socketRef.current && isConnected) {
        // Regular chat
        socketRef.current.emit('chat-message', message);
        // Support pipe
        socketRef.current.emit('support-message', { ...message, type: 'support' });
      } else {
        // fallback render
        setMessages(prev => [...prev, message]);
      }
      
      setNewMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!user) return null;

  return (
    <div className={`fixed bottom-4 right-4 z-50 ${isMinimized ? 'w-80' : 'w-96'}`}>
      <Card className="clean-card shadow-2xl">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center text-lg text-white professional-heading">
              <div className="w-6 h-6 mr-2 bg-white rounded-lg flex items-center justify-center">
                <MessageCircle className="w-4 h-4 text-black" />
              </div>
              Live Chat
              {isConnected && (
                <div className="ml-2 flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-xs text-green-400">{onlineUsers} online</span>
                </div>
              )}
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMinimized(!isMinimized)}
              className="text-white hover:bg-white/10"
            >
              {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
            </Button>
          </div>
        </CardHeader>

        {!isMinimized && (
          <CardContent className="p-0">
            {/* Messages */}
            <div className="h-80 overflow-y-auto p-4 space-y-3">
              {messages.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No messages yet. Start the conversation!</p>
                </div>
              ) : (
                messages.map((msg) => (
                  <div key={msg.id} className="flex items-start space-x-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs bg-white/10 text-white">
                        {msg.isAdmin ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="text-sm font-medium text-white">
                          {msg.isAdmin ? 'Admin' : msg.user?.name || 'User'}
                        </span>
                        <span className="text-xs text-gray-400">
                          {formatTime(msg.createdAt)}
                        </span>
                        {msg.isAdmin && (
                          <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded">
                            Admin
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-300 break-words">
                        {msg.message}
                      </p>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-white/10">
              <div className="flex space-x-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={isConnected ? "Type your message..." : "Type your message (offline mode)..."}
                  className="flex-1 bg-white/5 border-white/20 text-white placeholder:text-white/40"
                />
                <Button
                  onClick={sendMessage}
                  disabled={!newMessage.trim()}
                  className="professional-button"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
              {!isConnected && (
                <p className="text-xs text-yellow-400 mt-2">
                  Chat server offline - messages saved locally
                </p>
              )}
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
