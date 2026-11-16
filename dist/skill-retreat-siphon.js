const RETREAT_SIPHON_SIGNATURE=['退き潮の吸命',25,8,'見える敵1体を狙い、1秒後に160%。発動位置から標的と反対方向へ後退した距離に応じ、実HPダメージを与えた時に自分を回復（120後退で発動時の最大HP10%、上限）。横移動・標的の移動では増えず、前へ戻ると減る。開始射程360、維持600。訓練標的は回復対象外。壁・対象消失・死亡・地域移動・1更新で200超の瞬間移動で解除。再発動で置き換え。属性・威力・範囲補正で回復量は変わらない。','M7 24H32M24 15L34 24L24 33M7 35L16 43L25 35M16 43V29M40 7Q29 22 34 29Q45 40 49 27Q50 20 40 7Z'];
SIGNATURE_SKILLS.push(RETREAT_SIPHON_SIGNATURE);Object.assign(GEM.crafted_8_4,{name:RETREAT_SIPHON_SIGNATURE[0],cost:25,cool:8,desc:RETREAT_SIPHON_SIGNATURE[3],ability:null,signature:116,tags:['spell']});
SIGNATURE_AUDIO.push(['retreatsiphon',440,.3]);SKILL_AUDIO_FAMILIES.airy.add('retreatsiphon');
function retreatSiphonValid(s){return !s.finished&&s.owner===p&&s.world===dungeon&&!dead&&p?.hp>0&&s.target?.hp>0&&enemies.includes(s.target)&&dist(p,s.target)<=600&&lineClear(p,s.target);}
function retreatSiphonDistance(s){return clamp((p.x-s.origin.x)*s.retreat.x+(p.y-s.origin.y)*s.retreat.y,0,120);}
const retreatSiphonCastBase=castCraftedSkill;
castCraftedSkill=(build,...args)=>{const result=retreatSiphonCastBase(build,...args);if(GEM[build.type]?.signature!==116)return result;const s=signatureSpells.at(-1);if(s?.mode!==116)return result;
 signatureSpells=signatureSpells.filter(v=>v.mode!==116||v===s);const length=s.target?dist(p,s.target):0;
 Object.assign(s,{owner:p,world:dungeon,finished:false,last:{x:p.x,y:p.y},healCap:maxhp()*.1,retreat:length>0?{x:(p.x-s.target.x)/length,y:(p.y-s.target.y)/length}:{x:0,y:0}});
 if(length<1||length>360||!retreatSiphonValid(s)){s.finished=true;signatureSpells=signatureSpells.filter(v=>v!==s);say('360以内で見える敵を狙ってください');}return result;
};
const retreatSiphonStepBase=stepSignature;
stepSignature=(s,dt)=>{
 if(s.mode!==116)return retreatSiphonStepBase(s,dt);if(!retreatSiphonValid(s)){s.finished=true;return false;}if(paused||!Number.isFinite(dt)||dt<=0)return true;
 if(dist(p,s.last)>200||!lineClear(s.last,p)){s.finished=true;return false;}s.last={x:p.x,y:p.y};s.time+=dt;s.x=s.target.x;s.y=s.target.y;if(s.time+1e-8<1)return true;
 const e=s.target,before=e.hp,healing=s.healCap*retreatSiphonDistance(s)/120;s.finished=true;spellHit(e,s.damage*1.6,s.build);
 if(s.owner===p&&s.world===dungeon&&!dead&&p.hp>0&&!e.dummy&&e.hp<before){const actual=Math.max(0,Math.min(maxhp()-p.hp,healing));p.hp+=actual;if(actual>0){burst(p.x,p.y,60,'#8ef3c2');playSound('heal',p.x,p.y);}}
 playSignatureAudio(116,true,e.x,e.y);return false;
};
const retreatSiphonPaintBase=paintSignatureSpells;
paintSignatureSpells=()=>{retreatSiphonPaintBase();const list=signatureRenderList(116);if(!list.length)return;for(const s of list){if(!retreatSiphonValid(s))continue;const color=ELEMENTS[s.build.elements[0]].color,end={x:s.origin.x+s.retreat.x*120,y:s.origin.y+s.retreat.y*120};paintLinkLine(p,s.target,color,2);paintLinkLine(s.origin,end,'#8ef3c2',2);groundRing(end.x,end.y,16,'#8ef3c2',2);groundRing(s.target.x,s.target.y,28,color,2);boundarySigil(s.target,20,color,s.time,4);for(let i=0;i<3;i++){const t=(s.time*2+i/3)%1;groundRing(s.target.x+(p.x-s.target.x)*t,s.target.y+(p.y-s.target.y)*t,3,color,2);}}};
const retreatSiphonStatusBase=controlSkillStatus;controlSkillStatus=s=>s.mode===116?{label:'後退して吸命 · 回復 '+Math.round(s.healCap*retreatSiphonDistance(s)/120),value:Math.min(1,s.time),waiting:true}:retreatSiphonStatusBase(s);
