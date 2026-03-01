import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import ParticleBackground from "@/components/ParticleBackground";
import heroBg from "@/assets/hero-bg.jpg";
import { Code, Gamepad2, GraduationCap, Shield, Sparkles, Trophy, Zap } from "lucide-react";

const features = [
  { icon: GraduationCap, title: "Smart Curriculum", desc: "Class-wise structured CS education from Class 1 to 8", color: "neon-glow-blue" },
  { icon: Gamepad2, title: "Gamified Learning", desc: "XP, levels, badges, and leaderboards keep students engaged", color: "neon-glow-green" },
  { icon: Code, title: "Live Coding", desc: "Built-in sandbox for HTML, CSS, and Python projects", color: "neon-glow-purple" },
  { icon: Zap, title: "AI-Powered", desc: "Auto-generate assignments and detect weak topics", color: "neon-glow-orange" },
  { icon: Shield, title: "Multi-Tenant", desc: "Complete data isolation between schools", color: "neon-glow-blue" },
  { icon: Trophy, title: "Certifications", desc: "Auto-generated certificates with QR verification", color: "neon-glow-green" },
];

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen gradient-hero text-white overflow-hidden">
      <ParticleBackground />

      {/* Navbar */}
      <motion.nav
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="relative z-10 flex items-center justify-between px-6 md:px-12 py-4"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neon-blue to-neon-green flex items-center justify-center neon-glow-blue">
            <Sparkles className="w-5 h-5 text-cyber-darker" />
          </div>
          <span className="font-display text-xl font-bold text-gradient-brand">PraxCodes</span>
        </div>
        <Button variant="hero" size="lg" onClick={() => navigate("/login")}>
          Login
        </Button>
      </motion.nav>

      {/* Hero */}
      <section className="relative z-10 container mx-auto px-6 pt-12 pb-20 md:pt-20 md:pb-32">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ x: -60, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <div className="inline-flex items-center gap-2 glass-card px-4 py-2 mb-6">
              <Zap className="w-4 h-4 text-neon-green" />
              <span className="text-sm font-body text-neon-green">The Future of Computer Education</span>
            </div>
            <h1 className="font-display text-4xl md:text-6xl font-bold leading-tight mb-6">
              <span className="text-gradient-brand">Gamified</span>{" "}
              <span className="text-white">Computer</span>
              <br />
              <span className="text-white">Education for</span>{" "}
              <span className="text-gradient-fire">Schools</span>
            </h1>
            <p className="font-body text-lg text-white/70 mb-8 max-w-lg">
              PraxCodes transforms computer science teaching with XP systems, AI assignments, live coding sandboxes, and class-wise curriculum — from Class 1 to 8.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button variant="hero" size="xl" onClick={() => navigate("/login")}>
                Get Started
              </Button>
              <Button variant="glass" size="xl">
                Watch Demo
              </Button>
            </div>
          </motion.div>

          <motion.div
            initial={{ x: 60, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="relative"
          >
            <div className="relative rounded-2xl overflow-hidden neon-glow-blue">
              <img src={heroBg} alt="PraxCodes gamified classroom" className="w-full rounded-2xl" />
              <div className="absolute inset-0 bg-gradient-to-t from-cyber-darker/60 to-transparent" />
            </div>
            {/* Floating stat cards */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="absolute -top-4 -right-4 glass-card px-4 py-3 neon-glow-green"
            >
              <div className="text-neon-green font-display text-2xl font-bold">1250+</div>
              <div className="text-xs text-white/60">Active Students</div>
            </motion.div>
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
              className="absolute -bottom-4 -left-4 glass-card px-4 py-3 neon-glow-purple"
            >
              <div className="text-neon-purple font-display text-2xl font-bold">50+</div>
              <div className="text-xs text-white/60">Schools Onboarded</div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="relative z-10 container mx-auto px-6 pb-20">
        <motion.h2
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="font-display text-3xl md:text-4xl font-bold text-center mb-12"
        >
          <span className="text-gradient-purple">Powerful</span> Features
        </motion.h2>
        <div className="grid md:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ y: 30, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ scale: 1.04 }}
              className={`glass-card p-6 ${f.color} cursor-pointer`}
            >
              <f.icon className="w-10 h-10 text-primary mb-4" />
              <h3 className="font-display text-lg font-bold mb-2">{f.title}</h3>
              <p className="font-body text-white/60 text-sm">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>


      {/* Footer */}
      <footer className="relative z-10 text-center py-8 text-white/30 text-sm font-body border-t border-white/5">
        © 2026 PraxCodes. All rights reserved.
      </footer>
    </div>
  );
};

export default Landing;
