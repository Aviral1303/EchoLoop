from sqlalchemy.orm import Session

from app.db.database import Base, engine
from app.models import email

def init_db() -> None:
    # Create tables
    Base.metadata.create_all(bind=engine)

if __name__ == "__main__":
    init_db() 