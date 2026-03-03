import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Code, Plus, Trash2, ChevronDown, ChevronRight, Users } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useData } from "@/contexts/DataContext";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Project {
  id: string;
  title: string;
  description: string;
  targetClass: string;
  technology: string;
  dueDate: string;
  createdAt: string;
}

const STORAGE_KEY = "cc_projects";

const loadProjects = (teacherId: string): Project[] => {
  try {
    const data = localStorage.getItem(`${STORAGE_KEY}_${teacherId}`);
    return data ? JSON.parse(data) : [];
  } catch { return []; }
};

const saveProjects = (teacherId: string, projects: Project[]) => {
  localStorage.setItem(`${STORAGE_KEY}_${teacherId}`, JSON.stringify(projects));
};

const TECH_OPTIONS = ["Scratch Jr", "Scratch", "MS Paint", "MS Word", "MS PowerPoint", "MS Excel", "MS Access", "HTML/CSS", "Python", "GIMP", "KRITA", "Canva", "MIT App Inventor"];

const TeacherProjects = () => {
  const { user } = useAuth();
  const { teachers, getTeacherStudents } = useData();
  const teacher = teachers.find((t) => t.id === user?.id);
  const myClasses = teacher?.classes || [];

  const [projects, setProjects] = useState<Project[]>(() => loadProjects(user?.id || ""));
  const [showForm, setShowForm] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [form, setForm] = useState({ title: "", description: "", targetClass: myClasses[0] || "", technology: TECH_OPTIONS[0], dueDate: "" });

  const createProject = useCallback(() => {
    if (!form.title.trim() || !form.description.trim() || !form.targetClass) { toast.error("Fill all fields"); return; }
    const project: Project = { id: crypto.randomUUID(), ...form, createdAt: new Date().toISOString() };
    const updated = [...projects, project];
    setProjects(updated);
    saveProjects(user?.id || "", updated);
    setShowForm(false);
    setForm({ title: "", description: "", targetClass: myClasses[0] || "", technology: TECH_OPTIONS[0], dueDate: "" });
    toast.success("Project assigned!");
  }, [form, projects, user?.id, myClasses]);

  const deleteProject = (id: string) => {
    const updated = projects.filter((p) => p.id !== id);
    setProjects(updated);
    saveProjects(user?.id || "", updated);
    toast.success("Project deleted");
  };

  const allStudents = getTeacherStudents(user?.id || "");

  return (
    <div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold mb-1"><span className="text-gradient-brand">Projects</span></h1>
          <p className="text-white/60 font-body">{projects.length} project(s) assigned</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="bg-gradient-to-r from-neon-green to-neon-blue text-white">
          <Plus className="w-4 h-4 mr-1" /> Assign Project
        </Button>
      </motion.div>

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden mb-6">
            <div className="glass-card p-6 space-y-4">
              <h2 className="font-display text-lg font-bold text-white">Assign New Project</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Project Title" className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm font-body focus:outline-none focus:border-primary/50" />
                <select value={form.targetClass} onChange={(e) => setForm({ ...form, targetClass: e.target.value })} className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm font-body focus:outline-none focus:border-primary/50">
                  {myClasses.map((c) => <option key={c} value={c} className="bg-[hsl(220,30%,15%)]">{c}</option>)}
                </select>
                <select value={form.technology} onChange={(e) => setForm({ ...form, technology: e.target.value })} className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm font-body focus:outline-none focus:border-primary/50">
                  {TECH_OPTIONS.map((t) => <option key={t} value={t} className="bg-[hsl(220,30%,15%)]">{t}</option>)}
                </select>
                <input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm font-body focus:outline-none focus:border-primary/50" />
              </div>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Project description and instructions..." rows={3} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm font-body focus:outline-none focus:border-primary/50 resize-none" />
              <div className="flex gap-3 justify-end">
                <Button variant="ghost" onClick={() => setShowForm(false)} className="text-white/50">Cancel</Button>
                <Button onClick={createProject} className="bg-gradient-to-r from-neon-green to-neon-blue text-white">Assign Project</Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {projects.length === 0 && !showForm ? (
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="glass-card p-12 text-center">
          <Code className="w-16 h-16 text-white/20 mx-auto mb-4" />
          <p className="text-white/40 font-body">No projects assigned yet. Click "Assign Project" to create one.</p>
        </motion.div>
      ) : (
        <div className="space-y-3">
          {projects.map((p, i) => {
            const isExpanded = expandedId === p.id;
            const classStudents = allStudents.filter((s) => p.targetClass.includes(s.class));
            return (
              <motion.div key={p.id} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: i * 0.03 }}>
                <div className="glass-card overflow-hidden">
                  <button onClick={() => setExpandedId(isExpanded ? null : p.id)} className="w-full p-4 flex items-center gap-4 hover:bg-white/5 transition-colors">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neon-green to-neon-blue flex items-center justify-center shrink-0">
                      <Code className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 text-left">
                      <h3 className="font-display text-sm font-bold text-white">{p.title}</h3>
                      <p className="text-xs text-white/50 font-body">{p.targetClass} · {p.technology}</p>
                    </div>
                    <span className="text-xs bg-neon-orange/15 text-neon-orange px-2 py-0.5 rounded-full">{p.technology}</span>
                    {isExpanded ? <ChevronDown className="w-4 h-4 text-white/40" /> : <ChevronRight className="w-4 h-4 text-white/40" />}
                  </button>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
                        <div className="px-4 pb-4 space-y-3 border-t border-white/10 pt-3">
                          <p className="text-sm text-white/70 font-body">{p.description}</p>
                          {p.dueDate && <p className="text-xs text-white/40 font-body">Due: {new Date(p.dueDate).toLocaleDateString()}</p>}
                          <div className="bg-white/5 rounded-lg p-3">
                            <p className="text-xs text-white/50 font-body flex items-center gap-1 mb-2"><Users className="w-3.5 h-3.5" /> Assigned to {classStudents.length} students</p>
                            <div className="flex flex-wrap gap-1">
                              {classStudents.slice(0, 10).map((s) => (
                                <span key={s.id} className="text-xs bg-white/5 px-2 py-0.5 rounded-full text-white/60">{s.name}</span>
                              ))}
                              {classStudents.length > 10 && <span className="text-xs text-white/40">+{classStudents.length - 10} more</span>}
                            </div>
                          </div>
                          <div className="flex justify-end">
                            <Button size="sm" variant="ghost" onClick={() => deleteProject(p.id)} className="text-destructive hover:text-destructive/80">
                              <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete
                            </Button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TeacherProjects;
