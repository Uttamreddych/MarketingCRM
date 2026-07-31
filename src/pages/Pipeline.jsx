import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  MoreHorizontal, 
  Plus, 
  Clock, 
  MessageSquare, 
  Paperclip,
  TrendingUp,
  Target,
  Loader2
} from 'lucide-react';
import { leadService } from '../api';

const columns = [
  { id: 'New Lead', title: 'New Lead', color: 'sky' },
  { id: 'Contacted', title: 'Contacted', color: 'amber' },
  { id: 'Interested', title: 'Interested', color: 'indigo' },
  { id: 'Negotiation', title: 'Negotiation', color: 'violet' },
  { id: 'Won', title: 'Won', color: 'emerald' },
];

const PipelineCard = ({ card, onDragStart }) => (
  <motion.div
    layout
    draggable
    onDragStart={(e) => onDragStart(e, card.id)}
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    whileHover={{ y: -5, shadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}
    className="bg-slate-900/50 border border-white/5 rounded-xl p-4 cursor-grab active:cursor-grabbing group shadow-sm"
  >
    <div className="flex items-center justify-between mb-3">
      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-white/5 ${
        card.priority === 'High' ? 'text-rose-400' : card.priority === 'Medium' ? 'text-amber-400' : 'text-emerald-400'
      }`}>
        {card.priority}
      </span>
      <button className="text-slate-500 hover:text-white transition-colors">
        <MoreHorizontal size={14} />
      </button>
    </div>
    
    <h4 className="text-sm font-semibold text-white group-hover:text-primary transition-colors">{card.name}</h4>
    <p className="text-xs text-slate-500 mt-1">{card.source || 'Unknown'}</p>
    
    <div className="flex flex-wrap gap-2 mt-3">
      {card.conversionProbability && (
        <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary font-medium">
          Score: {card.conversionProbability}
        </span>
      )}
      {card.sentiment && (
        <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-slate-300 font-medium">
          {card.sentiment}
        </span>
      )}
    </div>

    <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between">
      <div className="flex items-center gap-3 text-slate-500">
        <div className="flex items-center gap-1">
          <MessageSquare size={12} />
          <span className="text-[10px]">1</span>
        </div>
      </div>
      <span className="text-xs font-bold text-emerald-400">
        {card.conversionProbability ? `$${card.conversionProbability * 100}` : '$--'}
      </span>
    </div>
  </motion.div>
);

const Pipeline = () => {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      const response = await leadService.getAll();
      setCards(response.data);
    } catch (error) {
      console.error("Error fetching leads for pipeline:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDragStart = (e, id) => {
    e.dataTransfer.setData('cardId', id);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = async (e, targetStatus) => {
    e.preventDefault();
    const cardId = e.dataTransfer.getData('cardId');
    if (!cardId) return;

    const card = cards.find(c => c.id.toString() === cardId.toString());
    if (card && card.status !== targetStatus) {
      // Optimistic update
      setCards(prevCards => 
        prevCards.map(c => c.id.toString() === cardId.toString() ? { ...c, status: targetStatus } : c)
      );

      try {
        await leadService.update(card.id, { ...card, status: targetStatus });
      } catch (error) {
        console.error("Error updating lead status:", error);
        // Revert on error
        fetchLeads();
      }
    }
  };

  return (
    <div className="p-8 h-[calc(100vh-80px)] flex flex-col space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            Sales Pipeline
            <div className="px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-400 text-xs font-medium border border-emerald-500/20 flex items-center gap-1">
              <TrendingUp size={12} />
              +15% this month
            </div>
          </h1>
          <p className="text-slate-500 text-sm mt-1">Visualize your sales journey and move deals forward.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex -space-x-2 mr-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="w-8 h-8 rounded-full border-2 border-surface bg-slate-800 overflow-hidden shadow-xl">
                <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i + 10}`} alt="avatar" />
              </div>
            ))}
            <div className="w-8 h-8 rounded-full border-2 border-surface bg-slate-700 flex items-center justify-center text-[10px] font-bold text-white shadow-xl">
              +5
            </div>
          </div>
          <button className="p-2.5 rounded-xl glass border-white/5 text-slate-400 hover:text-white transition-all">
            <Target size={20} />
          </button>
          <button className="px-4 py-2.5 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary-hover shadow-lg shadow-primary/20 transition-all flex items-center gap-2">
            <Plus size={18} />
            New Deal
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-x-auto pb-4 custom-scrollbar">
        {loading ? (
          <div className="h-full flex items-center justify-center">
            <Loader2 className="animate-spin text-primary" size={32} />
          </div>
        ) : (
          <div className="flex gap-6 h-full min-w-max">
            {columns.map(col => (
              <div 
                key={col.id} 
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, col.id)}
                className="w-80 flex flex-col rounded-2xl bg-white/[0.02] border border-white/5 transition-colors hover:bg-white/[0.04]"
              >
                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full bg-${col.color}-500`} />
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">{col.title}</h3>
                    <span className="ml-2 px-2 py-0.5 rounded-full bg-white/5 text-slate-500 text-[10px] font-bold">
                      {cards.filter(c => c.status === col.id).length}
                    </span>
                  </div>
                  <button className="text-slate-500 hover:text-white">
                    <Plus size={16} />
                  </button>
                </div>

                <div className="flex-1 p-3 space-y-4 overflow-y-auto custom-scrollbar">
                  {cards
                    .filter(c => c.status === col.id)
                    .map(card => (
                      <PipelineCard key={card.id} card={card} onDragStart={handleDragStart} />
                    ))}
                  
                  {cards.filter(c => c.status === col.id).length === 0 && (
                    <div className="h-32 border-2 border-dashed border-white/5 rounded-xl flex items-center justify-center text-slate-600 text-xs italic">
                      Drop deals here
                    </div>
                  )}
                </div>

                <div className="p-4 border-t border-white/5 bg-white/[0.01] rounded-b-2xl">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                    <span>TOTAL PIPELINE</span>
                    <span className="text-white">
                      ${cards
                        .filter(c => c.status === col.id)
                        .reduce((acc, curr) => acc + (curr.conversionProbability ? curr.conversionProbability * 100 : 0), 0)
                        .toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Pipeline;
