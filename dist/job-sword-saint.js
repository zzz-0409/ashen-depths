// Sword Saint: reposition after a full release, then cut the line back to the afterimage.
let saintAfterimage=null;
const SAINT_TRAIL_DESC='3連撃を解放すると3秒間残像を残す。60～450移動して専用操作を再入力すると、残像と自分を結ぶ幅70の線上へ240%の斬撃。SP12。壁越しには使えない。';
ADVANCED_JOBS[0][1]+=' '+SAINT_TRAIL_DESC;
function saintTrailValid(s){return !!(s&&s.owner===p&&currentJob()===8&&started&&!dead&&p.hp>0);}
function saintTrailGeometry(s,e){let dx=p.x-s.x,dy=p.y-s.y,len=Math.hypot(dx,dy);if(len<60||len>450)return false;let along=((e.x-s.x)*dx+(e.y-s.y)*dy)/len,side=Math.abs((e.x-s.x)*dy-(e.y-s.y)*dx)/len;return along>=0&&along<=len&&side<=35;}
const saintActionBase=useJobAction;useJobAction=()=>{
 if(saintAfterimage&&!saintTrailValid(saintAfterimage))saintAfterimage=null;
 if(saintAfterimage){
  let s=saintAfterimage,len=dist(s,p);if(paused||playerAction||jobCooldown>0||p.sp<12||len<60||len>450||!lineClear(s,p))return false;
  p.sp-=12;classRest=.6;jobCooldown=1;saintAfterimage=null;
  let previous=classHitKind;classHitKind='job';try{for(let e of enemies)if(e.hp>0&&saintTrailGeometry(s,e)&&lineClear(s,e)&&lineClear(p,e))jobLinkedHit(e,s.power*2.4,8);}finally{classHitKind=previous;}
  for(let d=0;d<=len;d+=24)emit(s.x+(p.x-s.x)*d/len,s.y+(p.y-s.y)*d/len,3,'#fff0af');burst(s.x,s.y,45,'#fff0af');burst(p.x,p.y,45,'#fff0af');playSound('slash',p.x,p.y);return true;
 }
 let full=currentJob()===8&&jobMeter===3,origin=full?{x:p.x,y:p.y,power:damage(),owner:p,time:3}:null,result=saintActionBase();
 if(result&&origin&&saintTrailValid(origin))saintAfterimage=origin;return result;
};
function advanceSaintTrail(dt){if(!saintAfterimage)return;if(!saintTrailValid(saintAfterimage)){saintAfterimage=null;return;}if(paused||!Number.isFinite(dt)||dt<=0)return;saintAfterimage.time-=dt;if(saintAfterimage.time<=0)saintAfterimage=null;}
const saintUpdateBase=update;update=dt=>{advanceSaintTrail(dt);saintUpdateBase(dt);};
const saintResetBase=resetClassTransient;resetClassTransient=()=>{saintAfterimage=null;return saintResetBase();};
const saintGroundBase=drawGroundEffects;drawGroundEffects=()=>{saintGroundBase();let s=saintAfterimage;if(!saintTrailValid(s))return;let valid=dist(s,p)>=60&&dist(s,p)<=450&&lineClear(s,p),color=valid?'#fff0af':'#8d8580';groundRing(s.x,s.y,35,color,2);if(valid)paintLinkLine(s,p,color,3);};
const saintHudBase=drawHud;drawHud=()=>{saintHudBase();if(!saintTrailValid(saintAfterimage)||paused)return;jobHudTarget().textContent='残像斬り · '+saintAfterimage.time.toFixed(1)+'秒 · '+(padActive?(padProfile.buttons.jobAction===10?'Lスティック押込':'Btn '+padProfile.buttons.jobAction):'C');jobHudTarget().title=SAINT_TRAIL_DESC;};
