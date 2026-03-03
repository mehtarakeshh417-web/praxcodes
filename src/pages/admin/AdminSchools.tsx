import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { useData } from "@/contexts/DataContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { School, Plus, X, Eye, EyeOff, Trash2, Filter, MapPin } from "lucide-react";
import { toast } from "sonner";
import { INDIAN_STATES, MAJOR_CITIES } from "@/lib/indianStates";

const AdminSchools = () => {
  const { schools, addSchool, deleteSchool } = useData();
  const { addDemoUser, removeDemoUsers } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ name: "", address: "", state: "", city: "", phone: "", username: "", password: "" });
  const [filterState, setFilterState] = useState("");
  const [filterCity, setFilterCity] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredSchools = useMemo(() => {
    return schools.filter((s) => {
      if (filterState && s.state !== filterState) return false;
      if (filterCity && s.city !== filterCity) return false;
      if (searchQuery && !s.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    });
  }, [schools, filterState, filterCity, searchQuery]);

  const availableCities = useMemo(() => {
    if (filterState) {
      const knownCities = MAJOR_CITIES[filterState] || [];
      const schoolCities = schools.filter((s) => s.state === filterState).map((s) => s.city);
      return [...new Set([...knownCities, ...schoolCities])].sort();
    }
    return [...new Set(schools.map((s) => s.city))].sort();
  }, [filterState, schools]);

  const formCities = useMemo(() => {
    return MAJOR_CITIES[form.state] || [];
  }, [form.state]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.address || !form.state || !form.city || !form.phone || !form.username || !form.password) {
      toast.error("All fields are required");
      return;
    }
    const school = addSchool(form);
    addDemoUser(form.username, form.password, {
      id: school.id, username: form.username, role: "school",
      displayName: form.name, schoolName: form.name,
    });
    toast.success(`School "${form.name}" created! Login: ${form.username}`);
    setForm({ name: "", address: "", state: "", city: "", phone: "", username: "", password: "" });
    setShowForm(false);
  };

  const handleDelete = (schoolId: string, schoolName: string) => {
    if (!confirm(`Delete "${schoolName}" and ALL its teachers & students? This cannot be undone.`)) return;
    const removedUsernames = deleteSchool(schoolId);
    removeDemoUsers(removedUsernames);
    toast.success(`School "${schoolName}" and all associated data deleted.`);
  };

  const uniqueStates = useMemo(() => [...new Set(schools.map((s) => s.state).filter(Boolean))].sort(), [schools]);

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

      {/* Filters */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="glass-card p-4 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="w-4 h-4 text-neon-blue" />
          <span className="text-sm font-display font-bold text-white/80">Filters</span>
          {(filterState || filterCity || searchQuery) && (
            <button onClick={() => { setFilterState(""); setFilterCity(""); setSearchQuery(""); }} className="text-xs text-neon-orange hover:text-neon-orange/80 ml-auto">Clear all</button>
          )}
        </div>
        <div className="grid md:grid-cols-3 gap-3">
          <div>
            <select value={filterState} onChange={(e) => { setFilterState(e.target.value); setFilterCity(""); }} className="w-full rounded-lg bg-white/10 border border-white/20 text-white px-3 py-2 text-sm">
              <option value="" className="bg-cyber-dark">All States</option>
              {uniqueStates.map((s) => <option key={s} value={s} className="bg-cyber-dark">{s}</option>)}
            </select>
          </div>
          <div>
            <select value={filterCity} onChange={(e) => setFilterCity(e.target.value)} disabled={!filterState && availableCities.length === 0} className="w-full rounded-lg bg-white/10 border border-white/20 text-white px-3 py-2 text-sm disabled:opacity-40">
              <option value="" className="bg-cyber-dark">All Cities</option>
              {availableCities.map((c) => <option key={c} value={c} className="bg-cyber-dark">{c}</option>)}
            </select>
          </div>
          <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search by name..." className="bg-white/10 border-white/20 text-white placeholder:text-white/40" />
        </div>
        <div className="mt-2 text-xs text-white/40 font-body">
          Showing {filteredSchools.length} of {schools.length} school(s)
        </div>
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
              <Label className="text-white/80 font-body font-medium">State *</Label>
              <select value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value, city: "" })} className="w-full rounded-lg bg-white/10 border border-white/20 text-white px-3 py-2 text-sm">
                <option value="" className="bg-cyber-dark">Select state</option>
                {INDIAN_STATES.map((s) => <option key={s} value={s} className="bg-cyber-dark">{s}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <Label className="text-white/80 font-body font-medium">City *</Label>
              {formCities.length > 0 ? (
                <select value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="w-full rounded-lg bg-white/10 border border-white/20 text-white px-3 py-2 text-sm">
                  <option value="" className="bg-cyber-dark">Select city</option>
                  {formCities.map((c) => <option key={c} value={c} className="bg-cyber-dark">{c}</option>)}
                  <option value="__other" className="bg-cyber-dark">Other (type below)</option>
                </select>
              ) : (
                <Input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="Enter city" className="bg-white/10 border-white/20 text-white placeholder:text-white/40" />
              )}
              {form.city === "__other" && (
                <Input value="" onChange={(e) => setForm({ ...form, city: e.target.value })} placeholder="Type city name" className="bg-white/10 border-white/20 text-white placeholder:text-white/40 mt-2" />
              )}
            </div>
            <div className="space-y-2">
              <Label className="text-white/80 font-body font-medium">Phone Number *</Label>
              <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="Phone number" className="bg-white/10 border-white/20 text-white placeholder:text-white/40" />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label className="text-white/80 font-body font-medium">Address *</Label>
              <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Full address" className="bg-white/10 border-white/20 text-white placeholder:text-white/40" />
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

      {filteredSchools.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card p-12 text-center">
          <School className="w-16 h-16 text-white/30 mx-auto mb-4" />
          <p className="text-white/50 font-body mb-1">{schools.length === 0 ? "No schools registered yet" : "No schools match filters"}</p>
          <p className="text-white/35 font-body text-sm">{schools.length === 0 ? 'Click "Create School" to get started' : "Try adjusting your filters"}</p>
        </motion.div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSchools.map((school, i) => (
            <motion.div key={school.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="glass-card p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neon-blue to-neon-green flex items-center justify-center shrink-0">
                    <School className="w-5 h-5 text-cyber-darker" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-white">{school.name}</h3>
                    <p className="text-white/50 text-xs font-body flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {school.city}{school.state ? `, ${school.state}` : ""}
                    </p>
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
