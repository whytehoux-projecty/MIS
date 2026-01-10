# 🗄️ Database Migrations

> **Document:** 07_DATABASE_MIGRATIONS.md  
> **Created:** 2026-01-10  
> **Priority:** 🔴 Critical

---

## Overview

This document contains the Alembic migration scripts needed to implement the new models.

---

## Migration 1: Create Interest Requests Table

### File: `backend_api/alembic/versions/xxxx_create_interest_requests.py`

```python
"""Create interest_requests table

Revision ID: 001_interest_requests
Revises: <previous_migration>
Create Date: 2026-01-10
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = '001_interest_requests'
down_revision = '<previous_migration_id>'
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'interest_requests',
        # Base fields
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), onupdate=sa.func.now(), nullable=True),
        
        # Names
        sa.Column('given_name', sa.String(100), nullable=False),
        sa.Column('middle_name', sa.String(100), nullable=True),
        sa.Column('family_name', sa.String(100), nullable=False),
        sa.Column('alias', sa.String(100), nullable=True),
        
        # Demographics
        sa.Column('gender', sa.Enum('male', 'female', name='gender_enum'), nullable=False),
        sa.Column('marital_status', sa.Enum(
            'married', 'single_no_relationship', 'single_in_relationship',
            name='marital_status_enum'
        ), nullable=False),
        
        # Contact
        sa.Column('primary_email', sa.String(255), nullable=False),
        sa.Column('primary_phone', sa.String(30), nullable=False),
        sa.Column('additional_emails', sa.JSON(), default=list),
        sa.Column('additional_phones', sa.JSON(), default=list),
        
        # Referral
        sa.Column('has_referral', sa.Boolean(), default=False),
        sa.Column('referral_member_id', sa.String(50), nullable=True),
        
        # Documents
        sa.Column('face_photo_id', sa.String(100), nullable=True),
        sa.Column('face_photo_url', sa.String(500), nullable=True),
        sa.Column('government_id_type', sa.String(50), nullable=True),
        sa.Column('government_id_photo_id', sa.String(100), nullable=True),
        sa.Column('government_id_photo_url', sa.String(500), nullable=True),
        
        # Metadata
        sa.Column('source', sa.Enum(
            'external_space', 'admin_direct', name='request_source_enum'
        ), nullable=False, default='external_space'),
        sa.Column('status', sa.Enum(
            'pending', 'approved', 'invited', 'registration_started',
            'registration_complete', 'activated', 'rejected', 
            'info_requested', 'expired',
            name='interest_status_enum'
        ), nullable=False, default='pending'),
        
        # Admin Review
        sa.Column('reviewed_by', sa.String(50), nullable=True),
        sa.Column('reviewed_at', sa.DateTime(), nullable=True),
        sa.Column('admin_notes', sa.Text(), nullable=True),
        sa.Column('rejection_reason', sa.Text(), nullable=True),
        sa.Column('info_request_message', sa.Text(), nullable=True),
        sa.Column('info_response', sa.Text(), nullable=True),
        
        # Invitation Link
        sa.Column('invitation_id', sa.Integer(), sa.ForeignKey('invitations.id'), nullable=True),
        
        # Constraints
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('primary_email')
    )
    
    # Create indexes
    op.create_index('ix_interest_requests_primary_email', 'interest_requests', ['primary_email'])
    op.create_index('ix_interest_requests_status', 'interest_requests', ['status'])
    op.create_index('ix_interest_requests_created_at', 'interest_requests', ['created_at'])


def downgrade():
    op.drop_index('ix_interest_requests_created_at')
    op.drop_index('ix_interest_requests_status')
    op.drop_index('ix_interest_requests_primary_email')
    op.drop_table('interest_requests')
    
    # Drop enums
    op.execute('DROP TYPE IF EXISTS interest_status_enum')
    op.execute('DROP TYPE IF EXISTS request_source_enum')
    op.execute('DROP TYPE IF EXISTS marital_status_enum')
    op.execute('DROP TYPE IF EXISTS gender_enum')
```

---

## Migration 2: Update Invitations Table

### File: `backend_api/alembic/versions/xxxx_update_invitations.py`

