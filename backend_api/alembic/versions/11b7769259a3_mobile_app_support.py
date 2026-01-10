"""mobile app support

Revision ID: 11b7769259a3
Revises: 8d1a26f479f8
Create Date: 2026-01-10 04:56:45.123456

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '11b7769259a3'
down_revision: Union[str, None] = '8d1a26f479f8'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add biometric flag to users
    op.add_column('active_users', sa.Column('biometric_enabled', sa.Boolean(), server_default='false', nullable=False))
    
    # Add device info to sessions
    op.add_column('qr_sessions', sa.Column('device_info', sa.JSON(), nullable=True))


def downgrade() -> None:
    op.drop_column('qr_sessions', 'device_info')
    op.drop_column('active_users', 'biometric_enabled')
