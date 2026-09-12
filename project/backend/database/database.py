"""
Database configuration and session management for Paytm SurePay.
Uses SQLite and SQLAlchemy ORM.
"""
from pathlib import Path
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

# Path to SQLite database file in the backend directory
BASE_DIR = Path(__file__).resolve().parent.parent
DB_FILE = BASE_DIR / "surepay.db"
SQLALCHEMY_DATABASE_URL = f"sqlite:///{DB_FILE}"

# check_same_thread=False is needed only for SQLite so multiple FastAPI threads can share connections
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    echo=False
)

# Each instance of SessionLocal will be a database session
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class which our database models will inherit from
Base = declarative_base()


def get_db():
    """
    FastAPI dependency that provides an independent database session per request.
    Automatically closes the session when the request is finished.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """Create all tables in the SQLite database."""
    Base.metadata.create_all(bind=engine)
