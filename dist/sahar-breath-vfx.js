// Optional sandfire atlas. Clips visuals to the actual 60..480 / 24-degree cone.
const saharBreathVfxSheet=new Image();saharBreathVfxSheet.assetSrc='assets/sahar-breath-vfx-v1.png';GAME_IMAGES.push(saharBreathVfxSheet);
const saharBreathImagesBase=regionGameImages;regionGameImages=(region,contract=null)=>{let images=saharBreathImagesBase(region,contract);return region===4&&!presentationPrefs.reduced?[...images,saharBreathVfxSheet]:images;};
function paintSaharBreathVfx(e){
 let a=e.attack;if(!started||dead||presentationPrefs.reduced||e.hp<=0||a?.pattern!=='saharBreath'||a.owner!==p||a.world!==dungeon||!visibleAt(e.x,e.y)||!saharBreathVfxSheet.complete||!saharBreathVfxSheet.naturalWidth||!saharBreathVfxSheet.naturalHeight)return false;
 let wave=a.waves.find(w=>e.elapsed>=w.start&&e.elapsed<w.start+1.8);if(!wave)return false;
 let angle=saharBreathAngle(a,wave,e.elapsed),ux=Math.cos(angle),uy=Math.sin(angle),q=project(a.origin.x,a.origin.y),along=project(a.origin.x+ux,a.origin.y+uy),across=project(a.origin.x-uy,a.origin.y+ux),frame=effectQuality==='low'?3:Math.floor((e.elapsed-wave.start)*12)%8,sw=saharBreathVfxSheet.naturalWidth/4,sh=saharBreathVfxSheet.naturalHeight/2;
 ctx.save();ctx.transform(along.x-q.x,along.y-q.y,across.x-q.x,across.y-q.y,q.x,q.y);ctx.beginPath();ctx.arc(0,0,480,-Math.PI/15,Math.PI/15);ctx.arc(0,0,60,Math.PI/15,-Math.PI/15,true);ctx.closePath();ctx.clip();ctx.globalCompositeOperation='screen';ctx.globalAlpha=.78;ctx.drawImage(saharBreathVfxSheet,(frame%4)*sw,Math.floor(frame/4)*sh,sw,sh,-30,-300,600,600);ctx.restore();return true;
}
const saharBreathVfxGroundBase=drawGroundEffects;drawGroundEffects=()=>{saharBreathVfxGroundBase();let count=0,limit=effectQuality==='low'?1:2;for(let e of(typeof enemyRenderList==='function'?enemyRenderList('r4b0'):enemies)){if(e.species!=='r4b0')continue;if(paintSaharBreathVfx(e)&&++count>=limit)break;}};
