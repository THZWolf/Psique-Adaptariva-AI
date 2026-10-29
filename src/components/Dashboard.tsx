import { motion } from "motion/react";
import { Terminal, Cpu, Activity, Zap, Brain, Settings, Database, Network } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { INITIAL_STATE, updateComputationalValue, evolvePersonality, balanceProcesses, type SystemState, type PsychicNucleus } from "@/lib/ai-logic";
import { generateAdaptiveResponse } from "@/services/geminiService";

export default function Dashboard() {
  const [state, setState] = useState<SystemState>(INITIAL_STATE);
  const [messages, setMessages] = useState<{ role: 'user' | 'ai', content: string }[]>([]);
  const [input, setInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isProcessing) return;

    const userMessage = input;
    setInput("");
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsProcessing(true);

    // Update internal logic
    const entryBytes = new Blob([userMessage]).size;
    const newState = updateComputationalValue(state, entryBytes);
    const withBalanced = { ...newState, ...balanceProcesses(newState) };
    const evolved = { ...withBalanced, personality: evolvePersonality(withBalanced.personality, withBalanced.nucleus) };
    
    // Simulate nucleus update based on interaction (randomly nudge for now)
    evolved.nucleus = {
        i: Math.min(1, Math.max(0, evolved.nucleus.i + (Math.random() - 0.5) * 0.1)),
        e: Math.min(1, Math.max(0, evolved.nucleus.e + (Math.random() - 0.5) * 0.1)),
        l: Math.min(1, Math.max(0, evolved.nucleus.l + (Math.random() - 0.5) * 0.1)),
        m: Math.min(1, Math.max(0, evolved.nucleus.m + (Math.random() - 0.5) * 0.1)),
        c: Math.min(1, Math.max(0, evolved.nucleus.c + (Math.random() - 0.5) * 0.1)),
    };

    setState(evolved);

    const response = await generateAdaptiveResponse(userMessage, evolved);
    setMessages(prev => [...prev, { role: 'ai', content: response || "..." }]);
    setIsProcessing(false);
  };

  return (
    <div className="min-h-screen bg-bg text-ink grid-bg flex flex-col md:flex-row border-line border">
      {/* Sidebar - System Monitoring */}
      <aside className="w-full md:w-80 border-r border-line bg-white flex flex-col gap-8 p-6">
        <div>
          <div className="flex items-center gap-2 mb-6">
            <Cpu className="text-black h-5 w-5" />
            <h2 className="text-[10px] uppercase tracking-widest text-gray-400 font-bold italic">System Monitoring</h2>
          </div>
          
          <div className="space-y-6">
            <StatItem label="V_TOTAL (VALOR)" value={state.vAccumulated.toFixed(2)} subValue="UNID. COMPUTACIONAL" color="text-black" />
            <StatItem label="ENERGY (STORAGE)" value={state.energy.toFixed(1)} subValue="QUIBYTES DISP." color="text-blue-600" />
            
            <div className="pt-4 border-t border-line">
              <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase mb-2">
                <span>P1 ACTIVE</span>
                <span>P2 SHADOW</span>
              </div>
              <div className="h-2 w-full bg-gray-100 border border-gray-200 rounded-full overflow-hidden flex">
                <motion.div 
                  className="bg-p1 h-full shadow-sm"
                  animate={{ width: `${state.p1}%` }} 
                />
                <motion.div 
                  className="bg-p2 h-full shadow-sm"
                  animate={{ width: `${state.p2}%` }} 
                />
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-4 text-gray-400">
            <Brain className="h-4 w-4" />
            <h2 className="text-[10px] uppercase tracking-widest font-bold italic">Personality Matrix</h2>
          </div>
          <div className="space-y-3">
            {Object.entries(state.personality).map(([trait, val]) => (
              <TraitSlider key={trait} label={trait} value={val} />
            ))}
          </div>
        </div>

        <div className="mt-auto pt-6 border-t border-line">
          <div className="flex items-center gap-2 opacity-30">
            <Network className="h-4 w-4" />
            <span className="font-mono text-[10px]">LINK-NEURAL ACTIVE</span>
          </div>
        </div>
      </aside>

      {/* Main Content - Core Psyche Interface */}
      <main className="flex-1 flex flex-col relative overflow-hidden bg-[#F5F5F5]">
        {/* Header */}
        <header className="h-16 border-b border-line flex items-center justify-between px-8 bg-white shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 bg-black rounded flex items-center justify-center text-white font-bold">P</div>
            <h1 className="font-bold text-lg tracking-tight italic uppercase">PSIQUE-AI</h1>
            <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
          </div>
          <div className="flex gap-4">
            <Activity className="h-4 w-4 text-gray-400" />
            <Settings className="h-4 w-4 text-gray-400 hover:text-black cursor-pointer transition-colors" />
          </div>
        </header>

        {/* Chat Area */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto p-8 space-y-6 font-sans text-sm selection:bg-blue-100"
        >
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 text-center space-y-4">
              <Brain className="h-12 w-12 opacity-20" />
              <p className="text-[10px] uppercase font-bold tracking-widest">Aguardando Input de Dados...<br/>Sistema Ready</p>
            </div>
          )}
          {messages.map((m, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[80%] p-4 border rounded shadow-sm ${m.role === 'user' ? 'border-gray-300 bg-white' : 'border-blue-200 bg-blue-50/50 text-blue-900'}`}>
                <div className="flex items-center gap-2 mb-2 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  {m.role === 'user' ? <Database className="h-3 w-3" /> : <Terminal className="h-3 w-3 text-blue-600" />}
                  <span>{m.role === 'user' ? 'Input Stream' : 'Output Logic'}</span>
                </div>
                <div className="leading-relaxed whitespace-pre-wrap font-sans text-gray-800">
                  {m.content}
                </div>
              </div>
            </motion.div>
          ))}
          {isProcessing && (
            <div className="flex justify-start">
               <div className="max-w-[80%] p-4 border border-gray-200 bg-white rounded shadow-sm animate-pulse">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Processando...</span>
               </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <footer className="p-8 border-t border-line bg-white shadow-[0_-2px_10px_rgba(0,0,0,0.02)]">
          <div className="max-w-4xl mx-auto relative">
             <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
               <Zap className="h-4 w-4" />
             </div>
             <input 
               type="text"
               value={input}
               onChange={(e) => setInput(e.target.value)}
               onKeyDown={(e) => e.key === 'Enter' && handleSend()}
               placeholder="INSERIR DADOS (BYTES)..."
               className="w-full bg-gray-50 border border-gray-300 rounded-full pl-12 pr-4 py-3 font-sans text-sm focus:outline-none focus:border-blue-500 focus:bg-white transition-all shadow-inner"
               disabled={isProcessing}
             />
             <button 
               onClick={handleSend}
               className="absolute right-2 top-1/2 -translate-y-1/2 bg-black text-white px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider hover:bg-gray-800 transition-colors"
             >
               Commit
             </button>
          </div>
        </footer>

        {/* Nucleus HUD Overlay */}
        <div className="absolute top-24 right-8 pointer-events-none hidden lg:block">
           <div className="p-4 border border-gray-300 bg-white rounded shadow-lg space-y-4 w-52">
              <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest italic flex items-center gap-2">
                <Settings className="h-3 w-3" /> Nucleus Configuration
              </h3>
              {(Object.entries(state.nucleus) as [keyof PsychicNucleus, number][]).map(([k, v]) => (
                <div key={k} className="flex items-center gap-3">
                   <span className="text-[9px] w-4 font-bold text-gray-500 uppercase">{k}</span>
                   <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <motion.div 
                        className="bg-blue-600 h-full"
                        animate={{ width: `${v * 100}%` }}
                      />
                   </div>
                   <span className="text-[9px] font-mono text-gray-400">{(v * 100).toFixed(0)}</span>
                </div>
              ))}
           </div>
        </div>
      </main>
    </div>
  );
}

function StatItem({ label, value, subValue, color }: { label: string, value: string, subValue: string, color: string }) {
  return (
    <div className="space-y-1">
      <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest italic">{label}</div>
      <div className={`text-2xl font-bold font-sans ${color} tracking-tight`}>{value}</div>
      <div className="text-[10px] font-medium text-gray-500 mt-1 uppercase tracking-tighter">{subValue}</div>
    </div>
  );
}

function TraitSlider({ label, value }: { label: string, value: number }) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-[10px] uppercase font-bold text-gray-400 tracking-wider">
        <span>{label}</span>
        <span className="font-mono text-black">{Math.round(value * 100)}%</span>
      </div>
      <div className="h-1.5 w-full bg-gray-100 border border-gray-200 rounded-full overflow-hidden">
        <motion.div 
          className="bg-black h-full shadow-sm"
          animate={{ width: `${value * 100}%` }}
        />
      </div>
    </div>
  );
}
