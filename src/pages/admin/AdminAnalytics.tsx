import { motion } from "framer-motion";
import { useData } from "@/contexts/DataContext";
import { BarChart3, School, Users, GraduationCap, TrendingUp } from "lucide-react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

const COLORS = ["#00D4FF", "#00FF88", "#FF6B00", "#A855F7", "#F43F5E"];

const AdminAnalytics = () => {
  const { schools, teachers, students } = useData();

  // School-wise data for charts
  const schoolChartData = schools.map((school) => ({
    name: school.name.length > 12 ? school.name.slice(0, 12) + "…" : school.name,
    fullName: school.name,
    teachers: teachers.filter((t) => t.schoolId === school.id).length,
    students: students.filter((s) => s.schoolId === school.id).length,
  }));

  // Class distribution pie chart
  const classDistribution = students.reduce((acc, s) => {
    acc[s.class] = (acc[s.class] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const classPieData = Object.entries(classDistribution).map(([name, value]) => ({ name, value }));

  // Section distribution
  const sectionDistribution = students.reduce((acc, s) => {
    const sec = s.section || "A";
    acc[sec] = (acc[sec] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const sectionBarData = Object.entries(sectionDistribution).map(([name, count]) => ({ name: `Section ${name}`, count }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-black/90 border border-white/20 rounded-lg px-3 py-2 text-xs">
        <p className="text-white font-medium mb-1">{payload[0]?.payload?.fullName || label}</p>
        {payload.map((p: any, i: number) => (
          <p key={i} style={{ color: p.color }} className="text-xs">{p.name}: {p.value}</p>
        ))}
      </div>
    );
  };

  return (
    <div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="font-display text-3xl font-bold mb-1"><span className="text-gradient-purple">Platform</span> Analytics</h1>
        <p className="text-white/50 font-body mb-8">Cross-school performance overview</p>
      </motion.div>

      {/* Summary Cards */}
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

      {schools.length === 0 ? (
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="glass-card p-12 text-center">
          <BarChart3 className="w-16 h-16 text-white/20 mx-auto mb-4" />
          <p className="text-white/40 font-body">No data yet. Create schools to see analytics.</p>
        </motion.div>
      ) : (
        <>
          {/* Charts Row */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* School-wise Bar Chart */}
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} className="glass-card p-6">
              <h2 className="font-display text-lg font-bold mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-neon-blue" /> School-wise Distribution
              </h2>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={schoolChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="name" tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 11 }} />
                  <YAxis tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 11 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 12, color: "rgba(255,255,255,0.6)" }} />
                  <Bar dataKey="teachers" fill="#00FF88" radius={[4, 4, 0, 0]} name="Teachers" />
                  <Bar dataKey="students" fill="#00D4FF" radius={[4, 4, 0, 0]} name="Students" />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Class Pie Chart */}
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }} className="glass-card p-6">
              <h2 className="font-display text-lg font-bold mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-neon-green" /> Students by Class
              </h2>
              {classPieData.length === 0 ? (
                <p className="text-white/40 text-center py-12 font-body text-sm">No students enrolled yet</p>
              ) : (
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={classPieData} cx="50%" cy="50%" outerRadius={90} innerRadius={40} dataKey="value" label={({ name, value }) => `${name}: ${value}`} labelLine={false}>
                      {classPieData.map((_, index) => (
                        <Cell key={index} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ background: "rgba(0,0,0,0.9)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 8, fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </motion.div>
          </div>

          {/* Section Distribution */}
          {sectionBarData.length > 0 && (
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }} className="glass-card p-6 mb-8">
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

          {/* Detailed School List */}
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.6 }} className="glass-card p-6">
            <h2 className="font-display text-lg font-bold mb-4 flex items-center gap-2">
              <School className="w-5 h-5 text-neon-blue" /> Detailed Breakdown
            </h2>
            <div className="space-y-3">
              {schools.map((school) => {
                const tCount = teachers.filter((t) => t.schoolId === school.id).length;
                const sCount = students.filter((s) => s.schoolId === school.id).length;
                return (
                  <div key={school.id} className="bg-white/5 rounded-xl px-4 py-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-body text-sm text-white/80 font-medium">{school.name}</span>
                      <div className="flex gap-4 text-xs text-white/50">
                        <span className="text-neon-green">{tCount} teachers</span>
                        <span className="text-neon-blue">{sCount} students</span>
                      </div>
                    </div>
                    <div className="w-full bg-white/5 rounded-full h-2">
                      <div className="bg-gradient-to-r from-neon-blue to-neon-green h-2 rounded-full transition-all" style={{ width: `${students.length > 0 ? (sCount / students.length) * 100 : 0}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </>
      )}
    </div>
  );
};

export default AdminAnalytics;
