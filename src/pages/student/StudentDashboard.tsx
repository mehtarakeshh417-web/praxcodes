import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useData } from "@/contexts/DataContext";
import { getCurriculumForClass, countTotalTopics, countActivitiesAndProjects } from "@/lib/curriculumData";
import { Trophy, Target, BookOpen, Award, TrendingUp, Gamepad2 } from "lucide-react";
import { useMemo } from "react";

const xpLevel = (xp: number) => {
  if (xp < 500) return { level: 1, title: "Byte Beginner", next: 500 };
  if (xp < 1500) return { level: 2, title: "Code Cadet", next: 1500 };
  if (xp < 3000) return { level: 3, title: "Script Ninja", next: 3000 };
  if (xp < 5000) return { level: 4, title: "Dev Master", next: 5000 };
  return { level: 5, title: "Legendary Coder", next: 10000 };
};

const StudentDashboard = () => {
  const { user } = useAuth();
  const { students } = useData();
  const navigate = useNavigate();

  const student = students.find((s) => s.id === user?.id);
  const xp = student?.xp || 0;
  const lvl = xpLevel(xp);
  const progress = Math.round((xp / lvl.next) * 100);

  const curriculum = useMemo(() => getCurriculumForClass(user?.className || ""), [user?.className]);
  const completedTopics = useMemo(() => {
    try {
      const stored = localStorage.getItem(`cc_completed_${user?.id}`);
      return stored ? JSON.parse(stored) as string[] : [];
    } catch { return []; }
  }, [user?.id]);

  const totalTopics = curriculum ? countTotalTopics(curriculum) : 0;
  const completedCount = completedTopics.length;
  const progressPct = totalTopics > 0 ? Math.round((completedCount / totalTopics) * 100) : 0;
  const stats = curriculum ? countActivitiesAndProjects(curriculum) : { activities: 0, projects: 0 };

  const cards = [
    {
      icon: BookOpen, title: "My Curriculum", desc: `${curriculum?.subjects.length || 0} subjects · ${totalTopics} topics`, 
      gradient: "from-[hsl(200,100%,50%)] to-[hsl(260,80%,60%)]", glow: "neon-glow-blue", path: "/dashboard/curriculum",
    },
    {
      icon: TrendingUp, title: "Progress", desc: `${progressPct}% complete · ${completedCount}/${totalTopics} topics`,
      gradient: "from-[hsl(145,80%,50%)] to-[hsl(170,80%,45%)]", glow: "neon-glow-green", path: "/dashboard/progress",
    },
    {
      icon: Trophy, title: "Leaderboard", desc: "See your rank among peers",
      gradient: "from-[hsl(25,100%,55%)] to-[hsl(330,90%,60%)]", glow: "neon-glow-orange", path: "/dashboard/leaderboard",
    },
    {
      icon: Award, title: "My Achievements", desc: `${xp} XP · Level ${lvl.level} · ${lvl.title}`,
      gradient: "from-[hsl(260,80%,60%)] to-[hsl(330,90%,60%)]", glow: "neon-glow-purple", path: "/dashboard/achievements",
    },
  ];

  return (
    <div>
      {/* Header */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        {user?.schoolName && (
          <p className="text-sm font-body text-neon-blue mb-1 tracking-wider uppercase">{user.schoolName}</p>
        )}
        <h1 className="font-display text-3xl font-bold mb-1">
          Hey, <span className="text-gradient-brand">{user?.displayName}</span>! 🚀
        </h1>
        <p className="text-white/70 font-body mb-2">{user?.className} {student?.section && `· Section ${student.section}`}</p>
      </motion.div>

      {/* XP Bar */}
      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="glass-card p-6 mb-8 neon-glow-green">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-neon-green to-neon-blue flex items-center justify-center font-display text-xl font-bold text-cyber-darker">
              {lvl.level}
            </div>
            <div>
              <div className="font-display text-lg font-bold text-white">{lvl.title}</div>
              <div className="text-xs text-white/50 font-body">Level {lvl.level}</div>
            </div>
          </div>
          <div className="text-right">
            <div className="font-display text-2xl font-bold text-neon-green">{xp} XP</div>
            <div className="text-xs text-white/50 font-body">{lvl.next - xp} XP to next level</div>
          </div>
        </div>
        <div className="w-full h-4 rounded-full bg-white/10 overflow-hidden">
          <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} transition={{ duration: 1, delay: 0.3 }} className="h-full rounded-full bg-gradient-to-r from-neon-green to-neon-blue" />
        </div>
      </motion.div>

      {/* 4 Primary Section Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {cards.map((card, i) => (
          <motion.div
            key={card.title}
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 + i * 0.1 }}
            onClick={() => navigate(card.path)}
            className={`glass-card p-6 cursor-pointer hover:scale-[1.02] transition-all duration-300 ${card.glow} group`}
          >
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${card.gradient} flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform`}>
                <card.icon className="w-7 h-7 text-white" />
              </div>
              <div>
                <h2 className="font-display text-xl font-bold text-white">{card.title}</h2>
                <p className="text-white/60 font-body text-sm mt-1">{card.desc}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Subjects", value: curriculum?.subjects.length || 0, icon: BookOpen, color: "text-neon-blue" },
          { label: "Activities", value: stats.activities, icon: Target, color: "text-neon-green" },
          { label: "Projects", value: stats.projects, icon: Gamepad2, color: "text-neon-orange" },
          { label: "Completed", value: completedCount, icon: Award, color: "text-neon-purple" },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.6 + i * 0.05 }}
            className="glass-card p-4 text-center">
            <s.icon className={`w-6 h-6 mx-auto mb-2 ${s.color}`} />
            <div className="font-display text-2xl font-bold text-white">{s.value}</div>
            <div className="text-xs text-white/50 font-body">{s.label}</div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default StudentDashboard;
