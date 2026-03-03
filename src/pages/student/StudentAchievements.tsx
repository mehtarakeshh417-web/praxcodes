import { useMemo } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useData } from "@/contexts/DataContext";
import { getCurriculumForClass } from "@/lib/curriculumData";
import { Award, Zap, BookOpen, Star, Trophy, Target, Shield, Flame, Crown, Rocket } from "lucide-react";

interface BadgeDef {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  gradient: string;
  condition: (ctx: AchievementCtx) => boolean;
}

interface AchievementCtx {
  xp: number;
  level: number;
  completedCount: number;
  totalTopics: number;
  completedSubjects: number;
  totalSubjects: number;
}

const xpLevel = (xp: number) => {
  if (xp < 500) return 1;
  if (xp < 1500) return 2;
  if (xp < 3000) return 3;
  if (xp < 5000) return 4;
  return 5;
};

const BADGES: BadgeDef[] = [
  { id: "first-topic", title: "First Step", description: "Complete your first topic", icon: Rocket, gradient: "from-[hsl(200,100%,50%)] to-[hsl(220,90%,60%)]", condition: (c) => c.completedCount >= 1 },
  { id: "five-topics", title: "Knowledge Seeker", description: "Complete 5 topics", icon: BookOpen, gradient: "from-[hsl(145,80%,50%)] to-[hsl(170,80%,45%)]", condition: (c) => c.completedCount >= 5 },
  { id: "ten-topics", title: "Dedicated Learner", description: "Complete 10 topics", icon: Target, gradient: "from-[hsl(25,100%,55%)] to-[hsl(45,100%,55%)]", condition: (c) => c.completedCount >= 10 },
  { id: "half-done", title: "Halfway Hero", description: "Complete 50% of curriculum", icon: Shield, gradient: "from-[hsl(260,80%,60%)] to-[hsl(280,80%,55%)]", condition: (c) => c.totalTopics > 0 && c.completedCount >= c.totalTopics / 2 },
  { id: "all-done", title: "Curriculum Champion", description: "Complete 100% of curriculum", icon: Crown, gradient: "from-[hsl(45,100%,55%)] to-[hsl(25,100%,55%)]", condition: (c) => c.totalTopics > 0 && c.completedCount >= c.totalTopics },
  { id: "first-subject", title: "Subject Master", description: "Complete all topics in one subject", icon: Star, gradient: "from-[hsl(330,90%,60%)] to-[hsl(350,90%,55%)]", condition: (c) => c.completedSubjects >= 1 },
  { id: "xp-100", title: "XP Hunter", description: "Earn 100 XP", icon: Zap, gradient: "from-[hsl(145,80%,50%)] to-[hsl(200,100%,50%)]", condition: (c) => c.xp >= 100 },
  { id: "xp-500", title: "XP Warrior", description: "Earn 500 XP", icon: Flame, gradient: "from-[hsl(25,100%,55%)] to-[hsl(0,84%,60%)]", condition: (c) => c.xp >= 500 },
  { id: "xp-1000", title: "XP Legend", description: "Earn 1000 XP", icon: Trophy, gradient: "from-[hsl(45,100%,55%)] to-[hsl(330,90%,60%)]", condition: (c) => c.xp >= 1000 },
  { id: "level-2", title: "Level Up!", description: "Reach Level 2", icon: Award, gradient: "from-[hsl(200,100%,50%)] to-[hsl(260,80%,60%)]", condition: (c) => c.level >= 2 },
  { id: "level-3", title: "Rising Star", description: "Reach Level 3", icon: Star, gradient: "from-[hsl(260,80%,60%)] to-[hsl(330,90%,60%)]", condition: (c) => c.level >= 3 },
  { id: "level-5", title: "Legendary Coder", description: "Reach Level 5", icon: Crown, gradient: "from-[hsl(45,100%,55%)] to-[hsl(25,100%,55%)]", condition: (c) => c.level >= 5 },
];

