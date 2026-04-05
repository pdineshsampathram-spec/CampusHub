import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { studySyncService } from '../services/api';
import toast from 'react-hot-toast';
import { Check, Calendar, Clock, Star, Users, BookOpen } from 'lucide-react';

const SUBJECTS = ["Data Structures", "Database Management", "Operating Systems", "Computer Networks", "Machine Learning", "Web Development"];
const TIMES = ["Mon 10-11", "Tue 14-15", "Wed 16-17", "Thu 11-12", "Fri 10-11"];

export default function StudySyncPage() {
  const [subjects, setSubjects] = useState([]);
  const [availability, setAvailability] = useState([]);
  const [skill, setSkill] = useState(3);
  
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [matchResult, setMatchResult] = useState(null);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const [prefRes, groupsRes] = await Promise.all([
          studySyncService.getMyPreference().catch(() => ({ data: null })),
          studySyncService.getMyGroups().catch(() => ({ data: [] }))
        ]);
        
        if (groupsRes.data && groupsRes.data.length > 0) {
          setMatchResult(groupsRes.data[0]);
        } else if (prefRes.data && prefRes.data.status === 'searching') {
          setIsSearching(true);
        }
      } catch (e) {}
    };
    fetchStatus();
  }, []);

  const toggleSubject = (sub) => {
    setSubjects(prev => prev.includes(sub) ? prev.filter(s => s !== sub) : [...prev, sub]);
  };

  const toggleTime = (time) => {
    setAvailability(prev => prev.includes(time) ? prev.filter(t => t !== time) : [...prev, time]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (subjects.length === 0 || availability.length === 0) {
      toast.error('Please select at least one subject and time slot');
      return;
    }
    setLoading(true);
    try {
      const res = await studySyncService.findGroup({
        subjects,
        availability,
        skill_level: skill
      });
      
      // Simulate real-time finding for demo wow effect
      setTimeout(() => {
        setLoading(false);
        if (res.data && res.data.status === 'searching') {
          setIsSearching(true);
          toast.success("Added to waiting queue!");
        } else {
          setMatchResult(res.data);
          toast.success("Match Found!");
        }
      }, 1500);
    } catch (e) {
      setLoading(false);
      toast.error(e.message || 'Error finding group');
    }
  };

  if (matchResult) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4, type: "spring", bounce: 0.4 }}
        className="max-w-3xl mx-auto mt-10"
      >
        <div className="bg-slate-900/60 backdrop-blur-xl border border-neon-green/30 rounded-3xl p-8 shadow-[0_0_40px_rgba(0,255,136,0.15)] relative overflow-hidden">
          {/* Confetti / wow effect bg */}
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-neon-green/5 to-transparent pointer-events-none" />
          
          <div className="text-center mb-10">
             <motion.div 
               initial={{ scale: 0, rotate: -90 }}
               animate={{ scale: 1, rotate: 0 }}
               transition={{ delay: 0.2, type: "spring" }}
               className="inline-flex items-center justify-center w-28 h-28 rounded-full bg-slate-800 border-4 border-neon-green shadow-[0_0_30px_rgba(0,255,136,0.5)] mb-6 relative"
             >
                <div className="absolute inset-0 rounded-full border border-neon-green/30 animate-pulse-slow"></div>
                <span className="text-4xl font-extrabold text-neon-green flex items-baseline">
                   {matchResult.compatibility_score}<span className="text-2xl">%</span>
                </span>
             </motion.div>
             <h2 className="text-3xl font-extrabold text-white font-grotesk tracking-wide">Match Found!</h2>
             <div className="mt-4 inline-flex items-center justify-center gap-2 px-5 py-2 bg-slate-800/80 rounded-full border border-slate-700">
               <Clock size={16} className="text-neon-green" /> 
               <span className="text-slate-300 tracking-wide text-sm">Meeting Time:</span> 
               <span className="text-neon-green font-bold">{matchResult.meeting_time}</span>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {matchResult.members && matchResult.members.map((member, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + (idx * 0.1) }}
                whileHover={{ scale: 1.02 }}
                className="bg-slate-800/80 border border-slate-700 p-4 rounded-2xl flex items-center gap-4 hover:border-neon-green/50 transition-colors shadow-sm"
              >
                <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-green-400 to-neon-green flex items-center justify-center text-slate-900 font-bold text-xl shadow-[0_0_10px_rgba(0,255,136,0.3)]">
                   {member.name.charAt(0)}
                </div>
                <div>
                   <p className="text-white font-semibold text-lg">{member.name}</p>
                   <p className="text-slate-400 text-sm">{member.department || 'Student'}</p>
                </div>
              </motion.div>
            ))}
          </div>
          
          <div className="flex gap-4">
             <button 
                onClick={() => navigate(`/study-group/${matchResult.group_id}`)}
                className="flex-1 bg-neon-green hover:bg-green-400 text-slate-900 font-bold py-3.5 rounded-xl transition-all shadow-[0_0_15px_rgba(0,255,136,0.4)] hover:shadow-[0_0_25px_rgba(0,255,136,0.6)] flex items-center justify-center gap-2 active:scale-95"
             >
                <Users size={18} /> Enter Study Group
             </button>
             <button 
                onClick={() => setMatchResult(null)}
                className="flex-[0.5] border border-slate-600 hover:border-slate-400 hover:bg-slate-800 text-slate-300 font-semibold py-3.5 rounded-xl transition-all active:scale-95"
             >
                Go Back
             </button>
          </div>
        </div>
      </motion.div>
    );
  }

  if (isSearching) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl mx-auto mt-20 text-center">
        <div className="bg-slate-900/60 backdrop-blur-xl border border-neon-green/30 rounded-3xl p-12 shadow-[0_0_40px_rgba(0,255,136,0.15)]">
           <div className="w-24 h-24 rounded-full border-4 border-slate-700 border-t-neon-green border-r-neon-green animate-spin mx-auto mb-8 shadow-[0_0_30px_rgba(0,255,136,0.2)]"></div>
           <h2 className="text-3xl font-extrabold text-white font-grotesk tracking-wide mb-4">Searching for your perfect peer...</h2>
           <p className="text-slate-400">You are currently in the queue. We'll automatically match you as soon as someone with similar interests and availability joins!</p>
           <button 
              onClick={() => setIsSearching(false)}
              className="mt-8 px-6 py-3 border border-slate-600 hover:border-slate-400 text-slate-300 rounded-xl transition-colors"
           >
              Update Preferences
           </button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto pb-12">
      <div className="mb-8 text-center pt-4">
        <div className="inline-flex items-center justify-center p-3 bg-neon-green/10 rounded-2xl mb-4 border border-neon-green/20">
          <BookOpen size={28} className="text-neon-green" />
        </div>
        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-neon-green font-grotesk tracking-wide drop-shadow-md">StudySync</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">AI-driven study group matchmaking.</p>
      </div>

      <div className="glass-card p-6 md:p-8 border !border-neon-green/20 relative overflow-hidden">
        {/* Decorative corner glow */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-neon-green/20 blur-[60px] rounded-full pointer-events-none"></div>

        <form onSubmit={handleSubmit} className="space-y-8 relative z-10">
          {/* Subjects */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-300 mb-4 uppercase tracking-wider">
               <BookOpen size={16} className="text-neon-green" /> Interests / Subjects
            </label>
            <div className="flex flex-wrap gap-2.5">
              {SUBJECTS.map(sub => (
                <button
                  key={sub}
                  type="button"
                  onClick={() => toggleSubject(sub)}
                  className={`px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-200 border md:hover:scale-105 active:scale-95
                    ${subjects.includes(sub) 
                      ? 'bg-neon-green/10 text-neon-green border-neon-green shadow-[0_0_15px_rgba(0,255,136,0.2)]' 
                      : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:border-slate-500'}`}
                >
                  {sub}
                </button>
              ))}
            </div>
          </div>

          {/* Availability */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-300 mb-4 uppercase tracking-wider">
               <Clock size={16} className="text-neon-green" /> Free Time Slots
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {TIMES.map(time => (
                <button
                  key={time}
                  type="button"
                  onClick={() => toggleTime(time)}
                  className={`py-3.5 rounded-xl text-sm font-medium transition-all duration-200 border md:hover:scale-105 active:scale-95 flex items-center justify-center gap-2
                    ${availability.includes(time) 
                      ? 'bg-neon-green/10 text-neon-green border-neon-green shadow-[0_0_15px_rgba(0,255,136,0.2)]' 
                      : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:border-slate-500'}`}
                >
                  {availability.includes(time) && <Check size={16} className="text-neon-green" />} {time}
                </button>
              ))}
            </div>
          </div>

          {/* Skill Level */}
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-slate-300 mb-4 uppercase tracking-wider">
               <Star size={16} className="text-neon-green" /> Self-Assessed Skill Level (1-5)
            </label>
            <div className="flex items-center gap-5 bg-slate-800/50 p-5 rounded-2xl border border-slate-700">
              <span className="text-slate-500 font-bold text-lg">1</span>
              <input 
                type="range" 
                min="1" max="5" 
                value={skill} 
                onChange={(e) => setSkill(parseInt(e.target.value))}
                className="w-full h-2.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-neon-green focus:outline-none focus:ring-2 focus:ring-neon-green/50"
              />
              <motion.span 
                 key={skill}
                 initial={{ scale: 1.5, color: '#fff' }}
                 animate={{ scale: 1, color: '#00FF88' }}
                 transition={{ duration: 0.3 }}
                 className="font-extrabold text-2xl w-6 text-center"
              >
                 {skill}
              </motion.span>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-6">
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 rounded-xl font-bold text-lg tracking-wide transition-all duration-300 flex items-center justify-center gap-3 relative overflow-hidden
                ${loading 
                  ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed' 
                  : 'bg-neon-green hover:bg-green-400 text-slate-900 shadow-[0_0_20px_rgba(0,255,136,0.3)] hover:shadow-[0_0_30px_rgba(0,255,136,0.6)] hover:-translate-y-1 active:scale-95'
                }`}
            >
              {loading && (
                 <div className="absolute inset-0 bg-slate-800 flex items-center justify-center gap-3 z-10 w-full h-full">
                   <div className="w-6 h-6 border-3 border-transparent border-t-neon-green rounded-full animate-spin"></div>
                   <span className="text-neon-green animate-pulse">Analyzing matches...</span>
                 </div>
              )}
              <Users size={22} className={loading ? 'opacity-0' : ''} /> 
              <span className={loading ? 'opacity-0' : ''}>Find My Study Group</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
