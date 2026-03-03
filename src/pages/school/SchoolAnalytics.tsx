import { motion } from "framer-motion";
import { useData } from "@/contexts/DataContext";
import { useAuth } from "@/contexts/AuthContext";
import { BarChart3, Users, GraduationCap, TrendingUp } from "lucide-react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const COLORS = ["#00D4FF", "#00FF88", "#FF6B00", "#A855F7", "#F43F5E"];

const SchoolAnalytics = () => {
  const { user } = useAuth();
  const { getSchoolTeachers, getSchoolStudents } = useData();
  const schoolId = user?.id || "";
  const teachers = getSchoolTeachers(schoolId);
  const students = getSchoolStudents(schoolId);

  // Teacher-wise student count
  const teacherData = teachers.map((t) => ({
    name: `${t.firstName} ${t.lastName}`.slice(0, 14),
    students: students.filter((s) => s.teacherId === t.id).length,
    classes: t.classes.length,
  }));

  // Class distribution
  const classDistribution = students.reduce((acc, s) => {
    acc[s.class] = (acc[s.class] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const classPieData = Object.entries(classDistribution).map(([name, value]) => ({ name, value }));

  // Section distribution
  const sectionData = students.reduce((acc, s) => {
    const sec = s.section || "A";
    acc[sec] = (acc[sec] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const sectionBarData = Object.entries(sectionData).map(([name, count]) => ({ name: `Section ${name}`, count }));

  const noData = teachers.length === 0 && students.length === 0;

  return (
    <div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="font-display text-3xl font-bold mb-1"><span className="text-gradient-brand">Analytics</span></h1>
        <p className="text-white/50 font-body mb-8">School performance insights</p>
      </motion.div>

      {/* Summary */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="glass-card p-6 text-center">
          <Users className="w-8 h-8 mx-auto mb-2 text-neon-blue" />
          <div className="font-display text-3xl font-bold">{teachers.length}</div>
          <div className="text-white/50 text-sm font-body">Teachers</div>
        </motion.div>
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="glass-card p-6 text-center">
          <GraduationCap className="w-8 h-8 mx-auto mb-2 text-neon-green" />
          <div className="font-display text-3xl font-bold">{students.length}</div>
          <div className="text-white/50 text-sm font-body">Students</div>
        </motion.div>
      </div>

      {noData ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-12 text-center">
          <BarChart3 className="w-16 h-16 text-white/20 mx-auto mb-4" />
          <p className="text-white/40 font-body">No data yet. Add teachers and students to see analytics.</p>
        </motion.div>
      ) : (
        <>
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Teacher-wise students bar chart */}
            {teacherData.length > 0 && (
              <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="glass-card p-6">
                <h2 className="font-display text-lg font-bold mb-4 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-neon-blue" /> Students per Teacher
                </h2>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={teacherData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="name" tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 11 }} />
                    <YAxis tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 11 }} />
                    <Tooltip contentStyle={{ background: "rgba(0,0,0,0.9)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 8, fontSize: 12 }} />
                    <Bar dataKey="students" fill="#00D4FF" radius={[4, 4, 0, 0]} name="Students" />
                  </BarChart>
                </ResponsiveContainer>
              </motion.div>
            )}

            {/* Class pie chart */}
            {classPieData.length > 0 && (
              <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} className="glass-card p-6">
                <h2 className="font-display text-lg font-bold mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-neon-green" /> Students by Class
                </h2>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={classPieData} cx="50%" cy="50%" outerRadius={90} innerRadius={40} dataKey="value" label={({ name, value }) => `${name}: ${value}`} labelLine={false}>
                      {classPieData.map((_, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: "rgba(0,0,0,0.9)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 8, fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              </motion.div>
            )}
          </div>

          {/* Section distribution */}
          {sectionBarData.length > 0 && (
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }} className="glass-card p-6 mb-8">
              <h2 className="font-display text-lg font-bold mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-neon-orange" /> Students by Section
              </h2>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={sectionBarData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="name" tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 11 }} />
                  <YAxis tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: "rgba(0,0,0,0.9)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="count" fill="#FF6B00" radius={[4, 4, 0, 0]} name="Students" />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>
          )}

          {/* Teacher list */}
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }} className="glass-card p-6 mb-8">
            <h2 className="font-display font-bold mb-4 flex items-center gap-2"><Users className="w-5 h-5 text-neon-blue" /> Teachers ({teachers.length})</h2>
            {teachers.length === 0 ? <p className="text-white/40 text-sm font-body">No teacher data yet</p> : (
              <div className="space-y-2">{teachers.map((t) => (
                <div key={t.id} className="bg-white/5 rounded-xl px-4 py-2 flex justify-between text-sm">
                  <span className="text-white/80">{t.firstName} {t.lastName}</span>
                  <div className="flex gap-3 text-white/40">
                    <span>{t.classes.length} classes</span>
                    <span>{students.filter((s) => s.teacherId === t.id).length} students</span>
                  </div>
                </div>
              ))}</div>
            )}
          </motion.div>

          {/* Top students */}
          {students.length > 0 && (
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.6 }} className="glass-card p-6">
              <h2 className="font-display font-bold mb-4 flex items-center gap-2"><GraduationCap className="w-5 h-5 text-neon-green" /> Students ({students.length})</h2>
              <div className="space-y-2">{students.slice(0, 15).map((s) => (
                <div key={s.id} className="bg-white/5 rounded-xl px-4 py-2 flex justify-between text-sm">
                  <span className="text-white/80">{s.name}</span>
                  <span className="text-white/40">{s.class} ({s.section || "A"}) | {s.xp} XP</span>
                </div>
              ))}</div>
            </motion.div>
          )}
        </>
      )}
    </div>
  );
};

export default SchoolAnalytics;
