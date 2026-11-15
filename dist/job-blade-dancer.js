// Blade Dancer turns a successful parry into a two-position normal-attack sequence.
let dancerSequence=null,dancerSwing=0;
const DANCER_SEQUENCE_DESC='受け流し成功後5秒以内の通常攻撃で敵1体に舞印。さらに5秒以内に、その敵を中心に最初の攻撃位置から90度以上回り込み、通常攻撃を当てると威力240%の終舞（1回）。別の敵への攻撃では舞印は移らない。';
ADVANCED_JOBS[4][1]+=' '+DANCER_SEQUENCE_DESC;
function dancerSequenceActive(s){return !!(s&&s.owner===p&&currentJob()===12&&started&&!dead&&p.hp>0&&s.time>0&&(!s.target||s.target.hp>0));}
function dancerFlank(s){if(!s?.target)return false;let dx=p.x-s.target.x,dy=p.y-s.target.y,len=Math.hypot(dx,dy);return len>=1&&(dx*s.dx+dy*s.dy)/len<=1e-8;}
const dancerHurtBase=hurt;hurt=d=>{let parry=currentJob()===12&&started&&!paused&&!dead&&p.inv<=0&&jobParry>0&&d>0,result=dancerHurtBase(d);if(parry&&jobParry===0)dancerSequence={owner:p,time:5,target:null,attack:dancerSwing};return result;};
const dancerPerformBase=performAction;performAction=action=>{if(action.n===0)dancerSwing++;return dancerPerformBase(action);};
const dancerHitBase=hit;hit=(e,d)=>{
 let s=dancerSequence,normal=classHitKind==='normal'&&!e?.dotTick&&!treeExplosion,watch=dancerSequenceActive(s)&&normal&&e?.hp>0,finish=watch&&s.target===e&&dancerSwing>s.attack&&dancerFlank(s),first=watch&&!s.target&&!classNormalHit,hp=e?.hp,training=e?.trainingHits||0;
 let result=dancerHitBase(e,finish?d*2.4:d);
 if(watch&&s===dancerSequence&&(e.hp<hp||(e.trainingHits||0)>training)){
  if(finish){reportAdvancedJobAction(12);dancerSequence=null;burst(e.x,e.y,80,'#e4baff');playSound('slash',e.x,e.y);}
  else if(first){let dx=p.x-e.x,dy=p.y-e.y,len=Math.hypot(dx,dy);if(len>=1){s.target=e;s.dx=dx/len;s.dy=dy/len;s.time=5;s.attack=dancerSwing;}}
 }return result;
};
function advanceDancerSequence(dt){let s=dancerSequence;if(!s)return;if(!dancerSequenceActive(s)){dancerSequence=null;return;}if(paused||!Number.isFinite(dt)||dt<=0)return;s.time-=dt;if(s.time<=0)dancerSequence=null;}
const dancerUpdateBase=update;update=dt=>{advanceDancerSequence(dt);dancerUpdateBase(dt);};
const dancerResetBase=resetClassTransient;resetClassTransient=()=>{dancerSequence=null;dancerSwing=0;return dancerResetBase();};
const dancerGroundBase=drawGroundEffects;drawGroundEffects=()=>{dancerGroundBase();let s=dancerSequence;if(!dancerSequenceActive(s))return;if(!s.target){groundRing(p.x,p.y,45,'#d0a5ff',2);return;}let e=s.target,col=dancerFlank(s)?'#f8deff':'#a386ba';groundRing(e.x,e.y,35,col,2);let end={x:e.x-s.dx*85,y:e.y-s.dy*85};if(lineClear(e,end)){paintLinkLine(e,end,col,2);groundRing(end.x,end.y,20,col,2);}};
const dancerHudBase=drawHud;drawHud=()=>{dancerHudBase();let s=dancerSequence;if(!dancerSequenceActive(s)||paused)return;jobHudTarget().textContent+=' · '+(!s.target?'通常攻撃で舞印':dancerFlank(s)?'終舞：通常攻撃':'舞印：回り込む')+' '+s.time.toFixed(1)+'秒';jobHudTarget().title+=' '+DANCER_SEQUENCE_DESC;};
