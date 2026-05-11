CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS audits (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  share_id                UUID UNIQUE NOT NULL DEFAULT gen_random_uuid(),
  input_json              JSONB NOT NULL,
  report_json             JSONB NOT NULL,
  total_monthly_savings   NUMERIC(10, 2) NOT NULL DEFAULT 0,
  total_annual_savings    NUMERIC(10, 2) NOT NULL DEFAULT 0,
  health_grade            TEXT NOT NULL,
  health_raw_score        NUMERIC(5, 4) NOT NULL DEFAULT 0,
  credex_recommended      BOOLEAN NOT NULL DEFAULT false,
  tool_count              INT NOT NULL DEFAULT 0,
  team_size               INT NOT NULL DEFAULT 0,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_audits_share_id           ON audits(share_id);
CREATE INDEX IF NOT EXISTS idx_audits_credex_recommended ON audits(credex_recommended);
CREATE INDEX IF NOT EXISTS idx_audits_health_grade       ON audits(health_grade);
CREATE INDEX IF NOT EXISTS idx_audits_monthly_savings    ON audits(total_monthly_savings DESC);

CREATE TABLE IF NOT EXISTS leads (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  audit_share_id  UUID NOT NULL REFERENCES audits(share_id),
  email           TEXT NOT NULL,
  company_name    TEXT,
  role            TEXT,
  team_size       INT,
  is_high_savings BOOLEAN NOT NULL DEFAULT false,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(audit_share_id, email)
);

CREATE INDEX IF NOT EXISTS idx_leads_email        ON leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_high_savings ON leads(is_high_savings);
