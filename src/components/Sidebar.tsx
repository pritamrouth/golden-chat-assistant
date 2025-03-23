
import React, { useState } from 'react';
import { useChat, Conversation } from '../context/ChatContext';
import { ThemeToggle } from './ThemeToggle';
import { ChevronLeft, Plus, MessageSquare } from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { conversations, startNewConversation, setCurrentConversation, currentConversation } = useChat();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const messageDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    
    if (messageDate.getTime() === today.getTime()) {
      return 'Today';
    }
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (messageDate.getTime() === yesterday.getTime()) {
      return 'Yesterday';
    }
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  return (
    <div 
      className={`fixed top-0 left-0 h-full transition-all duration-300 ease-in-out z-20
        ${isCollapsed 
          ? 'w-16 shadow-none' 
          : 'w-80 shadow-xl'}`}
    >
      <div className="h-full flex flex-col bg-sidebar backdrop-blur-md border-r border-border">
        {/* Sidebar header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          {!isCollapsed && (
            <h2 className="text-xl font-semibold gold-text">Shopping Assistant</h2>
          )}
          <button 
            onClick={toggleSidebar}
            className="p-2 rounded-full bg-secondary/50 hover:bg-secondary/80 transition-colors gold-focus"
          >
            <ChevronLeft 
              className={`h-5 w-5 transition-transform ${isCollapsed ? 'rotate-180' : ''}`} 
            />
          </button>
        </div>
        
        {/* New chat button */}
        <div className="p-4">
          <button
            onClick={startNewConversation}
            className={`gold-gradient text-white font-medium rounded-lg transition-all duration-200
              hover:shadow-md hover:brightness-110 gold-focus
              ${isCollapsed ? 'w-full p-2 justify-center' : 'w-full p-3 justify-between'}`}
          >
            <div className="flex items-center">
              <Plus className="h-5 w-5" />
              {!isCollapsed && <span className="ml-2">New Chat</span>}
            </div>
          </button>
        </div>
        
        {/* Conversation list */}
        {!isCollapsed && (
          <div className="flex-grow overflow-y-auto py-2">
            {conversations.map((conversation) => (
              <button
                key={conversation.id}
                onClick={() => setCurrentConversation(conversation.id)}
                className={`w-full p-3 flex items-center text-left transition-colors mb-1 hover:bg-accent/20
                  ${currentConversation?.id === conversation.id ? 'bg-accent/30' : ''}`}
              >
                <MessageSquare className="h-5 w-5 mr-3 flex-shrink-0" />
                <div className="truncate flex-grow">
                  <p className="truncate font-medium">{conversation.title}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {formatDate(conversation.lastMessageTime)}
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
        
        {/* Sidebar footer */}
        <div className="p-4 border-t border-border flex items-center justify-center">
          <ThemeToggle />
        </div>
      </div>
    </div>
  );
};
