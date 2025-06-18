from sqlalchemy import Column, String, Text, DateTime, Integer, BigInteger, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
import uuid
from app.db.base import Base

class Dataset(Base):
    __tablename__ = "datasets"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    source_type = Column(String(50), nullable=False)
    source_url = Column(Text)
    description = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Image(Base):
    __tablename__ = "images"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    dataset_id = Column(UUID(as_uuid=True))
    filename = Column(String(255), nullable=False)
    file_path = Column(Text)
    file_size = Column(BigInteger)
    mime_type = Column(String(100))
    width = Column(Integer)
    height = Column(Integer)
    metadata = Column(JSON)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class Upload(Base):
    __tablename__ = "uploads"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True))
    category = Column(String(50), nullable=False)
    original_filename = Column(String(255))
    stored_filename = Column(String(255))
    file_path = Column(Text)
    file_size = Column(BigInteger)
    processing_status = Column(String(50), default="pending")
    analysis_results = Column(JSON)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class APIUsage(Base):
    __tablename__ = "api_usage"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    endpoint = Column(String(255))
    user_id = Column(UUID(as_uuid=True))
    request_count = Column(Integer, default=1)
    date = Column(DateTime(timezone=True), server_default=func.current_date())
    created_at = Column(DateTime(timezone=True), server_default=func.now())
