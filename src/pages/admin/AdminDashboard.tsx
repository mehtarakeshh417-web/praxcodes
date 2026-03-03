import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import StatCard from "@/components/StatCard";
import { useData } from "@/contexts/DataContext";
import { School, Users, GraduationCap, Activity, TrendingUp, Globe, Filter, MapPin } from "lucide-react";

const AdminDashboard = () => {
  const { schools, teachers, students } = useData();
  const navigate = useNavigate();
  const [filterState, setFilterState] = useState("");
  const [filterCity, setFilterCity] = useState("");

  const uniqueStates = useMemo(() => [...new Set(schools.map((s) => s.state).filter(Boolean))].sort(), [schools]);
  const availableCities = useMemo(() => {
    const filtered = filterState ? schools.filter((s) => s.state === filterState) : schools;
    return [...new Set(filtered.map((s) => s.city).filter(Boolean))].sort();
  }, [filterState, schools]);

  const filteredSchools = useMemo(() => {
    return schools.filter((s) => {
      if (filterState && s.state !== filterState) return false;
      if (filterCity && s.city !== filterCity) return false;
      return true;
    });
  }, [schools, filterState, filterCity]);

  const filteredSchoolIds = new Set(filteredSchools.map((s) => s.id));
  const filteredTeachers = teachers.filter((t) => filteredSchoolIds.has(t.schoolId));
  const filteredStudents = students.filter((s) => filteredSchoolIds.has(s.schoolId));

  return (
    <div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="font-display text-3xl font-bold mb-1">
          <span className="text-gradient-purple">Master</span> Control Panel
        </h1>
        <p className="text-white/60 font-body mb-6">Platform-wide overview and management</p>
      </motion.div>

      {/* Filters */}
      {schools.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.05 }} className="glass-card p-4 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="w-4 h-4 text-neon-blue" />
            <span className="text-sm font-display font-bold text-white/80">Filter by Location</span>
            {(filterState || filterCity) && (
              <button onClick={() => { setFilterState(""); setFilterCity(""); }} className="text-xs text-neon-orange hover:text-neon-orange/80 ml-auto">Clear</button>
            )}
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            <select value={filterState} onChange={(e) => { setFilterState(e.target.value); setFilterCity(""); }} className="w-full rounded-lg bg-white/10 border border-white/20 text-white px-3 py-2 text-sm">
              <option value="" className="bg-cyber-dark">All States</option>
              {uniqueStates.map((s) => <option key={s} value={s} className="bg-cyber-dark">{s}</option>)}
            </select>
            <select value={filterCity} onChange={(e) => setFilterCity(e.target.value)} className="w-full rounded-lg bg-white/10 border border-white/20 text-white px-3 py-2 text-sm">
              <option value="" className="bg-cyber-dark">All Cities</option>
              {availableCities.map((c) => <option key={c} value={c} className="bg-cyber-dark">{c}</option>)}
            </select>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard icon={School} label="Total Schools" value={filteredSchools.length} glowClass="neon-glow-purple" delay={0.1} expandable>
          {filteredSchools.length === 0 ? (
            <p className="text-white/40 text-sm font-body">No schools yet</p>
          ) : (
            <div className="space-y-2">
              {filteredSchools.map((s) => (
                <div key={s.id} className="flex items-center justify-between py-1 cursor-pointer hover:bg-white/5 rounded px-2 -mx-2" onClick={() => navigate("/dashboard/schools")}>
                  <span className="text-sm text-white/80 font-body">{s.name}</span>
                  <span className="text-xs text-white/40">{s.city}{s.state ? `, ${s.state}` : ""}</span>
                </div>
              ))}
            </div>
          )}
        </StatCard>
        <StatCard icon={Users} label="Total Teachers" value={filteredTeachers.length} glowClass="neon-glow-blue" delay={0.2} expandable>
          {filteredTeachers.length === 0 ? (
            <p className="text-white/40 text-sm font-body">No teachers yet</p>
          ) : (
            <div className="space-y-2">
              {filteredTeachers.map((t) => (
                <div key={t.id} className="flex items-center justify-between py-1">
                  <span className="text-sm text-white/80 font-body">{t.firstName} {t.lastName}</span>
                  <span className="text-xs text-white/40">@{t.username}</span>
                </div>
              ))}
            </div>
          )}
        </StatCard>
        <StatCard icon={GraduationCap} label="Total Students" value={filteredStudents.length} glowClass="neon-glow-green" delay={0.3} expandable>
          {filteredStudents.length === 0 ? (
            <p className="text-white/40 text-sm font-body">No students yet</p>
          ) : (
            <div className="space-y-2">
              {filteredStudents.slice(0, 20).map((s) => (
                <div key={s.id} className="flex items-center justify-between py-1">
                  <span className="text-sm text-white/80 font-body">{s.name}</span>
                  <span className="text-xs text-white/40">{s.class} ({s.section})</span>
                </div>
              ))}
              {filteredStudents.length > 20 && <p className="text-xs text-white/30">+{filteredStudents.length - 20} more</p>}
            </div>
          )}
        </StatCard>
        <StatCard icon={Activity} label="Active Today" value={0} glowClass="neon-glow-orange" delay={0.4} />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }} className="glass-card p-6 cursor-pointer hover:border-white/25 transition-colors" onClick={() => navigate("/dashboard/schools")}>
          <h2 className="font-display text-lg font-bold mb-4 flex items-center gap-2 text-white">
            <TrendingUp className="w-5 h-5 text-neon-green" /> Schools
          </h2>
          {filteredSchools.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <School className="w-12 h-12 text-white/25 mb-4" />
              <p className="text-white/50 font-body text-sm mb-1">No schools registered yet</p>
              <p className="text-white/35 font-body text-xs">Create your first school to get started</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredSchools.map((s) => (
                <div key={s.id} className="card-row flex items-center justify-between">
                  <span className="font-body text-sm text-white/90 font-medium">{s.name}</span>
                  <span className="text-xs text-white/50 flex items-center gap-1"><MapPin className="w-3 h-3" />{s.city}</span>
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
