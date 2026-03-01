import { motion } from "framer-motion";
import StatCard from "@/components/StatCard";
import { School, Users, GraduationCap, Activity, TrendingUp, Globe } from "lucide-react";

const AdminDashboard = () => (
  <div>
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <h1 className="font-display text-3xl font-bold mb-1">
        <span className="text-gradient-purple">Master</span> Control Panel
      </h1>
      <p className="text-white/50 font-body mb-8">Platform-wide overview and management</p>
    </motion.div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <StatCard icon={School} label="Total Schools" value={12} trend="+3 this month" glowClass="neon-glow-purple" delay={0.1} />
      <StatCard icon={Users} label="Total Teachers" value={84} trend="+12 this month" glowClass="neon-glow-blue" delay={0.2} />
      <StatCard icon={GraduationCap} label="Total Students" value={1250} trend="+180 this month" glowClass="neon-glow-green" delay={0.3} />
      <StatCard icon={Activity} label="Active Today" value={340} trend="27% active" glowClass="neon-glow-orange" delay={0.4} />
    </div>

    <div className="grid md:grid-cols-2 gap-6">
      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }} className="glass-card p-6">
        <h2 className="font-display text-lg font-bold mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-neon-green" /> Top Schools
        </h2>
        <div className="space-y-3">
          {["Delhi Public School", "Greenwood Academy", "Tech Valley School", "Modern CS Academy", "Digital Minds School"].map((name, i) => (
            <div key={name} className="flex items-center justify-between bg-white/5 rounded-xl px-4 py-3">
              <div className="flex items-center gap-3">
                <span className="font-display text-sm text-primary/60">#{i + 1}</span>
                <span className="font-body text-sm text-white/80">{name}</span>
              </div>
              <span className="text-xs text-neon-green font-body">{Math.floor(Math.random() * 50 + 80)}% active</span>
            </div>
          ))}
        </div>
      </motion.div>

      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.6 }} className="glass-card p-6">
        <h2 className="font-display text-lg font-bold mb-4 flex items-center gap-2">
          <Globe className="w-5 h-5 text-neon-blue" /> Recent Activity
        </h2>
        <div className="space-y-3">
          {[
            "Delhi Public School added 15 students",
            "Greenwood Academy: Teacher login spike",
            "Tech Valley completed 50 assignments",
            "New school registered: Digital Minds",
            "Platform-wide: 89% assignment completion",
          ].map((msg, i) => (
            <div key={i} className="flex items-center gap-3 bg-white/5 rounded-xl px-4 py-3">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="font-body text-sm text-white/70">{msg}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  </div>
);

export default AdminDashboard;
