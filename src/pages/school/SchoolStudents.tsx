import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useData } from "@/contexts/DataContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GraduationCap, Plus, X, Trash2, AlertTriangle, Edit2 } from "lucide-react";
import { toast } from "sonner";

const CLASS_OPTIONS = ["1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th"];
const DEFAULT_SECTIONS = ["A", "B", "C", "D", "E"];

const SchoolStudents = () => {
  const { user } = useAuth();
  const { addStudent, getSchoolStudents, getSchoolTeachers, getSchool, deleteStudent, updateStudent } = useData();
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: "", fatherName: "", class: "", section: "", rollNo: "", teacherId: "" });
  const [form, setForm] = useState({ name: "", fatherName: "", class: "", section: "", rollNo: "", teacherId: "", username: "", password: "" });

  const schoolId = user?.id || "";
  const students = getSchoolStudents(schoolId);
  const teachers = getSchoolTeachers(schoolId);
  const school = getSchool(schoolId);
  const SECTION_OPTIONS = school?.sections?.length ? school.sections : DEFAULT_SECTIONS;

  const filteredTeachers = useMemo(() => {
    if (!form.class) return [];
    return teachers.filter((t) => t.classes.some((c) => c.startsWith(form.class)));
  }, [form.class, teachers]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.fatherName || !form.class || !form.section || !form.rollNo || !form.teacherId) {
      toast.error("Fill all required fields including teacher assignment");
      return;
    }
    setIsSubmitting(true);
    const customUsername = form.username.trim() || undefined;
    const customPassword = form.password.trim() || undefined;
    const student = await addStudent({ ...form, schoolId }, customUsername, customPassword);
    if (student) {
      toast.success(`Student created! Username: ${student.username} | Password: ${student.password}`);
      setForm({ name: "", fatherName: "", class: "", section: "", rollNo: "", teacherId: "", username: "", password: "" });
      setShowForm(false);
    } else {
      toast.error("Failed to create student.");
    }
    setIsSubmitting(false);
  };

  const handleDelete = async (studentId: string, studentName: string) => {
    if (!confirm(`Delete student "${studentName}"?`)) return;
    await deleteStudent(studentId);
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

  const startEdit = (s: typeof students[0]) => {
    setEditingId(s.id);
    setEditForm({ name: s.name, fatherName: s.fatherName, class: s.class, section: s.section, rollNo: s.rollNo, teacherId: s.teacherId });
  };

  const saveEdit = async (studentId: string) => {
    if (!editForm.name || !editForm.fatherName) {
      toast.error("Name fields cannot be empty");
      return;
    }
    await updateStudent(studentId, editForm);
    toast.success("Student updated.");
    setEditingId(null);
  };

  return (
    <div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold mb-1"><span className="text-gradient-brand">Students</span></h1>
          <p className="text-white/60 font-body">Manage student enrollment</p>
        </div>
        <Button variant="hero" size="lg" onClick={handleAddClick}><Plus className="w-5 h-5 mr-2" /> Add Student</Button>
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
              <select value={form.class} onChange={(e) => setForm({ ...form, class: e.target.value, teacherId: "" })} className="w-full rounded-lg bg-white/10 border border-white/20 text-white px-3 py-2 text-sm">
                <option value="" className="bg-cyber-dark">Select class</option>
                {CLASS_OPTIONS.map((c) => <option key={c} value={c} className="bg-cyber-dark">{c}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <Label className="text-white/80 font-body font-medium">Section *</Label>
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
              <Label className="text-white/80 font-body font-medium">Assign Teacher * {!form.class && <span className="text-white/40">(select class first)</span>}</Label>
              <select value={form.teacherId} onChange={(e) => setForm({ ...form, teacherId: e.target.value })} disabled={!form.class} className="w-full rounded-lg bg-white/10 border border-white/20 text-white px-3 py-2 text-sm disabled:opacity-40">
                <option value="" className="bg-cyber-dark">{form.class ? (filteredTeachers.length === 0 ? "No teachers for this class" : "Select teacher") : "Select class first"}</option>
                {filteredTeachers.map((t) => <option key={t.id} value={t.id} className="bg-cyber-dark">{t.firstName} {t.lastName} ({t.classes.join(", ")})</option>)}
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
              <Button type="submit" variant="hero" disabled={isSubmitting}>{isSubmitting ? "Creating..." : "Create Student"}</Button>
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
            <motion.div key={s.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }} className="glass-card p-4">
              {editingId === s.id ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <Input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} placeholder="Name" className="bg-white/10 border-white/20 text-white" />
                    <Input value={editForm.fatherName} onChange={(e) => setEditForm({ ...editForm, fatherName: e.target.value })} placeholder="Father's name" className="bg-white/10 border-white/20 text-white" />
                    <Input value={editForm.rollNo} onChange={(e) => setEditForm({ ...editForm, rollNo: e.target.value })} placeholder="Roll No" className="bg-white/10 border-white/20 text-white" />
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="hero" onClick={() => saveEdit(s.id)}>Save</Button>
                    <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>Cancel</Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="font-body font-bold text-white">{s.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex gap-3 text-xs text-white/60">
                      <span className="px-2 py-0.5 rounded bg-neon-green/15 text-neon-green font-medium">{s.class} ({s.section || "A"})</span>
                      <span>Roll: {s.rollNo}</span>
                      <span className="text-white/40">Teacher: {getTeacherName(s.teacherId)}</span>
                    </div>
                    <Button variant="ghost" size="icon" className="text-white/30 hover:text-neon-blue shrink-0" onClick={() => startEdit(s)}>
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-white/30 hover:text-destructive shrink-0" onClick={() => handleDelete(s.id, s.name)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SchoolStudents;
