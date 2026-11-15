// Ground materials use the same SVG silhouettes as the inventory, cached by tier/role.
const groundMaterialPathCache=new Map();
function groundMaterialPaths(id){
 if(typeof Path2D==='undefined'||typeof materialIcon!=='function')return null;let m=MATERIALS[id],key=m.tier+':'+(SPECIES[m.species]?.role||0)%8;
 if(!groundMaterialPathCache.has(key)){let paths=[...materialIcon(id).matchAll(/<path\b[^>]*\bd="([^"]+)"/g)].map(match=>new Path2D(match[1]));groundMaterialPathCache.set(key,paths);}
 return groundMaterialPathCache.get(key);
}
function groundDropFocus(){if(!started||!p||paused||dead)return null;let target=materialPickupTarget();return target&&MATERIALS[target.material.id]&&visibleAt(target.x,target.y)?target:null;}
function paintGroundMaterial(d,focused){
 let m=MATERIALS[d.material.id];if(!m)return;let q=project(d.x,d.y);if(q.x<-40||q.x>W+40||q.y<-40||q.y>H+40)return;
 ctx.save();ctx.translate(q.x,q.y-8);ctx.fillStyle='#0a121ce8';ctx.strokeStyle=focused?'#f4f7d8':m.color;ctx.lineWidth=focused?2.5:1;ctx.fillRect(-13,-18,26,26);ctx.strokeRect(-13,-18,26,26);
 let paths=groundMaterialPaths(d.material.id);ctx.save();ctx.translate(-11,-16);ctx.scale(22/60,22/60);ctx.fillStyle=m.color;ctx.strokeStyle=m.color;ctx.lineWidth=2;
 if(typeof paintGeneratedGroundMaterial==='function'&&paintGeneratedGroundMaterial(d.material.id)){}else if(paths?.length){paths.forEach((path,i)=>{ctx.globalAlpha=i===0?.22:i===1?.6:1;ctx.fill(path);ctx.globalAlpha=1;ctx.stroke(path);});}else{ctx.beginPath();ctx.moveTo(30,4);ctx.lineTo(53,30);ctx.lineTo(30,56);ctx.lineTo(7,30);ctx.closePath();ctx.stroke();}ctx.restore();
 ctx.font='bold 12px sans-serif';ctx.textAlign='center';ctx.lineWidth=3;ctx.strokeStyle='#0a1019';ctx.fillStyle='#fff1da';let count='×'+d.material.count;ctx.strokeText(count,0,21);ctx.fillText(count,0,21);
 if(focused){ctx.fillStyle='#f4f7d8';ctx.beginPath();ctx.moveTo(-5,-24);ctx.lineTo(5,-24);ctx.lineTo(0,-19);ctx.closePath();ctx.fill();}ctx.restore();
}
function groundDropNameBounds(d){let m=MATERIALS[d.material.id],q=project(d.x,d.y),label=m.name+' ×'+d.material.count;ctx.save();ctx.font='13px sans-serif';let width=Math.min(W-24,Math.max(100,(ctx.measureText(label)?.width||label.length*13)+20));ctx.restore();return{label,width,x:clamp(q.x-width/2,12,W-width-12),y:Math.max(12,q.y-65)};}
selectGroundDrop=(x,y,world)=>{
 let focused=groundDropFocus();if(focused){let b=groundDropNameBounds(focused);if(x>=b.x&&x<=b.x+b.width&&y>=b.y&&y<=b.y+25)return focused;}
 let best=null,nearest=Infinity;for(let d of drops){if(!d.material||!MATERIALS[d.material.id]||!visibleAt(d.x,d.y))continue;let q=project(d.x,d.y),distance=Math.hypot(x-q.x,y-(q.y-13));if(Math.abs(x-q.x)<=18&&y>=q.y-30&&y<=q.y+16&&distance<nearest){best=d;nearest=distance;}}
 if(best)return best;return drops.filter(d=>visibleAt(d.x,d.y)&&dist(d,world)<40).sort((a,b)=>dist(a,world)-dist(b,world))[0];
};
function paintGroundDropName(d){
 if(!MATERIALS[d.material.id])return;let {label,width,x,y}=groundDropNameBounds(d);ctx.save();ctx.font='13px sans-serif';
 ctx.fillStyle='#0b1423f5';ctx.strokeStyle='#f4f7d8';ctx.lineWidth=1.5;ctx.fillRect(x,y,width,25);ctx.strokeRect(x,y,width,25);ctx.fillStyle='#fff1da';ctx.textAlign='center';ctx.fillText(label,x+width/2,y+17,width-12);ctx.restore();
}
drawGroundDrops=()=>{
 let focused=groundDropFocus();for(let d of drops){if(!visibleAt(d.x,d.y))continue;if(d.material){paintGroundMaterial(d,d===focused);continue;}
  let q=project(d.x,d.y);ctx.save();circle(q.x,q.y,4,d.item.color==='gold'?'#e5ba58':'#7eabce');ctx.fillStyle='#080c0ee8';ctx.fillRect(q.x-59,q.y-24,118,17);ctx.fillStyle=d.item.color==='gold'?'#e5ba58':'#8cbce0';ctx.font='10px Georgia';ctx.textAlign='center';ctx.fillText(d.item.name,q.x,q.y-12);ctx.restore();
 }if(focused)paintGroundDropName(focused);
};
