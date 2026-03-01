import { useState } from "react";
import { motion } from "framer-motion";
import { useData } from "@/contexts/DataContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GraduationCap, Plus, X, Upload } from "lucide-react";
import { toast } from "sonner";

const CLASS_OPTIONS = ["1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th"];
const SECTION_OPTIONS = ["A", "B", "C"];

const SchoolStudents = () => {
  const { user } = useAuth();
  const { addStudent, getSchoolStudents } = useData();
  const { addDemoUser } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", fatherName: "", class: "", section: "", rollNo: "" });

  const schoolId = user?.id || "";
  const students = getSchoolStudents(schoolId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.fatherName || !form.class || !form.rollNo) { toast.error("Fill all required fields"); return; }
    const student = addStudent({ ...form, schoolId });
    addDemoUser(student.username, student.password, {
      id: student.id, username: student.username, role: "student",
      displayName: form.name, schoolName: user?.schoolName || user?.displayName,
      className: `${form.class} (${form.section || "A"})`,
    });
    toast.success(`Student created! Username: ${student.username} | Password: ${student.password}`);
    setForm({ name: "", fatherName: "", class: "", section: "", rollNo: "" });
    setShowForm(false);
  };

  return (
    <div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold mb-1"><span className="text-gradient-brand">Students</span></h1>
          <p className="text-white/50 font-body">Manage student enrollment</p>
        </div>
        <div className="flex gap-3">
          <Button variant="glass" size="lg"><Upload className="w-5 h-5 mr-2" /> Bulk Upload</Button>
          <Button variant="hero" size="lg" onClick={() => setShowForm(true)}><Plus className="w-5 h-5 mr-2" /> Add Student</Button>
        </div>
      </motion.div>

      {showForm && (
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-lg font-bold">New Student</h2>
            <Button variant="ghost" size="icon" onClick={() => setShowForm(false)}><X className="w-5 h-5" /></Button>
          </div>
          <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-white/70">Student Name *</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Full name" className="bg-white/5 border-white/10 text-white" />
            </div>
            <div className="space-y-2">
              <Label className="text-white/70">Father's Name *</Label>
              <Input value={form.fatherName} onChange={(e) => setForm({ ...form, fatherName: e.target.value })} placeholder="Father's name" className="bg-white/5 border-white/10 text-white" />
            </div>
            <div className="space-y-2">
              <Label className="text-white/70">Class *</Label>
              <select value={form.class} onChange={(e) => setForm({ ...form, class: e.target.value })} className="w-full rounded-lg bg-white/5 border border-white/10 text-white px-3 py-2 text-sm">
                <option value="">Select class</option>
                {CLASS_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <Label className="text-white/70">Section</Label>
              <select value={form.section} onChange={(e) => setForm({ ...form, section: e.target.value })} className="w-full rounded-lg bg-white/5 border border-white/10 text-white px-3 py-2 text-sm">
                <option value="">Select section</option>
                {SECTION_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <Label className="text-white/70">Roll Number *</Label>
              <Input value={form.rollNo} onChange={(e) => setForm({ ...form, rollNo: e.target.value })} placeholder="Roll number" className="bg-white/5 border-white/10 text-white" />
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
          <GraduationCap className="w-16 h-16 text-white/20 mx-auto mb-4" />
          <p className="text-white/40 font-body">No students enrolled yet</p>
        </motion.div>
      ) : (
        <div className="space-y-2">
          {students.map((s, i) => (
            <motion.div key={s.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }} className="glass-card p-4 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="font-body font-bold text-white/90">{s.name}</span>
                <span className="text-white/40 text-xs">@{s.username}</span>
              </div>
              <div className="flex gap-3 text-xs text-white/50">
                <span className="px-2 py-0.5 rounded bg-neon-green/10 text-neon-green">{s.class} ({s.section || "A"})</span>
                <span>Roll: {s.rollNo}</span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SchoolStudents;
