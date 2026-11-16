const GEAR_TAGS={
 war:{name:'戦鬼',stages:[{attack:12},{attack:25},{crit:8},{}],text:['攻撃力 +12','さらに攻撃力 +25','さらに会心率 +8%','通常攻撃が50%の追加ダメージを与える']},
 bastion:{name:'不落',stages:[{life:80},{guard:8},{life:180},{}],text:['ライフ +80','さらに軽減 +8%','さらにライフ +180','致死ダメージをライフ1で耐え、2秒無敵（再使用60秒）']},
 arcane:{name:'星術',stages:[{spell:15},{regen:2},{spell:35},{}],text:['魔法ダメージ +15%','さらに毎秒マナ +2','さらに魔法ダメージ +35%','スキルのマナ消費30%減']},
 gale:{name:'疾風',stages:[{speed:6},{crit:5},{},{}],text:['移動速度 +6%','さらに会心率 +5%','スキル再使用時間15%短縮','瞬歩の再使用時間50%短縮']},
 alchemy:{name:'元素術',stages:[{},{},{},{}],text:['属性反応ダメージ +10%','属性反応ダメージ合計 +25%','属性反応ダメージ合計 +45%','属性反応ダメージ合計 +80%']},
 hunter:{name:'狩王',stages:[{attack:8},{crit:4},{attack:24},{}],text:['攻撃力 +8','さらに会心率 +4%','さらに攻撃力 +24','敵の素材ドロップ数 +1（EX削り報酬を除く）']}
};
function tagCountFor(character,id){return GEAR_SLOTS.reduce((n,slot)=>n+Number(!!character?.[slot]?.tags?.includes(id)),0)}
function tagCount(id){return tagCountFor(p,id)}
function tagEffectiveCountFor(character,id){return tagCountFor(character,id)}
function tagCountLabel(id,character=p){const actual=tagCountFor(character,id),effective=tagEffectiveCountFor(character,id);return actual+'部位'+(effective>actual?'（加護で'+effective+'部位相当）':'')}
function tagStage(id){return Math.min(4,Math.floor(tagEffectiveCountFor(p,id)/2))}
function tagStat(key){let n=0;for(let [id,tag]of Object.entries(GEAR_TAGS))for(let i=0;i<tagStage(id);i++)n+=tag.stages[i][key]||0;return n}
const tagStatsBase=stat;stat=key=>tagStatsBase(key)+tagStat(key);
const tagForgeBase=forgeItem;forgeItem=(spec,slot,tier,endgame=false,random=Math.random)=>{let it=tagForgeBase(spec,slot,tier,endgame,random),pool=Object.keys(GEAR_TAGS),first=endgame?Math.floor(random()*pool.length):spec.role%pool.length;it.tags=[pool.splice(first,1)[0]];let count=endgame?2+Number(tier>=2||random()<.25):tier>=2?2:1;while(it.tags.length<count)it.tags.push(pool.splice(Math.floor(random()*pool.length),1)[0]);return it};
const tagItemSaveBase=saveItem;saveItem=(it,expected)=>{let out=tagItemSaveBase(it,expected);if(out&&it.tags!==undefined){if(!Array.isArray(it.tags)||it.tags.length>3||new Set(it.tags).size!==it.tags.length||it.tags.some(t=>!GEAR_TAGS[t]))throw Error('装備タグが不正です');out.tags=[...it.tags]}return out};
const tagSkillBase=skillBuild;skillBuild=type=>{let b=tagSkillBase(type);if(b){if(tagStage('arcane')>=4)b.cost*=.7;if(tagStage('gale')>=3)b.cool*=.85}return b};
const tagReactionBase=triggerReaction;triggerReaction=(e,r,power)=>tagReactionBase(e,r,power*[1,1.1,1.25,1.45,1.8][tagStage('alchemy')]);
const tagRollBase=rollMaterial;rollMaterial=(spec,random=Math.random)=>{let result=tagRollBase(spec,random);if(tagStage('hunter')>=4)result.count++;return result};
let tagEcho=false,tagRescueCooldown=0;
const tagHitBase=hit;hit=(e,d)=>{let echo=!tagEcho&&!e.dotTick&&playerAction?.n===0&&tagStage('war')>=4;tagHitBase(e,d);if(echo&&e.hp>0){tagEcho=true;let previous=e.dotTick;e.dotTick=true;try{tagHitBase(e,d*.5);emit(e.x,e.y,8,'#f3c38c')}finally{tagEcho=false;e.dotTick=previous}}};
const tagHurtBase=hurt;hurt=d=>{let before=p.hp;tagHurtBase(d);if(before>0&&p.hp<=0&&tagStage('bastion')>=4&&tagRescueCooldown<=0){p.hp=1;p.inv=2;tagRescueCooldown=60;say('不落：致死ダメージを耐えた')}};
const tagCastBase=cast;cast=n=>{let before=cd[3];tagCastBase(n);if(n===3&&before<=0&&cd[3]>0&&tagStage('gale')>=4)cd[3]*=.5};
const tagUpdateBase=update;update=dt=>{if(!paused)tagRescueCooldown=Math.max(0,tagRescueCooldown-dt);tagUpdateBase(dt)};
const tagDetailsBase=itemDetails;itemDetails=it=>tagDetailsBase(it)+(it.tags?.length?'<p class="gear-tags">'+it.tags.map(id=>GEAR_TAGS[id].name+' '+tagCountLabel(id)).join(' · ')+'</p><button onclick="showTagGuide()">タグ効果</button>':'');
function showTagGuide(){worldMenu('装備タグ · セット効果','<p>同じタグを持つ装備を2・4・6・8部位そろえると発動。同じ部位は1個として数えます。鞄や倉庫は対象外。</p><div class="tag-guide">'+Object.entries(GEAR_TAGS).map(([id,tag])=>'<section><h3>'+tag.name+' '+tagCountLabel(id)+'</h3>'+tag.text.map((text,i)=>'<p class="'+(tagStage(id)>i?'tag-active':'muted')+'">'+(i+1)*2+'部位：'+text+'</p>').join('')+'</section>').join('')+'</div>','tags')}
const tagPadBase=padMenu;padMenu=(g,left,right,dt)=>{if(menuSurface==='tags'&&padEdge(g,'back')){panel('inventory');return}tagPadBase(g,left,right,dt)};

