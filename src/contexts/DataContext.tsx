import React, { createContext, useContext, useState, useCallback } from "react";

export interface SchoolData {
  id: string;
  name: string;
  address: string;
  state: string;
  city: string;
  phone: string;
  username: string;
  password: string;
  logo?: string;
  sections?: string[];
  createdAt: string;
}

export interface TeacherData {
  id: string;
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

interface DataContextType {
  schools: SchoolData[];
  teachers: TeacherData[];
  students: StudentData[];
  addSchool: (school: Omit<SchoolData, "id" | "createdAt">) => SchoolData;
  addTeacher: (teacher: Omit<TeacherData, "id" | "createdAt" | "username" | "password">, customUsername?: string, customPassword?: string) => TeacherData;
  addStudent: (student: Omit<StudentData, "id" | "createdAt" | "username" | "password" | "xp" | "progress">, customUsername?: string, customPassword?: string) => StudentData;
  addStudentsBulk: (students: (Omit<StudentData, "id" | "createdAt" | "username" | "password" | "xp" | "progress"> & { customUsername?: string; customPassword?: string })[]) => StudentData[];
  updateSchool: (schoolId: string, data: Partial<Pick<SchoolData, "name" | "address" | "state" | "city" | "phone" | "sections">>) => void;
  getSchool: (schoolId: string) => SchoolData | undefined;
  updateTeacher: (teacherId: string, data: Partial<Pick<TeacherData, "firstName" | "lastName" | "classes">>) => void;
  updateStudent: (studentId: string, data: Partial<Pick<StudentData, "name" | "fatherName" | "class" | "section" | "rollNo" | "teacherId">>) => void;
  deleteSchool: (schoolId: string) => string[];
  deleteTeacher: (teacherId: string) => { success: boolean; removedUsernames: string[]; error?: string };
  deleteStudent: (studentId: string) => string | null;
  getSchoolTeachers: (schoolId: string) => TeacherData[];
  getSchoolStudents: (schoolId: string) => StudentData[];
  getTeacherStudents: (teacherId: string) => StudentData[];
}

const DataContext = createContext<DataContextType | null>(null);

const generateUsername = (prefix: string, name: string, index: number) => {
  const clean = name.toLowerCase().replace(/[^a-z]/g, "").slice(0, 6);
  return `${prefix}_${clean}${index}`;
};

const generatePassword = () => Math.random().toString(36).slice(-8);

// Persistence helpers
const loadState = <T,>(key: string, fallback: T): T => {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : fallback;
  } catch { return fallback; }
};

