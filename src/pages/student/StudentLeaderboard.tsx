import { useMemo } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useData } from "@/contexts/DataContext";
import { Trophy, Medal, Crown, Star } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

const xpLevel = (xp: number) => {
  if (xp < 500) return 1;
  if (xp < 1500) return 2;
  if (xp < 3000) return 3;
  if (xp < 5000) return 4;
  return 5;
};

const rankIcons = [Crown, Medal, Star];
const rankColors = ["text-[hsl(45,100%,55%)]", "text-white/70", "text-[hsl(25,100%,55%)]"];

const StudentLeaderboard = () => {
  const { user } = useAuth();
  const { students } = useData();

  // School-level: same schoolId, sorted by XP desc
  const schoolRanking = useMemo(() => {
    const student = students.find((s) => s.id === user?.id);
    if (!student) return [];
    return students
      .filter((s) => s.schoolId === student.schoolId)
      .sort((a, b) => b.xp - a.xp)
      .map((s, i) => ({ ...s, rank: i + 1 }));
  }, [students, user?.id]);

  // Platform-level: all students, but only show username (no school data leakage)
  const platformRanking = useMemo(() =>
    [...students]
      .sort((a, b) => b.xp - a.xp)
      .map((s, i) => ({ ...s, rank: i + 1 })),
    [students]
  );

  const RankingTable = ({ data, showSchool }: { data: typeof schoolRanking; showSchool?: boolean }) => {
    if (data.length === 0) {
      return (
        <div className="text-center py-12">
          <Trophy className="w-12 h-12 text-white/20 mx-auto mb-3" />
          <p className="text-white/40 font-body">No students yet. Earn XP to appear here!</p>
        </div>
      );
    }

    return (
      <div className="space-y-2">
        {data.slice(0, 50).map((s) => {
          const isMe = s.id === user?.id;
          const RankIcon = s.rank <= 3 ? rankIcons[s.rank - 1] : null;
          return (
            <motion.div
              key={s.id}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: Math.min(s.rank * 0.03, 0.5) }}
              className={`flex items-center gap-4 p-4 rounded-xl border transition-colors ${isMe ? "bg-[hsl(145,80%,50%,0.08)] border-[hsl(145,80%,50%,0.3)] neon-glow-green" : "bg-white/5 border-white/10"}`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-display text-lg font-bold shrink-0 ${s.rank <= 3 ? "bg-gradient-to-br from-[hsl(45,100%,55%)] to-[hsl(25,100%,55%)] text-cyber-darker" : "bg-white/10 text-white/60"}`}>
                {RankIcon ? <RankIcon className={`w-5 h-5 ${rankColors[s.rank - 1]}`} /> : s.rank}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-body text-sm font-semibold text-white truncate">{isMe ? `${s.name} (You)` : s.name}</span>
                  {isMe && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-neon-green/20 text-neon-green font-display">YOU</span>}
                </div>
                <p className="text-xs text-white/40 font-body">{s.class} · Level {xpLevel(s.xp)}</p>
              </div>
              <div className="text-right">
                <div className="font-display text-lg font-bold text-neon-green">{s.xp}</div>
                <div className="text-[10px] text-white/40 font-body">XP</div>
              </div>
            </motion.div>
          );
        })}
      </div>
    );
  };

  return (
    <div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="font-display text-3xl font-bold mb-1"><span className="text-gradient-brand">Leaderboard</span></h1>
        <p className="text-white/60 font-body mb-6">See where you rank among your peers</p>
      </motion.div>

      <Tabs defaultValue="school" className="w-full">
        <TabsList className="bg-white/5 border border-white/10 mb-6">
          <TabsTrigger value="school" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary text-white/60 font-body">🏫 School Level</TabsTrigger>
          <TabsTrigger value="platform" className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary text-white/60 font-body">🌐 Platform Level</TabsTrigger>
        </TabsList>
        <TabsContent value="school">
          <RankingTable data={schoolRanking} />
        </TabsContent>
        <TabsContent value="platform">
          <RankingTable data={platformRanking} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StudentLeaderboard;