```python
"""Update invitations table for new format

Revision ID: 002_update_invitations
Revises: 001_interest_requests
Create Date: 2026-01-10
"""

from alembic import op
import sqlalchemy as sa

revision = '002_update_invitations'
down_revision = '001_interest_requests'
branch_labels = None
depends_on = None


def upgrade():
    # Modify existing columns
    
    # Change code from 50 to 15 (if data allows)
    op.alter_column('invitations', 'code',
        existing_type=sa.String(50),
        type_=sa.String(15),
        existing_nullable=False
    )
    
    # Change pin from 4 to 6
    op.alter_column('invitations', 'pin',
        existing_type=sa.String(4),
        type_=sa.String(6),
        existing_nullable=False
    )
    
    # Add new columns
    op.add_column('invitations', sa.Column('url_token', sa.String(100), nullable=True))
    op.add_column('invitations', sa.Column('intended_for_name', sa.String(200), nullable=True))
    op.add_column('invitations', sa.Column('link_opened_at', sa.DateTime(), nullable=True))
    op.add_column('invitations', sa.Column('session_expires_at', sa.DateTime(), nullable=True))
    op.add_column('invitations', sa.Column('is_link_opened', sa.Boolean(), default=False))
    
    # Rename intended_for to intended_for_email for clarity
    op.alter_column('invitations', 'intended_for',
        new_column_name='intended_for_email'
    )
    
    # Create indexes
    op.create_index('ix_invitations_url_token', 'invitations', ['url_token'], unique=True)
    
    # Generate url_tokens for existing invitations
    op.execute("""
        UPDATE invitations 
        SET url_token = substr(md5(random()::text), 1, 48)
        WHERE url_token IS NULL
    """)
    
    # Make url_token non-nullable
    op.alter_column('invitations', 'url_token', nullable=False)


def downgrade():
    op.drop_index('ix_invitations_url_token')
    
    op.drop_column('invitations', 'is_link_opened')
    op.drop_column('invitations', 'session_expires_at')
    op.drop_column('invitations', 'link_opened_at')
    op.drop_column('invitations', 'intended_for_name')
    op.drop_column('invitations', 'url_token')
    
    op.alter_column('invitations', 'intended_for_email',
        new_column_name='intended_for'
    )
    
    op.alter_column('invitations', 'pin',
        existing_type=sa.String(6),
        type_=sa.String(4)
    )
    
    op.alter_column('invitations', 'code',
        existing_type=sa.String(15),
        type_=sa.String(50)
    )
```

---

## Migration 3: Migrate Waitlist Data (Optional)

### File: `backend_api/alembic/versions/xxxx_migrate_waitlist_data.py`

```python
"""Migrate existing waitlist data to interest_requests

Revision ID: 003_migrate_waitlist
Revises: 002_update_invitations
Create Date: 2026-01-10
"""

from alembic import op
import sqlalchemy as sa

revision = '003_migrate_waitlist'
down_revision = '002_update_invitations'
branch_labels = None
depends_on = None


def upgrade():
    # Migrate data from waitlist_requests to interest_requests
    op.execute("""
        INSERT INTO interest_requests (
            given_name, family_name, primary_email, primary_phone,
            gender, marital_status, source, status, created_at, updated_at
        )
        SELECT 
            split_part(full_name, ' ', 1) as given_name,
            CASE 
                WHEN array_length(string_to_array(full_name, ' '), 1) > 1 
                THEN split_part(full_name, ' ', -1)
                ELSE ''
            END as family_name,
            email as primary_email,
            COALESCE(phone, '') as primary_phone,
            'male' as gender,  -- Default, will need manual update
            'single_no_relationship' as marital_status,  -- Default
            'external_space' as source,
            CASE status
                WHEN 'pending' THEN 'pending'
                WHEN 'approved' THEN 'approved'
                WHEN 'invited' THEN 'invited'
                WHEN 'rejected' THEN 'rejected'
                ELSE 'pending'
            END as status,
            created_at,
            updated_at
        FROM waitlist_requests
        WHERE email NOT IN (SELECT primary_email FROM interest_requests)
    """)


def downgrade():
    # Remove migrated data (optional - be careful with this)
    pass
```

---

## Running Migrations

### Commands

```bash
# Navigate to backend directory
cd backend_api

# Generate new migration (if models are updated)
alembic revision --autogenerate -m "description"

# Run migrations
alembic upgrade head

# Rollback one migration
alembic downgrade -1

# Check current version
alembic current

# View migration history
alembic history
```

---

## Data Migration Notes

1. **Backup First**: Always backup the database before running migrations
2. **Test in Staging**: Run migrations in staging environment first
3. **Gender/Marital Status**: Migrated records will have default values - admin must update
4. **Phone Numbers**: Some may be empty if not required in old schema
