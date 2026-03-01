import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  trend?: string;
  glowClass?: string;
  delay?: number;
}

const StatCard = ({ icon: Icon, label, value, trend, glowClass = "neon-glow-blue", delay = 0 }: StatCardProps) => (
  <motion.div
    initial={{ y: 20, opacity: 0 }}
    animate={{ y: 0, opacity: 1 }}
    transition={{ delay }}
    whileHover={{ scale: 1.03 }}
    className={`stat-card ${glowClass}`}
  >
    <div className="flex items-start justify-between">
      <div>
        <p className="text-white/60 text-sm font-body mb-1">{label}</p>
        <p className="text-3xl font-display font-bold text-white">{value}</p>
        {trend && <p className="text-neon-green text-xs font-body mt-1">{trend}</p>}
      </div>
      <div className="p-3 rounded-xl bg-white/10">
        <Icon className="w-6 h-6 text-primary" />
      </div>
    </div>
  </motion.div>
);

export default StatCard;
