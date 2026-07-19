import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, useRef, useEffect } from "react";
import { Play, Activity, CheckCircle2, ShieldAlert, Plus, Trash2, Network, MessageSquare, AlertTriangle, Scale, Target, Eye, Gavel, GitCommit } from "lucide-react";

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
  const [videoFiles, setVideoFiles] = useState<File[]>([]);
  const wsRef = useRef<WebSocket | null>(null);

  const runEvaluation = async () => {
    setIsRunning(true);
    setMessages([]);
    setDecision(null);

    const fullTextContext = incidentText + `\nPlayers involved: ${JSON.stringify(players)}`;
    let incidentData = fullTextContext;
    let inputType = "text";

    if (videoFiles.length > 0) {
      try {
        const paths = [];
        for (const file of videoFiles) {
          const formData = new FormData();
          formData.append("file", file);

          const uploadRes = await fetch("http://localhost:8000/api/upload", {
            method: "POST",
            body: formData,
          });

          if (!uploadRes.ok) {
            throw new Error(`Failed to upload ${file.name}`);
          }

          const data = await uploadRes.json();
          paths.push(data.path);
        }

        // Use the returned absolute paths for multimodal input
        incidentData = JSON.stringify(paths);
        inputType = "video";
      } catch (err: any) {
        console.error("Upload error:", err);
        alert("Failed to upload videos: " + err.message);
        setIsRunning(false);
        return;
      }
    }

    // Connect directly to FastAPI backend (bypasses Vite proxy)
    const wsUrl = `ws://localhost:8000/ws/evaluate`;

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

  const updatePlayer = (id: string, field: string, value: any) => {
    setPlayers(players.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const addPlayer = () => {
    setPlayers([...players, { id: Date.now().toString(), x: 50, y: 50, color: "bg-yellow-500", label: "New" }]);
  };

  const removePlayer = (id: string) => {
    setPlayers(players.filter(p => p.id !== id));
  };

  // Helper to render individual agent cards
  const renderAgentContent = (msg: any) => {
    const data = msg.structured_data || {};

    // Header icon mapping
    const getIcon = (sender: string) => {
      if (sender.includes("Evidence")) return <Eye className="w-5 h-5 text-blue-400" />;
      if (sender.includes("Rules")) return <Scale className="w-5 h-5 text-amber-400" />;
      if (sender.includes("VAR")) return <Target className="w-5 h-5 text-red-400" />;
      if (sender.includes("Devil")) return <AlertTriangle className="w-5 h-5 text-purple-400" />;
      if (sender.includes("Coordinator")) return <Network className="w-5 h-5 text-cyan-400" />;
      if (sender.includes("Parser")) return <Activity className="w-5 h-5 text-slate-400" />;
      if (sender.includes("Reliability")) return <ShieldAlert className="w-5 h-5 text-indigo-400" />;
      if (sender.includes("Asst")) return <MessageSquare className="w-5 h-5 text-green-400" />;
      return <MessageSquare className="w-5 h-5 text-primary" />;
    };

    return (
      <div className="bg-card border border-border rounded-xl shadow-md overflow-hidden flex flex-col mb-6 animate-in slide-in-from-bottom-4">
        {/* Agent Header */}
        <div className="bg-secondary/10 px-4 py-3 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getIcon(msg.sender)}
            <span className="font-bold text-foreground">{msg.sender}</span>
          </div>
          {data.confidence !== undefined && (
            <span className="text-xs font-mono bg-background border border-border px-2 py-1 rounded-full text-muted-foreground">
              CONF: {data.adjusted_confidence ?? data.confidence}%
            </span>
          )}
        </div>

        {/* Responding To Threading / Targeted Advocate */}
        {data.responding_to && (
          <div className="bg-primary/5 px-4 py-2 border-b border-border flex items-center gap-2 text-xs font-mono text-primary">
            <GitCommit className="w-4 h-4" /> Responding to {data.responding_to}
          </div>
        )}
        {data.target_agent && (
          <div className="bg-destructive/5 px-4 py-2 border-b border-border flex items-center gap-2 text-xs font-mono text-destructive">
            <GitCommit className="w-4 h-4" /> Challenging: {data.target_agent}
          </div>
        )}

        {/* Agent Specific Structured Data */}
        <div className="p-4 space-y-4 text-sm text-foreground">

          {/* Incident Parser Conflicts */}
          {msg.sender === "Incident Parser" && data.conflicts?.length > 0 && (
            <div className="bg-destructive/10 p-3 rounded border border-destructive/20">
              <p className="font-bold text-destructive mb-2 flex items-center"><AlertTriangle className="w-4 h-4 mr-2" /> Conflict Detected</p>
              <ul className="space-y-2">
                {data.conflicts.map((c: any, i: number) => (
                  <li key={i} className="text-sm">
                    <strong>{c.field}:</strong> Text says "{c.text_says}", Video shows "{c.video_says}"
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Reliability Agent */}
          {msg.sender === "Reliability" && (
            <div className="space-y-3">
              <div className="flex justify-between items-center bg-indigo-500/10 p-3 rounded border border-indigo-500/20">
                <span className="font-bold text-indigo-400">Overall Reliability</span>
                <span className="font-black text-indigo-400 text-xl">{data.overall_reliability}%</span>
              </div>
              <p><strong>Contradictions:</strong> {data.contradictions}</p>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div><strong className="text-muted-foreground">Video Quality:</strong> {data.video_quality}</div>
                <div><strong className="text-muted-foreground">Occlusion:</strong> {data.occlusion}</div>
              </div>
            </div>
          )}

          {/* Coordinator */}
          {msg.sender === "Coordinator" && (
            <div>
              <p><strong>Incident Type:</strong> {data.incident_type}</p>
              <p><strong>Reason:</strong> {data.reason}</p>
              <p><strong>Required Agents:</strong> {data.required_agents?.join(", ")}</p>
            </div>
          )}

          {/* Evidence Agent */}
          {msg.sender === "Evidence" && (
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-green-500/10 p-3 rounded border border-green-500/20">
                <p className="font-bold text-green-400 mb-2">Observed Facts</p>
                <ul className="space-y-1">
                  {data.observed_facts?.map((f: string, i: number) => <li key={i} className="flex gap-2"><CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" /><span className="text-xs">{f}</span></li>)}
                </ul>
              </div>
              <div className="bg-red-500/10 p-3 rounded border border-red-500/20">
                <p className="font-bold text-red-400 mb-2">Unknown / Missing</p>
                <ul className="space-y-1 list-disc pl-4 text-xs text-muted-foreground">
                  {data.unknowns?.map((f: string, i: number) => <li key={i}>{f}</li>)}
                  {data.missing_evidence?.map((f: string, i: number) => <li key={`m-${i}`}>{f}</li>)}
                </ul>
              </div>
            </div>
          )}

          {/* Rules / Asst Ref Expert */}
          {(msg.sender.includes("Rules") || msg.sender.includes("Assistant Referee")) && !msg.sender.includes("Debate") && (
            <div className="space-y-3">
              {data.applicable_laws && <div className="bg-secondary/10 p-2 rounded text-xs"><strong>Laws:</strong> {data.applicable_laws?.join(", ")}</div>}
              {data.law_reference && <div className="bg-secondary/10 p-2 rounded text-xs"><strong>Law:</strong> {data.law_reference}</div>}

              <div className="border border-border p-3 rounded overflow-x-auto">
                <p className="font-bold text-primary mb-2 text-xs uppercase">Weighted Evidence</p>
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="text-muted-foreground border-b border-border">
                      <th className="pb-1 font-normal w-3/5">Fact</th>
                      <th className="pb-1 font-normal w-1/5">Supports</th>
                      <th className="pb-1 font-normal w-1/5 text-right">Strength (0-10)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.weighted_evidence?.map((we: any, i: number) => (
                      <tr key={i} className="border-b border-border/50 last:border-0">
                        <td className="py-2 pr-2 text-foreground">{we.fact}</td>
                        <td className="py-2 pr-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${we.supports.toLowerCase().includes('offense') ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'}`}>
                            {we.supports}
                          </span>
                        </td>
                        <td className="py-2 text-right font-mono font-bold">{we.strength}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {data.current_leaning && <p className="text-sm"><strong>Current Leaning:</strong> <span className="text-primary font-bold">{data.current_leaning}</span></p>}
              {data.decision && <p className="text-sm"><strong>Decision:</strong> <span className="text-primary font-bold">{data.decision}</span></p>}
            </div>
          )}

          {/* Devil's Advocate */}
          {msg.sender.includes("Devil") && (
            <div className="bg-purple-500/5 border border-purple-500/20 p-4 rounded-xl space-y-3">
              <p><strong>Challenge:</strong> <span className="text-purple-400">{data.challenge}</span></p>
            </div>
          )}

          {/* VAR */}
          {msg.sender === "VAR" && (
            <div className="bg-red-500/5 border border-red-500/20 p-4 rounded-xl space-y-3">
              <div className="flex justify-between items-center pb-2 border-b border-red-500/10">
                <span className="font-bold text-sm">Recommend Review?</span>
                <span className={`font-black ${data.recommend_review ? 'text-red-500' : 'text-muted-foreground'}`}>{data.recommend_review ? 'YES' : 'NO'}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div><strong>Likely On-Field:</strong> {data.likely_on_field_decision}</div>
                <div><strong>Clear & Obvious:</strong> {data.clear_and_obvious ? 'Yes' : 'No'}</div>
              </div>
              <p className="text-xs"><strong>Threshold Reason:</strong> {data.threshold_reason}</p>
            </div>
          )}

          {/* Debate Round Update */}
          {msg.sender.includes("Debate") && (
            <div className="bg-accent/10 border border-accent/20 p-4 rounded-xl space-y-3">
              <p className="text-sm"><strong>Acknowledgment:</strong> {data.acknowledgment}</p>
            </div>
          )}

          {/* Conversational Statement (For everyone) */}
          {data.conversational_statement && (
            <div className="bg-background border border-border p-3 rounded-lg relative mt-2">
              <div className="absolute -left-2 top-4 w-4 h-4 bg-background border-l border-t border-border transform -rotate-45" />
              <p className="italic text-muted-foreground">"{data.conversational_statement}"</p>
            </div>
          )}
        </div>

        {/* Mind Changer Footer */}
        {data.what_would_change_my_mind && (
          <div className="bg-secondary/20 px-4 py-2 border-t border-border text-xs text-muted-foreground flex gap-2">
            <span className="font-bold uppercase tracking-widest text-primary shrink-0">Mind Changer:</span>
            <span>{data.what_would_change_my_mind}</span>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/30 p-8">
      <div className="max-w-[1600px] mx-auto space-y-8">
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-4xl md:text-5xl font-black text-foreground tracking-tight drop-shadow-sm">
            VAR <span className="text-primary">Room</span>: Live Event Analysis
          </h1>
          <Button
            variant="outline"
            className="border-primary/50 text-primary hover:bg-primary/10 transition-colors"
            onClick={() => setShowGraph(!showGraph)}
          >
            <Network className="mr-2 h-4 w-4" />
            {showGraph ? "Hide Agent Network" : "View Agent Network"}
          </Button>
        </div>

        {showGraph && (
          <Card className="bg-card border-border overflow-hidden shadow-lg mb-8">
            <CardHeader className="bg-secondary/20 border-b border-border">
              <CardTitle className="text-primary font-mono flex items-center">
                <Activity className="mr-2 h-5 w-5" /> LangGraph Architecture
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 flex justify-center bg-card/50">
              <img src="/api/graph_image" alt="Agent Graph" className="max-h-[400px] object-contain rounded" />
            </CardContent>
          </Card>
        )}

        {/* 3 COLUMN LAYOUT */}
        <div className="grid lg:grid-cols-12 gap-6 items-start">

          {/* LEFT COLUMN: INCIDENT INPUT */}
          <div className="lg:col-span-3 space-y-6 sticky top-8">
            <Card className="bg-card border-border shadow-xl hover:border-primary/30 transition-all duration-300">
              <CardTitle className="text-lg font-bold flex items-center text-foreground m-8">
                <span className="w-2 h-2 rounded-full bg-destructive mr-2 animate-pulse" />
                Incident Data Feed
              </CardTitle>
              <CardContent className="pt-4 space-y-5">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest font-mono">Event Description</label>
                  <textarea
                    className="w-full h-32 p-4 rounded-xl bg-background text-foreground text-sm border border-border focus:border-primary focus:ring-1 focus:ring-primary transition-all outline-none resize-none"
                    value={incidentText}
                    onChange={(e) => setIncidentText(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest font-mono">Upload Incident Videos</label>
                  <div className="flex flex-col gap-2">
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
                      className="w-full flex items-center justify-center gap-2 border border-dashed border-border hover:border-primary/50 rounded-xl p-3 cursor-pointer text-sm text-muted-foreground hover:text-foreground transition-all bg-secondary/5 hover:bg-secondary/10"
                    >
                      <Plus className="w-4 h-4 text-primary" />
                      Add Videos
                    </label>
                    {videoFiles.map((file, idx) => (
                      <div key={idx} className="flex items-center justify-between bg-secondary/10 p-2 rounded-lg border border-border">
                        <div className="flex items-center gap-2 overflow-hidden">
                          <Play className="w-4 h-4 text-primary shrink-0" />
                          <span className="text-sm truncate">{file.name}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setVideoFiles(videoFiles.filter((_, i) => i !== idx))}
                          className="text-muted-foreground hover:text-destructive shrink-0 h-8 w-8"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
                <Button
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98] rounded-xl mt-4"
                  onClick={runEvaluation}
                  disabled={isRunning}
                >
                  {isRunning ? <Activity className="animate-spin mr-2" /> : <Play className="mr-2" />}
                  {isRunning ? "Running..." : "Initiate VAR"}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* CENTER COLUMN: DEBATE ENGINE */}
          <div className="lg:col-span-6 space-y-6">
            <Card className="bg-card border-border shadow-xl h-[85vh] flex flex-col">
              <CardTitle className="text-xl text-foreground flex items-center font-bold m-8">
                <MessageSquare className="mr-2 text-primary" /> Multi-Agent Debate Engine
              </CardTitle>
              <CardContent className="flex-1 overflow-y-auto p-6 bg-background/50 rounded-b-xl">
                {messages.length === 0 && !isRunning && (
                  <div className="h-full flex flex-col items-center justify-center text-muted-foreground space-y-4">
                    <Network className="w-16 h-16 opacity-30 text-primary" />
                    <p className="font-mono text-sm tracking-widest uppercase">System Idle. Awaiting Incident Data.</p>
                  </div>
                )}
                {messages.map((msg, idx) => {
                  if (msg.sender === "Chief Referee") return null; // Render chief on the right column
                  return <div key={idx}>{renderAgentContent(msg)}</div>;
                })}
              </CardContent>
            </Card>
          </div>

          {/* RIGHT COLUMN: METRICS & TIMELINE */}
          <div className="lg:col-span-3 space-y-6 sticky top-8">
            <Card className="bg-card border-border shadow-xl">
              <CardTitle className="text-lg text-foreground flex items-center font-bold text-center m-8">
                <Gavel className="mr-2 text-primary" /> Chief Referee Report
              </CardTitle>
              <CardContent className="p-0">
                {decision ? (
                  <div className="flex flex-col h-full">
                    {/* Final Decision Highlight */}
                    <div className="bg-primary/10 p-6 border-b border-border text-center">
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">Final Ruling</p>
                      <h2 className="text-2xl font-black text-primary">{decision.decision}</h2>
                    </div>

                    {/* Timeline & Votes */}
                    <div className="p-6 border-b border-border space-y-6 bg-background/50">
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4">Computed Vote Tally</p>

                      <div className="flex flex-col gap-2">
                        {Object.entries(decision.initial_votes || {}).map(([vote, count]: any) => (
                          <div key={vote} className="flex justify-between items-center bg-card border border-border px-3 py-2 rounded-md">
                            <span className="text-sm font-bold">{vote}</span>
                            <span className="text-xs bg-primary/20 text-primary font-bold px-2 py-1 rounded-full">{count} votes</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Reasoning Summary */}
                    <div className="p-6 border-b border-border">
                      <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">Reasoning Summary</p>
                      <p className="text-sm text-foreground italic leading-relaxed border-l-2 border-primary/50 pl-3">
                        "{decision.reasoning_summary}"
                      </p>
                    </div>

                    {/* Missing Evidence */}
                    {decision.missing_evidence?.length > 0 && (
                      <div className="p-6 bg-destructive/5">
                        <p className="text-xs font-bold text-destructive uppercase tracking-widest mb-2">Insufficient Evidence</p>
                        <ul className="list-disc pl-4 text-xs text-muted-foreground space-y-1">
                          {decision.missing_evidence.map((me: string, idx: number) => (
                            <li key={idx}>{me}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                  </div>
                ) : (
                  <div className="p-6 text-center text-muted-foreground text-sm italic">
                    {isRunning ? "Chief Referee is monitoring the debate..." : "Awaiting protocol initiation..."}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

        </div>
      </div>
    </div >
  );
}
