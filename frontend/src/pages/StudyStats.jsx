import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart2, Trophy, Flame, Target, Users, User, ArrowUpRight, TrendingUp, Sparkles, Calendar, ChevronRight, Zap, Award, BookOpen } from 'lucide-react';
import { studySyncService } from '../services/api';
import { Loader2 } from 'lucide-react';

const Heatmap = ({ data }) => {
  const weeks = [];
  for (let i = 0; i < data.length; i += 7) {
    weeks.push(data.slice(i, i + 7));
  }
  
  const days = ['Mon', '', 'Wed', '', 'Fri', '', 'Sun'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
    }
  }, [data]);

  return (
    <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 shadow-2xl backdrop-blur-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-[100px] -mr-32 -mt-32" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <div>
                <h3 className="text-lg font-black text-white flex items-center gap-2 font-grotesk italic">
                    <Calendar size={20} className="text-emerald-400" /> ACTIVITY PULSE
                </h3>
                <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em] mt-1 font-bold">365-Day Contribution Stream</p>
            </div>
            <div className="flex gap-2 items-center bg-slate-950/40 px-3 py-1.5 rounded-xl border border-white/5">
                <span className="text-[10px] font-bold text-slate-500 uppercase mr-2 tracking-tighter">Intensity:</span>
                {[0, 25, 50, 75, 100].map(v => (
                    <div key={v} className="w-3 h-3 rounded-sm bg-emerald-500" style={{ opacity: Math.max(0.1, v/100) }} />
                ))}
            </div>
        </div>
        
        <div ref={scrollRef} className="overflow-x-auto pb-4 scrollbar-hide flex gap-3 cursor-grab active:cursor-grabbing">
            <div className="flex gap-2 min-w-max">
                <div className="grid grid-rows-7 gap-1 mt-7 pr-3">
                    {days.map((d, i) => <span key={i} className="text-[9px] text-slate-600 h-3 leading-3 font-bold">{d}</span>)}
                </div>
                <div className="flex gap-1.5 pt-1">
                    {weeks.map((week, wi) => (
                        <div key={wi} className="grid grid-rows-7 gap-1.5 relative">
                            {wi % 4 === 0 && (
                                <span className="absolute -top-6 left-0 text-[10px] font-bold text-slate-700 uppercase tracking-tighter">
                                    {months[Math.floor(wi / 4.35) % 12]}
                                </span>
                            )}
                            {week.map((d, di) => {
                                const intensity = Math.min(d.count / 15, 1);
                                return (
                                    <motion.div
                                        key={di}
                                        whileHover={{ scale: 1.4, zIndex: 10 }}
                                        title={`${d.date}: ${d.count} points`}
                                        className="w-3.5 h-3.5 rounded-sm cursor-help shadow-sm transition-colors border border-white/5"
                                        style={{ 
                                            backgroundColor: d.count > 0 ? '#10b981' : '#1e293b',
                                            opacity: d.count > 0 ? 0.15 + (intensity * 0.85) : 1
                                        }}
                                    />
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>
        </div>
        
        <div className="mt-4 flex flex-wrap gap-6 text-[10px] font-bold uppercase tracking-widest text-slate-500">
            <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-indigo-500" /> Chat Sync
            </div>
            <div className="flex items-center gap-2 text-emerald-400">
                <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" /> Task Sprints
            </div>
            <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-slate-700" /> Rest Days
            </div>
        </div>
    </div>
  );
};

const MasteryBadge = ({ subject, level = 0 }) => {
    const isElite = level >= 80;
    const isPro = level >= 50 && level < 80;

    return (
        <motion.div 
            whileHover={{ y: -5 }}
            className={`relative bg-slate-900/40 border ${isElite ? 'border-yellow-500/30' : 'border-slate-800'} rounded-3xl p-6 group transition-all`}
        >
            {isElite && <div className="absolute -top-3 -right-3 w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center text-slate-900 shadow-xl border-4 border-slate-900 animate-bounce cursor-default" title="Elite Mastery"><Award size={20} /></div>}
            
            <div className="flex justify-between items-center mb-5">
                <div className={`p-3 rounded-2xl ${isElite ? 'bg-yellow-500/10 text-yellow-500' : isPro ? 'bg-indigo-500/10 text-indigo-400' : 'bg-slate-800 text-slate-500'}`}>
                    <Target size={22} />
                </div>
                <div className="text-right">
                    <p className={`text-[10px] font-black uppercase tracking-widest ${isElite ? 'text-yellow-500' : 'text-slate-500'}`}>Rank</p>
                    <p className="text-lg font-black text-white font-grotesk">{isElite ? 'S' : isPro ? 'A' : 'B'}</p>
                </div>
            </div>

            <h4 className="text-white font-black text-lg mb-2 font-grotesk tracking-tight uppercase italic">{subject}</h4>
            
            <div className="space-y-3">
                <div className="flex justify-between text-[11px] font-black text-slate-500 uppercase tracking-tighter">
                    <span>Knowledge Depth</span>
                    <span className={isElite ? 'text-yellow-500' : 'text-white'}>{level}%</span>
                </div>
                <div className="w-full h-3 bg-slate-950/60 rounded-full overflow-hidden p-0.5 border border-white/5">
                    <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${level}%` }}
                        transition={{ duration: 1.5, ease: 'easeOut' }}
                        className={`h-full rounded-full relative overflow-hidden ${
                            isElite ? 'bg-gradient-to-r from-yellow-500 to-orange-500' : 
                            'bg-gradient-to-r from-indigo-600 to-purple-600'
                        }`}
                    >
                        <div className="absolute inset-0 bg-white/20 animate-shimmer" style={{ backgroundSize: '200% 100%', backgroundImage: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)' }} />
                    </motion.div>
                </div>
            </div>
            
            <div className="mt-5 flex items-center gap-2 text-[10px] font-bold text-slate-500">
                <Zap size={12} className={level > 0 ? "text-yellow-400" : ""} />
                <span>{level > 70 ? 'Expert Path' : 'Climbing Tiers'}</span>
            </div>
        </motion.div>
    );
};

export default function StudyStats() {
  const [stats, setStats] = useState(null);
  const [leaderboard, setLeaderboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('squads');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sRes, lRes] = await Promise.all([
          studySyncService.getStats(),
          studySyncService.getLeaderboard()
        ]);
        setStats(sRes.data);
        setLeaderboard(lRes.data);
      } catch (err) {
        console.error("Failed to load metrics", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-[70vh] gap-6">
        <div className="relative">
            <Loader2 className="animate-spin text-indigo-500" size={60} />
            <div className="absolute inset-0 bg-indigo-500 opacity-20 blur-xl animate-pulse" />
        </div>
        <div className="text-center">
            <p className="text-white text-lg font-black font-grotesk tracking-widest uppercase italic">INITIALIZING CORE ANALYTICS</p>
            <p className="text-slate-500 text-xs font-bold uppercase tracking-[0.3em] mt-1">Aggregating Global Sprints</p>
        </div>
    </div>
  );

  const me = leaderboard?.individuals.find(i => i.rank === 3); // Current User

  return (
    <div className="max-w-7xl mx-auto space-y-10 p-2 pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }}>
           <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-xl shadow-indigo-600/20">
                    <BarChart2 size={24} />
                </div>
                <h1 className="text-3xl font-black text-white tracking-tighter font-grotesk italic uppercase">CAMPUS ARENA</h1>
           </div>
           <p className="text-slate-400 text-sm font-medium ml-1">Real-time performance metrics and global scholar rankings.</p>
        </motion.div>
        
        <div className="grid grid-cols-2 lg:flex items-center gap-4">
            <div className="flex flex-col gap-1 px-5 py-3 bg-slate-900 border border-white/5 rounded-2xl">
                <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Active Streak</span>
                <div className="flex items-center gap-2 text-orange-400">
                    <Flame size={18} fill="currentColor" />
                    <span className="text-xl font-black font-grotesk">12 DAYS</span>
                </div>
            </div>
            <div className="flex flex-col gap-1 px-5 py-3 bg-indigo-600 border border-indigo-400/30 rounded-2xl shadow-xl shadow-indigo-600/20">
                <span className="text-[9px] font-black text-white/60 uppercase tracking-widest">Global Rank</span>
                <div className="flex items-center gap-2 text-white">
                    <Trophy size={18} />
                    <span className="text-xl font-black font-grotesk">TOP 5%</span>
                </div>
            </div>
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        {stats && <Heatmap data={stats.activity} />}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Progress Column */}
        <div className="lg:col-span-4 space-y-8">
            <div className="flex items-center justify-between px-2">
                <h3 className="text-[11px] font-black uppercase text-white tracking-[0.3em] flex items-center gap-2 italic">
                    <TrendingUp size={16} className="text-indigo-400" /> SUBJECT MASTERY
                </h3>
            </div>
            <div className="grid grid-cols-1 gap-6">
                {stats?.progress.map((p, i) => (
                    <MasteryBadge key={i} {...p} />
                ))}
            </div>
        </div>

        {/* Global Arena Column */}
        <div className="lg:col-span-8 space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-2">
                <h3 className="text-[11px] font-black uppercase text-white tracking-[0.3em] flex items-center gap-2 italic">
                    <Sparkles size={16} className="text-yellow-400" /> GLOBAL LEADERBOARD
                </h3>
                <div className="flex bg-slate-900/60 rounded-2xl p-1 border border-slate-800">
                    <button 
                        onClick={() => setTab('squads')}
                        className={`px-8 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${tab === 'squads' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        SQUADS
                    </button>
                    <button 
                         onClick={() => setTab('individuals')}
                        className={`px-8 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${tab === 'individuals' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        SCHOLARS
                    </button>
                </div>
            </div>

            {/* Personal Stat Card */}
            <AnimatePresence mode="wait">
                {tab === 'individuals' && me && (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl relative overflow-hidden"
                    >
                         <div className="absolute inset-0 bg-white/10 opacity-20 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />
                         <div className="flex items-center gap-5 z-10">
                            <div className="w-16 h-16 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center text-white font-black text-2xl">
                                {me.name[0]}
                            </div>
                            <div>
                                <p className="text-[11px] font-black text-white/70 uppercase tracking-widest">Personal Performance</p>
                                <h4 className="text-2xl font-black text-white font-grotesk tracking-tight">{me.name}</h4>
                            </div>
                         </div>
                         <div className="flex gap-8 z-10 text-center">
                            <div>
                                <p className="text-[10px] font-black text-white/60 uppercase mb-1">Rank</p>
                                <p className="text-3xl font-black text-white font-grotesk">#{me.rank}</p>
                            </div>
                            <div className="w-[1px] h-10 bg-white/20 my-auto" />
                            <div>
                                <p className="text-[10px] font-black text-white/60 uppercase mb-1">Total Pts</p>
                                <p className="text-3xl font-black text-white font-grotesk">{me.points.toLocaleString()}</p>
                            </div>
                         </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <div className="bg-slate-900/40 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-md">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-slate-800/20 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] border-b border-slate-800">
                            <th className="px-8 py-5">Rank</th>
                            <th className="px-8 py-5">{tab === 'squads' ? 'SQUAD' : 'SCHOLAR'}</th>
                            <th className="px-8 py-5 text-right">{tab === 'squads' ? 'SYNERGY' : 'ACTIVITY'}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/30">
                        {(tab === 'squads' ? leaderboard?.squads : leaderboard?.individuals)?.map((item, i) => (
                            <motion.tr 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: i * 0.05 }}
                                key={i} 
                                className={`group hover:bg-white/[0.03] transition-colors ${i < 3 ? 'bg-indigo-500/[0.03]' : ''}`}
                            >
                                <td className="px-8 py-6">
                                    <div className="flex items-center gap-3">
                                        <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-[11px] font-black 
                                            ${i === 0 ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20' : 
                                              i === 1 ? 'bg-slate-300/10 text-slate-300 border border-slate-300/20' : 
                                              i === 2 ? 'bg-orange-500/10 text-orange-500 border border-orange-500/20' : 'text-slate-600'}`}>
                                            {i + 1}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-8 py-6">
                                    <div className="flex items-center gap-4">
                                        {tab === 'individuals' && (
                                            <div className="w-8 h-8 rounded-full bg-slate-800 border border-white/5 flex items-center justify-center text-[10px] font-bold text-slate-400 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                                                {item.name[0]}
                                            </div>
                                        )}
                                        <div>
                                            <p className="text-sm font-black text-white group-hover:text-indigo-400 transition-colors uppercase tracking-tight font-grotesk italic">
                                                {item.name}
                                            </p>
                                            <p className="text-[10px] text-slate-500 mt-1 font-bold uppercase tracking-tighter">
                                                {tab === 'squads' ? item.members.map(m => m.split(' ')[0]).join(' • ') : `Persistent Scholar • Badge Level ${5-i}`}
                                            </p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-8 py-6 text-right">
                                    <div className="inline-flex flex-col items-end">
                                        <span className="text-base font-black text-white font-grotesk tracking-tight">
                                            {tab === 'squads' ? `${item.score}%` : `${item.points.toLocaleString()} PTS`}
                                        </span>
                                        <div className={`flex items-center gap-1 ${i < 3 ? 'text-emerald-400' : 'text-slate-600'} text-[9px] font-black uppercase mt-1`}>
                                             <TrendingUp size={10} /> +{i === 0 ? '12.4' : '4.2'}%
                                        </div>
                                    </div>
                                </td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
            </div>
            
            <div className="bg-slate-900/60 rounded-3xl p-8 border border-slate-800 text-center space-y-2">
                <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center text-indigo-400 mx-auto mb-4">
                    <BookOpen size={24} />
                </div>
                <h4 className="text-white font-black font-grotesk tracking-widest uppercase italic">The Scholastic Sprint</h4>
                <p className="text-slate-500 text-[11px] leading-relaxed max-w-md mx-auto font-medium">
                    Activity is calculated using the **Weighted Sync Algorithm**: Chat messages account for 1pt, while completed Task Sprints yield 10pts each. Global reset in 4 days.
                </p>
            </div>
        </div>
      </div>
    </div>
  );
}
