import React, { useEffect, useState, useRef } from 'react';
import { useStore } from '../store';
import { 
  MessageSquare, 
  Send, 
  User, 
  Phone, 
  FileText, 
  AlertCircle, 
  Check, 
  CheckCheck,
  ChevronRight,
  Plus,
  Play,
  HeartHandshake
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function Inbox() {
  const {
    chats,
    activeChatId,
    messages,
    chatsLoading,
    messagesLoading,
    user,
    leads,
    fetchChats,
    fetchMessages,
    sendWhatsAppMessage,
    addWhatsAppNote,
    simulateInboundMessage,
    fetchLeads
  } = useStore();

  const [replyText, setReplyText] = useState('');
  const [isNote, setIsNote] = useState(false);
  
  // Simulator state
  const [simName, setSimName] = useState('Rahul Sharma');
  const [simPhone, setSimPhone] = useState('+919876543210');
  const [simText, setSimText] = useState('Hi, I am interested in your pricing plans.');

  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchChats();
    fetchLeads();
  }, [fetchChats, fetchLeads]);

  useEffect(() => {
    if (activeChatId) {
      fetchMessages(activeChatId);
    }
  }, [activeChatId, fetchMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const activeChat = chats.find(c => c.id === activeChatId);
  const activeLead = activeChat?.leadId ? leads.find(l => l.id === activeChat.leadId) : null;

  const handleSend = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || !activeChatId) return;

    const agentName = user?.username || 'Alex Rivera';
    if (isNote) {
      await addWhatsAppNote(activeChatId, replyText, agentName);
    } else {
      await sendWhatsAppMessage(activeChatId, replyText, agentName);
    }
    setReplyText('');
  };

  const handleSimulate = async () => {
    if (!simPhone.trim() || !simText.trim()) return;
    await simulateInboundMessage(simPhone, simName, simText);
    setSimText('');
  };

  return (
    <div className="h-[calc(100vh-5rem)] flex overflow-hidden">
      {/* 1. CHATS SIDEBAR */}
      <div className="w-80 border-r border-white/5 flex flex-col bg-slate-950/40">
        <div className="p-4 border-b border-white/5 flex items-center justify-between">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <MessageSquare className="text-primary" size={20} />
            Shared Inbox
          </h2>
          <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full font-bold">
            {chats.filter(c => c.unreadCount > 0).length} Unread
          </span>
        </div>

        <div className="flex-1 overflow-y-auto divide-y divide-white/5">
          {chatsLoading ? (
            <div className="p-8 text-center text-slate-500 text-sm">Loading chats...</div>
          ) : chats.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-sm">No chats found. Try the simulator below!</div>
          ) : (
            chats.map(chat => {
              const isActive = chat.id === activeChatId;
              return (
                <button
                  key={chat.id}
                  onClick={() => fetchMessages(chat.id)}
                  className={`w-full text-left p-4 flex gap-3 transition-colors ${
                    isActive ? 'bg-white/5 border-l-4 border-primary' : 'hover:bg-white/5'
                  }`}
                >
                  <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center font-bold text-white relative">
                    {chat.customerName ? chat.customerName[0] : 'C'}
                    {chat.unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-4.5 h-4.5 bg-rose-500 text-[10px] text-white rounded-full flex items-center justify-center font-extrabold">
                        {chat.unreadCount}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline">
                      <h4 className="font-semibold text-sm text-white truncate">
                        {chat.customerName || chat.customerPhone}
                      </h4>
                      <span className="text-[10px] text-slate-500">
                        {chat.lastMessageTime ? new Date(chat.lastMessageTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : ''}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 truncate mt-1">
                      {chat.lastMessageText || 'No messages yet'}
                    </p>
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* INBOUND CHAT SIMULATOR FORM */}
        <div className="p-4 border-t border-white/5 bg-slate-950/80">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
            <Play size={12} className="text-emerald-400" />
            WhatsApp Simulator
          </h3>
          <div className="space-y-2">
            <input
              type="text"
              placeholder="Customer Name"
              value={simName}
              onChange={e => setSimName(e.target.value)}
              className="w-full text-xs bg-slate-900 border border-white/5 rounded-lg p-2 text-white placeholder:text-slate-600 focus:outline-none"
            />
            <input
              type="text"
              placeholder="Phone (e.g. +919876543210)"
              value={simPhone}
              onChange={e => setSimPhone(e.target.value)}
              className="w-full text-xs bg-slate-900 border border-white/5 rounded-lg p-2 text-white placeholder:text-slate-600 focus:outline-none"
            />
            <textarea
              placeholder="Message..."
              rows={2}
              value={simText}
              onChange={e => setSimText(e.target.value)}
              className="w-full text-xs bg-slate-900 border border-white/5 rounded-lg p-2 text-white placeholder:text-slate-600 focus:outline-none resize-none"
            />
            <button
              onClick={handleSimulate}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold py-2 rounded-lg transition-colors flex items-center justify-center gap-1.5"
            >
              Simulate Inbound Message
            </button>
          </div>
        </div>
      </div>

      {/* 2. CHAT PANEL */}
      <div className="flex-1 flex flex-col bg-slate-900/10">
        {activeChat ? (
          <>
            {/* Header */}
            <div className="p-4 border-b border-white/5 flex items-center justify-between bg-slate-950/20">
              <div>
                <h3 className="font-bold text-white">{activeChat.customerName || activeChat.customerPhone}</h3>
                <p className="text-xs text-slate-500 flex items-center gap-1">
                  <Phone size={12} />
                  {activeChat.customerPhone}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 font-medium">
                  {activeChat.status}
                </span>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messagesLoading ? (
                <div className="text-center text-slate-500 text-sm mt-8">Loading messages...</div>
              ) : (
                messages.map(msg => {
                  const isNote = msg.internalNote;
                  const isAgent = msg.direction === 'OUTBOUND';
                  return (
                    <div
                      key={msg.id}
                      className={`flex ${isAgent ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] rounded-2xl px-4 py-2.5 text-sm shadow-md ${
                          isNote 
                            ? 'bg-amber-500/15 border border-amber-500/30 text-amber-100 rounded-tr-none'
                            : isAgent
                            ? 'bg-primary text-white rounded-tr-none'
                            : 'bg-slate-800 text-slate-100 rounded-tl-none'
                        }`}
                      >
                        {isNote && (
                          <span className="text-[10px] uppercase font-bold text-amber-400 tracking-wider block mb-1">
                            Internal Note - By {msg.agentName}
                          </span>
                        )}
                        {!isNote && isAgent && (
                          <span className="text-[10px] font-medium text-white/70 block mb-1">
                            {msg.agentName}
                          </span>
                        )}
                        <p className="whitespace-pre-line leading-relaxed">{msg.text}</p>
                        <div className="flex items-center justify-end gap-1 mt-1">
                          <span className={`text-[9px] ${isAgent ? 'text-white/60' : 'text-slate-500'}`}>
                            {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </span>
                          {isAgent && !isNote && (
                            <span className="text-white/70">
                              {msg.status === 'READ' ? <CheckCheck size={12} className="text-emerald-300" /> : <Check size={12} />}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <form onSubmit={handleSend} className="p-4 border-t border-white/5 bg-slate-950/20 space-y-3">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsNote(false)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    !isNote ? 'bg-primary text-white' : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  WhatsApp Reply
                </button>
                <button
                  type="button"
                  onClick={() => setIsNote(true)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    isNote ? 'bg-amber-500 text-black font-bold' : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  Internal Note
                </button>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder={isNote ? "Write a private team note (won't be sent to customer)..." : "Type a message to client..."}
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                  className="flex-1 bg-slate-900 border border-white/5 rounded-xl px-4 py-3 text-sm focus:outline-none text-white focus:ring-1 focus:ring-primary/50"
                />
                <button
                  type="submit"
                  className={`p-3 rounded-xl transition-all ${
                    isNote ? 'bg-amber-500 text-black hover:bg-amber-400' : 'bg-primary text-white hover:bg-primary-dark'
                  }`}
                >
                  <Send size={18} />
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
            <MessageSquare size={48} className="mb-3 opacity-20 text-primary" />
            <p className="text-sm">Select a contact to begin messaging.</p>
          </div>
        )}
      </div>

      {/* 3. CRM CONTEXT PANEL */}
      {activeChat && (
        <div className="w-80 border-l border-white/5 p-6 flex flex-col gap-6 bg-slate-950/20 overflow-y-auto">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">CRM Context</h3>
            
            {activeLead ? (
              <div className="space-y-4">
                <div className="p-4 bg-white/5 rounded-xl border border-white/5">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-primary">Lead Profile</span>
                  <h4 className="text-base font-bold text-white mt-1">{activeLead.name}</h4>
                  <p className="text-xs text-slate-400 mt-1">{activeLead.email || 'No email saved'}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{activeLead.phone}</p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="p-3 bg-white/5 rounded-xl text-center">
                    <span className="text-[10px] text-slate-500 block">Stage</span>
                    <span className="text-xs font-semibold text-white mt-0.5 block">{activeLead.status}</span>
                  </div>
                  <div className="p-3 bg-white/5 rounded-xl text-center">
                    <span className="text-[10px] text-slate-500 block">Sentiment</span>
                    <span className="text-xs font-semibold text-emerald-400 mt-0.5 block">{activeLead.sentiment || 'Neutral'}</span>
                  </div>
                </div>

                <div className="p-3 bg-white/5 rounded-xl">
                  <div className="flex justify-between items-baseline mb-1">
                    <span className="text-[10px] text-slate-500">Conversion Prob.</span>
                    <span className="text-xs font-bold text-primary">{activeLead.conversionProbability || 45}%</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-primary h-full rounded-full" 
                      style={{ width: `${activeLead.conversionProbability || 45}%` }}
                    />
                  </div>
                </div>

                {activeLead.nextBestAction && (
                  <div className="p-3 bg-primary/10 border border-primary/20 rounded-xl">
                    <span className="text-[10px] font-bold text-primary uppercase tracking-wider block">AI Best Next Step</span>
                    <p className="text-xs text-slate-200 mt-1">{activeLead.nextBestAction}</p>
                  </div>
                )}

                {activeLead.aiSummary && (
                  <div className="p-3 bg-white/5 rounded-xl">
                    <span className="text-[10px] text-slate-500 block">AI Lead Summary</span>
                    <p className="text-xs text-slate-300 mt-1 leading-relaxed">{activeLead.aiSummary}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-center">
                <AlertCircle className="mx-auto text-rose-400 mb-2" size={20} />
                <h4 className="text-sm font-bold text-white">Uncaptured Lead</h4>
                <p className="text-xs text-slate-400 mt-1">
                  This contact has not been captured as a lead yet. Simulating inbound checks will auto-capture them.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
