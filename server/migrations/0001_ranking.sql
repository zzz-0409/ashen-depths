CREATE TABLE accounts(id TEXT PRIMARY KEY, display_name TEXT NOT NULL);
CREATE TABLE sessions(token_hash TEXT PRIMARY KEY, account_id TEXT NOT NULL REFERENCES accounts(id), expires_at INTEGER NOT NULL);
CREATE INDEX sessions_expiry ON sessions(expires_at);
CREATE TABLE runs(id TEXT PRIMARY KEY, account_id TEXT NOT NULL REFERENCES accounts(id), started_at INTEGER NOT NULL, expires_at INTEGER NOT NULL);
CREATE UNIQUE INDEX runs_account ON runs(account_id);
CREATE TABLE scores(account_id TEXT NOT NULL REFERENCES accounts(id), season TEXT NOT NULL, best REAL NOT NULL, last REAL NOT NULL, updated_at INTEGER NOT NULL, PRIMARY KEY(account_id,season));
CREATE INDEX scores_ranking ON scores(season,best DESC);
