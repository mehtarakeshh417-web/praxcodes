import { motion } from "framer-motion";
import StatCard from "@/components/StatCard";
import { useAuth } from "@/contexts/AuthContext";
import { BookOpen, FileText, Users, CheckCircle, Sparkles, Code } from "lucide-react";

const TeacherDashboard = () => {
  const { user } = useAuth();
  return (
    <div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="font-display text-3xl font-bold mb-1">
          Welcome, <span className="text-gradient-fire">{user?.displayName}</span>
        </h1>
        <p className="text-white/50 font-body mb-8">{user?.schoolName} • Teacher Dashboard</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard icon={BookOpen} label="My Classes" value={3} glowClass="neon-glow-orange" delay={0.1} />
        <StatCard icon={Users} label="Total Students" value={45} glowClass="neon-glow-blue" delay={0.2} />
        <StatCard icon={FileText} label="Assignments Created" value={18} trend="3 pending" glowClass="neon-glow-green" delay={0.3} />
        <StatCard icon={CheckCircle} label="Projects Reviewed" value={32} glowClass="neon-glow-purple" delay={0.4} />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }} className="glass-card p-6">
          <h2 className="font-display text-lg font-bold mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-neon-orange" /> My Classes
          </h2>
          <div className="space-y-3">
            {[
              { name: "6th (A)", students: 18, tech: "HTML & CSS" },
              { name: "6th (B)", students: 15, tech: "Scratch" },
              { name: "7th (A)", students: 12, tech: "Python" },
            ].map((c) => (
              <div key={c.name} className="bg-white/5 rounded-xl px-4 py-3 hover:bg-white/10 transition-colors cursor-pointer">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-body text-sm font-bold text-white/90">{c.name}</span>
                  <span className="text-xs text-white/40">{c.students} students</span>
                </div>
                <div className="flex items-center gap-2">
                  <Code className="w-3 h-3 text-primary" />
                  <span className="text-xs text-primary">{c.tech}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.6 }} className="glass-card p-6">
          <h2 className="font-display text-lg font-bold mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-neon-purple" /> Quick Actions
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: FileText, label: "Create Assignment", color: "from-neon-blue to-neon-purple" },
              { icon: Sparkles, label: "AI Generate", color: "from-neon-purple to-neon-pink" },
              { icon: Code, label: "Assign Project", color: "from-neon-green to-neon-blue" },
              { icon: CheckCircle, label: "Review Submissions", color: "from-neon-orange to-neon-pink" },
            ].map((a) => (
              <button key={a.label} className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all hover:scale-105">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${a.color} flex items-center justify-center`}>
                  <a.icon className="w-5 h-5 text-white" />
                </div>
                <span className="text-xs font-body text-white/60">{a.label}</span>
              </button>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