const saveState = (key: string, value: unknown) => {
  localStorage.setItem(key, JSON.stringify(value));
};

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [schools, setSchools] = useState<SchoolData[]>(() => loadState("cc_schools", []));
  const [teachers, setTeachers] = useState<TeacherData[]>(() => loadState("cc_teachers", []));
  const [students, setStudents] = useState<StudentData[]>(() => loadState("cc_students", []));

  const persistSchools = (data: SchoolData[]) => { setSchools(data); saveState("cc_schools", data); };
  const persistTeachers = (data: TeacherData[]) => { setTeachers(data); saveState("cc_teachers", data); };
  const persistStudents = (data: StudentData[]) => { setStudents(data); saveState("cc_students", data); };

  const addSchool = useCallback((data: Omit<SchoolData, "id" | "createdAt">) => {
    const school: SchoolData = { ...data, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
    const updated = [...schools, school];
    persistSchools(updated);
    return school;
  }, [schools]);

  const addTeacher = useCallback((data: Omit<TeacherData, "id" | "createdAt" | "username" | "password">, customUsername?: string, customPassword?: string) => {
    const teacher: TeacherData = {
      ...data,
      id: crypto.randomUUID(),
      username: customUsername || generateUsername("tchr", data.firstName, teachers.length + 1),
      password: customPassword || generatePassword(),
      createdAt: new Date().toISOString(),
    };
    const updated = [...teachers, teacher];
    persistTeachers(updated);
    return teacher;
  }, [teachers]);

  const addStudent = useCallback((data: Omit<StudentData, "id" | "createdAt" | "username" | "password" | "xp" | "progress">, customUsername?: string, customPassword?: string) => {
    const student: StudentData = {
      ...data,
      id: crypto.randomUUID(),
      username: customUsername || generateUsername("std", data.name, students.length + 1),
      password: customPassword || generatePassword(),
      xp: 0,
      progress: 0,
      createdAt: new Date().toISOString(),
    };
    const updated = [...students, student];
    persistStudents(updated);
    return student;
  }, [students]);

  const addStudentsBulk = useCallback((bulk: (Omit<StudentData, "id" | "createdAt" | "username" | "password" | "xp" | "progress"> & { customUsername?: string; customPassword?: string })[]) => {
    const created: StudentData[] = bulk.map((data, i) => {
      const { customUsername, customPassword, ...rest } = data;
      return {
        ...rest,
        id: crypto.randomUUID(),
        username: customUsername || generateUsername("std", rest.name, students.length + i + 1),
        password: customPassword || generatePassword(),
        xp: 0,
        progress: 0,
        createdAt: new Date().toISOString(),
      };
    });
    const updated = [...students, ...created];
    persistStudents(updated);
    return created;
  }, [students]);

  const updateTeacher = useCallback((teacherId: string, data: Partial<Pick<TeacherData, "firstName" | "lastName" | "classes">>) => {
    const updated = teachers.map((t) => t.id === teacherId ? { ...t, ...data } : t);
    persistTeachers(updated);
  }, [teachers]);

  const updateStudent = useCallback((studentId: string, data: Partial<Pick<StudentData, "name" | "fatherName" | "class" | "section" | "rollNo" | "teacherId">>) => {
    const updated = students.map((s) => s.id === studentId ? { ...s, ...data } : s);
    persistStudents(updated);
  }, [students]);

  const deleteSchool = useCallback((schoolId: string): string[] => {
    const removedUsernames: string[] = [];
    const school = schools.find((s) => s.id === schoolId);
    if (school) removedUsernames.push(school.username);
    teachers.filter((t) => t.schoolId === schoolId).forEach((t) => removedUsernames.push(t.username));
    students.filter((s) => s.schoolId === schoolId).forEach((s) => removedUsernames.push(s.username));
    persistSchools(schools.filter((s) => s.id !== schoolId));
    persistTeachers(teachers.filter((t) => t.schoolId !== schoolId));
    persistStudents(students.filter((s) => s.schoolId !== schoolId));
    return removedUsernames;
  }, [schools, teachers, students]);

  const deleteTeacher = useCallback((teacherId: string): { success: boolean; removedUsernames: string[]; error?: string } => {
    const teacher = teachers.find((t) => t.id === teacherId);
    if (!teacher) return { success: false, removedUsernames: [], error: "Teacher not found" };
    const assignedStudents = students.filter((s) => s.teacherId === teacherId);
    if (assignedStudents.length > 0) {
      return { success: false, removedUsernames: [], error: `Cannot delete: ${assignedStudents.length} student(s) are assigned to this teacher. Reassign them first.` };
    }
    persistTeachers(teachers.filter((t) => t.id !== teacherId));
    return { success: true, removedUsernames: [teacher.username] };
  }, [teachers, students]);

  const deleteStudent = useCallback((studentId: string): string | null => {
    const student = students.find((s) => s.id === studentId);
    if (!student) return null;
    persistStudents(students.filter((s) => s.id !== studentId));
    return student.username;
  }, [students]);

  const updateSchool = useCallback((schoolId: string, data: Partial<Pick<SchoolData, "name" | "address" | "state" | "city" | "phone" | "sections">>) => {
    const updated = schools.map((s) => s.id === schoolId ? { ...s, ...data } : s);
    persistSchools(updated);
  }, [schools]);

  const getSchool = useCallback((schoolId: string) => schools.find((s) => s.id === schoolId), [schools]);

  const getSchoolTeachers = useCallback((schoolId: string) => teachers.filter((t) => t.schoolId === schoolId), [teachers]);
  const getSchoolStudents = useCallback((schoolId: string) => students.filter((s) => s.schoolId === schoolId), [students]);
  const getTeacherStudents = useCallback((teacherId: string) => students.filter((s) => s.teacherId === teacherId), [students]);

  return (
    <DataContext.Provider value={{ schools, teachers, students, addSchool, addTeacher, addStudent, addStudentsBulk, updateTeacher, updateStudent, updateSchool, deleteSchool, deleteTeacher, deleteStudent, getSchool, getSchoolTeachers, getSchoolStudents, getTeacherStudents }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used within DataProvider");
  return ctx;
};
