import { motion } from "framer-motion";
import StatCard from "@/components/StatCard";
import { useAuth } from "@/contexts/AuthContext";
import { useData } from "@/contexts/DataContext";
import { BookOpen, FileText, Users, CheckCircle, Sparkles, Code } from "lucide-react";

const TeacherDashboard = () => {
  const { user } = useAuth();
  const { getTeacherStudents, teachers } = useData();

  const teacher = teachers.find((t) => t.id === user?.id);
  const myClasses = teacher?.classes || [];
  const myStudents = getTeacherStudents(user?.id || "");

  return (
    <div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="font-display text-3xl font-bold mb-1">
          Welcome, <span className="text-gradient-fire">{user?.displayName}</span>
        </h1>
        <p className="text-white/60 font-body mb-8">{user?.schoolName} • Teacher Dashboard</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard icon={BookOpen} label="My Classes" value={myClasses.length} glowClass="neon-glow-orange" delay={0.1} />
        <StatCard icon={Users} label="Total Students" value={myStudents.length} glowClass="neon-glow-blue" delay={0.2} />
        <StatCard icon={FileText} label="Assignments Created" value={0} glowClass="neon-glow-green" delay={0.3} />
        <StatCard icon={CheckCircle} label="Projects Reviewed" value={0} glowClass="neon-glow-purple" delay={0.4} />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }} className="glass-card p-6">
          <h2 className="font-display text-lg font-bold mb-4 flex items-center gap-2 text-white">
            <BookOpen className="w-5 h-5 text-neon-orange" /> My Classes
          </h2>
          {myClasses.length === 0 ? (
            <div className="text-center py-8">
              <BookOpen className="w-10 h-10 text-white/20 mx-auto mb-3" />
              <p className="text-white/50 font-body text-sm">No classes assigned yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {myClasses.map((cls) => {
                const classStudents = myStudents.filter((s) => `${s.class} (${s.section || "A"})` === cls || s.class === cls);
                return (
                  <div key={cls} className="card-row hover:bg-white/10 transition-colors cursor-pointer">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-body text-sm font-bold text-white">{cls}</span>
                      <span className="text-xs text-white/50">{classStudents.length} students</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>

        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.6 }} className="glass-card p-6">
          <h2 className="font-display text-lg font-bold mb-4 flex items-center gap-2 text-white">
            <Sparkles className="w-5 h-5 text-neon-purple" /> Quick Actions
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: FileText, label: "Create Assignment", color: "from-neon-blue to-neon-purple" },
              { icon: Sparkles, label: "AI Generate", color: "from-neon-purple to-neon-pink" },
              { icon: Code, label: "Assign Project", color: "from-neon-green to-neon-blue" },
              { icon: CheckCircle, label: "Review Submissions", color: "from-neon-orange to-neon-pink" },
            ].map((a) => (
              <button key={a.label} className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white/10 hover:bg-white/15 transition-all hover:scale-105">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${a.color} flex items-center justify-center`}>
                  <a.icon className="w-5 h-5 text-white" />
                </div>
                <span className="text-xs font-body text-white/70">{a.label}</span>
              </button>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
