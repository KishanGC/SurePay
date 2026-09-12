"""
SQLAlchemy ORM models for Paytm SurePay.
"""
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, DateTime
from .database import Base


class TransactionModel(Base):
    """
    SQLAlchemy model for storing transactions in SQLite.
    Maps directly to the 'transactions' table in surepay.db.
    """
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    transaction_id = Column(String, unique=True, index=True, nullable=False)
    user_id = Column(String, index=True, nullable=False, default="user_001")
    recipient_name = Column(String, nullable=False)
    upi_id = Column(String, index=True, nullable=False)
    amount = Column(Float, nullable=False)
    purpose = Column(String, nullable=True, default="Payment")
    status = Column(String, nullable=False, default="SUCCESS")
    risk_level = Column(String, nullable=True, default="LOW")
    decision = Column(String, nullable=True, default="PASS")
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    def to_dict(self):
        """
        Convert ORM object to dictionary for API responses & agent compatibility.
        Includes backward-compatible alias keys (payee_id, recipient, timestamp).
        """
        iso_time = self.created_at.isoformat() if self.created_at else None
        return {
            "id": self.id,
            "transaction_id": self.transaction_id,
            "user_id": self.user_id,
            "recipient_name": self.recipient_name,
            "recipient": self.recipient_name,  # Alias for backward compatibility
            "upi_id": self.upi_id,
            "payee_id": self.upi_id,          # Alias for backward compatibility
            "amount": self.amount,
            "purpose": self.purpose or "Payment",
            "status": self.status,
            "risk_level": self.risk_level or "LOW",
            "decision": self.decision or "PASS",
            "created_at": iso_time,
            "timestamp": iso_time              # Alias for backward compatibility
        }
