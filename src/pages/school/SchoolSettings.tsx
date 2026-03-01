import { motion } from "framer-motion";
import { Settings } from "lucide-react";

const SchoolSettings = () => (
  <div>
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <h1 className="font-display text-3xl font-bold mb-1"><span className="text-gradient-brand">Settings</span></h1>
      <p className="text-white/50 font-body mb-8">School account settings</p>
    </motion.div>
    <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="glass-card p-6">
      <Settings className="w-8 h-8 text-white/20 mx-auto mb-4" />
      <p className="text-center text-white/40 font-body">School settings will be available with Lovable Cloud integration.</p>
    </motion.div>
  </div>
);

export default SchoolSettings;
