import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./AuthContext";

export interface SchoolData {
  id: string;
  user_id?: string;
  name: string;
  address: string;
  state: string;
  city: string;
  phone: string;
  username?: string;
  password?: string;
  logo?: string;
  sections?: string[];
  createdAt: string;
}

export interface TeacherData {
  id: string;
  user_id?: string;
  schoolId: string;
  firstName: string;
  lastName: string;
  classes: string[];
  username: string;
  password: string;
  createdAt: string;
}

export interface StudentData {
  id: string;
  user_id?: string;
  schoolId: string;
  teacherId: string;
  name: string;
  fatherName: string;
  class: string;
  section: string;
  rollNo: string;
  username: string;
  password: string;
  xp: number;
  progress: number;
  createdAt: string;
}

const usernameToEmail = (username: string) => `${username}@codechamps.local`;
const generateUsername = (prefix: string, name: string, index: number) => {
  const clean = name.toLowerCase().replace(/[^a-z]/g, "").slice(0, 6);
  return `${prefix}_${clean}${index}`;
};
const generatePassword = () => Math.random().toString(36).slice(-8);

const mapSchool = (s: any): SchoolData => ({
  id: s.id, user_id: s.user_id, name: s.name,
  address: s.address || "", state: s.state || "", city: s.city || "",
  phone: s.phone || "", logo: s.logo, sections: s.sections || ["A"],
  createdAt: s.created_at,
});
const mapTeacher = (t: any): TeacherData => ({
  id: t.id, user_id: t.user_id, schoolId: t.school_id,
  firstName: t.first_name, lastName: t.last_name || "",
  classes: t.classes || [], username: "", password: "",
  createdAt: t.created_at,
});
const mapStudent = (s: any): StudentData => ({
  id: s.id, user_id: s.user_id, schoolId: s.school_id,
  teacherId: s.teacher_id || "", name: s.name,
  fatherName: s.father_name || "", class: s.class || "",
  section: s.section || "A", rollNo: s.roll_no || "",
  username: "", password: "",
  xp: s.xp || 0, progress: s.progress || 0,
  createdAt: s.created_at,
});

interface DataContextType {
  schools: SchoolData[];
  teachers: TeacherData[];
  students: StudentData[];
  loading: boolean;
  addSchool: (school: { name: string; address: string; state: string; city: string; phone: string; username: string; password: string }) => Promise<SchoolData | null>;
  addTeacher: (data: { firstName: string; lastName: string; classes: string[]; schoolId: string }, customUsername?: string, customPassword?: string) => Promise<TeacherData | null>;
  addStudent: (data: { name: string; fatherName: string; class: string; section: string; rollNo: string; teacherId: string; schoolId: string }, customUsername?: string, customPassword?: string) => Promise<StudentData | null>;
  updateSchool: (schoolId: string, data: Partial<Pick<SchoolData, "name" | "address" | "state" | "city" | "phone" | "sections">>) => Promise<void>;
  getSchool: (schoolId: string) => SchoolData | undefined;
  updateTeacher: (teacherId: string, data: Partial<{ firstName: string; lastName: string; classes: string[] }>) => Promise<void>;
  updateStudent: (studentId: string, data: Partial<{ name: string; fatherName: string; class: string; section: string; rollNo: string; teacherId: string }>) => Promise<void>;
  deleteSchool: (schoolId: string) => Promise<string[]>;
  deleteTeacher: (teacherId: string) => Promise<{ success: boolean; removedUsernames: string[]; error?: string }>;
  deleteStudent: (studentId: string) => Promise<string | null>;
  getSchoolTeachers: (schoolId: string) => TeacherData[];
  getSchoolStudents: (schoolId: string) => StudentData[];
  getTeacherStudents: (teacherId: string) => StudentData[];
  refreshData: () => Promise<void>;
}

