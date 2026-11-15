// Dragon Sovereign controls the contracted dragon during a short mounted window.
let dragonRide=null;
const DRAGON_RIDE_DESC='野外の専用操作でSP25を使い契約竜へ6秒騎乗。移動速度+30%、通常攻撃で契約竜のブレスを自分で指示（1.2秒間隔・通常攻撃のSP消費）。再入力で下馬。被ダメージや壁の通行条件は変わらない。';
ADVANCED_JOBS[7][1]+=' '+DRAGON_RIDE_DESC;
function dragonRideActive(){return !!(dragonRide&&dragonRide.owner===p&&currentJob()===15&&started&&!dead&&p.hp>0&&!villageOpen&&dragonRide.time>0&&dragonRide.dragon.life>0&&companions.includes(dragonRide.dragon));}
function stopDragonRide(){dragonRide=null;}
const rideActionBase=useJobAction;useJobAction=()=>{
 if(dragonRide&&!dragonRideActive())stopDragonRide();
 if(dragonRide){if(paused||playerAction)return false;stopDragonRide();return true;}
 let result=rideActionBase();if(result&&currentJob()===15&&!villageOpen){let dragon=companions.find(c=>c.dragon);if(dragon){dragonRide={owner:p,dragon,time:6};dragon.x=p.x;dragon.y=p.y;dragon.path=[];}}
 return result;
};
const rideStatBase=stat;stat=key=>rideStatBase(key)+(key==='speed'&&dragonRideActive()?30:0);
const rideCompanionBase=controlMountedCompanion;controlMountedCompanion=(c,dt)=>{if(dragonRideActive()&&c===dragonRide.dragon){c.x=p.x;c.y=p.y;c.facing=face;c.state=c.elapsed>0?'attack':playerMoving?'walk':'idle';return true;}return rideCompanionBase(c,dt);};
const rideMountedBase=isMountedCompanion;isMountedCompanion=c=>dragonRideActive()&&c===dragonRide.dragon||rideMountedBase(c);
const ridePerformBase=performAction;performAction=action=>{
 if(action.n!==0||!dragonRideActive())return ridePerformBase(action);
 let c=dragonRide.dragon;c.x=p.x;c.y=p.y;c.facing=face;cd[0]=1.2;c.elapsed=.35;c.state='attack';
 let target=enemies.filter(e=>e.hp>0&&dist(e,action.target)<=140&&dist(p,e)<=650&&lineClear(p,e)).sort((a,b)=>dist(a,action.target)-dist(b,action.target))[0];
 if(target)dragonBreathStrike(c,target,damage()*1.1*ultimatePowerRate(),{owner:p,charged:false});
};
function advanceDragonRide(dt){if(!dragonRide)return;if(!dragonRideActive()){stopDragonRide();return;}if(paused||!Number.isFinite(dt)||dt<=0)return;dragonRide.time-=dt;if(dragonRide.time<=0)stopDragonRide();}
const rideUpdateBase=update;update=dt=>{advanceDragonRide(dt);rideUpdateBase(dt);if(dragonRide&&!dragonRideActive())stopDragonRide();};
const rideResetBase=resetCompanions;resetCompanions=()=>{stopDragonRide();return rideResetBase();};
const ridePlayerBase=drawPlayerActor;drawPlayerActor=()=>{if(!dragonRideActive())return ridePlayerBase();let c=dragonRide.dragon,state=c.elapsed>0?'attack':playerMoving?'walk':'idle';actorSprite(dragonSheet,p.x,p.y,190,state,c.elapsed>0?.35-c.elapsed:playerAnim,face,p.inv>0?.75:1);ctx.save();ctx.translate(0,-65);actorSprite(heroSheet,p.x,p.y,65,playerAction?'attack':'idle',playerAction?playerAction.elapsed/playerAction.duration*.85:playerAnim,face,p.inv>0?.75:1);ctx.restore();};
const rideHudBase=drawHud;drawHud=()=>{rideHudBase();if(!dragonRideActive()||paused)return;jobHudTarget().textContent='竜騎乗 '+dragonRide.time.toFixed(1)+'秒 · 下馬 '+(padActive?(padProfile.buttons.jobAction===10?'Lスティック押込':'Btn '+padProfile.buttons.jobAction):'C');jobHudTarget().title=DRAGON_RIDE_DESC;setJobBasicLabel('騎乗ブレス');};

const rideBreathDamageBase=onDragonBreathDamage;onDragonBreathDamage=context=>{rideBreathDamageBase(context);if(context&&context.owner===p&&!context.charged&&currentJob()===15&&started&&!dead){context.charged=true;gainUltimate(7);reportAdvancedJobAction(15);}};

const rideReachBase=normalAttackReach;normalAttackReach=()=>dragonRideActive()?({r1b3:320,r4b0:200,r5b3:230,r7b1:600,r11b1:600}[dragonRide.dragon.dragonId]||320):rideReachBase();
