'use client';

import { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  MessageCircle, 
  Send, 
  Bot,
  User,
  Minimize2,
  Maximize2,
  X
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface SupportMessage {
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

export function SupportChat() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;

    // Initialize socket connection
    fetch('/api/socketio').finally(() => {});
    const socket = io({ path: '/api/socketio' });
    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
      socket.emit('join', { userId: user.id });
    });

    socket.on('support-message', (data: SupportMessage) => {
      if (data.userId === user.id) {
        setMessages(prev => [...prev, data]);
      }
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    // Load existing support messages
    loadSupportMessages();

    return () => {
      socket.disconnect();
    };
  }, [user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadSupportMessages = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/admin/support');
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data.messages)) {
          // Filter messages for this user
          const userMessages = data.messages.filter((msg: SupportMessage) => msg.userId === user?.id);
          setMessages(userMessages.reverse()); // Reverse to show oldest first
        }
      }
    } catch (error) {
      console.error('Failed to load support messages:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !user) return;

    const message = {
      id: Date.now().toString(),
      userId: user.id,
      message: newMessage.trim(),
      isAdmin: false,
      createdAt: new Date().toISOString(),
      user: {
        name: user.name || 'User',
        email: user.email || ''
      }
    };

    // Add to local state immediately
    setMessages(prev => [...prev, message]);

    // Send to server
    if (socketRef.current && isConnected) {
      socketRef.current.emit('support-message', { ...message, type: 'support' });
    }

    // Also save to database
    try {
      await fetch('/api/admin/support', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          userId: user.id,
          message: newMessage.trim()
        })
      });
    } catch (error) {
      console.error('Failed to save support message:', error);
    }

    setNewMessage('');
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

  if (!user || user.isAdmin) return null;

  return (
    <>
      {/* Support Chat Button */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-4 right-4 z-50 professional-button shadow-lg"
          size="lg"
        >
          <MessageCircle className="w-5 h-5 mr-2" />
          Support Chat
        </Button>
      )}

      {/* Support Chat Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="clean-card w-full max-w-2xl h-[600px] flex flex-col">
            <CardHeader className="pb-3 flex-shrink-0">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center text-lg text-white professional-heading">
                  <div className="w-6 h-6 mr-2 bg-white rounded-lg flex items-center justify-center">
                    <MessageCircle className="w-4 h-4 text-black" />
                  </div>
                  Support Chat
                  {isConnected && (
                    <div className="ml-2 flex items-center space-x-1">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-xs text-green-400">Online</span>
                    </div>
                  )}
                </CardTitle>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsMinimized(!isMinimized)}
                    className="text-white hover:bg-white/10"
                  >
                    {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsOpen(false)}
                    className="text-white hover:bg-white/10"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            {!isMinimized && (
              <CardContent className="flex-1 flex flex-col p-0">
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {isLoading ? (
                    <div className="text-center py-8 text-gray-400">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                      <p className="text-sm">Loading messages...</p>
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                      <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">No messages yet. Start the conversation!</p>
                      <p className="text-xs mt-1">Our support team will respond as soon as possible.</p>
                    </div>
                  ) : (
                    messages.map((msg) => (
                      <div key={msg.id} className={`flex items-start space-x-3 ${msg.isAdmin ? 'justify-end' : 'justify-start'}`}>
                        {!msg.isAdmin && (
                          <Avatar className="h-8 w-8 flex-shrink-0">
                            <AvatarFallback className="text-xs bg-white/10 text-white">
                              <User className="w-4 h-4" />
                            </AvatarFallback>
                          </Avatar>
                        )}
                        <div className={`max-w-[70%] ${msg.isAdmin ? 'order-first' : ''}`}>
                          <div className={`p-3 rounded-lg ${
                            msg.isAdmin 
                              ? 'bg-blue-500/20 border border-blue-500/30' 
                              : 'bg-white/5 border border-white/10'
                          }`}>
                            <div className="flex items-center space-x-2 mb-1">
                              <span className="text-sm font-medium text-white">
                                {msg.isAdmin ? 'Support Team' : 'You'}
                              </span>
                              <Badge variant={msg.isAdmin ? 'secondary' : 'default'} className="text-xs">
                                {msg.isAdmin ? 'Admin' : 'User'}
                              </Badge>
                              <span className="text-xs text-gray-400">
                                {formatTime(msg.createdAt)}
                              </span>
                            </div>
                            <p className="text-sm text-gray-300 break-words">
                              {msg.message}
                            </p>
                          </div>
                        </div>
                        {msg.isAdmin && (
                          <Avatar className="h-8 w-8 flex-shrink-0">
                            <AvatarFallback className="text-xs bg-blue-500/20 text-blue-400">
                              <Bot className="w-4 h-4" />
                            </AvatarFallback>
                          </Avatar>
                        )}
                      </div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="p-4 border-t border-white/10 flex-shrink-0">
                  <div className="flex space-x-2">
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder={isConnected ? "Type your message..." : "Type your message (offline mode)..."}
                      className="flex-1 bg-white/5 border-white/20 text-white placeholder:text-white/40"
                      disabled={!isConnected}
                    />
                    <Button
                      onClick={sendMessage}
                      disabled={!newMessage.trim() || !isConnected}
                      className="professional-button"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                  {!isConnected && (
                    <p className="text-xs text-yellow-400 mt-2">
                      Chat server offline - messages will be saved when connection is restored
                    </p>
                  )}
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      )}
    </>
  );
}
