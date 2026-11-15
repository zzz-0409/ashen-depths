// Ordinary creatures defend a local territory; bosses keep their encounter rules.
const ENEMY_NOTICE_RANGE=430,ENEMY_TERRITORY_RANGE=700;
const awarenessHitBase=hit;hit=(e,damage)=>{
 if(e.species&&!e.boss&&!e.dummy&&e.hp>0&&damage>0){e.aware=true;e.returning=false;}
 return awarenessHitBase(e,damage);
};
const awarenessAnimateBase=animateEnemy;animateEnemy=(e,dt)=>{
 if(!e.species||e.boss||e.dummy||!e.home||e.hp<=0)return awarenessAnimateBase(e,dt);
 if(e.reactionStun>0)return;
 let distance=dist(e,p),fromHome=dist(e,e.home),playerFromHome=dist(p,e.home);
 // Let a committed, telegraphed attack finish before disengaging.
 if(e.state==='attack')return awarenessAnimateBase(e,dt);
 if(e.aware&&(distance>900||(fromHome>ENEMY_TERRITORY_RANGE&&playerFromHome>ENEMY_TERRITORY_RANGE+100))){e.aware=false;e.returning=true;e.path=[];e.nav=0;}
 if(e.returning){
  e.anim+=dt;e.flash=Math.max(0,(e.flash||0)-dt);e.slow=Math.max(0,(e.slow||0)-dt);
  if(fromHome<18){e.returning=false;e.state='idle';e.path=[];e.t=Math.max(e.t||0,.6);return;}
  e.nav=(e.nav||0)-dt;if(e.nav<=0){e.nav=.6;e.path=lineClear(e,e.home)?[{...e.home}]:findPath(e,e.home);}
  let target=e.path?.[0];e.state='idle';if(target){let dx=target.x-e.x,dy=target.y-e.y,len=Math.hypot(dx,dy);if(len<10)e.path.shift();else{let step=Math.min(len,ENEMY_ROLES[e.role].speed*(e.slow>0?.35:1)*dt);e.state=moveActor(e,dx/len*step,dy/len*step,12)>.1?'walk':'idle';e.facing=dx-dy<0?-1:1;}}
  return;
 }
 if(!e.aware&&distance<=ENEMY_NOTICE_RANGE&&lineClear(e,p))e.aware=true;
 if(e.aware)return awarenessAnimateBase(e,dt);
 e.state='idle';e.path=[];e.anim+=dt;e.flash=Math.max(0,(e.flash||0)-dt);e.slow=Math.max(0,(e.slow||0)-dt);e.t=Math.max(0,(e.t||0)-dt);
};
