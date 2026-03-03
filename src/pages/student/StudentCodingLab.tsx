import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Code, Play, RotateCcw, Palette, Terminal, Gamepad2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";

// HTML/CSS/JS Editor
const HtmlEditor = () => {
  const [html, setHtml] = useState("<!DOCTYPE html>\n<html>\n<head>\n  <style>\n    body { font-family: Arial; text-align: center; padding: 40px; background: #f0f8ff; }\n    h1 { color: #2563eb; }\n  </style>\n</head>\n<body>\n  <h1>Hello, World!</h1>\n  <p>Edit this code and click Run!</p>\n</body>\n</html>");
  const [output, setOutput] = useState("");

  const run = () => setOutput(html);
  const reset = () => { setHtml("<!DOCTYPE html>\n<html>\n<body>\n  <h1>Hello!</h1>\n</body>\n</html>"); setOutput(""); };

  return (
    <div className="grid md:grid-cols-2 gap-4 h-[500px]">
      <div className="flex flex-col">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-white/50 font-body uppercase tracking-wider">HTML / CSS / JS Editor</span>
          <div className="flex gap-2">
            <Button size="sm" variant="ghost" onClick={reset} className="text-white/40 hover:text-white"><RotateCcw className="w-3.5 h-3.5 mr-1" /> Reset</Button>
            <Button size="sm" onClick={run} className="bg-neon-green/20 text-neon-green border border-neon-green/30 hover:bg-neon-green/30"><Play className="w-3.5 h-3.5 mr-1" /> Run</Button>
          </div>
        </div>
        <textarea
          value={html}
          onChange={(e) => setHtml(e.target.value)}
          className="flex-1 bg-[hsl(220,30%,10%)] border border-white/10 rounded-xl p-4 font-mono text-sm text-neon-green resize-none focus:outline-none focus:border-primary/50"
          spellCheck={false}
        />
      </div>
      <div className="flex flex-col">
        <span className="text-xs text-white/50 font-body uppercase tracking-wider mb-2">Preview</span>
        <div className="flex-1 bg-white rounded-xl overflow-hidden">
          {output ? (
            <iframe srcDoc={output} className="w-full h-full border-0" title="HTML Preview" sandbox="allow-scripts" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">Click "Run" to see output</div>
          )}
        </div>
      </div>
    </div>
  );
};

