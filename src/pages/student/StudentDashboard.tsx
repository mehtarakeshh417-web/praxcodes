import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useData } from "@/contexts/DataContext";
import StatCard from "@/components/StatCard";
import { Trophy, Zap, Target, Star, BookOpen, Code, Award, Gamepad2 } from "lucide-react";

const xpLevel = (xp: number) => {
  if (xp < 500) return { level: 1, title: "Byte Beginner", next: 500 };
  if (xp < 1500) return { level: 2, title: "Code Cadet", next: 1500 };
  if (xp < 3000) return { level: 3, title: "Script Ninja", next: 3000 };
  if (xp < 5000) return { level: 4, title: "Dev Master", next: 5000 };
  return { level: 5, title: "Legendary Coder", next: 10000 };
};

const StudentDashboard = () => {
  const { user } = useAuth();
  const { students } = useData();

  const student = students.find((s) => s.id === user?.id);
  const xp = student?.xp || 0;
  const lvl = xpLevel(xp);
  const progress = Math.round((xp / lvl.next) * 100);

  return (
    <div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="font-display text-3xl font-bold mb-1">
          Hey, <span className="text-gradient-brand">{user?.displayName}</span>! 🚀
        </h1>
        <p className="text-white/60 font-body mb-2">{user?.schoolName} • {user?.className}</p>
      </motion.div>

      {/* XP Bar */}
      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="glass-card p-6 mb-8 neon-glow-green">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-neon-green to-neon-blue flex items-center justify-center font-display text-xl font-bold text-cyber-darker">
              {lvl.level}
            </div>
            <div>
              <div className="font-display text-lg font-bold text-white">{lvl.title}</div>
              <div className="text-xs text-white/50 font-body">Level {lvl.level}</div>
            </div>
          </div>
          <div className="text-right">
            <div className="font-display text-2xl font-bold text-neon-green">{xp} XP</div>
            <div className="text-xs text-white/50 font-body">{lvl.next - xp} XP to next level</div>
          </div>
        </div>
        <div className="w-full h-4 rounded-full bg-white/10 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 1, delay: 0.3 }}
            className="h-full rounded-full bg-gradient-to-r from-neon-green to-neon-blue"
          />
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard icon={Target} label="Assignments Done" value={0} glowClass="neon-glow-blue" delay={0.2} />
        <StatCard icon={Code} label="Projects Completed" value={0} glowClass="neon-glow-green" delay={0.3} />
        <StatCard icon={Trophy} label="School Rank" value="—" glowClass="neon-glow-purple" delay={0.4} />
        <StatCard icon={Star} label="Badges Earned" value={0} glowClass="neon-glow-orange" delay={0.5} />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Technologies */}
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.6 }} className="glass-card p-6">
          <h2 className="font-display text-lg font-bold mb-4 flex items-center gap-2 text-white">
            <BookOpen className="w-5 h-5 text-neon-blue" /> My Technologies
          </h2>
          <div className="text-center py-8">
            <BookOpen className="w-10 h-10 text-white/20 mx-auto mb-3" />
            <p className="text-white/50 font-body text-sm">No technologies assigned yet. Your curriculum will appear once your teacher sets it up.</p>
          </div>
        </motion.div>

        {/* Badges */}
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.7 }} className="glass-card p-6">
          <h2 className="font-display text-lg font-bold mb-4 flex items-center gap-2 text-white">
            <Gamepad2 className="w-5 h-5 text-neon-purple" /> Achievement Badges
          </h2>
          <div className="text-center py-8">
            <Award className="w-10 h-10 text-white/20 mx-auto mb-3" />
            <p className="text-white/50 font-body text-sm">Complete activities to earn badges. No badges earned yet.</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default StudentDashboard;
