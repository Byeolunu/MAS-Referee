from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

class Conflict(BaseModel):
    field: str = Field(description="The field where there is a contradiction (e.g., 'location')")
    text_says: str = Field(description="What the explicit text description said")
    video_says: str = Field(description="What the video seems to show")

class LedgerEntry(BaseModel):
    id: str = Field(description="Evidence ID (e.g., 'Evidence #1')")
    observation: str = Field(description="The specific factual observation")
    source: str = Field(description="'Text', 'Video', or 'Both'")


class ParsedIncident(BaseModel):
    location: str = Field(default="Not specified")
    ball_state: str = Field(default="Not specified")
    players_involved: List[str] = Field(default_factory=list)
    contact_point: str = Field(default="Not specified")
    body_parts_in_contact: List[str] = Field(default_factory=list)
    referee_decision: str = Field(default="Not specified")
    video_available: bool = Field(default=False)
    conflicts: List[Conflict] = Field(
        default_factory=list,
        description="List any contradictions between the explicit text description and the video footage."
    )
    evidence_ledger: List[LedgerEntry] = Field(
        default_factory=list,
        description="Numbered ledger of all factual observations extracted. e.g. Evidence #1, Evidence #2."
    )

class ReliabilityAssessment(BaseModel):
    video_quality: str = Field(description="Assessment of video quality/resolution/framerate.")
    occlusion: str = Field(description="Are key elements blocked from view?")
    contradictions: str = Field(description="Summary of any text vs video conflicts.")
    text_reliability: int = Field(description="Reliability score of the text source (0-100%).")
    video_reliability: Optional[int] = Field(description="Reliability score of the video source (0-100%).")
    evidence_completeness: int = Field(description="Completeness of the evidence (0-100%).")
    overall_reliability: int = Field(description="Overall reliability score (0-100%) reflecting trustworthiness.")

class CoordinatorDecision(BaseModel):
    incident_type: str = Field(description="Type of incident: 'Handball', 'Offside', 'Foul', etc.")
    confidence: int = Field(description="Confidence in this classification")
    required_agents: List[str] = Field(description="List of agent names to launch, e.g., ['vision', 'rules', 'var', 'devils_advocate']")
    reason: str = Field(description="Why these specific agents were selected")

class EvidenceAssessment(BaseModel):
    observed_facts: List[str] = Field(default_factory=list, description="Facts clearly visible or stated.")
    unknowns: List[str] = Field(default_factory=list, description="Things that cannot be determined.")
    missing_evidence: List[str] = Field(default_factory=list, description="Missing angles or contexts needed.")
    conversational_statement: str = Field(description="Natural dialogue stating your position.")
    confidence: int = Field(description="Confidence score (0-100), bounded by Reliability Agent.")
    what_would_change_my_mind: str = Field(description="What specific evidence would change your mind.")

class WeightedEvidence(BaseModel):
    fact: str = Field(description="The specific fact")
    supports: str = Field(description="What conclusion this fact supports (e.g. 'Offense', 'Play On')")
    strength: int = Field(description="Strength of this evidence (0-10)")

class RulesAssessment(BaseModel):
    applicable_laws: List[str] = Field(default_factory=list)
    weighted_evidence: List[WeightedEvidence] = Field(default_factory=list)
    current_leaning: str = Field(description="Your current leaning based on probabilities (e.g., 'Foul', 'Play On')")
    conversational_statement: str = Field(description="Natural dialogue stating your position and reasoning.")
    confidence: int = Field(description="Confidence score (0-100), bounded by Reliability Agent.")
    what_would_change_my_mind: str = Field(description="What specific evidence would change your mind.")

class AsstRefAssessment(BaseModel):
    in_my_lane: bool = Field(description="Is this an offside/throw-in/corner decision?")
    decision: str = Field(description="Decision on the play")
    weighted_evidence: List[WeightedEvidence] = Field(default_factory=list)
    law_reference: str = Field(default="Not applicable")
    conversational_statement: str = Field(description="Natural dialogue stating your position.")
    confidence: int = Field(description="Confidence score (0-100), bounded by Reliability Agent.")
    what_would_change_my_mind: str = Field(description="What specific evidence would change your mind.")

class VARAssessment(BaseModel):
    likely_on_field_decision: str = Field(description="What the referee likely called. Default to 'Play On' if not specified.")
    clear_and_obvious: bool = Field(description="Is there a clear and obvious error in that decision?")
    recommend_review: bool = Field(description="Should an On-Field Review be recommended?")
    threshold_reached: bool = Field(description="Did the evidence cross the high threshold for intervention?")
    threshold_reason: str = Field(description="Explanation of why the threshold was or wasn't met.")
    conversational_statement: str = Field(description="Natural dialogue stating your position.")
    confidence: int = Field(description="Confidence score (0-100), bounded by Reliability Agent.")
    what_would_change_my_mind: str = Field(description="What would cross the threshold for intervention?")

class DevilAdvocateAssessment(BaseModel):
    target_agent: str = Field(description="The specific agent you are challenging (e.g., 'Rules Expert')")
    challenge: str = Field(description="Your specific challenge to one of their heavily weighted evidence points or leaning.")
    conversational_statement: str = Field(description="Natural dialogue posing your challenge.")
    confidence: int = Field(description="Confidence in your critique.")

class DebateRoundUpdate(BaseModel):
    acknowledgment: str = Field(description="Acknowledge the Devil's Advocate's specific challenge.")
    adjusted_confidence: int = Field(description="Your new confidence score after the challenge. May be lower or the same.")
    conversational_statement: str = Field(description="Natural dialogue replying to the challenge and stating your new confidence.")

class ChiefDecision(BaseModel):
    decision: str = Field(description="The final definitive ruling (e.g., 'Maintain on-field decision (Play On)')")
    reasoning_summary: str = Field(description="Summary acting as a judge evaluating the evidence and rules, not introducing new facts.")
    missing_evidence: List[str] = Field(default_factory=list, description="List of evidence that was insufficient or missing.")
    conversational_statement: str = Field(description="Natural dialogue stating the panel's conclusion.")