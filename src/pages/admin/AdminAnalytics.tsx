import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useData } from "@/contexts/DataContext";
import { BarChart3, School, Users, GraduationCap, TrendingUp, MapPin, Filter } from "lucide-react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, AreaChart, Area } from "recharts";

const COLORS = ["#00D4FF", "#00FF88", "#FF6B00", "#A855F7", "#F43F5E", "#FACC15", "#34D399", "#818CF8"];

const AdminAnalytics = () => {
  const { schools, teachers, students } = useData();
  const [filterState, setFilterState] = useState("");

  const uniqueStates = useMemo(() => [...new Set(schools.map((s) => s.state).filter(Boolean))].sort(), [schools]);

  const filteredSchools = useMemo(() => filterState ? schools.filter((s) => s.state === filterState) : schools, [schools, filterState]);
  const filteredIds = new Set(filteredSchools.map((s) => s.id));
  const filteredTeachers = teachers.filter((t) => filteredIds.has(t.schoolId));
  const filteredStudents = students.filter((s) => filteredIds.has(s.schoolId));

  // State-wise distribution
  const stateData = useMemo(() => {
    const map: Record<string, { schools: number; teachers: number; students: number }> = {};
    schools.forEach((s) => {
      const st = s.state || "Unknown";
      if (!map[st]) map[st] = { schools: 0, teachers: 0, students: 0 };
      map[st].schools++;
    });
    teachers.forEach((t) => {
      const school = schools.find((s) => s.id === t.schoolId);
      const st = school?.state || "Unknown";
      if (map[st]) map[st].teachers++;
    });
    students.forEach((s) => {
      const school = schools.find((sc) => sc.id === s.schoolId);
      const st = school?.state || "Unknown";
      if (map[st]) map[st].students++;
    });
    return Object.entries(map).map(([name, d]) => ({ name: name.length > 14 ? name.slice(0, 14) + "…" : name, fullName: name, ...d }));
  }, [schools, teachers, students]);

  // School-wise chart data
  const schoolChartData = filteredSchools.map((school) => ({
    name: school.name.length > 12 ? school.name.slice(0, 12) + "…" : school.name,
    fullName: school.name,
    teachers: filteredTeachers.filter((t) => t.schoolId === school.id).length,
    students: filteredStudents.filter((s) => s.schoolId === school.id).length,
  }));

  // Class distribution pie
  const classDistribution = filteredStudents.reduce((acc, s) => { acc[s.class] = (acc[s.class] || 0) + 1; return acc; }, {} as Record<string, number>);
  const classPieData = Object.entries(classDistribution).map(([name, value]) => ({ name, value }));

  // Section distribution
  const sectionDistribution = filteredStudents.reduce((acc, s) => { const sec = s.section || "A"; acc[sec] = (acc[sec] || 0) + 1; return acc; }, {} as Record<string, number>);
  const sectionBarData = Object.entries(sectionDistribution).map(([name, count]) => ({ name: `Section ${name}`, count }));

  // City-wise school count pie
  const cityData = useMemo(() => {
    const map: Record<string, number> = {};
    filteredSchools.forEach((s) => { map[s.city] = (map[s.city] || 0) + 1; });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [filteredSchools]);

  // Teacher-to-student ratio
  const ratioData = filteredSchools.map((s) => {
    const tCount = filteredTeachers.filter((t) => t.schoolId === s.id).length;
    const sCount = filteredStudents.filter((st) => st.schoolId === s.id).length;
    return { name: s.name.length > 12 ? s.name.slice(0, 12) + "…" : s.name, ratio: tCount > 0 ? Math.round(sCount / tCount) : 0 };
  });

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
        <p className="text-white/50 font-body mb-6">Cross-school performance overview</p>
      </motion.div>

      {/* Filter */}
      {uniqueStates.length > 0 && (
        <div className="glass-card p-4 mb-6">
          <div className="flex items-center gap-3">
            <Filter className="w-4 h-4 text-neon-blue" />
            <select value={filterState} onChange={(e) => setFilterState(e.target.value)} className="rounded-lg bg-white/10 border border-white/20 text-white px-3 py-2 text-sm">
              <option value="" className="bg-cyber-dark">All States</option>
              {uniqueStates.map((s) => <option key={s} value={s} className="bg-cyber-dark">{s}</option>)}
            </select>
            {filterState && <button onClick={() => setFilterState("")} className="text-xs text-neon-orange">Clear</button>}
          </div>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid md:grid-cols-4 gap-4 mb-8">
        {[
          { icon: School, label: "Schools", value: filteredSchools.length, color: "text-neon-blue" },
          { icon: Users, label: "Teachers", value: filteredTeachers.length, color: "text-neon-green" },
          { icon: GraduationCap, label: "Students", value: filteredStudents.length, color: "text-neon-orange" },
          { icon: TrendingUp, label: "Avg Students/School", value: filteredSchools.length > 0 ? Math.round(filteredStudents.length / filteredSchools.length) : 0, color: "text-neon-purple" },
        ].map((item, i) => (
          <motion.div key={item.label} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: i * 0.05 }} className="glass-card p-5 text-center">
            <item.icon className={`w-7 h-7 mx-auto mb-2 ${item.color}`} />
            <div className="font-display text-2xl font-bold">{item.value}</div>
            <div className="text-white/50 text-xs font-body">{item.label}</div>
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
          {/* State-wise Distribution */}
          {stateData.length > 1 && !filterState && (
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="glass-card p-6 mb-6">
              <h2 className="font-display text-lg font-bold mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-neon-purple" /> State-wise Distribution
              </h2>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={stateData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="name" tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 10 }} />
                  <YAxis tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 11 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 11, color: "rgba(255,255,255,0.6)" }} />
                  <Bar dataKey="schools" fill="#A855F7" radius={[4, 4, 0, 0]} name="Schools" />
                  <Bar dataKey="teachers" fill="#00FF88" radius={[4, 4, 0, 0]} name="Teachers" />
                  <Bar dataKey="students" fill="#00D4FF" radius={[4, 4, 0, 0]} name="Students" />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>
          )}

          <div className="grid md:grid-cols-2 gap-6 mb-6">
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
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.35 }} className="glass-card p-6">
              <h2 className="font-display text-lg font-bold mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-neon-green" /> Students by Class
              </h2>
              {classPieData.length === 0 ? (
                <p className="text-white/40 text-center py-12 font-body text-sm">No students enrolled yet</p>
              ) : (
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={classPieData} cx="50%" cy="50%" outerRadius={90} innerRadius={40} dataKey="value" label={({ name, value }) => `${name}: ${value}`} labelLine={false}>
                      {classPieData.map((_, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: "rgba(0,0,0,0.9)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 8, fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </motion.div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {/* City-wise Schools Pie */}
            {cityData.length > 0 && (
              <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }} className="glass-card p-6">
                <h2 className="font-display text-lg font-bold mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-neon-orange" /> Schools by City
                </h2>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={cityData} cx="50%" cy="50%" outerRadius={90} innerRadius={35} dataKey="value" label={({ name, value }) => `${name}: ${value}`} labelLine={false}>
                      {cityData.map((_, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: "rgba(0,0,0,0.9)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 8, fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              </motion.div>
            )}

            {/* Section Distribution */}
            {sectionBarData.length > 0 && (
              <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.45 }} className="glass-card p-6">
                <h2 className="font-display text-lg font-bold mb-4 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-neon-orange" /> Students by Section
                </h2>
                <ResponsiveContainer width="100%" height={250}>
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
          </div>

          {/* Student-Teacher Ratio */}
          {ratioData.length > 0 && (
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }} className="glass-card p-6 mb-6">
              <h2 className="font-display text-lg font-bold mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-neon-purple" /> Student-Teacher Ratio per School
              </h2>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={ratioData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="name" tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 11 }} />
                  <YAxis tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: "rgba(0,0,0,0.9)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 8, fontSize: 12 }} />
                  <Area type="monotone" dataKey="ratio" fill="rgba(168,85,247,0.3)" stroke="#A855F7" strokeWidth={2} name="Students per Teacher" />
                </AreaChart>
              </ResponsiveContainer>
            </motion.div>
          )}

          {/* Detailed School List */}
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.6 }} className="glass-card p-6">
            <h2 className="font-display text-lg font-bold mb-4 flex items-center gap-2">
              <School className="w-5 h-5 text-neon-blue" /> Detailed Breakdown
            </h2>
            <div className="space-y-3">
              {filteredSchools.map((school) => {
                const tCount = filteredTeachers.filter((t) => t.schoolId === school.id).length;
                const sCount = filteredStudents.filter((s) => s.schoolId === school.id).length;
                return (
                  <div key={school.id} className="bg-white/5 rounded-xl px-4 py-3">
                    <div className="flex items-center justify-between mb-1">
                      <div>
                        <span className="font-body text-sm text-white/80 font-medium">{school.name}</span>
                        <span className="text-xs text-white/30 ml-2">{school.city}{school.state ? `, ${school.state}` : ""}</span>
                      </div>
                      <div className="flex gap-4 text-xs text-white/50">
                        <span className="text-neon-green">{tCount} teachers</span>
                        <span className="text-neon-blue">{sCount} students</span>
                      </div>
                    </div>
                    <div className="w-full bg-white/5 rounded-full h-2">
                      <div className="bg-gradient-to-r from-neon-blue to-neon-green h-2 rounded-full transition-all" style={{ width: `${filteredStudents.length > 0 ? (sCount / filteredStudents.length) * 100 : 0}%` }} />
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
