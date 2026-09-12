"""
Pydantic schemas for Paytm SurePay Multi-Agent System.
"""
from datetime import datetime, timezone
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field
from enum import Enum


class RiskLevel(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"


class DecisionLevel(str, Enum):
    PASS = "PASS"
    VERIFY = "VERIFY"
    STRONG_VERIFY = "STRONG_VERIFY"


class TransactionRequest(BaseModel):
    user_id: str = Field(default="user_001", description="Unique identifier of the user")
    payee_id: Optional[str] = Field(default=None, description="Recipient identifier or UPI ID")
    recipient_name: Optional[str] = Field(default=None, description="Recipient contact name")
    upi_id: Optional[str] = Field(default=None, description="Recipient UPI address")
    amount: float = Field(..., gt=0, description="Transaction amount in INR")
    currency: str = Field(default="INR", description="Currency code")
    channel: str = Field(default="UPI", description="Payment channel (UPI, NETBANKING, CARD)")
    timestamp: Optional[datetime] = Field(default=None, description="Transaction timestamp")
    merchant_category: Optional[str] = Field(default=None, description="Category of merchant if applicable")
    purpose: Optional[str] = Field(default=None, description="Note or purpose for payment")


class AgentResult(BaseModel):
    agent_name: str = Field(..., description="Name of the analysis agent")
    role: Optional[str] = Field(default=None, description="Specialized role of agent")
    risk_level: RiskLevel = Field(..., description="Risk assessment level: LOW, MEDIUM, HIGH")
    explanation: str = Field(..., description="Human-readable explanation of findings")
    flags: List[str] = Field(default_factory=list, description="Specific risk flags raised")
    score: Optional[float] = Field(default=None, description="Internal risk score (0 to 1)")


class SurePayResponse(BaseModel):
    transaction_id: str = Field(..., description="Unique transaction identifier")
    decision: DecisionLevel = Field(..., description="Final decision: PASS, VERIFY, STRONG_VERIFY")
    overall_risk: RiskLevel = Field(..., description="Aggregated risk level")
    confidence: float = Field(..., ge=0, le=1, description="Confidence score")
    agents: List[AgentResult] = Field(default_factory=list, description="Results from all specialist agents")
    explanation: str = Field(..., description="Explainable decision rationale for user")
    recommendation: str = Field(default="PROCEED", description="Recommendation guidance")
    can_proceed: bool = Field(default=True, description="User always has choice to proceed")
    requires_verification: bool = Field(default=False, description="Whether verification modal is displayed")
    analyzed_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))


class PaymentSubmitRequest(BaseModel):
    transaction_id: Optional[str] = Field(default=None)
    user_id: str = Field(default="user_001")
    recipient_name: str
    upi_id: str
    amount: float = Field(..., gt=0)
    purpose: Optional[str] = None
    override_reason: Optional[str] = None


class PaymentSubmitResponse(BaseModel):
    status: str = "SUCCESS"
    transaction_id: str
    amount: float
    recipient_name: str
    upi_id: str
    message: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
