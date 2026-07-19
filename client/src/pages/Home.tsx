import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2, PlayCircle, Zap, ShieldAlert, Menu } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";

export default function Home() {
  const [expandedSolution, setExpandedSolution] = useState<number | null>(null);

  const solutions = [
    {
      id: 1,
      title: "AI-Enhanced VAR Transparency",
      icon: <PlayCircle className="w-4 h-4" />,
      shortDesc: "Real-time, broadcast-ready explanations for VAR decisions",
      fullDesc:
        "This system provides real-time, objective explanations for Video Assistant Referee (VAR) decisions to broadcasters, commentators, and fans. When a VAR review occurs, Manus AI rapidly analyzes the incident, cross-referencing it with official rules and historical data. It generates clear explanations highlighting the specific rule applied, visual evidence, and relevant precedents.",
      benefits: [
        "Reduces speculation and fan outrage through transparency",
        "Empowers commentators with factual, AI-generated insights",
        "Builds trust in the officiating process"
      ],
      accentColor: "bg-primary text-primary-foreground",
      textColor: "text-primary",
      imageUrl: "/assets/agent1.png",
      agentTitle: "AGENT.01"
    },
    {
      id: 2,
      title: "Collective Refereeing Matrix",
      icon: <ShieldAlert className="w-4 h-4" />,
      shortDesc: "Multi-agent consensus architecture for officiating excellence",
      fullDesc:
        "A secure environment where specialized AI agents (Rules Expert, VAR, Assistant) collectively review and analyze contentious match incidents. Instead of a single point of failure, the AI referee crew debates the play using player tracking data, visual feeds, and the IFAB ruleset until a consensus is reached.",
      benefits: [
        "Harnesses collective expertise across specialized domains",
        "Eliminates single-point-of-failure errors",
        "Provides an auditable trail of the decision-making debate"
      ],
      accentColor: "bg-white text-black",
      textColor: "text-white",
      imageUrl: "/assets/agent2.png",
      agentTitle: "AGENT.02"
    },
    {
      id: 3,
      title: "Officiating Analytics Engine",
      icon: <Zap className="w-4 h-4" />,
      shortDesc: "Data-driven insights for fair officiating across tournaments",
      fullDesc:
        "This AI solution identifies and mitigates potential biases in refereeing patterns across tournaments. By analyzing vast datasets of match decisions (fouls, cards, VAR interventions), it flags statistical anomalies and maps them to factors like team, player, and match importance.",
      benefits: [
        "Provides objective insights into refereeing patterns",
        "Enables targeted training and development programs",
        "Reduces perception of favoritism and match-fixing"
      ],
      accentColor: "bg-gray-800 text-white",
      textColor: "text-white",
      imageUrl: "/assets/agent3.png",
      agentTitle: "AGENT.03"
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/30 overflow-x-hidden relative">
      {/* Background Image Layer */}
      <div
        className="fixed inset-0 z-0 opacity-20 pointer-events-none mix-blend-luminosity"
        style={{
          backgroundImage: 'url(/assets/bg2.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
        }}
      />

      {/* Content wrapper */}
      <div className="relative z-10 px-4 md:px-8 py-4">

        {/* Modern Hero Container resembling the inspiration */}
        <div className="bg-[#1c1e18] rounded-[2rem] md:rounded-[3rem] overflow-hidden min-h-[85vh] flex flex-col shadow-2xl border border-white/5 relative">

          {/* Top Nav */}
          <header className="relative z-50 flex items-center justify-between px-6 md:px-10 py-6 w-full text-white">
            <div className="hidden md:flex gap-8 text-[11px] font-bold tracking-widest uppercase">
              <a href="#solutions" className="hover:text-primary transition-colors">Solutions</a>
              <a href="/demo" className="hover:text-primary transition-colors">Demo</a>
            </div>

            <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-3 font-bold tracking-widest text-lg">
              <span className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center text-sm shadow-md"><img src="/assets/football.png" className="h-full object-contain" alt="AI Agent" /></span>
              <span className="hidden sm:block">AI REFEREE <span className="font-normal text-white/80">CREW</span></span>
            </div>

            <div className="flex items-center gap-6 text-[11px] font-bold tracking-widest">
              <a href="/demo" className="hover:text-primary transition-colors uppercase underline underline-offset-4 decoration-2">Enter VAR</a>
              <button className="w-10 h-10 bg-white text-black rounded-full flex items-center justify-center hover:scale-105 transition-transform shadow-md">
                <Menu className="w-4 h-4" />
              </button>
            </div>
          </header>

          {/* Hero Content Wrapper */}
          <div className="flex-1 flex flex-col justify-center items-center relative py-12">

            {/* Massive Typography */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full flex justify-center pointer-events-none z-0 px-4">
              <h1 className="text-[18vw] md:text-[20rem] font-bold leading-[0.8] tracking-tighter text-white/90 uppercase text-center w-full">
                FAIR<span className="text-primary md:ml-4">PL</span>AY
              </h1>
            </div>

            {/* Central Player/Hero Image */}
            {/* <div className="relative z-10 w-full max-w-4xl flex justify-center mt-4 md:mt-8 pointer-events-none h-[35vh] md:h-[55vh]">
               <img src="/assets/agent2.png" className="h-full object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)]" alt="AI Agent" />
            </div> */}

            {/* Bottom Floating Area within Hero */}
            <div className="absolute bottom-0 left-0 w-full px-6 md:px-10 pb-6 md:pb-10 flex flex-col md:flex-row justify-between items-end z-20 gap-6">
              <div className="mb-2 md:mb-0">
                <h2 className="text-3xl md:text-5xl font-light text-white uppercase tracking-tight leading-[1.1]">
                  ZERO ERRORS,
                  <br />
                  <span className="text-primary font-bold">TOTAL FAIRNESS</span>
                </h2>
              </div>

              {/* Stat/Callout Card aligned nicely */}
              <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-[2rem] p-4 flex items-center gap-6 shadow-2xl w-full md:w-80 transition-all hover:bg-black/50">
                <div className="pl-2">
                  <h3 className="text-3xl font-bold text-white tracking-tight leading-none">100%</h3>
                  <p className="text-[9px] text-white/70 font-semibold uppercase mt-1">Accuracy<br />Target</p>
                  <div className="flex gap-1 mt-2 text-primary">
                    <CheckCircle2 className="w-4 h-4" />
                    <CheckCircle2 className="w-4 h-4" />
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                </div>
                <div className="w-16 h-20 bg-white/10 rounded-2xl overflow-hidden flex-shrink-0 relative ml-auto">
                  <img src="/assets/agent3.png" className="absolute inset-0 w-full h-full object-cover opacity-90" alt="Agent" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Solutions / Features Section restored and restyled */}
        <section id="solutions" className="py-24 relative">
          <div className="container mx-auto max-w-5xl space-y-16">
            <div className="text-center space-y-4">
              <h3 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground">
                Multi-Agent Architecture
              </h3>
              <p className="text-base text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                Why rely on one model when you can deploy a crew? Our specialized agents communicate, negotiate, and rule with absolute precision.
              </p>
            </div>

            <div className="grid gap-6">
              {solutions.map((solution, index) => (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  key={solution.id}
                  className="w-full"
                >
                  <div
                    className={`relative flex flex-col md:flex-row bg-card rounded-[2rem] border border-border shadow-md overflow-hidden group cursor-pointer transition-all duration-300 hover:shadow-xl ${expandedSolution === solution.id ? 'ring-2 ring-primary' : 'hover:-translate-y-1'}`}
                    onClick={() => setExpandedSolution(expandedSolution === solution.id ? null : solution.id)}
                  >
                    {/* Left Side (Text content) */}
                    <div className="w-full md:w-3/5 p-8 flex flex-col justify-center relative z-10">
                      <div className="flex items-center gap-4 mb-4">
                        <div className={`px-3 py-1.5 rounded-full font-bold text-[10px] tracking-widest uppercase flex items-center gap-2 ${solution.accentColor}`}>
                          {solution.icon}
                          <span>{solution.agentTitle}</span>
                        </div>
                      </div>

                      <h4 className="text-2xl font-bold mb-3 text-foreground tracking-tight">
                        {solution.title}
                      </h4>

                      <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                        {solution.fullDesc}
                      </p>

                      <div className="mt-auto">
                        <div className="inline-flex items-center gap-2 text-sm font-semibold hover:text-primary transition-colors">
                          {expandedSolution === solution.id ? 'Close Details' : 'View Benefits'}
                          <ArrowRight className="w-4 h-4" />
                        </div>
                      </div>
                    </div>

                    {/* Right Side (Image) */}
                    <div className={`w-full md:w-2/5 min-h-[200px] relative overflow-hidden bg-muted`}>
                      <img
                        src={solution.imageUrl}
                        alt={solution.title}
                        className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-in-out mix-blend-luminosity hover:mix-blend-normal opacity-80"
                      />
                    </div>
                  </div>

                  {/* Expanding Details Section */}
                  {expandedSolution === solution.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0, y: -10 }}
                      animate={{ opacity: 1, height: 'auto', y: 0 }}
                      className="w-full mt-4 bg-card rounded-[1.5rem] p-6 shadow-inner border border-border"
                    >
                      <div className="grid gap-6">
                        <div className="space-y-4">
                          <p className="text-xs font-bold text-primary uppercase tracking-widest flex items-center gap-2">
                            <Zap className="w-4 h-4" /> Key Benefits
                          </p>
                          <div className="grid md:grid-cols-3 gap-4">
                            {solution.benefits.map((benefit, i) => (
                              <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.1 }}
                                key={i}
                                className="flex flex-col gap-3 items-start bg-background p-4 rounded-xl shadow-sm border border-border/50"
                              >
                                <CheckCircle2 className={`w-5 h-5 flex-shrink-0 ${solution.textColor}`} />
                                <span className="text-sm text-foreground font-medium">{benefit}</span>
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12 border-t border-border bg-transparent relative mt-12">
          <div className="container mx-auto text-center relative z-10">
            <h2 className="text-xl font-bold tracking-tight text-foreground mb-2">
              AI<span className="text-primary">Referee</span>Crew
            </h2>
            <p className="text-[10px] text-muted-foreground font-medium tracking-widest uppercase">Powered by Qwen Cloud</p>
          </div>
        </footer>
      </div>
    </div>
  );
}
