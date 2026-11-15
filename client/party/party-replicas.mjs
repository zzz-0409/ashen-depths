// Remote presentation only. Does not modify local player state or determine hits.
export class PartyReplicas {
 constructor({delayMs=100,teleportDistance=160}={}){this.delayMs=delayMs;this.teleportDistance=teleportDistance;this.clear();}
 clear(){this.tracks=new Map();this.room=null;this.revision=null;this.tick=-1;this.receivedAt=0;this.localId=null;}
 accept(snapshot,localId,now){
  if(!Number.isFinite(now))throw Error('invalid-time');
  if(this.room!==snapshot.roomId||this.revision!==snapshot.revision||this.localId!==localId){this.clear();this.room=snapshot.roomId;this.revision=snapshot.revision;this.localId=localId;}
  if(snapshot.tick<this.tick)return false;
  const time=snapshot.tick*50,present=new Set();
  for(const player of snapshot.players){
   if(player.id===localId)continue;present.add(player.id);
   let track=this.tracks.get(player.id);if(!track){track={name:player.name,ready:player.ready,points:[],facing:1};this.tracks.set(player.id,track);}
   track.name=player.name;track.ready=player.ready;
   const last=track.points.at(-1);
   if(last){const dx=player.x-last.x,dy=player.y-last.y;if(Math.hypot(dx,dy)>this.teleportDistance)track.points=[];if(Math.hypot(dx,dy)>.01)track.facing=dx-dy<0?-1:1;}
   if(track.points.at(-1)?.time===time)track.points.pop();
   track.points.push({time,x:player.x,y:player.y});if(track.points.length>8)track.points.shift();
  }
  for(const id of this.tracks.keys())if(!present.has(id))this.tracks.delete(id);
  // Ready/name-only broadcasts at the same tick must not restart the time offset.
  if(snapshot.tick>this.tick)this.receivedAt=now;
  this.tick=snapshot.tick;return true;
 }
 sample(now){
  const target=this.tick*50+Math.max(0,now-this.receivedAt)-this.delayMs,result=[];
  for(const [id,track]of this.tracks){
   const points=track.points;let a=points[0],b=a;
   for(let i=1;i<points.length;i++){b=points[i];if(target<=b.time)break;a=b;}
   const ratio=b.time>a.time?Math.max(0,Math.min(1,(target-a.time)/(b.time-a.time))):0;
   const moving=target>=a.time&&target<b.time&&Math.hypot(b.x-a.x,b.y-a.y)>.01&&now-this.receivedAt<=250;
   result.push({id,name:track.name,ready:track.ready,x:a.x+(b.x-a.x)*ratio,y:a.y+(b.y-a.y)*ratio,facing:track.facing,state:moving?'walk':'idle',animation:Math.max(0,target)/1000});
  }
  return result;
 }
}
// Pass the existing game's actorSprite/project/groundRing and Canvas context.
// Add to its normal depth-sorted actor list, never draw over the whole scene.
export function appendPartyActors(actors,replicas,now,{visibleAt,actorSprite,heroSheet,groundRing,project,ctx}){
 for(const player of replicas.sample(now)){
  if(!visibleAt(player.x,player.y))continue;
  actors.push({depth:player.x+player.y,draw(){
   groundRing(player.x,player.y,22,'#7bcbd4',1);
   actorSprite(heroSheet,player.x,player.y,100,player.state,player.animation,player.facing,1);
   const q=project(player.x,player.y);ctx.save();ctx.textAlign='center';ctx.font='12px sans-serif';ctx.fillStyle=player.ready?'#a4e9ba':'#bde6ed';ctx.fillText(player.name,q.x,q.y-96);ctx.restore();
  }});
 }
}
