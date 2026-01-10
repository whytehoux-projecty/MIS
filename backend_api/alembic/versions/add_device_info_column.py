"""Add device_info column to qr_sessions (GAP-C01)

Revision ID: add_device_info
Revises: 11b7769259a3
Create Date: 2026-01-10
"""
from alembic import op
import sqlalchemy as sa

# revision identifiers
revision = 'add_device_info'
down_revision = '11b7769259a3'  # Previous migration
branch_labels = None
depends_on = None

def upgrade():
    """Add device_info JSON column to qr_sessions table."""
    op.add_column('qr_sessions',
        sa.Column('device_info', sa.JSON, nullable=True)
    )

def downgrade():
    """Remove device_info column."""
    op.drop_column('qr_sessions', 'device_info')
