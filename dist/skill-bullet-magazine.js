const BULLET_MAGAZINE_SIGNATURE=['停弾の弾倉',14,.6,'1回目で照準地点に半径90の弾倉を設置。最初の3秒、敵弾を最大3発消して蓄える。6秒以内に再発動すると、蓄え1発につき150%の貫通光線を現在の照準方向へ0.2秒後に放つ（長さ500・半幅18、各敵1回）。発動のたびMP14。空のまま再発動すると設置し直す。近接・地面攻撃は防げない。光線は解放時の威力とジェム属性を使用。範囲補正は捕捉半径と光線幅だけ。起点から500超・起点が壁越し・死亡・地域移動・6秒経過で蓄えを失う。'];
BULLET_MAGAZINE_SIGNATURE.push('M10 10H42V33L26 45L10 33ZM17 19H21M25 19H29M33 19H37M26 28V38M19 32L26 39L33 32');
SIGNATURE_SKILLS.push(BULLET_MAGAZINE_SIGNATURE);Object.assign(GEM.crafted_8_1,{name:BULLET_MAGAZINE_SIGNATURE[0],cost:14,cool:.6,desc:BULLET_MAGAZINE_SIGNATURE[3],ability:null,signature:113,tags:['spell','area']});
SIGNATURE_AUDIO.push(['bulletmagazine',510,.3]);SKILL_AUDIO_FAMILIES.metal.add('bulletmagazine');
function bulletMagazineValid(s){return !s.finished&&s.owner===p&&s.world===dungeon&&!dead&&p?.hp>0&&s.time<(s.releasing?.45:6)&&dist(p,s)<=500&&lineClear(p,s);}
const bulletMagazineCastBase=castCraftedSkill;
castCraftedSkill=(build,...args)=>{
 const old=GEM[build.type]?.signature===113?signatureSpells.find(s=>s.mode===113&&!s.releasing&&bulletMagazineValid(s)):null;
 const result=bulletMagazineCastBase(build,...args);if(GEM[build.type]?.signature!==113)return result;const s=signatureSpells.at(-1);if(s?.mode!==113)return result;
 signatureSpells=signatureSpells.filter(v=>v.mode!==113||v===s);Object.assign(s,{owner:p,world:dungeon,finished:false,captured:old?.captured||0,releasing:!!old?.captured,fired:false,target:null});
 if(s.releasing){s.x=p.x;s.y=p.y;s.length=0;for(let d=2;d<=500;d+=2){if(!lineClear(s,{x:s.x+Math.cos(s.angle)*d,y:s.y+Math.sin(s.angle)*d}))break;s.length=d;}s.end={x:s.x+Math.cos(s.angle)*s.length,y:s.y+Math.sin(s.angle)*s.length};}return result;
};
const bulletMagazineProjectileBase=advanceProjectile;
advanceProjectile=(shot,dt)=>{
 if(started&&!paused&&!dead&&shot.enemy&&shot.life>0&&Number.isFinite(dt)&&dt>0&&Number.isFinite(shot.vx)&&Number.isFinite(shot.vy)){
  const step=Math.min(dt,shot.life),from={x:shot.x,y:shot.y},end={x:shot.x+shot.vx*step,y:shot.y+shot.vy*step},playerAt=projectileContact(from,end,p,ENEMY_PROJECTILE_HIT_RADIUS);
  const fields=signatureSpells.filter(s=>s.mode===113&&!s.releasing&&s.time<3&&s.captured<3&&bulletMagazineValid(s)).map(s=>({s,t:projectileContact(from,end,s,90*s.build.radius)})).filter(v=>v.t!==null&&v.s.time+step*v.t<3-1e-8&&(playerAt===null||v.t<=playerAt)).sort((a,b)=>a.t-b.t);
  for(const {s,t} of fields){const point={x:from.x+(end.x-from.x)*t,y:from.y+(end.y-from.y)*t};if(!lineClear(from,point)||!lineClear(s,point))break;
   const earlier=signatureSpells.some(v=>((v.mode===24&&v.time<3&&v.used<6)||(v.mode===53&&v.time<3&&v.reflected<3))&&(()=>{const at=projectileContact(from,end,v,120*v.build.radius);return at!==null&&at<t;})());if(earlier)break;
   s.captured++;shot.x=point.x;shot.y=point.y;shot.life=0;burst(point.x,point.y,20,ELEMENTS[s.build.elements[0]].color);playSound('frost',point.x,point.y);return;
  }
 }
 return bulletMagazineProjectileBase(shot,dt);
};
const bulletMagazineStepBase=stepSignature;
stepSignature=(s,dt)=>{
 if(s.mode!==113)return bulletMagazineStepBase(s,dt);if(!bulletMagazineValid(s)){s.finished=true;return false;}if(paused||!Number.isFinite(dt)||dt<=0)return true;s.time+=dt;
 if(s.releasing&&!s.fired&&s.time+1e-8>=.2){s.fired=true;const dx=Math.cos(s.angle),dy=Math.sin(s.angle);for(const e of enemies){const x=e.x-s.x,y=e.y-s.y,along=x*dx+y*dy;if(e.hp>0&&along>=0&&along<=s.length&&Math.abs(x*dy-y*dx)<=18*s.build.radius&&lineClear(s,e))spellHit(e,s.damage*1.5*s.captured,s.build);}playSignatureAudio(113,true,s.x,s.y);}
 if(s.time+1e-8>=(s.releasing?.45:6)){s.finished=true;return false;}return true;
};
const bulletMagazinePaintBase=paintSignatureSpells;
paintSignatureSpells=()=>{bulletMagazinePaintBase();for(const s of signatureSpells){if(s.mode!==113||!bulletMagazineValid(s))continue;const color=ELEMENTS[s.build.elements[0]].color;if(s.releasing){const nx=-Math.sin(s.angle)*18*s.build.radius,ny=Math.cos(s.angle)*18*s.build.radius;for(const side of [-1,1])paintLinkLine({x:s.x+nx*side,y:s.y+ny*side},{x:s.end.x+nx*side,y:s.end.y+ny*side},color,1);paintLinkLine(s,s.end,color,s.fired?8:2);if(s.fired)paintLinkLine(s,s.end,'#fff4d2',3);}else if(visibleAt(s.x,s.y)){groundRing(s.x,s.y,90*s.build.radius,s.time<3?color:'#7e8995',2);for(let i=0;i<3;i++){const angle=i*Math.PI*2/3+s.time;groundRing(s.x+Math.cos(angle)*30,s.y+Math.sin(angle)*30,6,i<s.captured?'#ffe4a3':'#66747c',i<s.captured?3:1);}}}};
const bulletMagazineStatusBase=controlSkillStatus;controlSkillStatus=s=>s.mode===113?{label:s.releasing?'解放 '+s.captured*150+'%':'弾倉 '+s.captured+'/3 · 再発動で解放',value:s.releasing?clamp(s.time/.2,0,1):1-s.time/6,waiting:true}:bulletMagazineStatusBase(s);
