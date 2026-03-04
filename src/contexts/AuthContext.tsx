import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";

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
  changePassword: (newPassword: string, oldPassword?: string) => Promise<boolean>;
  hasSecuritySetup: () => Promise<boolean>;
  setupSecurity: (pin: string, question: string, answer: string) => Promise<void>;
  verifyPin: (pin: string) => Promise<boolean>;
  verifySecurityAnswer: (answer: string) => Promise<{ valid: boolean; question: string }>;
  getSecurityQuestion: () => Promise<string | null>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Convert username to email format for Supabase auth
const usernameToEmail = (username: string) => `${username}@codechamps.local`;
const emailToUsername = (email: string) => email.replace("@codechamps.local", "");

const buildAuthUser = async (supaUser: User): Promise<AuthUser | null> => {
  const username = emailToUsername(supaUser.email || "");
  
  // Get role
  const { data: roles } = await supabase
    .from("user_roles")
    .select("role")
    .eq("user_id", supaUser.id);
  
  const role = (roles?.[0]?.role as UserRole) || "student";
  const meta = supaUser.user_metadata || {};

  let displayName = meta.display_name || username;
  let schoolName = meta.school_name;
  let className = meta.class_name;

  // Enrich from tables
  if (role === "school") {
    const { data: school } = await supabase.from("schools").select("name").eq("user_id", supaUser.id).maybeSingle();
    if (school) { displayName = school.name; schoolName = school.name; }
  } else if (role === "teacher") {
    const { data: teacher } = await supabase.from("teachers").select("first_name, last_name, school_id").eq("user_id", supaUser.id).maybeSingle();
    if (teacher) {
      displayName = `${teacher.first_name} ${teacher.last_name}`.trim();
      const { data: school } = await supabase.from("schools").select("name").eq("id", teacher.school_id).maybeSingle();
      if (school) schoolName = school.name;
    }
  } else if (role === "student") {
    const { data: student } = await supabase.from("students").select("name, class, section, school_id").eq("user_id", supaUser.id).maybeSingle();
    if (student) {
      displayName = student.name;
      className = `${student.class} (${student.section})`;
      const { data: school } = await supabase.from("schools").select("name").eq("id", student.school_id).maybeSingle();
      if (school) schoolName = school.name;
    }
  }

  return { id: supaUser.id, username, role, displayName, schoolName, className };
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Clear old localStorage data from previous implementation
    localStorage.removeItem("codechamps_users");
    localStorage.removeItem("codechamps_user");
    localStorage.removeItem("codechamps_security");
    localStorage.removeItem("cc_schools");
    localStorage.removeItem("cc_teachers");
    localStorage.removeItem("cc_students");

    let initialSessionHandled = false;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'INITIAL_SESSION') {
        initialSessionHandled = true;
        if (session?.user) {
          const authUser = await buildAuthUser(session.user);
          setUser(authUser);
        }
        setLoading(false);
      } else if (event === 'SIGNED_IN') {
        if (session?.user) {
          const authUser = await buildAuthUser(session.user);
          setUser(authUser);
        }
        setLoading(false);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setLoading(false);
      }
    });

    // Fallback if INITIAL_SESSION doesn't fire
    setTimeout(() => {
      if (!initialSessionHandled) {
        supabase.auth.getSession().then(async ({ data: { session } }) => {
          if (session?.user) {
            const authUser = await buildAuthUser(session.user);
            setUser(authUser);
          }
          setLoading(false);
        });
      }
    }, 500);

    return () => subscription.unsubscribe();
  }, []);

  const login = useCallback(async (username: string, password: string): Promise<boolean> => {
    const email = usernameToEmail(username);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return !error;
  }, []);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
  }, []);

  const changePassword = useCallback(async (newPassword: string, _oldPassword?: string): Promise<boolean> => {
    if (!user) return false;
    const { error } = await supabase.functions.invoke("manage-users", {
      body: { action: "change_password", user_id: user.id, new_password: newPassword },
    });
    return !error;
  }, [user]);

  const hasSecuritySetup = useCallback(async (): Promise<boolean> => {
    if (!user) return false;
    const { data } = await supabase
      .from("user_security")
      .select("id")
      .eq("user_id", user.id)
      .maybeSingle();
    return !!data;
  }, [user]);

  const setupSecurity = useCallback(async (pin: string, question: string, answer: string) => {
    if (!user) return;
    await supabase.from("user_security").upsert({
      user_id: user.id,
      pin,
      security_question: question,
      security_answer: answer.trim().toLowerCase(),
    }, { onConflict: "user_id" });
  }, [user]);

  const verifyPin = useCallback(async (pin: string): Promise<boolean> => {
    if (!user) return false;
    const { data } = await supabase
      .from("user_security")
      .select("pin")
      .eq("user_id", user.id)
      .maybeSingle();
    return data?.pin === pin;
  }, [user]);

  const getSecurityQuestion = useCallback(async (): Promise<string | null> => {
    if (!user) return null;
    const { data } = await supabase
      .from("user_security")
      .select("security_question")
      .eq("user_id", user.id)
      .maybeSingle();
    return data?.security_question || null;
  }, [user]);

  const verifySecurityAnswer = useCallback(async (answer: string): Promise<{ valid: boolean; question: string }> => {
    if (!user) return { valid: false, question: "" };
    const { data } = await supabase
      .from("user_security")
      .select("security_question, security_answer")
      .eq("user_id", user.id)
      .maybeSingle();
    if (!data) return { valid: false, question: "" };
    return {
      valid: data.security_answer === answer.trim().toLowerCase(),
      question: data.security_question,
    };
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user, changePassword, hasSecuritySetup, setupSecurity, verifyPin, verifySecurityAnswer, getSecurityQuestion, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
