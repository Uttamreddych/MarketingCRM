import React, { useEffect, useState } from 'react';
import { useStore } from '../store';
import { 
  CheckSquare, 
  Calendar, 
  Plus, 
  Clock, 
  User, 
  AlertTriangle, 
  Check, 
  Trash2,
  Bell,
  CheckCircle,
  Tag
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Tasks() {
  const {
    tasks,
    tasksLoading,
    leads,
    fetchTasks,
    createTask,
    toggleTask,
    deleteTask,
    fetchLeads
  } = useStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filter, setFilter] = useState('ALL'); // ALL, PENDING, COMPLETED
  
  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState('Medium');
  const [taskType, setTaskType] = useState('FOLLOW_UP');
  const [recurrence, setRecurrence] = useState('NONE');
  const [leadId, setLeadId] = useState('');

  useEffect(() => {
    fetchTasks();
    fetchLeads();
  }, [fetchTasks, fetchLeads]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !dueDate) return;

    const matchedLead = leads.find(l => l.id === Number(leadId));

    const taskData = {
      title,
      description,
      dueDate: new Date(dueDate).toISOString(),
      priority,
      type: taskType,
      recurrence,
      leadId: leadId ? Number(leadId) : null,
      assignedTo: matchedLead ? matchedLead.assignedTo : 'Unassigned',
      assignedToUserId: matchedLead ? matchedLead.assignedToUserId : null,
      completed: false
    };

    await createTask(taskData);
    setIsModalOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setDueDate('');
    setPriority('Medium');
    setTaskType('FOLLOW_UP');
    setRecurrence('NONE');
    setLeadId('');
  };

  const filteredTasks = tasks.filter(t => {
    if (filter === 'PENDING') return !t.completed;
    if (filter === 'COMPLETED') return t.completed;
    return true;
  });

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
            <CheckSquare className="text-primary" size={32} />
            Task Follow-ups
          </h1>
          <p className="text-slate-400 mt-1">Schedule phone calls, meetings, emails, and automatic workflow checks.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-primary hover:bg-primary-dark text-white font-bold px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-primary/30 flex items-center gap-1.5"
        >
          <Plus size={18} />
          Add Task
        </button>
      </div>

      {/* FILTER BUTTONS */}
      <div className="flex gap-2 bg-white/5 p-1 rounded-xl w-fit border border-white/5">
        {['ALL', 'PENDING', 'COMPLETED'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-colors ${
              filter === f ? 'bg-primary text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            {f.toLowerCase()}
          </button>
        ))}
      </div>

      {/* BODY */}
      {tasksLoading ? (
        <div className="py-20 text-center text-slate-500">Loading tasks...</div>
      ) : filteredTasks.length === 0 ? (
        <div className="py-20 text-center bg-white/5 border border-white/5 rounded-2xl p-8 max-w-md mx-auto">
          <CheckSquare size={48} className="mx-auto text-slate-600 mb-4" />
          <h3 className="text-lg font-bold text-white">No tasks scheduled</h3>
          <p className="text-slate-400 text-sm mt-1">There are no tasks matching your selected status filter.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTasks.map(task => {
            const isOverdue = new Date(task.dueDate) < new Date() && !task.completed;
            const linkedLead = leads.find(l => l.id === task.leadId);

            return (
              <motion.div
                key={task.id}
                layout
                className={`bg-white/5 border rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-white/10 transition-all ${
                  task.completed ? 'opacity-65 border-white/5' : isOverdue ? 'border-rose-500/20' : 'border-white/5'
                }`}
              >
                <div className="flex gap-3 items-start flex-1 min-w-0">
                  <button
                    onClick={() => toggleTask(task.id)}
                    className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition-colors mt-0.5 ${
                      task.completed 
                        ? 'bg-emerald-500 border-emerald-500 text-black font-extrabold' 
                        : isOverdue 
                        ? 'border-rose-500/40 hover:bg-rose-500/10' 
                        : 'border-white/20 hover:bg-white/5'
                    }`}
                  >
                    {task.completed && <Check size={14} strokeWidth={3} />}
                  </button>

                  <div className="min-w-0">
                    <h3 className={`font-semibold text-sm text-white truncate ${task.completed ? 'line-through text-slate-500' : ''}`}>
                      {task.title}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">{task.description}</p>
                    
                    <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-2 text-[10px] font-bold text-slate-500">
                      <span className="flex items-center gap-1">
                        <Clock size={12} className={isOverdue ? 'text-rose-400' : 'text-slate-500'} />
                        {new Date(task.dueDate).toLocaleString()}
                        {isOverdue && <span className="text-rose-400 uppercase tracking-widest">(Overdue)</span>}
                      </span>
                      {linkedLead && (
                        <span className="flex items-center gap-1 text-primary">
                          <User size={12} />
                          Lead: {linkedLead.name}
                        </span>
                      )}
                      <span className="flex items-center gap-1 uppercase tracking-wider text-slate-400">
                        <Tag size={12} />
                        {task.type}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 w-full sm:w-auto justify-end pt-3 sm:pt-0 border-t sm:border-t-0 border-white/5">
                  <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-md ${
                    task.priority === 'High' 
                      ? 'bg-rose-500/10 text-rose-400' 
                      : task.priority === 'Medium' 
                      ? 'bg-amber-500/10 text-amber-400' 
                      : 'bg-indigo-500/10 text-indigo-400'
                  }`}>
                    {task.priority} Priority
                  </span>
                  <button
                    onClick={() => deleteTask(task.id)}
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

      {/* ADD TASK MODAL */}
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
                  <CheckSquare className="text-primary" size={20} />
                  Schedule Task Follow-up
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-slate-400 hover:text-white"
                >
                  &times;
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {/* Title */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Task Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Call client for volume discount negotiation"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    className="w-full bg-slate-950 border border-white/5 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50 text-white"
                  />
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Notes / Details</label>
                  <textarea
                    rows={2}
                    placeholder="Mention custom details..."
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    className="w-full bg-slate-950 border border-white/5 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50 text-white resize-none"
                  />
                </div>

                {/* Date / Priority */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Due Date & Time</label>
                    <input
                      type="datetime-local"
                      required
                      value={dueDate}
                      onChange={e => setDueDate(e.target.value)}
                      className="w-full bg-slate-950 border border-white/5 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50 text-white"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Priority</label>
                    <select
                      value={priority}
                      onChange={e => setPriority(e.target.value)}
                      className="w-full bg-slate-950 border border-white/5 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50 text-white"
                    >
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                    </select>
                  </div>
                </div>

                {/* Type / Lead Link */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Task Type</label>
                    <select
                      value={taskType}
                      onChange={e => setTaskType(e.target.value)}
                      className="w-full bg-slate-950 border border-white/5 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50 text-white"
                    >
                      <option value="CALL">Call</option>
                      <option value="MEETING">Meeting</option>
                      <option value="EMAIL">Email</option>
                      <option value="FOLLOW_UP">General Follow-up</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-400">Link to Lead</label>
                    <select
                      value={leadId}
                      onChange={e => setLeadId(e.target.value)}
                      className="w-full bg-slate-950 border border-white/5 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50 text-white"
                    >
                      <option value="">-- No Link --</option>
                      {leads.map(l => (
                        <option key={l.id} value={l.id}>{l.name} ({l.status})</option>
                      ))}
                    </select>
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
                    Save Task
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
