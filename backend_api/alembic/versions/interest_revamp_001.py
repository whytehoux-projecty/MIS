"""Interest Application Revamp - SQLite Compatible

Revision ID: interest_revamp_001
Revises: add_device_info
Create Date: 2026-01-10
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
import secrets
import string

# revision identifiers, used by Alembic.
revision = 'interest_revamp_001'
down_revision = 'add_device_info'
branch_labels = None
depends_on = None

def generate_random_token():
    chars = string.ascii_letters + string.digits
    return ''.join(secrets.choice(chars) for _ in range(48))

def upgrade():
    # 2. Create interest_requests table
    op.create_table(
        'interest_requests',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), onupdate=sa.func.now(), nullable=True),
        sa.Column('given_name', sa.String(100), nullable=False),
        sa.Column('middle_name', sa.String(100), nullable=True),
        sa.Column('family_name', sa.String(100), nullable=False),
        sa.Column('alias', sa.String(100), nullable=True),
        sa.Column('gender', sa.Enum('male', 'female', name='gender_enum'), nullable=False),
        sa.Column('marital_status', sa.Enum(
            'married', 'single_no_relationship', 'single_in_relationship',
            name='marital_status_enum'
        ), nullable=False),
        sa.Column('primary_email', sa.String(255), nullable=False),
        sa.Column('primary_phone', sa.String(30), nullable=False),
        sa.Column('additional_emails', sa.JSON(), default=list),
        sa.Column('additional_phones', sa.JSON(), default=list),
        sa.Column('has_referral', sa.Boolean(), default=False),
        sa.Column('referral_member_id', sa.String(50), nullable=True),
        sa.Column('face_photo_id', sa.String(100), nullable=True),
        sa.Column('face_photo_url', sa.String(500), nullable=True),
        sa.Column('government_id_type', sa.String(50), nullable=True),
        sa.Column('government_id_photo_id', sa.String(100), nullable=True),
        sa.Column('government_id_photo_url', sa.String(500), nullable=True),
        sa.Column('source', sa.Enum(
            'external_space', 'admin_direct', name='request_source_enum'
        ), nullable=False, default='external_space'),
        sa.Column('status', sa.Enum(
            'pending', 'approved', 'invited', 'registration_started',
            'registration_complete', 'activated', 'rejected', 
            'info_requested', 'expired',
            name='interest_status_enum'
        ), nullable=False, default='pending'),
        sa.Column('reviewed_by', sa.String(50), nullable=True),
        sa.Column('reviewed_at', sa.DateTime(), nullable=True),
        sa.Column('admin_notes', sa.Text(), nullable=True),
        sa.Column('rejection_reason', sa.Text(), nullable=True),
        sa.Column('info_request_message', sa.Text(), nullable=True),
        sa.Column('info_response', sa.Text(), nullable=True),
        sa.Column('invitation_id', sa.Integer(), sa.ForeignKey('invitations.id'), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('primary_email')
    )
    
    op.create_index('ix_interest_requests_primary_email', 'interest_requests', ['primary_email'])
    op.create_index('ix_interest_requests_status', 'interest_requests', ['status'])
    op.create_index('ix_interest_requests_created_at', 'interest_requests', ['created_at'])

    # 3. Update invitations table using batch_alter_table for SQLite compatibility
    with op.batch_alter_table('invitations', schema=None) as batch_op:
        batch_op.alter_column('code',
            existing_type=sa.String(50),
            type_=sa.String(15),
            existing_nullable=False
        )
        batch_op.alter_column('pin',
            existing_type=sa.String(4),
            type_=sa.String(6),
            existing_nullable=False
        )
        batch_op.add_column(sa.Column('url_token', sa.String(100), nullable=True))
        batch_op.add_column(sa.Column('intended_for_name', sa.String(200), nullable=True))
        batch_op.add_column(sa.Column('link_opened_at', sa.DateTime(), nullable=True))
        batch_op.add_column(sa.Column('session_expires_at', sa.DateTime(), nullable=True))
        batch_op.add_column(sa.Column('is_link_opened', sa.Boolean(), server_default='false'))
        
        batch_op.alter_column('intended_for', new_column_name='intended_for_email')
        batch_op.create_index('ix_invitations_url_token', ['url_token'], unique=True)

    # 4. Data Backfill (Python-side)
    connection = op.get_bind()
    
    # Check if table has data to update
    try:
        # Fetch IDs where url_token is null
        results = connection.execute(sa.text("SELECT id FROM invitations WHERE url_token IS NULL"))
        for row in results:
            token = generate_random_token()
            connection.execute(
                sa.text("UPDATE invitations SET url_token = :token WHERE id = :id"),
                {"token": token, "id": row[0]}
            )
    except Exception:
        # If table is empty or other issue, just proceed (new columns might be null anyway)
        pass
        
    # 5. Make url_token non-nullable
    with op.batch_alter_table('invitations', schema=None) as batch_op:
        batch_op.alter_column('url_token', nullable=False)


def downgrade():
    with op.batch_alter_table('invitations', schema=None) as batch_op:
        batch_op.drop_index('ix_invitations_url_token')
        batch_op.drop_column('is_link_opened')
        batch_op.drop_column('session_expires_at')
        batch_op.drop_column('link_opened_at')
        batch_op.drop_column('intended_for_name')
        batch_op.drop_column('url_token')
        batch_op.alter_column('intended_for_email', new_column_name='intended_for')
        batch_op.alter_column('pin', existing_type=sa.String(6), type_=sa.String(4))
        batch_op.alter_column('code', existing_type=sa.String(15), type_=sa.String(50))

    op.drop_index('ix_interest_requests_created_at', table_name='interest_requests')
    op.drop_index('ix_interest_requests_status', table_name='interest_requests')
    op.drop_index('ix_interest_requests_primary_email', table_name='interest_requests')
    op.drop_table('interest_requests')
