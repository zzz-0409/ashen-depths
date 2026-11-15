// Lyra rewards a short ordered movement route after a successful ultimate.
NAMED_STAR_BOONS.Lyr=['終曲の三音','必殺技の発動成功後、発動地点の周囲に3つの音符を8秒間残す。光る音符の28以内へ順番に近づくと、1音につきSP8・MP8回復（上限まで）。3音すべて拾うと必殺ゲージ20を直接回復する。順番が違う音符は拾えない。壁越しでは拾えず、通行できる3地点がない場合は出現しない。再発動は残った音符を置換。発動地点から500を超える・地域移動・死亡・訓練リセット・加護解除で消える。'];
{let star=TREE_STARS.find(s=>s.code==='Lyr');if(!star)throw Error('Missing Lyra');namedBoonIndices.Lyr=STAR_BOONS.length;star.boonIndex=STAR_BOONS.length;STAR_BOONS.push(NAMED_STAR_BOONS.Lyr);treeOwnershipRef=null;treeOwnershipLength=-1;}
let lyraNotes=null;
function resetLyra(){lyraNotes=null;}
const lyraResetBase=resetNamedBoons;resetNamedBoons=()=>{lyraResetBase();resetLyra();};
const lyraSyncBase=syncNamedBoons;syncNamedBoons=()=>{lyraSyncBase();if(!hasStarBoon(namedBoonIndices.Lyr))resetLyra();};
function lyraPlacement(origin){
 for(let radius of [110,90,70])for(let turn=0;turn<12;turn++){
  let points=Array.from({length:3},(_,i)=>{let angle=turn*Math.PI/6+i*Math.PI*2/3;return{x:origin.x+Math.cos(angle)*radius,y:origin.y+Math.sin(angle)*radius};});
  if(points.every(q=>passable(q.x,q.y,18)&&lineClear(origin,q,18))&&points.every((q,i)=>lineClear(q,points[(i+1)%3],18)))return points;
 }return null;
}
const lyraUltimateBase=activateUltimate;activateUltimate=(...args)=>{
 syncNamedBoons();let owner=p,world=dungeon,origin=p&&{x:p.x,y:p.y},eligible=started&&!paused&&!dead&&p?.hp>0&&hasStarBoon(namedBoonIndices.Lyr),result=lyraUltimateBase(...args);
 if(result&&eligible&&p===owner&&dungeon===world&&!dead&&p.hp>0){let points=lyraPlacement(origin);lyraNotes=points?{owner,world,origin,points,index:0,time:8}:null;}return result;
};
function lyraValid(s){return !!(s&&s.owner===p&&s.world===dungeon&&!dead&&p?.hp>0&&hasStarBoon(namedBoonIndices.Lyr)&&dist(p,s.origin)<=500);}
function advanceLyra(dt){
 syncNamedBoons();let s=lyraNotes;if(!s)return;if(!lyraValid(s)){resetLyra();return;}if(!started||paused||!Number.isFinite(dt)||dt<=0)return;
 s.time-=dt;if(s.time<=1e-8){resetLyra();return;}let note=s.points[s.index];if(dist(p,note)>28||!lineClear(p,note)||!lineClear(s.origin,note))return;
 s.index++;p.sp=Math.min(maxsp(),p.sp+8);p.mp=Math.min(100,p.mp+8);burst(note.x,note.y,26,'#e6b9ff');playSound('heal',note.x,note.y);
 if(s.index===3){p.ultimate=Math.min(100,p.ultimate+20);resetLyra();}
}
const lyraUpdateBase=update;update=dt=>{let result=lyraUpdateBase(dt);advanceLyra(dt);return result;};
const lyraGroundBase=drawGroundEffects;drawGroundEffects=()=>{
 lyraGroundBase();let s=lyraNotes;if(!started||paused||!lyraValid(s))return;
 for(let i=s.index;i<3;i++){let note=s.points[i];if(!visibleAt(note.x,note.y))continue;let q=project(note.x,note.y),active=i===s.index;groundRing(note.x,note.y,28,active?'#e6b9ff':'#756486',active?2:1);ctx.save();ctx.globalAlpha=active?1:.4;ctx.strokeStyle='#e6b9ff';ctx.fillStyle='#f3dbff';ctx.lineWidth=3;ctx.beginPath();ctx.ellipse(q.x-4,q.y-22,6,4,-.4,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.moveTo(q.x+1,q.y-23);ctx.lineTo(q.x+1,q.y-44);ctx.lineTo(q.x+11,q.y-39);ctx.stroke();ctx.restore();}
};
