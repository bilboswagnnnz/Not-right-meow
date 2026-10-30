CREATE TABLE IF NOT EXISTS pairing_sessions (
  id TEXT PRIMARY KEY,
  verifier TEXT NOT NULL,
  state TEXT NOT NULL CHECK(state IN ('pending','approved','consumed','cancelled')),
  payload TEXT,
  created_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_pairing_expiry ON pairing_sessions(expires_at);
