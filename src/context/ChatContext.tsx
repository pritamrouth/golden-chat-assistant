
import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  images?: string[];
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  lastMessageTime: Date;
}

interface ChatContextType {
  currentConversation: Conversation | null;
  conversations: Conversation[];
  isTyping: boolean;
  sendMessage: (content: string, images?: string[]) => void;
  startNewConversation: () => void;
  setCurrentConversation: (id: string) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [isTyping, setIsTyping] = useState(false);

  // Initialize with a default conversation
  useEffect(() => {
    if (conversations.length === 0) {
      const initialConversation: Conversation = {
        id: generateId(),
        title: 'New Conversation',
        messages: [],
        lastMessageTime: new Date()
      };
      
      setConversations([initialConversation]);
      setCurrentConversation(initialConversation);
    }
  }, [conversations.length]);

  const generateId = () => {
    return Math.random().toString(36).substring(2, 11);
  };

  const startNewConversation = () => {
    const newConversation: Conversation = {
      id: generateId(),
      title: 'New Conversation',
      messages: [],
      lastMessageTime: new Date()
    };
    
    setConversations(prevConversations => [...prevConversations, newConversation]);
    setCurrentConversation(newConversation);
  };

  const setConversationById = (id: string) => {
    const conversation = conversations.find(c => c.id === id);
    if (conversation) {
      setCurrentConversation(conversation);
    }
  };

  const sendMessage = async (content: string, images?: string[]) => {
    if (!currentConversation) return;
    
    // Add user message
    const userMessage: Message = {
      id: generateId(),
      content,
      role: 'user',
      timestamp: new Date(),
      images
    };
    
    // Update conversation with user message
    const updatedConversation = {
      ...currentConversation,
      messages: [...currentConversation.messages, userMessage],
      lastMessageTime: new Date()
    };
    
    // Update conversations
    setConversations(prevConversations => 
      prevConversations.map(c => 
        c.id === currentConversation.id ? updatedConversation : c
      )
    );
    setCurrentConversation(updatedConversation);
    
    // Show typing indicator
    setIsTyping(true);
    
    // Simulate assistant response (would be replaced with actual API call)
    setTimeout(() => {
      const assistantMessage: Message = {
        id: generateId(),
        content: getMockResponse(content),
        role: 'assistant',
        timestamp: new Date()
      };
      
      const conversationWithResponse = {
        ...updatedConversation,
        messages: [...updatedConversation.messages, assistantMessage],
        lastMessageTime: new Date()
      };
      
      // Title the conversation based on the first user message if it's new
      let finalConversation = conversationWithResponse;
      if (conversationWithResponse.messages.length === 2) {
        finalConversation = {
          ...conversationWithResponse,
          title: content.length > 20 ? `${content.substring(0, 20)}...` : content
        };
      }
      
      // Update conversations
      setConversations(prevConversations => 
        prevConversations.map(c => 
          c.id === currentConversation.id ? finalConversation : c
        )
      );
      setCurrentConversation(finalConversation);
      setIsTyping(false);
    }, 1500);
  };

  // Mock response generator (temporary)
  const getMockResponse = (userMessage: string): string => {
    const lowerCaseMessage = userMessage.toLowerCase();
    
    if (lowerCaseMessage.includes('hello') || lowerCaseMessage.includes('hi')) {
      return "Hello! I'm your shopping assistant. How can I help you today?";
    } else if (lowerCaseMessage.includes('product') || lowerCaseMessage.includes('item')) {
      return "I'd be happy to help you find the perfect product. Could you tell me more about what you're looking for?";
    } else if (lowerCaseMessage.includes('price') || lowerCaseMessage.includes('cost')) {
      return "Our products range in price depending on features and quality. What's your budget range?";
    } else if (lowerCaseMessage.includes('order') || lowerCaseMessage.includes('delivery')) {
      return "I can help you track your order or provide information about our delivery options. Could you provide more details?";
    } else if (lowerCaseMessage.includes('return') || lowerCaseMessage.includes('refund')) {
      return "We have a 30-day return policy for most items. Would you like me to explain our return process?";
    } else {
      return "Thank you for your message. How else can I assist you with your shopping today?";
    }
  };

  return (
    <ChatContext.Provider value={{
      currentConversation,
      conversations,
      isTyping,
      sendMessage,
      startNewConversation,
      setCurrentConversation: setConversationById
    }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = (): ChatContextType => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
