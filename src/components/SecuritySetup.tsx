import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ShieldCheck } from "lucide-react";
import { toast } from "sonner";

const SECURITY_QUESTIONS = [
  "What is your mother's maiden name?",
  "What was the name of your first pet?",
  "What city were you born in?",
  "What is your favorite book?",
  "What was the name of your first school?",
];

interface SecuritySetupProps {
  onComplete: (pin: string, securityQuestion: string, securityAnswer: string) => void;
}

const SecuritySetup = ({ onComplete }: SecuritySetupProps) => {
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");

  const handleSubmit = () => {
    if (!pin || pin.length < 4 || pin.length > 8) {
      toast.error("PIN must be 4-8 digits");
      return;
    }
    if (!/^\d+$/.test(pin)) {
      toast.error("PIN must contain only digits");
      return;
    }
    if (pin !== confirmPin) {
      toast.error("PINs do not match");
      return;
    }
    if (!question) {
      toast.error("Please select a security question");
      return;
    }
    if (!answer.trim() || answer.trim().length < 2) {
      toast.error("Please provide a valid security answer");
      return;
    }
    onComplete(pin, question, answer.trim().toLowerCase());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm px-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-md glass-card p-8 neon-glow-blue"
      >
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-neon-blue to-neon-green flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="w-7 h-7 text-cyber-darker" />
          </div>
          <h2 className="font-display text-xl font-bold text-white">Security Setup</h2>
          <p className="text-white/50 font-body text-sm mt-1">
            Set up your secret PIN and security question for password recovery
          </p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-white/70 font-body">Create Secret PIN (4-8 digits)</Label>
            <Input
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 8))}
              placeholder="Enter PIN"
              className="bg-white/5 border-white/10 text-white placeholder:text-white/30 font-body"
              maxLength={8}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-white/70 font-body">Confirm PIN</Label>
            <Input
              type="password"
              value={confirmPin}
              onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, "").slice(0, 8))}
              placeholder="Re-enter PIN"
              className="bg-white/5 border-white/10 text-white placeholder:text-white/30 font-body"
              maxLength={8}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-white/70 font-body">Security Question</Label>
            <Select value={question} onValueChange={setQuestion}>
              <SelectTrigger className="bg-white/5 border-white/10 text-white font-body">
                <SelectValue placeholder="Select a question" />
              </SelectTrigger>
              <SelectContent>
                {SECURITY_QUESTIONS.map((q) => (
                  <SelectItem key={q} value={q}>{q}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-white/70 font-body">Your Answer</Label>
            <Input
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Type your answer"
              className="bg-white/5 border-white/10 text-white placeholder:text-white/30 font-body"
            />
          </div>

          <Button variant="hero" size="lg" className="w-full mt-2" onClick={handleSubmit}>
            <ShieldCheck className="w-5 h-5" />
            Complete Setup
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default SecuritySetup;
