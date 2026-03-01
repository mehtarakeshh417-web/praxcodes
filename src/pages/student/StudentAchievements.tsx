import { motion } from "framer-motion";
import { Gamepad2 } from "lucide-react";

const StudentAchievements = () => (
  <div>
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <h1 className="font-display text-3xl font-bold mb-1"><span className="text-gradient-brand">Achievements</span></h1>
      <p className="text-white/50 font-body mb-8">Badges and milestones you've unlocked</p>
    </motion.div>
    <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="glass-card p-12 text-center">
      <Gamepad2 className="w-16 h-16 text-white/20 mx-auto mb-4" />
      <p className="text-white/40 font-body">Complete activities and assignments to unlock achievement badges!</p>
    </motion.div>
  </div>
);

export default StudentAchievements;
