import { motion } from "framer-motion";
import { useData } from "@/contexts/DataContext";
import { useAuth } from "@/contexts/AuthContext";
import { BarChart3, Users, GraduationCap } from "lucide-react";

const SchoolAnalytics = () => {
  const { user } = useAuth();
  const { getSchoolTeachers, getSchoolStudents } = useData();
  const schoolId = user?.id || "";
  const teachers = getSchoolTeachers(schoolId);
  const students = getSchoolStudents(schoolId);

  return (
    <div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="font-display text-3xl font-bold mb-1"><span className="text-gradient-brand">Analytics</span></h1>
        <p className="text-white/50 font-body mb-8">School performance insights</p>
      </motion.div>
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="glass-card p-6">
          <h2 className="font-display font-bold mb-4 flex items-center gap-2"><Users className="w-5 h-5 text-neon-blue" /> Teachers ({teachers.length})</h2>
          {teachers.length === 0 ? <p className="text-white/40 text-sm font-body">No teacher data yet</p> : (
            <div className="space-y-2">{teachers.map((t) => (
              <div key={t.id} className="bg-white/5 rounded-xl px-4 py-2 flex justify-between text-sm">
                <span className="text-white/80">{t.firstName} {t.lastName}</span>
                <span className="text-white/40">{t.classes.length} classes</span>
              </div>
            ))}</div>
          )}
        </motion.div>
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="glass-card p-6">
          <h2 className="font-display font-bold mb-4 flex items-center gap-2"><GraduationCap className="w-5 h-5 text-neon-green" /> Students ({students.length})</h2>
          {students.length === 0 ? <p className="text-white/40 text-sm font-body">No student data yet</p> : (
            <div className="space-y-2">{students.slice(0, 10).map((s) => (
              <div key={s.id} className="bg-white/5 rounded-xl px-4 py-2 flex justify-between text-sm">
                <span className="text-white/80">{s.name}</span>
                <span className="text-white/40">{s.class} | {s.xp} XP</span>
              </div>
            ))}</div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default SchoolAnalytics;
