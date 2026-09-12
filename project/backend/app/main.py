"""
FastAPI application for Paytm SurePay Backend.
Integrates SQLite + SQLAlchemy database for persistent transaction tracking.
"""
from datetime import datetime, timezone
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from database.database import get_db, init_db
from models.schemas import (
    TransactionRequest,
    SurePayResponse,
    PaymentSubmitRequest,
    PaymentSubmitResponse
)
from agents.orchestrator import SurePayOrchestrator

app = FastAPI(
    title="Paytm SurePay API",
    description="AI-Powered Payment Safety Layer & Wrong Payment Prevention with SQLite Database",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize database tables on application load
init_db()

orchestrator = SurePayOrchestrator()


@app.get("/")
def root():
    return {
        "service": "Paytm SurePay Multi-Agent API",
        "version": "1.0.0",
        "database": "SQLite (surepay.db)",
        "status": "active"
    }


@app.get("/health")
def health_check():
    return {"status": "ok", "service": "paytm-surepay-api", "database": "connected"}


@app.post("/analyze", response_model=SurePayResponse)
@app.post("/api/analyze", response_model=SurePayResponse)
def analyze_transaction(request: TransactionRequest) -> SurePayResponse:
    try:
        return orchestrator.analyze_transaction(request)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"SurePay analysis failed: {str(e)}")


@app.post("/api/pay", response_model=PaymentSubmitResponse)
def submit_payment(payload: PaymentSubmitRequest, db: Session = Depends(get_db)) -> PaymentSubmitResponse:
    """
    Simulate payment execution and save real transaction record into SQLite.
    """
    ts = datetime.now(timezone.utc)
    txn_id = payload.transaction_id or f"TXN{int(ts.timestamp())}"

    try:
        saved_txn = orchestrator.service.add_transaction({
            "transaction_id": txn_id,
            "user_id": payload.user_id,
            "recipient_name": payload.recipient_name,
            "upi_id": payload.upi_id,
            "amount": payload.amount,
            "purpose": payload.purpose or "Payment",
            "status": "SUCCESS",
            "risk_level": "LOW",
            "decision": "PASS",
            "timestamp": ts
        }, db=db)

        return PaymentSubmitResponse(
            status="SUCCESS",
            transaction_id=saved_txn["transaction_id"],
            amount=saved_txn["amount"],
            recipient_name=saved_txn["recipient_name"],
            upi_id=saved_txn["upi_id"],
            message=f"₹{saved_txn['amount']:,.0f} sent to {saved_txn['recipient_name']} successfully.",
            timestamp=ts
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to record transaction in database: {str(e)}")


@app.get("/api/demo-scenarios")
def get_demo_scenarios():
    return [
        {
            "id": "scenario_1",
            "title": "Scenario 1: Normal Payment",
            "recipientName": "Rahul Sharma",
            "upiId": "rahul@hdfc",
            "amount": 500,
            "purpose": "Dinner split",
            "expectedDecision": "PASS",
            "expectedBehavior": "Payment proceeds instantly without interruption"
        },
        {
            "id": "scenario_2",
            "title": "Scenario 2: Unusual Payment (New Recipient + High Amount)",
            "recipientName": "Unknown Contact",
            "upiId": "newperson@upi",
            "amount": 15000,
            "purpose": "Consulting fee",
            "expectedDecision": "STRONG_VERIFY",
            "expectedBehavior": "Personalized warning screen requiring user verification"
        },
        {
            "id": "scenario_3",
            "title": "Scenario 3: User Override Demo",
            "recipientName": "Vendor Store",
            "upiId": "vendor_unknown@paytm",
            "amount": 12000,
            "purpose": "Equipment purchase",
            "expectedDecision": "STRONG_VERIFY",
            "expectedBehavior": "Warning displayed -> User clicks 'Proceed Anyway' -> Payment completes"
        }
    ]


@app.get("/users/{user_id}/profile")
def get_user_profile(user_id: str):
    profile = orchestrator.service.get_user_profile(user_id)
    if not profile:
        raise HTTPException(status_code=404, detail="User not found")
    history = orchestrator.service.get_user_history(user_id)
    return {"profile": profile, "transaction_history": history}


@app.get("/users/{user_id}/history")
@app.get("/api/transactions")
def get_user_history(user_id: str = "user_001", db: Session = Depends(get_db)):
    """Retrieve transaction history directly from SQLite database."""
    history = orchestrator.service.get_user_history(user_id, db=db)
    return {"user_id": user_id, "transactions": history}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
