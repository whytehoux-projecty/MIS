# 🗄️ Database Schema Alignment Plan

> **Document ID:** PLAN-03  
> **Priority:** 🟡 High  
> **Phase:** 2  
> **Estimated Effort:** 1-2 days  
> **Dependencies:** Phase 1 complete (basic system working)

---

## 📋 Overview

The current database schema deviates from the documented specification in `login_logic_flow.md`. This plan outlines the changes needed to fully align the schema with the documentation.

### Schema Comparison

| Documented Field | Current Status | Action Needed |
|------------------|----------------|---------------|
| `session_id` (UUID) | ✅ As `id` | None |
| `service_id` | ✅ Present | None |
| `service_name` | ❌ Missing | Add via join |
| `session_code` (20 chars) | ❌ Missing | Add column |
| `qr_code_pattern` (20 chars) | ❌ Missing | Add column |
| `obfuscation_map` (JSON) | ❌ Missing | Add column |
| `pin` (6 digits) | ✅ Present | None |
| `member_id` | ✅ As `user_auth_key` | None |
| `status` (enum) | ⚠️ Split into booleans | Consider enum |
| `failed_attempts` | ❌ Missing | Add column |
| `created_at` | ✅ In base model | None |
| `validated_at` | ✅ As `scanned_at` | None |
| `expires_at` | ✅ Present | None |
| `ip_address` | ❌ Missing | Add columns |

---

## 🎯 Objectives

1. Add missing columns to match documentation
2. Create proper database migration
3. Update all services to use new fields
4. Ensure backward compatibility during migration

---

## 📁 Files to Create/Modify

### Files to Create

| File | Purpose |
|------|---------|
| `alembic/versions/xxx_schema_alignment.py` | Database migration |

### Files to Modify

| File | Changes |
|------|---------|
| `app/models/qr_session.py` | Add new columns |
| `app/services/qr_service.py` | Use new fields |
| `app/services/pin_service.py` | Use new fields |

---

## 🛠️ Implementation Steps

### Step 1: Create Migration Script

**File:** `alembic/versions/20260110_schema_alignment.py`

```python
"""Align QRSession schema with documentation

Revision ID: schema_alignment_v1
Revises: previous_revision
Create Date: 2026-01-10
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers
revision = 'schema_alignment_v1'
down_revision = 'previous_revision'  # Update this
branch_labels = None
depends_on = None

def upgrade():
    """Add missing columns to qr_sessions table."""
    
    # 1. Session code (full 20-char alphanumeric code)
    op.add_column('qr_sessions',
        sa.Column('session_code', sa.String(20), nullable=True)
    )
    
    # 2. QR code pattern (obfuscated version with X's)
    op.add_column('qr_sessions',
        sa.Column('qr_code_pattern', sa.String(20), nullable=True)
    )
    
    # 3. Obfuscation map (which positions are hidden)
    op.add_column('qr_sessions',
        sa.Column('obfuscation_map', sa.JSON, nullable=True)
    )
    
    # 4. Failed attempts counter
    op.add_column('qr_sessions',
        sa.Column('failed_attempts', sa.Integer, nullable=False, server_default='0')
    )
    
    # 5. Lockout timestamps
    op.add_column('qr_sessions',
        sa.Column('locked_at', sa.DateTime, nullable=True)
    )
    op.add_column('qr_sessions',
        sa.Column('lockout_until', sa.DateTime, nullable=True)
    )
    
    # 6. PIN expiration (separate from QR expiration)
    op.add_column('qr_sessions',
        sa.Column('pin_expires_at', sa.DateTime, nullable=True)
    )
    
    # 7. IP address tracking
    op.add_column('qr_sessions',
        sa.Column('client_ip', sa.String(45), nullable=True)
    )
    op.add_column('qr_sessions',
        sa.Column('scanner_ip', sa.String(45), nullable=True)
    )
    op.add_column('qr_sessions',
        sa.Column('verifier_ip', sa.String(45), nullable=True)
    )
    
    # 8. Status enum (optional - for cleaner status tracking)
    # Using PostgreSQL enum for production, or string for SQLite
    op.add_column('qr_sessions',
        sa.Column('status', sa.String(20), nullable=False, server_default='pending')
    )
    
    # 9. Create indexes for better query performance
    op.create_index(
        'ix_qr_sessions_service_status',
        'qr_sessions',
        ['service_id', 'status', 'expires_at']
    )
    op.create_index(
        'ix_qr_sessions_expiration',
        'qr_sessions',
        ['expires_at']
    )

def downgrade():
    """Remove added columns."""
    op.drop_index('ix_qr_sessions_expiration')
    op.drop_index('ix_qr_sessions_service_status')
    
    op.drop_column('qr_sessions', 'status')
    op.drop_column('qr_sessions', 'verifier_ip')
    op.drop_column('qr_sessions', 'scanner_ip')
    op.drop_column('qr_sessions', 'client_ip')
    op.drop_column('qr_sessions', 'pin_expires_at')
    op.drop_column('qr_sessions', 'lockout_until')
    op.drop_column('qr_sessions', 'locked_at')
    op.drop_column('qr_sessions', 'failed_attempts')
    op.drop_column('qr_sessions', 'obfuscation_map')
    op.drop_column('qr_sessions', 'qr_code_pattern')
    op.drop_column('qr_sessions', 'session_code')
```

