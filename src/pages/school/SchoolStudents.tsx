import { useState, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import { useData } from "@/contexts/DataContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GraduationCap, Plus, X, Upload, Trash2, AlertTriangle, Edit2, Download, FileSpreadsheet } from "lucide-react";
import { toast } from "sonner";
import * as XLSX from "xlsx";

const CLASS_OPTIONS = ["1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th"];
const DEFAULT_SECTIONS = ["A", "B", "C", "D", "E"];

const SchoolStudents = () => {
  const { user } = useAuth();
  const { addStudent, addStudentsBulk, getSchoolStudents, getSchoolTeachers, getSchool, deleteStudent, updateStudent } = useData();
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showBulkUpload, setShowBulkUpload] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: "", fatherName: "", class: "", section: "", rollNo: "", teacherId: "" });
  const [form, setForm] = useState({ name: "", fatherName: "", class: "", section: "", rollNo: "", teacherId: "", username: "", password: "" });
  const [bulkPreview, setBulkPreview] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const schoolId = user?.id || "";
  const students = getSchoolStudents(schoolId);
  const teachers = getSchoolTeachers(schoolId);
  const school = getSchool(schoolId);
  const SECTION_OPTIONS = school?.sections?.length ? school.sections : DEFAULT_SECTIONS;

  const filteredTeachers = useMemo(() => {
    if (!form.class) return [];
    return teachers.filter((t) => t.classes.some((c) => c.startsWith(form.class)));
  }, [form.class, teachers]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.fatherName || !form.class || !form.section || !form.rollNo || !form.teacherId) {
      toast.error("Fill all required fields including teacher assignment");
      return;
    }
    setIsSubmitting(true);
    const customUsername = form.username.trim() || undefined;
    const customPassword = form.password.trim() || undefined;
    const student = await addStudent({ ...form, schoolId }, customUsername, customPassword);
    if (student) {
      toast.success(`Student created! Username: ${student.username} | Password: ${student.password}`);
      setForm({ name: "", fatherName: "", class: "", section: "", rollNo: "", teacherId: "", username: "", password: "" });
      setShowForm(false);
    } else {
      toast.error("Failed to create student.");
    }
    setIsSubmitting(false);
  };

  const handleDelete = async (studentId: string, studentName: string) => {
    if (!confirm(`Delete student "${studentName}"?`)) return;
    await deleteStudent(studentId);
    toast.success(`Student "${studentName}" deleted.`);
  };

  const handleAddClick = () => {
    if (teachers.length === 0) {
      toast.error("Cannot create student without assigning a teacher. Please create a teacher first.");
      return;
    }
    setShowForm(true);
  };

  const getTeacherName = (teacherId: string) => {
    const t = teachers.find((t) => t.id === teacherId);
    return t ? `${t.firstName} ${t.lastName}` : "Unknown";
  };

  const startEdit = (s: typeof students[0]) => {
    setEditingId(s.id);
    setEditForm({ name: s.name, fatherName: s.fatherName, class: s.class, section: s.section, rollNo: s.rollNo, teacherId: s.teacherId });
  };

  const saveEdit = async (studentId: string) => {
    if (!editForm.name || !editForm.fatherName) {
      toast.error("Name fields cannot be empty");
      return;
    }
    await updateStudent(studentId, editForm);
    toast.success("Student updated.");
    setEditingId(null);
  };

  // Normalize class input: "5" → "5th", "1" → "1st", etc.
  const normalizeClass = (cls: string): string => {
    const trimmed = cls.trim();
    if (CLASS_OPTIONS.includes(trimmed)) return trimmed;
    const num = parseInt(trimmed, 10);
    if (isNaN(num) || num < 1 || num > 8) return trimmed;
    const suffixes: Record<number, string> = { 1: "1st", 2: "2nd", 3: "3rd" };
    return suffixes[num] || `${num}th`;
  };

  // Download Excel template
  const downloadTemplate = () => {
    const teacherNames = teachers.map((t) => `${t.firstName} ${t.lastName}`).join(", ");
    const firstTeacher = teachers.length > 0 ? `${teachers[0].firstName} ${teachers[0].lastName}` : "";
    const templateData = [
      { "Student Name": "John Doe", "Father Name": "James Doe", "Class": "5th", "Section": "A", "Roll No": "101", "Teacher Name": firstTeacher, "Username (optional)": "", "Password (optional)": "" },
      { "Student Name": "Jane Smith", "Father Name": "Robert Smith", "Class": "5th", "Section": "B", "Roll No": "102", "Teacher Name": firstTeacher, "Username (optional)": "", "Password (optional)": "" },
    ];
    const ws = XLSX.utils.json_to_sheet(templateData);
    ws["!cols"] = [{ wch: 20 }, { wch: 20 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 25 }, { wch: 20 }, { wch: 20 }];
    // Add a note about available teachers
    if (!ws["!comments"]) ws["!comments"] = [];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Students");
    // Add a reference sheet with available teachers
    const teacherRef = teachers.map((t) => ({
      "Teacher Name": `${t.firstName} ${t.lastName}`,
      "Classes": t.classes.join(", "),
    }));
    if (teacherRef.length > 0) {
      const ws2 = XLSX.utils.json_to_sheet(teacherRef);
      ws2["!cols"] = [{ wch: 25 }, { wch: 30 }];
      XLSX.utils.book_append_sheet(wb, ws2, "Available Teachers");
    }
    XLSX.writeFile(wb, "CodeChamps_Student_Template.xlsx");
    toast.success("Template downloaded! Check 'Available Teachers' sheet for teacher names.");
  };

  // Handle file upload - case-insensitive column matching
  const normalizeColumns = (row: any): any => {
    const normalized: any = {};
    const columnMap: Record<string, string> = {
      "student name": "Student Name",
      "father name": "Father Name",
      "class": "Class",
      "section": "Section",
      "roll no": "Roll No",
      "teacher name": "Teacher Name",
      "username (optional)": "Username (optional)",
      "password (optional)": "Password (optional)",
    };
    Object.keys(row).forEach((key) => {
      const mapped = columnMap[key.toLowerCase().trim()];
      normalized[mapped || key] = row[key];
    });
    return normalized;
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const data = new Uint8Array(evt.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rawRows: any[] = XLSX.utils.sheet_to_json(sheet);
        if (rawRows.length === 0) {
          toast.error("No data found in the uploaded file.");
          return;
        }
        // Normalize column names (case-insensitive)
        const rows = rawRows.map(normalizeColumns);
        const required = ["Student Name", "Father Name", "Class", "Section", "Roll No"];
        const missing = required.filter((col) => !(col in rows[0]));
        if (missing.length > 0) {
          toast.error(`Missing columns: ${missing.join(", ")}. Please use the template.`);
          return;
        }
        setBulkPreview(rows);
        setShowBulkUpload(true);
        toast.success(`${rows.length} student(s) found in the file. Review and confirm.`);
      } catch {
        toast.error("Failed to read file. Ensure it's a valid .xlsx file.");
      }
    };
    reader.readAsArrayBuffer(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Process bulk upload - use addStudentsBulk for atomicity
  const processBulkUpload = async () => {
    if (bulkPreview.length === 0) return;

    const errors: string[] = [];
    const validStudents: { name: string; fatherName: string; class: string; section: string; rollNo: string; teacherId: string; schoolId: string; customUsername?: string; customPassword?: string }[] = [];

    const sectionLookup = new Map(SECTION_OPTIONS.map(s => [s.toLowerCase(), s]));

    bulkPreview.forEach((row, idx) => {
      const name = String(row["Student Name"] || "").trim();
      const fatherName = String(row["Father Name"] || "").trim();
      const rawCls = String(row["Class"] || "").trim();
      const cls = normalizeClass(rawCls);
      const rawSection = String(row["Section"] || "").trim();
      const section = sectionLookup.get(rawSection.toLowerCase()) || rawSection.toUpperCase();
      const rollNo = String(row["Roll No"] || "").trim();
      const teacherName = String(row["Teacher Name"] || "").trim();
      const username = String(row["Username (optional)"] || "").trim();
      const password = String(row["Password (optional)"] || "").trim();

      if (!name || !fatherName || !cls || !section || !rollNo) {
        errors.push(`Row ${idx + 2}: Missing required fields`);
        return;
      }
      if (!CLASS_OPTIONS.includes(cls)) {
        errors.push(`Row ${idx + 2}: Invalid class "${rawCls}"`);
        return;
      }
      if (!sectionLookup.has(rawSection.toLowerCase()) && !SECTION_OPTIONS.includes(section)) {
        errors.push(`Row ${idx + 2}: Invalid section "${rawSection}". Available: ${SECTION_OPTIONS.join(", ")}`);
        return;
      }

      let matchingTeacher;
      if (teacherName) {
        // First try exact name match
        const namedTeacher = teachers.find((t) =>
          `${t.firstName} ${t.lastName}`.toLowerCase() === teacherName.toLowerCase()
        );
        if (!namedTeacher) {
          errors.push(`Row ${idx + 2}: Teacher "${teacherName}" not found.`);
          return;
        }
        // Check if this teacher covers the class+section
        const classSection = `${cls}-${section}`;
        if (namedTeacher.classes.some((c) => c === classSection || c.startsWith(cls))) {
          matchingTeacher = namedTeacher;
        } else {
          // Named teacher doesn't cover this class — try to find another teacher who does
          matchingTeacher = teachers.find((t) =>
            t.classes.some((c) => c === classSection || c === cls || c.startsWith(`${cls}-`))
          );
          if (!matchingTeacher) {
            errors.push(`Row ${idx + 2}: No teacher assigned to class ${cls}-${section}. "${teacherName}" teaches ${namedTeacher.classes.join(", ")}`);
            return;
          }
        }
      } else {
        // Auto-match: find teacher covering this class
        const classSection = `${cls}-${section}`;
        matchingTeacher = teachers.find((t) =>
          t.classes.some((c) => c === classSection || c === cls || c.startsWith(`${cls}-`))
        );
        if (!matchingTeacher) {
          errors.push(`Row ${idx + 2}: No teacher assigned to class ${cls}-${section}`);
          return;
        }
      }

      validStudents.push({
        name, fatherName, class: cls, section, rollNo,
        teacherId: matchingTeacher.id, schoolId,
        customUsername: username || undefined,
        customPassword: password || undefined,
      });
    });

    if (errors.length > 0) {
      toast.error(`${errors.length} error(s): ${errors.slice(0, 3).join("; ")}${errors.length > 3 ? "..." : ""}`);
    }

    if (validStudents.length > 0) {
      setIsSubmitting(true);
      try {
        const result = await addStudentsBulk(validStudents.map(s => ({
          name: s.name, fatherName: s.fatherName, class: s.class, section: s.section,
          rollNo: s.rollNo, teacherId: s.teacherId, schoolId: s.schoolId,
          customUsername: s.customUsername, customPassword: s.customPassword,
        })));

        const { created, errors: backendErrors } = result;
        const allErrors = [...errors, ...backendErrors];

        if (created.length === 0 && allErrors.length > 0) {
          // Show first 5 errors in a readable format
          const errorSummary = allErrors.slice(0, 5).join("\n• ");
          toast.error(`Could not create any students:\n• ${errorSummary}`, { duration: 10000 });
        } else if (created.length > 0 && allErrors.length > 0) {
          toast.warning(`${created.length} of ${validStudents.length} students created successfully. ${allErrors.length} had issues.`, { duration: 8000 });
        } else if (created.length > 0) {
          toast.success(`All ${created.length} student(s) created successfully! 🎉`);
        }
      } catch (err) {
        console.error("Bulk upload error:", err);
        toast.error("Something went wrong during upload. Please try again.");
      }
      setBulkPreview([]);
      setShowBulkUpload(false);
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold mb-1"><span className="text-gradient-brand">Students</span></h1>
          <p className="text-white/60 font-body">Manage student enrollment</p>
        </div>
        <div className="flex gap-3">
          <Button variant="glass" size="lg" onClick={downloadTemplate}>
            <Download className="w-5 h-5 mr-2" /> Download Template
          </Button>
          <Button variant="glass" size="lg" onClick={() => fileInputRef.current?.click()}>
            <Upload className="w-5 h-5 mr-2" /> Bulk Upload
          </Button>
          <input ref={fileInputRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={handleFileUpload} />
          <Button variant="hero" size="lg" onClick={handleAddClick}><Plus className="w-5 h-5 mr-2" /> Add Student</Button>
        </div>
      </motion.div>

      {teachers.length === 0 && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 p-4 rounded-xl bg-destructive/15 border border-destructive/30 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-destructive shrink-0" />
          <p className="text-sm font-body text-white/80">
            <strong className="text-destructive">No teachers found.</strong> You must create at least one teacher before enrolling students.
          </p>
        </motion.div>
      )}

      {/* Bulk Upload Preview */}
      {showBulkUpload && bulkPreview.length > 0 && (
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg font-bold text-white flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-neon-green" />
              Bulk Upload Preview ({bulkPreview.length} students)
            </h2>
            <Button variant="ghost" size="icon" onClick={() => { setShowBulkUpload(false); setBulkPreview([]); }}><X className="w-5 h-5" /></Button>
          </div>
          <div className="overflow-x-auto mb-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-white/50 border-b border-white/10">
                  <th className="text-left py-2 px-3">#</th>
                  <th className="text-left py-2 px-3">Name</th>
                  <th className="text-left py-2 px-3">Father Name</th>
                  <th className="text-left py-2 px-3">Class</th>
                  <th className="text-left py-2 px-3">Section</th>
                  <th className="text-left py-2 px-3">Roll No</th>
                  <th className="text-left py-2 px-3">Teacher</th>
                </tr>
              </thead>
              <tbody>
                {bulkPreview.map((row, i) => (
                  <tr key={i} className="border-b border-white/5 text-white/80">
                    <td className="py-2 px-3 text-white/40">{i + 1}</td>
                    <td className="py-2 px-3">{row["Student Name"]}</td>
                    <td className="py-2 px-3">{row["Father Name"]}</td>
                    <td className="py-2 px-3">{normalizeClass(String(row["Class"] || ""))}</td>
                    <td className="py-2 px-3">{row["Section"]}</td>
                    <td className="py-2 px-3">{row["Roll No"]}</td>
                    <td className="py-2 px-3">{row["Teacher Name"] || <span className="text-white/30 italic">Auto</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => { setShowBulkUpload(false); setBulkPreview([]); }}>Cancel</Button>
            <Button variant="hero" onClick={processBulkUpload}>
              <Upload className="w-4 h-4 mr-2" /> Confirm & Create {bulkPreview.length} Students
            </Button>
          </div>
        </motion.div>
      )}

      {showForm && (
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-lg font-bold text-white">New Student</h2>
            <Button variant="ghost" size="icon" onClick={() => setShowForm(false)}><X className="w-5 h-5" /></Button>
          </div>
          <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-white/80 font-body font-medium">Student Name *</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Full name" className="bg-white/10 border-white/20 text-white placeholder:text-white/40" />
            </div>
            <div className="space-y-2">
              <Label className="text-white/80 font-body font-medium">Father's Name *</Label>
              <Input value={form.fatherName} onChange={(e) => setForm({ ...form, fatherName: e.target.value })} placeholder="Father's name" className="bg-white/10 border-white/20 text-white placeholder:text-white/40" />
            </div>
            <div className="space-y-2">
              <Label className="text-white/80 font-body font-medium">Class *</Label>
              <select value={form.class} onChange={(e) => setForm({ ...form, class: e.target.value, teacherId: "" })} className="w-full rounded-lg bg-white/10 border border-white/20 text-white px-3 py-2 text-sm">
                <option value="" className="bg-cyber-dark">Select class</option>
                {CLASS_OPTIONS.map((c) => <option key={c} value={c} className="bg-cyber-dark">{c}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <Label className="text-white/80 font-body font-medium">Section *</Label>
              <select value={form.section} onChange={(e) => setForm({ ...form, section: e.target.value })} className="w-full rounded-lg bg-white/10 border border-white/20 text-white px-3 py-2 text-sm">
                <option value="" className="bg-cyber-dark">Select section</option>
                {SECTION_OPTIONS.map((s) => <option key={s} value={s} className="bg-cyber-dark">{s}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <Label className="text-white/80 font-body font-medium">Roll Number *</Label>
              <Input value={form.rollNo} onChange={(e) => setForm({ ...form, rollNo: e.target.value })} placeholder="Roll number" className="bg-white/10 border-white/20 text-white placeholder:text-white/40" />
            </div>
            <div className="space-y-2">
              <Label className="text-white/80 font-body font-medium">Assign Teacher * {!form.class && <span className="text-white/40">(select class first)</span>}</Label>
              <select value={form.teacherId} onChange={(e) => setForm({ ...form, teacherId: e.target.value })} disabled={!form.class} className="w-full rounded-lg bg-white/10 border border-white/20 text-white px-3 py-2 text-sm disabled:opacity-40">
                <option value="" className="bg-cyber-dark">{form.class ? (filteredTeachers.length === 0 ? "No teachers for this class" : "Select teacher") : "Select class first"}</option>
                {filteredTeachers.map((t) => <option key={t.id} value={t.id} className="bg-cyber-dark">{t.firstName} {t.lastName} ({t.classes.join(", ")})</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <Label className="text-white/80 font-body font-medium">Username (auto if blank)</Label>
              <Input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} placeholder="Auto-generated if left blank" className="bg-white/10 border-white/20 text-white placeholder:text-white/40" />
            </div>
            <div className="space-y-2">
              <Label className="text-white/80 font-body font-medium">Password (auto if blank)</Label>
              <Input value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Auto-generated if left blank" className="bg-white/10 border-white/20 text-white placeholder:text-white/40" />
            </div>
            <div className="md:col-span-2 flex justify-end gap-3 mt-4">
              <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button type="submit" variant="hero" disabled={isSubmitting}>{isSubmitting ? "Creating..." : "Create Student"}</Button>
            </div>
          </form>
        </motion.div>
      )}

      {students.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-12 text-center">
          <GraduationCap className="w-16 h-16 text-white/30 mx-auto mb-4" />
          <p className="text-white/50 font-body">No students enrolled yet</p>
        </motion.div>
      ) : (
        <div className="space-y-2">
          {students.map((s, i) => (
            <motion.div key={s.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }} className="glass-card p-4">
              {editingId === s.id ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <Input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} placeholder="Name" className="bg-white/10 border-white/20 text-white" />
                    <Input value={editForm.fatherName} onChange={(e) => setEditForm({ ...editForm, fatherName: e.target.value })} placeholder="Father's name" className="bg-white/10 border-white/20 text-white" />
                    <Input value={editForm.rollNo} onChange={(e) => setEditForm({ ...editForm, rollNo: e.target.value })} placeholder="Roll No" className="bg-white/10 border-white/20 text-white" />
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="hero" onClick={() => saveEdit(s.id)}>Save</Button>
                    <Button size="sm" variant="ghost" onClick={() => setEditingId(null)}>Cancel</Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="font-body font-bold text-white">{s.name}</span>
                    <span className="text-white/50 text-xs">@{s.username}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex gap-3 text-xs text-white/60">
                      <span className="px-2 py-0.5 rounded bg-neon-green/15 text-neon-green font-medium">{s.class} ({s.section || "A"})</span>
                      <span>Roll: {s.rollNo}</span>
                      <span className="text-white/40">Teacher: {getTeacherName(s.teacherId)}</span>
                    </div>
                    <Button variant="ghost" size="icon" className="text-white/30 hover:text-neon-blue shrink-0" onClick={() => startEdit(s)}>
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-white/30 hover:text-destructive shrink-0" onClick={() => handleDelete(s.id, s.name)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SchoolStudents;
