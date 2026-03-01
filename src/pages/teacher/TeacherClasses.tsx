import { motion } from "framer-motion";
import { BookOpen } from "lucide-react";

const TeacherClasses = () => (
  <div>
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <h1 className="font-display text-3xl font-bold mb-1"><span className="text-gradient-brand">My Classes</span></h1>
      <p className="text-white/50 font-body mb-8">View and manage your assigned classes</p>
    </motion.div>
    <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="glass-card p-12 text-center">
      <BookOpen className="w-16 h-16 text-white/20 mx-auto mb-4" />
      <p className="text-white/40 font-body">Your assigned classes will appear here once the school admin assigns you.</p>
    </motion.div>
  </div>
);

export default TeacherClasses;
