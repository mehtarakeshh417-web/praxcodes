import { useAuth } from "@/contexts/AuthContext";
import DashboardLayout from "@/components/DashboardLayout";
import AdminDashboard from "./admin/AdminDashboard";
import SchoolDashboard from "./school/SchoolDashboard";
import TeacherDashboard from "./teacher/TeacherDashboard";
import StudentDashboard from "./student/StudentDashboard";

const Dashboard = () => {
  const { user } = useAuth();
  if (!user) return null;

  const dashboards = {
    admin: <AdminDashboard />,
    school: <SchoolDashboard />,
    teacher: <TeacherDashboard />,
    student: <StudentDashboard />,
  };

  return <DashboardLayout>{dashboards[user.role]}</DashboardLayout>;
};

export default Dashboard;
