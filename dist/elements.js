// Original eight-element system. Socket colours remain equipment constraints.
const ELEMENTS=[
 {id:'fire',name:'炎',icon:'▲',color:'#ff8b52'}, {id:'ice',name:'氷',icon:'❄',color:'#8ce5ff'},
 {id:'lightning',name:'雷',icon:'ϟ',color:'#ffe478'}, {id:'water',name:'水',icon:'●',color:'#549eff'},
 {id:'wind',name:'風',icon:'≋',color:'#a5f0cc'}, {id:'earth',name:'岩',icon:'◆',color:'#d5af7b'},
 {id:'poison',name:'毒',icon:'✦',color:'#a4dc65'}, {id:'dark',name:'闇',icon:'◐',color:'#c497fa'}
];
const SKILL_ELEMENTS={fire:0,frost:1,arc:2,water:3,wind:4,cleave:5,arrow:6,vortex:7};
GEM.water={name:'水槍',color:'B',kind:'active',tags:['spell','projectile'],desc:'水の槍を放ち、水を付着させる',cost:13,cool:.65};
GEM.wind={name:'風輪',color:'G',kind:'active',tags:['spell','area'],desc:'周囲へ風を放ち、風を付着させる',cost:18,cool:1.6};
for(let [index,element] of ELEMENTS.entries())for(let mode of ['convert','add'])GEM[mode+index]={name:element.name+(mode==='convert'?'属性変換':'属性付加'),color:['R','B','B','B','G','R','G','B'][index],kind:'support',tags:['spell','attack'],element:index,mode,desc:mode==='convert'?'主属性を'+element.name+'に変更。同時に複数ある場合は左の穴を優先。マナ×1.2':element.name+'を追加。異なる付加属性ごとに威力20%増。最大3属性。マナ×1.2'};
if(typeof ICONS!=='undefined'){ICONS.water=1;ICONS.wind=5;for(let i=0;i<8;i++){ICONS['convert'+i]=[0,1,2,1,10,11,4,5][i];ICONS['add'+i]=ICONS['convert'+i]}}
// Each line explicitly authors one unordered recipe: damage, radius, periodic damage,
// duration, slow, stun, pull distance, chain targets, vulnerability %, life and mana.
const REACTION_SPEC=`
01|融解|2.1,90,0,0,0,0,0,0,0,0,0
02|過負荷|1.2,70,0,0,0,.4,0,3,0,0,0
03|蒸気爆発|1.6,155,0,0,1.4,0,0,0,0,0,0
04|火炎旋風|.7,145,.22,3,0,0,35,0,0,0,0
05|溶岩噴出|1.1,110,.35,3.5,1,0,0,0,0,0,0
06|毒炎|.6,95,.48,4,0,0,0,0,0,0,0
07|魂焼き|1.5,65,.15,3,0,0,0,0,0,7,0
12|超伝導|1.1,95,0,0,2,0,0,2,18,0,0
13|氷結|.8,105,0,0,3,1.1,0,0,0,0,0
14|吹雪|.6,175,.18,3,3,0,25,0,0,0,0
15|氷砕|2.3,70,0,0,0,.6,0,0,0,0,0
16|凍毒|.4,80,.3,5,4,0,0,0,0,0,0
17|静寂|1.0,120,0,0,2.5,.5,0,0,0,0,9
23|感電網|.8,110,0,0,0,.35,0,5,0,0,0
24|雷嵐|.95,150,0,0,0,0,45,4,0,0,0
25|磁砕|1.4,95,0,0,0,.3,55,0,20,0,0
26|神経毒|.5,70,.25,4,2,.4,0,2,0,0,0
27|虚雷|1.3,85,0,0,0,0,0,3,0,0,12
34|奔流|1.2,160,0,0,1.5,0,65,0,0,0,0
35|泥沼|.4,125,.15,4,4,0,0,0,15,0,0
36|腐水|.5,150,.32,4,0,0,0,0,12,0,0
37|冥泉|.75,100,.18,4,0,0,0,0,0,8,8
45|砂塵|.8,180,0,0,2,0,40,0,12,0,0
46|毒霧|.4,195,.24,4.5,1,0,0,0,0,0,0
47|虚空吸引|.9,155,0,0,1,.3,100,0,0,0,0
56|腐食|.6,90,.2,5,0,0,0,0,25,0,0
57|墓標|1.8,85,0,0,1.5,.8,0,0,0,5,0
67|衰滅|.3,115,.45,5,0,0,0,0,15,0,0
012|白熱雷砕|2.8,125,0,0,1,.6,0,4,20,0,0
013|熱衝撃|3.2,150,0,0,2,.8,0,0,0,0,0
014|極光火嵐|1.4,215,.28,4,3,0,50,0,0,0,0
015|黒曜破砕|3.8,100,0,0,0,1,0,0,20,0,0
016|凍炎瘴気|.9,145,.65,5,4,0,0,0,0,0,0
017|霜魂の灯|2.2,135,.2,4,3,.4,0,0,0,12,0
023|蒸雷轟爆|2.0,185,0,0,1,.5,0,6,0,0,0
024|紅蓮雷旋|1.6,195,.2,3,0,0,70,5,0,0,0
025|熔鉄雷震|3.1,130,0,0,0,.9,45,3,25,0,0
026|毒雷点火|1.3,125,.55,4,0,.4,0,4,0,0,0
027|魂喰い雷火|2.0,110,.2,3,0,0,0,4,0,10,14
034|灼熱蒸気流|1.7,230,.25,3.5,2,0,60,0,0,0,0
035|間欠泉|3.0,165,.25,3,1,.7,0,0,0,0,0
036|沸毒|1.2,180,.7,4,0,0,0,0,15,0,0
037|冥府の湯|1.6,145,.3,4,0,0,0,0,0,16,12
045|火山旋塵|2.1,205,.3,4,1,0,55,0,15,0,0
046|猛毒火旋|.9,240,.6,4.5,0,0,45,0,0,0,0
047|黒炎竜巻|1.8,190,.35,4,0,.4,110,0,0,7,0
056|溶毒侵食|1.5,155,.55,5,0,0,0,0,30,0,0
057|冥火の墓|3.2,120,.2,3,0,1,0,0,0,12,0
067|魂毒燃焼|1.0,150,.8,5,0,0,0,0,20,10,0
123|氷雷牢|1.5,155,0,0,4,1.3,0,5,0,0,0
124|極雷吹雪|1.2,230,.2,4,4,0,40,5,0,0,0
125|磁氷粉砕|3.4,115,0,0,2,.8,65,2,25,0,0
126|凍結神経毒|.8,120,.5,5,5,.8,0,3,0,0,0
127|零度虚雷|2.0,145,0,0,3,.6,0,4,0,0,18
134|氷河奔流|1.8,210,.15,3,5,1,80,0,0,0,0
135|永久凍土|1.6,180,.25,5,5,1.2,0,0,15,0,0
136|氷毒湖|.6,200,.6,5.5,5,.5,0,0,0,0,0
137|冥氷泉|1.2,175,.2,4,4,.7,0,0,0,12,14
145|氷砂嵐|2.2,225,0,0,4,.5,55,0,20,0,0
146|凍瘴旋風|.7,255,.45,5,5,0,65,0,0,0,0
147|零度崩落|2.0,200,0,0,4,1,120,0,0,0,8
156|凍蝕結晶|2.4,140,.3,5,3,.7,0,0,32,0,0
157|氷葬|3.5,135,0,0,3,1.4,0,0,0,10,0
167|冥毒凍獄|.9,170,.7,5.5,5,.5,0,0,15,8,0
234|天雷渦潮|1.7,220,0,0,2,.4,85,7,0,0,0
235|導電泥獄|1.4,180,.2,4,4,.7,0,5,20,0,0
236|腐電流|1.1,195,.55,4.5,1,.3,0,6,15,0,0
237|魂導電|1.8,165,0,0,0,.5,0,6,0,14,18
245|磁界嵐|2.0,215,0,0,1,.6,100,5,25,0,0
246|毒雷台風|.9,250,.4,4,2,0,55,6,0,0,0
247|虚空雷眼|2.2,205,0,0,0,.5,125,6,0,0,16
256|電蝕崩壊|2.3,150,.35,5,0,.5,0,4,35,0,0
257|冥雷墓震|3.0,145,0,0,1,1.1,45,4,0,10,10
267|死電瘴気|1.1,175,.65,5,0,.4,0,5,20,8,12
345|土石奔流|2.6,220,0,0,4,.6,95,0,20,0,0
346|腐潮旋風|.7,265,.5,5,3,0,80,0,15,0,0
347|深淵渦潮|1.5,225,.3,4,3,.4,135,0,0,12,12
356|腐敗湿原|.8,215,.6,6,5,0,0,0,35,0,0
357|黄泉の泥棺|2.2,190,.2,4,4,1,0,0,20,14,0
367|冥毒の泉|.6,205,.75,6,1,0,0,0,20,16,16
456|腐蝕砂嵐|1.2,270,.4,5,3,0,70,0,35,0,0
457|虚空砂葬|2.7,230,0,0,3,.9,140,0,25,8,0
467|死の旋霧|.8,280,.65,5.5,2,0,120,0,15,10,0
567|深淵腐葬|2.0,185,.6,6,2,1,0,0,40,15,0`;
const REACTION_FIELDS=['damage','radius','dot','duration','slow','stun','pull','chain','vuln','heal','mana'];
const REACTIONS=Object.fromEntries(REACTION_SPEC.trim().split('\n').map(line=>{let [key,name,values]=line.split('|');return[key,{key,name,elements:key.split('').map(Number),...Object.fromEntries(values.split(',').map((v,i)=>[REACTION_FIELDS[i],+v]))}]}));
function skillElements(type,supports=[]){let main=SKILL_ELEMENTS[type];if(main===undefined)return [];let convert=supports.find(t=>GEM[t]?.mode==='convert');if(convert)main=GEM[convert].element;let result=[main];for(let t of supports)if(GEM[t]?.mode==='add'&&!result.includes(GEM[t].element)&&result.length<3)result.push(GEM[t].element);return result}
const elementBuildBase=skillBuild;skillBuild=type=>{let b=elementBuildBase(type);if(!b)return b;b.elements=skillElements(type,b.supports);b.mult*=1+.2*Math.max(0,b.elements.length-1);return b};
function reactionDescription(r){let parts=[Math.round(r.damage*100)+'%追加ダメージ・半径'+r.radius];if(r.dot)parts.push('毎秒'+Math.round(r.dot*100)+'%を'+r.duration+'秒');if(r.slow)parts.push('減速'+r.slow+'秒');if(r.stun)parts.push('拘束'+r.stun+'秒（ボスは半分）');if(r.pull)parts.push('吸引'+r.pull);if(r.chain)parts.push('周辺'+r.chain+'体へ50%追撃');if(r.vuln)parts.push('被ダメージ+'+r.vuln+'%・4秒');if(r.heal)parts.push('ライフ+'+r.heal);if(r.mana)parts.push('マナ+'+r.mana);return parts.join(' / ')}
function applyElements(enemy,indices,power){if(enemy.hp<=0||enemy.reactionCooldown>0||!Number.isFinite(power)||power<=0)return null;let marks=enemy.elementMarks||(enemy.elementMarks={}),reaction=null;for(let index of [...new Set(indices)].slice(0,3)){if(!ELEMENTS[index])continue;let fresh=!marks[index];marks[index]=5;if(!fresh)continue;let keys=Object.keys(marks).filter(k=>marks[k]>0).sort();if(keys.length<2)continue;let key=keys.slice(-3).join('');reaction=REACTIONS[key];if(reaction){triggerReaction(enemy,reaction,power);if(keys.length>=3){enemy.reactionCooldown=.8;enemy.elementMarks={};marks=enemy.elementMarks}}if(enemy.hp<=0)break}return reaction}
function triggerReaction(origin,r,power){if(origin.hp<=0)return;origin.reactionFlash={indices:r.elements.slice(),life:.65};origin.reactionLabel={name:r.name,color:ELEMENTS[r.elements[r.elements.length-1]].color,life:1.2};let targets=enemies.filter(e=>e.hp>0&&dist(origin,e)<=r.radius&&lineClear(origin,e));if(!targets.includes(origin))targets.unshift(origin);let center={x:origin.x,y:origin.y};let color=ELEMENTS[r.elements[r.elements.length-1]].color;burst(center.x,center.y,r.radius,color);emit(center.x,center.y,r.elements.length===3?38:20,color);if(typeof playSound==='function')playSound(r.chain?'arc':r.dot?'fire':'frost',center.x,center.y);
 for(let e of targets){let previousDot=e.dotTick;e.dotTick=true;try{hit(e,power*r.damage)}finally{e.dotTick=previousDot}if(e.hp<=0)continue;if(r.slow)e.slow=Math.max(e.slow||0,r.slow);if(r.stun)e.reactionStun=Math.max(e.reactionStun||0,r.stun*(e.boss?.5:1));if(r.vuln){e.reactionVuln=Math.max(e.reactionVuln||0,r.vuln);e.reactionVulnTime=4}if(r.dot){e.reactionDots??=[];if(e.reactionDots.length>=3)e.reactionDots.shift();e.reactionDots.push({power:power*r.dot,time:r.duration,tick:0})}if(r.pull){let dx=center.x-e.x,dy=center.y-e.y,length=Math.hypot(dx,dy);if(length>1)moveActor(e,dx/length*Math.min(length,r.pull),dy/length*Math.min(length,r.pull),12)}}
 if(r.chain){let extra=enemies.filter(e=>e.hp>0&&e!==origin&&dist(center,e)<330&&lineClear(center,e)).sort((a,b)=>dist(center,a)-dist(center,b)).slice(0,r.chain);for(let e of extra){zonesFx.push({kind:'bolt',x:center.x,y:center.y,tx:e.x,ty:e.y,life:.3,max:.3});let previousDot=e.dotTick;e.dotTick=true;try{hit(e,power*.5)}finally{e.dotTick=previousDot}}}p.hp=Math.min(maxhp(),p.hp+r.heal);p.mp=Math.min(100,p.mp+r.mana)
}
const elementSpellHit=spellHit;spellHit=(e,d,b)=>{elementSpellHit(e,d,b);applyElements(e,b.elements||skillElements(b.type,b.supports),d)};
const elementProjectile=applyProjectileAilment;applyProjectileAilment=(e,s)=>{elementProjectile(e,s);if(!s.enemy)applyElements(e,s.elements||skillElements(s.skill),s.damage)};
const elementHitBase=hit;hit=(e,d)=>elementHitBase(e,d*(1+(e.reactionVulnTime>0?e.reactionVuln||0:0)/100));
const elementTickBase=tickAilments;tickAilments=(e,dt)=>{elementTickBase(e,dt);if(e.hp<=0||dt<=0)return;e.reactionCooldown=Math.max(0,(e.reactionCooldown||0)-dt);for(let key of Object.keys(e.elementMarks||{})){e.elementMarks[key]-=dt;if(e.elementMarks[key]<=0)delete e.elementMarks[key]}if(e.reactionFlash)e.reactionFlash.life-=dt;if(e.reactionLabel)e.reactionLabel.life-=dt;e.reactionStun=Math.max(0,(e.reactionStun||0)-dt);e.reactionVulnTime=Math.max(0,(e.reactionVulnTime||0)-dt);if(!e.reactionVulnTime)e.reactionVuln=0;for(let dot of e.reactionDots||[]){let step=Math.min(dt,dot.time);dot.time-=step;dot.tick+=step;while(dot.tick>=.5-1e-9&&e.hp>0){dot.tick-=.5;let previousDot=e.dotTick;e.dotTick=true;try{hit(e,dot.power*.5)}finally{e.dotTick=previousDot}}}e.reactionDots=(e.reactionDots||[]).filter(d=>d.time>1e-9)};
const elementAnimateBase=animateEnemy;animateEnemy=(e,dt)=>{if(e.reactionStun>0){e.anim+=dt;return}elementAnimateBase(e,dt)};
const elementStatusBase=drawAilmentStatus;drawAilmentStatus=(e,s,size)=>{let marks=Object.keys(e.elementMarks||{}).filter(k=>e.elementMarks[k]>0).map(Number),flash=e.reactionFlash?.life>0;if(!marks.length&&flash)marks=e.reactionFlash.indices;let y=s.y-size*.8+9;ctx.save();if(e.reactionLabel?.life>0){ctx.font='bold 12px sans-serif';ctx.textAlign='center';ctx.fillStyle=e.reactionLabel.color;ctx.fillText(e.reactionLabel.name,s.x,s.y-size*.8-38)}for(let [i,index] of marks.entries()){let el=ELEMENTS[index],x=s.x+(i-(marks.length-1)/2)*19;ctx.fillStyle='#081019';ctx.fillRect(x-8,y,16,18);ctx.strokeStyle=flash?'#fff8cc':el.color;ctx.lineWidth=flash?2:1;ctx.strokeRect(x-8,y,16,18);ctx.fillStyle=el.color;ctx.textAlign='center';ctx.font='bold 13px sans-serif';ctx.fillText(el.icon,x,y+13);ctx.fillRect(x-8,y+19,16*(e.elementMarks?.[index]||0)/5,2)}ctx.restore();if(e.poison?.length||e.slow>0)elementStatusBase(e,{x:s.x,y:s.y+(marks.length?26:0)},size)};
function elementBadges(indices){return indices.map(i=>'<span class="element-badge" style="--element:'+ELEMENTS[i].color+'" title="'+ELEMENTS[i].name+'">'+ELEMENTS[i].icon+' '+ELEMENTS[i].name+'</span>').join('')}
function grantElementGems(){let old=p.gems.slice(),all=[...p.gems,...GEAR_SLOTS.flatMap(slot=>(p[slot]?.sockets||[]).map(s=>s.gem).filter(Boolean)),...[...p.bag,...(p.stash||[])].flatMap(it=>(it.sockets||[]).map(s=>s.gem).filter(Boolean))],types=['water','wind',...Object.keys(GEM).filter(t=>GEM[t].mode)];for(let type of types)if(!all.some(g=>g.type===type))p.gems.push({type,level:1,xp:0});if(save()===false){p.gems=old;say('保存できなかったため受け取りを取り消しました');return}panel('gems');say('未所持の属性ジェムを受け取りました')}
function showReactionGuide(){paused=true;inventoryNav.open=false;menuSurface='reactions';$('modal').classList.remove('hidden');$('card').classList.add('wide');$('card').innerHTML='<button class="close" onclick="returnFromReactionGuide()">戻る</button><h2>元素反応</h2><p>異なる属性を5秒以内に重ねる。2属性で反応、3属性目で三重反応して付着を消費。順番は自由。同じ属性は時間を更新。三重反応後は0.8秒間、再付着しません。数値は命中ダメージ基準。</p><div class="reaction-picker">'+[0,1,2].map((n)=>'<select aria-label="属性 '+(n+1)+'" onchange="updateReactionGuide()">'+(n===2?'<option value="">なし</option>':'')+ELEMENTS.map((el,i)=>'<option value="'+i+'" '+(i===n&&n<2?'selected':'')+'>'+el.icon+' '+el.name+'</option>').join('')+'</select>').join('')+'</div><div id="reactionResult"></div><button onclick="toggleReactionTable(this)" aria-controls="reactionTable" aria-expanded="false">全84反応の表</button><div id="reactionTable" hidden>'+reactionTableHtml()+'</div>';frameMenu('reactions');updateReactionGuide();let hint=$('card').querySelector('.panel-controls');if(hint)hint.textContent='十字キー：選択　A：次の属性／決定　L/R：属性を前後　B：戻る　右スティック：スクロール';menuFocusElement($('card').querySelector('.reaction-picker select'))}
function updateReactionGuide(){let values=Array.from($('card').querySelectorAll('.reaction-picker select')).map(s=>s.value).filter(v=>v!=='');let key=[...new Set(values)].sort().join(''),r=REACTIONS[key];$('reactionResult').innerHTML=r?elementBadges(r.elements)+'<h3>'+r.name+'</h3><p>'+reactionDescription(r)+'</p>':'異なる属性を2〜3個選んでください。'}
function reactionTableHtml(){return '<table class="reaction-table"><thead><tr><th>属性</th><th>反応</th><th>効果</th></tr></thead><tbody>'+Object.values(REACTIONS).sort((a,b)=>a.key.length-b.key.length||a.key.localeCompare(b.key)).map(r=>'<tr><td>'+r.elements.map(i=>ELEMENTS[i].name).join('＋')+'</td><td>'+r.name+'</td><td>'+reactionDescription(r)+'</td></tr>').join('')+'</tbody></table>'}
function toggleReactionTable(button){let table=$('reactionTable');table.hidden=!table.hidden;button.setAttribute('aria-expanded',String(!table.hidden))}
const elementPanelBase=panel;panel=kind=>{elementPanelBase(kind);if(kind==='gems'&&started&&!dead&&!tutorialGuideOpen){let body=$('card').querySelector('.panel-body');body?.insertAdjacentHTML('afterbegin','<div class="element-tools"><button id="reactionGuideButton" onclick="showReactionGuide()">元素反応表</button><button onclick="grantElementGems()">未所持の属性ジェムを受取</button></div>');$('card').querySelectorAll('.bindings select').forEach((select,i)=>{let b=skillBuild(p.bindings[i]);if(b){let note=select.closest('label').nextElementSibling;note?.insertAdjacentHTML('afterbegin',elementBadges(b.elements)+'<br>')}})}};
function cycleReactionElement(select,step){
 let selects=Array.from($('card').querySelectorAll('.reaction-picker select'));
 if(!selects.includes(select))return false;
 let used=new Set(selects.filter(s=>s!==select).map(s=>s.value).filter(v=>v!==''));
 for(let i=0;i<select.options.length;i++){
  select.selectedIndex=(select.selectedIndex+step+select.options.length)%select.options.length;
  if(!used.has(select.value))break;
 }
 select.dispatchEvent(new Event('change',{bubbles:true}));menuReveal(select);playSound('ui');return true;
}
function returnFromReactionGuide(){panel('gems');menuFocusElement($('reactionGuideButton'))}
function reactionGuideBack(){
 let table=$('reactionTable');
 if(table&&!table.hidden){let button=$('card').querySelector('[aria-controls="reactionTable"]');toggleReactionTable(button);menuFocusElement(button)}
 else returnFromReactionGuide();
}
const elementMenuBase=padMenu;padMenu=(g,left,right,dt)=>{
 if(menuSurface==='reactions'){
  if(padEdge(g,'back')){reactionGuideBack();return}
  let step=padEdge(g,'inventory')?-1:padEdge(g,'flask')||padEdge(g,'accept')?1:0;
  if(step&&cycleReactionElement(document.activeElement,step)){menuScroll(right,dt);return}
 }
 elementMenuBase(g,left,right,dt)
};
addEventListener('keydown',e=>{if(e.key==='Escape'&&paused&&menuSurface==='reactions'){e.preventDefault();e.stopImmediatePropagation();reactionGuideBack()}},true);

const elementSocketHtml=socketEffectHtml;socketEffectHtml=slot=>{let html=elementSocketHtml(slot);return html.replace(/(<p hidden data-effect-index="(\d+)">)/g,(match,tag,index)=>{let gem=p[slot]?.sockets[index]?.gem;if(!gem||GEM[gem.type].kind!=='active')return match;let supports=socketSupportTypes(slot,+index,gem.type);return tag+elementBadges(skillElements(gem.type,supports))+'<br>'})};

if(typeof EFFECT_COLORS!=='undefined'){EFFECT_COLORS.water='#549eff';EFFECT_COLORS.wind='#a5f0cc'}
