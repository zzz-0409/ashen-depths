const fs=require('fs'),path=require('path'),assert=require('assert');
const root=path.resolve(__dirname,'..'),revision=JSON.parse(fs.readFileSync(path.join(root,'dist/release.json'))).revision;
const source=fs.readFileSync(path.join(root,'server/game-release.mjs'),'utf8');
assert.equal(source.trim(),`export const SERVER_RELEASE='${revision}';`,'Server/frontend versions diverged; run stamp-release.cjs before deployment.');
const config=JSON.parse(fs.readFileSync(path.join(root,'wrangler.jsonc'),'utf8'));
assert.equal(config.main,'server/index.mjs');assert.equal(config.assets.binding,'ASSETS');assert(config.assets.run_worker_first.includes('/api/*'));
assert(config.durable_objects.bindings.some(b=>b.name==='PARTY_ROOMS'&&b.class_name==='PartyRoomObject'));
assert(config.migrations.some(m=>m.new_sqlite_classes?.includes('PartyRoomObject')));
console.log('PASS: server/frontend release match, API routing and village room binding/migration declarations. Account/DB/login provisioning is not verified.');
