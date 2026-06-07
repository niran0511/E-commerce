import React, { createContext, useContext, useState, useCallback } from 'react';
import axios from 'axios';

const ChatContext = createContext();

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) throw new Error('useChat must be used within a ChatProvider');
  return context;
};

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const WELCOME_MESSAGE = {
  role: 'assistant',
  content: 'Hello! 👋 I\'m your ShopSmart AI assistant. I can help you find products, track orders, get recommendations, and answer questions. How can I help you today?',
  timestamp: new Date().toISOString(),
  read: true,
};

export const ChatProvider = ({ children }) => {
  const [messages, setMessages] = useState([WELCOME_MESSAGE]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = useCallback(async (content) => {
    if (!content.trim() || isLoading) return;

    const userMessage = {
      role: 'user',
      content: content.trim(),
      timestamp: new Date().toISOString(),
      read: true,
    };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Include auth token if available
      const token = localStorage.getItem('shopsmart-token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const res = await axios.post(
        `${API_URL}/chat`,
        { message: content.trim() },
        { headers }
      );

      // Backend wraps reply in data.data.reply
      const reply =
        res.data?.data?.reply ||
        res.data?.reply ||
        res.data?.message ||
        'I apologize, I couldn\'t process that request. Could you please try again?';

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: reply,
        timestamp: new Date().toISOString(),
        read: isOpen,
      }]);
    } catch (error) {
      // On auth error (401) or any other error, use smart fallback
      const reply = buildFallbackReply(content.trim());
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: reply,
        timestamp: new Date().toISOString(),
        read: isOpen,
      }]);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, isOpen]);

  const toggleChat = useCallback(() => setIsOpen(prev => !prev), []);
  const closeChat = useCallback(() => setIsOpen(false), []);
  const clearMessages = useCallback(() => setMessages([WELCOME_MESSAGE]), []);

  const unreadCount = messages.filter(m => m.role === 'assistant' && !m.read).length;

  return (
    <ChatContext.Provider value={{ messages, isOpen, isLoading, unreadCount, sendMessage, toggleChat, closeChat, clearMessages }}>
      {children}
    </ChatContext.Provider>
  );
};

// ── Smart fallback when backend AI is unavailable ─────────────────────────────
function buildFallbackReply(msg) {
  const lower = msg.toLowerCase();

  if (/\b(phone|mobile|smartphone|samsung|iphone|oneplus)\b/.test(lower))
    return '📱 We have great smartphones! Browse our **Electronics** section for the latest Samsung, iPhone, and OnePlus models. Prices start from ₹1,299. Would you like me to help you find one in your budget?';

  if (/\b(laptop|macbook|hp|dell|lenovo)\b/.test(lower))
    return '💻 Check out our laptop collection! We have MacBook, HP Pavilion, Dell, and Lenovo models. Visit the **Electronics** category or search by brand.';

  if (/\b(headphone|earbuds|boat|sony|jbl|speaker)\b/.test(lower))
    return '🎧 Great choice! We carry Sony WH-1000XM5, boAt Airdopes, JBL speakers, and more. Visit **Electronics → Audio** for the full collection.';

  if (/\b(deal|offer|discount|sale|cheap|budget)\b/.test(lower))
    return '🔥 **Today\'s Hot Deals:**\n\n• boAt Airdopes — ₹1,299 (71% off!)\n• Prestige Mixer Grinder — ₹2,499\n• Boldfit Yoga Mat — ₹699\n\nCheck the **Products** page for all deals!';

  if (/\b(order|track|where|status|delivery|shipped)\b/.test(lower))
    return '📦 To track your order:\n1. Go to **My Orders** from the menu\n2. Click on your order to see tracking details\n3. You\'ll see real-time status updates there.\n\nNeed help with anything else?';

  if (/\b(return|refund|exchange|cancel)\b/.test(lower))
    return '↩️ **Return & Refund Policy:**\n\n• 7-day return window for most products\n• Refunds processed in 5-7 business days\n• Go to **Orders → Select Order → Request Return**\n• Electronics have a 7-day replacement guarantee';

  if (/\b(shipping|delivery time|how long|when)\b/.test(lower))
    return '🚚 **Shipping Info:**\n\n• **Free shipping** on orders above ₹500\n• Standard delivery: 3-5 business days\n• Express delivery (1-2 days) available for ₹99\n• Track your order in the **My Orders** section';

  if (/\b(payment|pay|cod|upi|card)\b/.test(lower))
    return '💳 **Payment Methods:**\n\n• 💵 Cash on Delivery (COD)\n• 💳 Credit / Debit Card\n• 📱 UPI (Google Pay, PhonePe, Paytm)\n\nAll payments are 100% secure!';

  if (/\b(recommend|suggest|best|popular|top)\b/.test(lower))
    return '⭐ **Top Picks Right Now:**\n\n1. Samsung Galaxy S24 Ultra — ₹1,29,999\n2. Sony WH-1000XM5 — ₹26,990 (23% off)\n3. MacBook Air M3 — ₹1,14,900\n4. boAt Airdopes 141 — ₹1,299 (71% off!)\n\nVisit our homepage for more bestsellers!';

  if (/\b(electronic|gadget)\b/.test(lower))
    return '⚡ Our Electronics section has 50+ products including phones, laptops, headphones, TVs, cameras, and smart watches. Browse now at the **Products** page!';

  return '🛍️ Hi! I\'m ShopSmart AI. I can help you:\n\n• 🔍 **Find products** — "Show phones under ₹15000"\n• 📦 **Track orders** — "Where is my order?"\n• 💡 **Get deals** — "Show today\'s offers"\n• ❓ **Policy info** — "What is return policy?"\n\nWhat are you looking for today?';
}

export default ChatContext;
