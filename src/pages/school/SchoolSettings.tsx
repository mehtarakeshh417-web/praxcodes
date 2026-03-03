import { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useData } from "@/contexts/DataContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings, Plus, X, GripVertical } from "lucide-react";
import { toast } from "sonner";
import ChangePassword from "@/pages/shared/ChangePassword";

const DEFAULT_SECTIONS = ["A", "B", "C", "D", "E"];

const SchoolSettings = () => {
  const { user } = useAuth();
  const { getSchool, updateSchool } = useData();
  const schoolId = user?.id || "";
  const school = getSchool(schoolId);

  const [sections, setSections] = useState<string[]>(
    school?.sections?.length ? school.sections : [...DEFAULT_SECTIONS]
  );
  const [newSection, setNewSection] = useState("");

  const handleAddSection = () => {
    const trimmed = newSection.trim();
    if (!trimmed) return;
    if (sections.some((s) => s.toLowerCase() === trimmed.toLowerCase())) {
      toast.error("Section already exists");
      return;
    }
    setSections([...sections, trimmed]);
    setNewSection("");
  };

  const handleRemoveSection = (idx: number) => {
    if (sections.length <= 1) {
      toast.error("Must have at least one section");
      return;
    }
    setSections(sections.filter((_, i) => i !== idx));
  };

  const handleSaveSections = () => {
    updateSchool(schoolId, { sections });
    toast.success("Sections updated successfully!");
  };

  const handleResetSections = () => {
    setSections([...DEFAULT_SECTIONS]);
  };

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="font-display text-3xl font-bold mb-1">
          <span className="text-gradient-brand">School</span> Settings
        </h1>
        <p className="text-white/60 font-body">Customize your school configuration</p>
      </motion.div>

      {/* Section Names Configuration */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neon-blue to-neon-green flex items-center justify-center">
            <Settings className="w-5 h-5 text-cyber-darker" />
          </div>
          <div>
            <h2 className="font-display text-lg font-bold text-white">Section Names</h2>
            <p className="text-white/50 text-sm font-body">Customize section names (e.g., A, B, C or Lotus, Rose, Tulip)</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          {sections.map((section, idx) => (
            <div key={idx} className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/10 border border-white/20 text-white text-sm group">
              <GripVertical className="w-3 h-3 text-white/30" />
              <span className="font-medium">{section}</span>
              <button
                onClick={() => handleRemoveSection(idx)}
                className="ml-1 text-white/30 hover:text-destructive transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>

        <div className="flex gap-2 mb-4">
          <Input
            value={newSection}
            onChange={(e) => setNewSection(e.target.value)}
            placeholder="Add section name (e.g., Lotus)"
            className="bg-white/10 border-white/20 text-white placeholder:text-white/40 max-w-xs"
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddSection())}
          />
          <Button variant="glass" size="sm" onClick={handleAddSection}>
            <Plus className="w-4 h-4 mr-1" /> Add
          </Button>
        </div>

        <div className="flex gap-3">
          <Button variant="hero" size="sm" onClick={handleSaveSections}>
            Save Sections
          </Button>
          <Button variant="ghost" size="sm" onClick={handleResetSections}>
            Reset to Default (A-E)
          </Button>
        </div>
      </motion.div>

      {/* Change Password Section */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <ChangePassword />
      </motion.div>
    </div>
  );
};

export default SchoolSettings;
