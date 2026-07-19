import json
from typing import TypedDict, List, Dict, Any, Optional, Annotated
from langgraph.graph import StateGraph, END
from langgraph.types import Send
import operator

from langchain_core.messages import HumanMessage
from langchain_core.output_parsers import JsonOutputParser

from agents import (
    incident_parser_agent, reliability_agent, coordinator_agent, vision_agent, rules_agent, asst_ref_agent,
    var_agent, devils_advocate_agent, get_debate_agent, chief_agent,
    get_vl_llm, parser_prompt, analyze_video_with_qwen
)
from models import ParsedIncident

def update_dict(dict1: Dict, dict2: Dict) -> Dict:
    if dict1 is None:
        dict1 = {}
    if dict2 is None:
        dict2 = {}
    dict1.update(dict2)
    return dict1

class RefereeState(TypedDict):
    input_type: str  # 'text' or 'video'
    raw_incident: str  # description or video path/URL
    text_description: Optional[str]
    parsed_incident: Optional[Dict[str, Any]]
    reliability_assessment: Optional[Dict[str, Any]]
    incident_type: str
    agents_to_launch: List[str]
    initial_opinions: Annotated[Dict[str, Any], update_dict]
    current_opinions: Annotated[Dict[str, Any], update_dict]
    debate_history: Annotated[List[Dict[str, Any]], operator.add]
    final_decision: Optional[Dict[str, Any]]
    messages: Annotated[List[Dict[str, Any]], operator.add]

def format_msg(sender: str, content: str, structured: Dict = None):
    return {"sender": sender, "content": content, "structured_data": structured}

# ---------------------------------------------------------------------------
# Parse / Coordinate
# ---------------------------------------------------------------------------

def parse_node(state: RefereeState):
    if state["input_type"] == "video":
        parser = JsonOutputParser(pydantic_object=ParsedIncident)

        text_context = state.get("text_description")
        if text_context:
            context_block = (
                "\n\nKnown context from the written match report (may or may not "
                "match what you observe in the video):\n"
                f"{text_context}\n\n"
                "If the kit colors, jersey numbers, and location you observe are "
                "consistent with this context, use it to name the actual teams and "
                "players (e.g. 'Argentina #9' rather than 'light blue and white "
                "striped jersey #9'). If what you observe does NOT match this "
                "context -- different location, different jersey numbers, different "
                "scene -- do NOT force a match. Describe only what you see, and "
                "explicitly flag the mismatch in the conflicts array rather than "
                "silently substituting the reported version."
            )
        else:
            context_block = (
                "\n\nNo written match report was provided. Describe only what is "
                "directly visible (kit colors, jersey numbers) -- do not guess team "
                "identity from colors alone."
            )

        prompt = parser_prompt + context_block + "\n\n" + parser.get_format_instructions()
        raw_output = analyze_video_with_qwen(state["raw_incident"], prompt)

        cleaned_output = raw_output.strip()
        if cleaned_output.startswith("```json"):
            cleaned_output = cleaned_output[7:]
        elif cleaned_output.startswith("```"):
            cleaned_output = cleaned_output[3:]
        if cleaned_output.endswith("```"):
            cleaned_output = cleaned_output[:-3]
        cleaned_output = cleaned_output.strip()

        try:
            parsed = json.loads(cleaned_output)
        except Exception:
            try:
                parsed = parser.parse(raw_output)
            except Exception:
                parsed = {
                    "location": "Not specified",
                    "ball_state": "Not specified",
                    "players_involved": [],
                    "contact_point": "Not specified",
                    "body_parts_in_contact": [],
                    "referee_decision": "Not specified",
                    "video_available": True,
                    "conflicts": [],
                    "description": raw_output
                }
    else:
        parsed = incident_parser_agent.invoke({"input_data": state["raw_incident"]})

    return {"parsed_incident": parsed, "messages": [format_msg("Incident Parser", json.dumps(parsed, indent=2), parsed)]}

