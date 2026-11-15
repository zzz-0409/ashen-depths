// Cosmetic release event only. No hit, damage or projectile behavior lives here.
const grazeRingVfxSheet=new Image();grazeRingVfxSheet.assetSrc='assets/graze-ring-vfx-v1.png';GAME_IMAGES.push(grazeRingVfxSheet);
let grazeRingVfx=[],grazeRingVfxOwner=null,grazeRingVfxResolving=false;
function resetGrazeRingVfx(){grazeRingVfx=[];grazeRingVfxOwner=p;}
function addGrazeRingVfx(x,y,radius=1,charges=3){
 if(grazeRingVfxOwner!==p)resetGrazeRingVfx();
 if(!started||paused||dead||p.hp<=0||presentationPrefs.reduced||!Number.isFinite(x)||!Number.isFinite(y)||!Number.isFinite(charges)||charges<=0)return;
 charges=clamp(Math.floor(charges),1,3);grazeRingVfx=[{x,y,time:0,duration:charges===3?.6:.45,radius:clamp(Number(radius)||1,.5,2),charges}];
}
function stepGrazeRingVfx(dt){if(grazeRingVfxOwner!==p||!started||dead||p.hp<=0||presentationPrefs.reduced){resetGrazeRingVfx();return;}if(paused||!Number.isFinite(dt)||dt<=0)return;for(let e of grazeRingVfx)e.time+=dt;grazeRingVfx=grazeRingVfx.filter(e=>e.time<e.duration);}
function grazeRingVfxFrame(e){let t=clamp(e.time/e.duration,0,1),low=effectQuality==='low',frames=e.charges===3?(low?[0,2,4,6]:[0,1,2,3,4,5,6,7]):(low?[3,5,7]:[3,4,5,6,7]);return frames[Math.min(frames.length-1,Math.floor(t*frames.length))];}
function paintGrazeRingVfx(){
 if(!started||dead||presentationPrefs.reduced||grazeRingVfxOwner!==p||!grazeRingVfxSheet.complete||!grazeRingVfxSheet.naturalWidth||!grazeRingVfxSheet.naturalHeight)return;
 let sw=grazeRingVfxSheet.naturalWidth/4,sh=grazeRingVfxSheet.naturalHeight/2;
 for(let e of grazeRingVfx){if(!visibleAt(e.x,e.y))continue;let q=project(e.x,e.y),size=560*e.radius;if(q.x<-size||q.x>W+size||q.y<-size||q.y>H+size)continue;
  let t=clamp(e.time/e.duration,0,1),frame=grazeRingVfxFrame(e),anchor=frame<4?.78:.60;
  // The generated rows have different ground baselines. Register both to the impact point.
  ctx.save();ctx.globalCompositeOperation='screen';ctx.globalAlpha=(.4+.2*e.charges)*(t>.75?(1-t)*4:1);ctx.drawImage(grazeRingVfxSheet,(frame%4)*sw,Math.floor(frame/4)*sh,sw,sh,q.x-size/2,q.y-size*anchor,size,size);ctx.restore();
 }
}
const grazeRingVfxReleaseBase=releaseGrazeRing;releaseGrazeRing=s=>{
 let owner=p,eligible=!grazeRingVfxResolving&&s?.mode===93&&s.owner===p&&!s.finished&&s.charges>0,origin=eligible?{x:p.x,y:p.y}:null,previous=grazeRingVfxResolving,result;
 grazeRingVfxResolving=true;try{result=grazeRingVfxReleaseBase(s);}finally{grazeRingVfxResolving=previous;}
 if(eligible&&p===owner&&s.finished)addGrazeRingVfx(origin.x,origin.y,s.build.radius,s.charges);return result;
};
const grazeRingVfxUpdateBase=update;update=dt=>{stepGrazeRingVfx(dt);return grazeRingVfxUpdateBase(dt);};
const grazeRingVfxDrawBase=drawEffects;drawEffects=()=>{let result=grazeRingVfxDrawBase();paintGrazeRingVfx();return result;};
const grazeRingVfxWorldBase=loadWorld;loadWorld=(...args)=>{resetGrazeRingVfx();return grazeRingVfxWorldBase(...args);};
const grazeRingVfxDummyBase=clearDummy;clearDummy=(...args)=>{resetGrazeRingVfx();return grazeRingVfxDummyBase(...args);};
