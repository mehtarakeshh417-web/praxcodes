import { motion } from "framer-motion";
import { BookOpen, Users, GraduationCap, ChevronDown, ChevronRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useData } from "@/contexts/DataContext";
import { useState } from "react";
import { getCurriculumForClass } from "@/lib/curriculumData";

const TeacherClasses = () => {
  const { user } = useAuth();
  const { teachers, getTeacherStudents } = useData();
  const [expanded, setExpanded] = useState<string | null>(null);

  const teacher = teachers.find((t) => t.id === user?.id);
  const myClasses = teacher?.classes || [];
  const allStudents = getTeacherStudents(user?.id || "");

  return (
    <div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="font-display text-3xl font-bold mb-1"><span className="text-gradient-brand">My Classes</span></h1>
        <p className="text-white/60 font-body mb-8">{user?.schoolName} · {myClasses.length} class(es) assigned</p>
      </motion.div>

      {myClasses.length === 0 ? (
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="glass-card p-12 text-center">
          <BookOpen className="w-16 h-16 text-white/20 mx-auto mb-4" />
          <p className="text-white/40 font-body">No classes assigned yet. Ask your school admin to assign classes to you.</p>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {myClasses.map((cls, i) => {
            const classStudents = allStudents.filter((s) => cls.includes(s.class));
            const isExpanded = expanded === cls;
            const curriculum = getCurriculumForClass(cls);

            return (
              <motion.div key={cls} initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: i * 0.05 }}>
                <button
                  onClick={() => setExpanded(isExpanded ? null : cls)}
                  className="w-full glass-card p-5 flex items-center gap-4 hover:bg-white/5 transition-colors"
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-neon-orange to-neon-pink flex items-center justify-center shrink-0">
                    <BookOpen className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="font-display text-lg font-bold text-white">{cls}</h3>
                    <p className="text-xs text-white/50 font-body">
                      {classStudents.length} students · {curriculum ? curriculum.subjects.length + " subjects" : "No curriculum"}
                    </p>
                  </div>
                  {isExpanded ? <ChevronDown className="w-5 h-5 text-white/40" /> : <ChevronRight className="w-5 h-5 text-white/40" />}
                </button>

                {isExpanded && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} className="overflow-hidden">
                    <div className="ml-4 mt-2 space-y-3 pl-4 border-l-2 border-white/10 pb-2">
                      {/* Students */}
                      <div className="glass-card p-4">
                        <h4 className="font-display text-sm font-bold text-white/80 mb-3 flex items-center gap-2">
                          <Users className="w-4 h-4 text-neon-blue" /> Students ({classStudents.length})
                        </h4>
                        {classStudents.length === 0 ? (
                          <p className="text-white/40 text-sm font-body">No students enrolled in this class.</p>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {classStudents.map((s) => (
                              <div key={s.id} className="bg-white/5 rounded-lg px-3 py-2 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <GraduationCap className="w-4 h-4 text-neon-green" />
                                  <span className="text-sm text-white/80 font-body">{s.name}</span>
                                </div>
                                <span className="text-xs text-white/40">Roll #{s.rollNo} · {s.xp} XP</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Curriculum */}
                      {curriculum && (
                        <div className="glass-card p-4">
                          <h4 className="font-display text-sm font-bold text-white/80 mb-3 flex items-center gap-2">
                            <BookOpen className="w-4 h-4 text-neon-orange" /> Curriculum Subjects
                          </h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {curriculum.subjects.map((sub) => (
                              <div key={sub.id} className="bg-white/5 rounded-lg px-3 py-2">
                                <span className="text-sm text-white/80 font-body">{sub.title}</span>
                                <span className="text-xs text-white/40 ml-2">{sub.topics.length} topics</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TeacherClasses;
