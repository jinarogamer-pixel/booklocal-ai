import { useState } from 'react';

export default function ChatWidget() {
  const [messages, setMessages] = useState([
    { from: 'client', text: 'Hi, I have a question about your service.' },
    { from: 'provider', text: 'Of course! How can I help?' },
  ]);
  const [input, setInput] = useState('');
  const send = () => {
    if (!input.trim()) return;
    setMessages([...messages, { from: 'provider', text: input }]);
    setInput('');
  };
  return (
    <div className="glass-card" style={{ maxWidth: 420, margin: '2rem auto' }}>
      <div style={{ minHeight: 180, marginBottom: 16 }}>
        {messages.map((m, i) => (
          <div key={i} style={{ textAlign: m.from === 'provider' ? 'right' : 'left', margin: '0.5rem 0' }}>
            <span style={{ background: m.from === 'provider' ? '#bae6fd' : '#f1f5f9', borderRadius: 12, padding: '0.5rem 1rem', display: 'inline-block' }}>{m.text}</span>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Type a message..."
          style={{ flex: 1, borderRadius: 8, border: '1px solid #ddd', padding: '0.5rem 1rem' }}
          onKeyDown={e => { if (e.key === 'Enter') send(); }}
        />
        <button className="btn-primary" onClick={send} style={{ borderRadius: 8 }}>Send</button>
      </div>
    </div>
  );
}
