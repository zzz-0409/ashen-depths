CREATE TABLE IF NOT EXISTS market_assets(id TEXT PRIMARY KEY,owner TEXT NOT NULL,kind TEXT NOT NULL,item_key TEXT NOT NULL,name TEXT NOT NULL,quantity INTEGER NOT NULL CHECK(quantity>=0),payload TEXT NOT NULL,rarity TEXT NOT NULL,tier INTEGER NOT NULL,state TEXT NOT NULL,updated_at INTEGER NOT NULL);
CREATE INDEX IF NOT EXISTS market_assets_owner ON market_assets(owner,state);
CREATE TABLE IF NOT EXISTS market_listings(id TEXT PRIMARY KEY,owner TEXT NOT NULL,offer_id TEXT NOT NULL,offer_json TEXT NOT NULL,want_kind TEXT NOT NULL,want_key TEXT NOT NULL,want_name TEXT NOT NULL,want_quantity INTEGER NOT NULL,want_rarity TEXT NOT NULL,state TEXT NOT NULL,taker TEXT,created_at INTEGER NOT NULL,completed_at INTEGER);
CREATE INDEX IF NOT EXISTS market_listings_state ON market_listings(state,created_at);
CREATE UNIQUE INDEX IF NOT EXISTS market_one_escrow ON market_listings(offer_id) WHERE state='open';
CREATE TABLE IF NOT EXISTS market_ops(id TEXT PRIMARY KEY,owner TEXT NOT NULL,kind TEXT NOT NULL,request_hash TEXT NOT NULL,response TEXT,created_at INTEGER NOT NULL);
CREATE INDEX IF NOT EXISTS market_ops_owner ON market_ops(owner,created_at);
CREATE TABLE IF NOT EXISTS market_guard(id INTEGER PRIMARY KEY,ok INTEGER NOT NULL CHECK(ok=1));
