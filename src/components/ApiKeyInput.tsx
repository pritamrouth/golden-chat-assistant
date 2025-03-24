
import React, { useState } from 'react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Key } from 'lucide-react';

interface ApiKeyInputProps {
  onSubmit: (apiKey: string) => void;
}

export const ApiKeyInput: React.FC<ApiKeyInputProps> = ({ onSubmit }) => {
  const [apiKey, setApiKey] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (apiKey.trim()) {
      onSubmit(apiKey.trim());
    }
  };

  return (
    <div className="rounded-lg border p-4 sm:p-6 shadow-sm max-w-md mx-auto my-8">
      <div className="flex items-center gap-2 mb-4">
        <Key className="h-5 w-5 text-gold" />
        <h2 className="text-lg font-semibold">Gemini API Key Required</h2>
      </div>
      
      <p className="text-sm text-muted-foreground mb-4">
        To enable the AI shopping assistant, please enter your Gemini API key. 
        You can obtain one from the <a 
          href="https://ai.google.dev" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-gold hover:underline"
        >
          Google AI Studio
        </a>.
      </p>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="apiKey">API Key</Label>
          <Input
            id="apiKey"
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Enter your Gemini API key"
            className="w-full"
          />
        </div>
        
        <Button 
          type="submit" 
          disabled={!apiKey.trim()}
          className="w-full gold-gradient text-white hover:brightness-110"
        >
          Save API Key
        </Button>
        
        <p className="text-xs text-muted-foreground text-center">
          Your API key will be stored in your browser's local storage and not sent to our servers.
        </p>
      </form>
    </div>
  );
};
