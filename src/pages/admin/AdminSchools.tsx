import { useState } from "react";
import { motion } from "framer-motion";
import { useData } from "@/contexts/DataContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { School, Plus, X, Eye, EyeOff, Trash2 } from "lucide-react";
import { toast } from "sonner";

const AdminSchools = () => {
  const { schools, addSchool, deleteSchool } = useData();
  const { addDemoUser, removeDemoUsers } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ name: "", address: "", city: "", phone: "", username: "", password: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.address || !form.city || !form.phone || !form.username || !form.password) {
      toast.error("All fields are required");
      return;
    }
    const school = addSchool(form);
    addDemoUser(form.username, form.password, {
      id: school.id, username: form.username, role: "school",
      displayName: form.name, schoolName: form.name,
    });
    toast.success(`School "${form.name}" created! Login: ${form.username}`);
    setForm({ name: "", address: "", city: "", phone: "", username: "", password: "" });
    setShowForm(false);
  };

  const handleDelete = (schoolId: string, schoolName: string) => {
    if (!confirm(`Delete "${schoolName}" and ALL its teachers & students? This cannot be undone.`)) return;
    const removedUsernames = deleteSchool(schoolId);
    removeDemoUsers(removedUsernames);
    toast.success(`School "${schoolName}" and all associated data deleted.`);
  };

  return (
    <div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold mb-1">
            <span className="text-gradient-purple">Schools</span> Management
          </h1>
          <p className="text-white/60 font-body">Create and manage all registered schools</p>
        </div>
        <Button variant="hero" size="lg" onClick={() => setShowForm(true)}>
          <Plus className="w-5 h-5 mr-2" /> Create School
        </Button>
      </motion.div>

      {showForm && (
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display text-lg font-bold text-white">New School Registration</h2>
            <Button variant="ghost" size="icon" onClick={() => setShowForm(false)}><X className="w-5 h-5" /></Button>
          </div>
          <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-white/80 font-body font-medium">School Name *</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Enter school name" className="bg-white/10 border-white/20 text-white placeholder:text-white/40" />
            </div>
            <div className="space-y-2">
              <Label className="text-white/80 font-body font-medium">City *</Label>
              <Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="Enter city" className="bg-white/10 border-white/20 text-white placeholder:text-white/40" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label className="text-white/80 font-body font-medium">Address *</Label>
              <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Full address" className="bg-white/10 border-white/20 text-white placeholder:text-white/40" />
            </div>
            <div className="space-y-2">
              <Label className="text-white/80 font-body font-medium">Phone Number *</Label>
              <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Phone number" className="bg-white/10 border-white/20 text-white placeholder:text-white/40" />
            </div>
            <div className="space-y-2">
              <Label className="text-white/80 font-body font-medium">Login Username *</Label>
              <Input value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} placeholder="School login username" className="bg-white/10 border-white/20 text-white placeholder:text-white/40" />
            </div>
            <div className="space-y-2">
              <Label className="text-white/80 font-body font-medium">Login Password *</Label>
              <div className="relative">
                <Input type={showPassword ? "text" : "password"} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="School login password" className="bg-white/10 border-white/20 text-white placeholder:text-white/40 pr-10" />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white/80">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="md:col-span-2 flex justify-end gap-3 mt-4">
              <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button type="submit" variant="hero">Create School</Button>
            </div>
          </form>
        </motion.div>
      )}

      {schools.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-12 text-center">
          <School className="w-16 h-16 text-white/30 mx-auto mb-4" />
          <p className="text-white/50 font-body mb-1">No schools registered yet</p>
          <p className="text-white/35 font-body text-sm">Click "Create School" to get started</p>
        </motion.div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {schools.map((school, i) => (
            <motion.div key={school.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="glass-card p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neon-blue to-neon-green flex items-center justify-center shrink-0">
                    <School className="w-5 h-5 text-cyber-darker" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-white">{school.name}</h3>
                    <p className="text-white/50 text-xs font-body">{school.city}</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="text-white/30 hover:text-destructive shrink-0" onClick={() => handleDelete(school.id, school.name)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              <div className="space-y-1.5 text-sm text-white/60 font-body">
                <p>📍 {school.address}</p>
                <p>📞 {school.phone}</p>
                <p>👤 Login: <span className="text-neon-green font-medium">{school.username}</span></p>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminSchools;
