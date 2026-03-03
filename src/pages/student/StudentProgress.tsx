import { useMemo } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useData } from "@/contexts/DataContext";
import { getCurriculumForClass, countTotalTopics } from "@/lib/curriculumData";
import { TrendingUp, CheckCircle2, Clock, Zap, BookOpen } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts";

const COLORS = ["hsl(145,80%,50%)", "hsl(200,100%,50%)", "hsl(260,80%,60%)", "hsl(25,100%,55%)", "hsl(330,90%,60%)"];

const xpLevel = (xp: number) => {
  if (xp < 500) return { level: 1, title: "Byte Beginner", next: 500 };
  if (xp < 1500) return { level: 2, title: "Code Cadet", next: 1500 };
  if (xp < 3000) return { level: 3, title: "Script Ninja", next: 3000 };
  if (xp < 5000) return { level: 4, title: "Dev Master", next: 5000 };
  return { level: 5, title: "Legendary Coder", next: 10000 };
};

const StudentProgress = () => {
  const { user } = useAuth();
  const { students } = useData();
  const student = students.find((s) => s.id === user?.id);
  const xp = student?.xp || 0;
  const lvl = xpLevel(xp);

  const curriculum = useMemo(() => getCurriculumForClass(user?.className || ""), [user?.className]);
  const completedTopics = useMemo(() => {
    try {
      const stored = localStorage.getItem(`cc_completed_${user?.id}`);
      return stored ? JSON.parse(stored) as string[] : [];
    } catch { return []; }
  }, [user?.id]);

  const totalTopics = curriculum ? countTotalTopics(curriculum) : 0;
  const completedCount = completedTopics.length;
  const pendingCount = totalTopics - completedCount;
  const progressPct = totalTopics > 0 ? Math.round((completedCount / totalTopics) * 100) : 0;

  // Per-subject data
  const subjectData = useMemo(() => {
    if (!curriculum) return [];
    return curriculum.subjects.map((sub) => {
      const total = sub.topics.length;
      const done = sub.topics.filter((t) => completedTopics.includes(t.id)).length;
      return { name: sub.title.length > 12 ? sub.title.slice(0, 12) + "…" : sub.title, fullName: sub.title, completed: done, pending: total - done, total };
    });
  }, [curriculum, completedTopics]);

  const pieData = [
    { name: "Completed", value: completedCount },
    { name: "Pending", value: pendingCount },
  ];

  return (
    <div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="font-display text-3xl font-bold mb-1"><span className="text-gradient-brand">My Progress</span></h1>
        <p className="text-white/60 font-body mb-8">Track your learning journey</p>
      </motion.div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Overall", value: `${progressPct}%`, icon: TrendingUp, color: "text-neon-green" },
          { label: "Completed", value: completedCount, icon: CheckCircle2, color: "text-neon-blue" },
          { label: "Pending", value: pendingCount, icon: Clock, color: "text-neon-orange" },
          { label: "XP / Level", value: `${xp} / L${lvl.level}`, icon: Zap, color: "text-neon-purple" },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: i * 0.05 }} className="glass-card p-5 text-center">
            <s.icon className={`w-6 h-6 mx-auto mb-2 ${s.color}`} />
            <div className="font-display text-2xl font-bold text-white">{s.value}</div>
            <div className="text-xs text-white/50 font-body mt-1">{s.label}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Pie Chart */}
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="glass-card p-6">
          <h2 className="font-display text-lg font-bold text-white mb-4 flex items-center gap-2"><BookOpen className="w-5 h-5 text-neon-blue" /> Completion Overview</h2>
          {totalTopics > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="value" label={({ name, value }) => `${name}: ${value}`}>
                  <Cell fill="hsl(145,80%,50%)" />
                  <Cell fill="hsl(220,25%,30%)" />
                </Pie>
                <Tooltip contentStyle={{ background: "hsl(220,28%,14%)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 12, color: "#fff" }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-white/30 font-body">No curriculum data</div>
          )}
        </motion.div>

        {/* Bar Chart per subject */}
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} className="glass-card p-6">
          <h2 className="font-display text-lg font-bold text-white mb-4 flex items-center gap-2"><TrendingUp className="w-5 h-5 text-neon-green" /> Technology-wise Progress</h2>
          {subjectData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={subjectData} layout="vertical" margin={{ left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis type="number" stroke="rgba(255,255,255,0.3)" tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 11 }} />
                <YAxis dataKey="name" type="category" width={100} stroke="rgba(255,255,255,0.3)" tick={{ fill: "rgba(255,255,255,0.7)", fontSize: 11 }} />
                <Tooltip contentStyle={{ background: "hsl(220,28%,14%)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 12, color: "#fff" }} />
                <Bar dataKey="completed" name="Completed" fill="hsl(145,80%,50%)" radius={[0, 4, 4, 0]} />
                <Bar dataKey="pending" name="Pending" fill="hsl(220,25%,30%)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-white/30 font-body">No curriculum data</div>
          )}
        </motion.div>
      </div>

      {/* Subject-wise detail list */}
      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }} className="glass-card p-6">
        <h2 className="font-display text-lg font-bold text-white mb-4">Subject-wise Breakdown</h2>
        <div className="space-y-3">
          {subjectData.map((s, i) => {
            const pct = s.total > 0 ? Math.round((s.completed / s.total) * 100) : 0;
            return (
              <div key={i} className="flex items-center gap-4">
                <div className="w-32 text-sm text-white/80 font-body truncate">{s.fullName}</div>
                <div className="flex-1 h-3 rounded-full bg-white/10 overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-neon-green to-neon-blue transition-all" style={{ width: `${pct}%` }} />
                </div>
                <div className="w-16 text-right text-sm font-display text-white/80">{pct}%</div>
                <div className="w-16 text-right text-xs text-white/40 font-body">{s.completed}/{s.total}</div>
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
};

export default StudentProgress;