---

### Step 2: Update QRSession Model

**File:** `app/models/qr_session.py`

```python
from sqlalchemy import Column, String, Integer, Boolean, DateTime, ForeignKey, JSON, Enum
from sqlalchemy.orm import relationship
from app.models.base import BaseModel
import enum

class QRSessionStatus(str, enum.Enum):
    """
    Session status as documented:
    - pending: QR generated, waiting for scan
    - pin_generated: Mobile app scanned, PIN created
    - completed: PIN verified, login successful
    - expired: Session timed out
    - failed: Too many failed attempts / locked
    """
    PENDING = "pending"
    PIN_GENERATED = "pin_generated"
    COMPLETED = "completed"
    EXPIRED = "expired"
    FAILED = "failed"

class QRSession(BaseModel):
    """
    QR-based login session.
    
    Aligned with login_logic_flow.md documentation.
    Table: temporary_login_requests (as documented) / qr_sessions (current)
    """
    __tablename__ = "qr_sessions"
    
    # =====================
    # Core Fields
    # =====================
    
    # Token used in QR code (short identifier)
    token = Column(String, unique=True, index=True, nullable=False)
    
    # Service requesting authentication
    service_id = Column(Integer, ForeignKey("registered_services.id"), nullable=False)
    
    # =====================
    # Session Code Fields (NEW - from documentation)
    # =====================
    
    # Full 20-character session code (alphanumeric + symbols, case-sensitive)
    # Example: "q1W2E3r4T5Y6u7I8o9p0"
    session_code = Column(String(20), nullable=True)
    
    # Obfuscated QR pattern (10 chars visible, 10 replaced with 'X')
    # Example: "q1XXX3X4TXX6uXI8X9XX"
    qr_code_pattern = Column(String(20), nullable=True)
    
    # JSON map of which positions are hidden
    # Example: {"hidden": [2, 3, 4, 6, 9, 10, 14, 15, 18, 19]}
    obfuscation_map = Column(JSON, nullable=True)
    
    # =====================
    # User & PIN Fields
    # =====================
    
    # When mobile app scans, these get filled
    user_auth_key = Column(String, nullable=True)
    
    # 6-digit PIN for verification
    pin = Column(String(6), nullable=True)
    
    # PIN expiration (separate from QR - 2 minutes per doc)
    pin_expires_at = Column(DateTime, nullable=True)
    
    # =====================
    # Status Tracking
    # =====================
    
    # Legacy boolean fields (kept for compatibility)
    is_used = Column(Boolean, default=False)
    is_verified = Column(Boolean, default=False)
    
    # New status enum field
    status = Column(String(20), default=QRSessionStatus.PENDING.value, nullable=False)
    
    # Timestamps
    expires_at = Column(DateTime, nullable=False)
    scanned_at = Column(DateTime, nullable=True)
    verified_at = Column(DateTime, nullable=True)
    
    # =====================
    # Security Fields (NEW)
    # =====================
    
    # Failed PIN attempts counter
    failed_attempts = Column(Integer, default=0, nullable=False)
    
    # Lockout tracking
    locked_at = Column(DateTime, nullable=True)
    lockout_until = Column(DateTime, nullable=True)
    
    # IP address tracking for audit
    client_ip = Column(String(45), nullable=True)    # IP that requested QR
    scanner_ip = Column(String(45), nullable=True)   # IP of mobile scanner
    verifier_ip = Column(String(45), nullable=True)  # IP that submitted PIN
    
    # =====================
    # Relationships
    # =====================
    
    # Relationship to service (optional)
    # service = relationship("RegisteredService", back_populates="qr_sessions")
    
    # =====================
    # Constants
    # =====================
    
    MAX_ATTEMPTS = 3
    LOCKOUT_DURATION_MINUTES = 15
    PIN_EXPIRY_MINUTES = 2
    QR_EXPIRY_MINUTES = 5
    
    # =====================
    # Helper Methods
    # =====================
    
    def is_expired(self) -> bool:
        """Check if QR code has expired."""
        from datetime import datetime
        return datetime.utcnow() > self.expires_at
    
    def is_pin_expired(self) -> bool:
        """Check if PIN has expired (2-minute window)."""
        from datetime import datetime
        if not self.pin_expires_at:
            return False
        return datetime.utcnow() > self.pin_expires_at
    
    def is_locked(self) -> bool:
        """Check if session is locked due to failures."""
        from datetime import datetime
        if not self.lockout_until:
            return False
        return datetime.utcnow() < self.lockout_until
    
    def get_remaining_attempts(self) -> int:
        """Get number of PIN attempts remaining."""
        return max(0, self.MAX_ATTEMPTS - self.failed_attempts)
    
    def mark_as_used(self, user_auth_key: str, pin: str, scanner_ip: str = None):
        """Mark session as scanned and set PIN."""
        from datetime import datetime, timedelta
        
        self.user_auth_key = user_auth_key
        self.pin = pin
        self.pin_expires_at = datetime.utcnow() + timedelta(minutes=self.PIN_EXPIRY_MINUTES)
        self.is_used = True
        self.scanned_at = datetime.utcnow()
        self.status = QRSessionStatus.PIN_GENERATED.value
        self.scanner_ip = scanner_ip
    
    def mark_as_verified(self, verifier_ip: str = None):
        """Mark session as successfully verified."""
        from datetime import datetime
        
        self.is_verified = True
        self.verified_at = datetime.utcnow()
        self.status = QRSessionStatus.COMPLETED.value
        self.verifier_ip = verifier_ip
    
    def increment_failed_attempt(self):
        """Track failed PIN attempt and lock if needed."""
        from datetime import datetime, timedelta
        
        self.failed_attempts += 1
        
        if self.failed_attempts >= self.MAX_ATTEMPTS:
            self.locked_at = datetime.utcnow()
            self.lockout_until = datetime.utcnow() + timedelta(minutes=self.LOCKOUT_DURATION_MINUTES)
            self.status = QRSessionStatus.FAILED.value
```

