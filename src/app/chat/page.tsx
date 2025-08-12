"use client";
import { useState } from 'react';
import dynamic from 'next/dynamic';
const ChatWidget = dynamic(() => import('./ChatWidget'), { ssr: false });

export default function ChatPage() {
  const [messages, setMessages] = useState<{ from: string; text: string }[]>([]);
  const [input, setInput] = useState('');

  return (
    <div className="glass-card" style={{ maxWidth: 700, margin: '3rem auto' }}>
      <h1 className="hero-title mb-4">Chat & Messaging</h1>
      <p className="mb-6">Communicate with your clients and manage conversations securely.</p>
      <ChatWidget />
    </div>
  );
}
