"""
Payee Intelligence Agent: Specialist in recipient familiarity & history.
"""
from typing import Optional
from models.schemas import AgentResult, RiskLevel
from services.transaction_service import transaction_service


class PayeeAgent:
    def __init__(self):
        self.name = "Payee Intelligence Agent"
        self.role = "Recipient Familiarity Specialist"

    def analyze(self, user_id: str, payee_id: Optional[str] = None, recipient_name: Optional[str] = None, upi_id: Optional[str] = None) -> AgentResult:
        flags = []
        is_familiar = False

        for ident in [upi_id, recipient_name, payee_id]:
            if ident and transaction_service.is_payee_familiar(user_id, ident):
                is_familiar = True
                break

        if is_familiar:
            risk_level = RiskLevel.LOW
            display_name = recipient_name or upi_id or payee_id or "recipient"
            explanation = f"Familiar recipient ({display_name}). You have successfully paid this contact before."
            score = 0.1
        else:
            flags.append("UNFAMILIAR_PAYEE")
            flags.append("NEW_RECIPIENT")
            risk_level = RiskLevel.HIGH
            display_name = recipient_name or upi_id or payee_id or "recipient"
            explanation = f"You have never paid this recipient ({display_name}) before."
            score = 0.85

        return AgentResult(
            agent_name=self.name,
            role=self.role,
            risk_level=risk_level,
            explanation=explanation,
            flags=flags,
            score=score
        )
