import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import SecuritySetup from "@/components/SecuritySetup";
import { Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import AdminDashboard from "./admin/AdminDashboard";
import AdminSchools from "./admin/AdminSchools";
import AdminAnalytics from "./admin/AdminAnalytics";
import AdminLeaderboard from "./admin/AdminLeaderboard";
import AdminSettings from "./admin/AdminSettings";
import SchoolDashboard from "./school/SchoolDashboard";
import SchoolTeachers from "./school/SchoolTeachers";
import SchoolStudents from "./school/SchoolStudents";
import SchoolClasses from "./school/SchoolClasses";
import SchoolAnalytics from "./school/SchoolAnalytics";
import SchoolSettings from "./school/SchoolSettings";
import TeacherDashboard from "./teacher/TeacherDashboard";
import TeacherClasses from "./teacher/TeacherClasses";
import TeacherAssignments from "./teacher/TeacherAssignments";
import TeacherProjects from "./teacher/TeacherProjects";
import TeacherAnalytics from "./teacher/TeacherAnalytics";
import ChangePassword from "./shared/ChangePassword";
import StudentDashboard from "./student/StudentDashboard";
import StudentCurriculum from "./student/StudentCurriculum";
import StudentAssignments from "./student/StudentAssignments";
import StudentCodingLab from "./student/StudentCodingLab";
import StudentAchievements from "./student/StudentAchievements";
import StudentLeaderboard from "./student/StudentLeaderboard";
import StudentCertificates from "./student/StudentCertificates";
import StudentProgress from "./student/StudentProgress";

const adminRoutes = (
  <>
    <Route index element={<AdminDashboard />} />
    <Route path="schools" element={<AdminSchools />} />
    <Route path="analytics" element={<AdminAnalytics />} />
    <Route path="leaderboard" element={<AdminLeaderboard />} />
    <Route path="settings" element={<AdminSettings />} />
  </>
);

const schoolRoutes = (
  <>
    <Route index element={<SchoolDashboard />} />
    <Route path="teachers" element={<SchoolTeachers />} />
    <Route path="students" element={<SchoolStudents />} />
    <Route path="classes" element={<SchoolClasses />} />
    <Route path="analytics" element={<SchoolAnalytics />} />
    <Route path="settings" element={<SchoolSettings />} />
  </>
);

const teacherRoutes = (
  <>
    <Route index element={<TeacherDashboard />} />
    <Route path="classes" element={<TeacherClasses />} />
    <Route path="assignments" element={<TeacherAssignments />} />
    <Route path="projects" element={<TeacherProjects />} />
    <Route path="analytics" element={<TeacherAnalytics />} />
    <Route path="settings" element={<ChangePassword />} />
  </>
);

const studentRoutes = (
  <>
    <Route index element={<StudentDashboard />} />
    <Route path="curriculum" element={<StudentCurriculum />} />
    <Route path="progress" element={<StudentProgress />} />
    <Route path="assignments" element={<StudentAssignments />} />
    <Route path="coding-lab" element={<StudentCodingLab />} />
    <Route path="achievements" element={<StudentAchievements />} />
    <Route path="leaderboard" element={<StudentLeaderboard />} />
    <Route path="certificates" element={<StudentCertificates />} />
    <Route path="settings" element={<ChangePassword />} />
  </>
);

const routeMap = { admin: adminRoutes, school: schoolRoutes, teacher: teacherRoutes, student: studentRoutes };

const Dashboard = () => {
  const { user, hasSecuritySetup, setupSecurity } = useAuth();
  const [showSecuritySetup, setShowSecuritySetup] = useState(false);

  useEffect(() => {
    const check = async () => {
      if (user && !(await hasSecuritySetup())) {
        setShowSecuritySetup(true);
      }
    };
    check();
  }, [user, hasSecuritySetup]);

  if (!user) return null;

  const handleSecurityComplete = async (pin: string, question: string, answer: string) => {
    await setupSecurity(pin, question, answer);
    setShowSecuritySetup(false);
    toast.success("Security setup complete! Your PIN and security question are saved.");
  };

  return (
    <>
      {showSecuritySetup && <SecuritySetup onComplete={handleSecurityComplete} />}
      <DashboardLayout>
        <Routes>
          {routeMap[user.role]}
        </Routes>
      </DashboardLayout>
    </>
  );
};

export default Dashboard;
