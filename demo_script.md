# AI Referee Crew - Hackathon Demo Video Script

## 🎬 Video Overview
**Target Length:** 2-3 minutes
**Goal:** Showcase the AI Referee Crew's ability to provide transparent, multi-agent consensus on contentious football incidents. 
**Style:** Fast-paced, highlighting the sleek UI and the real-time AI debate.

---

## 🤖 Meet the AI Crew
Before diving into the scenes, here is a brief overview of the multi-agent system powering the platform:
- **Incident Parser & Reliability Agents**: The first responders. They extract factual data from the upload and assess video/text quality.
- **Task Coordinator**: Evaluates the incident type and dynamically launches the necessary specialized agents.
- **Evidence Agent**: The objective observer. It strictly describes what is physically visible without interpreting the rules.
- **Rules Expert Agent**: The IFAB specialist. Applies the official Laws of the Game based strictly on the Evidence Agent's observations.
- **VAR / Assistant Referee Agents**: Specialized officials for specific scenarios (e.g., clear and obvious errors vs. offsides/throw-ins).
- **Devil's Advocate Agent**: The skeptic. It actively challenges weak logic or unsupported assumptions made by other agents.
- **Chief Referee Agent**: The final judge. Synthesizes the debate and outputs the definitive ruling.

---

## 📽️ Scene 1: Introduction (0:00 - 0:20)
**Visual:** Screen recording of the Landing Page (`Home.tsx`). Start with the massive "FAIRPLAY" typography and scroll down slightly to show the "Multi-Agent Architecture" section.
**Audio / Voiceover:** 
> "Welcome to our CAN Hackathon submission: AI Referee Crew. Football officiating faces a transparency crisis, especially with VAR. We solve this by introducing a Multi-Agent AI system that acts as a collective refereeing matrix to ensure zero errors and total fairness."

## 📽️ Scene 2: Entering the VAR Room (0:20 - 0:35)
**Visual:** Click the "Enter VAR" (Demo) link in the navigation bar. The screen transitions to the Demo workspace where the user can upload an incident.
**Audio / Voiceover:**
> "Let's step into the VAR room. Our platform allows officials to upload raw match footage or incident descriptions. The system leverages Qwen vision models and LLMs to analyze the play."

## 📽️ Scene 3: The Incident (0:35 - 1:00)
**Visual:** Upload a sample incident (e.g., a text description or short clip of a controversial tackle or offside call from a recent match). Click "Start Evaluation".
**Audio / Voiceover:**
> "We're submitting a highly debated penalty call. Instead of relying on a single AI model—which can hallucinate or miss context—we launch a specialized crew of agents powered by LangGraph."

## 📽️ Scene 4: The Multi-Agent Debate (1:00 - 1:45)
**Visual:** The screen shows the real-time WebSocket stream. Show the UI populating with messages from the different agents (e.g., Rules Expert analyzing the IFAB laws, VAR analyzing the visual tracking, Assistant providing context).
**Audio / Voiceover:**
> "Here is the magic. Under the hood, a FastAPI backend and LangGraph state workflow coordinate multiple agents. You can see them debating in real-time. The Rules Expert quotes the official IFAB handbook, while the VAR agent analyzes the contact. They negotiate until they reach an objective consensus."

## 📽️ Scene 5: The Final Decision (1:45 - 2:10)
**Visual:** The debate concludes and the UI highlights the "Final Decision" card with a confidence score.
**Audio / Voiceover:**
> "The crew has reached a decision. Not only do we get the final call, but we also receive a broadcast-ready explanation detailing *why* the decision was made. This creates a transparent, auditable trail that can be shared instantly with commentators and fans."

## 📽️ Scene 6: Architecture & Wrap-up (2:10 - 2:30)
**Visual:** Briefly flash the system architecture diagram showing the React Frontend, FastAPI Backend, and LangGraph AI Core. Then fade to the team logo or final "FairPlay" title screen.
**Audio / Voiceover:**
> "Built with React, FastAPI, LangGraph, and Qwen, our AI Referee Crew transforms how we handle contentious decisions—making football fairer and more transparent. Thank you for watching!"

---

### 💡 Tips for Video Editing:
- **Zoom Ins:** When the agents are debating in Scene 4, add slight zoom-ins (Ken Burns effect) on the specific text messages so the judges can read the AI's logic.
- **Speed Ramps:** If the AI takes a few seconds to generate responses via the WebSocket stream, speed up the footage during those moments to keep the video punchy.
- **Background Music:** Use a tense, electronic, or dramatic background track to simulate the pressure of a real VAR room, but keep it quiet enough not to overpower the voiceover.
