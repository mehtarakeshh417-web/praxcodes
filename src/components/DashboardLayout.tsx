import { ReactNode } from "react";
import { useAuth, UserRole } from "@/contexts/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import dashboardBg from "@/assets/dashboard-bg.jpg";
import {
  LayoutDashboard, School, Users, BookOpen, Trophy, Settings, LogOut, GraduationCap,
  BarChart3, Code, FileText, Gamepad2, Award, UserCircle
} from "lucide-react";

interface NavItem {
  icon: React.ElementType;
  label: string;
  path: string;
}

const navConfig: Record<UserRole, NavItem[]> = {
  admin: [
    { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
    { icon: School, label: "Schools", path: "/dashboard/schools" },
    { icon: BarChart3, label: "Analytics", path: "/dashboard/analytics" },
    { icon: Trophy, label: "Leaderboard", path: "/dashboard/leaderboard" },
    { icon: Settings, label: "Change Password", path: "/dashboard/settings" },
  ],
  school: [
    { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
    { icon: Users, label: "Teachers", path: "/dashboard/teachers" },
    { icon: GraduationCap, label: "Students", path: "/dashboard/students" },
    { icon: BookOpen, label: "Classes", path: "/dashboard/classes" },
    { icon: BarChart3, label: "Analytics", path: "/dashboard/analytics" },
    { icon: Settings, label: "Settings", path: "/dashboard/settings" },
  ],
  teacher: [
    { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
    { icon: BookOpen, label: "My Classes", path: "/dashboard/classes" },
    { icon: FileText, label: "Assignments", path: "/dashboard/assignments" },
    { icon: Code, label: "Projects", path: "/dashboard/projects" },
    { icon: BarChart3, label: "Analytics", path: "/dashboard/analytics" },
    { icon: Settings, label: "Change Password", path: "/dashboard/settings" },
  ],
  student: [
    { icon: LayoutDashboard, label: "Dashboard", path: "/dashboard" },
    { icon: BookOpen, label: "My Curriculum", path: "/dashboard/curriculum" },
    { icon: BarChart3, label: "Progress", path: "/dashboard/progress" },
    { icon: FileText, label: "Assignments", path: "/dashboard/assignments" },
    { icon: Code, label: "Coding Lab", path: "/dashboard/coding-lab" },
    { icon: Gamepad2, label: "Achievements", path: "/dashboard/achievements" },
    { icon: Trophy, label: "Leaderboard", path: "/dashboard/leaderboard" },
    { icon: Award, label: "Certificates", path: "/dashboard/certificates" },
    { icon: Settings, label: "Change Password", path: "/dashboard/settings" },
  ],
};

const roleGradientClass: Record<UserRole, string> = {
  admin: "gradient-admin",
  school: "gradient-school",
  teacher: "gradient-teacher",
  student: "gradient-student",
};

const roleLabelColors: Record<UserRole, string> = {
  admin: "text-neon-blue",
  school: "text-neon-green",
  teacher: "text-neon-orange",
  student: "text-neon-green",
};

interface Props { children: ReactNode }

const DashboardLayout = ({ children }: Props) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  if (!user) return null;

  const navItems = navConfig[user.role];

  return (
    <div className={`min-h-screen ${roleGradientClass[user.role]} text-white flex`}>
      {/* Background image */}
      <div
        className="fixed inset-0 opacity-10 pointer-events-none z-0"
        style={{ backgroundImage: `url(${dashboardBg})`, backgroundSize: "cover", backgroundPosition: "center" }}
      />

      {/* Sidebar */}
      <motion.aside
        initial={{ x: -260 }}
        animate={{ x: 0 }}
        className="fixed left-0 top-0 bottom-0 w-64 sidebar-dark z-20 flex flex-col"
      >
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-3 mb-3">
            <img src="/assets/logo.jpg" alt="CodeChamps logo" className="w-10 h-10 rounded-xl object-contain" />
            <span className="font-display text-lg font-bold text-gradient-brand">CodeChamps</span>
          </div>
          <div className="flex items-center gap-2 mt-4">
            <UserCircle className="w-8 h-8 text-white/40" />
            <div>
              <div className="text-sm font-bold text-white/90 font-body">{user.displayName}</div>
              <div className={`text-xs font-display uppercase tracking-wider ${roleLabelColors[user.role]}`}>
                {user.role === "admin" ? "Master Admin" : user.role}
              </div>
            </div>
          </div>
          {user.schoolName && (
            <div className="mt-2 text-xs text-white/40 font-body">{user.schoolName}</div>
          )}
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-body transition-all duration-200 ${
                  isActive
                    ? "bg-primary/15 text-primary neon-glow-blue"
                    : "text-white/50 hover:text-white/80 hover:bg-white/5"
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10">
          <Button variant="ghost" size="sm" className="w-full justify-start text-white/40 hover:text-destructive" onClick={() => { logout(); navigate("/"); }}>
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 relative z-10">
        <div className="p-6 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
