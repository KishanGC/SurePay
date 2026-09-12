"""
Payment Guardian Orchestrator: Coordinates the full SurePay multi-agent pipeline.
"""
from datetime import datetime, timezone
from models.schemas import TransactionRequest, SurePayResponse
from agents.payee_agent import PayeeAgent
from agents.amount_agent import AmountAgent
from agents.context_agent import ContextAgent
from agents.decision_agent import DecisionAgent
from services.transaction_service import transaction_service


class SurePayOrchestrator:
    def __init__(self):
        self.payee_agent = PayeeAgent()
        self.amount_agent = AmountAgent()
        self.context_agent = ContextAgent()
        self.decision_agent = DecisionAgent()
        self.service = transaction_service

    def analyze_transaction(self, request: TransactionRequest) -> SurePayResponse:
        ts = request.timestamp or datetime.now(timezone.utc)
        user_id = request.user_id or "user_001"

        payee_result = self.payee_agent.analyze(
            user_id=user_id,
            payee_id=request.payee_id,
            recipient_name=request.recipient_name,
            upi_id=request.upi_id
        )

        amount_result = self.amount_agent.analyze(
            user_id=user_id,
            amount=request.amount
        )

        context_result = self.context_agent.analyze(
            user_id=user_id,
            timestamp=ts,
            purpose=request.purpose,
            channel=request.channel
        )

        agent_results = [payee_result, amount_result, context_result]

        recipient_display = request.recipient_name or request.upi_id or request.payee_id or "this recipient"
        decision_data = self.decision_agent.decide(agent_results, request.amount, recipient_display)

        from models.schemas import AgentResult
        agent_results.append(AgentResult(
            agent_name=self.decision_agent.name,
            role=self.decision_agent.role,
            risk_level=decision_data["overall_risk"],
            explanation=decision_data["explanation"],
            flags=[decision_data["decision"].value],
            score=0.95 if decision_data["decision"] == "STRONG_VERIFY" else (0.5 if decision_data["decision"] == "VERIFY" else 0.1)
        ))

        txn_id = f"TXN{int(ts.timestamp())}{hash(recipient_display) % 10000:04d}"

        return SurePayResponse(
            transaction_id=txn_id,
            decision=decision_data["decision"],
            overall_risk=decision_data["overall_risk"],
            confidence=decision_data["confidence"],
            agents=agent_results,
            explanation=decision_data["explanation"],
            recommendation=decision_data["recommendation"],
            can_proceed=decision_data["can_proceed"],
            requires_verification=decision_data["requires_verification"],
            analyzed_at=ts
        )
