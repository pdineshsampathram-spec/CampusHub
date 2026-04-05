import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { studySyncService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { 
  BrainCircuit, 
  ChevronRight, 
  ChevronLeft, 
  Trophy, 
  RotateCcw, 
  Home, 
  CheckCircle2, 
  AlertCircle, 
  Loader2,
  BookOpen,
  Users,
  Sparkles
} from 'lucide-react';

export default function StudyQuiz() {
  const { groupId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [quiz, setQuiz] = useState(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState({}); // { index: choice_index }
  const [showResults, setShowResults] = useState(false);
  
  const [mode, setMode] = useState('selection'); // 'selection', 'quiz'
  const [customText, setCustomText] = useState('');
  const [subject, setSubject] = useState('');

  const generateQuiz = async () => {
    setLoading(true);
    try {
      const res = await studySyncService.generateStandaloneQuiz({
        group_id: groupId,
        subject: subject || undefined,
        text_content: customText || undefined,
        num_questions: 5
      });
      
      if (res.success) {
        setQuiz(res.data);
        setMode('quiz');
        setAnswers({});
        setCurrentIdx(0);
        setShowResults(false);
        toast.success("AI Quiz meticulously generated!");
      }
    } catch (err) {
      toast.error(err.message || "Failed to generate quiz");
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (choiceIdx) => {
    if (showResults) return;
    setAnswers({ ...answers, [currentIdx]: choiceIdx });
  };

  const calculateScore = () => {
    let score = 0;
    quiz.forEach((q, i) => {
      if (answers[i] === q.answer) score++;
    });
    return score;
  };

  if (mode === 'selection') {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card max-w-2xl w-full p-8 text-center"
        >
          <div className="w-16 h-16 bg-indigo-600/20 text-indigo-400 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-indigo-500/30">
            <BrainCircuit size={32} />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2 font-display">AI Assessment Arena</h1>
          <p className="text-slate-400 mb-8">Choose your challenge context. CampusBot will craft a custom evaluation for you.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            <button 
              onClick={() => { setCustomText(''); setSubject(''); generateQuiz(); }}
              className="p-6 bg-slate-800/50 border border-slate-700 rounded-2xl hover:border-indigo-500/50 transition-all text-left group"
            >
              <Users size={24} className="text-emerald-400 mb-3 group-hover:scale-110 transition-transform" />
              <h3 className="text-white font-bold mb-1 font-display uppercase tracking-widest text-xs">Group Context</h3>
              <p className="text-xs text-slate-500">Based on your group's current task list and goals.</p>
            </button>
            <div className="p-6 bg-slate-800/50 border border-slate-700 rounded-2xl text-left">
              <BookOpen size={24} className="text-indigo-400 mb-3" />
              <h3 className="text-white font-bold mb-2 font-display uppercase tracking-widest text-xs">Specific Subject</h3>
              <input 
                type="text" 
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Data Structures"
                className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-sm text-white focus:border-indigo-500 outline-none"
              />
            </div>
          </div>

          <div className="mb-8">
            <p className="text-left text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Or Paste Study Material</p>
            <textarea 
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              placeholder="Paste lecture notes or text here for a high-accuracy custom quiz..."
              className="w-full h-32 bg-slate-900/50 border border-slate-700 rounded-xl p-4 text-sm text-slate-300 focus:border-indigo-500 outline-none resize-none custom-scrollbar"
            />
          </div>

          <button 
            onClick={generateQuiz}
            disabled={loading} 
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 overflow-hidden"
          >
            {loading ? <Loader2 size={20} className="animate-spin" /> : <><Sparkles size={18} /> Enter the Arena</>}
          </button>
        </motion.div>
      </div>
    );
  }

  const q = quiz[currentIdx];
  const progress = ((currentIdx + 1) / quiz.length) * 100;

  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center p-4">
      <div className="max-w-3xl w-full">
        
        {/* Header / Progress */}
        <div className="flex items-center justify-between mb-8">
          <button onClick={() => setMode('selection')} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors">
            <ChevronLeft size={20} /> Back
          </button>
          <div className="flex-1 max-w-md mx-8">
            <div className="flex justify-between items-end mb-2">
               <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Question {currentIdx + 1} of {quiz.length}</p>
               <p className="text-[10px] font-bold text-indigo-400">{Math.round(progress)}% Complete</p>
            </div>
            <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden">
               <motion.div 
                 initial={{ width: 0 }}
                 animate={{ width: `${progress}%` }}
                 className="h-full bg-indigo-500" 
               />
            </div>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-600/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <BrainCircuit size={20} />
          </div>
        </div>

        <AnimatePresence mode="wait">
          {!showResults ? (
            <motion.div 
              key={currentIdx}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="glass-card p-8 md:p-12 border border-slate-700/50"
            >
              <h2 className="text-2xl font-bold text-white mb-10 leading-tight">
                {q.question}
              </h2>

              <div className="space-y-4">
                {q.options.map((opt, i) => {
                  const isSelected = answers[currentIdx] === i;
                  return (
                    <button
                      key={i}
                      onClick={() => handleSelect(i)}
                      className={`w-full p-5 rounded-2xl text-left border transition-all flex items-center justify-between group
                        ${isSelected 
                          ? 'bg-indigo-600/20 border-indigo-500 text-white ring-1 ring-indigo-500' 
                          : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:bg-slate-800 hover:border-slate-700'
                        }`}
                    >
                      <span className="flex items-center gap-4">
                        <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold border transition-colors
                          ${isSelected ? 'bg-indigo-500 border-indigo-400 text-white' : 'bg-slate-950 border-slate-800 text-slate-500 group-hover:border-slate-600'}
                        `}>
                          {String.fromCharCode(65 + i)}
                        </span>
                        <span className="font-medium text-sm md:text-base">{opt}</span>
                      </span>
                      {isSelected && <CheckCircle2 size={20} className="text-indigo-400" />}
                    </button>
                  );
                })}
              </div>

              <div className="mt-12 flex justify-between items-center">
                <button 
                  disabled={currentIdx === 0}
                  onClick={() => setCurrentIdx(prev => prev - 1)}
                  className="px-6 py-3 rounded-xl text-slate-400 hover:text-white disabled:opacity-30 transition-all flex items-center gap-2"
                >
                  <ChevronLeft size={18} /> Previous
                </button>
                
                {currentIdx === quiz.length - 1 ? (
                  <button 
                    onClick={() => setShowResults(true)}
                    disabled={answers[currentIdx] === undefined}
                    className="px-10 py-3 bg-emerald-500 hover:bg-emerald-400 text-white font-bold rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.2)] transition-all disabled:opacity-50"
                  >
                    Finish Assessment
                  </button>
                ) : (
                  <button 
                    onClick={() => setCurrentIdx(prev => prev + 1)}
                    disabled={answers[currentIdx] === undefined}
                    className="px-10 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/20 transition-all disabled:opacity-50 flex items-center gap-2"
                  >
                    Next Question <ChevronRight size={18} />
                  </button>
                )}
              </div>
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-card p-12 text-center border border-slate-700/50"
            >
              <div className="w-24 h-24 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-8 border-4 border-emerald-500/30">
                <Trophy size={48} className="animate-bounce" />
              </div>
              <h2 className="text-4xl font-black text-white mb-2 font-display">Assessment Complete</h2>
              <div className="inline-block px-4 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] mb-8">
                Verified SCORE
              </div>
              
              <div className="text-7xl font-black text-white mb-10 flex flex-col gap-2">
                 <span>{calculateScore()} / {quiz.length}</span>
                 <span className="text-lg text-slate-400 font-medium tracking-normal">Correct Responses</span>
              </div>

              <div className="flex flex-col md:flex-row gap-4 max-w-md mx-auto mb-10">
                 <button 
                   onClick={() => setMode('selection')}
                   className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-600/20"
                 >
                   <RotateCcw size={18} /> Retake
                 </button>
                 <button 
                   onClick={() => navigate(`/study-group/${groupId}`)}
                   className="flex-1 py-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl flex items-center justify-center gap-2 transition-all border border-slate-700"
                 >
                   <Home size={18} /> Exit Arena
                 </button>
              </div>

              <div className="text-left bg-slate-950/40 rounded-2xl p-6 border border-slate-800/50">
                 <h4 className="text-slate-100 font-bold mb-4 flex items-center gap-2 text-xs uppercase tracking-widest opacity-70"><BookOpen size={16} className="text-indigo-400" /> Review Analytics</h4>
                 <div className="space-y-4">
                   {quiz.map((q, i) => {
                     const isCorrect = answers[i] === q.answer;
                     if (isCorrect) return null;
                     return (
                       <div key={i} className="flex gap-3 items-start border-l-2 border-red-500/30 pl-4 py-1">
                          <div className="pt-1"><AlertCircle size={14} className="text-red-400/70" /></div>
                          <div>
                            <p className="text-xs text-slate-200 font-medium mb-1">{q.question}</p>
                            <p className="text-[10px] text-slate-500">Correct: <span className="text-emerald-400">{q.options[q.answer]}</span></p>
                          </div>
                       </div>
                     );
                   })}
                   {calculateScore() === quiz.length && (
                     <div className="flex items-center gap-3 text-emerald-400">
                        <CheckCircle2 size={24} />
                        <p className="text-sm font-bold italic">Perfect Score! Your mastery is undisputed.</p>
                     </div>
                   )}
                 </div>
              </div>

            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
