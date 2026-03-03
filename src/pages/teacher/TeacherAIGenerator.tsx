import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Sparkles, Play, Copy, RotateCcw, BookOpen } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useData } from "@/contexts/DataContext";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { getCurriculumForClass, type ClassCurriculum } from "@/lib/curriculumData";

const API_KEY_STORAGE = "cc_gemini_api_key";

const TeacherAIGenerator = () => {
  const { user } = useAuth();
  const { teachers } = useData();
  const teacher = teachers.find((t) => t.id === user?.id);
  const myClasses = teacher?.classes || [];

  const [apiKey, setApiKey] = useState(() => localStorage.getItem(API_KEY_STORAGE) || "");
  const [showKeyInput, setShowKeyInput] = useState(!apiKey);
  const [selectedClass, setSelectedClass] = useState(myClasses[0] || "");
  const [topic, setTopic] = useState("");
  const [qType, setQType] = useState<"mcq" | "truefalse" | "mixed">("mixed");
  const [numQuestions, setNumQuestions] = useState(5);
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const curriculum: ClassCurriculum | undefined = selectedClass ? getCurriculumForClass(selectedClass) : undefined;
  const subjects = curriculum?.subjects || [];

  const saveKey = () => {
    if (!apiKey.trim()) { toast.error("Enter your API key"); return; }
    localStorage.setItem(API_KEY_STORAGE, apiKey.trim());
    setShowKeyInput(false);
    toast.success("API key saved securely in browser");
  };

  const generate = useCallback(async () => {
    const key = localStorage.getItem(API_KEY_STORAGE);
    if (!key) { setShowKeyInput(true); toast.error("Please enter your Gemini API key first"); return; }
    if (!topic.trim()) { toast.error("Enter a topic"); return; }

    setLoading(true);
    setResult("");

    const prompt = `You are an expert K-8 computer science teacher. Generate ${numQuestions} ${qType === "mixed" ? "mixed (MCQ + True/False + Short Answer)" : qType === "mcq" ? "Multiple Choice (MCQ)" : "True/False"} questions for ${selectedClass || "a general"} class on the topic: "${topic}".

Format each question clearly with:
- Question number
- Question text  
- Options (for MCQ: A, B, C, D)
- Correct answer
- Brief explanation

Make questions age-appropriate, educational, and engaging.`;

    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
          }),
        }
      );

      if (!res.ok) {
        const err = await res.text();
        throw new Error(`API Error ${res.status}: ${err}`);
      }

      const data = await res.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) {
        setResult(text);
        toast.success("Questions generated!");
      } else {
        throw new Error("No content in response");
      }
    } catch (err: any) {
      toast.error(err.message || "Generation failed");
      setResult(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [topic, qType, numQuestions, selectedClass]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(result);
    toast.success("Copied to clipboard");
  };

  return (
    <div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="font-display text-3xl font-bold mb-1"><span className="text-gradient-brand">AI Generator</span></h1>
        <p className="text-white/60 font-body mb-6">Generate assignments and quizzes using Gemini AI</p>
      </motion.div>

      {/* API Key Setup */}
      {showKeyInput && (
        <motion.div initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="glass-card p-6 mb-6">
          <h2 className="font-display text-lg font-bold text-white mb-2 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-neon-purple" /> Setup Gemini API Key
          </h2>
          <p className="text-white/50 text-sm font-body mb-4">
            Get a free API key from <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer" className="text-primary underline">Google AI Studio</a>. Your key is stored locally in your browser only.
          </p>
          <div className="flex gap-3">
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter Gemini API key (starts with AIza...)"
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm font-body focus:outline-none focus:border-primary/50"
            />
            <Button onClick={saveKey} className="bg-gradient-to-r from-neon-purple to-neon-pink text-white">Save Key</Button>
          </div>
        </motion.div>
      )}

      {/* Generator Form */}
      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="glass-card p-6 mb-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-white/50 font-body uppercase tracking-wider mb-1 block">Class</label>
            <select value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm font-body focus:outline-none focus:border-primary/50">
              <option value="" className="bg-[hsl(220,30%,15%)]">General</option>
              {myClasses.map((c) => <option key={c} value={c} className="bg-[hsl(220,30%,15%)]">{c}</option>)}
            </select>
          </div>

          {subjects.length > 0 && (
            <div>
              <label className="text-xs text-white/50 font-body uppercase tracking-wider mb-1 block">Quick Pick Subject</label>
              <div className="flex flex-wrap gap-1">
                {subjects.map((s) => (
                  <button key={s.id} onClick={() => setTopic(s.title)} className={`text-xs px-2 py-1 rounded-full border transition-colors ${topic === s.title ? "bg-primary/20 text-primary border-primary/30" : "bg-white/5 text-white/50 border-white/10 hover:bg-white/10"}`}>
                    {s.title}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div>
          <label className="text-xs text-white/50 font-body uppercase tracking-wider mb-1 block">Topic / Subject</label>
          <input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g. HTML Tags, Scratch Loops, MS Word Formatting..." className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm font-body focus:outline-none focus:border-primary/50" />
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div>
            <label className="text-xs text-white/50 font-body uppercase tracking-wider mb-1 block">Type</label>
            <div className="flex gap-2">
              {(["mixed", "mcq", "truefalse"] as const).map((t) => (
                <button key={t} onClick={() => setQType(t)} className={`px-3 py-1.5 rounded-lg text-xs font-body uppercase ${qType === t ? "bg-primary/20 text-primary border border-primary/30" : "bg-white/5 text-white/50 border border-white/10"}`}>
                  {t === "mixed" ? "Mixed" : t === "mcq" ? "MCQ" : "True/False"}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs text-white/50 font-body uppercase tracking-wider mb-1 block">Count</label>
            <div className="flex gap-2">
              {[5, 10, 15, 20].map((n) => (
                <button key={n} onClick={() => setNumQuestions(n)} className={`px-3 py-1.5 rounded-lg text-xs font-body ${numQuestions === n ? "bg-primary/20 text-primary border border-primary/30" : "bg-white/5 text-white/50 border border-white/10"}`}>
                  {n}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <Button onClick={generate} disabled={loading} className="bg-gradient-to-r from-neon-purple to-neon-blue text-white">
            {loading ? (
              <><span className="animate-spin mr-2">⏳</span> Generating...</>
            ) : (
              <><Play className="w-4 h-4 mr-1" /> Generate Questions</>
            )}
          </Button>
          {!showKeyInput && (
            <Button variant="ghost" onClick={() => setShowKeyInput(true)} className="text-white/40 text-xs">Change API Key</Button>
          )}
        </div>
      </motion.div>

      {/* Result */}
      {result && (
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg font-bold text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-neon-green" /> Generated Questions
            </h2>
            <div className="flex gap-2">
              <Button size="sm" variant="ghost" onClick={copyToClipboard} className="text-white/50"><Copy className="w-3.5 h-3.5 mr-1" /> Copy</Button>
              <Button size="sm" variant="ghost" onClick={() => setResult("")} className="text-white/50"><RotateCcw className="w-3.5 h-3.5 mr-1" /> Clear</Button>
            </div>
          </div>
          <div className="bg-[hsl(220,30%,10%)] rounded-xl p-4 max-h-[600px] overflow-auto">
            <pre className="text-sm text-white/80 font-body whitespace-pre-wrap leading-relaxed">{result}</pre>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default TeacherAIGenerator;
