import { motion } from "framer-motion";
import { useData } from "@/contexts/DataContext";
import { Trophy } from "lucide-react";

const AdminLeaderboard = () => {
  const { students } = useData();
  const sorted = [...students].sort((a, b) => b.xp - a.xp).slice(0, 20);

  return (
    <div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="font-display text-3xl font-bold mb-1"><span className="text-gradient-purple">Platform</span> Leaderboard</h1>
        <p className="text-white/50 font-body mb-8">Top coders across all schools (usernames only)</p>
      </motion.div>
      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="glass-card p-6">
        {sorted.length === 0 ? (
          <div className="text-center py-12">
            <Trophy className="w-12 h-12 text-white/20 mx-auto mb-4" />
            <p className="text-white/40 font-body">No students yet. Rankings will appear as students earn XP.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {sorted.map((s, i) => (
              <div key={s.id} className="flex items-center gap-4 bg-white/5 rounded-xl px-4 py-3">
                <span className={`font-display font-bold text-lg w-8 ${i < 3 ? "text-neon-green" : "text-white/40"}`}>#{i + 1}</span>
                <span className="font-body text-sm text-white/80 flex-1">{s.username}</span>
                <span className="text-neon-blue font-display font-bold">{s.xp} XP</span>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default AdminLeaderboard;
