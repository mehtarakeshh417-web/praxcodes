import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Users, GraduationCap } from "lucide-react";
import { TeacherData, StudentData } from "@/contexts/DataContext";

interface ExpandableTeacherCardProps {
  teacher: TeacherData;
  students: StudentData[];
  formatClassDisplay?: (classes: string[]) => string;
  actions?: React.ReactNode;
  children?: React.ReactNode;
}

const defaultFormatClasses = (classes: string[]) => {
  const grouped: Record<string, string[]> = {};
  classes.forEach((c) => {
    const parts = c.split("-");
    const cls = parts[0];
    const sec = parts[1] || "A";
    if (!grouped[cls]) grouped[cls] = [];
    grouped[cls].push(sec);
  });
  return Object.entries(grouped)
    .map(([cls, sections]) => `${cls} (${sections.join(",")})`)
    .join(", ");
};

const ExpandableTeacherCard = ({
  teacher,
  students,
  formatClassDisplay = defaultFormatClasses,
  actions,
  children,
}: ExpandableTeacherCardProps) => {
  const [expanded, setExpanded] = useState(false);

  const teacherStudents = students.filter(
    (s) => s.teacherId === teacher.id
  );

  return (
    <div className="glass-card overflow-hidden">
      <div
        className="p-4 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-neon-blue/20 to-neon-green/20 flex items-center justify-center shrink-0">
            <Users className="w-4 h-4 text-neon-blue" />
          </div>
          <div className="min-w-0">
            <span className="font-body font-bold text-white block truncate">
              {teacher.firstName} {teacher.lastName}
            </span>
            <div className="text-xs text-white/40 mt-0.5 truncate">
              {formatClassDisplay(teacher.classes)}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs font-body bg-white/10 px-2 py-1 rounded-lg text-white/60">
            <GraduationCap className="w-3 h-3 inline mr-1" />
            {teacherStudents.length}
          </span>
          {actions && (
            <div onClick={(e) => e.stopPropagation()} className="flex items-center gap-1">
              {actions}
            </div>
          )}
          <ChevronDown
            className={`w-4 h-4 text-white/40 transition-transform duration-200 ${
              expanded ? "rotate-180" : ""
            }`}
          />
        </div>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 border-t border-white/10 pt-3">
              {children}
              {teacherStudents.length === 0 ? (
                <p className="text-white/30 text-sm font-body text-center py-3">
                  No students assigned yet
                </p>
              ) : (
                <div className="space-y-1.5">
                  <p className="text-white/50 text-xs font-body mb-2">
                    {teacherStudents.length} student(s)
                  </p>
                  {teacherStudents.map((s) => (
                    <div
                      key={s.id}
                      className="flex items-center justify-between py-1.5 px-3 rounded-lg bg-white/5 text-sm"
                    >
                      <span className="text-white/80 font-body">{s.name}</span>
                      <span className="text-white/40 text-xs font-body">
                        {s.class} - {s.section} • Roll {s.rollNo}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ExpandableTeacherCard;
