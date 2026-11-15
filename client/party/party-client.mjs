const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
export class PartyClient {
 constructor({origin,revision,fetch:fetcher=globalThis.fetch,WebSocket:Socket=globalThis.WebSocket,now=()=>Date.now(),start=setInterval,stop=clearInterval,onState=()=>{},onSnapshot=()=>{}}){
  const url=new URL(origin);if(!['https:','http:'].includes(url.protocol))throw Error('invalid-origin');
  this.origin=url.origin;this.revision=revision;this.fetcher=fetcher;this.Socket=Socket;this.now=now;this.start=start;this.stop=stop;this.onState=onState;this.onSnapshot=onSnapshot;this.epoch=0;this.socket=null;this.timer=null;this.abort=null;this.state='idle';this.axis={x:0,y:0};this.seq=0;this.snapshot=null;
 }
 transition(state,reason=null){this.state=state;this.onState({state,reason,roomId:this.roomId||null});}
 async join(roomId=null){
  this.leave();const epoch=++this.epoch;this.transition('connecting');this.lastReceived=this.now();this.timer=this.start(()=>this.pump(epoch),50);
  try{
   if(!roomId){
    this.abort=new AbortController();
    const response=await this.fetcher(this.origin+'/api/party/rooms',{method:'POST',credentials:'same-origin',signal:this.abort.signal});
    if(epoch!==this.epoch)return false;
    const data=await response.json();if(epoch!==this.epoch)return false;
    if(!response.ok)throw Error(typeof data.error==='string'?data.error:'create-failed');
    if(data.revision!==this.revision||data.protocol!==1)throw Error('version-mismatch');roomId=data.roomId;
   }
   if(!uuid.test(roomId))throw Error('invalid-room-id');
   this.roomId=roomId;this.playerId=null;this.seq=0;this.snapshot=null;
   const url=new URL('/api/party/rooms/'+roomId+'/socket',this.origin);url.protocol=url.protocol==='https:'?'wss:':'ws:';url.searchParams.set('protocol','1');url.searchParams.set('revision',this.revision);
   const socket=new this.Socket(url.href);this.socket=socket;
   socket.addEventListener('message',event=>{if(epoch===this.epoch)this.receive(event.data);});
   socket.addEventListener('close',()=>{if(epoch===this.epoch)this.disconnect('connection-closed');});
   socket.addEventListener('error',()=>{if(epoch===this.epoch)this.disconnect('connection-error');});
   return true;
  }catch(error){if(epoch===this.epoch)this.disconnect(error.message||'connection-failed');return false;}
 }
 receive(wire){
  try{
   if(typeof wire!=='string'||wire.length>16384)throw Error('invalid-server-message');const m=JSON.parse(wire);
   if(m.type==='error'){this.disconnect(typeof m.code==='string'?m.code.slice(0,64):'server-error');return;}
   if(!['welcome','snapshot'].includes(m.type))throw Error('invalid-server-message');
   const s=m.snapshot;
   if(!s||s.protocol!==1||s.revision!==this.revision||s.roomId!==this.roomId||!Number.isSafeInteger(s.tick)||s.tick<0||s.phase!=='lobby'||!Array.isArray(s.players)||s.players.length>4)throw Error('invalid-snapshot');
   const ids=new Set();for(const p of s.players){if(!p||typeof p.id!=='string'||!/^p[1-9][0-9]*$/.test(p.id)||ids.has(p.id)||typeof p.name!=='string'||p.name.length>24||!Number.isFinite(p.x)||!Number.isFinite(p.y)||typeof p.ready!=='boolean'||!Number.isSafeInteger(p.ack)||p.ack< -1)throw Error('invalid-snapshot');ids.add(p.id);}
   if(m.type==='welcome'){if(this.state!=='connecting'||!ids.has(m.playerId))throw Error('invalid-welcome');this.playerId=m.playerId;this.transition('connected');}
   if(this.state!=='connected'||!ids.has(this.playerId))throw Error('missing-player');
   if(this.snapshot&&s.tick<this.snapshot.tick)return;
   this.lastReceived=this.now();this.snapshot=s;this.onSnapshot(s,this.playerId);
  }catch{this.disconnect('invalid-server-message');}
 }
 setMove(x,y){if(!Number.isFinite(x)||!Number.isFinite(y))return false;const len=Math.max(1,Math.hypot(x,y));this.axis={x:x/len,y:y/len};return true;}
 send(data){
  if(this.state!=='connected'||this.socket?.readyState!==1)return false;
  if(this.socket.bufferedAmount>32768){this.disconnect('connection-too-slow');return false;}
  try{this.socket.send(JSON.stringify({...data,protocol:1,seq:this.seq++}));return true;}catch{this.disconnect('send-failed');return false;}
 }
 dodge(x,y){if(!Number.isFinite(x)||!Number.isFinite(y)||Math.hypot(x,y)<.001)return false;const len=Math.hypot(x,y);return this.send({type:'dodge',x:x/len,y:y/len});}
 ready(value){return typeof value==='boolean'&&this.send({type:'ready',ready:value});}
 pump(epoch){
  if(epoch!==this.epoch)return;
  if(this.now()-this.lastReceived>(this.state==='connecting'?10000:8000)){this.disconnect('connection-timeout');return;}
  if(this.state==='connected')this.send({type:'move',...this.axis});
 }
 cleanup(){
  ++this.epoch;if(this.timer!==null){this.stop(this.timer);this.timer=null;}this.abort?.abort();this.abort=null;
  const socket=this.socket;this.socket=null;if(socket)try{socket.close(1000,'leaving');}catch{}
  this.axis={x:0,y:0};this.snapshot=null;this.playerId=null;
 }
 disconnect(reason){this.cleanup();this.transition('disconnected',reason);}
 leave(){this.cleanup();this.roomId=null;this.transition('idle');}
}
