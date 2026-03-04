import { useState } from "react";
import { motion } from "framer-motion";
import { useData } from "@/contexts/DataContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Users, Plus, X, Trash2, Edit2, Check } from "lucide-react";
import { toast } from "sonner";
import ExpandableTeacherCard from "@/components/ExpandableTeacherCard";

const CLASS_LIST = ["1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th"];
const SECTION_LIST = ["A", "B", "C", "D", "E"];

const SchoolTeachers = () => {
  const { user } = useAuth();
  const { addTeacher, getSchoolTeachers, getSchoolStudents, deleteTeacher, updateTeacher } = useData();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ firstName: "", lastName: "", classes: [] as string[] });
  const [form, setForm] = useState({ firstName: "", lastName: "", username: "", password: "" });
  const [selectedClasses, setSelectedClasses] = useState<Record<string, string[]>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const schoolId = user?.id || "";
  const teachers = getSchoolTeachers(schoolId);
  const schoolStudents = getSchoolStudents(schoolId);

  const toggleClassSelection = (cls: string) => {
    setSelectedClasses((prev) => {
      const updated = { ...prev };
      if (updated[cls]) { delete updated[cls]; } else { updated[cls] = ["A"]; }
      return updated;
    });
  };

  const toggleSection = (cls: string, section: string) => {
    setSelectedClasses((prev) => {
      const updated = { ...prev };
      const sections = updated[cls] || [];
      if (sections.includes(section)) {
        const filtered = sections.filter((s) => s !== section);
        if (filtered.length === 0) { delete updated[cls]; } else { updated[cls] = filtered; }
      } else { updated[cls] = [...sections, section]; }
      return updated;
    });
  };

  const getClassStrings = (selected: Record<string, string[]>) => {
    const result: string[] = [];
    Object.entries(selected).forEach(([cls, sections]) => {
      sections.forEach((sec) => result.push(`${cls}-${sec}`));
    });
    return result;
  };

  const parseClassStrings = (classes: string[]): Record<string, string[]> => {
    const result: Record<string, string[]> = {};
    classes.forEach((c) => {
      const parts = c.split("-");
      const cls = parts[0];
      const sec = parts[1] || "A";
      if (!result[cls]) result[cls] = [];
      result[cls].push(sec);
    });
    return result;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const classStrings = getClassStrings(selectedClasses);
    if (!form.firstName || !form.lastName || classStrings.length === 0) {
      toast.error("Fill all fields and select at least one class with section");
      return;
    }
    setIsSubmitting(true);
    const customUsername = form.username.trim() || undefined;
    const customPassword = form.password.trim() || undefined;
    const teacher = await addTeacher({ firstName: form.firstName, lastName: form.lastName, classes: classStrings, schoolId }, customUsername, customPassword);
    if (teacher) {
      toast.success(`Teacher created! Username: ${teacher.username} | Password: ${teacher.password}`);
      setForm({ firstName: "", lastName: "", username: "", password: "" });
      setSelectedClasses({});
      setShowForm(false);
    } else {
      toast.error("Failed to create teacher. Username may already exist.");
    }
    setIsSubmitting(false);
  };

  const handleDelete = async (teacherId: string, teacherName: string) => {
    if (!confirm(`Delete teacher "${teacherName}"? Students assigned to this teacher must be reassigned first.`)) return;
    const result = await deleteTeacher(teacherId);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success(`Teacher "${teacherName}" deleted.`);
  };

  const startEdit = (t: typeof teachers[0]) => {
    setEditingId(t.id);
    setEditForm({ firstName: t.firstName, lastName: t.lastName, classes: t.classes });
  };

  const saveEdit = async (teacherId: string) => {
    if (!editForm.firstName || !editForm.lastName) {
      toast.error("Name fields cannot be empty");
      return;
    }
    await updateTeacher(teacherId, { firstName: editForm.firstName, lastName: editForm.lastName, classes: editForm.classes });
    toast.success("Teacher updated.");
    setEditingId(null);
  };

  const formatClassDisplay = (classes: string[]) => {
    const grouped = parseClassStrings(classes);
    return Object.entries(grouped).map(([cls, sections]) => `${cls} (${sections.join(",")})`).join(", ");
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

            <div className="space-y-3">
              <Label className="text-white/80 font-body font-medium">Assign Classes & Sections *</Label>
              <div className="space-y-2">
                {CLASS_LIST.map((cls) => {
                  const isSelected = !!selectedClasses[cls];
                  return (
                    <div key={cls} className={`rounded-xl border p-3 transition-all ${isSelected ? "border-primary/40 bg-primary/5" : "border-white/10 bg-white/5"}`}>
                      <div className="flex items-center gap-3">
                        <button type="button" onClick={() => toggleClassSelection(cls)}
                          className={`w-6 h-6 rounded-md border flex items-center justify-center transition-all ${isSelected ? "bg-primary border-primary text-white" : "border-white/30"}`}>
                          {isSelected && <Check className="w-4 h-4" />}
                        </button>
                        <span className="font-body text-sm text-white/90 font-medium">Class {cls}</span>
                        {isSelected && (
                          <div className="flex gap-1.5 ml-auto">
                            {SECTION_LIST.map((sec) => {
                              const secSelected = selectedClasses[cls]?.includes(sec);
                              return (
                                <button key={sec} type="button" onClick={() => toggleSection(cls, sec)}
                                  className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${secSelected ? "bg-neon-green/20 text-neon-green border border-neon-green/40" : "bg-white/10 text-white/50 border border-white/15 hover:bg-white/15"}`}>
                                  {sec}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-4">
              <Button type="button" variant="ghost" onClick={() => { setShowForm(false); setSelectedClasses({}); }}>Cancel</Button>
              <Button type="submit" variant="hero" disabled={isSubmitting}>{isSubmitting ? "Creating..." : "Create Teacher"}</Button>
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
            <motion.div key={t.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
              {editingId === t.id ? (
                <div className="glass-card p-4 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <Input value={editForm.firstName} onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })} className="bg-white/10 border-white/20 text-white" />
                    <Input value={editForm.lastName} onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })} className="bg-white/10 border-white/20 text-white" />
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="hero" onClick={() => saveEdit(t.id)}>Save</Button>
                    <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>Cancel</Button>
                  </div>
                </div>
              ) : (
                <ExpandableTeacherCard
                  teacher={t}
                  students={schoolStudents}
                  formatClassDisplay={formatClassDisplay}
                  actions={
                    <>
                      <Button variant="ghost" size="icon" className="text-white/30 hover:text-neon-blue shrink-0" onClick={() => startEdit(t)}>
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-white/30 hover:text-destructive shrink-0" onClick={() => handleDelete(t.id, `${t.firstName} ${t.lastName}`)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </>
                  }
                />
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SchoolTeachers;
