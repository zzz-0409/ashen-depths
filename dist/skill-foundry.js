// Stable save IDs; ability behavior and native element are independent.
const SKILL_FORMS=[
 ['穿槍','shot',1,0,700,1.6],['散弾','shot',5,.18,470,.65],['全方位弾','radial',10,0,380,.5],['螺旋弾','spiral',8,.12,500,.65],
 ['遠隔爆破','blast',1,0,110,2.2],['衝撃環','nova',1,0,230,1.5],['外周輪','ring',1,0,290,2.2],['二重輪','ring',2,.5,210,1.4],
 ['貫通光線','beam',1,0,520,1.8],['十字光線','cross',1,0,370,1.4],['六芒光線','star',1,0,320,1.3],['三連光線','beam',3,.28,460,.85],
 ['流星雨','rain',5,.25,95,.8],['持続結界','field',6,.5,145,.5],['連続地割れ','trail',5,.18,65,.9],['三連地雷','mines',3,.45,100,1.05],
 ['連鎖撃','chain',6,0,440,.8],['双叉連鎖','fork',4,0,300,1],['雷鳴連鎖','chain',3,.4,500,.7],['追尾連撃','seek',4,.25,450,.7],
 ['広域薙ぎ','sweep',1,0,220,1.8],['貫き突き','thrust',1,0,320,2],['回転斬り','spin',3,.2,155,.9],['二段斬り','sweep',2,.35,180,1.25]
].map(([name,shape,count,interval,range,power],i)=>({name,shape,count,interval,range,power,index:i}));
const SKILL_TRAITS=[
 {name:'純撃',desc:'基礎威力。追加の代償なし',cost:0},
 {name:'時限',desc:'命中地点が0.8秒後に爆発。半径90へ40%追撃（1回の発動で最大3地点）',cost:6},
 {name:'収束',desc:'命中した敵を発動地点へ65吸引。ボスは移動量20%',cost:4},
 {name:'撃退',desc:'命中した敵を発動地点から90吹き飛ばす。ボスは移動量20%',cost:4},
 {name:'命脈',desc:'命中でライフ4回復。1回の発動で最大12回復',cost:5},
 {name:'処刑',desc:'残りライフ35%以下の敵への直撃威力が1.8倍',cost:5},
 {name:'足枷',desc:'命中した敵を2秒減速させる',cost:4},
 {name:'破鎧',desc:'命中した敵の被ダメージを4秒間15%増やす',cost:6}
];
for(let form of SKILL_FORMS)for(let [variant,trait]of SKILL_TRAITS.entries()){
 let element=(form.index*3+variant*5)%ELEMENTS.length,el=ELEMENTS[element];
 let id='crafted_'+form.index+'_'+variant,projectile=['shot','radial','spiral'].includes(form.shape),attack=form.index>=20;
 GEM[id]={name:trait.name+'・'+form.name,color:['R','B','B','B','G','R','G','B'][element],kind:'active',tags:[attack?'attack':'spell',projectile?'projectile':form.index>=16&&form.index<20?'chain':'area'],cost:12+Math.floor(form.index/4)*3+trait.cost,cool:.7+Math.min(3,form.count*.2+form.interval*form.count),recipe:form.index,ability:variant,desc:form.name+' · '+(form.shape==='fork'?'各命中から最大2方向へ分岐・合計最大'+form.count+'体':form.shape==='chain'?(form.interval?form.count+'回・間隔'+form.interval+'秒 / ':'')+'1回につき最大'+form.count+'体へ連鎖':projectile?(form.shape==='spiral'?form.count+'回連射':form.count+'発'):form.count+'段')+' · '+(projectile?'弾速 ':['chain','fork','seek'].includes(form.shape)?'初撃射程 ':'距離/範囲 ')+form.range+'。'+trait.desc+'。通常製作：'+el.name+'属性'};
 SKILL_ELEMENTS[id]=element;ICONS[id]=[0,1,2,1,10,11,4,5][element];
}
const CRAFTABLE_ACTIVE_SKILLS=Object.keys(GEM).filter(id=>GEM[id].kind==='active');
function craftedSkillIcon(type){
 let d=GEM[type],f=SKILL_FORMS[d.recipe],el=ELEMENTS[SKILL_ELEMENTS[type]],paths=[
 'M12 40L41 11M28 12L42 10L40 24','M10 40L40 10M10 40L44 28M10 40L25 8',
 'M26 7V45M7 26H45M12 12L40 40M12 40L40 12','M26 26Q12 14 14 30Q20 48 38 33Q48 12 24 8',
 'M26 7L30 19L44 15L35 27L43 41L28 35L15 44L18 30L7 20L21 19Z','M8 30Q26 0 44 30M13 35Q26 10 39 35M19 40Q26 24 33 40',
 'M8 26A18 18 0 1 0 44 26A18 18 0 1 0 8 26','M8 26A18 18 0 1 0 44 26A18 18 0 1 0 8 26M17 26A9 9 0 1 0 35 26A9 9 0 1 0 17 26',
 'M10 43L43 10M7 35L35 7','M7 26H45M26 7V45','M7 26H45M16 9L36 43M16 43L36 9','M7 40L40 7M13 45L45 13M5 30L30 5',
 'M14 8L8 27M28 10L22 34M42 16L36 43','M9 37L26 11L43 37ZM9 37H43M17 23H35',
 'M8 42L17 30L15 22L29 24L25 12L42 8','M8 37L15 25L22 37ZM24 23L31 11L38 23ZM32 43L39 31L46 43Z',
 'M8 37L19 14L30 36L44 9','M8 40L25 23L16 8M25 23L44 10','M8 33L19 10L30 32L44 7M10 44H42',
 'M9 38Q40 46 40 19M32 22L40 12L46 22','M9 39Q8 9 43 11L26 27Z','M7 44L40 11L44 7L41 21M9 34L19 44',
 'M9 30A18 18 0 1 1 30 44L36 36M30 44L20 37','M8 31Q20 8 43 12M12 43Q23 21 46 25'];
 return '<svg class="skill-ability-icon" viewBox="0 0 64 64" aria-hidden="true" style="color:'+el.color+'"><path d="'+paths[f.index]+'" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/><circle cx="51" cy="50" r="11" fill="#101b22" stroke="#d7c38b"/><text x="51" y="54" text-anchor="middle" fill="#f4dba4" font-size="12">'+['◆','◷','↓','↑','♥','斬','鎖','砕'][d.ability]+'</text></svg>';
}
const foundryGemIcon=gemIcon;gemIcon=type=>GEM[type]?.recipe!==undefined?craftedSkillIcon(type):foundryGemIcon(type)||'◆';
const foundrySaveGem=saveGem;saveGem=gem=>{
 let out=foundrySaveGem(gem);if(gem.forged!==undefined){if(GEM[gem.type].kind!=='active'||!gem.forged||!Array.isArray(gem.forged.elements)||gem.forged.elements.length<1||gem.forged.elements.length>2||new Set(gem.forged.elements).size!==gem.forged.elements.length||gem.forged.elements.some(i=>!Number.isInteger(i)||!ELEMENTS[i]))throw Error('製作ジェムの属性が不正です');out.forged={elements:[...gem.forged.elements],power:saveNumber(gem.forged.power,'ジェム威力',100,160),tempo:saveNumber(gem.forged.tempo,'ジェムクールダウン',85,115)};}return out;
};
const foundrySkillBuild=skillBuild;skillBuild=type=>{
 let b=foundrySkillBuild(type);if(!b||!b.gem.forged)return b;let f=b.gem.forged,oldCount=b.elements.length,els=[...f.elements],convert=b.supports.find(id=>GEM[id]?.mode==='convert');if(convert)els[0]=GEM[convert].element;
 els=[...new Set(els)];for(let id of b.supports){let s=GEM[id];if(s?.mode==='add'&&!els.includes(s.element)&&els.length<3)els.push(s.element);}b.elements=els;b.mult=b.mult/(1+.2*Math.max(0,oldCount-1))*(1+.2*Math.max(0,els.length-1))*f.power/100;b.cool*=f.tempo/100;return b;
};
let craftedSkillWaves=[],craftedDetonations=[];
// Share finite proc budgets across every projectile and wave of one cast.
function craftedDirectDamage(e,d,b){return GEM[b.type]?.ability===5&&e.hp/e.max<=.35?d*1.8:d;}
function craftedOnImpact(e,d,b){
 let mode=GEM[b.type]?.ability,cast=b.craftedCast;if(!cast)return;
 if(mode===1&&cast.detonations<3){cast.detonations++;craftedDetonations.push({x:e.x,y:e.y,wait:.8,damage:d*.4,color:ELEMENTS[b.elements[0]].color});}
 if(mode===4&&cast.healing<12){let amount=Math.min(4,12-cast.healing);p.hp=Math.min(maxhp(),p.hp+amount);cast.healing+=amount;}
 if(e.hp<=0)return;
 if(mode===2||mode===3){let dx=e.x-cast.origin.x,dy=e.y-cast.origin.y,len=Math.hypot(dx,dy),step=(mode===2?-Math.min(65,Math.max(0,len-25)):90)*(e.boss?.2:1);if(len>0)moveActor(e,dx/len*step,dy/len*step,12);}
 if(mode===6)e.slow=Math.max(e.slow||0,2);
 if(mode===7){e.reactionVuln=Math.max(e.reactionVuln||0,15);e.reactionVulnTime=Math.max(e.reactionVulnTime||0,4);}
}
const craftedBaseSpellHit=spellHit;spellHit=(e,d,b)=>{if(e.hp<=0)return;craftedBaseSpellHit(e,craftedDirectDamage(e,d,b),b);craftedOnImpact(e,d,b);};
function craftedProjectileHit(e,s){let b=s.craftedBuild;if(!b){hit(e,s.damage);return;}hit(e,craftedDirectDamage(e,s.damage,b));craftedOnImpact(e,s.damage,b);}
function advanceCraftedDetonations(dt){let pending=craftedDetonations;craftedDetonations=[];for(let blast of pending){blast.wait-=dt;if(blast.wait>0){craftedDetonations.push(blast);continue;}burst(blast.x,blast.y,90,blast.color);for(let e of enemies)if(e.hp>0&&dist(blast,e)<=90&&lineClear(blast,e))hit(e,blast.damage);}}

