// Owns the connection's world lifetime. The game supplies its current dungeon
// object as worldToken; a newly loaded village is a different lifetime too.
export class VillageConnection {
 constructor({client,replicas,inVillage,worldToken,applyPosition,now=()=>Date.now(),onArrival=()=>{}}){
  Object.assign(this,{client,replicas,inVillage,worldToken,applyPosition,now,onArrival});this.joinedWorld=null;this.arrived=false;this.disposed=false;this.inputBlocked=false;
  this.oldState=client.onState;this.oldSnapshot=client.onSnapshot;
  this.stateHandler=(event)=>{if(event.state!=='connected'){this.replicas.clear();this.arrived=false;}this.oldState(event);};
  this.snapshotHandler=(snapshot,localId)=>{
   if(!this.validWorld()){this.leave();return;}
   const local=snapshot.players.find(p=>p.id===localId);if(!local){this.leave();return;}
   this.applyPosition(local.x,local.y);
   if(!this.arrived){this.arrived=true;this.onArrival();}
   this.replicas.accept(snapshot,localId,this.now());this.oldSnapshot(snapshot,localId);
  };
  client.onState=this.stateHandler;client.onSnapshot=this.snapshotHandler;
 }
 validWorld(){return !this.disposed&&this.joinedWorld!==null&&this.inVillage()&&this.worldToken()===this.joinedWorld;}
 async join(roomId=null){
  if(this.disposed||!this.inVillage())return false;
  this.joinedWorld=this.worldToken();this.arrived=false;this.replicas.clear();
  const result=await this.client.join(roomId);
  if(!this.validWorld()){this.leave();return false;}
  return result;
 }
 input(x,y,{menuOpen=false,hidden=false,focused=true}={}){
  if(!this.validWorld()){if(this.client.state==='connected'||this.client.state==='connecting')this.leave();return false;}
  const blocked=menuOpen||hidden||!focused;
  this.client.setMove(blocked?0:x,blocked?0:y);
  if(blocked&&!this.inputBlocked)this.client.send({type:'move',x:0,y:0});
  this.inputBlocked=blocked;return !blocked;
 }
 checkWorld(){if(!this.validWorld()&&(this.client.state==='connected'||this.client.state==='connecting'))this.leave();}
 leave(){this.joinedWorld=null;this.arrived=false;this.inputBlocked=false;this.replicas.clear();this.client.leave();}
 dispose(){if(this.disposed)return;this.leave();this.disposed=true;if(this.client.onState===this.stateHandler)this.client.onState=this.oldState;if(this.client.onSnapshot===this.snapshotHandler)this.client.onSnapshot=this.oldSnapshot;}
}