---

### Step 3: Create Status Enum Index (Optional)

For databases that don't support native enums, we can use check constraints:

```python
# Add to migration if using PostgreSQL
from sqlalchemy import CheckConstraint

# Add check constraint for status values
op.create_check_constraint(
    'ck_qr_sessions_status',
    'qr_sessions',
    "status IN ('pending', 'pin_generated', 'completed', 'expired', 'failed')"
)
```

---

### Step 4: Run Migration

```bash
# Navigate to backend directory
cd /Volumes/Project\ Disk/PROJECTS/BUILDING\ CODEBASE/MIS_SYSTEM/MIS/backend_api

# Generate migration (if using autogenerate)
alembic revision --autogenerate -m "Align schema with documentation"

# OR create manual migration
alembic revision -m "schema_alignment_v1"

# Apply migration
alembic upgrade head

# Verify migration
alembic current
```

---

## 📊 Final Schema

After migration, the `qr_sessions` table will have:

```sql
CREATE TABLE qr_sessions (
    -- Base fields
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP,
    
    -- Core fields
    token VARCHAR UNIQUE NOT NULL,
    service_id INTEGER NOT NULL REFERENCES registered_services(id),
    
    -- Session code fields (NEW)
    session_code VARCHAR(20),
    qr_code_pattern VARCHAR(20),
    obfuscation_map JSON,
    
    -- User & PIN fields
    user_auth_key VARCHAR,
    pin VARCHAR(6),
    pin_expires_at TIMESTAMP,
    
    -- Status tracking
    is_used BOOLEAN DEFAULT FALSE,
    is_verified BOOLEAN DEFAULT FALSE,
    status VARCHAR(20) DEFAULT 'pending' NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    scanned_at TIMESTAMP,
    verified_at TIMESTAMP,
    
    -- Security fields (NEW)
    failed_attempts INTEGER DEFAULT 0 NOT NULL,
    locked_at TIMESTAMP,
    lockout_until TIMESTAMP,
    client_ip VARCHAR(45),
    scanner_ip VARCHAR(45),
    verifier_ip VARCHAR(45)
);

-- Indexes
CREATE INDEX ix_qr_sessions_token ON qr_sessions(token);
CREATE INDEX ix_qr_sessions_service_status ON qr_sessions(service_id, status, expires_at);
CREATE INDEX ix_qr_sessions_expiration ON qr_sessions(expires_at);
```

