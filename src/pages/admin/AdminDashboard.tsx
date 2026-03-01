import { motion } from "framer-motion";
import StatCard from "@/components/StatCard";
import { useData } from "@/contexts/DataContext";
import { School, Users, GraduationCap, Activity, TrendingUp, Globe } from "lucide-react";

const AdminDashboard = () => {
  const { schools, teachers, students } = useData();
  return (
    <div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="font-display text-3xl font-bold mb-1">
          <span className="text-gradient-purple">Master</span> Control Panel
        </h1>
        <p className="text-white/60 font-body mb-8">Platform-wide overview and management</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard icon={School} label="Total Schools" value={schools.length} glowClass="neon-glow-purple" delay={0.1} />
        <StatCard icon={Users} label="Total Teachers" value={teachers.length} glowClass="neon-glow-blue" delay={0.2} />
        <StatCard icon={GraduationCap} label="Total Students" value={students.length} glowClass="neon-glow-green" delay={0.3} />
        <StatCard icon={Activity} label="Active Today" value={0} glowClass="neon-glow-orange" delay={0.4} />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }} className="glass-card p-6">
          <h2 className="font-display text-lg font-bold mb-4 flex items-center gap-2 text-white">
            <TrendingUp className="w-5 h-5 text-neon-green" /> Schools
          </h2>
          {schools.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <School className="w-12 h-12 text-white/25 mb-4" />
              <p className="text-white/50 font-body text-sm mb-1">No schools registered yet</p>
              <p className="text-white/35 font-body text-xs">Create your first school to get started</p>
            </div>
          ) : (
            <div className="space-y-3">
              {schools.map((s) => (
                <div key={s.id} className="card-row flex items-center justify-between">
                  <span className="font-body text-sm text-white/90 font-medium">{s.name}</span>
                  <span className="text-xs text-white/50">{s.city}</span>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.6 }} className="glass-card p-6">
          <h2 className="font-display text-lg font-bold mb-4 flex items-center gap-2 text-white">
            <Globe className="w-5 h-5 text-neon-blue" /> Recent Activity
          </h2>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Activity className="w-12 h-12 text-white/25 mb-4" />
            <p className="text-white/50 font-body text-sm mb-1">No activity yet</p>
            <p className="text-white/35 font-body text-xs">Activity will appear as schools join the platform</p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminDashboard;
