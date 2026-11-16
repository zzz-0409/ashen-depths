// A single paid wound arms a targeted, manually triggered counterattack.
const GRUDGE_MARK_SIGNATURE=['傷返しの指名',24,8,'敵1体を5秒間指名。最初に受けた実HPダメージだけを最大HP20%まで記録し、通常攻撃の最初の直撃がその敵なら一度だけ追撃（基礎威力200%＋記録量の2倍、基礎威力600%上限）。先に通常攻撃しても消えない。無敵・盾で防いだ分、自分で支払うHPは記録しない。対象以外への攻撃、スキル、召喚、継続ダメージでは発動しない。時間切れ・対象の死亡や消失・距離500超・壁・自分の死亡や地域移動で解除。再発動で置き換える。','M26 5L42 16V34L26 47L10 34V16ZM18 19L34 35M34 19L18 35M26 11V15'];
SIGNATURE_SKILLS.push(GRUDGE_MARK_SIGNATURE);
Object.assign(GEM.crafted_6_1,{name:GRUDGE_MARK_SIGNATURE[0],cost:24,cool:8,desc:GRUDGE_MARK_SIGNATURE[3],ability:null,signature:105,tags:['spell']});
SIGNATURE_AUDIO.push(['grudgemark',220,.3]);SKILL_AUDIO_FAMILIES.dark.add('grudgemark');
function grudgeMarkValid(s){return s.owner===p&&s.world===dungeon&&!s.finished&&s.time<5&&!dead&&p?.hp>0&&s.target?.hp>0&&enemies.includes(s.target)&&dist(p,s.target)<=500&&lineClear(p,s.target);}
function grudgeMarkDamage(s){return Math.min(s.damage*6,s.damage*2+s.loss*2);}
const grudgeMarkCastBase=castCraftedSkill;
castCraftedSkill=(build,...args)=>{
 const result=grudgeMarkCastBase(build,...args);if(GEM[build.type]?.signature!==105)return result;
 const s=signatureSpells.at(-1);if(s?.mode!==105)return result;
 signatureSpells=signatureSpells.filter(v=>v.mode!==105||v===s);
 Object.assign(s,{owner:p,world:dungeon,finished:false,loss:0,capacity:Math.max(1,maxhp()*.2)});
 if(!grudgeMarkValid(s)){s.finished=true;signatureSpells=signatureSpells.filter(v=>v!==s);say('照準付近の敵を指名してください');}return result;
};
const grudgeMarkHurtBase=hurt;
hurt=amount=>{
 const owner=p,before=p?.hp,watches=started&&!paused&&Number.isFinite(amount)&&amount>0?signatureSpells.filter(s=>s.mode===105&&s.loss===0&&grudgeMarkValid(s)):[];
 const result=grudgeMarkHurtBase(amount),loss=owner===p?Math.max(0,before-p.hp):0;
 if(loss>0)for(const s of watches)if(signatureSpells.includes(s)&&grudgeMarkValid(s))s.loss=Math.min(s.capacity,loss);
 return result;
};
const grudgeMarkHitBase=hit;
hit=(e,d)=>{
 const before=e?.hp,training=e?.trainingHits||0,normal=started&&!paused&&cadenceNormalAction&&classHitKind==='normal'&&!classNormalHit&&!treeExplosion&&!e?.dotTick&&Number.isFinite(d)&&d>0;
 const watches=normal?signatureSpells.filter(s=>s.mode===105&&s.target===e&&s.loss>0&&grudgeMarkValid(s)):[];
 const result=grudgeMarkHitBase(e,d);
 if(e&&(e.hp<before||(e.trainingHits||0)>training))for(const s of watches)if(signatureSpells.includes(s)&&grudgeMarkValid(s)){
  s.finished=true;spellHit(e,grudgeMarkDamage(s),s.build);burst(e.x,e.y,70,ELEMENTS[s.build.elements[0]].color);playSignatureAudio(105,true,e.x,e.y);
 }
 return result;
};
const grudgeMarkStepBase=stepSignature;
stepSignature=(s,dt)=>{
 if(s.mode!==105)return grudgeMarkStepBase(s,dt);
 if(!grudgeMarkValid(s)){s.finished=true;return false;}
 if(paused||!Number.isFinite(dt)||dt<=0)return true;
 s.time+=dt;if(s.time+1e-8>=5){s.finished=true;return false;}return true;
};
const grudgeMarkPaintBase=paintSignatureSpells;
paintSignatureSpells=()=>{
 grudgeMarkPaintBase();for(const s of signatureSpells){if(s.mode!==105||!grudgeMarkValid(s)||!visibleAt(s.target.x,s.target.y))continue;
  const e=s.target,color=s.loss>0?ELEMENTS[s.build.elements[0]].color:'#8c8584';
  groundRing(e.x,e.y,36,color,s.loss>0?4:1);groundRing(e.x,e.y,50*(1-s.time/5),'#ffe4aa',2);
  if(s.loss>0){paintLinkLine({x:e.x-18,y:e.y-18},{x:e.x+18,y:e.y+18},color,3);paintLinkLine({x:e.x+18,y:e.y-18},{x:e.x-18,y:e.y+18},color,3);}
 }
};
const grudgeMarkStatusBase=controlSkillStatus;
controlSkillStatus=s=>s.mode===105?{label:(s.loss>0?'通常攻撃で追撃 '+Math.round(grudgeMarkDamage(s)):'被弾待ち')+' · '+Math.max(0,5-s.time).toFixed(1)+'秒',value:s.time/5,waiting:s.loss===0}:grudgeMarkStatusBase(s);