---

## 🧪 Testing Checklist

### Migration Tests

- [ ] Migration runs without errors
- [ ] Existing data is preserved
- [ ] Downgrade works correctly
- [ ] Indexes are created

### Model Tests

- [ ] New columns are accessible
- [ ] Default values work correctly
- [ ] Helper methods work correctly
- [ ] Status enum values validate properly

### Integration Tests

- [ ] QR generation fills new fields
- [ ] PIN verification uses new fields
- [ ] IP addresses are captured
- [ ] Failed attempts are tracked

---

## ⚠️ Migration Considerations

### Backward Compatibility

1. **Nullable new columns**: All new columns allow NULL initially
2. **Default values**: Status defaults to 'pending' for existing rows
3. **Legacy booleans kept**: `is_used` and `is_verified` still work
4. **Gradual migration**: Can transition from booleans to enum gradually

### Data Backfill

For existing sessions, we may want to backfill status:

```python
# Backfill script (run after migration)
def backfill_status(db: Session):
    from app.models.qr_session import QRSession, QRSessionStatus
    
    # Set status based on existing boolean flags
    db.execute("""
        UPDATE qr_sessions
        SET status = CASE
            WHEN is_verified = TRUE THEN 'completed'
            WHEN is_used = TRUE AND is_verified = FALSE THEN 'pin_generated'
            WHEN expires_at < CURRENT_TIMESTAMP THEN 'expired'
            ELSE 'pending'
        END
        WHERE status = 'pending' OR status IS NULL
    """)
    db.commit()
```

---

## 🔗 Related Documents

- [00_MASTER_IMPLEMENTATION_PLAN.md](./00_MASTER_IMPLEMENTATION_PLAN.md)
- [04_SESSION_CODE_OBFUSCATION.md](./04_SESSION_CODE_OBFUSCATION.md)
- [99_IMPLEMENTATION_CHECKLIST.md](./99_IMPLEMENTATION_CHECKLIST.md)
