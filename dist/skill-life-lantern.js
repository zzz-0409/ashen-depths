const LIFE_LANTERN_SIGNATURE=['命拾いの灯',23,6,'敵1体へ0.25秒後に120%。発動から4秒以内に標的を倒すと、その場に6秒の生命灯を残す。自分が30以内へ近づくと最大ライフの8%を一度回復。壁越しには拾えず、ライフ満タンなら灯を残す。訓練標的は灯を落とさない。','M26 6V14M16 14H36L40 36L26 46L12 36ZM26 23V35M20 29H32'];
SIGNATURE_SKILLS.push(LIFE_LANTERN_SIGNATURE);
Object.assign(GEM.crafted_7_4,{name:LIFE_LANTERN_SIGNATURE[0],cost:23,cool:6,desc:LIFE_LANTERN_SIGNATURE[3]+' 通常製作：'+ELEMENTS[SKILL_ELEMENTS.crafted_7_4].name+'属性。',ability:null,signature:68,tags:['spell','area']});
const lifeLanternCastBase=castCraftedSkill;castCraftedSkill=(build,...args)=>{
 let result=lifeLanternCastBase(build,...args);if(GEM[build.type]?.signature!==68)return result;
 let s=signatureSpells.at(-1);if(!s||s.mode!==68)return result;
 if(!s.target){signatureSpells.pop();return result;}s.lantern=false;s.struck=false;return result;
};
const lifeLanternStepBase=stepSignature;stepSignature=(s,dt)=>{
 if(s.mode!==68)return lifeLanternStepBase(s,dt);
 s.time=Math.round((s.time+dt)*1000000)/1000000;s.flashes=s.flashes.filter(f=>f.until>s.time);
 if(dead||p.hp<=0)return false;
 if(s.lantern){
  if(s.time>=s.expires)return false;
  if(p.hp<maxhp()&&dist(p,s)<=30&&lineClear(p,s)){
   let amount=Math.min(maxhp()-p.hp,Math.round(maxhp()*.08));p.hp+=amount;
   burst(p.x,p.y,45,'#b7e8ab');texts.push({x:p.x,y:p.y-30,s:'+'+amount,c:'#b7e8ab',life:.8});playSound('heal',p.x,p.y);return false;
  }return true;
 }
 let e=s.target;if(s.time>4)return false;
 if(e.hp>0&&!enemies.includes(e))return false;
 if(!s.struck&&e.hp>0&&s.time>=.25){s.struck=true;if(!lineClear(s.origin,e))return false;linkStrike(s,e,1.2,s.origin);}
 if(e.hp<=0){if(e.dummy)return false;s.lantern=true;s.x=e.x;s.y=e.y;s.expires=s.time+6;s.target=null;burst(s.x,s.y,35,'#b7e8ab');return true;}
 return s.time<4;
};
const lifeLanternPaintBase=paintSignatureSpells;paintSignatureSpells=()=>{
 lifeLanternPaintBase();ctx.save();ctx.globalCompositeOperation='lighter';
 for(let s of signatureSpells){if(s.mode!==68)continue;
  if(!s.lantern){if(s.target.hp>0){let color=ELEMENTS[s.build.elements[0]].color;boundarySigil(s.target,30,color,s.time*2,4);groundRing(s.target.x,s.target.y,22,color,1);}continue;}
  let pos=project(s.x,s.y),lift=48+Math.sin(s.time*4)*4,color='#b7e8ab';ctx.globalAlpha=Math.min(1,(s.expires-s.time)/1.2);
  groundRing(s.x,s.y,30,color,1.5);boundarySigil(s,16,color,-s.time*2,4);
  circle(pos.x,pos.y-lift,10,'#b7e8ab33');circle(pos.x,pos.y-lift,5,'#ecffd4');
  ctx.strokeStyle=color;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(pos.x-6,pos.y-lift);ctx.lineTo(pos.x+6,pos.y-lift);ctx.moveTo(pos.x,pos.y-lift-6);ctx.lineTo(pos.x,pos.y-lift+6);ctx.stroke();
 }ctx.restore();
};
