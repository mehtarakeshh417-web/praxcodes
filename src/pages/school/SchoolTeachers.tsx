import { useState } from "react";
import { motion } from "framer-motion";
import { useData } from "@/contexts/DataContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Users, Plus, X, Trash2 } from "lucide-react";
import { toast } from "sonner";

const CLASS_OPTIONS = ["1st", "2nd", "3rd", "4th", "5th (A)", "5th (B)", "6th (A)", "6th (B)", "7th (A)", "7th (B)", "8th (A)", "8th (B)"];

const SchoolTeachers = () => {
  const { user } = useAuth();
  const { addTeacher, getSchoolTeachers, deleteTeacher } = useData();
  const { addDemoUser, removeDemoUser } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ firstName: "", lastName: "", classes: [] as string[], username: "", password: "" });

  const schoolId = user?.id || "";
  const teachers = getSchoolTeachers(schoolId);

  const toggleClass = (cls: string) => {
    setForm((f) => ({ ...f, classes: f.classes.includes(cls) ? f.classes.filter((c) => c !== cls) : [...f.classes, cls] }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.firstName || !form.lastName || form.classes.length === 0) { toast.error("Fill all fields and select at least one class"); return; }
    const customUsername = form.username.trim() || undefined;
    const customPassword = form.password.trim() || undefined;
    const teacher = addTeacher({ ...form, schoolId }, customUsername, customPassword);
    addDemoUser(teacher.username, teacher.password, {
      id: teacher.id, username: teacher.username, role: "teacher",
      displayName: `${form.firstName} ${form.lastName}`, schoolName: user?.schoolName || user?.displayName,
    });
    toast.success(`Teacher created! Username: ${teacher.username} | Password: ${teacher.password}`);
    setForm({ firstName: "", lastName: "", classes: [], username: "", password: "" });
    setShowForm(false);
  };

  const handleDelete = (teacherId: string, teacherName: string) => {
    if (!confirm(`Delete teacher "${teacherName}"? Students assigned to this teacher must be reassigned first.`)) return;
    const result = deleteTeacher(teacherId);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    result.removedUsernames.forEach((u) => removeDemoUser(u));
    toast.success(`Teacher "${teacherName}" deleted.`);
  };

  return (
    <div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold mb-1"><span className="text-gradient-brand">Teachers</span></h1>
          <p className="text-white/60 font-body">Manage your school's teaching staff</p>
        </div>
        <Button variant="hero" size="lg" onClick={() => setShowForm(true)}><Plus className="w-5 h-5 mr-2" /> Add Teacher</Button>
      </motion.div>

      {showForm && (
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-lg font-bold text-white">New Teacher</h2>
            <Button variant="ghost" size="icon" onClick={() => setShowForm(false)}><X className="w-5 h-5" /></Button>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-white/80 font-body font-medium">First Name *</Label>
                <Input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} placeholder="First name" className="bg-white/10 border-white/20 text-white placeholder:text-white/40" />
              </div>
              <div className="space-y-2">
                <Label className="text-white/80 font-body font-medium">Last Name *</Label>
                <Input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} placeholder="Last name" className="bg-white/10 border-white/20 text-white placeholder:text-white/40" />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-white/80 font-body font-medium">Username (auto if blank)</Label>
                <Input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} placeholder="Auto-generated if left blank" className="bg-white/10 border-white/20 text-white placeholder:text-white/40" />
              </div>
              <div className="space-y-2">
                <Label className="text-white/80 font-body font-medium">Password (auto if blank)</Label>
                <Input value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Auto-generated if left blank" className="bg-white/10 border-white/20 text-white placeholder:text-white/40" />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-white/80 font-body font-medium">Teaching Classes *</Label>
              <div className="flex flex-wrap gap-2">
                {CLASS_OPTIONS.map((cls) => (
                  <button key={cls} type="button" onClick={() => toggleClass(cls)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-body font-medium transition-all ${form.classes.includes(cls) ? "bg-neon-blue/20 text-neon-blue border border-neon-blue/40" : "bg-white/10 text-white/60 border border-white/20 hover:bg-white/15"}`}>
                    {cls}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-4">
              <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button type="submit" variant="hero">Create Teacher</Button>
            </div>
          </form>
        </motion.div>
      )}

      {teachers.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-12 text-center">
          <Users className="w-16 h-16 text-white/30 mx-auto mb-4" />
          <p className="text-white/50 font-body">No teachers added yet</p>
        </motion.div>
      ) : (
        <div className="space-y-3">
          {teachers.map((t, i) => (
            <motion.div key={t.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} className="glass-card p-4 flex items-center justify-between">
              <div>
                <span className="font-body font-bold text-white">{t.firstName} {t.lastName}</span>
                <span className="text-white/50 text-xs ml-3">@{t.username}</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex gap-2">
                  {t.classes.map((cls) => (
                    <span key={cls} className="px-2 py-0.5 rounded bg-neon-blue/15 text-neon-blue text-xs font-medium">{cls}</span>
                  ))}
                </div>
                <Button variant="ghost" size="icon" className="text-white/30 hover:text-destructive shrink-0" onClick={() => handleDelete(t.id, `${t.firstName} ${t.lastName}`)}>
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

export default SchoolTeachers;
