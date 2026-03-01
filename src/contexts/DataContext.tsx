import React, { createContext, useContext, useState, useCallback } from "react";

export interface SchoolData {
  id: string;
  name: string;
  address: string;
  city: string;
  phone: string;
  username: string;
  password: string;
  logo?: string;
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
  addStudentsBulk: (students: Omit<StudentData, "id" | "createdAt" | "username" | "password" | "xp" | "progress">[]) => StudentData[];
  deleteSchool: (schoolId: string) => string[]; // returns removed usernames
  deleteTeacher: (teacherId: string) => { success: boolean; removedUsernames: string[]; error?: string };
  deleteStudent: (studentId: string) => string | null; // returns removed username
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

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [schools, setSchools] = useState<SchoolData[]>([]);
  const [teachers, setTeachers] = useState<TeacherData[]>([]);
  const [students, setStudents] = useState<StudentData[]>([]);

  const addSchool = useCallback((data: Omit<SchoolData, "id" | "createdAt">) => {
    const school: SchoolData = { ...data, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
    setSchools((prev) => [...prev, school]);
    return school;
  }, []);

  const addTeacher = useCallback((data: Omit<TeacherData, "id" | "createdAt" | "username" | "password">, customUsername?: string, customPassword?: string) => {
    const teacher: TeacherData = {
      ...data,
      id: crypto.randomUUID(),
      username: customUsername || generateUsername("tchr", data.firstName, teachers.length + 1),
      password: customPassword || generatePassword(),
      createdAt: new Date().toISOString(),
    };
    setTeachers((prev) => [...prev, teacher]);
    return teacher;
  }, [teachers.length]);

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
    setStudents((prev) => [...prev, student]);
    return student;
  }, [students.length]);

  const addStudentsBulk = useCallback((bulk: Omit<StudentData, "id" | "createdAt" | "username" | "password" | "xp" | "progress">[]) => {
    const created = bulk.map((data, i) => ({
      ...data,
      id: crypto.randomUUID(),
      username: generateUsername("std", data.name, students.length + i + 1),
      password: generatePassword(),
      xp: 0,
      progress: 0,
      createdAt: new Date().toISOString(),
    }));
    setStudents((prev) => [...prev, ...created]);
    return created;
  }, [students.length]);

  // Cascading delete: removes school + all its teachers + all its students
  const deleteSchool = useCallback((schoolId: string): string[] => {
    const removedUsernames: string[] = [];
    const school = schools.find((s) => s.id === schoolId);
    if (school) removedUsernames.push(school.username);
    const schoolTeachers = teachers.filter((t) => t.schoolId === schoolId);
    schoolTeachers.forEach((t) => removedUsernames.push(t.username));
    const schoolStudents = students.filter((s) => s.schoolId === schoolId);
    schoolStudents.forEach((s) => removedUsernames.push(s.username));
    setSchools((prev) => prev.filter((s) => s.id !== schoolId));
    setTeachers((prev) => prev.filter((t) => t.schoolId !== schoolId));
    setStudents((prev) => prev.filter((s) => s.schoolId !== schoolId));
    return removedUsernames;
  }, [schools, teachers, students]);

  // Delete teacher: block if students are assigned, or cascade
  const deleteTeacher = useCallback((teacherId: string): { success: boolean; removedUsernames: string[]; error?: string } => {
    const teacher = teachers.find((t) => t.id === teacherId);
    if (!teacher) return { success: false, removedUsernames: [], error: "Teacher not found" };
    const assignedStudents = students.filter((s) => s.teacherId === teacherId);
    if (assignedStudents.length > 0) {
      return { success: false, removedUsernames: [], error: `Cannot delete: ${assignedStudents.length} student(s) are assigned to this teacher. Reassign them first.` };
    }
    setTeachers((prev) => prev.filter((t) => t.id !== teacherId));
    return { success: true, removedUsernames: [teacher.username] };
  }, [teachers, students]);

  const deleteStudent = useCallback((studentId: string): string | null => {
    const student = students.find((s) => s.id === studentId);
    if (!student) return null;
    setStudents((prev) => prev.filter((s) => s.id !== studentId));
    return student.username;
  }, [students]);

  const getSchoolTeachers = useCallback((schoolId: string) => teachers.filter((t) => t.schoolId === schoolId), [teachers]);
  const getSchoolStudents = useCallback((schoolId: string) => students.filter((s) => s.schoolId === schoolId), [students]);
  const getTeacherStudents = useCallback((teacherId: string) => students.filter((s) => s.teacherId === teacherId), [students]);

  return (
    <DataContext.Provider value={{ schools, teachers, students, addSchool, addTeacher, addStudent, addStudentsBulk, deleteSchool, deleteTeacher, deleteStudent, getSchoolTeachers, getSchoolStudents, getTeacherStudents }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used within DataProvider");
  return ctx;
};
