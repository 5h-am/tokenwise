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
