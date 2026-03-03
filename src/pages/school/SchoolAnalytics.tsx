import { useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { useData } from "@/contexts/DataContext";
import { useAuth } from "@/contexts/AuthContext";
import { BarChart3, Users, GraduationCap, TrendingUp, Download, FileSpreadsheet, Award } from "lucide-react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, AreaChart, Area, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from "recharts";
import { Button } from "@/components/ui/button";
import * as XLSX from "xlsx";
import { toast } from "sonner";

const COLORS = ["#00D4FF", "#00FF88", "#FF6B00", "#A855F7", "#F43F5E", "#FACC15", "#34D399", "#818CF8"];

const SchoolAnalytics = () => {
  const { user } = useAuth();
  const { getSchoolTeachers, getSchoolStudents } = useData();
  const schoolId = user?.id || "";
  const teachers = getSchoolTeachers(schoolId);
  const students = getSchoolStudents(schoolId);
  const reportRef = useRef<HTMLDivElement>(null);

  // Teacher-wise student count
  const teacherData = teachers.map((t) => ({
    name: `${t.firstName} ${t.lastName}`.slice(0, 14),
    fullName: `${t.firstName} ${t.lastName}`,
    students: students.filter((s) => s.teacherId === t.id).length,
    classes: t.classes.length,
  }));

  // Class distribution
  const classDistribution = students.reduce((acc, s) => { acc[s.class] = (acc[s.class] || 0) + 1; return acc; }, {} as Record<string, number>);
  const classPieData = Object.entries(classDistribution).map(([name, value]) => ({ name, value }));

  // Section distribution
  const sectionData = students.reduce((acc, s) => { const sec = s.section || "A"; acc[sec] = (acc[sec] || 0) + 1; return acc; }, {} as Record<string, number>);
  const sectionBarData = Object.entries(sectionData).map(([name, count]) => ({ name: `Section ${name}`, count }));

  // XP distribution histogram
  const xpRanges = [
    { range: "0-100", min: 0, max: 100 },
    { range: "101-500", min: 101, max: 500 },
    { range: "501-1000", min: 501, max: 1000 },
    { range: "1001-5000", min: 1001, max: 5000 },
    { range: "5001+", min: 5001, max: Infinity },
  ];
  const xpHistogram = xpRanges.map((r) => ({
    range: r.range,
    count: students.filter((s) => s.xp >= r.min && s.xp <= r.max).length,
  }));

  // Class-wise average XP
  const classXpData = Object.entries(classDistribution).map(([cls]) => {
    const classStudents = students.filter((s) => s.class === cls);
    const avgXp = classStudents.length > 0 ? Math.round(classStudents.reduce((sum, s) => sum + s.xp, 0) / classStudents.length) : 0;
    return { class: cls, avgXp, students: classStudents.length };
  });

  // Radar chart for class engagement
  const radarData = Object.entries(classDistribution).map(([cls]) => {
    const classStudents = students.filter((s) => s.class === cls);
    return {
      subject: cls,
      count: classStudents.length,
      avgXP: classStudents.length > 0 ? Math.round(classStudents.reduce((sum, s) => sum + s.xp, 0) / classStudents.length) : 0,
      avgProgress: classStudents.length > 0 ? Math.round(classStudents.reduce((sum, s) => sum + s.progress, 0) / classStudents.length) : 0,
    };
  });

  // Top students
  const topStudents = [...students].sort((a, b) => b.xp - a.xp).slice(0, 10);

  const noData = teachers.length === 0 && students.length === 0;

  // Export to Excel
  const exportToExcel = useCallback(() => {
    const wb = XLSX.utils.book_new();

    // Summary sheet
    const summaryData = [
      { Metric: "Total Teachers", Value: teachers.length },
      { Metric: "Total Students", Value: students.length },
      { Metric: "Avg Students per Teacher", Value: teachers.length > 0 ? Math.round(students.length / teachers.length) : 0 },
      { Metric: "Total XP Earned", Value: students.reduce((sum, s) => sum + s.xp, 0) },
      { Metric: "Avg XP per Student", Value: students.length > 0 ? Math.round(students.reduce((sum, s) => sum + s.xp, 0) / students.length) : 0 },
    ];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(summaryData), "Summary");

    // Students sheet
    const studentSheet = students.map((s) => ({
      Name: s.name, "Father Name": s.fatherName, Class: s.class, Section: s.section,
      "Roll No": s.rollNo, Username: s.username, XP: s.xp, "Progress %": s.progress,
      Teacher: teachers.find((t) => t.id === s.teacherId)?.firstName + " " + (teachers.find((t) => t.id === s.teacherId)?.lastName || ""),
    }));
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(studentSheet), "Students");

    // Teachers sheet
    const teacherSheet = teachers.map((t) => ({
      Name: `${t.firstName} ${t.lastName}`, Username: t.username,
      Classes: t.classes.join(", "), "Student Count": students.filter((s) => s.teacherId === t.id).length,
    }));
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(teacherSheet), "Teachers");

    // Class distribution
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(classPieData.map((d) => ({ Class: d.name, Students: d.value }))), "Class Distribution");

    XLSX.writeFile(wb, `School_Report_${new Date().toISOString().slice(0, 10)}.xlsx`);
    toast.success("Report exported to Excel!");
  }, [teachers, students, classPieData]);

  // Print visual report
  const printReport = useCallback(() => {
    if (!reportRef.current) return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) { toast.error("Popup blocked. Allow popups to print."); return; }
    printWindow.document.write(`
      <html><head><title>School Analytics Report</title>
      <style>body{font-family:system-ui;padding:40px;color:#1a1a2e;background:#fff}
      h1{color:#6c2bd9;border-bottom:2px solid #6c2bd9;padding-bottom:8px}
      h2{color:#1a1a2e;margin-top:24px}
      table{width:100%;border-collapse:collapse;margin:12px 0}
      th,td{border:1px solid #ddd;padding:8px;text-align:left;font-size:13px}
      th{background:#f0e6ff;font-weight:600}
      .stat{display:inline-block;padding:16px 24px;margin:8px;border-radius:12px;background:#f5f3ff;text-align:center}
      .stat .val{font-size:28px;font-weight:700;color:#6c2bd9}
      .stat .lbl{font-size:12px;color:#666}
      @media print{body{padding:20px}}</style></head><body>
      <h1>📊 School Analytics Report</h1>
      <p style="color:#666">Generated: ${new Date().toLocaleDateString("en-IN", { dateStyle: "full" })}</p>
      <div>
        <div class="stat"><div class="val">${teachers.length}</div><div class="lbl">Teachers</div></div>
        <div class="stat"><div class="val">${students.length}</div><div class="lbl">Students</div></div>
        <div class="stat"><div class="val">${students.reduce((s, st) => s + st.xp, 0)}</div><div class="lbl">Total XP</div></div>
      </div>
      <h2>Class Distribution</h2>
      <table><tr><th>Class</th><th>Students</th><th>Avg XP</th></tr>
      ${classXpData.map((d) => `<tr><td>${d.class}</td><td>${d.students}</td><td>${d.avgXp}</td></tr>`).join("")}
      </table>
      <h2>Teachers</h2>
      <table><tr><th>Name</th><th>Classes</th><th>Students</th></tr>
      ${teachers.map((t) => `<tr><td>${t.firstName} ${t.lastName}</td><td>${t.classes.join(", ")}</td><td>${students.filter((s) => s.teacherId === t.id).length}</td></tr>`).join("")}
      </table>
      <h2>Top Students by XP</h2>
      <table><tr><th>#</th><th>Name</th><th>Class</th><th>XP</th></tr>
      ${topStudents.map((s, i) => `<tr><td>${i + 1}</td><td>${s.name}</td><td>${s.class} (${s.section})</td><td>${s.xp}</td></tr>`).join("")}
      </table>
      <h2>Section Distribution</h2>
      <table><tr><th>Section</th><th>Students</th></tr>
      ${sectionBarData.map((d) => `<tr><td>${d.name}</td><td>${d.count}</td></tr>`).join("")}
      </table>
      </body></html>
    `);
    printWindow.document.close();
    printWindow.print();
  }, [teachers, students, classXpData, topStudents, sectionBarData]);

  return (
    <div ref={reportRef}>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-3xl font-bold mb-1"><span className="text-gradient-brand">Analytics</span></h1>
          <p className="text-white/50 font-body">School performance insights</p>
        </div>
        <div className="flex gap-3">
          <Button variant="glass" size="lg" onClick={exportToExcel}>
            <FileSpreadsheet className="w-4 h-4 mr-2" /> Export Excel
          </Button>
          <Button variant="glass" size="lg" onClick={printReport}>
            <Download className="w-4 h-4 mr-2" /> Print Report
          </Button>
        </div>
      </motion.div>

      {/* Summary */}
      <div className="grid md:grid-cols-4 gap-4 mb-8">
        {[
          { icon: Users, label: "Teachers", value: teachers.length, color: "text-neon-blue" },
          { icon: GraduationCap, label: "Students", value: students.length, color: "text-neon-green" },
          { icon: Award, label: "Total XP", value: students.reduce((s, st) => s + st.xp, 0), color: "text-neon-orange" },
          { icon: TrendingUp, label: "Avg XP", value: students.length > 0 ? Math.round(students.reduce((s, st) => s + st.xp, 0) / students.length) : 0, color: "text-neon-purple" },
        ].map((item, i) => (
          <motion.div key={item.label} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: i * 0.05 }} className="glass-card p-5 text-center">
            <item.icon className={`w-7 h-7 mx-auto mb-2 ${item.color}`} />
            <div className="font-display text-2xl font-bold">{item.value}</div>
            <div className="text-white/50 text-xs font-body">{item.label}</div>
          </motion.div>
        ))}
      </div>

      {noData ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-12 text-center">
          <BarChart3 className="w-16 h-16 text-white/20 mx-auto mb-4" />
          <p className="text-white/40 font-body">No data yet. Add teachers and students to see analytics.</p>
        </motion.div>
      ) : (
        <>
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {/* Teacher-wise students */}
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
              <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.25 }} className="glass-card p-6">
                <h2 className="font-display text-lg font-bold mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-neon-green" /> Students by Class
                </h2>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie data={classPieData} cx="50%" cy="50%" outerRadius={90} innerRadius={40} dataKey="value" label={({ name, value }) => `${name}: ${value}`} labelLine={false}>
                      {classPieData.map((_, index) => <Cell key={index} fill={COLORS[index % COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: "rgba(0,0,0,0.9)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 8, fontSize: 12 }} />
                    <Legend wrapperStyle={{ fontSize: 11, color: "rgba(255,255,255,0.6)" }} />
                  </PieChart>
                </ResponsiveContainer>
              </motion.div>
            )}
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {/* Section distribution */}
            {sectionBarData.length > 0 && (
              <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} className="glass-card p-6">
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

            {/* XP Histogram */}
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.35 }} className="glass-card p-6">
              <h2 className="font-display text-lg font-bold mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-neon-purple" /> XP Distribution
              </h2>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={xpHistogram}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="range" tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 11 }} />
                  <YAxis tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: "rgba(0,0,0,0.9)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="count" fill="#A855F7" radius={[4, 4, 0, 0]} name="Students" />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>
          </div>

          {/* Class-wise Avg XP Area Chart */}
          {classXpData.length > 0 && (
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.4 }} className="glass-card p-6 mb-6">
              <h2 className="font-display text-lg font-bold mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-neon-green" /> Class-wise Average XP
              </h2>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={classXpData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="class" tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 11 }} />
                  <YAxis tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: "rgba(0,0,0,0.9)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 8, fontSize: 12 }} />
                  <Area type="monotone" dataKey="avgXp" fill="rgba(0,212,255,0.2)" stroke="#00D4FF" strokeWidth={2} name="Avg XP" />
                </AreaChart>
              </ResponsiveContainer>
            </motion.div>
          )}

          {/* Radar Chart */}
          {radarData.length > 2 && (
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.45 }} className="glass-card p-6 mb-6">
              <h2 className="font-display text-lg font-bold mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-neon-blue" /> Class Engagement Radar
              </h2>
              <ResponsiveContainer width="100%" height={280}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="rgba(255,255,255,0.15)" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: "rgba(255,255,255,0.6)", fontSize: 11 }} />
                  <PolarRadiusAxis tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 10 }} />
                  <Radar name="Students" dataKey="count" stroke="#00D4FF" fill="rgba(0,212,255,0.3)" />
                  <Radar name="Avg XP" dataKey="avgXP" stroke="#00FF88" fill="rgba(0,255,136,0.2)" />
                  <Legend wrapperStyle={{ fontSize: 11, color: "rgba(255,255,255,0.6)" }} />
                  <Tooltip contentStyle={{ background: "rgba(0,0,0,0.9)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 8, fontSize: 12 }} />
                </RadarChart>
              </ResponsiveContainer>
            </motion.div>
          )}

          {/* Teachers List */}
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.5 }} className="glass-card p-6 mb-6">
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

          {/* Top Students */}
          {topStudents.length > 0 && (
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.55 }} className="glass-card p-6">
              <h2 className="font-display font-bold mb-4 flex items-center gap-2"><GraduationCap className="w-5 h-5 text-neon-green" /> Top Students by XP</h2>
              <div className="space-y-2">{topStudents.map((s, i) => (
                <div key={s.id} className="bg-white/5 rounded-xl px-4 py-2 flex justify-between text-sm items-center">
                  <div className="flex items-center gap-3">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${i < 3 ? "bg-neon-orange/20 text-neon-orange" : "bg-white/10 text-white/40"}`}>{i + 1}</span>
                    <span className="text-white/80">{s.name}</span>
                  </div>
                  <div className="flex gap-3 text-white/40 text-xs">
                    <span>{s.class} ({s.section || "A"})</span>
                    <span className="text-neon-green font-medium">{s.xp} XP</span>
                  </div>
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