def reliability_node(state: RefereeState):
    context = f"Incident Details:\n{json.dumps(state['parsed_incident'])}\n\nRaw Text Context:\n{state.get('text_description', 'None')}"
    assessment = reliability_agent.invoke({"input_data": context})
    return {"reliability_assessment": assessment, "messages": [format_msg("Reliability", assessment.get("overall_reliability", 0), assessment)]}

def coordinator_node(state: RefereeState):
    context = f"Incident: {json.dumps(state['parsed_incident'])}\nReliability: {json.dumps(state['reliability_assessment'])}"
    decision = coordinator_agent.invoke({"input_data": context})
    return {
        "incident_type": decision.get("incident_type", "Unknown"),
        "agents_to_launch": decision.get("required_agents", []),
        "messages": [format_msg("Coordinator", f"Launched agents: {', '.join(decision.get('required_agents', []))}", decision)]
    }

# ---------------------------------------------------------------------------
# Propose round -- each specialist assesses from parsed_incident and reliability ONLY.
# ---------------------------------------------------------------------------

def route_propose(state: RefereeState):
    targets = []
    launch = state.get("agents_to_launch", [])
    for name in ("vision", "rules", "asst_ref", "var"):
        if name in launch:
            targets.append(name)
    return targets

def build_agent_context(state: RefereeState):
    return json.dumps({
        "parsed_incident": state["parsed_incident"],
        "reliability": state["reliability_assessment"]
    })

def vision_node(state: RefereeState):
    analysis = vision_agent.invoke({"input_data": build_agent_context(state)})
    return {"initial_opinions": {"vision": analysis}, "messages": [format_msg("Evidence", analysis.get("conversational_statement", ""), analysis)]}

def rules_node(state: RefereeState):
    analysis = rules_agent.invoke({"input_data": build_agent_context(state)})
    return {"initial_opinions": {"rules": analysis}, "messages": [format_msg("Rules Expert", analysis.get("conversational_statement", ""), analysis)]}

def asst_ref_node(state: RefereeState):
    analysis = asst_ref_agent.invoke({"input_data": build_agent_context(state)})
    return {"initial_opinions": {"asst_ref": analysis}, "messages": [format_msg("Assistant Referee", analysis.get("conversational_statement", ""), analysis)]}

def var_node(state: RefereeState):
    analysis = var_agent.invoke({"input_data": build_agent_context(state)})
    return {"initial_opinions": {"var": analysis}, "messages": [format_msg("VAR", analysis.get("conversational_statement", ""), analysis)]}

# ---------------------------------------------------------------------------
# Critique -- fan-in point. devils_advocate only runs once every propose
# branch that was launched this run has finished.
# ---------------------------------------------------------------------------

def devils_advocate_node(state: RefereeState):
    if "devils_advocate" not in state.get("agents_to_launch", []):
        return {}
    initial_opinions = state.get("initial_opinions") or {}
    context = f"Incident: {json.dumps(state['parsed_incident'])}\nInitial Opinions: {json.dumps(initial_opinions)}"
    analysis = devils_advocate_agent.invoke({"input_data": context})
    return {"initial_opinions": {"devils_advocate": analysis}, "messages": [format_msg("Devil's Advocate", analysis.get("conversational_statement", ""), analysis)]}

# ---------------------------------------------------------------------------
# Debate round -- each agent's rebuttal is its own parallel node execution via Send.
# ---------------------------------------------------------------------------

def route_debate(state: RefereeState):
    initial_ops = state.get("initial_opinions") or {}
    launch = state.get("agents_to_launch", [])
    
    # Check if DA targeted a specific agent
    da_op = initial_ops.get("devils_advocate", {})
    target = da_op.get("target_agent", "").lower()

    sends = []
    for agent_name in launch:
        if agent_name == "devils_advocate":
            continue
        if agent_name not in initial_ops:
            continue
            
        # If a specific target was given, maybe only that agent responds, but for robustness
        # we can still have everyone respond or just the targeted one. Let's have everyone 
        # respond but the targeted one gets a specialized instruction.
        sends.append(
            Send(
                "debate_agent",
                {
                    "agent_name": agent_name,
                    "parsed_incident": state["parsed_incident"],
                    "reliability": state["reliability_assessment"],
                    "initial_opinions": initial_ops,
                    "own_initial_opinion": initial_ops[agent_name],
                },
            )
        )
    return sends

