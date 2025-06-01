from sqlalchemy import Column, String, Integer, DateTime, Boolean
from db_config import Base

class Evento(Base):
    __tablename__ = 'eventos'
    id = Column(String(50), primary_key=True)
    timestamp = Column(DateTime, nullable=False)
    lugar = Column(String(100), nullable=False)
    tipo = Column(String(10), nullable=False)
    filename = Column(String(255), nullable=True)
    reported = Column(Boolean, default=False)
    space = Column(Integer, default=1)
