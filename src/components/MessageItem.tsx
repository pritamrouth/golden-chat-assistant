
import React from 'react';
import { Message } from '../context/ChatContext';

interface MessageItemProps {
  message: Message;
}

export const MessageItem: React.FC<MessageItemProps> = ({ message }) => {
  const isUser = message.role === 'user';
  const time = new Intl.DateTimeFormat('en-US', {
    hour: '2-digit',
    minute: '2-digit'
  }).format(message.timestamp);

  return (
    <div 
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4 animate-fade-in`}
    >
      <div 
        className={`max-w-[85%] lg:max-w-[70%] rounded-2xl p-4 shadow-md
          ${isUser 
            ? 'bg-gold text-white rounded-tr-none' 
            : 'glass-card rounded-tl-none'}`}
      >
        {message.images && message.images.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {message.images.map((image, index) => (
              <img 
                key={index}
                src={image}
                alt="Uploaded"
                className="max-h-40 rounded-lg object-contain"
              />
            ))}
          </div>
        )}
        
        <div className="whitespace-pre-wrap">{message.content}</div>
        
        <div className={`text-xs mt-2 text-right ${isUser ? 'text-white/70' : 'text-muted-foreground'}`}>
          {time}
        </div>
      </div>
    </div>
  );
};
