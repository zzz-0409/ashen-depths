// Cosmetic chain rupture at each struck target; never changes combat damage.
const partingChainVfxSheet=new Image();partingChainVfxSheet.assetSrc='assets/parting-chain-vfx-v1.png';BASE_GAME_IMAGES.push(partingChainVfxSheet);GAME_IMAGES.push(partingChainVfxSheet);
let partingChainVfx=[],partingChainVfxOwner=null,partingChainVfxResolving=false;
function resetPartingChainVfx(){partingChainVfx=[];partingChainVfxOwner=p;}
function addPartingChainVfx(x,y){if(partingChainVfxOwner!==p)resetPartingChainVfx();if(!started||paused||dead||p.hp<=0||presentationPrefs.reduced||!Number.isFinite(x)||!Number.isFinite(y))return;let limit=effectQuality==='low'?1:2;while(partingChainVfx.length>=limit)partingChainVfx.shift();partingChainVfx.push({x,y,time:0,duration:.6});}
function stepPartingChainVfx(dt){if(partingChainVfxOwner!==p||!started||dead||p.hp<=0||presentationPrefs.reduced){resetPartingChainVfx();return;}if(paused||!Number.isFinite(dt)||dt<=0)return;for(let e of partingChainVfx)e.time+=dt;partingChainVfx=partingChainVfx.filter(e=>e.time<e.duration).slice(-(effectQuality==='low'?1:2));}
function paintPartingChainVfx(){if(!started||dead||presentationPrefs.reduced||partingChainVfxOwner!==p||!partingChainVfxSheet.complete||!partingChainVfxSheet.naturalWidth||!partingChainVfxSheet.naturalHeight)return;let low=effectQuality==='low',sw=partingChainVfxSheet.naturalWidth/4,sh=partingChainVfxSheet.naturalHeight/2,limit=low?1:2,size=220;for(let e of partingChainVfx.slice(-limit)){if(!visibleAt(e.x,e.y))continue;let q=project(e.x,e.y);if(q.x<-size||q.x>W+size||q.y<-size||q.y>H+size)continue;let t=clamp(e.time/e.duration,0,1),frame=low?Math.min(3,Math.floor(t*4))*2:Math.min(7,Math.floor(t*8));ctx.save();ctx.globalCompositeOperation='screen';ctx.globalAlpha=t>.75?(1-t)*4:1;ctx.drawImage(partingChainVfxSheet,(frame%4)*sw,Math.floor(frame/4)*sh,sw,sh,q.x-size/2,q.y-size*.7,size,size);ctx.restore();}}
const partingChainVfxHitBase=spellHit;spellHit=(enemy,damage,build)=>{
 let eligible=!partingChainVfxResolving&&GEM[build?.type]?.signature===92&&enemy?.hp>0,origin=eligible?{x:enemy.x,y:enemy.y}:null,previous=partingChainVfxResolving,result;
 partingChainVfxResolving=true;try{result=partingChainVfxHitBase(enemy,damage,build);}finally{partingChainVfxResolving=previous;}
 if(eligible)addPartingChainVfx(origin.x,origin.y);return result;
};
const partingChainVfxUpdateBase=update;update=dt=>{stepPartingChainVfx(dt);return partingChainVfxUpdateBase(dt);};
const partingChainVfxDrawBase=drawEffects;drawEffects=()=>{let result=partingChainVfxDrawBase();paintPartingChainVfx();return result;};
const partingChainVfxWorldBase=loadWorld;loadWorld=(...args)=>{resetPartingChainVfx();return partingChainVfxWorldBase(...args);};
const partingChainVfxDummyBase=clearDummy;clearDummy=(...args)=>{resetPartingChainVfx();return partingChainVfxDummyBase(...args);};
