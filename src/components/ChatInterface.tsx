
import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '../context/ChatContext';
import { MessageItem } from './MessageItem';
import { TypingIndicator } from './TypingIndicator';
import { ImageUpload } from './ImageUpload';
import { Send, ImagePlus, X } from 'lucide-react';

export const ChatInterface: React.FC = () => {
  const { currentConversation, sendMessage, isTyping } = useChat();
  const [inputValue, setInputValue] = useState('');
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Scroll to bottom when messages change or typing state changes
  useEffect(() => {
    scrollToBottom();
  }, [currentConversation?.messages, isTyping]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() || selectedImages.length > 0) {
      sendMessage(inputValue, selectedImages);
      setInputValue('');
      setSelectedImages([]);
      setShowImageUpload(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleImagesSelected = (imageUrls: string[]) => {
    setSelectedImages([...selectedImages, ...imageUrls]);
  };

  // Auto resize textarea
  const adjustTextareaHeight = () => {
    const textarea = inputRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = textarea.scrollHeight + 'px';
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [inputValue]);

  // Early return with loading state if currentConversation is null
  if (!currentConversation) {
    return (
      <div className="flex flex-col h-full items-center justify-center">
        <div className="p-4 text-center">
          <h2 className="text-xl font-semibold mb-2">Loading conversation...</h2>
          <p className="text-muted-foreground">Please wait while we set up your chat</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Chat messages area */}
      <div className="flex-grow overflow-y-auto px-4 md:px-8 py-6">
        {currentConversation.messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-4 gold-text">Shopping Assistant</h1>
            <p className="text-center text-muted-foreground max-w-md mb-8">
              Welcome to your premium shopping assistant. Ask me anything about products, pricing, or recommendations.
            </p>
            <div className="flex flex-col gap-3 w-full max-w-md">
              {[
                "What are some trending products right now?",
                "Can you recommend a good laptop for video editing?",
                "I'm looking for a gift for my mom",
                "What's your return policy?"
              ].map((suggestion, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setInputValue(suggestion);
                    if (inputRef.current) {
                      inputRef.current.focus();
                    }
                  }}
                  className="p-4 rounded-xl text-left border border-border hover:border-gold/50 hover:bg-secondary/30 transition-all"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {currentConversation.messages.map((message) => (
              <MessageItem key={message.id} message={message} />
            ))}
            {isTyping && (
              <div className="flex mb-4">
                <TypingIndicator />
              </div>
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Chat input area */}
      <div className="border-t border-border p-4">
        {showImageUpload && (
          <div className="mb-3">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-medium">Add Images</h3>
              <button 
                onClick={() => setShowImageUpload(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <ImageUpload onImagesSelected={handleImagesSelected} />
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex items-end gap-2">
          <button
            type="button"
            onClick={() => setShowImageUpload(!showImageUpload)}
            className="p-3 rounded-full bg-secondary/50 hover:bg-secondary/80 transition-colors gold-focus"
          >
            <ImagePlus className="h-5 w-5" />
          </button>
          
          <div className="flex-grow relative">
            <textarea
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              rows={1}
              className="w-full rounded-xl px-4 py-3 resize-none overflow-hidden bg-background gold-focus
                focus:ring-offset-background border border-input"
              style={{ maxHeight: '150px' }}
            />
          </div>
          
          <button
            type="submit"
            disabled={!inputValue.trim() && selectedImages.length === 0}
            className="p-3 rounded-full gold-gradient text-white transition-all
              disabled:opacity-50 disabled:cursor-not-allowed hover:brightness-110 gold-focus"
          >
            <Send className="h-5 w-5" />
          </button>
        </form>
      </div>
    </div>
  );
};
