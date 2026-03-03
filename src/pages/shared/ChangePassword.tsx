import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock } from "lucide-react";
import { toast } from "sonner";

const ChangePassword = () => {
  const { user, changePassword, verifyPin, verifySecurityAnswer, getSecurityQuestion, hasSecuritySetup } = useAuth();
  const [method, setMethod] = useState<"old" | "pin" | "security" | null>(null);
  const [oldPassword, setOldPassword] = useState("");
  const [pin, setPin] = useState("");
  const [securityAnswer, setSecurityAnswer] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [securityQuestion, setSecurityQuestion] = useState<string | null>(null);
  const [setupDone, setSetupDone] = useState(false);

  useEffect(() => {
    const load = async () => {
      setSetupDone(await hasSecuritySetup());
      setSecurityQuestion(await getSecurityQuestion());
    };
    load();
  }, [hasSecuritySetup, getSecurityQuestion]);

  const handleChange = async () => {
    if (!newPassword || newPassword.length < 4) { toast.error("New password must be at least 4 characters"); return; }
    if (method === "old") {
      if (await changePassword(newPassword, oldPassword)) { toast.success("Password changed!"); reset(); }
      else toast.error("Failed to change password");
    } else if (method === "pin") {
      if (await verifyPin(pin)) {
        if (await changePassword(newPassword)) { toast.success("Password changed via PIN!"); reset(); }
      } else toast.error("Incorrect PIN");
    } else if (method === "security") {
      const result = await verifySecurityAnswer(securityAnswer);
      if (result.valid) {
        if (await changePassword(newPassword)) { toast.success("Password changed via security question!"); reset(); }
      } else toast.error("Incorrect security answer");
    }
  };

  const reset = () => { setMethod(null); setOldPassword(""); setPin(""); setSecurityAnswer(""); setNewPassword(""); };

  const roleLabel = user?.role === "admin" ? "Admin" : user?.role === "school" ? "School" : user?.role === "teacher" ? "Teacher" : "Student";

  return (
    <div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="font-display text-3xl font-bold mb-1"><span className="text-gradient-purple">{roleLabel}</span> Change Password</h1>
        <p className="text-white/60 font-body mb-8">Update your account password</p>
      </motion.div>
      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="glass-card p-6 max-w-lg">
        <h2 className="font-display text-lg font-bold mb-4 flex items-center gap-2 text-white"><Lock className="w-5 h-5 text-neon-blue" /> Change Password</h2>
        {!method ? (
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" onClick={() => setMethod("old")}>Using Old Password</Button>
            {setupDone && (
              <>
                <Button variant="outline" onClick={() => setMethod("pin")}>Using Secret PIN</Button>
                <Button variant="outline" onClick={() => setMethod("security")}>Using Security Question</Button>
              </>
            )}
            {!setupDone && (
              <p className="text-white/40 text-sm font-body mt-2 w-full">
                Complete your security setup from the dashboard to enable PIN and security question recovery.
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {method === "old" && (
              <div className="space-y-2">
                <Label className="text-white/80 font-body font-medium">Old Password</Label>
                <Input type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} className="bg-white/10 border-white/20 text-white placeholder:text-white/40" />
              </div>
            )}
            {method === "pin" && (
              <div className="space-y-2">
                <Label className="text-white/80 font-body font-medium">Your Secret PIN</Label>
                <Input type="password" value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 8))} className="bg-white/10 border-white/20 text-white placeholder:text-white/40" placeholder="Enter your PIN" />
              </div>
            )}
            {method === "security" && (
              <div className="space-y-2">
                <Label className="text-white/80 font-body font-medium">{securityQuestion || "Loading..."}</Label>
                <Input value={securityAnswer} onChange={(e) => setSecurityAnswer(e.target.value)} className="bg-white/10 border-white/20 text-white placeholder:text-white/40" placeholder="Your answer" />
              </div>
            )}
            <div className="space-y-2">
              <Label className="text-white/80 font-body font-medium">New Password</Label>
              <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="bg-white/10 border-white/20 text-white placeholder:text-white/40" />
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

export default ChangePassword;
