// Generated eight-frame slash, fire impact and frost nova. Cosmetic only.
const combatVfxSheet=new Image();combatVfxSheet.assetSrc='assets/combat-vfx-atlas-v1.png';
BASE_GAME_IMAGES.push(combatVfxSheet);GAME_IMAGES.push(combatVfxSheet);
let combatVfxBursts=[],combatVfxOwner=null;
function clearCombatVfx(){combatVfxBursts=[];combatVfxOwner=p;}
function combatVfxReady(){return combatVfxSheet.complete&&combatVfxSheet.naturalWidth>0&&combatVfxSheet.naturalHeight>0;}
function combatVfxLimit(){return effectQuality==='low'?4:10;}
const combatVfxAddBase=addEffect;addEffect=(type,x,y,extra={})=>{
 const result=combatVfxAddBase(type,x,y,extra);
 if(combatVfxOwner!==p)clearCombatVfx();
 if(!started||paused||dead||presentationPrefs.reduced||!Number.isFinite(x)||!Number.isFinite(y))return result;
 let kind=type==='slash'?'slash':type==='nova'?'frost':type==='impact'&&extra.style==='fire'?'fire':null;
 if(!kind)return result;
 while(combatVfxBursts.length>=combatVfxLimit())combatVfxBursts.shift();
 combatVfxBursts.push({kind,x,y,time:0,duration:kind==='slash'?.3:kind==='frost'?.55:.42,r:Math.min(700,Math.max(12,Number(extra.r)||60)),angle:Number.isFinite(extra.angle)?extra.angle:0});
 return result;
};
function stepCombatVfx(dt){
 if(combatVfxOwner!==p||!started||dead||presentationPrefs.reduced){clearCombatVfx();return;}
 if(paused||!Number.isFinite(dt)||dt<=0)return;
 for(let e of combatVfxBursts)e.time+=dt;
 combatVfxBursts=combatVfxBursts.filter(e=>e.time<e.duration).slice(-combatVfxLimit());
}
function paintCombatVfxFrame(x,y,frame,size,angle=0,ground=false,alpha=1){
 if(!visibleAt(x,y))return false;let q=project(x,y);
 if(q.x<-size||q.x>W+size||q.y<-size||q.y>H+size)return false;
 let sw=combatVfxSheet.naturalWidth/4,sh=combatVfxSheet.naturalHeight/6;
 ctx.save();ctx.globalCompositeOperation='screen';ctx.globalAlpha=alpha;ctx.translate(q.x,q.y-(ground?0:20));
 if(ground)ctx.transform(ISOX,ISOY,-ISOX,ISOY,0,0);
 ctx.rotate(angle);ctx.drawImage(combatVfxSheet,frame%4*sw,Math.floor(frame/4)*sh,sw,sh,-size/2,-size/2,size,size);ctx.restore();return true;
}
function paintCombatVfx(){
 if(!started||dead||presentationPrefs.reduced||combatVfxOwner!==p||!combatVfxReady())return;
 let remaining=combatVfxLimit(),light=effectQuality==='low';
 for(let i=combatVfxBursts.length-1;i>=0&&remaining>0;i--){let e=combatVfxBursts[i],t=Math.min(1,e.time/e.duration),frame=light?Math.min(3,Math.floor(t*4))*2:Math.min(7,Math.floor(t*8));
  let start=e.kind==='slash'?0:e.kind==='fire'?8:16,size=e.r*(e.kind==='fire'?3:2.35);
  if(paintCombatVfxFrame(e.x,e.y,start+frame,size,e.kind==='slash'?e.angle:0,e.kind!=='fire',1-t*.3))remaining--;
 }
 for(let s of shots){if(remaining<=0)break;if(s.enemy||s.skill!=='fire'||s.art||s.life<=0)continue;
  if(paintCombatVfxFrame(s.x,s.y,9+Math.floor(clock*18)%2,48,Math.atan2((s.vx+s.vy)*ISOY,(s.vx-s.vy)*ISOX),false,.9))remaining--;
 }
}
const combatVfxUpdateBase=update;update=dt=>{stepCombatVfx(dt);return combatVfxUpdateBase(dt);};
const combatVfxDrawBase=drawEffects;drawEffects=()=>{paintCombatVfx();return combatVfxDrawBase();};
const combatVfxLoadBase=loadWorld;loadWorld=(...args)=>{clearCombatVfx();return combatVfxLoadBase(...args);};
const combatVfxDummyBase=clearDummy;clearDummy=(...args)=>{clearCombatVfx();return combatVfxDummyBase(...args);};

// World species and training targets bypass the legacy effects hit wrapper.
if(typeof hit==='function'){const combatVfxHitBase=hit;hit=(e,d)=>{let hp=e.hp,hits=e.trainingHits||0,previous=combatVfxBursts.at(-1),fire=!e.dotTick&&(currentImpactType==='fire'||shots.some(s=>!s.enemy&&s.skill==='fire'&&Math.hypot(s.x-e.x,s.y-e.y)<45));let result=combatVfxHitBase(e,d);if(fire&&(e.hp<hp||(e.trainingHits||0)>hits)&&combatVfxBursts.at(-1)===previous)addEffect('impact',e.x,e.y,{style:'fire',color:'#ff9c3d',r:e.boss?85:48,duration:.6});return result;};}
