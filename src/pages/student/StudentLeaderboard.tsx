import { motion } from "framer-motion";
import { Trophy } from "lucide-react";

const StudentLeaderboard = () => (
  <div>
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <h1 className="font-display text-3xl font-bold mb-1"><span className="text-gradient-brand">Leaderboard</span></h1>
      <p className="text-white/50 font-body mb-8">See where you rank among your peers</p>
    </motion.div>
    <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="glass-card p-12 text-center">
      <Trophy className="w-16 h-16 text-white/20 mx-auto mb-4" />
      <p className="text-white/40 font-body">Leaderboard will appear as students earn XP through activities.</p>
    </motion.div>
  </div>
);

export default StudentLeaderboard;
