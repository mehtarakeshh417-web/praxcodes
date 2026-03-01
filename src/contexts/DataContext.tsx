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
  addTeacher: (teacher: Omit<TeacherData, "id" | "createdAt" | "username" | "password">) => TeacherData;
  addStudent: (student: Omit<StudentData, "id" | "createdAt" | "username" | "password" | "xp" | "progress">) => StudentData;
  addStudentsBulk: (students: Omit<StudentData, "id" | "createdAt" | "username" | "password" | "xp" | "progress">[]) => StudentData[];
  getSchoolTeachers: (schoolId: string) => TeacherData[];
  getSchoolStudents: (schoolId: string) => StudentData[];
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

  const addTeacher = useCallback((data: Omit<TeacherData, "id" | "createdAt" | "username" | "password">) => {
    const teacher: TeacherData = {
      ...data,
      id: crypto.randomUUID(),
      username: generateUsername("tchr", data.firstName, teachers.length + 1),
      password: generatePassword(),
      createdAt: new Date().toISOString(),
    };
    setTeachers((prev) => [...prev, teacher]);
    return teacher;
  }, [teachers.length]);

  const addStudent = useCallback((data: Omit<StudentData, "id" | "createdAt" | "username" | "password" | "xp" | "progress">) => {
    const student: StudentData = {
      ...data,
      id: crypto.randomUUID(),
      username: generateUsername("std", data.name, students.length + 1),
      password: generatePassword(),
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

  const getSchoolTeachers = useCallback((schoolId: string) => teachers.filter((t) => t.schoolId === schoolId), [teachers]);
  const getSchoolStudents = useCallback((schoolId: string) => students.filter((s) => s.schoolId === schoolId), [students]);

  return (
    <DataContext.Provider value={{ schools, teachers, students, addSchool, addTeacher, addStudent, addStudentsBulk, getSchoolTeachers, getSchoolStudents }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used within DataProvider");
  return ctx;
};
