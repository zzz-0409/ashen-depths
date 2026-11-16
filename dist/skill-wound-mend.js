// A reactive recovery of the latest real wound; never a rewind of voluntary HP costs.
const WOUND_MEND_SIGNATURE=['傷戻しの縫合',26,10,'直前2秒以内に最後に受けた実HPダメージの60%を即時回復（被弾時の最大HP20%が上限）。技が発動した時点で期限を判定。記録は一度使うと消える。続けて被弾した場合は最新の一撃だけを記録し、合算しない。無敵・盾で防いだ分、自分で支払ったHPは対象外。死亡からは復帰できず、地域移動でも記録は消える。回復はHP上限まで。傷がない・期限切れ・HP満タンでもMPと待ち時間を消費し、記録があれば消える。属性・威力・範囲補正では回復量は変わらない。','M9 15L43 41M14 9L8 16L14 23M26 16L20 23M35 23L29 30M44 30L38 37M10 40H23M16 34V46'];
SIGNATURE_SKILLS.push(WOUND_MEND_SIGNATURE);
Object.assign(GEM.crafted_6_4,{name:WOUND_MEND_SIGNATURE[0],cost:26,cool:10,desc:WOUND_MEND_SIGNATURE[3],ability:null,signature:108,tags:['spell']});
SIGNATURE_AUDIO.push(['woundmend',440,.3]);SKILL_AUDIO_FAMILIES.airy.add('woundmend');
let woundMendRecord=null;
function woundMendReady(){const r=woundMendRecord;return !!(r&&r.owner===p&&r.world===dungeon&&r.remaining>1e-8&&!dead&&p?.hp>0);}
function ageWoundMend(dt){
 if(!woundMendReady()){woundMendRecord=null;return;}
 if(paused||!Number.isFinite(dt)||dt<=0)return;
 woundMendRecord.remaining-=dt;if(!woundMendReady())woundMendRecord=null;
}
const woundMendHurtBase=hurt;
hurt=amount=>{
 const owner=p,world=dungeon,before=p?.hp,cap=maxhp()*.2,track=started&&!paused&&!dead&&Number.isFinite(amount)&&amount>0;
 const result=woundMendHurtBase(amount);
 if(dead||p?.hp<=0){woundMendRecord=null;return result;}
 const loss=owner===p&&world===dungeon?before-p.hp:0;
 if(track&&Number.isFinite(loss)&&loss>0)woundMendRecord={owner,world,remaining:2,recovery:Math.min(cap,loss*.6)};
 return result;
};
const woundMendUpdateBase=update;
update=dt=>{ageWoundMend(dt);return woundMendUpdateBase(dt);};
const woundMendCastBase=castCraftedSkill;
castCraftedSkill=(build,...args)=>{
 if(GEM[build.type]?.signature!==108)return woundMendCastBase(build,...args);
 if(!started||paused||dead||p?.hp<=0)return;
 const result=woundMendCastBase(build,...args),state=signatureSpells.at(-1);
 if(state?.mode!==108)return result;
 signatureSpells=signatureSpells.filter(s=>s!==state);
 const recovery=woundMendReady()?woundMendRecord.recovery:0;woundMendRecord=null;
 const before=p.hp;p.hp=Math.min(maxhp(),p.hp+recovery);
 if(p.hp>before){burst(p.x,p.y,70,'#8ef3c2');playSound('heal',p.x,p.y);say('傷戻し：HP '+Math.round(p.hp-before)+'回復');}
 else say('取り戻せる傷がありません');
 return result;
};
const woundMendPaintBase=paintSignatureSpells;
paintSignatureSpells=()=>{
 woundMendPaintBase();if(!woundMendReady()||!p.bindings?.includes('crafted_6_4')||!visibleAt(p.x,p.y))return;
 groundRing(p.x,p.y,34,'#8ef3c2',2);groundRing(p.x,p.y,12+22*woundMendRecord.remaining/2,'#f7ffe6',2);
};
