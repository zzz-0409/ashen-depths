// A second rank-100 hunt supplies gems independently from final equipment crafting.
const SKILL_BOSS={id:'ex100skill',name:'星紡ぎの竜アステリオン',region:11,role:7,boss:true,index:3,exRank:100};
SPECIES[SKILL_BOSS.id]=SKILL_BOSS;EX_BOSSES.push(SKILL_BOSS);
for(let [tier,t]of MATERIAL_TIERS.entries())MATERIALS[SKILL_BOSS.id+':'+tier]={id:SKILL_BOSS.id+':'+tier,species:SKILL_BOSS.id,tier,name:SKILL_BOSS.name+'の'+t.part,color:t.color};
const skillBossAnimate=animateEnemy;animateEnemy=(e,dt)=>{
 if(e.species!==SKILL_BOSS.id)return skillBossAnimate(e,dt);if(e.hp<=0||e.reactionStun>0)return;
 if(e.attack?.pattern!=='astralWeave'){
  if(dist(e,p)>650){e.t=Math.max(0,e.t-dt);if(e.finalProvoked||e.bossProvoked)moveActor(e,(p.x-e.x)/dist(e,p)*80*dt,(p.y-e.y)/dist(e,p)*80*dt,30);return;}
  e.t-=dt;if(e.t>0)return;e.state='attack';e.elapsed=0;e.struck=false;let phase=e.hp<e.max*.5?2:1;e.phase=phase;e.attack={pattern:'astralWeave',bespoke:true,windup:1.5,center:{x:e.x,y:e.y},target:{x:p.x,y:p.y},angle:Math.atan2(p.y-e.y,p.x-e.x),phase,waves:0};
 }
 let a=e.attack;e.elapsed+=dt;e.anim+=dt;e.flash=Math.max(0,(e.flash||0)-dt);
 while(a.waves<a.phase+2&&e.elapsed>=1.5+a.waves*.65){let n=a.waves++,count=12+a.phase*4;for(let j=0;j<count;j++){let angle=a.angle+j*Math.PI*2/count+n*.16;shots.push({x:e.x,y:e.y,vx:Math.cos(angle)*210,vy:Math.sin(angle)*210,life:3,damage:90,enemy:true});}if(dist(p,a.target)<=95&&lineClear(a.target,p))hurt(70);burst(a.target.x,a.target.y,95,'#c49aff');playSound('arc',e.x,e.y);}
 if(e.elapsed>=4.5){e.attack=null;e.state='idle';e.t=1.3;e.struck=true;}
};
const skillBossGround=drawGroundEffects;drawGroundEffects=()=>{skillBossGround();for(let e of enemies){let a=e.attack;if(e.species!==SKILL_BOSS.id||e.hp<=0||a?.pattern!=='astralWeave')continue;groundRing(a.target.x,a.target.y,95,'#d8afff',2);groundRing(e.x,e.y,150,'#a79bff',2);}};
const skillBossDraw=drawRegionEnemy;drawRegionEnemy=(e,size)=>{if(e.species!==SKILL_BOSS.id)return skillBossDraw(e,size);let pos=project(e.x,e.y);ctx.save();ctx.translate(pos.x,pos.y);ctx.scale(e.facing||1,1);ctx.fillStyle='#170d3077';ctx.beginPath();ctx.ellipse(0,0,90,28,0,0,Math.PI*2);ctx.fill();if(dragonSheet.complete&&dragonSheet.naturalWidth){let f=spriteFrame(e.state,e.state==='attack'?e.elapsed:e.anim),sw=dragonSheet.naturalWidth/4,sh=dragonSheet.naturalHeight/3,h=size*sh/sw;ctx.filter='hue-rotate(110deg) saturate(1.3)'+(e.flash>0?' brightness(1.6)':'');ctx.drawImage(dragonSheet,f.col*sw,f.row*sh,sw,sh,-size/2,-h*.82,size,h);}ctx.restore();return true;};
const skillBossResult=showExResult;showExResult=()=>{let r=campaign().lastEx;if(!villageOpen||r?.species!==SKILL_BOSS.id)return skillBossResult();worldMenu('星紡ぎの挑戦結果','<h3>'+SKILL_BOSS.name+'</h3><p>削ったHP '+(r.units/100).toFixed(2)+'% · 獲得 × '+r.count+'</p>'+materialTile(SKILL_BOSS.id+':0',50)+'<p>欠片50個で、200種類のスキルと1〜2属性を抽選します。</p><button onclick="showSkillFoundry()">ランダムスキル製作へ</button><button onclick="showVillage()">依頼へ</button>','exResult');return true;};
// Atlas definitions must exist before rechecking saved characters on the title screen.
if(!started)welcome();
