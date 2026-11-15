import {RoomSession} from './room-session.mjs';
import {villageCanOccupy} from './village-world.mjs';
// Used only by the authenticated gateway. Never forward public identity headers.
export function connectParty(env,metadata){
 if(!env.PARTY_ROOMS)return Response.json({error:'transport-unavailable'},{status:503});
 const id=env.PARTY_ROOMS.idFromName(metadata.roomId);
 return env.PARTY_ROOMS.get(id).fetch(new Request('https://party.internal/connect',{headers:{Upgrade:'websocket','X-Party-Metadata':encodeURIComponent(JSON.stringify(metadata))}}));
}
// Inject the platform boundary so the same lifecycle can be exercised in Node.
export function partyObjectClass(Base,platform){return class PartyRoomObject extends Base {
 constructor(ctx,env){super(ctx,env);this.env=env;this.session=null;this.timer=null;this.expiries=new Map();}
 clock(){return Math.max(platform.now(),this.session?.room.clock||0);}
 async fetch(request){
  if(request.method!=='GET'||new URL(request.url).pathname!=='/connect'||request.headers.get('Upgrade')?.toLowerCase()!=='websocket')return Response.json({error:'invalid-upgrade'},{status:400});
  let m;try{let raw=request.headers.get('X-Party-Metadata');if(!raw||raw.length>4096)throw Error();m=JSON.parse(decodeURIComponent(raw));}catch{return Response.json({error:'invalid-metadata'},{status:400});}
  const now=this.clock();
  if(typeof m.roomId!=='string'||!m.roomId||!Number.isFinite(m.expiresAt)||m.expiresAt<=now||!Number.isFinite(m.sessionExpiresAt)||m.sessionExpiresAt<=now||m.identity?.revision!==this.env.GAME_REVISION)return Response.json({error:'expired-or-invalid-room'},{status:409});
  if(this.session&&(this.session.room.id!==m.roomId||this.expiresAt!==m.expiresAt))return Response.json({error:'room-mismatch'},{status:409});
  if(!this.session){this.expiresAt=m.expiresAt;this.session=new RoomSession({id:m.roomId,revision:this.env.GAME_REVISION,now,canOccupy:villageCanOccupy});}
  const [client,server]=platform.pair();server.accept();
  let attached;try{attached=this.session.attach(server,m.identity,now);}catch(error){server.close(1008,'join-rejected');return Response.json({error:error.code||'join-rejected'},{status:409});}
  if(!attached)return Response.json({error:'connection-failed'},{status:503});
  const id=m.identity.connectionId;this.expiries.set(id,m.sessionExpiresAt);
  const close=()=>{this.session.detach(id);this.expiries.delete(id);this.session.broadcast();this.stopIfEmpty();};
  server.addEventListener('message',event=>{
   if(this.clock()>=Math.min(this.expiresAt,this.expiries.get(id)||0)){close();return;}
   this.session.receive(id,event.data,this.clock());this.stopIfEmpty();
  });
  server.addEventListener('close',close);server.addEventListener('error',close);
  if(this.timer===null)this.timer=platform.start(()=>this.tick(),50);
  return platform.upgrade(client);
 }
 tick(){
  const now=this.clock();
  if(now>=this.expiresAt){this.session.dispose();this.expiries.clear();}
  else {for(const [id,expires] of this.expiries)if(now>=expires){this.session.detach(id,1008,'login-expired');this.expiries.delete(id);}this.session.tick(now);}
  for(const id of this.expiries.keys())if(!this.session.sockets.has(id))this.expiries.delete(id);
  this.stopIfEmpty();
 }
 stopIfEmpty(){if(this.session.sockets.size===0&&this.timer!==null){platform.stop(this.timer);this.timer=null;this.expiries.clear();}}
};}
