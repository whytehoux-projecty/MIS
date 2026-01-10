"""add security fields

Revision ID: 91bdce5eebda
Revises: f9e10644b608
Create Date: 2026-01-10 04:47:06.088510

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '91bdce5eebda'
down_revision: Union[str, None] = 'f9e10644b608'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Security columns
    op.add_column('qr_sessions', sa.Column('failed_attempts', sa.Integer(), nullable=False, server_default='0'))
    op.add_column('qr_sessions', sa.Column('locked_at', sa.DateTime(), nullable=True))
    op.add_column('qr_sessions', sa.Column('lockout_until', sa.DateTime(), nullable=True))
    op.add_column('qr_sessions', sa.Column('pin_expires_at', sa.DateTime(), nullable=True))
    
    # Audit columns
    op.add_column('qr_sessions', sa.Column('client_ip', sa.String(length=45), nullable=True))
    op.add_column('qr_sessions', sa.Column('scanner_ip', sa.String(length=45), nullable=True))
    op.add_column('qr_sessions', sa.Column('verifier_ip', sa.String(length=45), nullable=True))


def downgrade() -> None:
    op.drop_column('qr_sessions', 'verifier_ip')
    op.drop_column('qr_sessions', 'scanner_ip')
    op.drop_column('qr_sessions', 'client_ip')
    op.drop_column('qr_sessions', 'pin_expires_at')
    op.drop_column('qr_sessions', 'lockout_until')
    op.drop_column('qr_sessions', 'locked_at')
    op.drop_column('qr_sessions', 'failed_attempts')
