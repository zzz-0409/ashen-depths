import {PartyRoom} from './room-core.mjs';
// The platform adapter must authenticate the HTTP upgrade and validate Origin
// before attach. This module deliberately has no public HTTP route yet.
export class RoomSession {
 constructor(options){this.room=new PartyRoom(options);this.sockets=new Map();}
 attach(socket,identity,now){
  this.room.advance(now);
  const joined=this.room.join(identity),connectionId=identity.connectionId;
  this.sockets.set(connectionId,{socket,lastSeen:now});
  if(!this.send(connectionId,{type:'welcome',playerId:joined.playerId,snapshot:joined.snapshot}))return false;
  this.broadcast();return true;
 }
 send(id,message){
  const entry=this.sockets.get(id);if(!entry)return false;
  if(entry.socket.readyState!==1||(entry.socket.bufferedAmount||0)>65536){this.detach(id,1013,'connection-too-slow');return false;}
  try{entry.socket.send(JSON.stringify(message));return true;}catch{this.detach(id,1011,'send-failed');return false;}
 }
 receive(id,wire,now){
  if(!this.sockets.has(id))return false;
  this.room.advance(now);
  try{this.room.receive(id,wire);this.sockets.get(id).lastSeen=now;return true;}
  catch(error){this.send(id,{type:'error',code:error.code||'invalid-message'});this.detach(id,1008,'invalid-input');this.broadcast();return false;}
 }
 tick(now){
  this.room.advance(now);
  for(const [id,entry] of this.sockets)if(now-entry.lastSeen>15000)this.detach(id,1001,'connection-timeout');
  this.broadcast();
 }
 detach(id,code=1000,reason='left'){
  const entry=this.sockets.get(id);if(!entry)return false;
  this.sockets.delete(id);this.room.leave(id);
  try{entry.socket.close(code,reason);}catch{}
  return true;
 }
 broadcast(){
  const message={type:'snapshot',snapshot:this.room.snapshot()};
  for(const id of [...this.sockets.keys()])this.send(id,message);
 }
 dispose(){for(const id of [...this.sockets.keys()])this.detach(id,1001,'room-stopped');}
}
