
import React, { createContext, useContext, useState, useEffect } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";

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
  const [genAI, setGenAI] = useState<GoogleGenerativeAI | null>(null);

  useEffect(() => {
    // Initialize Gemini API
    const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";
    if (API_KEY) {
      const ai = new GoogleGenerativeAI(API_KEY);
      setGenAI(ai);
    } else {
      console.warn("Gemini API key not found. Using mock responses instead.");
    }
    
    // Create initial conversation if none exists
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
  }, []);

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

  const formatChatHistory = (messages: Message[]) => {
    return messages.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }));
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

    try {
      let responseText = '';
      
      if (genAI) {
        // Use Gemini API for response
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        
        // Format chat history for Gemini API
        const history = formatChatHistory(currentConversation.messages);
        
        // Start chat with history (excluding the latest user message)
        const chat = model.startChat({
          history: history.slice(0, -1)
        });

        // Create message parts (text and images if any)
        const messageParts: any[] = [content];
        
        // If there are images, add them to the message parts
        if (images && images.length > 0) {
          const imageParts = images.map(imageUrl => {
            // For base64 images
            if (imageUrl.startsWith('data:image')) {
              const base64Data = imageUrl.split(',')[1];
              return {
                inlineData: {
                  data: base64Data,
                  mimeType: imageUrl.split(';')[0].split(':')[1]
                }
              };
            }
            // For image URLs, we'd need a different approach
            return { text: `Image URL: ${imageUrl}` };
          });
          
          messageParts.push(...imageParts);
        }
        
        // Send message to Gemini and get response
        try {
          const result = await chat.sendMessage(messageParts);
          responseText = result.response.text();
        } catch (error) {
          console.error("Error sending message to Gemini:", error);
          responseText = "Sorry, I encountered an error processing your request. Please try again.";
        }
      } else {
        // Fall back to mock response if API is not available
        responseText = getMockResponse(content);
      }
    
      // Create assistant message
      const assistantMessage: Message = {
        id: generateId(),
        content: responseText,
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
      
      // Update conversations with the assistant response
      setConversations(prevConversations => 
        prevConversations.map(c => 
          c.id === currentConversation.id ? finalConversation : c
        )
      );
      setCurrentConversation(finalConversation);
    } catch (error) {
      console.error("Error in chat process:", error);
    } finally {
      setIsTyping(false);
    }
  };

  // Mock response generator (fallback when API is not available)
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
