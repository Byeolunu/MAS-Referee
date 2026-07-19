# Hackathon Submission Draft: AI Referee Crew

## Inspiration
Controversial refereeing decisions in football often lead to fan outrage, speculation, and mistrust. While Video Assistant Referees (VAR) were introduced to solve this, the process remains opaque and vulnerable to human error or single points of failure. We were inspired to build a system that not only makes accurate decisions but does so with **total transparency**. We wanted to move away from a "black box" AI that just spits out an answer, and instead create a collaborative "crew" of AI agents that debate the play openly, just like a real refereeing team.

## What it does
**AI Referee Crew** is a multi-agent system that analyzes contentious football incidents and provides broadcast-ready, objective explanations. 
When a user uploads an incident (video or text), the platform doesn't just query a single LLM. Instead, it launches a specialized crew of AI agents:
- **Incident & Evidence Agents** determine *what* physically happened.
- **Rules Expert Agent** applies the official IFAB Laws of the Game.
- **Devil’s Advocate Agent** actively challenges weak logic or unsupported assumptions.
- **Chief Referee** synthesizes the debate to make a final ruling.
The entire debate is streamed in real-time to our sleek "FairPlay" dashboard, giving fans, commentators, and officials an auditable trail of exactly *why* a decision was made.

## How we built it
We built the platform using a modern, real-time tech stack:
- **Frontend:** React and Vite, utilizing Framer Motion and Tailwind CSS to create a premium, broadcast-ready UI.
- **Backend:** FastAPI handles our REST endpoints and manages real-time WebSocket connections to stream the agents' thought processes.
- **AI Core:** We utilized **LangGraph** to build a complex, stateful workflow for our multi-agent architecture. 
- **Models:** The system is powered by **Qwen** (vision and language models) to parse evidence, assess reliability, and drive the logical debate.

## Challenges we ran into
One of the biggest challenges was **agent lane discipline**. Initially, our Evidence Agent would try to make legal rulings (e.g., declaring a foul), or our Rules Expert would invent facts to justify a rule. We overcame this through rigorous prompt engineering, forcing agents to rely strictly on an "Evidence Ledger" and clearly separating *factual observation* from *legal interpretation*. 
Additionally, managing the real-time, asynchronous streaming of multiple AI agents debating over WebSockets required careful state management in both LangGraph and our React frontend.

## Accomplishments that we're proud of
We are incredibly proud of the **Devil's Advocate Agent**. Building an AI that doesn't just blindly disagree, but specifically targets weak logic, over-weighted evidence, and logical leaps in another AI's argument was a massive success. We are also extremely proud of our UI/UX—we managed to make a highly complex, multi-agent AI system feel intuitive, sleek, and ready for live television.

## What we learned
We gained deep hands-on experience with **LangGraph** and stateful agent orchestration. We learned how to build robust real-time communication pipelines using **FastAPI WebSockets**. Most importantly, we learned that dividing a complex LLM task into smaller, specialized agents dramatically reduces hallucinations and increases the logical rigor of the final output.

## What's next for AI Referee Crew
- **Multi-Angle Video Integration:** Allowing the system to parse and cross-reference multiple camera angles simultaneously.
- **Limb-Tracking Data:** Integrating raw skeletal tracking data for millimetric offside and contact analysis.
- **Live Broadcast Audio:** Using Text-to-Speech (TTS) to generate real-time audio explanations that commentators can play directly on live TV.
