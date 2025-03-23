
import React from 'react';
import { ChatInterface } from '../components/ChatInterface';
import { Sidebar } from '../components/Sidebar';
import { ThemeProvider } from '../context/ThemeContext';
import { ChatProvider } from '../context/ChatContext';

const Index = () => {
  return (
    <ThemeProvider>
      <ChatProvider>
        <div className="flex min-h-screen w-full overflow-hidden bg-background">
          <Sidebar />
          <div className="flex-1 ml-16 md:ml-80">
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
