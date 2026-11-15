let padManualAim=false,padAimDistance=240,padAimObstructed=false;
function padAimPoint(direction,range){
 let world=unproject(W/2+direction.x,H/2+direction.y),dx=world.x-p.x,dy=world.y-p.y,len=Math.hypot(dx,dy)||1;
 let point={x:p.x+dx/len*range,y:p.y+dy/len*range};padAimObstructed=!lineClear(p,point);
 if(padAimObstructed){for(let d=range;d>=0;d-=5){point={x:p.x+dx/len*d,y:p.y+dy/len*d};if(lineClear(p,point))break;}}
 return point;
}
padAimAt=(right,left)=>{
 if(!p)return;
 if(right.magnitude>.1){let len=Math.hypot(right.x,right.y)||1;padAim={x:right.x/len,y:right.y/len};padAimDistance=40+360*clamp((right.magnitude-.1)/.9,0,1);padManualAim=true;
  // A mouse-selected enemy otherwise overrides the reticle when cast() snapshots
  // its target. Taking over with the right stick also cancels the old click route.
  attackTarget=null;lootTarget=null;route=[];moveGoal=null;
 }
 else if(left.magnitude>.1){let len=Math.hypot(left.x,left.y)||1;padAim={x:left.x/len,y:left.y/len};padManualAim=false;}
 if(!padManualAim){
  let target=enemies.filter(e=>e.hp>0&&visibleAt(e.x,e.y)&&dist(p,e)<360&&lineClear(p,e)).sort((a,b)=>dist(p,a)-dist(p,b))[0];
  if(target){padAimObstructed=false;mouse=project(target.x,target.y);return;}
 }
 let point=padAimPoint(padAim,padManualAim?padAimDistance:240);mouse=project(point.x,point.y);
};
// Reset manual aim across reconnects/world changes, but keep it when releasing the stick.
const aimConnectPad=connectPad;connectPad=g=>{padManualAim=false;padAimDistance=240;return aimConnectPad(g)};
const aimLoadWorld=loadWorld;loadWorld=(...args)=>{padManualAim=false;padAimDistance=240;return aimLoadWorld(...args)};
const aimHud=drawHud;drawHud=()=>{
 aimHud();if(!p||!started||paused||dead||!padActive||!padDevice||!padManualAim)return;
 let origin=project(p.x,p.y);ctx.save();ctx.globalAlpha=.55;ctx.strokeStyle=padAimObstructed?'#e8a274':'#b7edf1';ctx.lineWidth=1;ctx.setLineDash([5,9]);ctx.beginPath();ctx.moveTo(origin.x,origin.y);ctx.lineTo(mouse.x,mouse.y);ctx.stroke();ctx.setLineDash([]);ctx.globalAlpha=.9;ctx.lineWidth=2;ctx.beginPath();ctx.arc(mouse.x,mouse.y,17,0,Math.PI*2);ctx.stroke();ctx.restore();
};
