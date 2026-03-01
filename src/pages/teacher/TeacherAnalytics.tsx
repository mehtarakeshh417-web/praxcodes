import { motion } from "framer-motion";
import { BarChart3 } from "lucide-react";

const TeacherAnalytics = () => (
  <div>
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <h1 className="font-display text-3xl font-bold mb-1"><span className="text-gradient-brand">Analytics</span></h1>
      <p className="text-white/50 font-body mb-8">Track student progress and performance</p>
    </motion.div>
    <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="glass-card p-12 text-center">
      <BarChart3 className="w-16 h-16 text-white/20 mx-auto mb-4" />
      <p className="text-white/40 font-body">Analytics will populate as students complete activities and assignments.</p>
    </motion.div>
  </div>
);

export default TeacherAnalytics;
