import { motion } from "framer-motion";
import { useData } from "@/contexts/DataContext";
import { useAuth } from "@/contexts/AuthContext";
import { BookOpen, Users, GraduationCap } from "lucide-react";

const SchoolClasses = () => {
  const { user } = useAuth();
  const { getSchoolTeachers, getSchoolStudents } = useData();
  const schoolId = user?.id || "";
  const teachers = getSchoolTeachers(schoolId);
  const students = getSchoolStudents(schoolId);

  const classMap = new Map<string, { teachers: string[]; studentCount: number }>();
  teachers.forEach((t) => t.classes.forEach((cls) => {
    const entry = classMap.get(cls) || { teachers: [], studentCount: 0 };
    entry.teachers.push(`${t.firstName} ${t.lastName}`);
    classMap.set(cls, entry);
  }));
  students.forEach((s) => {
    const key = `${s.class} (${s.section || "A"})`;
    const entry = classMap.get(key) || { teachers: [], studentCount: 0 };
    entry.studentCount++;
    classMap.set(key, entry);
  });

  return (
    <div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="font-display text-3xl font-bold mb-1"><span className="text-gradient-brand">Classes</span></h1>
        <p className="text-white/50 font-body mb-8">Class structure and assignments</p>
      </motion.div>
      {classMap.size === 0 ? (
        <div className="glass-card p-12 text-center">
          <BookOpen className="w-16 h-16 text-white/20 mx-auto mb-4" />
          <p className="text-white/40 font-body">Add teachers and students to see classes here</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from(classMap.entries()).map(([cls, data], i) => (
            <motion.div key={cls} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="glass-card p-5">
              <h3 className="font-display font-bold text-lg text-white/90 mb-3">{cls}</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-white/60">
                  <Users className="w-4 h-4" />
                  <span>{data.teachers.length > 0 ? data.teachers.join(", ") : "No teacher assigned"}</span>
                </div>
                <div className="flex items-center gap-2 text-white/60">
                  <GraduationCap className="w-4 h-4" />
                  <span>{data.studentCount} students</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SchoolClasses;
