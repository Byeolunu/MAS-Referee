import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, CheckCircle2, PlayCircle, Zap, ShieldAlert } from "lucide-react";
import { useState } from "react";
import { Hero3D } from "@/components/Hero3D";
import { motion } from "framer-motion";

// Helper to convert standard youtube links to embed links
const getEmbedUrl = (url: string) => {
  if (url.includes("watch?v=")) {
    const videoId = url.split("watch?v=")[1].split("&")[0];
    return `https://www.youtube.com/embed/${videoId}`;
  }
  return url;
};

export default function Home() {
  const [expandedSolution, setExpandedSolution] = useState<number | null>(null);

  const solutions = [
    {
      id: 1,
      title: "AI-Enhanced VAR Transparency",
      icon: <PlayCircle className="w-5 h-5" />,
      shortDesc: "Real-time, broadcast-ready explanations for VAR decisions",
      fullDesc:
        "This system provides real-time, objective explanations for Video Assistant Referee (VAR) decisions to broadcasters, commentators, and fans. When a VAR review occurs, Manus AI rapidly analyzes the incident, cross-referencing it with official rules and historical data. It generates clear explanations highlighting the specific rule applied, visual evidence, and relevant precedents.",
      benefits: [
        "Reduces speculation and fan outrage through transparency",
        "Empowers commentators with factual, AI-generated insights",
        "Builds trust in the officiating process"
      ],
      videoUrl: "https://www.youtube.com/watch?v=r9FWGwURbCw",
      accentColor: "bg-destructive text-white",
      textColor: "text-destructive",
      imageUrl: "/assets/agent1.png",
      agentTitle: "AGENT.01"
    },
    {
      id: 2,
      title: "Collective Refereeing Matrix",
      icon: <ShieldAlert className="w-5 h-5" />,
      shortDesc: "Multi-agent consensus architecture for officiating excellence",
      fullDesc:
        "A secure environment where specialized AI agents (Rules Expert, VAR, Assistant) collectively review and analyze contentious match incidents. Instead of a single point of failure, the AI referee crew debates the play using player tracking data, visual feeds, and the IFAB ruleset until a consensus is reached.",
      benefits: [
        "Harnesses collective expertise across specialized domains",
        "Eliminates single-point-of-failure errors",
        "Provides an auditable trail of the decision-making debate"
      ],
      videoUrl: "https://www.youtube.com/watch?v=iomSkdNyW2o",
      accentColor: "bg-secondary text-white",
      textColor: "text-secondary",
      imageUrl: "/assets/agent2.png",
      agentTitle: "AGENT.02"
    },
    {
      id: 3,
      title: "Officiating Analytics Engine",
      icon: <Zap className="w-5 h-5" />,
      shortDesc: "Data-driven insights for fair officiating across tournaments",
      fullDesc:
        "This AI solution identifies and mitigates potential biases in refereeing patterns across tournaments. By analyzing vast datasets of match decisions (fouls, cards, VAR interventions), it flags statistical anomalies and maps them to factors like team, player, and match importance.",
      benefits: [
        "Provides objective insights into refereeing patterns",
        "Enables targeted training and development programs",
        "Reduces perception of favoritism and match-fixing"
      ],
      videoUrl: "https://www.youtube.com/watch?v=2aNsYQntFh8",
      accentColor: "bg-accent text-white",
      textColor: "text-accent",
      imageUrl: "/assets/agent3.png",
      agentTitle: "AGENT.03"
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/30 overflow-x-hidden relative">
      {/* Background Image Layer */}
      <div
        className="fixed inset-0 z-0 opacity-40 pointer-events-none"
        style={{
          backgroundImage: 'url(/assets/bg2.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed',
          filter: 'brightness(1.1) grayscale(0.2)'
        }}
      />

      {/* Content wrapper to stay above background */}
      <div className="relative z-10">
        {/* Header */}
        <header className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-xl border-b border-border/20">
          <div className="container mx-auto px-6 h-20 flex items-center justify-between">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-3"
            >
              <div className="w-12 h-12 rounded-full bg-destructive flex items-center justify-center text-primary-foreground font-black text-xl shadow-sm">
                FC
              </div>
              <h1 className="text-4xl font-black tracking-wider text-foreground">
                AI<span className="text-destructive">Referee</span>Crew
              </h1>
            </motion.div>

            <motion.nav
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="hidden md:flex items-center gap-8 font-semibold text-lg"
            >
              <a href="#solutions" className="text-muted-foreground hover:text-foreground transition-colors">Solutions</a>
              <Button
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-full transition-all hover:scale-105 px-8 py-6 text-lg"
                onClick={() => window.location.href = '/demo'}
              >
                Enter VAR Room
              </Button>
            </motion.nav>
          </div>
        </header>

        {/* Hero Section */}
        <section className="relative pt-32 pb-20 md:pt-48 md:pb-40 overflow-hidden flex items-center min-h-[90vh]">
          {/* The 3D Canvas Background */}
          <Hero3D />

          <div className="container mx-auto px-6 relative z-10 space-y-10 max-w-5xl md:w-2/3">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-card/80 border border-border backdrop-blur-md shadow-sm"
            >
              <span className="flex h-3 w-3 rounded-full bg-primary animate-pulse" />
              <span className="text-sm font-bold text-foreground">Global AI Hackathon Edition</span>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-6xl md:text-8xl lg:text-[7.5rem] text-foreground leading-[1] drop-shadow-sm"
            >
              The Future of Officiating is <br />
              <span className="text-destructive">
                Multi-Agent AI
              </span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-xl md:text-2xl text-muted-foreground leading-relaxed max-w-3xl font-medium"
            >
              Eliminating controversy in the Football. Watch our specialized AI Referee Crew debate, negotiate, and reach undeniable consensus in real-time.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, type: "spring" }}
              className="flex flex-col sm:flex-row gap-4 pt-8 max-w-md"
            >
              <div className="flex w-full items-center bg-card rounded-full p-2 shadow-sm border border-border">
                <input type="email" placeholder="Leave your email" className="flex-1 bg-transparent border-none focus:ring-0 px-4 text-foreground outline-none" />
                <Button
                  size="lg"
                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-12 px-8 text-lg rounded-full transition-all hover:scale-105"
                  onClick={() => window.location.href = '/demo'}
                >
                  Notify me!
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Solutions / Features Section */}
        <section id="solutions" className="py-32 relative bg-transparent">
          <div className="absolute top-0 left-0 w-full h-px bg-border/50" />

          <div className="container mx-auto px-6 space-y-24">
            <div className="text-center space-y-6 max-w-4xl mx-auto">
              <motion.h3
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="text-5xl md:text-7xl text-foreground"
              >
                Multi-Agent Architecture
              </motion.h3>
              <p className="text-xl text-muted-foreground leading-relaxed font-medium">
                Why rely on one model when you can deploy a crew? Our specialized agents use LangGraph to communicate, negotiate, and rule with absolute precision.
              </p>
            </div>

            <div className="flex flex-col gap-12">
              {solutions.map((solution, index) => (
                <motion.div
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  key={solution.id}
                  className="w-full"
                >
                  <div
                    className={`relative flex flex-col md:flex-row bg-card rounded-[3rem] border border-border/40 shadow-xl overflow-hidden group cursor-pointer transition-all duration-500 hover:shadow-2xl ${expandedSolution === solution.id ? 'ring-4 ring-primary' : 'hover:-translate-y-2'}`}
                    onClick={() => setExpandedSolution(expandedSolution === solution.id ? null : solution.id)}
                  >
                    {/* Left Side (Text content) */}
                    <div className="w-full md:w-2/3 p-10 md:p-14 flex flex-col justify-center relative z-10">
                      <div className="flex items-center gap-4 mb-8">
                        <div className={`px-4 py-2 rounded-full font-bold text-sm tracking-wider uppercase flex items-center gap-2 ${solution.accentColor}`}>
                          {solution.icon}
                          <span>{solution.agentTitle}</span>
                        </div>
                        <div className="px-4 py-2 bg-muted text-muted-foreground font-semibold text-sm rounded-full tracking-wider uppercase">
                          AI System
                        </div>
                      </div>

                      <h4 className="text-4xl md:text-5xl font-black mb-6 text-foreground">
                        {solution.title}
                      </h4>

                      <p className="text-xl text-muted-foreground leading-relaxed font-medium mb-8">
                        {solution.fullDesc}
                      </p>

                      <div className="mt-auto">
                        <div className={`inline-flex items-center gap-2 px-6 py-3 rounded-full font-bold text-lg border-2 border-current hover:bg-current hover:text-white transition-colors ${solution.textColor}`}>
                          {expandedSolution === solution.id ? 'Close Details' : 'More Info'}
                        </div>
                      </div>
                    </div>

                    {/* Right Side (Colored Blob + Image) */}
                    <div className={`w-full md:w-1/3 min-h-[300px] md:min-h-[400px] relative overflow-hidden ${solution.accentColor}`}>
                      {/* The curved cut-out effect for desktop */}
                      <div className="hidden md:block absolute -left-[10%] top-0 bottom-0 w-[20%] bg-card rounded-r-[100%]" />

                      {/* Background floating element */}
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white/20 font-black text-[120px] tracking-tighter mix-blend-overlay uppercase whitespace-nowrap pointer-events-none">
                        {solution.title.split(' ')[0]}
                      </div>

                      {/* The 3D Image */}
                      <img
                        src={solution.imageUrl}
                        alt={solution.title}
                        className="absolute inset-0 w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-700 ease-in-out mix-blend-luminosity hover:mix-blend-normal opacity-90 hover:opacity-100"
                      />
                    </div>
                  </div>

                  {/* Expanding Details Section */}
                  {expandedSolution === solution.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0, y: -20 }}
                      animate={{ opacity: 1, height: 'auto', y: 0 }}
                      className="w-full mt-6 bg-card rounded-[2rem] p-8 shadow-inner border border-border"
                    >
                      <div className="grid md:grid-cols-2 gap-8 items-start">
                        <div className="space-y-4 bg-background p-6 rounded-3xl border border-border shadow-sm h-full">
                          <p className="text-sm font-bold text-primary uppercase tracking-widest flex items-center gap-2">
                            <Zap className="w-4 h-4" /> System Benefits
                          </p>
                          {solution.benefits.map((benefit, i) => (
                            <motion.div
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.1 }}
                              key={i}
                              className="flex gap-4 items-start bg-card p-4 rounded-xl shadow-sm border border-border/50"
                            >
                              <CheckCircle2 className={`w-6 h-6 flex-shrink-0 ${solution.textColor}`} />
                              <span className="text-lg text-foreground font-medium">{benefit}</span>
                            </motion.div>
                          ))}
                        </div>

                        <div className="aspect-video bg-black rounded-3xl overflow-hidden border-4 border-border relative shadow-2xl transition-colors duration-500 h-full">
                          <iframe
                            src={getEmbedUrl(solution.videoUrl)}
                            title={solution.title}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            referrerPolicy="strict-origin-when-cross-origin"
                            allowFullScreen
                            className="absolute inset-0 w-full h-full"
                          />
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
        <footer className="py-16 border-t border-border bg-transparent relative overflow-hidden">
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-primary/20 blur-3xl rounded-t-full pointer-events-none" />
          <div className="container mx-auto px-6 text-center relative z-10">
            <h2 className="text-5xl tracking-widest text-foreground mb-6">
              AI<span className="text-primary">Referee</span>Crew
            </h2>
            <p className="text-sm text-muted-foreground font-sans tracking-widest font-bold">Engineered for the Global AI Hackathon • Powered by Qwen Cloud</p>
          </div>
        </footer>
        {/* Close the relative wrapper */}
      </div>
    </div>
  );
}
