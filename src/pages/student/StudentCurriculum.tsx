import { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { getCurriculumForClass, type Subject, type Topic } from "@/lib/curriculumData";
import { BookOpen, ChevronRight, ChevronDown, CheckCircle2, Circle, Play, Code, FileText, Sparkles, Monitor, Palette, Gamepad2, Table, HardDrive, Cpu, Image, Terminal, Layers, Database, Paintbrush, Layout, Smartphone, Presentation, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const iconMap: Record<string, React.ElementType> = {
  Monitor, Palette, Gamepad2, FileText, Code, Cpu, HardDrive, AppWindow: Monitor, Table,
  Image, Terminal, Layers, Database, Paintbrush, Layout, Smartphone, Sparkles, Presentation, BarChart3,
};

const colorMap: Record<string, string> = {
  "neon-blue": "from-[hsl(200,100%,50%)] to-[hsl(220,90%,60%)]",
  "neon-green": "from-[hsl(145,80%,50%)] to-[hsl(170,80%,45%)]",
  "neon-orange": "from-[hsl(25,100%,55%)] to-[hsl(45,100%,55%)]",
  "neon-purple": "from-[hsl(260,80%,60%)] to-[hsl(280,80%,55%)]",
  "neon-pink": "from-[hsl(330,90%,60%)] to-[hsl(350,90%,55%)]",
};

const StudentCurriculum = () => {
  const { user } = useAuth();
  const curriculum = useMemo(() => getCurriculumForClass(user?.className || ""), [user?.className]);

  const [completedTopics, setCompletedTopics] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(`cc_completed_${user?.id}`);
      return stored ? JSON.parse(stored) : [];
    } catch { return []; }
  });

  const [expandedSubject, setExpandedSubject] = useState<string | null>(null);
  const [expandedTopic, setExpandedTopic] = useState<string | null>(null);
  const [viewingLesson, setViewingLesson] = useState<{ subjectId: string; topicId: string; lessonIdx: number } | null>(null);

  const toggleComplete = useCallback((topicId: string) => {
    setCompletedTopics((prev) => {
      const next = prev.includes(topicId) ? prev.filter((id) => id !== topicId) : [...prev, topicId];
      localStorage.setItem(`cc_completed_${user?.id}`, JSON.stringify(next));
      if (!prev.includes(topicId)) {
        toast.success("Topic completed! +50 XP 🎉");
      }
      return next;
    });
  }, [user?.id]);

  if (!curriculum) {
    return (
      <div>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <h1 className="font-display text-3xl font-bold mb-1"><span className="text-gradient-brand">My Curriculum</span></h1>
          <p className="text-white/50 font-body mb-8">Your class-wise learning path</p>
        </motion.div>
        <div className="glass-card p-12 text-center">
          <BookOpen className="w-16 h-16 text-white/20 mx-auto mb-4" />
          <p className="text-white/40 font-body">No curriculum found for your class. Please contact your teacher.</p>
        </div>
      </div>
    );
  }

  const totalTopics = curriculum.subjects.reduce((s, sub) => s + sub.topics.length, 0);
  const completedCount = completedTopics.length;

  return (
    <div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="font-display text-3xl font-bold mb-1"><span className="text-gradient-brand">My Curriculum</span></h1>
        <p className="text-white/60 font-body mb-2">{curriculum.className} · {completedCount}/{totalTopics} topics completed</p>
        {/* Overall progress bar */}
        <div className="w-full h-3 rounded-full bg-white/10 overflow-hidden mb-8">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${totalTopics > 0 ? (completedCount / totalTopics) * 100 : 0}%` }}
            transition={{ duration: 0.8 }}
            className="h-full rounded-full bg-gradient-to-r from-neon-green to-neon-blue"
          />
        </div>
      </motion.div>

      {/* Subject List */}
      <div className="space-y-4">
        {curriculum.subjects.map((subject, si) => {
          const Icon = iconMap[subject.icon] || BookOpen;
          const isExpanded = expandedSubject === subject.id;
          const subjectCompleted = subject.topics.filter((t) => completedTopics.includes(t.id)).length;
          const gradient = colorMap[subject.color] || colorMap["neon-blue"];

          return (
            <motion.div
              key={subject.id}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: si * 0.05 }}
            >
              {/* Subject Header */}
              <button
                onClick={() => setExpandedSubject(isExpanded ? null : subject.id)}
                className="w-full glass-card p-5 flex items-center gap-4 hover:bg-white/5 transition-colors"
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center shrink-0`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1 text-left">
                  <h3 className="font-display text-lg font-bold text-white">{subject.title}</h3>
                  <p className="text-xs text-white/50 font-body">{subjectCompleted}/{subject.topics.length} topics completed</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-20 h-2 rounded-full bg-white/10 overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-neon-green to-neon-blue" style={{ width: `${subject.topics.length > 0 ? (subjectCompleted / subject.topics.length) * 100 : 0}%` }} />
                  </div>
                  {isExpanded ? <ChevronDown className="w-5 h-5 text-white/40" /> : <ChevronRight className="w-5 h-5 text-white/40" />}
                </div>
              </button>

              {/* Topics */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="ml-6 mt-2 space-y-2 border-l-2 border-white/10 pl-4">
                      {subject.topics.map((topic) => (
                        <TopicCard
                          key={topic.id}
                          topic={topic}
                          isCompleted={completedTopics.includes(topic.id)}
                          isExpanded={expandedTopic === topic.id}
                          onToggleExpand={() => setExpandedTopic(expandedTopic === topic.id ? null : topic.id)}
                          onToggleComplete={() => toggleComplete(topic.id)}
                          viewingLesson={viewingLesson}
                          onViewLesson={(lessonIdx) => setViewingLesson(viewingLesson?.topicId === topic.id && viewingLesson.lessonIdx === lessonIdx ? null : { subjectId: subject.id, topicId: topic.id, lessonIdx })}
                        />
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

interface TopicCardProps {
  topic: Topic;
  isCompleted: boolean;
  isExpanded: boolean;
  onToggleExpand: () => void;
  onToggleComplete: () => void;
  viewingLesson: { subjectId: string; topicId: string; lessonIdx: number } | null;
  onViewLesson: (idx: number) => void;
}

const TopicCard = ({ topic, isCompleted, isExpanded, onToggleExpand, onToggleComplete, viewingLesson, onViewLesson }: TopicCardProps) => (
  <div>
    <div className="flex items-center gap-2">
      <button
        onClick={(e) => { e.stopPropagation(); onToggleComplete(); }}
        className="shrink-0"
        title={isCompleted ? "Mark as incomplete" : "Mark as complete"}
      >
        {isCompleted ? <CheckCircle2 className="w-5 h-5 text-neon-green" /> : <Circle className="w-5 h-5 text-white/40 hover:text-white/60" />}
      </button>
      <button onClick={onToggleExpand} className={`flex-1 p-4 rounded-xl border transition-all text-left flex items-center gap-3 ${isCompleted ? "bg-[hsl(145,80%,50%,0.08)] border-[hsl(145,80%,50%,0.3)]" : "bg-white/5 border-white/10 hover:bg-white/8"}`}>
        <div className="flex-1">
          <span className="font-body text-sm font-semibold text-white">{topic.title}</span>
          <span className="text-xs text-white/50 ml-2">{topic.lessons.length} lessons · {topic.activities.length} activities</span>
        </div>
        {isExpanded ? <ChevronDown className="w-4 h-4 text-white/50" /> : <ChevronRight className="w-4 h-4 text-white/50" />}
      </button>
    </div>

    <AnimatePresence>
      {isExpanded && (
        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
          <div className="ml-4 mt-2 space-y-2 pb-2">
            {/* Lessons */}
            <div className="space-y-1">
              <p className="text-xs text-white/40 font-body uppercase tracking-wider mb-1 px-2">Lessons</p>
              {topic.lessons.map((lesson, li) => {
                const isViewing = viewingLesson?.topicId === topic.id && viewingLesson.lessonIdx === li;
                return (
                  <div key={lesson.id}>
                    <button onClick={() => onViewLesson(li)} className={`w-full text-left px-3 py-2 rounded-lg text-sm font-body flex items-center gap-2 transition-colors ${isViewing ? "bg-primary/15 text-primary" : "text-white/70 hover:bg-white/5 hover:text-white"}`}>
                      <Play className="w-3.5 h-3.5 shrink-0" />
                      {lesson.title}
                    </button>
                    <AnimatePresence>
                      {isViewing && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                          <div className="mx-3 my-2 p-4 rounded-xl bg-[hsl(220,28%,18%)] border border-white/10">
                            <p className="text-white/80 font-body text-sm leading-relaxed">{lesson.content}</p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>

            {/* Activities & Projects */}
            <div className="space-y-1 mt-3">
              <p className="text-xs text-white/40 font-body uppercase tracking-wider mb-1 px-2">Activities & Projects</p>
              {topic.activities.map((act) => (
                <div key={act.id} className="px-3 py-2 rounded-lg text-sm font-body flex items-center gap-2 text-white/70">
                  {act.type === "project" ? <Code className="w-3.5 h-3.5 text-neon-orange shrink-0" /> : <FileText className="w-3.5 h-3.5 text-neon-blue shrink-0" />}
                  <span>{act.title}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ml-auto font-display uppercase tracking-wider ${act.type === "project" ? "bg-neon-orange/15 text-neon-orange" : "bg-neon-blue/15 text-neon-blue"}`}>
                    {act.type}
                  </span>
                </div>
              ))}
            </div>

          </div>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

export default StudentCurriculum;
