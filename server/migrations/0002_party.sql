CREATE TABLE party_rooms (
 id TEXT PRIMARY KEY,
 owner_id TEXT NOT NULL REFERENCES accounts(id),
 revision TEXT NOT NULL,
 created_at INTEGER NOT NULL,
 expires_at INTEGER NOT NULL
);
CREATE INDEX party_rooms_owner_expiry ON party_rooms(owner_id, expires_at);
