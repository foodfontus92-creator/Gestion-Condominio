"""create buildings and apartments tables

Revision ID: 20261026_0001
Revises:
Create Date: 2026-10-26

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = "20261026_0001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "buildings",
        sa.Column("id", sa.Uuid(), server_default=sa.text("gen_random_uuid()"), nullable=False),
        sa.Column("code", sa.String(length=16), nullable=False),
        sa.Column("status", sa.String(length=16), server_default="active", nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("code", name="uq_buildings_code"),
        sa.CheckConstraint(
            "status IN ('active', 'suppressed')",
            name="ck_buildings_status",
        ),
    )
    op.create_table(
        "apartments",
        sa.Column("id", sa.Uuid(), server_default=sa.text("gen_random_uuid()"), nullable=False),
        sa.Column("building_id", sa.Uuid(), nullable=False),
        sa.Column("number", sa.Integer(), nullable=False),
        sa.Column("status", sa.String(length=16), server_default="active", nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(
            ["building_id"],
            ["buildings.id"],
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("id"),
        sa.CheckConstraint(
            "status IN ('active', 'suppressed')",
            name="ck_apartments_status",
        ),
        sa.UniqueConstraint(
            "building_id",
            "number",
            name="uq_apartments_building_number",
        ),
    )
    op.create_index(
        "idx_apartments_building_id",
        "apartments",
        ["building_id"],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index("idx_apartments_building_id", table_name="apartments")
    op.drop_table("apartments")
    op.drop_table("buildings")
