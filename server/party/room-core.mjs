// Transport-independent room state. Authenticated identity is supplied by the
// server adapter, never by a player's wire message. Not connected to live play.
export const PROTOCOL = 1;
export const LIMITS = Object.freeze({players:4,tickMs:50,maxCatchup:5,inputExpiryMs:250,messagesPerSecond:40,messageBurst:12,maxMessageBytes:512,speed:240,dodgeDistance:180,dodgeCooldownMs:1300});
const fail = (code) => { throw Object.assign(new Error(code), {code}); };
const finite = n => typeof n === 'number' && Number.isFinite(n);
export class PartyRoom {
 constructor({id,revision,now=0,spawn={x:0,y:0},canOccupy=()=>true}={}) {
  if(typeof id!=='string'||!id||typeof revision!=='string'||!revision||!finite(now)||!finite(spawn.x)||!finite(spawn.y))fail('invalid-room');
  this.id=id;this.revision=revision;this.clock=now;this.tick=0;this.players=new Map();this.connections=new Map();this.spawn={...spawn};this.canOccupy=canOccupy;this.accumulator=0;this.phase='lobby';this.nextId=1;
 }
 join({accountId,connectionId,name,revision,protocol}) {
  if(protocol!==PROTOCOL||revision!==this.revision)fail('version-mismatch');
  if(typeof accountId!=='string'||!accountId||typeof connectionId!=='string'||!connectionId)fail('authentication-required');
  if(this.connections.has(connectionId)||[...this.players.values()].some(p=>p.accountId===accountId))fail('already-connected');
  if(this.phase!=='lobby')fail('party-in-mission');
  if(this.players.size>=LIMITS.players)fail('party-full');
  if(!this.canOccupy(this.spawn.x,this.spawn.y))fail('spawn-blocked');
  const id='p'+this.nextId++,p={id,accountId,connectionId,name:typeof name==='string'?name.replace(/[\u0000-\u001f\u007f]/g,'').slice(0,24):'冒険者',x:this.spawn.x,y:this.spawn.y,axisX:0,axisY:0,nextDodge:0,seq:-1,lastInput:-Infinity,ready:false,tokens:LIMITS.messageBurst,tokenAt:this.clock};
  this.players.set(id,p);this.connections.set(connectionId,id);return {playerId:id,snapshot:this.snapshot()};
 }
 leave(connectionId) {
  const id=this.connections.get(connectionId);if(!id)return false;
  this.connections.delete(connectionId);this.players.delete(id);return true;
 }
 receive(connectionId,wire) {
  const p=this.players.get(this.connections.get(connectionId));if(!p)fail('not-in-room');
  // Rate accounting occurs before decoding so malformed messages cost tokens too.
  p.tokens=Math.min(LIMITS.messageBurst,p.tokens+(this.clock-p.tokenAt)*LIMITS.messagesPerSecond/1000);p.tokenAt=this.clock;
  if(p.tokens<1)fail('rate-limited');p.tokens--;
  if(typeof wire!=='string'||new TextEncoder().encode(wire).length>LIMITS.maxMessageBytes)fail('invalid-message');
  let m;try{m=JSON.parse(wire);}catch{fail('invalid-message');}
  if(!m||typeof m!=='object'||Array.isArray(m)||m.protocol!==PROTOCOL||!Number.isSafeInteger(m.seq)||m.seq<0||m.seq<=p.seq)fail('invalid-sequence');
  if(m.type==='move') {
   if(Object.keys(m).some(k=>!['type','protocol','seq','x','y'].includes(k))||!finite(m.x)||!finite(m.y)||Math.abs(m.x)>1||Math.abs(m.y)>1)fail('invalid-input');
   const length=Math.max(1,Math.hypot(m.x,m.y));p.axisX=m.x/length;p.axisY=m.y/length;p.lastInput=this.clock;
   } else if(m.type==='dodge') {
   if(Object.keys(m).some(k=>!['type','protocol','seq','x','y'].includes(k))||!finite(m.x)||!finite(m.y)||Math.abs(m.x)>1||Math.abs(m.y)>1||Math.hypot(m.x,m.y)<.001)fail('invalid-input');
   if(this.clock>=p.nextDodge){
    const length=Math.hypot(m.x,m.y),steps=Math.ceil(LIMITS.dodgeDistance/4),dx=m.x/length*LIMITS.dodgeDistance/steps,dy=m.y/length*LIMITS.dodgeDistance/steps;
    for(let n=0;n<steps;n++){if(!this.canOccupy(p.x+dx,p.y+dy))break;p.x+=dx;p.y+=dy;}
    p.nextDodge=this.clock+LIMITS.dodgeCooldownMs;
   }
  } else if(m.type==='ready') {
   if(this.phase!=='lobby'||Object.keys(m).some(k=>!['type','protocol','seq','ready'].includes(k))||typeof m.ready!=='boolean')fail('invalid-input');
   p.ready=m.ready;
  } else fail('unsupported-message');
  p.seq=m.seq;return {ack:p.seq};
 }
 advance(now) {
  if(!finite(now)||now<this.clock)fail('invalid-clock');
  const elapsed=now-this.clock;this.clock=now;
  this.accumulator=Math.min(LIMITS.tickMs*LIMITS.maxCatchup,this.accumulator+elapsed);
  let steps=0;
  while(this.accumulator>=LIMITS.tickMs) {
   this.accumulator-=LIMITS.tickMs;steps++;this.tick++;
   const stepAt=now-this.accumulator;
   for(const p of this.players.values()) {
    if(stepAt-p.lastInput>LIMITS.inputExpiryMs){p.axisX=0;p.axisY=0;continue;}
    const dx=p.axisX*LIMITS.speed*LIMITS.tickMs/1000,dy=p.axisY*LIMITS.speed*LIMITS.tickMs/1000;
    const subdivisions=Math.max(1,Math.ceil(Math.hypot(dx,dy)/4));
    for(let n=0;n<subdivisions;n++) {const x=p.x+dx/subdivisions,y=p.y+dy/subdivisions;if(!this.canOccupy(x,y))break;p.x=x;p.y=y;}
   }
  }
  return steps;
 }
 snapshot() {
  return {protocol:PROTOCOL,roomId:this.id,revision:this.revision,tick:this.tick,phase:this.phase,players:[...this.players.values()].map(p=>({id:p.id,name:p.name,x:p.x,y:p.y,ready:p.ready,ack:p.seq}))};
 }
}
