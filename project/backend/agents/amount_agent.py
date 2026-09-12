"""
Amount Intelligence Agent: Personalized transaction amount specialist.
"""
from models.schemas import AgentResult, RiskLevel
from services.transaction_service import transaction_service


class AmountAgent:
    def __init__(self):
        self.name = "Amount Intelligence Agent"
        self.role = "Personalized Amount Specialist"

    def analyze(self, user_id: str, amount: float) -> AgentResult:
        flags = []
        profile = transaction_service.get_user_profile(user_id)
        typical_range = profile.get("typical_amount_range", {"min": 50, "max": 2000}) if profile else {"min": 50, "max": 2000}
        stats = transaction_service.calculate_statistics(user_id)
        avg_amt = stats["avg"]

        within_range = transaction_service.is_amount_within_range(user_id, amount)

        if within_range:
            risk_level = RiskLevel.LOW
            explanation = f"Amount ₹{amount:,.0f} is within your typical payment range (₹{typical_range['min']:,}–₹{typical_range['max']:,})."
            score = 0.1
        else:
            ratio = amount / max(avg_amt, 1.0)
            if ratio >= 5.0 or amount > typical_range["max"] * 3:
                flags.append("SIGNIFICANTLY_HIGH_AMOUNT")
                flags.append("ANOMALOUS_AMOUNT")
                risk_level = RiskLevel.HIGH
                score = 0.9
                explanation = f"₹{amount:,.0f} is significantly higher ({ratio:.1f}x) than your typical payment (avg ~₹{avg_amt:,.0f})."
            else:
                flags.append("ABOVE_AVERAGE_AMOUNT")
                risk_level = RiskLevel.MEDIUM
                score = 0.5
                explanation = f"Amount ₹{amount:,.0f} is above your typical maximum of ₹{typical_range['max']:,}."

        return AgentResult(
            agent_name=self.name,
            role=self.role,
            risk_level=risk_level,
            explanation=explanation,
            flags=flags,
            score=score
        )
