import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

const TeacherAIGenerator = () => (
  <div>
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <h1 className="font-display text-3xl font-bold mb-1"><span className="text-gradient-brand">AI Generator</span></h1>
      <p className="text-white/50 font-body mb-8">Generate assignments and quizzes using AI</p>
    </motion.div>
    <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="glass-card p-12 text-center">
      <Sparkles className="w-16 h-16 text-white/20 mx-auto mb-4" />
      <p className="text-white/40 font-body">AI-powered question generation coming soon. Requires Lovable Cloud for secure API key storage.</p>
    </motion.div>
  </div>
);

export default TeacherAIGenerator;
