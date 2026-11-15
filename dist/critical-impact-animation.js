// Optional16-frame cosmetic layer. Never participates in damage, timing or collision.
const criticalImpactSheet=new Image();criticalImpactSheet.src='assets/critical-impact-frames-v1.png';
let criticalSprites=[],criticalSpriteGate=-Infinity,criticalSpriteOwner=null;
function clearCriticalSprites(){criticalSprites=[];criticalSpriteGate=-Infinity;criticalSpriteOwner=p;}
function criticalSpritesEnabled(){return effectQuality!=='low'&&!presentationPrefs.reduced&&criticalImpactSheet.complete&&criticalImpactSheet.naturalWidth>0;}
const animatedImpactBase=recordImpact;recordImpact=e=>{
 let previous=impactBursts.at(-1);animatedImpactBase(e);let event=impactBursts.at(-1);
 if(criticalSpriteOwner!==p)clearCriticalSprites();
 if(!event||event===previous||!event.strong||!criticalSpritesEnabled()||clock<criticalSpriteGate)return;
 criticalSpriteGate=clock+.09;event.raster=true;if(criticalSprites.length>=4)criticalSprites.shift();
 criticalSprites.push({x:e.x,y:e.y,time:0,duration:.32,size:e.boss?190:150});
};
function stepCriticalSprites(dt){
 if(criticalSpriteOwner!==p||dead||!started||presentationPrefs.reduced||effectQuality==='low'){clearCriticalSprites();return;}
 if(paused||!Number.isFinite(dt)||dt<=0)return;
 for(let s of criticalSprites)s.time+=dt;criticalSprites=criticalSprites.filter(s=>s.time<s.duration);
}
function paintCriticalSprites(){
 if(!started||dead||criticalSpriteOwner!==p||!criticalSpritesEnabled())return;
 let width=criticalImpactSheet.naturalWidth/4,height=criticalImpactSheet.naturalHeight/4;
 ctx.save();ctx.globalCompositeOperation='screen';
 for(let s of criticalSprites){if(!visibleAt(s.x,s.y))continue;let q=project(s.x,s.y),size=s.size;if(q.x<-size||q.x>W+size||q.y<-size||q.y>H+size)continue;
 let frame=Math.min(15,Math.floor(s.time/s.duration*16));ctx.globalAlpha=.8*(1-s.time/s.duration*.35);
 ctx.drawImage(criticalImpactSheet,frame%4*width,Math.floor(frame/4)*height,width,height,q.x-size/2,q.y-36-size/2,size,size);
 }ctx.restore();
}
const animatedImpactUpdateBase=update;update=dt=>{animatedImpactUpdateBase(dt);stepCriticalSprites(dt);};
const animatedImpactDrawBase=drawEffects;drawEffects=()=>{paintCriticalSprites();return animatedImpactDrawBase();};
const animatedImpactLoadBase=loadWorld;loadWorld=(...args)=>{clearCriticalSprites();return animatedImpactLoadBase(...args);};
const animatedImpactDummyBase=clearDummy;clearDummy=()=>{clearCriticalSprites();return animatedImpactDummyBase();};
