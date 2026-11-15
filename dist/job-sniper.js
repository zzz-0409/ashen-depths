// Sniper: one charged piercing follow-up per marked target, earned by holding position.
let sniperFocus=null;
const SNIPER_FOCUS_DESC='標識を付けて1.25秒静止すると照準完了。次の標的への通常攻撃に、前方650・幅50の150%貫通追撃が付く（1回）。移動・実HPダメージ・スキル使用・標的への射撃失敗で照準をやり直す。標識の期限まで再照準できる。';
ADVANCED_JOBS[3][1]+=' '+SNIPER_FOCUS_DESC;
function sniperFocusActive(s){return !!(s&&s.owner===p&&currentJob()===11&&started&&!dead&&p.hp>0&&s.target===jobMark&&jobMarkTime>0&&s.target.hp>0);}
function resetSniperAim(){if(sniperFocus){sniperFocus.still=0;sniperFocus.x=p.x;sniperFocus.y=p.y;}}
const sniperActionBase=useJobAction;useJobAction=()=>{let result=sniperActionBase();if(result&&currentJob()===11&&jobMarkTime>0&&jobMark)sniperFocus={owner:p,target:jobMark,x:p.x,y:p.y,still:0};return result;};
function advanceSniperFocus(dt){let s=sniperFocus;if(!s)return;if(!sniperFocusActive(s)){sniperFocus=null;return;}if(paused||!Number.isFinite(dt)||dt<=0)return;if(dist(p,s)>2){resetSniperAim();return;}if(!playerAction)s.still=Math.min(1.25,s.still+dt);}
const sniperUpdateBase=update;update=dt=>{advanceSniperFocus(dt);sniperUpdateBase(dt);if(sniperFocus&&dist(p,sniperFocus)>2)resetSniperAim();};
const sniperHurtBase=hurt;hurt=d=>{let hp=p.hp,result=sniperHurtBase(d);if(p.hp<hp)resetSniperAim();return result;};
const sniperPerformBase=performAction;performAction=action=>{if(action.n!==0)resetSniperAim();let s=sniperFocus,result=sniperPerformBase(action);if(action.n===0&&sniperFocus===s)resetSniperAim();return result;};
const sniperHitBase=hit;hit=(e,d)=>{
 let s=sniperFocus,ready=sniperFocusActive(s)&&s.still>=1.25&&dist(p,s)<=2&&classHitKind==='normal'&&e===s.target&&!e.dotTick&&!treeExplosion,hp=e?.hp,training=e?.trainingHits||0,origin=ready?{x:p.x,y:p.y}:null,angle=ready?Math.atan2(e.y-p.y,e.x-p.x):0,result=sniperHitBase(e,d);
 if(ready&&s===sniperFocus&&(e.hp<hp||(e.trainingHits||0)>training)){
  sniperFocus=null;let previous=classHitKind;classHitKind='job';try{for(let enemy of enemies){let dx=enemy.x-origin.x,dy=enemy.y-origin.y,along=dx*Math.cos(angle)+dy*Math.sin(angle),side=Math.abs(-dx*Math.sin(angle)+dy*Math.cos(angle));if(enemy.hp>0&&along>=0&&along<=650&&side<=25&&lineClear(origin,enemy))jobLinkedHit(enemy,damage()*1.5,11);}}finally{classHitKind=previous;}
  for(let t=25;t<=650;t+=25){let at={x:origin.x+Math.cos(angle)*t,y:origin.y+Math.sin(angle)*t};if(!lineClear(origin,at))break;emit(at.x,at.y,3,'#c2ffbd');}playSound('arrow',origin.x,origin.y);
 }return result;
};
const sniperResetBase=resetClassTransient;resetClassTransient=()=>{sniperFocus=null;return sniperResetBase();};
const sniperGroundBase=drawGroundEffects;drawGroundEffects=()=>{sniperGroundBase();let s=sniperFocus;if(!sniperFocusActive(s)||s.still<1.25)return;if(lineClear(p,s.target))paintLinkLine(p,s.target,'#d9ffd0',2);groundRing(p.x,p.y,38,'#a6efc5',2);};
const sniperHudBase=drawHud;drawHud=()=>{sniperHudBase();let s=sniperFocus;if(!sniperFocusActive(s)||paused)return;jobHudTarget().textContent+=' · '+(s.still>=1.25?'照準完了':('照準 '+Math.floor(s.still/1.25*100)+'%'));jobHudTarget().title+=' '+SNIPER_FOCUS_DESC;};