function gearTagChanges(item){
 let next={...p,[item.slot]:item};
 return Object.entries(GEAR_TAGS).flatMap(([id,tag])=>{
  let before=tagCountFor(p,id),after=tagCountFor(next,id),oldStage=Math.min(4,Math.floor(tagEffectiveCountFor(p,id)/2)),newStage=Math.min(4,Math.floor(tagEffectiveCountFor(next,id)/2));
  if(oldStage===newStage)return [];
  return [{id,before,after,beforeLabel:tagCountLabel(id,p),afterLabel:tagCountLabel(id,next),gained:newStage>oldStage,stages:tag.text.map((text,index)=>({text,required:(index+1)*2,index})).filter(row=>row.index>=Math.min(oldStage,newStage)&&row.index<Math.max(oldStage,newStage))}];
 });
}
function gearTagPreview(item){let changes=gearTagChanges(item);if(!changes.length)return '';
 return '<div class="gear-comparison gear-tag-preview"><small>セット効果の変化</small>'+changes.map(row=>'<p class="'+(row.gained?'gain':'loss')+'">'+GEAR_TAGS[row.id].name+'：'+row.beforeLabel+' → '+row.afterLabel+'<br>'+row.stages.map(stage=>(row.gained?'発動':'解除')+'（'+stage.required+'部位）：'+stage.text).join('<br>')+'</p>').join('')+'</div>';
}
const tagComparisonBase=gearComparison;gearComparison=item=>tagComparisonBase(item)+gearTagPreview(item);
