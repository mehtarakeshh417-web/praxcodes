import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Plus, Trash2, CheckCircle, Clock, ChevronDown, ChevronRight, Sparkles, Play, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useData } from "@/contexts/DataContext";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { getCurriculumForClass } from "@/lib/curriculumData";

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
  teacherId: string;
}

const STORAGE_KEY = "cc_assignments";
const GEMINI_API_KEY = "AIzaSyBvPeUVKRwc4tU8sgF6bNfwdTexy9LAXhg";

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

  // AI Generation state
  const [showAI, setShowAI] = useState(false);
  const [aiTopic, setAiTopic] = useState("");
  const [aiQType, setAiQType] = useState<"mcq" | "truefalse" | "descriptive" | "mixed">("mixed");
  const [aiCount, setAiCount] = useState(5);
  const [aiLoading, setAiLoading] = useState(false);

  const curriculum = form.targetClass ? getCurriculumForClass(form.targetClass) : undefined;
  const subjects = curriculum?.subjects || [];

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

  const generateWithAI = useCallback(async () => {
    if (!aiTopic.trim()) { toast.error("Enter a topic for AI generation"); return; }
    setAiLoading(true);

    const typeDesc = aiQType === "mixed" ? "mixed (MCQ + True/False + Descriptive)" : aiQType === "mcq" ? "Multiple Choice (MCQ)" : aiQType === "truefalse" ? "True/False" : "Descriptive (short answer)";

    const prompt = `You are an expert K-8 computer science teacher. Generate exactly ${aiCount} ${typeDesc} questions for ${form.targetClass || "a general"} class on the topic: "${aiTopic}".

Return ONLY a valid JSON array. Each item must have:
- "type": "mcq", "truefalse", or "descriptive"
- "question": the question text
- "options": array of 4 strings (for MCQ only, omit for truefalse and descriptive)
- "correctAnswer": the correct answer string (for descriptive, provide a model answer in 1-2 sentences)

Example: [{"type":"mcq","question":"What is HTML?","options":["A markup language","A programming language","A database","An OS"],"correctAnswer":"A markup language"},{"type":"descriptive","question":"Explain what a web browser does.","correctAnswer":"A web browser is software that retrieves and displays web pages from the internet."}]

Make questions age-appropriate and educational. Return ONLY the JSON array, no other text.`;

    const models = [
      "gemini-2.0-flash-lite",
      "gemini-2.0-flash",
      "gemini-1.5-flash",
    ];

    let lastError = "";
    for (const model of models) {
      try {
        // Small delay to avoid rate limits
        await new Promise((r) => setTimeout(r, 500));

        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
              generationConfig: { temperature: 0.7, maxOutputTokens: 4096 },
            }),
          }
        );

        if (res.status === 429) {
          lastError = "Rate limited, trying another model...";
          await new Promise((r) => setTimeout(r, 2000));
          continue;
        }

        if (!res.ok) {
          lastError = `API Error ${res.status}`;
          continue;
        }

        const data = await res.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!text) { lastError = "No content in response"; continue; }

        const jsonMatch = text.match(/\[[\s\S]*\]/);
        if (!jsonMatch) { lastError = "Could not parse AI response"; continue; }

        const parsed = JSON.parse(jsonMatch[0]) as Array<{ type: string; question: string; options?: string[]; correctAnswer: string }>;
        const newQuestions: Question[] = parsed.map((q) => ({
          id: crypto.randomUUID(),
          type: (q.type === "truefalse" ? "truefalse" : q.type === "descriptive" ? "descriptive" : "mcq") as Question["type"],
          question: q.question,
          options: q.type === "mcq" ? q.options : undefined,
          correctAnswer: q.correctAnswer,
        }));

        setQuestions((prev) => [...prev, ...newQuestions]);
        setShowAI(false);
        setAiTopic("");
        toast.success(`${newQuestions.length} questions generated by AI!`);
        setAiLoading(false);
        return; // Success — exit
      } catch (err: any) {
        lastError = err.message || "AI generation failed";
        continue;
      }
    }

    toast.error(lastError || "AI generation failed after all retries");
    setAiLoading(false);
  }, [aiTopic, aiQType, aiCount, form.targetClass]);

  const createAssignment = useCallback(() => {
    if (!form.title.trim() || !form.targetClass || !form.subject.trim()) { toast.error("Fill all fields"); return; }
    if (questions.length === 0) { toast.error("Add at least 1 question"); return; }
    const assignment: Assignment = {
      id: crypto.randomUUID(),
      ...form,
      questions,
      createdAt: new Date().toISOString(),
      status: "active",
      teacherId: user?.id || "",
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
          <p className="text-white/70 font-body">{assignments.length} assignment(s) created</p>
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

              {/* Quick pick subject from curriculum */}
              {subjects.length > 0 && (
                <div>
                  <label className="text-xs text-white/60 font-body uppercase tracking-wider mb-1 block">Quick Pick Subject</label>
                  <div className="flex flex-wrap gap-1">
                    {subjects.map((s) => (
                      <button key={s.id} onClick={() => setForm({ ...form, subject: s.title })} className={`text-xs px-2 py-1 rounded-full border transition-colors ${form.subject === s.title ? "bg-primary/20 text-primary border-primary/30" : "bg-white/5 text-white/60 border-white/10 hover:bg-white/10"}`}>
                        {s.title}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Add Questions Section */}
              <div className="border-t border-white/10 pt-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-display text-sm font-bold text-white/90">Add Questions ({questions.length} added)</h3>
                  <Button size="sm" variant="ghost" onClick={() => setShowAI(!showAI)} className="text-neon-purple border border-neon-purple/30 hover:bg-neon-purple/10">
                    <Sparkles className="w-3.5 h-3.5 mr-1" /> Generate with AI
                  </Button>
                </div>

                {/* AI Generation Panel */}
                <AnimatePresence>
                  {showAI && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden mb-4">
                      <div className="bg-[hsl(260,30%,15%)] border border-neon-purple/20 rounded-xl p-4 space-y-3">
                        <div className="flex items-center gap-2 mb-2">
                          <Sparkles className="w-4 h-4 text-neon-purple" />
                          <span className="font-display text-sm font-bold text-white">AI Question Generator</span>
                        </div>
                        <input value={aiTopic} onChange={(e) => setAiTopic(e.target.value)} placeholder="e.g. HTML Tags, Scratch Loops, MS Word..." className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm font-body focus:outline-none focus:border-neon-purple/50" />

                        {/* Quick pick topics from curriculum */}
                        {subjects.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {subjects.flatMap((s) => s.topics.map((t) => (
                              <button key={t.id} onClick={() => setAiTopic(t.title)} className={`text-[10px] px-2 py-0.5 rounded-full border ${aiTopic === t.title ? "bg-neon-purple/20 text-neon-purple border-neon-purple/30" : "bg-white/5 text-white/50 border-white/10"}`}>
                                {t.title}
                              </button>
                            )))}
                          </div>
                        )}

                        <div className="flex flex-wrap items-center gap-4">
                          <div className="flex gap-2">
                          {(["mixed", "mcq", "truefalse", "descriptive"] as const).map((t) => (
                              <button key={t} onClick={() => setAiQType(t)} className={`px-3 py-1 rounded-lg text-xs font-body ${aiQType === t ? "bg-neon-purple/20 text-neon-purple border border-neon-purple/30" : "bg-white/5 text-white/50 border border-white/10"}`}>
                                {t === "mixed" ? "Mixed" : t === "mcq" ? "MCQ" : t === "truefalse" ? "True/False" : "Descriptive"}
                              </button>
                            ))}
                          </div>
                          <div className="flex gap-1">
                            {[5, 10, 15].map((n) => (
                              <button key={n} onClick={() => setAiCount(n)} className={`px-2.5 py-1 rounded-lg text-xs font-body ${aiCount === n ? "bg-neon-purple/20 text-neon-purple border border-neon-purple/30" : "bg-white/5 text-white/50 border border-white/10"}`}>
                                {n}
                              </button>
                            ))}
                          </div>
                        </div>
                        <Button onClick={generateWithAI} disabled={aiLoading} size="sm" className="bg-gradient-to-r from-neon-purple to-neon-blue text-white">
                          {aiLoading ? <><Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" /> Generating...</> : <><Play className="w-3.5 h-3.5 mr-1" /> Generate</>}
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Manual question add */}
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
                        <span className="text-sm text-white/80 font-body">{i + 1}. {q.question} <span className="text-xs text-white/40">({q.type})</span></span>
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
          <p className="text-white/50 font-body">No assignments yet. Click "New Assignment" to create one.</p>
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
                      <p className="text-xs text-white/60 font-body">{a.targetClass} · {a.subject} · {a.questions.length} questions</p>
                    </div>
                    <div className="flex items-center gap-3">
                      {a.status === "active" ? (
                        <span className="text-xs bg-neon-green/15 text-neon-green px-2 py-0.5 rounded-full"><Clock className="w-3 h-3 inline mr-1" />Active</span>
                      ) : (
                        <span className="text-xs bg-white/10 text-white/60 px-2 py-0.5 rounded-full"><CheckCircle className="w-3 h-3 inline mr-1" />Closed</span>
                      )}
                      {isExpanded ? <ChevronDown className="w-4 h-4 text-white/50" /> : <ChevronRight className="w-4 h-4 text-white/50" />}
                    </div>
                  </button>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
                        <div className="px-4 pb-4 space-y-2 border-t border-white/10 pt-3">
                          {a.dueDate && <p className="text-xs text-white/50 font-body">Due: {new Date(a.dueDate).toLocaleDateString()}</p>}
                          {a.questions.map((q, qi) => (
                            <div key={q.id} className="bg-white/5 rounded-lg p-3">
                              <p className="text-sm text-white/90 font-body mb-1">{qi + 1}. {q.question}</p>
                              {q.options && (
                                <div className="flex flex-wrap gap-2 mb-1">
                                  {q.options.map((opt, oi) => (
                                    <span key={oi} className={`text-xs px-2 py-0.5 rounded-full ${opt === q.correctAnswer ? "bg-neon-green/15 text-neon-green" : "bg-white/5 text-white/60"}`}>{opt}</span>
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
