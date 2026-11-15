// Cosmetic only: lazy-loaded chain sheet; damage remains in skill-pursuit-chain.js.
const pursuitChainSheet=new Image();let pursuitChainRequested=false,pursuitChainBursts=[],pursuitChainFxOwner=null;
function requestPursuitChainSheet(){if(!pursuitChainRequested){pursuitChainRequested=true;pursuitChainSheet.decoding='async';pursuitChainSheet.src='assets/pursuit-chain-frames-v1.png';}}
function pursuitChainFxEnabled(){return effectQuality!=='low'&&!presentationPrefs.reduced&&pursuitChainSheet.complete&&pursuitChainSheet.naturalWidth>0&&pursuitChainSheet.naturalHeight>0;}
function clearPursuitChainFx(){pursuitChainBursts=[];pursuitChainFxOwner=p;}
function paintPursuitChainFrame(s,frame,size,alpha){if(!visibleAt(s.x,s.y))return;let q=project(s.x,s.y);if(q.x<-size||q.x>W+size||q.y<-size||q.y>H+size)return;let w=pursuitChainSheet.naturalWidth/4,h=pursuitChainSheet.naturalHeight/4;ctx.save();ctx.globalCompositeOperation='screen';ctx.globalAlpha=alpha;ctx.drawImage(pursuitChainSheet,frame%4*w,Math.floor(frame/4)*h,w,h,q.x-size/2,q.y-size/2-25,size,size);ctx.restore();}
function paintPursuitChainCharge(s){if(!pursuitChainFxEnabled())return false;paintPursuitChainFrame(s,Math.min(7,Math.floor(s.time/2*8)),130+s.travel/10,.75+s.travel/1200);return true;}
const pursuitChainFxCastBase=castCraftedSkill;castCraftedSkill=(build,...args)=>{if(GEM[build.type]?.signature===83&&effectQuality!=='low'&&!presentationPrefs.reduced)requestPursuitChainSheet();return pursuitChainFxCastBase(build,...args);};
const pursuitChainFxStepBase=stepSignature;stepSignature=(s,dt)=>{let before=s.time,result=pursuitChainFxStepBase(s,dt);if(s.mode===83&&!result&&before<2&&s.time>=2&&pursuitChainFxEnabled()){if(pursuitChainFxOwner!==p)clearPursuitChainFx();if(pursuitChainBursts.length>=4)pursuitChainBursts.shift();pursuitChainBursts.push({x:s.x,y:s.y,time:0,size:160+s.travel/10});}return result;};
function stepPursuitChainFx(dt){if(pursuitChainFxOwner!==p||dead||!started||effectQuality==='low'||presentationPrefs.reduced){clearPursuitChainFx();return;}if(paused||!Number.isFinite(dt)||dt<=0)return;for(let s of pursuitChainBursts)s.time+=dt;pursuitChainBursts=pursuitChainBursts.filter(s=>s.time<.4);}
function paintPursuitChainBursts(){if(!started||dead||pursuitChainFxOwner!==p||!pursuitChainFxEnabled())return;for(let s of pursuitChainBursts)paintPursuitChainFrame(s,8+Math.min(7,Math.floor(s.time/.4*8)),s.size,1-s.time);}
const pursuitChainFxUpdateBase=update;update=dt=>{stepPursuitChainFx(dt);return pursuitChainFxUpdateBase(dt);};
const pursuitChainFxDrawBase=drawEffects;drawEffects=()=>{paintPursuitChainBursts();return pursuitChainFxDrawBase();};
const pursuitChainFxLoadBase=loadWorld;loadWorld=(...args)=>{clearPursuitChainFx();return pursuitChainFxLoadBase(...args);};
const pursuitChainFxDummyBase=clearDummy;clearDummy=(...args)=>{clearPursuitChainFx();return pursuitChainFxDummyBase(...args);};
