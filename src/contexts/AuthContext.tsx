import React, { createContext, useContext, useState, useCallback } from "react";

export type UserRole = "admin" | "school" | "teacher" | "student";

export interface AuthUser {
  id: string;
  username: string;
  role: UserRole;
  displayName: string;
  schoolName?: string;
  className?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Demo users for prototype - will be replaced with Cloud backend
const DEMO_USERS: Record<string, { password: string; user: AuthUser }> = {
  admin: {
    password: "admin",
    user: { id: "1", username: "admin", role: "admin", displayName: "Master Admin" },
  },
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const stored = sessionStorage.getItem("praxcodes_user");
    return stored ? JSON.parse(stored) : null;
  });

  const login = useCallback(async (username: string, password: string): Promise<boolean> => {
    const entry = DEMO_USERS[username];
    if (entry && entry.password === password) {
      setUser(entry.user);
      sessionStorage.setItem("praxcodes_user", JSON.stringify(entry.user));
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    sessionStorage.removeItem("praxcodes_user");
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
