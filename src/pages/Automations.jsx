import React, { useEffect, useState } from 'react';
import { useStore } from '../store';
import { 
  Cpu, 
  Plus, 
  Trash2, 
  ToggleLeft, 
  ToggleRight, 
  Play, 
  Check, 
  Sparkles,
  RefreshCw,
  GitBranch,
  Smartphone,
  CheckSquare
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Automations() {
  const {
    workflows,
    workflowsLoading,
    fetchWorkflows,
    createWorkflow,
    updateWorkflow,
    deleteWorkflow
  } = useStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [triggerType, setTriggerType] = useState('STAGE_CHANGE');
  const [conditionStatus, setConditionStatus] = useState('Interested');
  const [actionType, setActionType] = useState('SEND_WHATSAPP');
  const [actionText, setActionText] = useState('Hi {name}! Thank you for your interest. Let\'s schedule a call.');

  useEffect(() => {
    fetchWorkflows();
  }, [fetchWorkflows]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newWorkflow = {
      name,
      triggerType,
      triggerConditions: JSON.stringify({ status: conditionStatus }),
      actions: JSON.stringify([{ type: actionType, text: actionText, title: actionText }]),
      active: true
    };

    await createWorkflow(newWorkflow);
    setIsModalOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setName('');
    setTriggerType('STAGE_CHANGE');
    setConditionStatus('Interested');
    setActionType('SEND_WHATSAPP');
    setActionText('Hi {name}! Thank you for your interest. Let\'s schedule a call.');
  };

  const handleToggle = async (workflow) => {
    const updated = {
      ...workflow,
      active: !workflow.active
    };
    await updateWorkflow(workflow.id, updated);
  };

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
            <Cpu className="text-primary" size={32} />
            Workflow Automations
          </h1>
          <p className="text-slate-400 mt-1">Design triggers and auto-actions to respond to leads in real-time.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-primary hover:bg-primary-dark text-white font-bold px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-primary/30 flex items-center gap-1.5"
        >
          <Plus size={18} />
          Create Workflow
        </button>
      </div>

      {/* BODY */}
      {workflowsLoading ? (
        <div className="py-20 text-center text-slate-500">Loading workflows...</div>
      ) : workflows.length === 0 ? (
        <div className="py-20 text-center bg-white/5 border border-white/5 rounded-2xl p-8 max-w-lg mx-auto">
          <Cpu size={48} className="mx-auto text-slate-600 mb-4" />
          <h3 className="text-lg font-bold text-white">No active workflows</h3>
          <p className="text-slate-400 text-sm mt-1 mb-6">
            Create your first workflow to automate follow-up tasks and WhatsApp notifications.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-primary hover:bg-primary-dark text-white font-bold px-4 py-2 rounded-xl transition-colors mx-auto"
          >
            Get Started
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {workflows.map(wf => {
            let cond = {};
            let acts = [];
            try { cond = JSON.parse(wf.triggerConditions || '{}'); } catch(e) {}
            try { acts = JSON.parse(wf.actions || '[]'); } catch(e) {}

            return (
              <motion.div
                key={wf.id}
                layout
                className="bg-white/5 border border-white/5 rounded-2xl p-5 flex flex-col justify-between hover:border-white/10 transition-all shadow-lg"
              >
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-bold text-white text-base">{wf.name}</h3>
                    <button
                      onClick={() => handleToggle(wf)}
                      className="text-slate-400 hover:text-white transition-colors"
                    >
                      {wf.active ? (
                        <ToggleRight size={32} className="text-emerald-400" />
                      ) : (
                        <ToggleLeft size={32} className="text-slate-600" />
                      )}
                    </button>
                  </div>

                  <div className="space-y-4 my-4">
                    {/* Trigger Info */}
                    <div className="flex gap-2 items-center bg-slate-900/50 p-2.5 rounded-lg border border-white/5">
                      <GitBranch size={16} className="text-indigo-400 flex-shrink-0" />
                      <div className="text-xs">
                        <span className="text-slate-500 block">WHEN</span>
                        <span className="text-slate-200 font-semibold">
                          {wf.triggerType === 'STAGE_CHANGE' ? `Lead status changes to '${cond.status}'` : 'New lead is registered'}
                        </span>
                      </div>
                    </div>

                    {/* Action Info */}
                    {acts.map((act, index) => (
                      <div key={index} className="flex gap-2 items-center bg-slate-900/50 p-2.5 rounded-lg border border-white/5">
                        {act.type === 'SEND_WHATSAPP' ? (
                          <Smartphone size={16} className="text-emerald-400 flex-shrink-0" />
                        ) : (
                          <CheckSquare size={16} className="text-amber-400 flex-shrink-0" />
                        )}
                        <div className="text-xs min-w-0">
                          <span className="text-slate-500 block">THEN</span>
                          <span className="text-slate-200 font-semibold block truncate">
                            {act.type === 'SEND_WHATSAPP' ? `WhatsApp: "${act.text}"` : `Create Task: "${act.title}"`}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between items-center pt-3 border-t border-white/5 mt-4">
                  <span className={`text-[10px] uppercase font-bold py-1 px-2.5 rounded-full ${
                    wf.active ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-500'
                  }`}>
                    {wf.active ? 'Active' : 'Inactive'}
                  </span>
                  <button
                    onClick={() => deleteWorkflow(wf.id)}
                    className="text-slate-500 hover:text-rose-400 transition-colors p-1"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* CREATE WORKFLOW MODAL */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-white/10 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl"
            >
              <div className="p-6 border-b border-white/5 flex justify-between items-center bg-slate-950/40">
                <h3 className="font-bold text-white text-lg flex items-center gap-2">
                  <Cpu className="text-primary" size={20} />
                  Create Automation Rule
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-slate-400 hover:text-white"
                >
                  &times;
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {/* Workflow Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Rule Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Inbound Lead Auto WhatsApp"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full bg-slate-950 border border-white/5 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50 text-white"
                  />
                </div>

                {/* Trigger */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Trigger Type</label>
                    <select
                      value={triggerType}
                      onChange={e => setTriggerType(e.target.value)}
                      className="w-full bg-slate-950 border border-white/5 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50 text-white"
                    >
                      <option value="STAGE_CHANGE">Lead Stage Change</option>
                      <option value="NEW_LEAD">New Lead Registered</option>
                    </select>
                  </div>

                  {triggerType === 'STAGE_CHANGE' && (
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Status Stage</label>
                      <select
                        value={conditionStatus}
                        onChange={e => setConditionStatus(e.target.value)}
                        className="w-full bg-slate-950 border border-white/5 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50 text-white"
                      >
                        <option value="New Lead">New Lead</option>
                        <option value="Contacted">Contacted</option>
                        <option value="Interested">Interested</option>
                        <option value="Negotiation">Negotiation</option>
                        <option value="Won">Won</option>
                      </select>
                    </div>
                  )}
                </div>

                {/* Action */}
                <div className="space-y-4 pt-2 border-t border-white/5">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Action Type</label>
                      <select
                        value={actionType}
                        onChange={e => {
                          setActionType(e.target.value);
                          if (e.target.value === 'CREATE_TASK') {
                            setActionText('Schedule follow-up call with lead');
                          } else {
                            setActionText('Hi {name}! Thank you for your interest. Let\'s schedule a call.');
                          }
                        }}
                        className="w-full bg-slate-950 border border-white/5 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50 text-white"
                      >
                        <option value="SEND_WHATSAPP">Send WhatsApp Message</option>
                        <option value="CREATE_TASK">Create Follow-up Task</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      {actionType === 'SEND_WHATSAPP' ? 'Message Template text' : 'Task Title'}
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={actionText}
                      onChange={e => setActionText(e.target.value)}
                      className="w-full bg-slate-950 border border-white/5 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50 text-white placeholder:text-slate-600"
                    />
                    {actionType === 'SEND_WHATSAPP' && (
                      <span className="text-[10px] text-slate-500">Use <code className="text-primary">{`{name}`}</code> to dynamically insert customer name.</span>
                    )}
                  </div>
                </div>

                {/* Form Buttons */}
                <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="bg-white/5 hover:bg-white/10 text-white font-semibold px-4 py-2 rounded-xl text-sm transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-primary hover:bg-primary-dark text-white font-bold px-4 py-2 rounded-xl text-sm transition-all shadow-lg"
                  >
                    Save Rule
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
