// Beastmaster rewards recalling all three allies before sending a coordinated attack.
let beastAssembly=0;
const BEAST_ASSEMBLY_DESC='集合中、召喚獣3体が自分の半径100以内・壁のない位置で1秒そろうと連携準備。専用操作で進撃に戻すと、各個体の次の攻撃が250%になる（6秒以内・各1回）。再召喚した個体には引き継がない。';
ADVANCED_JOBS[6][1]+=' '+BEAST_ASSEMBLY_DESC;
function beastGroupReady(){return started&&!dead&&currentJob()===14&&companionRecall&&companions.length===3&&companions.every(c=>!c.dragon&&c.life>0&&dist(c,p)<=100&&lineClear(p,c));}
const beastActionBase=useJobAction;useJobAction=()=>{let ready=beastAssembly>=1&&beastGroupReady(),result=beastActionBase();if(result&&currentJob()===14){if(ready&&!companionRecall)for(let c of companions){c.rallyTime=6;c.rallyOwner=p;}beastAssembly=0;}return result;};
const beastStrikeBase=companionStrikeMultiplier;companionStrikeMultiplier=c=>{let base=beastStrikeBase(c);if(currentJob()===14&&c.rallyOwner===p&&c.rallyTime>0&&!c.dragon){c.rallyTime=0;burst(c.x,c.y,35,'#b8ffe0');return base*2.5;}return base;};
const beastStepBase=stepCompanions;stepCompanions=dt=>{
 if(!started||paused||dead||!Number.isFinite(dt)||dt<=0)return beastStepBase(dt);
 let ready=beastGroupReady(),group=[...companions];for(let c of companions)if(c.rallyTime>0)c.rallyTime=Math.max(0,c.rallyTime-dt);
 let result=beastStepBase(dt);if(ready&&beastGroupReady()&&group.every(c=>companions.includes(c)))beastAssembly=Math.min(1,beastAssembly+dt);else beastAssembly=0;return result;
};
const beastResetBase=resetCompanions;resetCompanions=()=>{beastAssembly=0;return beastResetBase();};
const beastGroundBase=drawGroundEffects;drawGroundEffects=()=>{beastGroundBase();if(!started||dead||currentJob()!==14)return;if(companionRecall){groundRing(p.x,p.y,100,beastAssembly>=1?'#caffdd':'#5b9f88',2);}for(let c of companions)if(c.rallyTime>0&&c.rallyOwner===p)groundRing(c.x,c.y,30,'#caffdd',3);};
const beastHudBase=drawHud;drawHud=()=>{beastHudBase();if(!started||paused||dead||currentJob()!==14)return;let count=companions.filter(c=>c.rallyOwner===p&&c.rallyTime>0).length;jobHudTarget().textContent+=companionRecall?(beastAssembly>=1?' · 連携準備完了':' · 集合 '+Math.floor(beastAssembly*100+1e-7)+'%'):count?' · 連携残り'+count+'体':'';jobHudTarget().title+=' '+BEAST_ASSEMBLY_DESC;};
