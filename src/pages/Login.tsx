import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LogIn, AlertCircle, ShieldCheck } from "lucide-react";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const success = await login(username.trim(), password);
    setLoading(false);
    if (success) {
      navigate("/dashboard");
    } else {
      setError("Invalid credentials. Please try again.");
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center px-4 overflow-hidden">
      {/* Full-screen background image */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: "url('/assets/login-bg.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      />
      {/* Dark overlay so text is readable */}
      <div className="absolute inset-0 z-[1] bg-black/60 backdrop-blur-[2px]" />

      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="glass-card p-10 neon-glow-blue bg-black/40 backdrop-blur-xl border border-white/10">
          {/* Logo & Title */}
          <div className="text-center mb-10">
            <motion.div
              initial={{ y: -10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.4 }}
            >
              <img
                src="/assets/logo.jpg"
                alt="CodeChamps logo"
                className="w-24 h-24 rounded-2xl object-contain mx-auto mb-5 ring-2 ring-primary/30 shadow-lg shadow-primary/20"
              />
            </motion.div>
            <h1 className="font-display text-3xl font-bold text-gradient-brand tracking-wide">CodeChamps</h1>
            <p className="text-white/50 font-body text-sm mt-2">Welcome back — sign in to continue</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-white/70 font-body text-sm">Username</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                className="h-12 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-primary font-body text-base"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-white/70 font-body text-sm">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="h-12 bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-primary font-body text-base"
                required
              />
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 text-destructive text-sm font-body bg-destructive/10 rounded-lg px-3 py-2"
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </motion.div>
            )}

            <Button type="submit" variant="hero" size="lg" className="w-full h-12 text-base" disabled={loading}>
              <LogIn className="w-5 h-5" />
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>

          {/* Security badge */}
          <div className="mt-6 flex items-center justify-center gap-1.5 text-white/30 text-xs font-body">
            <ShieldCheck className="w-3.5 h-3.5" />
            Secured with PIN & security questions
          </div>

          {/* Back link */}
          <div className="mt-4 pt-4 border-t border-white/10 text-center">
            <button onClick={() => navigate("/")} className="text-primary/70 hover:text-primary text-sm font-body transition-colors">
              ← Back to Home
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
