const STASIS_VAULT_SIGNATURE=['停時の星牢',20,8,'発動時、自分から180以内で射線が通る敵弾を近い順に最大12発、2秒間その場に停止させる。停止中は弾に触れても当たらず、弾の残り寿命も減らない。終了すると元の位置・速度・威力・残り寿命で再開する。新しく飛んできた弾、近接・地面攻撃には作用しない。属性や範囲補正では停止時間・捕捉範囲は変わらない。再発動では前の弾を解放してから捕捉し直す。死亡・地域移動・訓練リセットで停止弾は消える。','M8 9H44V43H8ZM19 17V35M33 17V35M4 26H12M40 26H48'];
SIGNATURE_SKILLS.push(STASIS_VAULT_SIGNATURE);Object.assign(GEM.crafted_12_1,{name:STASIS_VAULT_SIGNATURE[0],cost:20,cool:8,desc:STASIS_VAULT_SIGNATURE[3],ability:null,signature:129,tags:['spell']});
SIGNATURE_AUDIO.push(['stasisvault',620,.3]);SKILL_AUDIO_FAMILIES.electric.add('stasisvault');
let stasisVaultActive=null;
function releaseStasisVault(s,discard=false){
 if(!s||s.finished)return;s.finished=true;
 if(!discard&&s.world===dungeon&&!dead&&p?.hp>0)for(const shot of s.held)if(shot.life>0&&!shots.includes(shot))shots.push(shot);
 s.held=[];if(stasisVaultActive===s)stasisVaultActive=null;
}
const stasisVaultCastBase=castCraftedSkill;castCraftedSkill=(build,...args)=>{
 if(GEM[build.type]?.signature!==129)return stasisVaultCastBase(build,...args);
 releaseStasisVault(stasisVaultActive);const result=stasisVaultCastBase(build,...args),s=signatureSpells.at(-1);if(s?.mode!==129)return result;
 const held=shots.filter(v=>v.enemy&&v.life>0&&Number.isFinite(v.x)&&Number.isFinite(v.y)&&dist(p,v)<=180&&lineClear(p,v)).sort((a,b)=>dist(p,a)-dist(p,b)).slice(0,12),set=new Set(held);
 shots=shots.filter(v=>!set.has(v));Object.assign(s,{owner:p,world:dungeon,held,finished:false,target:null,x:p.x,y:p.y});stasisVaultActive=s;return result;
};
const stasisVaultStepBase=stepSignature;stepSignature=(s,dt)=>{
 if(s.mode!==129)return stasisVaultStepBase(s,dt);if(s.finished)return false;
 if(s.owner!==p||s.world!==dungeon||dead||p?.hp<=0){releaseStasisVault(s);return false;}
 if(paused||!Number.isFinite(dt)||dt<=0)return true;s.time+=dt;if(s.time+1e-8>=2){releaseStasisVault(s);return false;}return true;
};
// State eviction/reset must not permanently delete a captured projectile in the same world.
function syncStasisVault(){const s=stasisVaultActive;if(s&&(s.owner!==p||s.world!==dungeon||dead||p?.hp<=0||!signatureSpells.includes(s)))releaseStasisVault(s);}
const stasisVaultUpdateBase=update;update=dt=>{syncStasisVault();return stasisVaultUpdateBase(dt);};
const stasisVaultDummyBase=clearDummy;clearDummy=(...args)=>{releaseStasisVault(stasisVaultActive,true);return stasisVaultDummyBase(...args);};
const stasisVaultPaintBase=paintSignatureSpells;paintSignatureSpells=()=>{stasisVaultPaintBase();for(const s of signatureRenderList(129)){if(s.finished||s.world!==dungeon||dead)continue;for(const shot of s.held){if(!visibleAt(shot.x,shot.y))continue;const q=project(shot.x,shot.y);ctx.save();ctx.strokeStyle='#bcefff';ctx.fillStyle=shot.tint||'#c68ddf';ctx.lineWidth=2;ctx.beginPath();ctx.arc(q.x,q.y,4,0,Math.PI*2);ctx.fill();ctx.beginPath();for(let i=0;i<6;i++){const a=i*Math.PI/3,x=q.x+Math.cos(a)*12,y=q.y+Math.sin(a)*12;if(i===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);}ctx.closePath();ctx.stroke();ctx.restore();}}};
const stasisVaultStatusBase=controlSkillStatus;controlSkillStatus=s=>s.mode===129?{label:'敵弾停止 '+s.held.length+'発 · 解放まで'+Math.max(0,2-s.time).toFixed(1)+'秒',value:s.time/2,waiting:true}:stasisVaultStatusBase(s);
