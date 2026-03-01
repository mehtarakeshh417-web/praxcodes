import { useState } from "react";
import { motion } from "framer-motion";
import { useData } from "@/contexts/DataContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GraduationCap, Plus, X, Upload, Trash2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

const CLASS_OPTIONS = ["1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th"];
const SECTION_OPTIONS = ["A", "B", "C"];

const SchoolStudents = () => {
  const { user } = useAuth();
  const { addStudent, getSchoolStudents, getSchoolTeachers, deleteStudent } = useData();
  const { addDemoUser, removeDemoUser } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", fatherName: "", class: "", section: "", rollNo: "", teacherId: "", username: "", password: "" });

  const schoolId = user?.id || "";
  const students = getSchoolStudents(schoolId);
  const teachers = getSchoolTeachers(schoolId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.fatherName || !form.class || !form.rollNo || !form.teacherId) { toast.error("Fill all required fields including teacher assignment"); return; }
    const customUsername = form.username.trim() || undefined;
    const customPassword = form.password.trim() || undefined;
    const student = addStudent({ ...form, schoolId }, customUsername, customPassword);
    addDemoUser(student.username, student.password, {
      id: student.id, username: student.username, role: "student",
      displayName: form.name, schoolName: user?.schoolName || user?.displayName,
      className: `${form.class} (${form.section || "A"})`,
    });
    toast.success(`Student created! Username: ${student.username} | Password: ${student.password}`);
    setForm({ name: "", fatherName: "", class: "", section: "", rollNo: "", teacherId: "", username: "", password: "" });
    setShowForm(false);
  };

  const handleDelete = (studentId: string, studentName: string) => {
    if (!confirm(`Delete student "${studentName}"?`)) return;
    const removedUsername = deleteStudent(studentId);
    if (removedUsername) removeDemoUser(removedUsername);
    toast.success(`Student "${studentName}" deleted.`);
  };

  const handleAddClick = () => {
    if (teachers.length === 0) {
      toast.error("Cannot create student without assigning a teacher. Please create a teacher first.");
      return;
    }
    setShowForm(true);
  };

  const getTeacherName = (teacherId: string) => {
    const t = teachers.find((t) => t.id === teacherId);
    return t ? `${t.firstName} ${t.lastName}` : "Unknown";
  };

  return (
    <div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold mb-1"><span className="text-gradient-brand">Students</span></h1>
          <p className="text-white/60 font-body">Manage student enrollment</p>
        </div>
        <div className="flex gap-3">
          <Button variant="glass" size="lg"><Upload className="w-5 h-5 mr-2" /> Bulk Upload</Button>
          <Button variant="hero" size="lg" onClick={handleAddClick}><Plus className="w-5 h-5 mr-2" /> Add Student</Button>
        </div>
      </motion.div>

      {teachers.length === 0 && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 p-4 rounded-xl bg-destructive/15 border border-destructive/30 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-destructive shrink-0" />
          <p className="text-sm font-body text-white/80">
            <strong className="text-destructive">No teachers found.</strong> You must create at least one teacher before enrolling students.
          </p>
        </motion.div>
      )}

      {showForm && (
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-lg font-bold text-white">New Student</h2>
            <Button variant="ghost" size="icon" onClick={() => setShowForm(false)}><X className="w-5 h-5" /></Button>
          </div>
          <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-white/80 font-body font-medium">Student Name *</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Full name" className="bg-white/10 border-white/20 text-white placeholder:text-white/40" />
            </div>
            <div className="space-y-2">
              <Label className="text-white/80 font-body font-medium">Father's Name *</Label>
              <Input value={form.fatherName} onChange={(e) => setForm({ ...form, fatherName: e.target.value })} placeholder="Father's name" className="bg-white/10 border-white/20 text-white placeholder:text-white/40" />
            </div>
            <div className="space-y-2">
              <Label className="text-white/80 font-body font-medium">Class *</Label>
              <select value={form.class} onChange={(e) => setForm({ ...form, class: e.target.value })} className="w-full rounded-lg bg-white/10 border border-white/20 text-white px-3 py-2 text-sm">
                <option value="" className="bg-cyber-dark">Select class</option>
                {CLASS_OPTIONS.map((c) => <option key={c} value={c} className="bg-cyber-dark">{c}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <Label className="text-white/80 font-body font-medium">Section</Label>
              <select value={form.section} onChange={(e) => setForm({ ...form, section: e.target.value })} className="w-full rounded-lg bg-white/10 border border-white/20 text-white px-3 py-2 text-sm">
                <option value="" className="bg-cyber-dark">Select section</option>
                {SECTION_OPTIONS.map((s) => <option key={s} value={s} className="bg-cyber-dark">{s}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <Label className="text-white/80 font-body font-medium">Roll Number *</Label>
              <Input value={form.rollNo} onChange={(e) => setForm({ ...form, rollNo: e.target.value })} placeholder="Roll number" className="bg-white/10 border-white/20 text-white placeholder:text-white/40" />
            </div>
            <div className="space-y-2">
              <Label className="text-white/80 font-body font-medium">Assign Teacher *</Label>
              <select value={form.teacherId} onChange={(e) => setForm({ ...form, teacherId: e.target.value })} className="w-full rounded-lg bg-white/10 border border-white/20 text-white px-3 py-2 text-sm">
                <option value="" className="bg-cyber-dark">Select teacher</option>
                {teachers.map((t) => <option key={t.id} value={t.id} className="bg-cyber-dark">{t.firstName} {t.lastName} ({t.classes.join(", ")})</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <Label className="text-white/80 font-body font-medium">Username (auto if blank)</Label>
              <Input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} placeholder="Auto-generated if left blank" className="bg-white/10 border-white/20 text-white placeholder:text-white/40" />
            </div>
            <div className="space-y-2">
              <Label className="text-white/80 font-body font-medium">Password (auto if blank)</Label>
              <Input value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Auto-generated if left blank" className="bg-white/10 border-white/20 text-white placeholder:text-white/40" />
            </div>
            <div className="md:col-span-2 flex justify-end gap-3 mt-4">
              <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button type="submit" variant="hero">Create Student</Button>
            </div>
          </form>
        </motion.div>
      )}

      {students.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-12 text-center">
          <GraduationCap className="w-16 h-16 text-white/30 mx-auto mb-4" />
          <p className="text-white/50 font-body">No students enrolled yet</p>
        </motion.div>
      ) : (
        <div className="space-y-2">
          {students.map((s, i) => (
            <motion.div key={s.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }} className="glass-card p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="font-body font-bold text-white">{s.name}</span>
                <span className="text-white/50 text-xs">@{s.username}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex gap-3 text-xs text-white/60">
                  <span className="px-2 py-0.5 rounded bg-neon-green/15 text-neon-green font-medium">{s.class} ({s.section || "A"})</span>
                  <span>Roll: {s.rollNo}</span>
                  <span className="text-white/40">Teacher: {getTeacherName(s.teacherId)}</span>
                </div>
                <Button variant="ghost" size="icon" className="text-white/30 hover:text-destructive shrink-0" onClick={() => handleDelete(s.id, s.name)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SchoolStudents;