function castCraftedSkill(build,damageValue,angle){
 build={...build,craftedCast:{origin:{x:p.x,y:p.y},healing:0,detonations:0}};
 let form=SKILL_FORMS[GEM[build.type].recipe],origin={x:p.x,y:p.y},distance=Math.min(400,Math.hypot(mouse.x-W/2,mouse.y-H/2)),target={x:p.x+Math.cos(angle)*distance,y:p.y+Math.sin(angle)*distance};
 let delayed=['spiral','ring','beam','rain','field','trail','mines','chain','seek','spin','sweep'].includes(form.shape)&&form.interval>0,count=delayed?form.count:1;
 for(let i=0;i<count;i++){let wave={form,build,damage:damageValue*form.power,angle,origin,target,index:i,wait:i*form.interval};if(!wave.wait)resolveCraftedWave(wave);else craftedSkillWaves.push(wave);}
 playSound(form.index>=20?'slash':SKILL_ELEMENTS[build.type]===2?'arc':'fire',p.x,p.y);
}
function craftedChainEdges(origin,aim,pool,range,limit,fork=false){
 let live=pool.filter(e=>e.hp>0),first=live.filter(e=>dist(origin,e)<=range&&lineClear(origin,e)).sort((a,b)=>dist(a,aim)-dist(b,aim)||dist(a,origin)-dist(b,origin))[0];if(!first||limit<1)return [];
 let edges=[{from:origin,to:first}],seen=new Set([first]),queue=[first];
 while(edges.length<limit&&queue.length){let from=queue.shift(),next=live.filter(e=>!seen.has(e)&&dist(from,e)<=range/2&&lineClear(from,e)).sort((a,b)=>dist(a,from)-dist(b,from)).slice(0,fork?2:1);for(let to of next){if(edges.length>=limit)break;seen.add(to);edges.push({from,to});queue.push(to);}}
 return edges;
}
function resolveCraftedWave(w){
 let {form:f,build:b,origin:o,target:t,angle:a,index:i}=w,color=ELEMENTS[b.elements[0]].color,r=f.range*b.radius,damageValue=w.damage;
 if(['shot','radial','spiral'].includes(f.shape)){
  let count=f.shape==='spiral'?1:f.count;if(b.supports.includes('multi'))count+=2;
  for(let n=0;n<count;n++){let angle=f.shape==='radial'?a+n*Math.PI*2/count:f.shape==='spiral'?a+i*.6+(n-(count-1)/2)*.15:a+(n-(count-1)/2)*Math.max(.15,f.interval);
   shots.push({x:o.x,y:o.y,vx:Math.cos(angle)*f.range,vy:Math.sin(angle)*f.range,life:1.4,damage:damageValue,skill:b.type,elements:b.elements,craftedBuild:b,enemy:false,tint:color,leech:b.supports.includes('leech')});}emit(o.x,o.y,12,color);return;
 }
 let center=['blast','rain','field','mines'].includes(f.shape)?{...t}:{...o};
 if(f.shape==='rain'){center.x+=Math.cos(i*2.4)*i*25;center.y+=Math.sin(i*2.4)*i*25;}
 if(f.shape==='mines'){center.x+=Math.cos(a+Math.PI/2)*(i-1)*140;center.y+=Math.sin(a+Math.PI/2)*(i-1)*140;}
 if(f.shape==='trail')center={x:o.x+Math.cos(a)*(i+1)*95,y:o.y+Math.sin(a)*(i+1)*95};
 let live=enemies.filter(e=>e.hp>0&&lineClear(o,e));
 if(['chain','fork','seek'].includes(f.shape)){let edges=f.shape==='seek'?live.filter(e=>dist(o,e)<=r).sort((a,b)=>dist(a,t)-dist(b,t)).slice(0,1).map(to=>({from:o,to})):craftedChainEdges(o,t,enemies,r,f.count,f.shape==='fork');for(let {from,to}of edges){zonesFx.push({kind:'bolt',x:from.x,y:from.y,tx:to.x,ty:to.y,life:.3,max:.3});spellHit(to,damageValue,b);}return;}
 for(let e of live){let dx=e.x-center.x,dy=e.y-center.y,d=Math.hypot(dx,dy),angle=Math.atan2(dy,dx)-a,localX=dx*Math.cos(a)+dy*Math.sin(a),localY=-dx*Math.sin(a)+dy*Math.cos(a),inside=d<=r;
  if(f.shape==='ring')inside=d<=r&&d>=r*.6;
  if(f.shape==='sweep')inside=d<=r&&Math.cos(angle)>.15;
  if(f.shape==='thrust')inside=localX>=0&&localX<=r&&Math.abs(localY)<=35*b.radius;
  if(['beam','cross','star'].includes(f.shape)){let axes=f.shape==='beam'?1:f.shape==='cross'?2:3;inside=false;for(let n=0;n<axes;n++){let axis=a+n*Math.PI/axes,x=dx*Math.cos(axis)+dy*Math.sin(axis),y=-dx*Math.sin(axis)+dy*Math.cos(axis);if(Math.abs(x)<=r&&Math.abs(y)<=25*b.radius&&(f.shape!=='beam'||x>=0))inside=true;}}
  if(inside&&lineClear(center,e))spellHit(e,damageValue,b);
 }
 burst(center.x,center.y,Math.min(r,280),color);emit(center.x,center.y,18,color);
 if(['beam','cross','star','thrust'].includes(f.shape)){let axes=f.shape==='cross'?2:f.shape==='star'?3:1;for(let n=0;n<axes;n++){let axis=a+n*Math.PI/axes,back=axes>1?r:0;zonesFx.push({kind:'bolt',x:o.x-Math.cos(axis)*back,y:o.y-Math.sin(axis)*back,tx:o.x+Math.cos(axis)*r,ty:o.y+Math.sin(axis)*r,life:.3,max:.3});}}
}
function advanceCraftedWaves(dt){let pending=craftedSkillWaves;craftedSkillWaves=[];for(let wave of pending){wave.wait-=dt;if(wave.wait<=0)resolveCraftedWave(wave);else craftedSkillWaves.push(wave);}}
const foundryUpdate=update;update=dt=>{let running=started&&!paused&&!dead;foundryUpdate(dt);if(!running||paused||dead)return;advanceCraftedDetonations(dt);advanceCraftedWaves(dt);};
const foundryLoadWorld=loadWorld;loadWorld=(...args)=>{craftedSkillWaves=[];craftedDetonations=[];return foundryLoadWorld(...args)};
function skillRecipe(type){let index=CRAFTABLE_ACTIVE_SKILLS.indexOf(type),form=GEM[type]?.recipe,region=form===undefined?0:Math.min(9,Math.floor(form/3)),element=SKILL_ELEMENTS[type]??0;return{region,cost:{['r'+region+'e'+element+':0']:form===undefined?5:5+Math.floor(form/4)}};}
function randomForgedGem(random=Math.random){let type=CRAFTABLE_ACTIVE_SKILLS[Math.min(CRAFTABLE_ACTIVE_SKILLS.length-1,Math.floor(random()*CRAFTABLE_ACTIVE_SKILLS.length))],pool=ELEMENTS.map((_,i)=>i),elements=[pool.splice(Math.min(7,Math.floor(random()*8)),1)[0]];if(random()<.5)elements.push(pool.splice(Math.min(6,Math.floor(random()*7)),1)[0]);return{type,level:1,xp:0,forged:{elements,power:100,tempo:100}};}
let foundrySelection='fire',foundryElement='all',foundryPage=0,foundryLastGem=null;
function craftSkillGem(type,randomMode=false){
 if(!villageOpen||!GEM[type]||p.gems.length>=20000)return false;let recipe=skillRecipe(type),cost=randomMode?{'ex100skill:0':50}:recipe.cost,c=campaign();if(randomMode?c.rank<100:recipe.region>c.unlocked)return false;
 if(Object.entries(cost).some(([id,n])=>(c.materials[id]||0)<n)){say('素材が足りません');return false;}
 let gem=randomMode?randomForgedGem():{type,level:1,xp:0};if(!worldTransaction(()=>{for(let [id,n]of Object.entries(cost))c.materials[id]-=n;p.gems.push(gem)}))return false;
 foundryLastGem=gem;showSkillFoundry();let result=$('card').querySelector('.forge-result button');if(result)menuFocusElement(result);say(gemDisplayName(gem)+'を製作しました');return true;
}
function showSkillFoundry(){
 if(!villageOpen){say('スキル製作は村で行えます');return false;}let priorLabel=menuSurface==='skillForge'?document.activeElement?.getAttribute?.('aria-label'):null;let c=campaign(),types=Object.keys(GEM).filter(id=>foundryElement==='support'?GEM[id].kind==='support':GEM[id].kind==='active'&&(foundryElement==='all'||SKILL_ELEMENTS[id]===+foundryElement));
 foundryPage=clamp(foundryPage,0,Math.max(0,Math.ceil(types.length/16)-1));let page=types.slice(foundryPage*16,foundryPage*16+16);if(!page.includes(foundrySelection))foundrySelection=page[0];
 let type=foundrySelection,def=GEM[type],recipe=skillRecipe(type),ready=c.unlocked>=recipe.region&&Object.entries(recipe.cost).every(([id,n])=>(c.materials[id]||0)>=n),entries=page.map(id=>({key:id,label:GEM[id].name,icon:gemIcon(id),nodes:[]}));
 worldMenu('スキル工房 · 200スキル','<div class="world-tabs"><button onclick="showVillage()">村の依頼</button><button onclick="panel(\'gems\')">ジェムを装着</button><button onclick="showMaterials()">素材一覧</button></div><label>分類<select aria-label="製作スキルの属性" onchange="foundryElement=this.value;foundryPage=0;showSkillFoundry()"><option value="all">全属性</option>'+ELEMENTS.map((el,i)=>'<option value="'+i+'" '+(foundryElement===String(i)?'selected':'')+'>'+el.name+'</option>').join('')+'<option value="support" '+(foundryElement==='support'?'selected':'')+'>サポート</option></select></label><div class="foundry-pages"><button onclick="foundryPage--;showSkillFoundry()" '+(!foundryPage?'disabled':'')+'>前の16件</button><span>'+(foundryPage+1)+' / '+Math.ceil(types.length/16)+'</span><button onclick="foundryPage++;showSkillFoundry()" '+((foundryPage+1)*16>=types.length?'disabled':'')+'>次の16件</button></div><div id="foundryGrid">'+page.map(id=>'<button data-foundry="'+id+'" aria-label="'+GEM[id].name+'" onclick="selectFoundrySkill(\''+id+'\',true)" onfocus="selectFoundrySkill(\''+id+'\',false)">'+gemIcon(id)+'<small>'+GEM[id].name+'</small></button>').join('')+'</div><section id="foundryDetail" tabindex="-1"></section>','skillForge');
 let body=$('card').querySelector('.panel-body'),grid=$('foundryGrid'),detail=$('foundryDetail'),split=document.createElement('div');split.className='foundry-layout';grid.before(split);split.append(grid,detail);selectFoundrySkill(type,false);menuFocusElement(priorLabel==='製作スキルの属性'?body.querySelector('select'):grid.querySelector('[data-foundry="'+type+'"]')||grid.querySelector('button'));
}
function selectFoundrySkill(type,enter){
 if(!GEM[type])return;foundrySelection=type;let def=GEM[type],recipe=skillRecipe(type),c=campaign(),ready=c.unlocked>=recipe.region&&Object.entries(recipe.cost).every(([id,n])=>(c.materials[id]||0)>=n),detail=$('foundryDetail');if(!detail)return;
 detail.innerHTML='<h3>'+def.name+'</h3><p>'+def.desc+'</p><p>解放：'+REGIONS[recipe.region].name+' · 所持 '+p.gems.filter(g=>g.type===type).length+'個</p>'+Object.entries(recipe.cost).map(([id,n])=>materialTile(id,n)).join('')+'<button onclick="craftSkillGem(\''+type+'\')" '+(!ready?'disabled':'')+'>このジェムを製作</button>'+(c.rank>=100?'<h3>星紡ぎのランダム製作</h3>'+materialTile('ex100skill:0',50)+'<p>200種の能力から抽選・全8属性から1〜2属性。元の能力・威力・クールダウンを保持する特別版。</p><button onclick="craftSkillGem(\''+type+'\',true)" '+((c.materials['ex100skill:0']||0)<50?'disabled':'')+'>ランダムジェムを製作</button>':'')+(foundryLastGem?'<div class="forge-result"><strong>製作結果：'+gemDisplayName(foundryLastGem)+'</strong>'+forgedGemInfo(foundryLastGem)+'<button onclick="panel(\'gems\')">ジェムを装着する</button></div>':'');
 if(enter)menuFocusElement(detail.querySelector('button:not(:disabled)')||detail);
}
function forgedGemInfo(g){return g.forged?elementBadges(g.forged.elements)+'<span>威力 '+g.forged.power+'% · クールダウン '+g.forged.tempo+'%</span>':'';}
grantElementGems=()=>showSkillFoundry();
const foundryPanel=panel;panel=kind=>{foundryPanel(kind);if(kind==='gems'&&!tutorialGuideOpen){let button=$('card').querySelector('[onclick="grantElementGems()"]');if(button){button.textContent='素材でスキルを製作';button.setAttribute('onclick','showSkillFoundry()');}for(let pane of $('card').querySelectorAll('.icon-pane')){let index=Number(pane.dataset.iconKey?.split(':')[1]);if(pane.dataset.iconKey?.startsWith('gem:')&&p.gems[index]?.forged)pane.insertAdjacentHTML('afterbegin',forgedGemInfo(p.gems[index]));}}};
const foundryVillage=showVillage;showVillage=(...args)=>{foundryVillage(...args);let nav=$('card').querySelector('.world-tabs');if(nav)nav.insertAdjacentHTML('beforeend','<button onclick="showSkillFoundry()">スキル工房</button><button onclick="showMaterials()">素材一覧</button>');};

const foundrySocketHtml=socketEffectHtml;socketEffectHtml=slot=>foundrySocketHtml(slot).replace(/(<p hidden data-effect-index="(\d+)">)/g,(match,tag,index)=>tag+(p[slot]?.sockets[index]?.gem?.forged?forgedGemInfo(p[slot].sockets[index].gem):''));

