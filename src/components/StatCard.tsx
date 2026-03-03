import { useState, ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LucideIcon, ChevronDown } from "lucide-react";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  trend?: string;
  glowClass?: string;
  delay?: number;
  onClick?: () => void;
  expandable?: boolean;
  children?: ReactNode;
}

const StatCard = ({ icon: Icon, label, value, trend, glowClass = "neon-glow-blue", delay = 0, onClick, expandable, children }: StatCardProps) => {
  const [expanded, setExpanded] = useState(false);

  const handleClick = () => {
    if (expandable) setExpanded(!expanded);
    else if (onClick) onClick();
  };

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay }}
      className="flex flex-col"
    >
      <motion.div
        whileHover={{ scale: 1.03 }}
        onClick={handleClick}
        className={`stat-card ${glowClass} ${(expandable || onClick) ? "cursor-pointer" : ""}`}
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="text-white/60 text-sm font-body mb-1">{label}</p>
            <p className="text-3xl font-display font-bold text-white">{value}</p>
            {trend && <p className="text-neon-green text-xs font-body mt-1">{trend}</p>}
          </div>
          <div className="flex items-center gap-2">
            <div className="p-3 rounded-xl bg-white/10">
              <Icon className="w-6 h-6 text-primary" />
            </div>
            {expandable && (
              <ChevronDown className={`w-4 h-4 text-white/40 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`} />
            )}
          </div>
        </div>
      </motion.div>
      <AnimatePresence>
        {expanded && children && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="mt-2 glass-card p-4 max-h-60 overflow-y-auto">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default StatCard;
