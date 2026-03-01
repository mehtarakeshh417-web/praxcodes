import { motion } from "framer-motion";
import StatCard from "@/components/StatCard";
import { useAuth } from "@/contexts/AuthContext";
import { Users, GraduationCap, BookOpen, Activity, ClipboardList, BarChart3 } from "lucide-react";

const SchoolDashboard = () => {
  const { user } = useAuth();
  return (
    <div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="font-display text-3xl font-bold mb-1">
          <span className="text-gradient-brand">{user?.schoolName || "School"}</span>
        </h1>
        <p className="text-white/50 font-body mb-8">Principal's command center</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard icon={Users} label="Teachers" value={7} glowClass="neon-glow-blue" delay={0.1} />
        <StatCard icon={GraduationCap} label="Students" value={128} trend="+22 this term" glowClass="neon-glow-green" delay={0.2} />
        <StatCard icon={BookOpen} label="Active Classes" value={8} glowClass="neon-glow-purple" delay={0.3} />
        <StatCard icon={Activity} label="Today's Logins" value={45} trend="35% rate" glowClass="neon-glow-orange" delay={0.4} />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }} className="glass-card p-6">
          <h2 className="font-display text-lg font-bold mb-4 flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-neon-blue" /> Class Overview
          </h2>
          <div className="space-y-3">
            {["5th (A)", "5th (B)", "6th (A)", "6th (B)", "7th (A)", "7th (B)", "8th (A)", "8th (B)"].map((cls) => (
              <div key={cls} className="flex items-center justify-between bg-white/5 rounded-xl px-4 py-3">
                <span className="font-body text-sm text-white/80">{cls}</span>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-white/40">{Math.floor(Math.random() * 10 + 10)} students</span>
                  <div className="w-24 h-2 rounded-full bg-white/10 overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-neon-blue to-neon-green" style={{ width: `${Math.floor(Math.random() * 40 + 60)}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.6 }} className="glass-card p-6">
          <h2 className="font-display text-lg font-bold mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-neon-green" /> Teacher Performance
          </h2>
          <div className="space-y-3">
            {[
              { name: "Ms. Priya Sharma", classes: 3, logins: 24 },
              { name: "Mr. Raj Verma", classes: 2, logins: 18 },
              { name: "Ms. Anita Singh", classes: 2, logins: 22 },
              { name: "Mr. Kiran Patel", classes: 1, logins: 15 },
            ].map((t) => (
              <div key={t.name} className="flex items-center justify-between bg-white/5 rounded-xl px-4 py-3">
                <div>
                  <span className="font-body text-sm text-white/80">{t.name}</span>
                  <span className="text-xs text-white/30 ml-2">({t.classes} classes)</span>
                </div>
                <span className="text-xs text-neon-green">{t.logins} logins/month</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SchoolDashboard;