const DataContext = createContext<DataContextType | null>(null);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [schools, setSchools] = useState<SchoolData[]>([]);
  const [teachers, setTeachers] = useState<TeacherData[]>([]);
  const [students, setStudents] = useState<StudentData[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!user) { setSchools([]); setTeachers([]); setStudents([]); setLoading(false); return; }
    setLoading(true);
    try {
      const [sRes, tRes, stRes] = await Promise.all([
        supabase.from("schools").select("*"),
        supabase.from("teachers").select("*"),
        supabase.from("students").select("*"),
      ]);
      setSchools((sRes.data || []).map(mapSchool));
      setTeachers((tRes.data || []).map(mapTeacher));
      setStudents((stRes.data || []).map(mapStudent));
    } catch (err) { console.error("Fetch error:", err); }
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const addSchool = useCallback(async (data: { name: string; address: string; state: string; city: string; phone: string; username: string; password: string }): Promise<SchoolData | null> => {
    const { data: result, error } = await supabase.functions.invoke("manage-users", {
      body: { action: "create_user", email: usernameToEmail(data.username), password: data.password, role: "school", metadata: { display_name: data.name, school_name: data.name } },
    });
    if (error || result?.error) { console.error("Create school user failed:", error || result?.error); return null; }

    const { data: school, error: ie } = await supabase.from("schools").insert({
      user_id: result.user.id, name: data.name, address: data.address, state: data.state, city: data.city, phone: data.phone,
    }).select().single();
    if (ie) { console.error("Insert school failed:", ie); return null; }

    const newSchool = { ...mapSchool(school), username: data.username, password: data.password };
    setSchools(prev => [...prev, newSchool]);
    return newSchool;
  }, []);

  const addTeacher = useCallback(async (data: { firstName: string; lastName: string; classes: string[]; schoolId: string }, customUsername?: string, customPassword?: string): Promise<TeacherData | null> => {
    const username = customUsername || generateUsername("tchr", data.firstName, Date.now());
    const password = customPassword || generatePassword();
    const school = schools.find(s => s.user_id === data.schoolId);
    const actualSchoolId = school?.id || data.schoolId;

    const { data: result, error } = await supabase.functions.invoke("manage-users", {
      body: { action: "create_user", email: usernameToEmail(username), password, role: "teacher", metadata: { display_name: `${data.firstName} ${data.lastName}` } },
    });
    if (error || result?.error) { console.error("Create teacher user failed:", error || result?.error); return null; }

    const { data: teacher, error: ie } = await supabase.from("teachers").insert({
      user_id: result.user.id, school_id: actualSchoolId,
      first_name: data.firstName, last_name: data.lastName, classes: data.classes,
    }).select().single();
    if (ie) { console.error("Insert teacher failed:", ie); return null; }

    const newTeacher = { ...mapTeacher(teacher), username, password };
    setTeachers(prev => [...prev, newTeacher]);
    return newTeacher;
  }, [schools]);

  const addStudent = useCallback(async (data: { name: string; fatherName: string; class: string; section: string; rollNo: string; teacherId: string; schoolId: string }, customUsername?: string, customPassword?: string): Promise<StudentData | null> => {
    const username = customUsername || generateUsername("std", data.name, Date.now());
    const password = customPassword || generatePassword();
    const school = schools.find(s => s.user_id === data.schoolId);
    const actualSchoolId = school?.id || data.schoolId;

    const { data: result, error } = await supabase.functions.invoke("manage-users", {
      body: { action: "create_user", email: usernameToEmail(username), password, role: "student", metadata: { display_name: data.name } },
    });
    if (error || result?.error) { console.error("Create student user failed:", error || result?.error); return null; }

    const { data: student, error: ie } = await supabase.from("students").insert({
      user_id: result.user.id, school_id: actualSchoolId, teacher_id: data.teacherId,
      name: data.name, father_name: data.fatherName, class: data.class,
      section: data.section, roll_no: data.rollNo,
    }).select().single();
    if (ie) { console.error("Insert student failed:", ie); return null; }

    const newStudent = { ...mapStudent(student), username, password };
    setStudents(prev => [...prev, newStudent]);
    return newStudent;
  }, [schools]);

  const updateSchool = useCallback(async (schoolId: string, data: Partial<Pick<SchoolData, "name" | "address" | "state" | "city" | "phone" | "sections">>) => {
    const school = schools.find(s => s.user_id === schoolId);
    const actualId = school?.id || schoolId;
    await supabase.from("schools").update(data).eq("id", actualId);
    await fetchData();
  }, [schools, fetchData]);

  const getSchool = useCallback((schoolId: string) => {
    return schools.find(s => s.id === schoolId || s.user_id === schoolId);
  }, [schools]);

  const updateTeacher = useCallback(async (teacherId: string, data: Partial<{ firstName: string; lastName: string; classes: string[] }>) => {
    const dbData: any = {};
    if (data.firstName !== undefined) dbData.first_name = data.firstName;
    if (data.lastName !== undefined) dbData.last_name = data.lastName;
    if (data.classes !== undefined) dbData.classes = data.classes;
    await supabase.from("teachers").update(dbData).eq("id", teacherId);
    await fetchData();
  }, [fetchData]);

  const updateStudent = useCallback(async (studentId: string, data: Partial<{ name: string; fatherName: string; class: string; section: string; rollNo: string; teacherId: string }>) => {
    const dbData: any = {};
    if (data.name !== undefined) dbData.name = data.name;
    if (data.fatherName !== undefined) dbData.father_name = data.fatherName;
    if (data.class !== undefined) dbData.class = data.class;
    if (data.section !== undefined) dbData.section = data.section;
    if (data.rollNo !== undefined) dbData.roll_no = data.rollNo;
    if (data.teacherId !== undefined) dbData.teacher_id = data.teacherId;
    await supabase.from("students").update(dbData).eq("id", studentId);
    await fetchData();
  }, [fetchData]);

  const deleteSchool = useCallback(async (schoolId: string): Promise<string[]> => {
    const school = schools.find(s => s.id === schoolId);
    const schoolTeachers = teachers.filter(t => t.schoolId === schoolId);
    const schoolStudents = students.filter(s => s.schoolId === schoolId);
    const userIds = [school?.user_id, ...schoolTeachers.map(t => t.user_id), ...schoolStudents.map(s => s.user_id)].filter(Boolean) as string[];

    await supabase.from("schools").delete().eq("id", schoolId);
    if (userIds.length > 0) {
      await supabase.functions.invoke("manage-users", { body: { action: "delete_users_bulk", user_ids: userIds } });
    }
    await fetchData();
    return [];
  }, [schools, teachers, students, fetchData]);

  const deleteTeacher = useCallback(async (teacherId: string): Promise<{ success: boolean; removedUsernames: string[]; error?: string }> => {
    const teacher = teachers.find(t => t.id === teacherId);
    if (!teacher) return { success: false, removedUsernames: [], error: "Teacher not found" };
    const assigned = students.filter(s => s.teacherId === teacherId);
    if (assigned.length > 0) return { success: false, removedUsernames: [], error: `Cannot delete: ${assigned.length} student(s) assigned. Reassign first.` };

    await supabase.from("teachers").delete().eq("id", teacherId);
    if (teacher.user_id) {
      await supabase.functions.invoke("manage-users", { body: { action: "delete_user", user_id: teacher.user_id } });
    }
    await fetchData();
    return { success: true, removedUsernames: [] };
  }, [teachers, students, fetchData]);

  const deleteStudent = useCallback(async (studentId: string): Promise<string | null> => {
    const student = students.find(s => s.id === studentId);
    setStudents(prev => prev.filter(s => s.id !== studentId));
    await supabase.from("students").delete().eq("id", studentId);
    if (student?.user_id) {
      await supabase.functions.invoke("manage-users", { body: { action: "delete_user", user_id: student.user_id } });
    }
    return null;
  }, [students]);

  const getSchoolTeachers = useCallback((schoolId: string) => {
    const school = schools.find(s => s.user_id === schoolId);
    const actual = school?.id || schoolId;
    return teachers.filter(t => t.schoolId === actual);
  }, [schools, teachers]);

  const getSchoolStudents = useCallback((schoolId: string) => {
    const school = schools.find(s => s.user_id === schoolId);
    const actual = school?.id || schoolId;
    return students.filter(s => s.schoolId === actual);
  }, [schools, students]);

  const getTeacherStudents = useCallback((teacherId: string) => {
    const teacher = teachers.find(t => t.user_id === teacherId);
    const actual = teacher?.id || teacherId;
    return students.filter(s => s.teacherId === actual);
  }, [teachers, students]);

  return (
    <DataContext.Provider value={{
      schools, teachers, students, loading,
      addSchool, addTeacher, addStudent,
      updateSchool, getSchool, updateTeacher, updateStudent,
      deleteSchool, deleteTeacher, deleteStudent,
      getSchoolTeachers, getSchoolStudents, getTeacherStudents,
      refreshData: fetchData,
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used within DataProvider");
  return ctx;
};
