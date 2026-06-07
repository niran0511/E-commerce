import React, { useState, useRef } from 'react';
import { useChat } from '../../context/ChatContext';
import { useAuth } from '../../context/AuthContext';
import { FaRobot, FaTimes, FaPaperPlane, FaSpinner } from 'react-icons/fa';
import { BsStars } from 'react-icons/bs';
import ReactMarkdown from 'react-markdown';

function TypingIndicator() {
  return (
    <div className="d-flex align-items-center mb-3">
      <div className="rounded-circle d-flex align-items-center justify-content-center me-2 flex-shrink-0"
        style={{ width: 32, height: 32, background: 'var(--gradient-primary)', color: 'white', fontSize: 14 }}>
        <FaRobot />
      </div>
      <div className="p-3 rounded-4" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
        <div className="d-flex gap-1 align-items-center" style={{ height: 16 }}>
          {[0, 1, 2].map(i => (
            <div key={i} className="rounded-circle" style={{
              width: 8, height: 8, background: 'var(--primary)',
              animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`
            }} />
          ))}
        </div>
      </div>
      <style>{`@keyframes bounce { 0%,60%,100%{transform:translateY(0)} 30%{transform:translateY(-8px)} }`}</style>
    </div>
  );
}

export default function ChatWidget() {
  const { messages, isOpen, isLoading, sendMessage, toggleChat } = useChat();
  const { isAuthenticated } = useAuth();
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });

  React.useEffect(() => { if (isOpen) scrollToBottom(); }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const text = input.trim();
    setInput('');
    await sendMessage(text);
  };

  const handleKeyDown = (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } };

  const quickActions = [
    { label: "🔥 Today's Deals", msg: "Show me today's best deals" },
    { label: "💡 Recommend", msg: "Recommend me some popular products" },
    { label: "📦 Track Order", msg: "I want to track my order" },
    { label: "❓ Help", msg: "How do I return a product?" },
  ];

  const unreadCount = messages.filter(m => m.role === 'assistant' && !m.read).length;

  return (
    <>
      {/* FAB */}
      <button className="chat-fab" onClick={toggleChat} title="Chat with ShopSmart AI" style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 1050 }}>
        {isOpen ? <FaTimes size={22} /> : <FaRobot size={24} />}
        {!isOpen && unreadCount > 0 && (
          <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: 10 }}>
            {unreadCount}
          </span>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="chat-window" style={{ position: 'fixed', bottom: 96, right: 24, zIndex: 1049, width: 380, height: 520, display: 'flex', flexDirection: 'column', borderRadius: 20, overflow: 'hidden', boxShadow: 'var(--shadow-xl)', border: '1px solid var(--border-color)', background: 'var(--surface)' }}>
          {/* Header */}
          <div style={{ background: 'var(--gradient-primary)', padding: '16px 20px', color: 'white' }}>
            <div className="d-flex align-items-center gap-2">
              <BsStars size={20} />
              <div>
                <div className="fw-bold" style={{ fontSize: 15 }}>ShopSmart AI</div>
                <div style={{ fontSize: 11, opacity: 0.85 }}>● Online · Always ready to help</div>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: 4 }}>
            {messages.map((msg, idx) => (
              <div key={idx} className={`d-flex mb-2 ${msg.role === 'user' ? 'justify-content-end' : 'justify-content-start'}`}>
                {msg.role === 'assistant' && (
                  <div className="rounded-circle d-flex align-items-center justify-content-center me-2 flex-shrink-0"
                    style={{ width: 30, height: 30, background: 'var(--gradient-primary)', color: 'white', fontSize: 13, alignSelf: 'flex-end' }}>
                    <FaRobot />
                  </div>
                )}
                <div style={{
                  maxWidth: '85%', padding: '10px 14px', borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                  background: msg.role === 'user' ? 'var(--gradient-primary)' : 'var(--bg-secondary)',
                  color: msg.role === 'user' ? 'white' : 'var(--text-primary)',
                  border: msg.role === 'assistant' ? '1px solid var(--border-color)' : 'none',
                  fontSize: 13.5, lineHeight: 1.5, wordBreak: 'break-word', whiteSpace: 'pre-wrap'
                }} className="chat-markdown">
                  {msg.role === 'assistant' ? (
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  ) : (
                    msg.content
                  )}
                  <div style={{ fontSize: 10, opacity: 0.7, marginTop: 4, textAlign: msg.role === 'user' ? 'right' : 'left' }}>
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}
            {isLoading && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions */}
          {messages.length <= 1 && (
            <div className="px-3 pb-2 d-flex flex-wrap gap-1">
              {quickActions.map((qa, i) => (
                <button key={i} onClick={() => sendMessage(qa.msg)}
                  style={{ fontSize: 11.5, padding: '5px 10px', borderRadius: 20, border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-secondary)', cursor: 'pointer', transition: 'var(--transition)' }}
                  onMouseEnter={e => { e.target.style.background = 'var(--primary)'; e.target.style.color = 'white'; }}
                  onMouseLeave={e => { e.target.style.background = 'var(--bg-secondary)'; e.target.style.color = 'var(--text-secondary)'; }}>
                  {qa.label}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border-color)', display: 'flex', gap: 8 }}>
            {!isAuthenticated && (
              <div style={{ width: '100%', textAlign: 'center', fontSize: 12, color: 'var(--text-muted)', padding: '4px 0' }}>
                <a href="/login" style={{ color: 'var(--primary)' }}>Login</a> for personalized recommendations
              </div>
            )}
            {isAuthenticated && <>
              <input
                type="text" value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKeyDown}
                placeholder="Ask me anything..." disabled={isLoading}
                style={{ flex: 1, padding: '10px 14px', borderRadius: 24, border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', color: 'var(--text-primary)', outline: 'none', fontSize: 13.5 }} />
              <button onClick={handleSend} disabled={isLoading || !input.trim()}
                style={{ width: 42, height: 42, borderRadius: '50%', background: 'var(--gradient-primary)', color: 'white', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0, opacity: (!input.trim() || isLoading) ? 0.6 : 1 }}>
                {isLoading ? <FaSpinner className="fa-spin" size={14} /> : <FaPaperPlane size={14} />}
              </button>
            </>}
          </div>
        </div>
      )}
    </>
  );
}
