// Earliest intersection of a movement segment with a target circle.
function enemyHitRadius(e){return e.exRank===100?85:e.species==='r1b0'?70:e.species==='r1e4'?30:e.species==='r1b3'?80:e.species==='r0b3'?65:e.species==='r0b2'?45:e.species==='r0b0'?50:e.species==='r0b1'?65:e.boss?32:21}
function enemyVisualSize(e){return e.exRank===100?380:e.species==='r1b0'?340:e.species==='r1e5'?170:e.species==='r1e4'?180:e.species==='r1b3'?350:e.species==='r0b3'?310:e.species==='r0b2'?185:e.species==='r0b0'?220:e.species==='r0b1'?270:e.species==='r1e3'?150:e.species==='r1e0'?140:e.species==='r0e7'?122:e.species==='r0e1'?100:e.species==='r0e0'?112:e.species==='r0e5'?130:e.species==='r0e4'?118:e.species==='r0e6'?105:['r0e2','r0e3'].includes(e.species)?108:e.boss?(e.species?225:140):e.elite?104:88}
function enemyScreenContains(e,x,y){let pos=project(e.x,e.y),size=enemyVisualSize(e);if(e.species==='r0b3'&&typeof garudaVisualLift==='function')pos.y-=garudaVisualLift(e);return Math.pow((x-pos.x)/(size*.43),2)+Math.pow((y-(pos.y-size*.4))/(size*.45),2)<=1}
function projectileContact(from,to,target,radius){let dx=to.x-from.x,dy=to.y-from.y,ox=from.x-target.x,oy=from.y-target.y,c=ox*ox+oy*oy-radius*radius;if(c<=0)return 0;let a=dx*dx+dy*dy;if(!a)return null;let b=2*(ox*dx+oy*dy),disc=b*b-4*a*c;if(disc<0)return null;let t=(-b-Math.sqrt(disc))/(2*a);return t>=0&&t<=1?t:null}
const ENEMY_PROJECTILE_HIT_RADIUS=20;
function advanceProjectile(s,dt){
 if(s.life<=0||dt<=0)return;let step=Math.min(dt,s.life),from={x:s.x,y:s.y},end={x:s.x+s.vx*step,y:s.y+s.vy*step},contact=null,t=Infinity;
 for(let target of s.enemy?[p]:enemies){if(!s.enemy&&target.hp<=0)continue;let at=projectileContact(from,end,target,s.enemy?ENEMY_PROJECTILE_HIT_RADIUS:enemyHitRadius(target));if(at!==null&&at<t){t=at;contact=target}}
 let stop=contact?{x:from.x+(end.x-from.x)*t,y:from.y+(end.y-from.y)*t}:end;s.life-=step;
 if(!lineClear(from,stop)){s.life=0;emit(from.x,from.y,5,s.enemy?'#ad7aaf':'#ebb677');return}
 s.x=stop.x;s.y=stop.y;
 if(contact){if(s.enemy)hurt(s.damage);else{if(typeof craftedProjectileHit==='function')craftedProjectileHit(contact,s);else hit(contact,s.damage);applyProjectileAilment(contact,s);if(s.leech)p.hp=Math.min(maxhp(),p.hp+3);burst(contact.x,contact.y,25,s.tint||'#efb261')}s.life=0}
 else if(!s.enemy&&Math.random()<.5)emit(s.x,s.y,1,s.tint||'#f5a04a');
}










