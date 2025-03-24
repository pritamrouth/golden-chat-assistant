
import React, { useState, useEffect } from 'react';
import { ChatInterface } from '../components/ChatInterface';
import { Sidebar } from '../components/Sidebar';
import { ThemeProvider } from '../context/ThemeContext';
import { ChatProvider } from '../context/ChatContext';
import { useIsMobile } from '../hooks/use-mobile';
import { ApiKeyInput } from '../components/ApiKeyInput';

const Index = () => {
  const isMobile = useIsMobile();
  const [apiKey, setApiKey] = useState<string | null>(null);

  useEffect(() => {
    // Check if API key is in localStorage
    const storedApiKey = localStorage.getItem('gemini_api_key');
    if (storedApiKey) {
      setApiKey(storedApiKey);
    } else {
      // Also check if it's in environment variables
      const envApiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (envApiKey) {
        setApiKey(envApiKey);
      }
    }
  }, []);

  const handleApiKeySubmit = (key: string) => {
    localStorage.setItem('gemini_api_key', key);
    setApiKey(key);
    // Reload the page to reinitialize the ChatProvider with the new API key
    window.location.reload();
  };

  if (!apiKey && !import.meta.env.VITE_GEMINI_API_KEY) {
    return (
      <ThemeProvider>
        <div className="min-h-screen bg-background p-4">
          <ApiKeyInput onSubmit={handleApiKeySubmit} />
        </div>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <ChatProvider>
        <div className="flex min-h-screen w-full overflow-hidden bg-background">
          <Sidebar />
          <div className={`flex-1 ${isMobile ? 'ml-16' : 'ml-16 md:ml-80'}`}>
            <main className="h-screen max-h-screen overflow-hidden">
              <ChatInterface />
            </main>
          </div>
        </div>
      </ChatProvider>
    </ThemeProvider>
  );
};

export default Index;