def debate_agent_node(payload: dict):
    agent_name = payload["agent_name"]
    context = (
        f"Incident: {json.dumps(payload['parsed_incident'])}\n"
        f"Reliability: {json.dumps(payload['reliability'])}\n"
        f"All Initial Opinions: {json.dumps(payload['initial_opinions'])}\n"
        f"Your Initial Opinion: {json.dumps(payload['own_initial_opinion'])}"
    )
    try:
        debate_agent = get_debate_agent(agent_name)
        update = debate_agent.invoke({"input_data": context})
    except Exception as e:
        print(f"Debate error for {agent_name}: {e}")
        return {}

    sender = f"Debate ({agent_name.capitalize()})"
    return {
        "current_opinions": {agent_name: update},
        "debate_history": [{"agent": agent_name, "round": 1, "update": update}],
        "messages": [format_msg(sender, update.get("conversational_statement", ""), update)],
    }

# ---------------------------------------------------------------------------
# Decide
# ---------------------------------------------------------------------------

def chief_referee_node(state: RefereeState):
    initial_opinions = state.get("initial_opinions") or {}
    current_opinions = state.get("current_opinions") or {}
    
    # Python-side vote computation
    votes = {}
    for agent, op in initial_opinions.items():
        if agent == "rules":
            leaning = op.get("current_leaning")
            if leaning:
                votes[leaning] = votes.get(leaning, 0) + 1
        elif agent == "asst_ref":
            decision = op.get("decision")
            if decision:
                votes[decision] = votes.get(decision, 0) + 1
        elif agent == "var":
            rec = "Recommend Review" if op.get("recommend_review") else "Maintain On-Field Decision"
            votes[rec] = votes.get(rec, 0) + 1
            
    # Provide the hardcoded tallies to the Chief
    context = (
        f"Incident: {json.dumps(state['parsed_incident'])}\n"
        f"Reliability: {json.dumps(state['reliability_assessment'])}\n"
        f"Computed Vote Tallies (DO NOT IGNORE THIS): {json.dumps(votes)}\n"
        f"Initial Opinions: {json.dumps(initial_opinions)}\n"
        f"Debate Outcomes (Adjusted Confidences): {json.dumps(current_opinions)}"
    )
    decision = chief_agent.invoke({"input_data": context})
    
    # Manually inject the computed tallies into the output
    decision["initial_votes"] = votes
    
    return {"final_decision": decision, "messages": [format_msg("Chief Referee", decision.get("conversational_statement", ""), decision)]}

# ---------------------------------------------------------------------------
# Graph assembly
# ---------------------------------------------------------------------------

workflow = StateGraph(RefereeState)

workflow.add_node("parse", parse_node)
workflow.add_node("reliability", reliability_node)
workflow.add_node("coordinator", coordinator_node)
workflow.add_node("vision", vision_node)
workflow.add_node("rules", rules_node)
workflow.add_node("asst_ref", asst_ref_node)
workflow.add_node("var", var_node)
workflow.add_node("devils_advocate", devils_advocate_node)
workflow.add_node("debate_agent", debate_agent_node)
workflow.add_node("chief_referee", chief_referee_node)

workflow.set_entry_point("parse")
workflow.add_edge("parse", "reliability")
workflow.add_edge("reliability", "coordinator")

# fan-out: propose round
workflow.add_conditional_edges("coordinator", route_propose, ["vision", "rules", "asst_ref", "var"])

# fan-in
workflow.add_edge("vision", "devils_advocate")
workflow.add_edge("rules", "devils_advocate")
workflow.add_edge("asst_ref", "devils_advocate")
workflow.add_edge("var", "devils_advocate")

# fan-out: debate round
workflow.add_conditional_edges("devils_advocate", route_debate, ["debate_agent"])

# fan-in
workflow.add_edge("debate_agent", "chief_referee")

workflow.add_edge("chief_referee", END)

app_graph = workflow.compile()

if __name__ == "__main__":
    print(app_graph.get_graph().draw_mermaid())