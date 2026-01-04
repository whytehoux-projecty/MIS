from sqlalchemy import Column, Integer, DateTime
from sqlalchemy.sql import func
from app.database import Base as DBBase

class BaseModel(DBBase):
    __abstract__ = True
    
    id = Column(Integer, primary_key=True, index=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())