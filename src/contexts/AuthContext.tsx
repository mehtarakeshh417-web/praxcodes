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

export interface UserSecurity {
  pin: string;
  securityQuestion: string;
  securityAnswer: string;
}

interface AuthContextType {
  user: AuthUser | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  addDemoUser: (username: string, password: string, user: AuthUser) => void;
  removeDemoUser: (username: string) => void;
  removeDemoUsers: (usernames: string[]) => void;
  changeAdminPassword: (newPassword: string, oldPassword?: string) => boolean;
  changePassword: (newPassword: string, oldPassword?: string) => boolean;
  hasSecuritySetup: () => boolean;
  setupSecurity: (pin: string, question: string, answer: string) => void;
  verifyPin: (pin: string) => boolean;
  verifySecurityAnswer: (answer: string) => { valid: boolean; question: string };
  getSecurityQuestion: () => string | null;
}

const AuthContext = createContext<AuthContextType | null>(null);

const getStoredUsers = (): Record<string, { password: string; user: AuthUser }> => {
  const stored = sessionStorage.getItem("codechamps_users");
  if (stored) return JSON.parse(stored);
  return {
    admin: {
      password: "admin",
      user: { id: "1", username: "admin", role: "admin", displayName: "Master Admin" },
    },
  };
};

const saveUsers = (users: Record<string, { password: string; user: AuthUser }>) => {
  sessionStorage.setItem("codechamps_users", JSON.stringify(users));
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const stored = sessionStorage.getItem("codechamps_user");
    return stored ? JSON.parse(stored) : null;
  });
  const [demoUsers, setDemoUsers] = useState(getStoredUsers);

  const login = useCallback(async (username: string, password: string): Promise<boolean> => {
    const current = getStoredUsers();
    const entry = current[username];
    if (entry && entry.password === password) {
      setUser(entry.user);
      sessionStorage.setItem("codechamps_user", JSON.stringify(entry.user));
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    sessionStorage.removeItem("codechamps_user");
  }, []);

  const addDemoUser = useCallback((username: string, password: string, userData: AuthUser) => {
    setDemoUsers((prev) => {
      const updated = { ...prev, [username]: { password, user: userData } };
      saveUsers(updated);
      return updated;
    });
  }, []);

  const removeDemoUser = useCallback((username: string) => {
    setDemoUsers((prev) => {
      const updated = { ...prev };
      delete updated[username];
      saveUsers(updated);
      return updated;
    });
  }, []);

  const removeDemoUsers = useCallback((usernames: string[]) => {
    setDemoUsers((prev) => {
      const updated = { ...prev };
      usernames.forEach((u) => delete updated[u]);
      saveUsers(updated);
      return updated;
    });
  }, []);

  const changeAdminPassword = useCallback((newPassword: string, oldPassword?: string): boolean => {
    const current = getStoredUsers();
    if (oldPassword && current.admin?.password !== oldPassword) return false;
    current.admin = { ...current.admin, password: newPassword };
    saveUsers(current);
    setDemoUsers(current);
    return true;
  }, []);

  const changePassword = useCallback((newPassword: string, oldPassword?: string): boolean => {
    if (!user) return false;
    const current = getStoredUsers();
    const entry = current[user.username];
    if (!entry) return false;
    if (oldPassword && entry.password !== oldPassword) return false;
    current[user.username] = { ...entry, password: newPassword };
    saveUsers(current);
    setDemoUsers(current);
    return true;
  }, [user]);

  const getSecurityStore = (): Record<string, UserSecurity> => {
    try {
      const stored = sessionStorage.getItem("codechamps_security");
      return stored ? JSON.parse(stored) : {};
    } catch { return {}; }
  };

  const saveSecurityStore = (data: Record<string, UserSecurity>) => {
    sessionStorage.setItem("codechamps_security", JSON.stringify(data));
  };

  const hasSecuritySetup = useCallback((): boolean => {
    if (!user) return false;
    const store = getSecurityStore();
    return !!store[user.username];
  }, [user]);

  const setupSecurity = useCallback((pin: string, question: string, answer: string) => {
    if (!user) return;
    const store = getSecurityStore();
    store[user.username] = { pin, securityQuestion: question, securityAnswer: answer };
    saveSecurityStore(store);
  }, [user]);

  const verifyPin = useCallback((pin: string): boolean => {
    if (!user) return false;
    const store = getSecurityStore();
    const entry = store[user.username];
    return entry?.pin === pin;
  }, [user]);

  const getSecurityQuestion = useCallback((): string | null => {
    if (!user) return null;
    const store = getSecurityStore();
    return store[user.username]?.securityQuestion || null;
  }, [user]);

  const verifySecurityAnswer = useCallback((answer: string): { valid: boolean; question: string } => {
    if (!user) return { valid: false, question: "" };
    const store = getSecurityStore();
    const entry = store[user.username];
    if (!entry) return { valid: false, question: "" };
    return { valid: entry.securityAnswer === answer.trim().toLowerCase(), question: entry.securityQuestion };
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user, addDemoUser, removeDemoUser, removeDemoUsers, changeAdminPassword, changePassword, hasSecuritySetup, setupSecurity, verifyPin, verifySecurityAnswer, getSecurityQuestion }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
