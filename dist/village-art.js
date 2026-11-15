const villageSheet=new Image();villageSheet.src='assets/village-props.png';
const VILLAGE_PROPS=[
 {x:0,y:-130,tile:0,size:230},
 {x:-170,y:80,tile:1,size:210},
 {x:230,y:-60,tile:2,size:210},
 {x:-280,y:-120,tile:3,size:100},
 {x:-260,y:150,tile:4,size:75},
 {x:100,y:160,tile:5,size:80},
 {x:-120,y:-190,tile:5,size:75}
];
function drawVillageProp(prop){
 if(!villageSheet.complete||!villageSheet.naturalWidth)return;
 let s=project(prop.x,prop.y),cw=villageSheet.naturalWidth/3,ch=villageSheet.naturalHeight/2,height=prop.size*ch/cw;
 ctx.save();
 // Fade only when a building would conceal the player standing behind it.
 let hero=project(p.x,p.y);if(prop.size>150&&p.x+p.y<prop.x+prop.y&&Math.abs(hero.x-s.x)<prop.size*.45&&hero.y>s.y-height&&hero.y<s.y)ctx.globalAlpha=.42;
 ctx.drawImage(villageSheet,(prop.tile%3)*cw,Math.floor(prop.tile/3)*ch,cw,ch,s.x-prop.size/2,s.y-height*.97,prop.size,height);ctx.restore();
}
function addVillageActors(actors){
 if(!p?.campaign||!villageOpen)return;
 for(let prop of VILLAGE_PROPS)actors.push({depth:prop.x+prop.y,draw:()=>drawVillageProp(prop)});
}
function drawVillageServices(){
 for(let [x,y,name,color,range]of [[-170,80,'素材工房','#e7ad6b',120],[0,-130,'冒険者ギルド','#b7dfb7',120],[230,0,'DPS訓練','#e8c985',105]]){
  let near=dist(p,{x,y})<range,s=project(x,y);groundRing(x,y,near?65:58,color,near?2:1);
  ctx.font='bold 12px sans-serif';ctx.textAlign='center';let text=(near?'F / A · ':'')+name,width=ctx.measureText(text).width+18;
  ctx.fillStyle='#081116dd';ctx.fillRect(s.x-width/2,s.y+15,width,23);ctx.fillStyle=color;ctx.fillText(text,s.x,s.y+31);
 }
}
