// Sequential route rewards; elements change the finishing strike, never the route rules.
const TAILWIND_SIGNATURE=['追風の回廊',26,8,'前方90・180・270に6秒残る印を設置。半径32の印を手前から順に通るたびSP12回復。3つ目で周囲140へ240%。回避での通過も有効。壁越し・200を超える瞬間移動では解除。再発動で置き直す。','M5 42L15 32L25 22L35 12M9 26L15 32L21 38M19 16L25 22L31 28M29 6L35 12L41 18M38 36H48M43 31V41'];
SIGNATURE_SKILLS.push(TAILWIND_SIGNATURE);
Object.assign(GEM.crafted_1_1,{name:TAILWIND_SIGNATURE[0],cost:26,cool:8,desc:TAILWIND_SIGNATURE[3]+' 印の距離・通過判定は範囲補正で変わらない。',ability:null,signature:73,tags:['spell','area']});
SIGNATURE_AUDIO.push(['tailwind',630,.43]);SKILL_AUDIO_FAMILIES.airy.add('tailwind');
const tailwindCastBase=castCraftedSkill;castCraftedSkill=(build,...args)=>{
 let result=tailwindCastBase(build,...args);if(GEM[build.type]?.signature!==73)return result;
 let s=signatureSpells.at(-1);if(!s||s.mode!==73)return result;
 signatureSpells=signatureSpells.filter(other=>other.mode!==73||other===s);
 s.marks=[90,180,270].map(d=>({x:s.origin.x+Math.cos(s.angle)*d,y:s.origin.y+Math.sin(s.angle)*d}));s.collected=0;s.previous={...s.origin};s.x=s.origin.x;s.y=s.origin.y;s.target=null;return result;
};
const tailwindStepBase=stepSignature;stepSignature=(s,dt)=>{
 if(s.mode!==73)return tailwindStepBase(s,dt);if(dead||p.hp<=0)return false;
 s.time=Math.round((s.time+dt)*1000000)/1000000;if(s.time>=6)return false;
 if(dist(s.previous,p)>200||!lineClear(s.previous,p))return false;
 let lastContact=-1;
 while(s.collected<3){let mark=s.marks[s.collected],contact=projectileContact(s.previous,p,mark,32);if(contact===null&&dist(p,mark)<=32+1e-8)contact=1;
  if(contact===null||contact<lastContact)break;if(!lineClear(s.origin,mark)||!lineClear(p,mark))return false;
  lastContact=contact;s.collected++;p.sp=Math.min(maxsp(),p.sp+12);burst(mark.x,mark.y,32,ELEMENTS[s.build.elements[0]].color);
  if(s.collected===3){signatureArea(s,mark,140,2.4);return false;}
 }
 s.previous={x:p.x,y:p.y};return true;
};
const tailwindPaintBase=paintSignatureSpells;paintSignatureSpells=()=>{
 tailwindPaintBase();ctx.save();ctx.globalCompositeOperation='lighter';
 for(let s of signatureSpells){if(s.mode!==73)continue;let color=ELEMENTS[s.build.elements[0]].color;
  for(let i=s.collected;i<3;i++){let mark=s.marks[i];if(!visibleAt(mark.x,mark.y)||!lineClear(s.origin,mark))continue;let active=i===s.collected;
   groundRing(mark.x,mark.y,32,active?color:'#6d7884',active?3:1);boundarySigil(mark,active?25:18,color,s.angle+s.time*.5,3);
   let q=project(mark.x,mark.y);for(let n=0;n<=i;n++)circle(q.x+(n-i/2)*8,q.y-30,2,active?color:'#6d7884');
  }
 }ctx.restore();
};
const tailwindStatusBase=controlSkillStatus;controlSkillStatus=s=>s.mode===73?{label:'回廊 '+s.collected+'/3 · '+Math.max(0,6-s.time).toFixed(1)+'秒',value:s.collected/3,waiting:true}:tailwindStatusBase(s);
