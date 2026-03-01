import { useState } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings, Lock } from "lucide-react";
import { toast } from "sonner";

const SECRET_PIN = "315691";

const AdminSettings = () => {
  const { changeAdminPassword } = useAuth();
  const [method, setMethod] = useState<"old" | "pin" | null>(null);
  const [oldPassword, setOldPassword] = useState("");
  const [pin, setPin] = useState("");
  const [newPassword, setNewPassword] = useState("");

  const handleChange = () => {
    if (!newPassword || newPassword.length < 4) { toast.error("New password must be at least 4 characters"); return; }
    if (method === "old") {
      if (changeAdminPassword(newPassword, oldPassword)) { toast.success("Password changed!"); reset(); }
      else toast.error("Old password is incorrect");
    } else if (method === "pin") {
      if (pin === SECRET_PIN) {
        if (changeAdminPassword(newPassword)) { toast.success("Password changed via PIN!"); reset(); }
      } else toast.error("Incorrect PIN");
    }
  };

  const reset = () => { setMethod(null); setOldPassword(""); setPin(""); setNewPassword(""); };

  return (
    <div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="font-display text-3xl font-bold mb-1"><span className="text-gradient-purple">Admin</span> Settings</h1>
        <p className="text-white/50 font-body mb-8">Manage your account and platform settings</p>
      </motion.div>
      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="glass-card p-6 max-w-lg">
        <h2 className="font-display text-lg font-bold mb-4 flex items-center gap-2"><Lock className="w-5 h-5 text-neon-blue" /> Change Password</h2>
        {!method ? (
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setMethod("old")}>Using Old Password</Button>
            <Button variant="outline" onClick={() => setMethod("pin")}>Using Secret PIN</Button>
          </div>
        ) : (
          <div className="space-y-4">
            {method === "old" && (
              <div className="space-y-2">
                <Label className="text-white/70">Old Password</Label>
                <Input type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} className="bg-white/5 border-white/10 text-white" />
              </div>
            )}
            {method === "pin" && (
              <div className="space-y-2">
                <Label className="text-white/70">Secret PIN</Label>
                <Input type="password" value={pin} onChange={(e) => setPin(e.target.value)} className="bg-white/5 border-white/10 text-white" />
              </div>
            )}
            <div className="space-y-2">
              <Label className="text-white/70">New Password</Label>
              <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="bg-white/5 border-white/10 text-white" />
            </div>
            <div className="flex gap-3">
              <Button variant="ghost" onClick={reset}>Cancel</Button>
              <Button variant="hero" onClick={handleChange}>Update Password</Button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default AdminSettings;
