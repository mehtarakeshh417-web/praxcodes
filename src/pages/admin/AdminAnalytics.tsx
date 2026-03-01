import { motion } from "framer-motion";
import { useData } from "@/contexts/DataContext";
import { BarChart3, School, Users, GraduationCap } from "lucide-react";

const AdminAnalytics = () => {
  const { schools, teachers, students } = useData();
  return (
    <div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="font-display text-3xl font-bold mb-1"><span className="text-gradient-purple">Platform</span> Analytics</h1>
        <p className="text-white/50 font-body mb-8">Cross-school performance overview</p>
      </motion.div>
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        {[
          { icon: School, label: "Schools", value: schools.length, color: "text-neon-blue" },
          { icon: Users, label: "Teachers", value: teachers.length, color: "text-neon-green" },
          { icon: GraduationCap, label: "Students", value: students.length, color: "text-neon-orange" },
        ].map((item, i) => (
          <motion.div key={item.label} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: i * 0.1 }} className="glass-card p-6 text-center">
            <item.icon className={`w-8 h-8 mx-auto mb-2 ${item.color}`} />
            <div className="font-display text-3xl font-bold">{item.value}</div>
            <div className="text-white/50 text-sm font-body">{item.label}</div>
          </motion.div>
        ))}
      </div>
      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }} className="glass-card p-6">
        <h2 className="font-display text-lg font-bold mb-4 flex items-center gap-2"><BarChart3 className="w-5 h-5 text-neon-blue" /> School-wise Breakdown</h2>
        {schools.length === 0 ? (
          <p className="text-white/40 text-center py-8 font-body">No data yet. Create schools to see analytics.</p>
        ) : (
          <div className="space-y-3">
            {schools.map((school) => {
              const tCount = teachers.filter((t) => t.schoolId === school.id).length;
              const sCount = students.filter((s) => s.schoolId === school.id).length;
              return (
                <div key={school.id} className="flex items-center justify-between bg-white/5 rounded-xl px-4 py-3">
                  <span className="font-body text-sm text-white/80">{school.name}</span>
                  <div className="flex gap-4 text-xs text-white/50">
                    <span>{tCount} teachers</span>
                    <span>{sCount} students</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default AdminAnalytics;
