// A fixed arena rewards surrounding enemies in distinct directions, not stacking one pack.
const QUADRANT_SIGNATURE=['四方の審判',26,5,'発動地点に1.2秒後に炸裂する陣を置く。半径180内を東西・南北で4区画に分け、生きた敵のいる区画1つにつき威力+75%（基礎100%、最大400%）。範囲内の敵すべてに同じ威力で一度攻撃。壁越しの敵は数えず、届かない。発動地点から自分が500を超えるか壁に遮られると消滅。','M26 5V47M5 26H47M19 12L26 5L33 12M19 40L26 47L33 40M12 19L5 26L12 33M40 19L47 26L40 33'];
SIGNATURE_SKILLS.push(QUADRANT_SIGNATURE);
Object.assign(GEM.crafted_2_4,{name:QUADRANT_SIGNATURE[0],cost:26,cool:5,desc:QUADRANT_SIGNATURE[3],ability:null,signature:84,tags:['spell','area']});
SIGNATURE_AUDIO.push(['quadrant',300,.38]);SKILL_AUDIO_FAMILIES.metal.add('quadrant');
function quadrantTargets(s){let radius=180*s.build.radius,targets=[],mask=0;for(let e of enemies){if(e.hp<=0||dist(e,s)>radius||!lineClear(s,e))continue;let quadrant=(e.x>=s.x?1:0)+(e.y>=s.y?2:0);mask|=1<<quadrant;targets.push(e);}let count=0;for(let i=0;i<4;i++)if(mask&(1<<i))count++;return{targets,mask,count};}
const quadrantCastBase=castCraftedSkill;castCraftedSkill=(build,...args)=>{let result=quadrantCastBase(build,...args);if(GEM[build.type]?.signature!==84)return result;let s=signatureSpells.at(-1);if(s?.mode===84){s.owner=p;s.x=s.origin.x;s.y=s.origin.y;s.target=null;}return result;};
const quadrantStepBase=stepSignature;stepSignature=(s,dt)=>{
 if(s.mode!==84)return quadrantStepBase(s,dt);if(dead||p.hp<=0||s.owner!==p)return false;if(paused||!Number.isFinite(dt)||dt<=0)return true;
 if(dist(p,s)>500||!lineClear(p,s))return false;s.time=Math.round((s.time+dt)*1e6)/1e6;
 if(s.time>=1.2){let {targets,count}=quadrantTargets(s),damage=s.damage*(1+count*.75);for(let e of targets)if(e.hp>0)spellHit(e,damage,s.build);burst(s.x,s.y,180*s.build.radius,'#ffe8ac');playSignatureAudio(84,true,s.x,s.y);return false;}return true;
};
const quadrantPaintBase=paintSignatureSpells;paintSignatureSpells=()=>{quadrantPaintBase();ctx.save();for(let s of signatureSpells){if(s.mode!==84||s.owner!==p||!visibleAt(s.x,s.y))continue;let {mask}=quadrantTargets(s),r=180*s.build.radius;groundRing(s.x,s.y,r,'#d4b67c',2);groundRing(s.x,s.y,r*Math.min(1,s.time/1.2),'#ffe8ac',2);for(let i=0;i<4;i++){let dx=i&1?1:-1,dy=i&2?1:-1,col=mask&(1<<i)?'#ffe8ac':'#59686b';paintLinkLine(s,{x:s.x+dx*r*.68,y:s.y+dy*r*.68},col,mask&(1<<i)?4:1);}}ctx.restore();};
const quadrantStatusBase=controlSkillStatus;controlSkillStatus=s=>s.mode===84?{label:'四方 '+quadrantTargets(s).count+'/4',value:Math.min(1,s.time/1.2),waiting:true}:quadrantStatusBase(s);
