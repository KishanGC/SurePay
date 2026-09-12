"""
Unit tests for Paytm SurePay Multi-Agent System.
Verifies all 3 core hackathon demo scenarios.
"""
import sys
from pathlib import Path

# Add backend directory to path
backend_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_dir))

from models.schemas import TransactionRequest, DecisionLevel, RiskLevel
from agents.orchestrator import SurePayOrchestrator
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_scenario_1_normal_payment():
    """
    Scenario 1 — Normal Payment
    - Recipient: rahul@hdfc (or rahul@upi)
    - Amount: ₹500
    - Expected: PASS — Payment proceeds quickly without friction.
    """
    orchestrator = SurePayOrchestrator()
    request = TransactionRequest(
        user_id="user_001",
        recipient_name="Rahul Sharma",
        upi_id="rahul@hdfc",
        amount=500.0,
        purpose="Dinner split"
    )

    result = orchestrator.analyze_transaction(request)

    assert result.decision == DecisionLevel.PASS
    assert result.overall_risk == RiskLevel.LOW
    assert result.requires_verification is False
    assert result.can_proceed is True
    assert len(result.agents) == 4  # Payee, Amount, Context, Decision
    print("\n[PASS] Scenario 1 verified successfully!")


def test_scenario_2_unusual_payment():
    """
    Scenario 2 — Unusual Payment
    - Recipient: newperson@upi
    - Amount: ₹15,000
    - Expected: STRONG_VERIFY — Show a personalized warning.
    """
    orchestrator = SurePayOrchestrator()
    request = TransactionRequest(
        user_id="user_001",
        recipient_name="Unknown Contact",
        upi_id="newperson@upi",
        amount=15000.0,
        purpose="Consulting fee"
    )

    result = orchestrator.analyze_transaction(request)

    assert result.decision == DecisionLevel.STRONG_VERIFY
    assert result.overall_risk == RiskLevel.HIGH
    assert result.requires_verification is True
    assert result.can_proceed is True
    assert "never paid" in result.explanation.lower()
    assert "higher" in result.explanation.lower()
    print("\n[PASS] Scenario 2 verified successfully!")


def test_scenario_3_user_override_and_payment():
    """
    Scenario 3 — User Override and Execution
    - Submitting payment after user confirmation
    - Verifies user retains ultimate control
    """
    pay_payload = {
        "user_id": "user_001",
        "recipient_name": "Vendor Store",
        "upi_id": "vendor_unknown@paytm",
        "amount": 12000.0,
        "purpose": "Equipment purchase",
        "override_reason": "User confirmed recipient over phone"
    }

    response = client.post("/api/pay", json=pay_payload)
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "SUCCESS"
    assert data["amount"] == 12000.0
    assert "Vendor Store" in data["message"]
    print("\n[PASS] Scenario 3 (User Override) verified successfully!")


def test_api_endpoints():
    """Verify health and demo-scenarios endpoints."""
    health = client.get("/health")
    assert health.status_code == 200
    assert health.json()["status"] == "ok"

    scenarios = client.get("/api/demo-scenarios")
    assert scenarios.status_code == 200
    assert len(scenarios.json()) == 3
    print("\n[PASS] API Endpoints verified successfully!")

from datetime import datetime

def test_database_persistence():
    """
    Verify SQLite database:
    1. Submitting a payment via /api/pay
    2. Querying /users/{user_id}/history retrieves the saved transaction
    3. Direct SQLAlchemy query finds the record in SQLite
    """
    from database.database import SessionLocal
    from database.models import TransactionModel

    unique_id = f"TXN_TEST_{int(datetime.now().timestamp())}"
    pay_payload = {
        "transaction_id": unique_id,
        "user_id": "user_001",
        "recipient_name": "Database Test Store",
        "upi_id": "dbtest@paytm",
        "amount": 999.0,
        "purpose": "Database Verification"
    }

    # 1. Post payment
    res = client.post("/api/pay", json=pay_payload)
    assert res.status_code == 200

    # 2. Query history API
    hist_res = client.get("/users/user_001/history")
    assert hist_res.status_code == 200
    txns = hist_res.json()["transactions"]
    matching = [t for t in txns if t["transaction_id"] == unique_id]
    assert len(matching) == 1
    assert matching[0]["amount"] == 999.0

    # 3. Direct SQLite verification
    db = SessionLocal()
    db_record = db.query(TransactionModel).filter(TransactionModel.transaction_id == unique_id).first()
    assert db_record is not None
    assert db_record.recipient_name == "Database Test Store"
    db.close()
    print("\n[PASS] Database Persistence (SQLite + SQLAlchemy) verified successfully!")
