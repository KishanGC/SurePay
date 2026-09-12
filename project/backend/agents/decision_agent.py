"""
Decision & Explanation Agent: Final safety decision-maker and user communication specialist.
"""
from typing import List, Dict, Any
from models.schemas import AgentResult, RiskLevel, DecisionLevel


class DecisionAgent:
    """
    Responsibilities:
    - Combine outputs from specialist agents
    - Calculate overall risk level
    - Decide one of: PASS, VERIFY, STRONG_VERIFY
    - Generate clear, human-readable personalized explanation
    - Never automatically block money - user always remains in control
    """
    def __init__(self):
        self.name = "Decision & Explanation Agent"
        self.role = "Safety Decision & Communication Specialist"

    def decide(self, agent_results: List[AgentResult], amount: float, recipient_display: str) -> Dict[str, Any]:
        high_risk_agents = [a for a in agent_results if a.risk_level == RiskLevel.HIGH]
        med_risk_agents = [a for a in agent_results if a.risk_level == RiskLevel.MEDIUM]

        # Scenario 1: Familiar payee + Normal amount -> PASS
        # Context (e.g. minor time variance) alone should NOT block/warn on a normal payment to familiar contact
        if not high_risk_agents and (not med_risk_agents or (len(med_risk_agents) == 1 and med_risk_agents[0].agent_name == "Context Analysis Agent" and amount <= 2000)):
            decision = DecisionLevel.PASS
            overall_risk = RiskLevel.LOW
            requires_verification = False
            recommendation = "PROCEED"
            explanation = f"Familiar recipient and normal amount. Safe to proceed without interruption."
            confidence = 0.98

        elif len(high_risk_agents) >= 2 or (len(high_risk_agents) == 1 and len(med_risk_agents) >= 1):
            decision = DecisionLevel.STRONG_VERIFY
            overall_risk = RiskLevel.HIGH
            requires_verification = True
            recommendation = "STRONG_VERIFY"
            explanation = (
                f"You have never paid {recipient_display} before, and ₹{amount:,.0f} is significantly higher "
                f"than your usual transaction amount. Please verify the recipient and amount before proceeding."
            )
            confidence = 0.94

        elif len(high_risk_agents) == 1:
            decision = DecisionLevel.STRONG_VERIFY if amount > 5000 else DecisionLevel.VERIFY
            overall_risk = RiskLevel.HIGH if amount > 5000 else RiskLevel.MEDIUM
            requires_verification = True
            recommendation = "VERIFY"
            explanation = f"Notice: {high_risk_agents[0].explanation} Please verify before sending."
            confidence = 0.90

        else:
            decision = DecisionLevel.VERIFY
            overall_risk = RiskLevel.MEDIUM
            requires_verification = True
            recommendation = "VERIFY"
            explanation = f"Notice: {med_risk_agents[0].explanation}"
            confidence = 0.88

        return {
            "decision": decision,
            "overall_risk": overall_risk,
            "confidence": confidence,
            "explanation": explanation,
            "recommendation": recommendation,
            "requires_verification": requires_verification,
            "can_proceed": True
        }