// Python Editor (simulated)
const PythonEditor = () => {
  const [code, setCode] = useState('# Python Practice\nprint("Hello, World!")\n\nname = "Student"\nprint(f"Welcome, {name}!")\n\nfor i in range(1, 6):\n    print(f"Count: {i}")');
  const [output, setOutput] = useState("");

  const run = () => {
    try {
      const lines: string[] = [];
      const variables: Record<string, string> = {};

      code.split("\n").forEach((line) => {
        const varMatch = line.match(/^(\w+)\s*=\s*["'](.+?)["']/);
        if (varMatch) variables[varMatch[1]] = varMatch[2];
      });

      const forMatch = code.match(/for\s+(\w+)\s+in\s+range\((\d+),?\s*(\d+)?\):\s*\n\s+print/);

      code.split("\n").forEach((line) => {
        const trimmed = line.trim();
        if (trimmed.startsWith("#") || trimmed === "" || trimmed.startsWith("for ") || trimmed.startsWith("name ") || trimmed.startsWith("import ")) return;

        const pMatch = trimmed.match(/print\s*\(\s*(?:f"([^"]*)"|\s*"([^"]*)"|\s*'([^']*)')\s*\)/);
        if (pMatch) {
          let text = pMatch[1] || pMatch[2] || pMatch[3] || "";
          text = text.replace(/\{(\w+)\}/g, (_, v) => variables[v] || v);
          lines.push(text);
        }
      });

      if (forMatch) {
        const varName = forMatch[1];
        const start = parseInt(forMatch[2]);
        const end = forMatch[3] ? parseInt(forMatch[3]) : start;
        const realStart = forMatch[3] ? start : 0;
        const realEnd = forMatch[3] ? end : start;
        for (let i = realStart; i < realEnd; i++) {
          const loopLine = code.split("\n").find((l) => l.trim().startsWith("print") && l.match(/\{.*\}/));
          if (loopLine) {
            const innerMatch = loopLine.trim().match(/print\s*\(\s*f"([^"]*)".*\)/);
            if (innerMatch) {
              lines.push(innerMatch[1].replace(`{${varName}}`, String(i)));
            }
          }
        }
      }

      setOutput(lines.length > 0 ? lines.join("\n") : "# No output generated. Try using print() statements.");
    } catch {
      setOutput("Error: Could not interpret. This is a simplified Python simulator.");
    }
  };

  return (
    <div className="grid md:grid-cols-2 gap-4 h-[500px]">
      <div className="flex flex-col">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-white/50 font-body uppercase tracking-wider">Python Editor (Simulator)</span>
          <Button size="sm" onClick={run} className="bg-neon-green/20 text-neon-green border border-neon-green/30 hover:bg-neon-green/30"><Play className="w-3.5 h-3.5 mr-1" /> Run</Button>
        </div>
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="flex-1 bg-[hsl(220,30%,10%)] border border-white/10 rounded-xl p-4 font-mono text-sm text-neon-green resize-none focus:outline-none focus:border-primary/50"
          spellCheck={false}
        />
      </div>
      <div className="flex flex-col">
        <span className="text-xs text-white/50 font-body uppercase tracking-wider mb-2">Output</span>
        <div className="flex-1 bg-[hsl(220,30%,6%)] border border-white/10 rounded-xl p-4 font-mono text-sm text-white/80 whitespace-pre-wrap overflow-auto">
          {output || "Click 'Run' to execute your Python code"}
        </div>
      </div>
    </div>
  );
};

// Scratch Editor - using TurboWarp (open-source, embeddable Scratch editor)
const ScratchEditor = () => (
  <div className="h-[600px] rounded-xl overflow-hidden border border-white/10">
    <iframe
      src="https://turbowarp.org/editor?fps=30&clones=Infinity&offscreen&size=480x360"
      className="w-full h-full border-0"
      title="Scratch Editor"
      allow="clipboard-read; clipboard-write"
      sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
    />
  </div>
);

// Scratch Jr - embedded from codejr.org
const ScratchJrEditor = () => (
  <div className="space-y-4">
    <div className="h-[600px] rounded-xl overflow-hidden border border-white/10">
      <iframe
        src="https://codejr.org/scratchjr/index.html"
        className="w-full h-full border-0"
        title="Scratch Jr Editor"
        allow="clipboard-read; clipboard-write"
        sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
      />
    </div>
    <p className="text-white/40 text-xs font-body text-center">Powered by CodeJr.org — a free Scratch Jr web editor</p>
  </div>
);

// Determine which editors to show based on class number
const getAvailableEditors = (className?: string): string[] => {
  if (!className) return ["scratchjr"];
  const numMatch = className.match(/(\d+)/);
  const classNum = numMatch ? parseInt(numMatch[1]) : 1;

  if (classNum <= 2) return ["scratchjr"];
  if (classNum <= 5) return ["scratch", "scratchjr"];
  if (classNum === 6) return ["html", "scratch"];
  if (classNum === 7) return ["html", "python", "scratch"];
  return ["html", "python", "scratch"]; // Class 8+
};

const editorMeta: Record<string, { label: string; icon: React.ElementType; component: React.FC }> = {
  html: { label: "HTML/CSS", icon: Code, component: HtmlEditor },
  python: { label: "Python", icon: Terminal, component: PythonEditor },
  scratch: { label: "Scratch", icon: Gamepad2, component: ScratchEditor },
  scratchjr: { label: "Scratch Jr", icon: Palette, component: ScratchJrEditor },
};

const StudentCodingLab = () => {
  const { user } = useAuth();
  const editors = useMemo(() => getAvailableEditors(user?.className), [user?.className]);

  return (
    <div>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="font-display text-3xl font-bold mb-1"><span className="text-gradient-brand">Coding Lab</span></h1>
        <p className="text-white/60 font-body mb-6">Practice coding with real editors</p>
      </motion.div>

      <Tabs defaultValue={editors[0]} className="w-full">
        <TabsList className="bg-white/5 border border-white/10 mb-6 flex-wrap h-auto gap-1 p-1">
          {editors.map((key) => {
            const meta = editorMeta[key];
            const Icon = meta.icon;
            return (
              <TabsTrigger key={key} value={key} className="data-[state=active]:bg-primary/20 data-[state=active]:text-primary text-white/60 font-body gap-1">
                <Icon className="w-3.5 h-3.5" /> {meta.label}
              </TabsTrigger>
            );
          })}
        </TabsList>

        {editors.map((key) => {
          const meta = editorMeta[key];
          const Comp = meta.component;
          return (
            <TabsContent key={key} value={key}>
              <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
                <Comp />
              </motion.div>
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
};

export default StudentCodingLab;
