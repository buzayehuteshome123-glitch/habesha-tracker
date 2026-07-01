import React, { useState } from 'react';
import { 
  CheckSquare, 
  Plus, 
  Trash2, 
  Pin, 
  Search, 
  FileText, 
  Calendar, 
  Sparkles, 
  Target, 
  X,
  Edit
} from 'lucide-react';
import { Task, Memo, DailyGoal, BusinessSettings } from '../types';
import { TRANSLATIONS } from '../sampleData';

interface PersonalTasksProps {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  memos: Memo[];
  setMemos: React.Dispatch<React.SetStateAction<Memo[]>>;
  goals: DailyGoal[];
  setGoals: React.Dispatch<React.SetStateAction<DailyGoal[]>>;
  settings: BusinessSettings;
  addToast: (text: string, type: 'info' | 'warning' | 'success') => void;
  showConfirm: (title: string, message: string, onConfirm: () => void) => void;
}

export default function PersonalTasks({
  tasks,
  setTasks,
  memos,
  setMemos,
  goals,
  setGoals,
  settings,
  addToast,
  showConfirm,
}: PersonalTasksProps) {
  const t = TRANSLATIONS[settings.language];
  const isAmharic = settings.language === 'am';

  // 1. States
  // Tasks (Checklist) input
  const [taskText, setTaskText] = useState('');
  
  // Daily goals input
  const [goalText, setGoalText] = useState('');

  // Notepad states
  const [noteSearch, setNoteSearch] = useState('');
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Memo | null>(null);
  
  // Note Form Fields
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [notePinned, setNotePinned] = useState(false);

  // 2. Checklist (Tasks) Functions
  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskText.trim()) return;

    const newTask: Task = {
      id: 'task-' + Date.now(),
      text: taskText,
      completed: false
    };
    setTasks([...tasks, newTask]);
    setTaskText('');
    addToast('Task added to operational checklist.', 'success');
  };

  const handleToggleTask = (id: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const handleDeleteTask = (id: string) => {
    showConfirm(
      isAmharic ? 'ስራ መሰረዝ' : 'Delete Task',
      isAmharic 
        ? 'እርግጠኛ ነዎት ይህንን ስራ መሰረዝ ይፈልጋሉ?' 
        : 'Are you sure you want to delete this task?',
      () => {
        setTasks(tasks.filter(t => t.id !== id));
        addToast(isAmharic ? 'ስራው ተሰርዟል!' : 'Task removed.', 'info');
      }
    );
  };

  // 3. Daily Goals Functions
  const handleAddGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalText.trim()) return;

    const newGoal: DailyGoal = {
      id: 'goal-' + Date.now(),
      text: goalText,
      completed: false
    };
    setGoals([...goals, newGoal]);
    setGoalText('');
    addToast('New milestone goal registered.', 'success');
  };

  const handleToggleGoal = (id: string) => {
    setGoals(goals.map(g => g.id === id ? { ...g, completed: !g.completed } : g));
  };

  const handleDeleteGoal = (id: string) => {
    showConfirm(
      isAmharic ? 'ግብ መሰረዝ' : 'Delete Goal',
      isAmharic 
        ? 'እርግጠኛ ነዎት ይህንን ግብ መሰረዝ ይፈልጋሉ?' 
        : 'Are you sure you want to delete this goal?',
      () => {
        setGoals(goals.filter(g => g.id !== id));
        addToast(isAmharic ? 'ግቡ ተሰርዟል!' : 'Goal removed.', 'info');
      }
    );
  };

  // 4. Memos Notepad Functions
  const openAddNoteModal = () => {
    setEditingNote(null);
    setNoteTitle('');
    setNoteContent('');
    setNotePinned(false);
    setIsNoteModalOpen(true);
  };

  const openEditNoteModal = (memo: Memo) => {
    setEditingNote(memo);
    setNoteTitle(memo.title);
    setNoteContent(memo.content);
    setNotePinned(memo.isPinned);
    setIsNoteModalOpen(true);
  };

  const handleSaveNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteTitle.trim()) {
      addToast('Note title is required.', 'warning');
      return;
    }

    if (editingNote) {
      // Edit
      const updated = memos.map(m => {
        if (m.id === editingNote.id) {
          return { ...m, title: noteTitle, content: noteContent, isPinned: notePinned };
        }
        return m;
      });
      setMemos(updated);
      addToast('Note updated.', 'success');
    } else {
      // Add
      const newMemo: Memo = {
        id: 'memo-' + Date.now(),
        title: noteTitle,
        content: noteContent,
        isPinned: notePinned,
        date: new Date().toISOString().slice(0, 10)
      };
      setMemos([newMemo, ...memos]);
      addToast('Note successfully pinned / saved.', 'success');
    }
    setIsNoteModalOpen(false);
  };

  const handleTogglePinNote = (id: string) => {
    setMemos(memos.map(m => m.id === id ? { ...m, isPinned: !m.isPinned } : m));
  };

  const handleDeleteNote = (id: string) => {
    showConfirm(
      isAmharic ? 'ማስታወሻ መሰረዝ' : 'Delete Note',
      isAmharic 
        ? 'እርግጠኛ ነዎት ይህንን ማስታወሻ መሰረዝ ይፈልጋሉ?' 
        : 'Are you sure you want to delete this note?',
      () => {
        setMemos(memos.filter(m => m.id !== id));
        addToast(isAmharic ? 'ማስታወሻው ተሰርዟል!' : 'Note removed.', 'info');
      }
    );
  };

  // Filter notes
  const filteredMemos = memos.filter(m => {
    const query = noteSearch.toLowerCase();
    return m.title.toLowerCase().includes(query) || m.content.toLowerCase().includes(query);
  });

  const pinnedMemos = filteredMemos.filter(m => m.isPinned);
  const regularMemos = filteredMemos.filter(m => !m.isPinned);

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold font-sans text-slate-800 dark:text-white flex items-center gap-2">
          <CheckSquare className="w-5 h-5 text-emerald-500" />
          {t.tasks}
        </h2>
        <p className="text-slate-400 text-xs mt-1 font-sans">
          Log operational milestones, store suppliers directory, save Telebirr SMS configurations, and checklist your daily tasks.
        </p>
      </div>

      {/* Grid: Left (checklists / goals) & Right (notepad) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: Operations and Milestones (Checklist) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Checklist Panel */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-5 shadow-xs flex flex-col h-[320px]">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white font-sans uppercase tracking-wider mb-4 border-l-3 border-emerald-500 pl-3">
              {t.checklist}
            </h3>

            {/* Quick add form */}
            <form onSubmit={handleAddTask} className="flex gap-2 mb-4">
              <input
                type="text"
                placeholder={t.addTask}
                value={taskText}
                onChange={(e) => setTaskText(e.target.value)}
                className="flex-1 px-3 py-1.5 text-xs border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50/50 dark:bg-slate-950 text-slate-800 dark:text-white focus:outline-hidden"
                id="input-task-text"
              />
              <button
                type="submit"
                className="p-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition"
                id="btn-task-add"
              >
                <Plus className="w-4 h-4" />
              </button>
            </form>

            {/* Task list */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {tasks.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-12">No active tasks logged.</p>
              ) : (
                tasks.map(task => (
                  <div key={task.id} className="flex items-center justify-between p-2.5 bg-slate-50/40 dark:bg-slate-950/20 border border-slate-200/40 dark:border-slate-800/40 rounded-xl transition">
                    <label className="flex items-center gap-3 cursor-pointer flex-1 min-w-0">
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => handleToggleTask(task.id)}
                        className="w-4 h-4 accent-emerald-500 border-slate-300 dark:border-slate-700 rounded-sm"
                      />
                      <span className={`text-xs truncate font-medium ${task.completed ? 'line-through text-slate-400' : 'text-slate-700 dark:text-slate-200'}`}>
                        {task.text}
                      </span>
                    </label>
                    <button
                      onClick={() => handleDeleteTask(task.id)}
                      className="p-1 text-slate-300 hover:text-rose-500 rounded transition shrink-0 ml-2"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Daily Goals Panel */}
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-5 shadow-xs flex flex-col h-[300px]">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white font-sans uppercase tracking-wider mb-4 border-l-3 border-emerald-500 pl-3 flex items-center gap-1.5">
              <Target className="w-4 h-4 text-emerald-500" />
              {t.dailyGoals}
            </h3>

            {/* Quick add form */}
            <form onSubmit={handleAddGoal} className="flex gap-2 mb-4">
              <input
                type="text"
                placeholder={t.addGoal}
                value={goalText}
                onChange={(e) => setGoalText(e.target.value)}
                className="flex-1 px-3 py-1.5 text-xs border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50/50 dark:bg-slate-950 text-slate-800 dark:text-white focus:outline-hidden"
                id="input-goal-text"
              />
              <button
                type="submit"
                className="p-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition"
                id="btn-goal-add"
              >
                <Plus className="w-4 h-4" />
              </button>
            </form>

            {/* Goal items */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {goals.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-10">No daily milestones logged.</p>
              ) : (
                goals.map(goal => (
                  <div key={goal.id} className="flex items-center justify-between p-2.5 bg-emerald-50/20 dark:bg-emerald-950/5 border border-emerald-100/50 dark:border-emerald-900/10 rounded-xl">
                    <label className="flex items-center gap-3 cursor-pointer flex-1 min-w-0">
                      <input
                        type="checkbox"
                        checked={goal.completed}
                        onChange={() => handleToggleGoal(goal.id)}
                        className="w-4 h-4 accent-emerald-500 border-slate-300 dark:border-slate-700 rounded-sm"
                      />
                      <span className={`text-xs truncate font-bold font-sans ${goal.completed ? 'line-through text-slate-400' : 'text-slate-800 dark:text-slate-200'}`}>
                        🎯 {goal.text}
                      </span>
                    </label>
                    <button
                      onClick={() => handleDeleteGoal(goal.id)}
                      className="p-1 text-slate-300 hover:text-rose-500 rounded transition shrink-0 ml-2"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Pinned Memo Notepad */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/80 rounded-2xl p-6 shadow-xs flex flex-col min-h-[640px]">
          
          {/* Header toolbar */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center border-b border-slate-100 dark:border-slate-800 pb-4 mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-white font-sans uppercase tracking-wider border-l-3 border-emerald-500 pl-3">
                {t.memos}
              </h3>
            </div>
            
            <div className="flex gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:flex-initial">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                <input
                  type="text"
                  placeholder={t.searchNotes}
                  value={noteSearch}
                  onChange={(e) => setNoteSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1 text-xs border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50/50 dark:bg-slate-950 text-slate-800 dark:text-white focus:outline-hidden"
                  id="input-memo-search"
                />
              </div>
              <button
                onClick={openAddNoteModal}
                className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg shadow-sm transition shrink-0"
                id="btn-memo-add"
              >
                <Plus className="w-3.5 h-3.5" />
                {t.addNote}
              </button>
            </div>
          </div>

          {/* Notebook list area */}
          <div className="flex-1 overflow-y-auto space-y-4 pr-1 max-h-[500px]">
            {filteredMemos.length === 0 ? (
              <div className="text-center text-slate-400 py-24">
                <FileText className="w-12 h-12 mx-auto text-slate-300 mb-2" />
                <p className="text-xs font-semibold">No notes or memos match your query.</p>
              </div>
            ) : (
              <>
                {/* Pinned Section */}
                {pinnedMemos.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider block flex items-center gap-1 font-sans">
                      <Pin className="w-3 h-3 rotate-45" />
                      {t.pinnedNotes}
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {pinnedMemos.map(memo => (
                        <NoteCard 
                          key={memo.id} 
                          memo={memo} 
                          onOpen={openEditNoteModal} 
                          onTogglePin={handleTogglePinNote} 
                          onDelete={handleDeleteNote} 
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Regular Section */}
                {regularMemos.length > 0 && (
                  <div className="space-y-2 pt-2">
                    {pinnedMemos.length > 0 && (
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-sans">
                        Other Memos
                      </span>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {regularMemos.map(memo => (
                        <NoteCard 
                          key={memo.id} 
                          memo={memo} 
                          onOpen={openEditNoteModal} 
                          onTogglePin={handleTogglePinNote} 
                          onDelete={handleDeleteNote} 
                        />
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

        </div>

      </div>

      {/* Note View / Edit / Add Dialog Modal */}
      {isNoteModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            
            {/* Header */}
            <div className="px-6 py-4 bg-slate-50 dark:bg-slate-950/50 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
              <h3 className="text-sm font-bold text-slate-800 dark:text-white font-sans uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-500" />
                {editingNote ? 'Review Memo Note' : 'Create Memo Note'}
              </h3>
              <button
                onClick={() => setIsNoteModalOpen(false)}
                className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveNote} className="p-6 space-y-4">
              
              {/* Title */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Note Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Telebirr SMS Template"
                  value={noteTitle}
                  onChange={(e) => setNoteTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50/50 dark:bg-slate-950 text-slate-800 dark:text-white focus:outline-hidden focus:border-emerald-500 font-sans"
                />
              </div>

              {/* Content text */}
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Note Content
                </label>
                <textarea
                  rows={6}
                  placeholder="Type note details here..."
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 rounded-lg bg-slate-50/50 dark:bg-slate-950 text-slate-800 dark:text-white focus:outline-hidden focus:border-emerald-500 font-sans leading-relaxed"
                />
              </div>

              {/* Pinned state */}
              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={notePinned}
                  onChange={() => setNotePinned(!notePinned)}
                  className="w-4 h-4 accent-emerald-500 border-slate-300 rounded"
                />
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                  Pin this memo to the top of notepad
                </span>
              </label>

              {/* Action row */}
              <div className="flex justify-end gap-2 border-t border-slate-100 dark:border-slate-800 pt-4 mt-4">
                <button
                  type="button"
                  onClick={() => setIsNoteModalOpen(false)}
                  className="px-4 py-2 text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 font-semibold rounded-xl transition"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl shadow-md transition"
                  id="btn-memo-modal-submit"
                >
                  {t.save}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}

// Inner Memo Note Card Component
interface NoteCardProps {
  key?: string;
  memo: Memo;
  onOpen: (memo: Memo) => void;
  onTogglePin: (id: string) => void;
  onDelete: (id: string) => void;
}

function NoteCard({ memo, onOpen, onTogglePin, onDelete }: NoteCardProps) {
  return (
    <div className="bg-slate-50/60 hover:bg-slate-50 dark:bg-slate-950/20 dark:hover:bg-slate-950/45 border border-slate-200/40 dark:border-slate-800/40 rounded-xl p-4 flex flex-col justify-between group transition duration-150 relative h-[155px]">
      
      {/* Top Title */}
      <div>
        <div className="flex items-start justify-between gap-2">
          <h4 
            onClick={() => onOpen(memo)}
            className="text-xs font-bold font-sans text-slate-800 dark:text-slate-200 cursor-pointer hover:text-emerald-500 dark:hover:text-emerald-400 line-clamp-1 pr-4"
          >
            {memo.title}
          </h4>
          
          {/* Quick pin toggle button */}
          <button
            onClick={() => onTogglePin(memo.id)}
            className={`p-1 rounded-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition ${
              memo.isPinned ? 'text-emerald-500' : 'text-slate-300 hover:text-slate-400'
            }`}
          >
            <Pin className={`w-3 h-3 ${memo.isPinned ? 'rotate-0' : 'rotate-45'}`} />
          </button>
        </div>

        <p 
          onClick={() => onOpen(memo)}
          className="text-[11px] text-slate-400 dark:text-slate-500 mt-1.5 font-sans line-clamp-4 leading-relaxed cursor-pointer"
        >
          {memo.content}
        </p>
      </div>

      {/* Footer Meta */}
      <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-200/20 dark:border-slate-800/20">
        <span className="text-[9px] font-mono text-slate-400 flex items-center gap-1 shrink-0">
          <Calendar className="w-2.5 h-2.5" />
          {memo.date}
        </span>
        
        {/* Delete & Edit hover actions */}
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition duration-150 shrink-0">
          <button
            onClick={() => onOpen(memo)}
            className="p-1 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 text-slate-400 hover:text-emerald-500 rounded"
          >
            <Edit className="w-3 h-3" />
          </button>
          <button
            onClick={() => onDelete(memo.id)}
            className="p-1 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-slate-400 hover:text-rose-500 rounded"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>

    </div>
  );
}
