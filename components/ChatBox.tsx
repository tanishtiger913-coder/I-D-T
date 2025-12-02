import React, { useState, useEffect, useRef } from 'react';
import { mockDb } from '../services/mockDb';
import { ChatMessage, UserRole } from '../types';
import { Send, Smile } from 'lucide-react';

interface ChatBoxProps {
  groupId: string;
  currentUserId: string;
  currentUserName: string;
  currentUserRole: UserRole;
  className?: string;
}

export const ChatBox: React.FC<ChatBoxProps> = ({ groupId, currentUserId, currentUserName, currentUserRole, className }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const endRef = useRef<HTMLDivElement>(null);

  const fetchMessages = () => {
    const msgs = mockDb.getGroupChat(groupId);
    setMessages(msgs);
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 2000);
    return () => clearInterval(interval);
  }, [groupId]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    
    mockDb.sendMessage(groupId, currentUserId, currentUserName, newMessage);
    setNewMessage('');
    fetchMessages();
  };

  return (
    <div className={`flex flex-col bg-white border border-gray-200 rounded-2xl overflow-hidden ${className}`}>
      <div className="bg-white border-b border-gray-100 p-4 shadow-sm z-10">
        <div className="flex items-center space-x-2">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
            <h3 className="font-semibold text-gray-800">Team Chat</h3>
        </div>
      </div>
      
      <div className="flex-grow overflow-y-auto p-4 space-y-4 bg-gray-50/50 min-h-[300px]">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 space-y-2 py-10">
            <Smile className="h-10 w-10 opacity-20" />
            <p className="text-sm">No messages yet. Say hello!</p>
          </div>
        )}
        {messages.map((msg, index) => {
          const isMe = msg.userId === currentUserId;
          const isSequence = index > 0 && messages[index - 1].userId === msg.userId;

          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              {!isMe && !isSequence && (
                  <div className="h-8 w-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold mr-2 mt-1 shadow-sm shrink-0">
                      {msg.userName.charAt(0)}
                  </div>
              )}
              {!isMe && isSequence && <div className="w-10" />} 
              
              <div className={`max-w-[85%] ${isMe ? 'items-end' : 'items-start'} flex flex-col`}>
                 {!isMe && !isSequence && (
                     <span className="text-[10px] text-gray-500 ml-1 mb-1">{msg.userName}</span>
                 )}
                 <div className={`px-4 py-2 shadow-sm break-words text-sm ${
                     isMe 
                     ? 'bg-primary text-white rounded-2xl rounded-tr-sm' 
                     : 'bg-white text-gray-800 border border-gray-100 rounded-2xl rounded-tl-sm'
                 }`}>
                    <p className="leading-relaxed">{msg.message}</p>
                 </div>
                 <span className={`text-[10px] mt-1 ${isMe ? 'text-gray-400 mr-1' : 'text-gray-400 ml-1'}`}>
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                 </span>
              </div>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>

      <form onSubmit={handleSend} className="p-3 bg-white border-t border-gray-100">
        <div className="relative flex items-center">
            <input
            type="text"
            className="w-full pl-4 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-full text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder-gray-400"
            placeholder="Type message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            />
            <button 
            type="submit" 
            className="absolute right-2 p-2 bg-primary text-white rounded-full hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!newMessage.trim()}
            >
            <Send className="h-4 w-4" />
            </button>
        </div>
      </form>
    </div>
  );
};