import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Plus, Trash2, CheckCircle, Clock, ChevronDown, ChevronRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useData } from "@/contexts/DataContext";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Question {
  id: string;
  type: "mcq" | "truefalse" | "descriptive";
  question: string;
  options?: string[];
  correctAnswer: string;
}

interface Assignment {
  id: string;
  title: string;
  targetClass: string;
  subject: string;
  questions: Question[];
  dueDate: string;
  createdAt: string;
  status: "active" | "closed";
}

const STORAGE_KEY = "cc_assignments";

const loadAssignments = (teacherId: string): Assignment[] => {
  try {
    const data = localStorage.getItem(`${STORAGE_KEY}_${teacherId}`);
    return data ? JSON.parse(data) : [];
  } catch { return []; }
};

const saveAssignments = (teacherId: string, assignments: Assignment[]) => {
  localStorage.setItem(`${STORAGE_KEY}_${teacherId}`, JSON.stringify(assignments));
};

const TeacherAssignments = () => {
  const { user } = useAuth();
  const { teachers } = useData();
  const teacher = teachers.find((t) => t.id === user?.id);
  const myClasses = teacher?.classes || [];

  const [assignments, setAssignments] = useState<Assignment[]>(() => loadAssignments(user?.id || ""));
  const [showForm, setShowForm] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [form, setForm] = useState({ title: "", targetClass: myClasses[0] || "", subject: "", dueDate: "" });
  const [questions, setQuestions] = useState<Question[]>([]);
  const [qForm, setQForm] = useState({ type: "mcq" as Question["type"], question: "", options: ["", "", "", ""], correctAnswer: "" });

  const addQuestion = useCallback(() => {
    if (!qForm.question.trim()) { toast.error("Enter a question"); return; }
    if (!qForm.correctAnswer.trim()) { toast.error("Enter the correct answer"); return; }
    const q: Question = {
      id: crypto.randomUUID(),
      type: qForm.type,
      question: qForm.question,
      options: qForm.type === "mcq" ? qForm.options.filter(Boolean) : undefined,
      correctAnswer: qForm.correctAnswer,
    };
    setQuestions((prev) => [...prev, q]);
    setQForm({ type: "mcq", question: "", options: ["", "", "", ""], correctAnswer: "" });
    toast.success("Question added");
  }, [qForm]);

  const createAssignment = useCallback(() => {
    if (!form.title.trim() || !form.targetClass || !form.subject.trim()) { toast.error("Fill all fields"); return; }
    if (questions.length === 0) { toast.error("Add at least 1 question"); return; }
    const assignment: Assignment = {
      id: crypto.randomUUID(),
      ...form,
      questions,
      createdAt: new Date().toISOString(),
      status: "active",
    };
    const updated = [...assignments, assignment];
    setAssignments(updated);
    saveAssignments(user?.id || "", updated);
    setShowForm(false);
    setQuestions([]);
    setForm({ title: "", targetClass: myClasses[0] || "", subject: "", dueDate: "" });
    toast.success("Assignment created!");
  }, [form, questions, assignments, user?.id, myClasses]);

  const deleteAssignment = (id: string) => {
    const updated = assignments.filter((a) => a.id !== id);
    setAssignments(updated);
    saveAssignments(user?.id || "", updated);
    toast.success("Assignment deleted");
  };

  return (
    <div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold mb-1"><span className="text-gradient-brand">Assignments</span></h1>
          <p className="text-white/60 font-body">{assignments.length} assignment(s) created</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="bg-gradient-to-r from-neon-blue to-neon-purple text-white">
          <Plus className="w-4 h-4 mr-1" /> New Assignment
        </Button>
      </motion.div>

      {/* Create Form */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden mb-6">
            <div className="glass-card p-6 space-y-4">
              <h2 className="font-display text-lg font-bold text-white">Create Assignment</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Assignment Title" className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm font-body focus:outline-none focus:border-primary/50" />
                <select value={form.targetClass} onChange={(e) => setForm({ ...form, targetClass: e.target.value })} className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm font-body focus:outline-none focus:border-primary/50">
                  {myClasses.map((c) => <option key={c} value={c} className="bg-[hsl(220,30%,15%)]">{c}</option>)}
                </select>
                <input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="Subject" className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm font-body focus:outline-none focus:border-primary/50" />
                <input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm font-body focus:outline-none focus:border-primary/50" />
              </div>

              {/* Add Questions */}
              <div className="border-t border-white/10 pt-4">
                <h3 className="font-display text-sm font-bold text-white/80 mb-3">Add Questions ({questions.length} added)</h3>
                <div className="space-y-3">
                  <div className="flex gap-3 flex-wrap">
                    {(["mcq", "truefalse", "descriptive"] as const).map((t) => (
                      <button key={t} onClick={() => setQForm({ ...qForm, type: t })} className={`px-3 py-1.5 rounded-lg text-xs font-body uppercase tracking-wider ${qForm.type === t ? "bg-primary/20 text-primary border border-primary/30" : "bg-white/5 text-white/50 border border-white/10"}`}>
                        {t === "mcq" ? "MCQ" : t === "truefalse" ? "True/False" : "Descriptive"}
                      </button>
                    ))}
                  </div>
                  <textarea value={qForm.question} onChange={(e) => setQForm({ ...qForm, question: e.target.value })} placeholder="Enter question..." rows={2} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm font-body focus:outline-none focus:border-primary/50 resize-none" />

                  {qForm.type === "mcq" && (
                    <div className="grid grid-cols-2 gap-2">
                      {qForm.options.map((opt, i) => (
                        <input key={i} value={opt} onChange={(e) => { const o = [...qForm.options]; o[i] = e.target.value; setQForm({ ...qForm, options: o }); }} placeholder={`Option ${i + 1}`} className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm font-body focus:outline-none focus:border-primary/50" />
                      ))}
                    </div>
                  )}

                  {qForm.type === "truefalse" ? (
                    <div className="flex gap-3">
                      {["True", "False"].map((v) => (
                        <button key={v} onClick={() => setQForm({ ...qForm, correctAnswer: v })} className={`px-4 py-2 rounded-lg text-sm font-body ${qForm.correctAnswer === v ? "bg-neon-green/20 text-neon-green border border-neon-green/30" : "bg-white/5 text-white/50 border border-white/10"}`}>{v}</button>
                      ))}
                    </div>
                  ) : (
                    <input value={qForm.correctAnswer} onChange={(e) => setQForm({ ...qForm, correctAnswer: e.target.value })} placeholder="Correct Answer" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm font-body focus:outline-none focus:border-primary/50" />
                  )}

                  <Button onClick={addQuestion} size="sm" variant="ghost" className="text-neon-green border border-neon-green/30">
                    <Plus className="w-3.5 h-3.5 mr-1" /> Add Question
                  </Button>
                </div>

                {/* Questions preview */}
                {questions.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {questions.map((q, i) => (
                      <div key={q.id} className="bg-white/5 rounded-lg px-3 py-2 flex items-center justify-between">
                        <span className="text-sm text-white/70 font-body">{i + 1}. {q.question} <span className="text-xs text-white/30">({q.type})</span></span>
                        <button onClick={() => setQuestions(questions.filter((x) => x.id !== q.id))} className="text-white/30 hover:text-destructive"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <Button variant="ghost" onClick={() => { setShowForm(false); setQuestions([]); }} className="text-white/50">Cancel</Button>
                <Button onClick={createAssignment} className="bg-gradient-to-r from-neon-green to-neon-blue text-white">Create Assignment</Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Assignment List */}
      {assignments.length === 0 && !showForm ? (
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="glass-card p-12 text-center">
          <FileText className="w-16 h-16 text-white/20 mx-auto mb-4" />
          <p className="text-white/40 font-body">No assignments yet. Click "New Assignment" to create one.</p>
        </motion.div>
      ) : (
        <div className="space-y-3">
          {assignments.map((a, i) => {
            const isExpanded = expandedId === a.id;
            return (
              <motion.div key={a.id} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: i * 0.03 }}>
                <div className="glass-card overflow-hidden">
                  <button onClick={() => setExpandedId(isExpanded ? null : a.id)} className="w-full p-4 flex items-center gap-4 hover:bg-white/5 transition-colors">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neon-blue to-neon-purple flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 text-left">
                      <h3 className="font-display text-sm font-bold text-white">{a.title}</h3>
                      <p className="text-xs text-white/50 font-body">{a.targetClass} · {a.subject} · {a.questions.length} questions</p>
                    </div>
                    <div className="flex items-center gap-3">
                      {a.status === "active" ? (
                        <span className="text-xs bg-neon-green/15 text-neon-green px-2 py-0.5 rounded-full"><Clock className="w-3 h-3 inline mr-1" />Active</span>
                      ) : (
                        <span className="text-xs bg-white/10 text-white/50 px-2 py-0.5 rounded-full"><CheckCircle className="w-3 h-3 inline mr-1" />Closed</span>
                      )}
                      {isExpanded ? <ChevronDown className="w-4 h-4 text-white/40" /> : <ChevronRight className="w-4 h-4 text-white/40" />}
                    </div>
                  </button>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
                        <div className="px-4 pb-4 space-y-2 border-t border-white/10 pt-3">
                          {a.dueDate && <p className="text-xs text-white/40 font-body">Due: {new Date(a.dueDate).toLocaleDateString()}</p>}
                          {a.questions.map((q, qi) => (
                            <div key={q.id} className="bg-white/5 rounded-lg p-3">
                              <p className="text-sm text-white/80 font-body mb-1">{qi + 1}. {q.question}</p>
                              {q.options && (
                                <div className="flex flex-wrap gap-2 mb-1">
                                  {q.options.map((opt, oi) => (
                                    <span key={oi} className={`text-xs px-2 py-0.5 rounded-full ${opt === q.correctAnswer ? "bg-neon-green/15 text-neon-green" : "bg-white/5 text-white/50"}`}>{opt}</span>
                                  ))}
                                </div>
                              )}
                              <p className="text-xs text-neon-green/80 font-body">Answer: {q.correctAnswer}</p>
                            </div>
                          ))}
                          <div className="flex justify-end pt-2">
                            <Button size="sm" variant="ghost" onClick={() => deleteAssignment(a.id)} className="text-destructive hover:text-destructive/80">
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

export default TeacherAssignments;
