import { Button } from "@/components/ui/button";
import { useState, useRef, useEffect } from "react";
import { Play, Activity, CheckCircle2, ShieldAlert, Plus, Trash2, Network, MessageSquare, AlertTriangle, Scale, Target, Eye, Gavel, GitCommit, Home, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Demo() {
  const [incidentText, setIncidentText] = useState(
    "Potential handball in the penalty area. Defender #4's arm was away from their body when the ball struck it. Contact occurred at 63:12. Video available."
  );

  const [players, setPlayers] = useState([
    { id: "1", x: 16.5, y: 50, color: "bg-blue-500", label: "Def #4" },
    { id: "2", x: 22, y: 48, color: "bg-red-500", label: "Attacker" }
  ]);

  const [messages, setMessages] = useState<any[]>([]);
  const [decision, setDecision] = useState<any>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [showGraph, setShowGraph] = useState(false);
  const [isDataFeedOpen, setIsDataFeedOpen] = useState(true);
  const [videoFiles, setVideoFiles] = useState<File[]>([]);
  const wsRef = useRef<WebSocket | null>(null);

  const runEvaluation = async () => {
    setIsRunning(true);
    setMessages([]);
    setDecision(null);
    setIsDataFeedOpen(false); // Auto-collapse data feed when running

    const fullTextContext = incidentText + `\nPlayers involved: ${JSON.stringify(players)}`;
    let incidentData = fullTextContext;
    let inputType = "text";

    if (videoFiles.length > 0) {
      try {
        const paths = [];
        for (const file of videoFiles) {
          const formData = new FormData();
          formData.append("file", file);

          const uploadRes = await fetch("/api/upload", {
            method: "POST",
            body: formData,
          });

          if (!uploadRes.ok) {
            throw new Error(`Failed to upload ${file.name}`);
          }

          const data = await uploadRes.json();
          paths.push(data.path);
        }

        incidentData = JSON.stringify(paths);
        inputType = "video";
      } catch (err: any) {
        console.error("Upload error:", err);
        alert("Failed to upload videos: " + err.message);
        setIsRunning(false);
        setIsDataFeedOpen(true);
        return;
      }
    }

    const wsProtocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${wsProtocol}//${window.location.host}/ws/evaluate`;

    wsRef.current = new WebSocket(wsUrl);

    wsRef.current.onopen = () => {
      wsRef.current?.send(JSON.stringify({
        input_type: inputType,
        incident_data: incidentData,
        text_description: fullTextContext
      }));
    };

    wsRef.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "agent_message") {
        setMessages((prev) => [...prev, data.message]);
        if (data.message.sender === "Chief Referee") {
          setDecision(data.message.structured_data);
        }
      } else if (data.type === "final_decision") {
        // Handled via Chief Referee message
      } else if (data.type === "done" || data.type === "error") {
        setIsRunning(false);
        wsRef.current?.close();
      }
    };

    wsRef.current.onclose = () => setIsRunning(false);
  };

  useEffect(() => {
    return () => {
      if (wsRef.current) wsRef.current.close();
    };
  }, []);

  const renderAgentContent = (msg: any) => {
    const data = msg.structured_data || {};

    const getIcon = (sender: string) => {
      if (sender.includes("Evidence")) return <Eye className="w-5 h-5 text-blue-400" />;
      if (sender.includes("Rules")) return <Scale className="w-5 h-5 text-amber-400" />;
      if (sender.includes("VAR")) return <Target className="w-5 h-5 text-red-400" />;
      if (sender.includes("Devil")) return <AlertTriangle className="w-5 h-5 text-purple-400" />;
      if (sender.includes("Coordinator")) return <Network className="w-5 h-5 text-cyan-400" />;
      if (sender.includes("Parser")) return <Activity className="w-5 h-5 text-slate-400" />;
      if (sender.includes("Reliability")) return <ShieldAlert className="w-5 h-5 text-indigo-400" />;
      if (sender.includes("Asst")) return <MessageSquare className="w-5 h-5 text-[#d4ed31]" />;
      return <MessageSquare className="w-5 h-5 text-white" />;
    };

    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-black/30 backdrop-blur-xl border border-white/5 rounded-3xl overflow-hidden flex flex-col mb-6 shadow-2xl"
      >
        <div className="bg-white/5 px-6 py-4 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {getIcon(msg.sender)}
            <span className="font-bold text-white tracking-wide uppercase text-sm">{msg.sender}</span>
          </div>
          {data.confidence !== undefined && (
            <span className="text-[10px] font-bold uppercase tracking-widest bg-black/50 border border-white/10 px-3 py-1 rounded-full text-white/70">
              CONF: <span className="text-[#d4ed31]">{data.adjusted_confidence ?? data.confidence}%</span>
            </span>
          )}
        </div>

        {data.responding_to && (
          <div className="bg-[#d4ed31]/10 px-6 py-2 border-b border-white/5 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-[#d4ed31]">
            <GitCommit className="w-4 h-4" /> Responding to {data.responding_to}
          </div>
        )}
        {data.target_agent && (
          <div className="bg-red-500/10 px-6 py-2 border-b border-white/5 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-red-400">
            <GitCommit className="w-4 h-4" /> Challenging: {data.target_agent}
          </div>
        )}

        <div className="p-6 space-y-5 text-sm text-white/90">
          {msg.sender === "Incident Parser" && data.conflicts?.length > 0 && (
            <div className="bg-red-500/10 p-4 rounded-2xl border border-red-500/20">
              <p className="font-bold text-red-400 mb-3 flex items-center uppercase tracking-widest text-xs"><AlertTriangle className="w-4 h-4 mr-2" /> Conflict Detected</p>
              <ul className="space-y-3">
                {data.conflicts.map((c: any, i: number) => (
                  <li key={i} className="text-sm">
                    <strong className="text-white">{c.field}:</strong> Text says <span className="italic text-white/60">"{c.text_says}"</span>, Video shows <span className="italic text-white/60">"{c.video_says}"</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {msg.sender === "Reliability" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center bg-indigo-500/10 p-4 rounded-2xl border border-indigo-500/20">
                <span className="font-bold text-indigo-400 uppercase tracking-widest text-xs">Overall Reliability</span>
                <span className="font-black text-indigo-400 text-2xl">{data.overall_reliability}%</span>
              </div>
              <p className="bg-black/20 p-4 rounded-xl border border-white/5"><strong>Contradictions:</strong> {data.contradictions}</p>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="bg-black/20 p-3 rounded-xl border border-white/5"><strong className="text-white/50 block mb-1 uppercase tracking-widest">Video Quality</strong> {data.video_quality}</div>
                <div className="bg-black/20 p-3 rounded-xl border border-white/5"><strong className="text-white/50 block mb-1 uppercase tracking-widest">Occlusion</strong> {data.occlusion}</div>
              </div>
            </div>
          )}

          {msg.sender === "Coordinator" && (
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 bg-black/20 p-4 rounded-xl border border-white/5">
                <strong className="text-white/50 block mb-1 text-xs uppercase tracking-widest">Reason</strong>
                <span className="text-sm">{data.reason}</span>
              </div>
              <div className="bg-cyan-500/10 p-4 rounded-xl border border-cyan-500/20">
                <strong className="text-cyan-400 block mb-1 text-xs uppercase tracking-widest">Incident Type</strong>
                <span className="font-bold">{data.incident_type}</span>
              </div>
              <div className="bg-cyan-500/10 p-4 rounded-xl border border-cyan-500/20">
                <strong className="text-cyan-400 block mb-1 text-xs uppercase tracking-widest">Required Agents</strong>
                <span className="font-bold">{data.required_agents?.join(", ")}</span>
              </div>
            </div>
          )}

          {msg.sender === "Evidence" && (
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-green-500/10 p-4 rounded-2xl border border-green-500/20">
                <p className="font-bold text-green-400 mb-3 uppercase tracking-widest text-xs">Observed Facts</p>
                <ul className="space-y-2">
                  {data.observed_facts?.map((f: string, i: number) => <li key={i} className="flex gap-2 items-start"><CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" /><span className="text-sm leading-snug">{f}</span></li>)}
                </ul>
              </div>
              <div className="bg-red-500/10 p-4 rounded-2xl border border-red-500/20">
                <p className="font-bold text-red-400 mb-3 uppercase tracking-widest text-xs">Unknown / Missing</p>
                <ul className="space-y-2 list-none text-sm text-white/70">
                  {data.unknowns?.map((f: string, i: number) => <li key={i} className="flex gap-2 items-start"><span className="text-red-500 font-bold">•</span><span className="leading-snug">{f}</span></li>)}
                  {data.missing_evidence?.map((f: string, i: number) => <li key={`m-${i}`} className="flex gap-2 items-start"><span className="text-red-500 font-bold">•</span><span className="leading-snug">{f}</span></li>)}
                </ul>
              </div>
            </div>
          )}

          {(msg.sender.includes("Rules") || msg.sender.includes("Assistant Referee")) && !msg.sender.includes("Debate") && (
            <div className="space-y-4">
              <div className="flex gap-2">
                {data.applicable_laws && <div className="bg-white/10 px-3 py-1.5 rounded-lg text-xs font-bold">Laws: {data.applicable_laws?.join(", ")}</div>}
                {data.law_reference && <div className="bg-white/10 px-3 py-1.5 rounded-lg text-xs font-bold">Law: {data.law_reference}</div>}
              </div>

              <div className="bg-black/40 border border-white/10 rounded-2xl overflow-hidden">
                <div className="bg-white/5 p-3 border-b border-white/5">
                  <p className="font-bold text-[#d4ed31] text-xs uppercase tracking-widest">Weighted Evidence</p>
                </div>
                <table className="w-full text-sm text-left">
                  <tbody>
                    {data.weighted_evidence?.map((we: any, i: number) => (
                      <tr key={i} className="border-b border-white/5 last:border-0">
                        <td className="p-3 text-white/90">{we.fact}</td>
                        <td className="p-3">
                          <span className={`px-2 py-1 rounded flex items-center justify-center text-[10px] uppercase font-bold tracking-wider ${we.supports.toLowerCase().includes('offense') ? 'bg-red-500/20 text-red-400' : 'bg-[#d4ed31]/20 text-[#d4ed31]'}`}>
                            {we.supports}
                          </span>
                        </td>
                        <td className="p-3 text-right font-mono font-bold text-white/50">{we.strength}/10</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {data.current_leaning && <div className="bg-black/20 p-4 rounded-xl border border-white/5"><strong className="text-white/50 block mb-1 text-xs uppercase tracking-widest">Current Leaning</strong> <span className="text-[#d4ed31] font-bold text-lg">{data.current_leaning}</span></div>}
                {data.decision && <div className="bg-black/20 p-4 rounded-xl border border-white/5"><strong className="text-white/50 block mb-1 text-xs uppercase tracking-widest">Decision</strong> <span className="text-[#d4ed31] font-bold text-lg">{data.decision}</span></div>}
              </div>
            </div>
          )}

          {msg.sender.includes("Devil") && (
            <div className="bg-purple-500/10 border border-purple-500/20 p-5 rounded-2xl">
              <strong className="text-purple-400 block mb-2 text-xs uppercase tracking-widest">Challenge Protocol Initiated</strong>
              <span className="text-white text-base leading-relaxed">{data.challenge}</span>
            </div>
          )}

          {msg.sender === "VAR" && (
            <div className="bg-red-500/10 border border-red-500/20 p-5 rounded-2xl space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-red-500/20">
                <span className="font-bold text-xs uppercase tracking-widest text-red-400">Recommend Review?</span>
                <span className={`text-2xl font-black tracking-tighter ${data.recommend_review ? 'text-red-500' : 'text-white/50'}`}>{data.recommend_review ? 'YES' : 'NO'}</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-black/20 p-3 rounded-xl"><strong className="text-white/50 block mb-1 text-[10px] uppercase tracking-widest">Likely On-Field</strong> <span className="font-bold">{data.likely_on_field_decision}</span></div>
                <div className="bg-black/20 p-3 rounded-xl"><strong className="text-white/50 block mb-1 text-[10px] uppercase tracking-widest">Clear & Obvious</strong> <span className="font-bold">{data.clear_and_obvious ? 'Yes' : 'No'}</span></div>
              </div>
              <div className="bg-black/20 p-3 rounded-xl">
                <strong className="text-white/50 block mb-1 text-[10px] uppercase tracking-widest">Threshold Reason</strong>
                <span className="text-sm">{data.threshold_reason}</span>
              </div>
            </div>
          )}

          {msg.sender.includes("Debate") && (
            <div className="bg-white/5 border border-white/10 p-5 rounded-2xl">
              <strong className="text-white/50 block mb-2 text-xs uppercase tracking-widest">Acknowledgment</strong>
              <p className="text-sm">{data.acknowledgment}</p>
            </div>
          )}

          {data.conversational_statement && (
            <div className="bg-[#d4ed31] text-black p-4 rounded-2xl rounded-tl-none relative mt-4 shadow-lg ml-2 font-medium">
              "{data.conversational_statement}"
            </div>
          )}
        </div>

        {data.what_would_change_my_mind && (
          <div className="bg-black/40 px-6 py-3 border-t border-white/5 text-[11px] text-white/60 flex items-start gap-2">
            <span className="font-bold uppercase tracking-widest text-[#d4ed31] shrink-0 mt-0.5">Mind Changer:</span>
            <span className="leading-relaxed">{data.what_would_change_my_mind}</span>
          </div>
        )}
      </motion.div>
    );
  };

  return (
    <div className="h-screen bg-[#5c6b45] text-[#f4f5f0] font-sans selection:bg-[#d4ed31]/30 p-2 md:p-6 lg:p-8 flex flex-col overflow-hidden">
      {/* Outer wrapper matching Home's aesthetic */}
      <div className="relative w-full rounded-[2.5rem] bg-[#141611] flex-1 flex flex-col shadow-2xl border border-white/10 overflow-hidden">
        
        {/* Background Image (Stadium) subtle overlay */}
        <div 
          className="absolute inset-0 z-0 opacity-10 mix-blend-luminosity pointer-events-none"
          style={{
            backgroundImage: 'url(/assets/bg2.jpg)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />

        {/* Header */}
        <div className="relative z-20 px-8 py-5 flex justify-between items-center border-b border-white/5 bg-black/40 backdrop-blur-md flex-shrink-0">
          <div className="flex items-center gap-4">
            <Button variant="ghost" className="rounded-full w-10 h-10 bg-white/5 hover:bg-white/10 text-white p-0 shadow-sm" onClick={() => window.location.href = '/'}>
              <Home className="w-4 h-4" />
            </Button>
            <Button 
              variant="ghost" 
              className={`rounded-full w-10 h-10 p-0 shadow-sm transition-colors ${isDataFeedOpen ? 'bg-[#d4ed31]/20 text-[#d4ed31]' : 'bg-white/5 hover:bg-white/10 text-white'}`}
              onClick={() => setIsDataFeedOpen(!isDataFeedOpen)}
              title="Toggle Copilot Data Feed"
            >
              {isDataFeedOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeftOpen className="w-4 h-4" />}
            </Button>
            <div className="ml-2 hidden sm:block">
              <h1 className="text-2xl font-black text-white tracking-tighter uppercase leading-none">
                VAR <span className="text-[#d4ed31]">ROOM</span>
              </h1>
            </div>
          </div>
          <Button
            className="border border-[#d4ed31]/50 text-[#d4ed31] bg-transparent hover:bg-[#d4ed31]/10 transition-colors rounded-xl px-5 py-4 shadow-lg text-xs uppercase tracking-widest"
            onClick={() => setShowGraph(!showGraph)}
          >
            <Network className="mr-2 h-4 w-4" />
            {showGraph ? "Hide Architecture" : "View Architecture"}
          </Button>
        </div>

        {/* MAIN SPLIT CONTENT */}
        <div className="relative z-10 flex-1 flex overflow-hidden">
          
          {/* DATA FEED SIDEBAR (Copilot style) */}
          <AnimatePresence>
            {isDataFeedOpen && (
              <motion.div
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 360, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="h-full border-r border-white/5 bg-[#1c1e18]/80 backdrop-blur-3xl flex-shrink-0 flex flex-col overflow-hidden"
              >
                <div className="p-6 flex-1 overflow-y-auto custom-scrollbar flex flex-col">
                  <h3 className="text-xs font-bold flex items-center text-white uppercase tracking-widest mb-6">
                    <span className="w-2 h-2 rounded-full bg-red-500 mr-3 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.8)]" />
                    Data Feed
                  </h3>
                  
                  <div className="space-y-6 flex-1">
                    <div className="space-y-3">
                      <label className="text-[10px] font-bold text-white/50 uppercase tracking-widest">Event Description</label>
                      <textarea
                        className="w-full h-40 p-4 rounded-2xl bg-black/40 text-white/90 text-sm leading-relaxed border border-white/10 focus:border-[#d4ed31] focus:ring-1 focus:ring-[#d4ed31] transition-all outline-none resize-none placeholder:text-white/20"
                        value={incidentText}
                        onChange={(e) => setIncidentText(e.target.value)}
                        placeholder="Describe the incident..."
                      />
                    </div>

                    <div className="space-y-3">
                      <label className="text-[10px] font-bold text-white/50 uppercase tracking-widest">Evidence Videos</label>
                      <div className="flex flex-col gap-3">
                        <input
                          type="file"
                          accept="video/*"
                          multiple
                          onChange={(e) => {
                            if (e.target.files) {
                              setVideoFiles((prev) => [...prev, ...Array.from(e.target.files!)]);
                            }
                          }}
                          className="hidden"
                          id="video-upload-input"
                        />
                        <label
                          htmlFor="video-upload-input"
                          className="w-full flex items-center justify-center gap-2 border border-dashed border-white/20 hover:border-[#d4ed31]/50 rounded-2xl p-4 cursor-pointer text-xs font-bold text-white/60 hover:text-[#d4ed31] transition-all bg-black/20 hover:bg-black/40 uppercase tracking-widest"
                        >
                          <Plus className="w-4 h-4" />
                          Add Media
                        </label>
                        
                        <div className="space-y-2 max-h-40 overflow-y-auto pr-1 custom-scrollbar">
                          {videoFiles.map((file, idx) => (
                            <div key={idx} className="flex items-center justify-between bg-black/40 p-2.5 rounded-xl border border-white/5 group">
                              <div className="flex items-center gap-3 overflow-hidden">
                                <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                                  <Play className="w-3 h-3 text-[#d4ed31]" />
                                </div>
                                <span className="text-[11px] text-white/80 truncate font-medium">{file.name}</span>
                              </div>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setVideoFiles(videoFiles.filter((_, i) => i !== idx))}
                                className="text-white/30 hover:text-red-400 hover:bg-red-400/10 shrink-0 h-7 w-7 rounded-lg"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-6 mt-6 border-t border-white/5">
                    <Button
                      className="w-full bg-[#d4ed31] hover:bg-[#c3de20] text-black font-black uppercase tracking-widest text-sm shadow-[0_0_20px_rgba(212,237,49,0.2)] transition-all hover:shadow-[0_0_30px_rgba(212,237,49,0.4)] hover:-translate-y-1 rounded-xl h-12"
                      onClick={runEvaluation}
                      disabled={isRunning}
                    >
                      {isRunning ? <Activity className="animate-spin mr-3 w-4 h-4" /> : <Play className="mr-3 w-4 h-4 fill-current" />}
                      {isRunning ? "Processing..." : "Initiate Protocol"}
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* MAIN CONTENT AREA (Takes remaining space, horizontal split for the 2 elements) */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-6 bg-black/20 flex flex-col">
            
            {/* Architecture Graph Dropdown */}
            <AnimatePresence>
              {showGraph && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-8 shrink-0"
                >
                  <div className="bg-black/60 border border-white/10 overflow-hidden shadow-2xl rounded-3xl backdrop-blur-md">
                    <div className="bg-white/5 border-b border-white/5 px-6 py-4">
                      <h3 className="text-[#d4ed31] font-bold text-xs uppercase tracking-widest flex items-center">
                        <Activity className="mr-2 h-4 w-4" /> Agent Network Map
                      </h3>
                    </div>
                    <div className="p-8 flex justify-center">
                      <img src="/api/graph_image" alt="Agent Graph" className="max-h-[300px] object-contain rounded-xl invert opacity-80 mix-blend-screen" />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* The 2 Horizontal Panels (Debate Engine & Chief Referee) */}
            <div className="grid lg:grid-cols-2 gap-6 items-stretch flex-1">
              
              {/* DEBATE ENGINE */}
              <div className="bg-[#1c1e18]/50 border border-white/5 rounded-[2rem] shadow-inner flex flex-col backdrop-blur-sm relative overflow-hidden min-h-[500px]">
                <div className="px-6 py-4 border-b border-white/5 bg-white/5 shrink-0">
                  <h3 className="text-xs font-bold flex items-center text-white uppercase tracking-widest">
                    <MessageSquare className="mr-3 w-4 h-4 text-[#d4ed31]" />
                    Debate Engine
                  </h3>
                </div>
                
                <div className="flex-1 overflow-y-auto p-6 relative z-0 custom-scrollbar">
                  {messages.length === 0 && !isRunning && (
                    <div className="h-full flex flex-col items-center justify-center text-white/30 space-y-6">
                      <div className="w-20 h-20 rounded-full border border-white/10 flex items-center justify-center bg-black/20">
                         <Network className="w-8 h-8 text-[#d4ed31]/50" />
                      </div>
                      <p className="font-mono text-[10px] tracking-widest uppercase font-bold">System Idle. Awaiting Protocol.</p>
                    </div>
                  )}
                  {messages.map((msg, idx) => {
                    if (msg.sender === "Chief Referee") return null; 
                    return <div key={idx}>{renderAgentContent(msg)}</div>;
                  })}
                </div>
              </div>

              {/* CHIEF REFEREE REPORT */}
              <div className="bg-[#1c1e18] border border-white/10 rounded-[2rem] shadow-2xl overflow-hidden backdrop-blur-xl flex flex-col min-h-[500px]">
                <div className="px-6 py-4 border-b border-white/5 bg-white/5 shrink-0">
                  <h3 className="text-xs font-bold flex items-center text-white uppercase tracking-widest">
                    <Gavel className="mr-3 w-4 h-4 text-[#d4ed31]" />
                    Chief Referee Report
                  </h3>
                </div>
                
                <div className="flex-1 bg-black/20 overflow-y-auto custom-scrollbar">
                  {decision ? (
                    <div className="flex flex-col h-full">
                      {/* Final Decision Highlight */}
                      <div className="bg-[#d4ed31]/10 p-8 border-b border-white/5 text-center relative overflow-hidden shrink-0">
                        <div className="absolute -right-4 -top-4 text-9xl opacity-5 font-black pointer-events-none">#</div>
                        <p className="text-[10px] font-bold text-[#d4ed31] uppercase tracking-widest mb-3 relative z-10">Final Ruling</p>
                        <h2 className="text-3xl font-black text-white uppercase tracking-tighter relative z-10 leading-tight">
                          {decision.decision}
                        </h2>
                      </div>

                      {/* Timeline & Votes */}
                      <div className="p-6 border-b border-white/5 space-y-4 shrink-0">
                        <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest">Computed Vote Tally</p>

                        <div className="flex flex-col gap-3">
                          {Object.entries(decision.initial_votes || {}).map(([vote, count]: any) => (
                            <div key={vote} className="flex justify-between items-center bg-black/40 border border-white/5 px-4 py-3 rounded-xl shadow-inner">
                              <span className="text-sm font-bold text-white/90">{vote}</span>
                              <span className="text-[10px] uppercase tracking-widest bg-[#d4ed31]/20 text-[#d4ed31] font-bold px-3 py-1.5 rounded-lg">{count} votes</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Reasoning Summary */}
                      <div className="p-6 border-b border-white/5 shrink-0">
                        <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest mb-3">Reasoning Summary</p>
                        <p className="text-sm text-white/80 italic leading-relaxed border-l-4 border-[#d4ed31] pl-4 py-1 font-medium bg-black/20 rounded-r-xl pr-4">
                          "{decision.reasoning_summary}"
                        </p>
                      </div>

                      {/* Missing Evidence */}
                      {decision.missing_evidence?.length > 0 && (
                        <div className="p-6 bg-red-500/10 shrink-0">
                          <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest mb-3">Insufficient Evidence</p>
                          <ul className="text-xs text-white/70 space-y-2">
                            {decision.missing_evidence.map((me: string, idx: number) => (
                              <li key={idx} className="flex items-start gap-2">
                                <span className="text-red-500 font-bold mt-0.5">•</span>
                                <span className="leading-snug">{me}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-12 h-full flex items-center justify-center text-white/40 text-xs uppercase tracking-widest font-bold">
                      {isRunning ? (
                        <div className="flex flex-col items-center gap-4 text-[#d4ed31]">
                          <Activity className="w-8 h-8 animate-pulse" />
                          Chief Referee is monitoring...
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-4">
                          <ShieldAlert className="w-8 h-8 opacity-50" />
                          Awaiting protocol...
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255,255,255,0.2);
        }
      `}</style>
    </div>
  );
}
