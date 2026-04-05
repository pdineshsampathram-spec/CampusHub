import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { studySyncService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Clock, Users, CheckCircle, BookOpen, Send, Bot, Sparkles, LogOut, Loader2, Trophy, UploadCloud, FileText, Download, Play, Square, BrainCircuit, BarChart2 } from 'lucide-react';

const StreamText = ({ content, timestamp }) => {
  const [display, setDisplay] = useState("");
  const [index, setIndex] = useState(0);
  
  // Only stream if message was created very recently (within 5 seconds of rendering)
  const isFresh = new Date(timestamp) > new Date(Date.now() - 5000);

  useEffect(() => {
    if (!isFresh) {
      setDisplay(content);
      setIndex(content.length);
      return;
    }
    if (index < content.length) {
      // Chunking by 2 characters to create a smoother/faster stream effect
      const timeout = setTimeout(() => {
        setDisplay(prev => prev + content.slice(index, index + 2));
        setIndex(prev => prev + 2);
      }, 15); // High speed simulation
      return () => clearTimeout(timeout);
    }
  }, [index, content, isFresh]);

  return <>{display}{index < content.length && <span className="inline-block w-1.5 h-3.5 ml-1 align-middle bg-neon-green animate-pulse" />}</>;
};

export default function StudyGroupDashboard() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [group, setGroup] = useState(null);
  const [messages, setMessages] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [newMessage, setNewMessage] = useState('');
  const [newTask, setNewTask] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  
  // Hackathon Upgrade States
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [focusTime, setFocusTime] = useState(25 * 60);
  const [isFocusing, setIsFocusing] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);
  const fileInputRef = useRef(null);
  
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);
  const isInitialLoad = useRef(true);

  const fetchData = async () => {
    try {
      // 1. Get Group Details
      const gRes = await studySyncService.getMyGroups();
      const currentGroup = gRes.data?.find(g => g.group_id === groupId);
      if (!currentGroup) {
        toast.error("Group not found");
        navigate('/study-sync');
        return;
      }
      setGroup(currentGroup);

      // 2. Get Tasks
      const tRes = await studySyncService.getTasks(groupId);
      setTasks(tRes.data || []);
      
      // 3. Get Chat
      await fetchChat();
      
      // 4. Get Files
      try {
        const fRes = await studySyncService.getGroupFiles(groupId);
        setFiles(fRes.data || []);
      } catch (e) {}
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchChat = async () => {
    try {
      const cRes = await studySyncService.getGroupChat(groupId);
      setMessages(cRes.data || []);
    } catch (e) {
      console.error("Failed to fetch chat");
    }
  };

  useEffect(() => {
    fetchData();
    // Start Polling for Chat
    const interval = setInterval(() => {
      fetchChat();
    }, 2000);
    return () => clearInterval(interval);
  }, [groupId]);

  useEffect(() => {
    if (isInitialLoad.current && messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
      isInitialLoad.current = false;
      return;
    }
    
    if (chatContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
      // Scroll smoothly only if the user is near the bottom
      if (scrollHeight - scrollTop - clientHeight < 250) {
         messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    
    // Check if it's an AI Query
    const query = newMessage.trim();
    setNewMessage('');
    
    // Optimistic UI for my message
    const tempId = Date.now().toString();
    setMessages(prev => [...prev, {
      id: tempId,
      sender_id: user?.id,
      sender_name: user?.name,
      message: query,
      timestamp: new Date().toISOString()
    }]);

    try {
      await studySyncService.sendMessage(groupId, query);
      
      // If asking AI
      const lowerQ = query.toLowerCase();
      // Only call if exactly these triggers
      if (lowerQ.includes('explain') || lowerQ.includes('what') || lowerQ.includes('how') || lowerQ.includes('why') || lowerQ.startsWith('@campusbot')) {
        setIsAiLoading(true);
        try {
          await studySyncService.getAiHelp(groupId, query);
          fetchChat();
        } catch (err) {
          toast.error("CampusBot is busy, try again");
        } finally {
          setIsAiLoading(false);
        }
      }
    } catch (err) {
      toast.error("Failed to send message");
    }
  };

  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTask.trim()) return;
    try {
      await studySyncService.addTask(groupId, newTask);
      setNewTask('');
      const tRes = await studySyncService.getTasks(groupId);
      setTasks(tRes.data || []);
    } catch (err) {
      toast.error('Failed to add task');
    }
  };

  const handleToggleTask = async (taskId, currentStatus) => {
    try {
      await studySyncService.updateTask(taskId, !currentStatus);
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, completed: !currentStatus } : t));
    } catch (err) {
      toast.error('Failed to update task');
    }
  };

  // Hackathon Handlers
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Improved Validation: Check both type and extension
    const allowedExtensions = ['.pdf', '.png', '.jpg', '.jpeg', '.docx', '.txt', '.pptx'];
    const fileExt = file.name.slice((file.name.lastIndexOf(".") - 1 >>> 0) + 2).toLowerCase();
    const isAllowedExt = allowedExtensions.includes('.' + fileExt);
    
    if (!isAllowedExt) {
      toast.error("Invalid file type. Allowed: PDF, Images, DOCX, TXT, PPTX");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File exceeds 5MB limit");
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('group_id', groupId);
    formData.append('file', file);
    
    try {
      const loadingToast = toast.loading("Uploading to Group Vault...");
      await studySyncService.uploadGroupFile(formData);
      toast.dismiss(loadingToast);
      toast.success("Resource shared!");
      const fRes = await studySyncService.getGroupFiles(groupId);
      setFiles(fRes.data || []);
      fetchChat();
    } catch (err) {
      toast.dismiss();
      toast.error(err.response?.data?.message || "Upload failed");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleAnalyze = async (file) => {
    const t = toast.loading(`CampusBot is reading ${file.file_name}...`);
    try {
      await studySyncService.analyzeFile(groupId, file.id, "Provide a comprehensive summary and 3 key takeaways.");
      fetchChat();
      toast.dismiss(t);
      toast.success("Analysis complete, check the chat!");
    } catch (err) {
      toast.dismiss(t);
      toast.error("Failed to analyze file");
    }
  };

  const formatTime = (secs) => `${Math.floor(secs / 60).toString().padStart(2, '0')}:${(secs % 60).toString().padStart(2, '0')}`;

  const handleBookSeat = async () => {
    const t = toast.loading("Reserving Group Zone seat...");
    try {
      const res = await studySyncService.bookGroupSeat(groupId);
      toast.dismiss(t);
      if (res.success) {
        toast.success(`Success! Reserved ${res.data.seat_id} for ${res.data.date} at ${res.data.time}`, { duration: 5000 });
        // Optional: Post booking notification to chat
        await studySyncService.sendMessage(groupId, `📅 I have reserved a library seat for our session: ${res.data.seat_id} on ${res.data.date} at ${res.data.time}`);
        fetchChat();
      } else {
        toast.error(res.message || "Booking failed");
      }
    } catch (err) {
      toast.dismiss(t);
      toast.error(err.response?.data?.message || "All group seats are taken or time format is invalid");
    }
  };

  useEffect(() => {
    let focusInterval;
    if (isFocusing && focusTime > 0) {
      focusInterval = setInterval(() => setFocusTime(v => v - 1), 1000);
    } else if (focusTime === 0) {
      setIsFocusing(false);
      toast.success("Focus Session Complete! Great job 🎯");
      setFocusTime(25 * 60);
    }
    return () => clearInterval(focusInterval);
  }, [isFocusing, focusTime]);

  // Helper string to color
  const stringToColor = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
    return `hsl(${Math.abs(hash) % 360}, 70%, 65%)`;
  };

  if (loading || !group) return (
    <div className="flex justify-center items-center h-[60vh]">
       <Loader2 className="animate-spin text-neon-green" size={40} />
    </div>
  );

  const completedTasks = tasks.filter(t => t.completed).length;
  const progress = tasks.length ? Math.round((completedTasks / tasks.length) * 100) : 0;

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col xl:flex-row gap-6 p-4">
      
      {/* LEFT PANEL: Group Vibe & Roster */}
      <div className="w-full xl:w-72 flex flex-col gap-5 shrink-0 h-full overflow-hidden">
        <div className="glass-card p-5 bg-gradient-to-br from-slate-800/80 to-slate-900/80">
          <div className="flex items-center gap-3 mb-4">
             <div className="w-12 h-12 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-indigo-600/20">
               {group?.subject?.charAt(0).toUpperCase()}
             </div>
             <div>
               <h2 className="text-white font-bold leading-tight truncate w-32">{group?.subject}</h2>
               <div className="flex items-center gap-2">
                  <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider">Active Squad</p>
                  <button 
                    onClick={() => navigate('/study-stats')}
                    className="p-1 hover:bg-white/10 rounded text-slate-400 hover:text-indigo-400 transition-colors"
                    title="View Analytics"
                  >
                    <BarChart2 size={12} />
                  </button>
               </div>
             </div>
          </div>
          <div className="space-y-4">
             <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500">Compatibility</span>
                <span className="text-emerald-400 font-bold">{group?.compatibility_score?.toFixed(0)}%</span>
             </div>
             <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500" style={{ width: `${group?.compatibility_score}%` }} />
             </div>
          </div>
          <button onClick={() => navigate(`/study-quiz/${groupId}`)} className="w-full mt-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold uppercase tracking-widest rounded-lg flex items-center justify-center gap-2 transition-all">
            <BrainCircuit size={14} /> Enter Quiz Arena
          </button>
        </div>

        <div className="glass-card flex-1 p-5 overflow-hidden flex flex-col">
          <h3 className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] mb-4 flex items-center gap-2">
            <Users size={14} /> Squad Members
          </h3>
          <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 mb-6">
             {group?.members?.map((m, i) => (
                <div key={m.id || i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors group">
                  <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-400">
                    {m.name?.[0] || '?'}
                  </div>
                  <div className="flex-1 min-w-0 text-xs">
                    <p className="text-slate-200 font-medium truncate">{m.name}</p>
                    <div className="flex items-center gap-1">
                       <span className="w-1 h-1 rounded-full bg-emerald-500"></span>
                       <span className="text-[9px] text-slate-500">{m.department || 'Active'}</span>
                    </div>
                  </div>
                </div>
              ))}
          </div>

          <div className="pt-4 border-t border-slate-800/50">
             <div className="bg-indigo-600/10 border border-indigo-500/20 rounded-xl p-3">
                <div className="flex items-center gap-2 mb-2">
                  <BookOpen size={14} className="text-indigo-400" />
                  <span className="text-[10px] font-bold text-white uppercase tracking-wider">Library Sync</span>
                </div>
                <p className="text-[10px] text-slate-400 mb-3 leading-relaxed"> reserve a shared zone for {group?.meeting_time || 'your next session'}.</p>
                <button 
                  onClick={handleBookSeat}
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-black uppercase tracking-widest rounded-lg transition-all"
                >
                  Book Group Seat
                </button>
             </div>
          </div>
        </div>

        <div className="glass-card p-4 bg-slate-900/60 flex items-center justify-between border-slate-800">
           <div className="flex items-center gap-3">
             <Clock size={16} className={isFocusing ? "text-red-400 animate-pulse" : "text-slate-500"} />
             <span className="text-sm font-mono text-white font-bold">{formatTime(focusTime)}</span>
           </div>
           <button onClick={() => setIsFocusing(!isFocusing)} className="p-1.5 rounded-md hover:bg-white/5">
              {isFocusing ? <Square size={14} className="text-red-400 fill-current" /> : <Play size={14} className="text-emerald-400 fill-current" />}
           </button>
        </div>
      </div>

      {/* CENTER: Chat Hub */}
      <div className="flex-1 glass-card flex flex-col h-full bg-slate-900/30 overflow-hidden border-slate-800/50">
        <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/40">
          <h3 className="text-white font-bold text-sm tracking-wide">Sync Stream</h3>
          <button onClick={() => navigate('/study-sync')} className="p-2 text-slate-500 hover:text-white"><LogOut size={18} /></button>
        </div>
        <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-fixed">
           {messages.length === 0 ? (
             <div className="h-full flex flex-col items-center justify-center opacity-30">
                <Bot size={64} className="text-slate-600 mb-4" />
                <p className="text-[10px] font-black uppercase">Awaiting Communication</p>
             </div>
           ) : (
             messages.map((msg, i) => (
               <div key={msg.id || i} className={`flex flex-col ${msg.sender_id === user?.id ? 'items-end' : 'items-start'}`}>
                 <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                   className={`max-w-[75%] rounded-2xl px-5 py-3 text-sm whitespace-pre-wrap
                     ${msg.sender_id === user?.id ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-100'}`}
                 >
                   {msg.sender_id === 'ai-assistant' ? <StreamText content={msg.message} timestamp={msg.timestamp} /> : msg.message}
                 </motion.div>
               </div>
             ))
           )}
           <div ref={messagesEndRef} />
        </div>
        <form onSubmit={handleSendMessage} className="px-6 py-4 bg-slate-900/50 border-t border-slate-800 relative">
          <input type="text" value={newMessage} onChange={e => setNewMessage(e.target.value)} placeholder="Type here..." 
            className="w-full bg-slate-950/80 border border-slate-800 text-slate-100 rounded-xl py-4 pl-6 pr-16 outline-none" />
          <button type="submit" disabled={!newMessage.trim()} className="absolute right-9 top-1/2 -translate-y-1/2 p-2 bg-indigo-600 text-white rounded-lg"><Send size={18} /></button>
        </form>
      </div>

      {/* RIGHT: Tasks & Files */}
      <div className="w-full xl:w-80 flex flex-col gap-6 shrink-0 h-full overflow-hidden">
        <div className="glass-card flex-1 p-5 flex flex-col overflow-hidden">
           <h3 className="text-white font-bold text-xs uppercase tracking-widest flex items-center gap-2 mb-4"><CheckCircle size={14} /> Tasks</h3>
           <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-1 mb-4">
             {tasks.map(t => (
               <div key={t.id} className="flex items-start gap-3 p-3 rounded-xl bg-slate-800/40 border border-slate-700/50">
                 <button onClick={() => handleToggleTask(t.id, t.completed)}><CheckCircle size={18} className={t.completed ? "text-emerald-500" : "text-slate-600"} /></button>
                 <p className={`text-xs ${t.completed ? 'line-through text-slate-500' : 'text-slate-300'}`}>{t.task}</p>
               </div>
             ))}
           </div>
           <form onSubmit={handleAddTask} className="relative">
             <input type="text" value={newTask} onChange={e => setNewTask(e.target.value)} placeholder="Objective..." className="w-full bg-slate-950/60 border border-slate-800 text-white text-xs rounded-xl py-3 pl-4 pr-10 outline-none" />
             <button type="submit" className="absolute right-2 top-2 p-1.5 bg-indigo-600 text-white rounded-lg"><Sparkles size={14} /></button>
           </form>
        </div>

        <div className="glass-card flex-1 p-5 flex flex-col overflow-hidden">
          <div className="flex items-center justify-between mb-4">
             <h3 className="text-white font-bold text-xs uppercase tracking-widest flex items-center gap-2"><FileText size={14} /> Resources</h3>
             <button onClick={() => fileInputRef.current?.click()} className="p-1.5 bg-slate-800 text-slate-400 rounded-lg hover:text-white transition-all"><UploadCloud size={14} /></button>
             <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept=".pdf,.png,.jpg,.jpeg,.docx" />
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2.5 pr-1">
             {files.map(f => (
                <div key={f.id} className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-3">
                   <div className="flex justify-between mb-2">
                      <div className="flex gap-1">
                        <button onClick={() => setPreviewFile(f)} className="p-1.5 text-slate-500 hover:text-white transition-colors" title="Preview">
                           <Play size={12} />
                        </button>
                        <a href={`http://127.0.0.1:8000${f.file_url}`} target="_blank" rel="noreferrer" className="p-1.5 text-slate-500 hover:text-white transition-colors" title="Download">
                          <Download size={12} />
                        </a>
                      </div>
                   </div>
                   <p className="text-[11px] text-slate-200 font-bold truncate">{f.file_name}</p>
                   {f.file_name.toLowerCase().endsWith('.pdf') && (
                     <button onClick={() => handleAnalyze(f)} className="w-full mt-2 py-1.5 bg-neon-green/10 text-neon-green text-[9px] font-black uppercase rounded-lg">AI Summary ✨</button>
                   )}
                </div>
             ))}
          </div>
        </div>
      </div>

      {/* File Preview Modal */}
      <AnimatePresence>
        {previewFile && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10 pointer-events-none">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setPreviewFile(null)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm pointer-events-auto"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-5xl h-full bg-slate-900 rounded-3xl border border-slate-800 shadow-2xl overflow-hidden flex flex-col pointer-events-auto"
            >
              <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900/50">
                <div className="flex items-center gap-3">
                  <FileText className="text-indigo-400" size={20} />
                  <span className="text-white font-bold text-sm truncate max-w-md">{previewFile.file_name}</span>
                </div>
                <button onClick={() => setPreviewFile(null)} className="p-2 hover:bg-white/5 rounded-full text-slate-500 hover:text-white transition-all">
                  <Square size={20} className="rotate-45" />
                </button>
              </div>
              <div className="flex-1 bg-slate-950 overflow-hidden">
                {previewFile.file_name.toLowerCase().endsWith('.pdf') ? (
                  <iframe 
                    src={`http://127.0.0.1:8000${previewFile.file_url}`} 
                    className="w-full h-full border-none"
                    title="PDF Preview"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center p-4">
                    <img 
                      src={`http://127.0.0.1:8000${previewFile.file_url}`} 
                      alt="Preview" 
                      className="max-w-full max-h-full object-contain rounded-xl"
                    />
                  </div>
                )}
              </div>
              <div className="p-4 border-t border-slate-800 flex justify-center bg-slate-900/50">
                <a 
                  href={`http://127.0.0.1:8000${previewFile.file_url}`} 
                  target="_blank" 
                  rel="noreferrer"
                  className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold rounded-xl flex items-center gap-2"
                >
                  <Download size={16} /> Download Full Resource
                </a>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
