"""
Context Analysis Agent: Transaction pattern & legitimacy specialist.
"""
from datetime import datetime, timezone, timedelta
from typing import Optional
from models.schemas import AgentResult, RiskLevel
from services.transaction_service import transaction_service


class ContextAgent:
    """
    Responsibilities:
    - Check whether transaction resembles standard payment behavior
    - Account for Indian Standard Time (IST = UTC+5:30)
    - Reduce unnecessary false alarms for routine transactions
    """
    def __init__(self):
        self.name = "Context Analysis Agent"
        self.role = "Transaction Pattern Specialist"

    def analyze(self, user_id: str, timestamp: Optional[datetime] = None, purpose: Optional[str] = None, channel: str = "UPI") -> AgentResult:
        flags = []
        
        # Convert to IST if UTC
        raw_ts = timestamp or datetime.now(timezone.utc)
        if raw_ts.tzinfo is not None:
            ist_ts = raw_ts.astimezone(timezone(timedelta(hours=5, minutes=30)))
        else:
            ist_ts = raw_ts

        is_normal_time = transaction_service.is_transaction_time_normal(user_id, ist_ts)

        if is_normal_time:
            risk_level = RiskLevel.LOW
            explanation = f"Standard {channel} channel during normal active hours ({ist_ts.strftime('%I:%M %p')})."
            score = 0.1
        else:
            flags.append("UNUSUAL_TIME_WINDOW")
            risk_level = RiskLevel.MEDIUM
            explanation = f"Payment initiated during off-peak hours ({ist_ts.strftime('%I:%M %p')})."
            score = 0.35

        return AgentResult(
            agent_name=self.name,
            role=self.role,
            risk_level=risk_level,
            explanation=explanation,
            flags=flags,
            score=score
        )
