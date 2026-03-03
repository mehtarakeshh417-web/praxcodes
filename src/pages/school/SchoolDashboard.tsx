import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import StatCard from "@/components/StatCard";
import { useAuth } from "@/contexts/AuthContext";
import { useData } from "@/contexts/DataContext";
import { Users, GraduationCap, BookOpen, Activity, ClipboardList, BarChart3 } from "lucide-react";

const SchoolDashboard = () => {
  const { user } = useAuth();
  const { getSchoolTeachers, getSchoolStudents } = useData();
  const navigate = useNavigate();
  const schoolId = user?.id || "";
  const teachers = getSchoolTeachers(schoolId);
  const students = getSchoolStudents(schoolId);

  const classCounts: Record<string, number> = {};
  students.forEach((s) => {
    const key = `${s.class} (${s.section || "A"})`;
    classCounts[key] = (classCounts[key] || 0) + 1;
  });

  return (
    <div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="font-display text-3xl font-bold mb-1">
          <span className="text-gradient-brand">{user?.schoolName || "School"}</span>
        </h1>
        <p className="text-white/60 font-body mb-8">Principal's command center</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard icon={Users} label="Teachers" value={teachers.length} glowClass="neon-glow-blue" delay={0.1} expandable>
          {teachers.length === 0 ? (
            <p className="text-white/40 text-sm font-body">No teachers yet</p>
          ) : (
            <div className="space-y-2">
              {teachers.map((t) => (
                <div key={t.id} className="flex items-center justify-between py-1 cursor-pointer hover:bg-white/5 rounded px-2 -mx-2" onClick={() => navigate("/dashboard/teachers")}>
                  <span className="text-sm text-white/80 font-body">{t.firstName} {t.lastName}</span>
                  <span className="text-xs text-white/40">{t.classes.length} classes</span>
                </div>
              ))}
            </div>
          )}
        </StatCard>
        <StatCard icon={GraduationCap} label="Students" value={students.length} glowClass="neon-glow-green" delay={0.2} expandable>
          {students.length === 0 ? (
            <p className="text-white/40 text-sm font-body">No students yet</p>
          ) : (
            <div className="space-y-2">
              {students.map((s) => (
                <div key={s.id} className="flex items-center justify-between py-1 cursor-pointer hover:bg-white/5 rounded px-2 -mx-2" onClick={() => navigate("/dashboard/students")}>
                  <span className="text-sm text-white/80 font-body">{s.name}</span>
                  <span className="text-xs text-white/40">{s.class} ({s.section})</span>
                </div>
              ))}
            </div>
          )}
        </StatCard>
        <StatCard icon={BookOpen} label="Active Classes" value={Object.keys(classCounts).length} glowClass="neon-glow-purple" delay={0.3} expandable>
          {Object.keys(classCounts).length === 0 ? (
            <p className="text-white/40 text-sm font-body">No classes yet</p>
          ) : (
            <div className="space-y-2">
              {Object.entries(classCounts).map(([cls, count]) => (
                <div key={cls} className="flex items-center justify-between py-1">
                  <span className="text-sm text-white/80 font-body">{cls}</span>
                  <span className="text-xs text-white/40">{count} students</span>
                </div>
              ))}
            </div>
          )}
        </StatCard>
        <StatCard icon={Activity} label="Today's Logins" value={0} glowClass="neon-glow-orange" delay={0.4} />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }} className="glass-card p-6 cursor-pointer hover:border-white/25 transition-colors" onClick={() => navigate("/dashboard/classes")}>
          <h2 className="font-display text-lg font-bold mb-4 flex items-center gap-2 text-white">
            <ClipboardList className="w-5 h-5 text-neon-blue" /> Class Overview
          </h2>
          {Object.keys(classCounts).length === 0 ? (
            <div className="text-center py-8">
              <BookOpen className="w-10 h-10 text-white/20 mx-auto mb-3" />
              <p className="text-white/50 font-body text-sm">No classes yet. Enroll students to see class data.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {Object.entries(classCounts).map(([cls, count]) => (
                <div key={cls} className="card-row flex items-center justify-between">
                  <span className="font-body text-sm text-white/90 font-medium">{cls}</span>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-white/60 font-body">{count} students</span>
                    <div className="w-24 h-2 rounded-full bg-white/10 overflow-hidden">
                      <div className="h-full rounded-full bg-gradient-to-r from-neon-blue to-neon-green" style={{ width: `${Math.min(100, count * 5)}%` }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.6 }} className="glass-card p-6 cursor-pointer hover:border-white/25 transition-colors" onClick={() => navigate("/dashboard/teachers")}>
          <h2 className="font-display text-lg font-bold mb-4 flex items-center gap-2 text-white">
            <BarChart3 className="w-5 h-5 text-neon-green" /> Teacher Overview
          </h2>
          {teachers.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-10 h-10 text-white/20 mx-auto mb-3" />
              <p className="text-white/50 font-body text-sm">No teachers yet. Add teachers to see overview.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {teachers.map((t) => (
                <div key={t.id} className="card-row flex items-center justify-between">
                  <div>
                    <span className="font-body text-sm text-white/90 font-medium">{t.firstName} {t.lastName}</span>
                    <span className="text-xs text-white/40 ml-2">({t.classes.length} classes)</span>
                  </div>
                  <span className="text-xs text-neon-green font-medium">@{t.username}</span>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default SchoolDashboard;
