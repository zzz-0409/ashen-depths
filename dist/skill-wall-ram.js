const WALL_RAM_SIGNATURE=['壁砕きの衝角',26,6,'照準付近の敵1体へ0.35秒後に140%。通常敵の攻撃を中断し、発動時の照準方向へ秒速800で最大160押し出す。地形の壁や「隔ての石垣」にぶつかると180%を追加。別の敵にぶつかると停止し、追加攻撃なし。ボス・訓練標的は移動せず140%のみ。射程360（押し出し中は520まで維持）。対象の死亡・消失、壁越し・射程外、死亡・地域移動で解除。範囲補正で移動量は増えない。再発動で置き換える。','M5 20H27V12L43 26L27 40V32H5M46 7V45M42 6L46 12L50 6M42 46L46 40L50 46'];
SIGNATURE_SKILLS.push(WALL_RAM_SIGNATURE);Object.assign(GEM.crafted_8_3,{name:WALL_RAM_SIGNATURE[0],cost:26,cool:6,desc:WALL_RAM_SIGNATURE[3],ability:null,signature:115,tags:['spell']});
SIGNATURE_AUDIO.push(['wallram',150,.4]);SKILL_AUDIO_FAMILIES.heavy.add('wallram');
function wallRamValid(s){return !s.finished&&s.owner===p&&s.world===dungeon&&!dead&&p?.hp>0&&s.target?.hp>0&&enemies.includes(s.target)&&dist(p,s.target)<=(s.fired?520:360)&&lineClear(p,s.target);}
function wallRamMovable(e){return !villageOpen&&!e.boss&&!e.dummy&&!!SPECIES[e.species]&&passable(e.x,e.y,enemyHitRadius(e));}
function wallRamObstacle(e,from,to){
 const radius=enemyHitRadius(e);
 if(!passable(to.x,to.y,radius)||!lineClear(from,to,radius))return 'wall';
 if(enemies.some(other=>other!==e&&other.hp>0&&dist(other,to)<radius+enemyHitRadius(other)&&dist(other,to)<dist(other,from)-1e-8))return 'enemy';
 return '';
}
const wallRamCastBase=castCraftedSkill;
castCraftedSkill=(build,...args)=>{const result=wallRamCastBase(build,...args);if(GEM[build.type]?.signature!==115)return result;const s=signatureSpells.at(-1);if(s?.mode!==115)return result;
 signatureSpells=signatureSpells.filter(v=>v.mode!==115||v===s);Object.assign(s,{owner:p,world:dungeon,finished:false,fired:false,travel:0});
 if(!wallRamValid(s)){signatureSpells=signatureSpells.filter(v=>v!==s);say('360以内で見える敵を狙ってください');}return result;};
const wallRamStepBase=stepSignature;
stepSignature=(s,dt)=>{
 if(s.mode!==115)return wallRamStepBase(s,dt);if(!wallRamValid(s)){s.finished=true;return false;}if(paused||!Number.isFinite(dt)||dt<=0)return true;
 const before=s.time,e=s.target;s.time+=dt;s.x=e.x;s.y=e.y;
 if(s.time+1e-8<.35)return true;
 if(!s.fired){s.fired=true;const movable=wallRamMovable(e);spellHit(e,s.damage*1.4,s.build);playSignatureAudio(115,true,e.x,e.y);
  if(!movable||!wallRamValid(s)){s.finished=true;return false;}
  e.path=[];e.nav=0;e.attack=null;e.state='idle';e.elapsed=0;e.struck=true;e.t=Math.max(e.t||0,.65);s.last={x:e.x,y:e.y};s.start={...s.last};
 }
 // Another displacement effect owns the new location; never drag it back.
 if(dist(s.last,e)>8){s.finished=true;return false;}
 let remaining=Math.min(160-s.travel,800*(s.time-Math.max(.35,before)));
 while(remaining>1e-8){const amount=Math.min(4,remaining),next={x:e.x+Math.cos(s.angle)*amount,y:e.y+Math.sin(s.angle)*amount},obstacle=wallRamObstacle(e,e,next);
  if(obstacle){s.finished=true;if(obstacle==='wall'){spellHit(e,s.damage*1.8,s.build);burst(e.x,e.y,60,ELEMENTS[s.build.elements[0]].color);playSignatureAudio(115,true,e.x,e.y);}return false;}
  e.x=next.x;e.y=next.y;s.travel+=amount;remaining-=amount;
 }
 s.last={x:e.x,y:e.y};s.x=e.x;s.y=e.y;e.reactionStun=Math.max(e.reactionStun||0,Math.max(0,.55-s.time)+.025);
 if(s.travel+1e-8>=160){s.finished=true;return false;}return true;
};
const wallRamPaintBase=paintSignatureSpells;
paintSignatureSpells=()=>{wallRamPaintBase();for(const s of signatureSpells){if(s.mode!==115||!wallRamValid(s))continue;const e=s.target,color=ELEMENTS[s.build.elements[0]].color;
 groundRing(e.x,e.y,enemyHitRadius(e)+10,color,2);
 const tip={x:e.x+Math.cos(s.angle)*70,y:e.y+Math.sin(s.angle)*70};paintLinkLine(e,tip,color,3);
 for(const side of [-1,1])paintLinkLine(tip,{x:tip.x-Math.cos(s.angle+side*.6)*22,y:tip.y-Math.sin(s.angle+side*.6)*22},color,2);
 if(s.fired){const tail={x:e.x-Math.cos(s.angle)*Math.min(70,s.travel),y:e.y-Math.sin(s.angle)*Math.min(70,s.travel)};paintLinkLine(tail,e,color,7);paintLinkLine(tail,e,'#fff2d0',2);}
 }};
const wallRamStatusBase=controlSkillStatus;controlSkillStatus=s=>s.mode===115?{label:s.fired?'押し出し · 壁で追撃':'衝角 · 壁を狙う',value:s.fired?s.travel/160:Math.min(1,s.time/.35),waiting:true}:wallRamStatusBase(s);
