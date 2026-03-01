import { motion } from "framer-motion";
import { Code } from "lucide-react";

const TeacherProjects = () => (
  <div>
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <h1 className="font-display text-3xl font-bold mb-1"><span className="text-gradient-brand">Projects</span></h1>
      <p className="text-white/50 font-body mb-8">Assign and review student projects</p>
    </motion.div>
    <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="glass-card p-12 text-center">
      <Code className="w-16 h-16 text-white/20 mx-auto mb-4" />
      <p className="text-white/40 font-body">Project management coming soon. Assign Scratch, HTML, Python projects and review submissions.</p>
    </motion.div>
  </div>
);

export default TeacherProjects;
