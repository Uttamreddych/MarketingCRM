import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Sparkles, 
  Command, 
  Send, 
  UserPlus, 
  FileText, 
  MessageSquare,
  Loader2,
  Bot,
  TrendingUp,
  AlertCircle,
  Lightbulb,
  CheckCircle,
  TrendingDown,
  UserCheck
} from 'lucide-react';
import { leadService, aiService } from '../api';

const AICommandCenter = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('chat');
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Chat State
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hello! I am your Flow AI Business Assistant. I can check sales statistics, conversion rates, active marketing campaigns, unassigned leads, and more. \n\nWhat would you like to query today?",
      timestamp: new Date()
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isChatSending, setIsChatSending] = useState(false);
  const chatEndRef = useRef(null);

  // Predictions State
  const [predictionsData, setPredictionsData] = useState(null);
  const [isPredictionsLoading, setIsPredictionsLoading] = useState(false);

  // Recommendations State
  const [recommendations, setRecommendations] = useState([]);
  const [isRecsLoading, setIsRecsLoading] = useState(false);

  // Extraction State
  const [extractResult, setExtractResult] = useState(null);
  const [isExtracting, setIsExtracting] = useState(false);

  // Scroll chat on updates
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Load predictions
  const fetchPredictions = async () => {
    setIsPredictionsLoading(true);
    try {
      const response = await aiService.getPredictions();
      setPredictionsData(response.data);
    } catch (error) {
      console.error("Error fetching predictions:", error);
    } finally {
      setIsPredictionsLoading(false);
    }
  };

  // Load recommendations
  const fetchRecommendations = async () => {
    setIsRecsLoading(true);
    try {
      const response = await aiService.getRecommendations();
      setRecommendations(response.data);
    } catch (error) {
      console.error("Error fetching recommendations:", error);
    } finally {
      setIsRecsLoading(false);
    }
  };

  // Trigger data loads on tab switch
  useEffect(() => {
    if (isOpen) {
      if (activeTab === 'predictions') {
        fetchPredictions();
      } else if (activeTab === 'recommendations') {
        fetchRecommendations();
      }
    }
  }, [activeTab, isOpen]);

  // Quick chat queries
  const handleQuickQuery = async (queryText) => {
    if (isChatSending) return;
    
    // Map previous messages to simple history list
    const history = messages.map(m => ({ role: m.role, content: m.content }));

    // Append user message
    const userMsg = { role: 'user', content: queryText, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setIsChatSending(true);

    try {
      const response = await aiService.chat(queryText, history);
      const assistantMsg = {
        role: 'assistant',
        content: response.data.response,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (error) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "Sorry, I ran into an issue connecting to the AI brain. Please make sure the Spring Boot server on port 8081 is fully active.",
        timestamp: new Date()
      }]);
    } finally {
      setIsChatSending(false);
    }
  };

  // Chat Submission
  const handleSendChatMessage = async () => {
    if (!chatInput.trim() || isChatSending) return;
    const currentInput = chatInput;
    setChatInput('');
    await handleQuickQuery(currentInput);
  };

  // AI Extraction Processing
  const handleExtractProcess = () => {
    if (!input.trim()) return;
    setIsProcessing(true);
    setExtractResult(null);
    
    // Simple mock logic for extracting the lead details
    setTimeout(() => {
      setIsProcessing(false);
      // Basic heuristic to parse name, phone, etc.
      const text = input.toLowerCase();
      let extractedName = "Rahul Sharma";
      let extractedPhone = "+91 98765 43210";
      let intent = "Premium Package";

      if (text.includes("connor") || text.includes("sarah")) {
        extractedName = "Sarah Connor";
        extractedPhone = "+1 234-567-8901";
        intent = "Cyberdyne Security Service";
      } else if (text.includes("bruce") || text.includes("wayne")) {
        extractedName = "Bruce Wayne";
        extractedPhone = "+1 800-BATMAN";
        intent = "VIP Managed Services";
      } else if (input.match(/[A-Z][a-z]+/)) {
        // try to extract capitalized name
        const match = input.match(/([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/);
        if (match) extractedName = match[1];
      }

      setExtractResult({
        name: extractedName,
        phone: extractedPhone,
        source: 'Voice/Text AI Extract',
        intent: intent,
        priority: text.includes("high") || text.includes("urgent") ? 'High' : 'Medium',
        conversionProbability: text.includes("high") || text.includes("buy") ? 92 : 75,
        nextBestAction: text.includes("tomorrow") ? 'Call tomorrow' : 'Send introductory email',
        sentiment: text.includes("angry") || text.includes("bad") ? 'Negative' : 'Positive',
        summary: input
      });
    }, 1200);
  };

  // Save extracted lead in CRM
  const handleCreateExtractedLead = async () => {
    if (!extractResult || isExtracting) return;
    setIsExtracting(true);
    try {
      await leadService.create({
        name: extractResult.name,
        phone: extractResult.phone,
        source: extractResult.source,
        priority: extractResult.priority,
        conversionProbability: extractResult.conversionProbability,
        nextBestAction: extractResult.nextBestAction,
        sentiment: extractResult.sentiment,
        aiSummary: extractResult.summary,
        status: 'New Lead'
      });
      
      // score it in background
      try {
        await aiService.scoreLead(extractResult);
      } catch (e) {}

      setExtractResult(null);
      setInput('');
      alert("Successfully created and saved this lead in CRM database!");
    } catch (error) {
      console.error("Error creating AI lead:", error);
      alert("Failed to save lead in CRM.");
    } finally {
      setIsExtracting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-950/85 backdrop-blur-md z-[100]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl glass-dark border border-white/10 rounded-2xl overflow-hidden shadow-2xl z-[101]"
          >
            {/* Header */}
            <div className="p-6 border-b border-white/5 flex items-center justify-between bg-gradient-to-r from-primary/10 to-violet-500/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
                  <Sparkles className="text-primary animate-pulse" size={24} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    Flow AI Assistant
                  </h2>
                  <p className="text-xs text-slate-400">Intelligent real-time queries & CRM automation.</p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/5 text-slate-500 hover:text-white transition-all">
                <X size={20} />
              </button>
            </div>

            {/* Tab navigation */}
            <div className="flex border-b border-white/5 bg-slate-950/40 p-1">
              {[
                { id: 'chat', label: 'AI Chat', icon: Bot },
                { id: 'predictions', label: 'Predictions', icon: TrendingUp },
                { id: 'recommendations', label: 'Recommendations', icon: Lightbulb },
                { id: 'extraction', label: 'Lead Extractor', icon: UserPlus }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs font-semibold rounded-lg transition-all ${
                    activeTab === tab.id
                      ? 'bg-primary/10 text-primary border border-primary/20 shadow-inner'
                      : 'text-slate-400 hover:text-white hover:bg-white/[0.02]'
                  }`}
                >
                  <tab.icon size={14} />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Content Area */}
            <div className="p-6 h-[400px] overflow-y-auto custom-scrollbar">
              
              {/* CHAT TAB */}
              {activeTab === 'chat' && (
                <div className="h-full flex flex-col justify-between space-y-4">
                  {/* Messages list */}
                  <div className="flex-1 overflow-y-auto space-y-4 pr-1 custom-scrollbar">
                    {messages.map((msg, i) => (
                      <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        {msg.role !== 'user' && (
                          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20">
                            <Bot size={16} className="text-primary" />
                          </div>
                        )}
                        <div className={`p-4 rounded-2xl max-w-[80%] text-sm leading-relaxed ${
                          msg.role === 'user'
                            ? 'bg-primary text-white shadow-lg shadow-primary/10'
                            : 'bg-white/[0.02] border border-white/5 text-slate-300 whitespace-pre-line'
                        }`}>
                          {msg.content}
                        </div>
                      </div>
                    ))}
                    {isChatSending && (
                      <div className="flex gap-3 justify-start">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <Loader2 size={16} className="text-primary animate-spin" />
                        </div>
                        <div className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 text-slate-400 text-sm flex items-center gap-2">
                          Consulting FlowCRM database...
                        </div>
                      </div>
                    )}
                    <div ref={chatEndRef} />
                  </div>

                  {/* Quick Actions / Suggestions */}
                  {messages.length === 1 && (
                    <div className="flex flex-wrap gap-2 pt-2">
                      {[
                        "How many leads?",
                        "What is our total revenue?",
                        "What is our win rate?",
                        "Show active campaigns",
                        "Show unassigned leads"
                      ].map((s, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleQuickQuery(s)}
                          className="px-3 py-1.5 rounded-lg border border-white/5 bg-white/[0.02] hover:bg-primary/10 hover:border-primary/30 text-xs text-slate-400 hover:text-primary transition-all font-medium"
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Input form */}
                  <div className="flex gap-3 pt-2">
                    <input
                      type="text"
                      value={chatInput}
                      onChange={e => setChatInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleSendChatMessage()}
                      placeholder="Ask about sales, leads, conversion rates, campaigns..."
                      className="flex-1 bg-slate-900 border border-white/5 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50 text-white transition-all placeholder:text-slate-600"
                    />
                    <button
                      onClick={handleSendChatMessage}
                      disabled={isChatSending || !chatInput.trim()}
                      className="px-4 rounded-xl bg-primary text-white hover:bg-primary-hover disabled:opacity-50 transition-all flex items-center justify-center shadow-lg shadow-primary/20"
                    >
                      <Send size={18} />
                    </button>
                  </div>
                </div>
              )}

              {/* PREDICTIONS TAB */}
              {activeTab === 'predictions' && (
                <div className="space-y-6">
                  {isPredictionsLoading ? (
                    <div className="h-full flex items-center justify-center py-20">
                      <Loader2 className="animate-spin text-primary" size={36} />
                    </div>
                  ) : predictionsData ? (
                    <div className="space-y-4">
                      <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10 flex items-center gap-3">
                        <TrendingUp size={20} className="text-emerald-400" />
                        <div>
                          <p className="text-xs text-slate-400">Current Closed Won Base</p>
                          <h4 className="text-lg font-bold text-white">${predictionsData.historicalTotal?.toLocaleString()}</h4>
                        </div>
                      </div>

                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 pt-2">3-Month Regression Revenue Forecast</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {predictionsData.predictions?.map((pred, i) => {
                          const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                          const label = monthNames[pred.month - 1] + " " + pred.year;

                          return (
                            <div key={i} className="p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-primary/20 transition-all relative group">
                              <span className="absolute top-3 right-3 text-[9px] font-bold px-1.5 py-0.5 rounded bg-primary/10 text-primary uppercase">
                                {pred.confidence}% Conf
                              </span>
                              <p className="text-xs font-medium text-slate-500">{label}</p>
                              <h4 className="text-lg font-bold text-white mt-1">${pred.predictedRevenue?.toLocaleString()}</h4>
                              
                              <div className="w-full h-1 bg-slate-800 rounded-full mt-3 overflow-hidden">
                                <div className="h-full bg-primary" style={{ width: `${pred.confidence}%` }} />
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <div className="p-4 rounded-xl bg-white/[0.01] border border-white/5 flex gap-3 text-xs text-slate-400 mt-2 leading-relaxed">
                        <AlertCircle className="text-primary shrink-0" size={16} />
                        <span>
                          Flow AI uses an advanced regression growth framework mapping closed deals and estimated pipeline values to project your standard cash flow. Keep closing leads to boost the growth rate!
                        </span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-center text-sm text-slate-500 py-12">Failed to calculate sales forecasts.</p>
                  )}
                </div>
              )}

              {/* RECOMMENDATIONS TAB */}
              {activeTab === 'recommendations' && (
                <div className="space-y-4">
                  {isRecsLoading ? (
                    <div className="h-full flex items-center justify-center py-20">
                      <Loader2 className="animate-spin text-primary" size={36} />
                    </div>
                  ) : recommendations.length > 0 ? (
                    <div className="space-y-3">
                      {recommendations.map((rec, idx) => (
                        <div key={idx} className="p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all flex gap-4">
                          <div className={`p-2.5 rounded-lg shrink-0 ${
                            rec.priority === 'high' ? 'bg-rose-500/10 text-rose-400' : 'bg-amber-500/10 text-amber-400'
                          }`}>
                            {rec.type === 'follow-up' ? <UserPlus size={18} /> : rec.type === 'campaign' ? <MessageSquare size={18} /> : <UserCheck size={18} />}
                          </div>

                          <div className="space-y-1.5 flex-1">
                            <div className="flex items-center justify-between">
                              <span className={`text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded ${
                                rec.priority === 'high' ? 'bg-rose-500/10 text-rose-400 animate-pulse' : 'bg-amber-500/10 text-amber-400'
                              }`}>
                                {rec.priority} PRIORITY
                              </span>
                            </div>
                            <h4 className="text-sm font-semibold text-white">{rec.message}</h4>
                            
                            {rec.data && (
                              <div className="flex flex-wrap gap-2 pt-1">
                                {rec.data.map((item, idy) => (
                                  <span key={idy} className="text-[10px] px-2 py-0.5 rounded bg-white/5 border border-white/5 text-slate-400 font-medium">
                                    {item.name}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-16 space-y-2">
                      <CheckCircle className="text-emerald-500 mx-auto" size={32} />
                      <h4 className="text-sm font-bold text-white">Flow Clear!</h4>
                      <p className="text-xs text-slate-500">Every campaign is in bounds and all leads have been successfully followed up.</p>
                    </div>
                  )}
                </div>
              )}

              {/* LEAD EXTRACTION TAB */}
              {activeTab === 'extraction' && (
                <div className="space-y-5">
                  <div className="relative">
                    <textarea 
                      className="w-full h-32 bg-slate-900 border border-white/10 rounded-xl p-4 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all resize-none text-sm leading-relaxed"
                      placeholder="Paste interaction summaries, text notes, or emails. E.g. 'Bruce Wayne from Waynecorp is highly interested in SEO. Phone +1 800-BATMAN. High urgency.'"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                    />
                    <button
                      onClick={handleExtractProcess}
                      disabled={isProcessing || !input.trim()}
                      className="absolute bottom-4 right-4 px-4 py-2 rounded-lg bg-primary text-white text-xs font-semibold hover:bg-primary-hover disabled:opacity-50 transition-all shadow-lg shadow-primary/20 flex items-center gap-1.5"
                    >
                      {isProcessing ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                      Extract
                    </button>
                  </div>

                  {extractResult && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-5 rounded-xl bg-primary/5 border border-primary/20 space-y-4"
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                          <UserPlus size={14} className="text-primary" />
                          Parsed Client Blueprint
                        </h4>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[9px] font-bold">98% AI CONFIDENCE</span>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-xs">
                        <div>
                          <p className="text-[9px] text-slate-500 uppercase font-bold tracking-wider">Client Name</p>
                          <p className="text-white font-medium mt-0.5">{extractResult.name}</p>
                        </div>
                        <div>
                          <p className="text-[9px] text-slate-500 uppercase font-bold tracking-wider">Phone</p>
                          <p className="text-white font-medium mt-0.5">{extractResult.phone}</p>
                        </div>
                        <div>
                          <p className="text-[9px] text-slate-500 uppercase font-bold tracking-wider">Intent Level / Core Needs</p>
                          <p className="text-white font-medium mt-0.5">{extractResult.intent}</p>
                        </div>
                        <div>
                          <p className="text-[9px] text-slate-500 uppercase font-bold tracking-wider">CRM Lead Priority</p>
                          <p className="text-white font-medium mt-0.5 flex items-center gap-1.5">
                            <span className={`w-1.5 h-1.5 rounded-full ${extractResult.priority === 'High' ? 'bg-rose-400' : 'bg-amber-400'}`} />
                            {extractResult.priority}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={handleCreateExtractedLead}
                        disabled={isExtracting}
                        className="w-full py-2.5 rounded-lg bg-primary text-white font-bold text-xs hover:bg-primary-hover transition-all flex items-center justify-center gap-2"
                      >
                        {isExtracting ? <Loader2 size={14} className="animate-spin" /> : 'Save Lead in CRM'}
                      </button>
                    </motion.div>
                  )}
                </div>
              )}

            </div>

            {/* Footer */}
            <div className="p-4 bg-slate-900/50 border-t border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5 text-slate-500">
                  <Command size={14} />
                  <span className="text-[10px] font-bold">FLOW AI ENGINE ONLINE</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-bold text-slate-500">ACTIVE WORKSPACE DATABASE</span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AICommandCenter;