const StudentAchievements = () => {
  const { user } = useAuth();
  const { students } = useData();
  const student = students.find((s) => s.id === user?.id);
  const xp = student?.xp || 0;
  const level = xpLevel(xp);

  const curriculum = useMemo(() => getCurriculumForClass(user?.className || ""), [user?.className]);
  const completedTopics = useMemo(() => {
    try {
      const stored = localStorage.getItem(`cc_completed_${user?.id}`);
      return stored ? JSON.parse(stored) as string[] : [];
    } catch { return []; }
  }, [user?.id]);

  const totalTopics = curriculum?.subjects.reduce((s, sub) => s + sub.topics.length, 0) || 0;
  const completedCount = completedTopics.length;

  const completedSubjects = useMemo(() => {
    if (!curriculum) return 0;
    return curriculum.subjects.filter((sub) =>
      sub.topics.length > 0 && sub.topics.every((t) => completedTopics.includes(t.id))
    ).length;
  }, [curriculum, completedTopics]);

  const ctx: AchievementCtx = { xp, level, completedCount, totalTopics, completedSubjects, totalSubjects: curriculum?.subjects.length || 0 };

  const earned = BADGES.filter((b) => b.condition(ctx));
  const locked = BADGES.filter((b) => !b.condition(ctx));

  // Certificates based on completed subjects
  const certificates = useMemo(() => {
    if (!curriculum) return [];
    return curriculum.subjects
      .filter((sub) => sub.topics.length > 0 && sub.topics.every((t) => completedTopics.includes(t.id)))
      .map((sub) => sub.title);
  }, [curriculum, completedTopics]);

  return (
    <div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="font-display text-3xl font-bold mb-1"><span className="text-gradient-brand">My Achievements</span></h1>
        <p className="text-white/60 font-body mb-2">Level {level} · {xp} XP · {earned.length}/{BADGES.length} badges earned</p>
      </motion.div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 mb-8 mt-4">
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="glass-card p-5 text-center neon-glow-green">
          <Award className="w-8 h-8 mx-auto mb-2 text-neon-green" />
          <div className="font-display text-2xl font-bold text-white">{earned.length}</div>
          <div className="text-xs text-white/50 font-body">Badges Earned</div>
        </motion.div>
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.05 }} className="glass-card p-5 text-center neon-glow-blue">
          <BookOpen className="w-8 h-8 mx-auto mb-2 text-neon-blue" />
          <div className="font-display text-2xl font-bold text-white">{completedSubjects}</div>
          <div className="text-xs text-white/50 font-body">Technologies Done</div>
        </motion.div>
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="glass-card p-5 text-center neon-glow-purple">
          <Trophy className="w-8 h-8 mx-auto mb-2 text-neon-purple" />
          <div className="font-display text-2xl font-bold text-white">{certificates.length}</div>
          <div className="text-xs text-white/50 font-body">Certificates</div>
        </motion.div>
      </div>

      {/* Earned Badges */}
      <h2 className="font-display text-xl font-bold text-white mb-4">🏆 Earned Badges</h2>
      {earned.length === 0 ? (
        <div className="glass-card p-8 text-center mb-8">
          <Award className="w-12 h-12 text-white/20 mx-auto mb-3" />
          <p className="text-white/40 font-body">Complete topics and earn XP to unlock badges!</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
          {earned.map((badge, i) => (
            <motion.div
              key={badge.id}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: i * 0.05, type: "spring" }}
              className="glass-card p-5 text-center hover:scale-105 transition-transform"
            >
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${badge.gradient} flex items-center justify-center mx-auto mb-3`}>
                <badge.icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-display text-sm font-bold text-white mb-1">{badge.title}</h3>
              <p className="text-[11px] text-white/50 font-body">{badge.description}</p>
            </motion.div>
          ))}
        </div>
      )}

      {/* Locked Badges */}
      {locked.length > 0 && (
        <>
          <h2 className="font-display text-xl font-bold text-white/50 mb-4">🔒 Locked Badges</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
            {locked.map((badge) => (
              <div key={badge.id} className="glass-card p-5 text-center opacity-40">
                <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center mx-auto mb-3">
                  <badge.icon className="w-8 h-8 text-white/30" />
                </div>
                <h3 className="font-display text-sm font-bold text-white/50 mb-1">{badge.title}</h3>
                <p className="text-[11px] text-white/30 font-body">{badge.description}</p>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Certificates */}
      <h2 className="font-display text-xl font-bold text-white mb-4">📜 Certificates Unlocked</h2>
      {certificates.length === 0 ? (
        <div className="glass-card p-8 text-center">
          <Award className="w-12 h-12 text-white/20 mx-auto mb-3" />
          <p className="text-white/40 font-body">Complete all topics in a technology to earn a certificate!</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {certificates.map((cert, i) => (
            <motion.div key={cert} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: i * 0.05 }}
              className="glass-card p-6 flex items-center gap-4 neon-glow-blue">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[hsl(45,100%,55%)] to-[hsl(25,100%,55%)] flex items-center justify-center shrink-0">
                <Award className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="font-display text-lg font-bold text-white">{cert}</h3>
                <p className="text-xs text-white/50 font-body">Technology Completion Certificate</p>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentAchievements;
