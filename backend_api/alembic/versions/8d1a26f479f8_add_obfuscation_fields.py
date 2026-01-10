"""add obfuscation fields

Revision ID: 8d1a26f479f8
Revises: 91bdce5eebda
Create Date: 2026-01-10 04:52:32.860659

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '8d1a26f479f8'
down_revision: Union[str, None] = '91bdce5eebda'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('qr_sessions', sa.Column('session_code', sa.String(length=20), nullable=True))
    op.add_column('qr_sessions', sa.Column('qr_code_pattern', sa.String(length=20), nullable=True))
    op.add_column('qr_sessions', sa.Column('obfuscation_map', sa.JSON(), nullable=True))
    op.add_column('qr_sessions', sa.Column('status', sa.String(length=20), server_default='pending', nullable=False))
    
    # Indexes
    op.create_index('ix_qr_sessions_service_status', 'qr_sessions', ['service_id', 'status', 'expires_at'], unique=False)
    op.create_index('ix_qr_sessions_expiration', 'qr_sessions', ['expires_at'], unique=False)


def downgrade() -> None:
    op.drop_index('ix_qr_sessions_expiration', table_name='qr_sessions')
    op.drop_index('ix_qr_sessions_service_status', table_name='qr_sessions')
    op.drop_column('qr_sessions', 'status')
    op.drop_column('qr_sessions', 'obfuscation_map')
    op.drop_column('qr_sessions', 'qr_code_pattern')
    op.drop_column('qr_sessions', 'session_code')
