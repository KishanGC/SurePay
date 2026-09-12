"""
Transaction service for Paytm SurePay.
Uses SQLite and SQLAlchemy for real persistent transaction storage,
with fallback and user profile loading from mock_transactions.json.
"""
import json
from datetime import datetime, timezone
from pathlib import Path
from statistics import mean, median
from typing import Any, Dict, List, Optional
from sqlalchemy.orm import Session

from database.database import SessionLocal, init_db
from database.models import TransactionModel

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_FILE = BASE_DIR / "data" / "mock_transactions.json"


class TransactionService:
    def __init__(self, data_file: Path = DATA_FILE):
        self.data_file = data_file
        # Ensure database tables exist
        init_db()
        self.profile_data = self._load_profile_data()
        # Seed initial data into SQLite if the table is empty
        self._seed_initial_data_if_empty()

    def _load_profile_data(self) -> Dict[str, Any]:
        """Load static user profiles (frequent contacts & typical ranges) from JSON."""
        try:
            with open(self.data_file, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            return {"user_profiles": [], "transactions": []}

    def _seed_initial_data_if_empty(self):
        """Seed initial transactions from JSON into SQLite if database is empty."""
        db: Session = SessionLocal()
        try:
            count = db.query(TransactionModel).count()
            if count == 0:
                raw_txns = self.profile_data.get("transactions", [])
                for raw in raw_txns:
                    # Parse timestamp if present
                    ts = datetime.now(timezone.utc)
                    if "timestamp" in raw:
                        try:
                            ts = datetime.fromisoformat(raw["timestamp"].replace("Z", "+00:00"))
                        except Exception:
                            pass

                    txn = TransactionModel(
                        transaction_id=raw.get("id", f"TXN_{int(ts.timestamp())}"),
                        user_id=raw.get("user_id", "user_001"),
                        recipient_name=raw.get("recipient", raw.get("payee_id", "Recipient")),
                        upi_id=raw.get("payee_id", "upi@paytm"),
                        amount=float(raw.get("amount", 0)),
                        purpose=raw.get("purpose", "Payment"),
                        status=raw.get("status", "SUCCESS"),
                        risk_level=raw.get("risk_level", "LOW"),
                        decision=raw.get("decision", "PASS"),
                        created_at=ts
                    )
                    db.add(txn)
                db.commit()
                print(f"Seeded {len(raw_txns)} initial transactions into SQLite database.")
        except Exception as e:
            db.rollback()
            print(f"Notice: Initial seeding skipped or failed: {e}")
        finally:
            db.close()

    def get_user_profile(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Retrieve user profile for limits and frequent payee lists."""
        for profile in self.profile_data.get("user_profiles", []):
            if profile.get("user_id") == user_id:
                return profile
        profiles = self.profile_data.get("user_profiles", [])
        return profiles[0] if profiles else None

    def get_user_history(self, user_id: str, db: Optional[Session] = None) -> List[Dict[str, Any]]:
        """
        Retrieve all transactions for a user directly from SQLite database.
        Ordered by newest first.
        """
        local_session = False
        if db is None:
            db = SessionLocal()
            local_session = True

        try:
            records = (
                db.query(TransactionModel)
                .filter(TransactionModel.user_id == user_id)
                .order_by(TransactionModel.id.desc())
                .all()
            )
            return [r.to_dict() for r in records]
        finally:
            if local_session:
                db.close()

    def add_transaction(self, txn_data: Dict[str, Any], db: Optional[Session] = None) -> Dict[str, Any]:
        """
        Save a new completed transaction into the SQLite database.
        """
        local_session = False
        if db is None:
            db = SessionLocal()
            local_session = True

        try:
            ts = txn_data.get("timestamp") or datetime.now(timezone.utc)
            if isinstance(ts, str):
                try:
                    ts = datetime.fromisoformat(ts.replace("Z", "+00:00"))
                except Exception:
                    ts = datetime.now(timezone.utc)

            new_record = TransactionModel(
                transaction_id=txn_data.get("transaction_id") or txn_data.get("id") or f"TXN{int(datetime.now().timestamp())}",
                user_id=txn_data.get("user_id", "user_001"),
                recipient_name=txn_data.get("recipient_name") or txn_data.get("recipient", "Recipient"),
                upi_id=txn_data.get("upi_id") or txn_data.get("payee_id", "upi@paytm"),
                amount=float(txn_data.get("amount", 0)),
                purpose=txn_data.get("purpose", "Payment"),
                status=txn_data.get("status", "SUCCESS"),
                risk_level=txn_data.get("risk_level", "LOW"),
                decision=txn_data.get("decision", "PASS"),
                created_at=ts
            )
            db.add(new_record)
            db.commit()
            db.refresh(new_record)
            return new_record.to_dict()
        except Exception as e:
            db.rollback()
            raise e
        finally:
            if local_session:
                db.close()

    def calculate_statistics(self, user_id: str) -> Dict[str, float]:
        """Calculate statistical metrics from SQLite transaction history."""
        history = self.get_user_history(user_id)
        if not history:
            return {"avg": 500.0, "median": 500.0, "max": 2000.0, "std_dev": 300.0}

        amounts = [float(txn.get("amount", 0)) for txn in history]
        avg = mean(amounts)
        med = median(amounts)
        max_amt = max(amounts)
        std_dev = (sum((x - avg) ** 2 for x in amounts) / len(amounts)) ** 0.5 if len(amounts) > 1 else 100.0
        return {"avg": avg, "median": med, "max": max_amt, "std_dev": std_dev}

    def is_payee_familiar(self, user_id: str, payee_identifier: Optional[str]) -> bool:
        """
        Check if recipient is familiar:
        1. Checks user profile frequent payees list.
        2. Checks SQLite database if user has previously made a successful payment to this recipient!
        """
        if not payee_identifier:
            return False
        target = payee_identifier.strip().lower()

        # Check 1: User profile frequent contacts
        profile = self.get_user_profile(user_id)
        if profile:
            frequent = [p.lower() for p in profile.get("frequent_payees", [])]
            if any(target == f or target in f or f in target for f in frequent):
                return True

        # Check 2: Past transactions in SQLite
        history = self.get_user_history(user_id)
        for txn in history:
            recip = (txn.get("recipient_name") or txn.get("recipient") or "").lower()
            upi = (txn.get("upi_id") or txn.get("payee_id") or "").lower()
            if target == recip or target == upi or target in recip or target in upi:
                return True

        return False

    def is_amount_within_range(self, user_id: str, amount: float) -> bool:
        profile = self.get_user_profile(user_id)
        if not profile:
            return 50.0 <= amount <= 2000.0
        r = profile.get("typical_amount_range", {})
        min_amt = float(r.get("min", 50))
        max_amt = float(r.get("max", 2000))
        return min_amt <= amount <= max_amt

    def is_transaction_time_normal(self, user_id: str, timestamp: datetime) -> bool:
        profile = self.get_user_profile(user_id)
        if not profile:
            return True
        hour = timestamp.hour
        for time_window in profile.get("preferred_times", []):
            try:
                start, end = time_window.split("-")
                start_hour = int(start.split(":")[0])
                end_hour = int(end.split(":")[0])
                if start_hour <= hour <= end_hour:
                    return True
            except Exception:
                continue
        return False


transaction_service = TransactionService()
