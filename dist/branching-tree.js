// Stable IDs preserve learned nodes and saved points. Reconnect them as a radial
// branching graph; ordinary points lead to tree-only talents and outer covenants.
const TREE_TALENTS=[
 ['間合いの支配',t=>'130以内の敵への直撃ダメージ +'+4*t+'%。'],
 ['狩人の息継ぎ',t=>'敵を倒すと最大ライフの'+t+'%を回復。訓練標的は対象外。'],
 ['遠見の射法',t=>'300以上離れた敵への直撃ダメージ +'+4*t+'%。'],
 ['無傷の芽吹き',t=>'3秒間ライフダメージを受けなければ毎秒最大ライフの'+(.3*t).toFixed(1)+'%を回復。'],
 ['流転の刃',t=>'移動中の直撃ダメージ +'+3*t+'%。'],
 ['魂の緩衝',t=>'被弾によるライフ減少の'+3*t+'%をマナで肩代わり（1マナ/ライフ）。'],
 ['終幕を告げる者',t=>'ライフ35%以下の敵への直撃ダメージ +'+5*t+'%。'],
 ['勝利の律動',t=>'敵の討伐時、全ジェムスキルの残り再使用時間を'+(.1*t).toFixed(1)+'秒短縮。'],
 ['先制の刻印',t=>'ライフ満タンの敵への直撃ダメージ +'+6*t+'%。'],
 ['巨獣への挑戦',t=>'ボスへの直撃ダメージ +'+3*t+'%。'],
 ['残影の一閃',t=>'瞬歩の発動後3秒以内の最初の直撃ダメージ +'+8*t+'%。'],
 ['不動の照準',t=>'1秒間その場に留まると直撃ダメージ +'+4*t+'%。移動すると解除。']
];
const TREE_COVENANTS=[
 {name:'魂を鎧に',code:'soulward',desc:'被弾のライフ減少を、マナがある限り100%肩代わり。ライフ1につきマナ2を消費。スキルのマナと防御を共有する。',icon:11},
 {name:'亡骸の連星',code:'corpseburst',desc:'敵を倒すと亡骸が爆発。周囲170の最大6体に、倒した敵の最大ライフ20%（攻撃力の8倍が上限）のダメージ。爆発から再爆発は起きない。',icon:0},
 {name:'魔力の暴走',code:'overdrive',desc:'全ジェムスキルの威力80%増。消費コスト2倍、再使用時間30%増。少数の大技へ力を集中する。',icon:8},
 {name:'双極の運命',code:'polarity',desc:'直撃の威力が命中ごとに25%→225%と交互に変わる。継続ダメージは対象外。弱い一撃で仕込み、強い一撃を本命へ。',icon:9},
 {name:'一騎討ちの世界',code:'solitude',desc:'自分から240以内の生きた敵が1体だけなら直撃ダメージ2倍。それ以外は35%減。敵を引き離して戦う。',icon:3},
 {name:'尽きぬ詠唱',code:'rapidcast',desc:'全ジェムスキルの再使用時間65%短縮。消費コスト2.2倍。マナやライフを維持できる限り連発できる。',icon:10}
];
const TREE_BRANCHES=[],TREE_STARS=[];
for(let n of NODES)n.links=[];
const treeConnect=(a,b)=>{if(!NODES[a].links.includes(b))NODES[a].links.push(b);if(!NODES[b].links.includes(a))NODES[b].links.push(a)};
clusterCenters.length=0;
for(let branch=0;branch<12;branch++){
 let original=Array.from({length:15},(_,i)=>1+branch*15+i),extra=Array.from({length:15},(_,i)=>181+branch*15+i),majors=original.filter(id=>NODES[id].major),small=[...original.filter(id=>!NODES[id].major),...extra],previous=0,starIds=[];
 for(let group=0;group<3;group++){
  let major=NODES[majors[group]],members=small.splice(0,9),tier=group+1,angle=branch*Math.PI/6-Math.PI/2+[.04,-.075,.055][group]+Math.sin(branch*2.7+group)*.055,radius=[245,435,625][group]+Math.sin(branch*1.9+group)*20,cx=800+Math.cos(angle)*radius,cy=800+Math.sin(angle)*radius;
  let star={id:TREE_STARS.length,major:major.id,members,name:TREE_TALENTS[branch][0]+'座 '+['I','II','III'][group]};TREE_STARS.push(star);starIds.push(major.id);
  Object.assign(major,{x:cx,y:cy,value:0,star:star.id,talent:{branch,tier},name:star.name,key:{code:'talent_'+branch+'_'+tier,icon:ICONS[types[branch%6]]??8,desc:'ツリー限定 · '+TREE_TALENTS[branch][1](tier)}});
  for(let i=0;i<9;i++){let n=NODES[members[i]],a=angle+i*Math.PI*2/9+Math.sin(branch+i*3+group)*.09,r=[54,66,78][group]*(1+.2*Math.sin(i*2.3+branch));n.x=cx+Math.cos(a)*r;n.y=cy+Math.sin(a)*r;n.star=star.id;}
  // A crooked main path with three side branches, rather than circular spokes.
  treeConnect(previous,members[0]);treeConnect(members[0],members[1]);treeConnect(members[1],members[2]);treeConnect(members[2],major.id);
  treeConnect(members[1],members[3]);treeConnect(members[3],members[4]);treeConnect(members[2],members[5]);treeConnect(members[5],members[6]);treeConnect(major.id,members[7]);treeConnect(members[7],members[8]);previous=members[8];
 }
 TREE_BRANCHES.push(starIds);
 let key;if(branch%2===0)key=NODES[361+branch/2];else{let definition=TREE_COVENANTS[(branch-1)/2];key={id:NODES.length,kind:'keystone',major:true,name:definition.name,value:0,links:[],key:definition};NODES.push(key);}
 let angle=branch*Math.PI/6-Math.PI/2+Math.sin(branch*1.7)*.045,radius=772;key.x=800+Math.cos(angle)*radius;key.y=800+Math.sin(angle)*radius;key.covenant=true;treeConnect(previous,key.id);
}
let treeOwnershipRef=null,treeOwnershipLength=-1,treeOwnershipCache=null;
function treeOwnership(){
 let nodes=p?.nodes||[];if(nodes===treeOwnershipRef&&nodes.length===treeOwnershipLength)return treeOwnershipCache;
 treeOwnershipRef=nodes;treeOwnershipLength=nodes.length;
 let owned=new Set(nodes),complete=new Set(),talents=Array(12).fill(0),keys=new Set();
 for(let star of TREE_STARS)if(owned.has(star.major)&&star.members.every(id=>owned.has(id)))complete.add(star.id);
 for(let id of nodes){let n=NODES[id];if(n?.key)keys.add(n.key.code);if(n?.talent)talents[n.talent.branch]+=n.talent.tier*(complete.has(n.star)?2:1);}
 return treeOwnershipCache={owned,complete,talents,keys};
}
function treeTalent(branch){return treeOwnership().talents[branch]}
hasKey=code=>treeOwnership().keys.has(code);
let treeRest=0,treeUnhurt=0,treeDodge=0,treePolarity=0,treeExplosion=false;
function resetTreeCombat(){treeRest=0;treeUnhurt=0;treeDodge=0;treePolarity=0;}
const branchingLoadBase=loadWorld;loadWorld=()=>{resetTreeCombat();return branchingLoadBase()};
const branchingDummyBase=clearDummy;clearDummy=()=>{resetTreeCombat();return branchingDummyBase()};
const branchingBuildBase=skillBuild;skillBuild=type=>{let b=branchingBuildBase(type);if(!b)return b;if(hasKey('overdrive')){b.mult*=1.8;b.cost*=2;b.cool*=1.3}if(hasKey('rapidcast')){b.cool*=.35;b.cost*=2.2}return b};
const branchingHitBase=hit;
hit=(e,d)=>{
 if(!e||e.hp<=0)return;
 let alive=e.hp>0,direct=!e.dotTick&&!treeExplosion,mult=1;
 if(direct){
  let distance=dist(p,e);
  if(distance<=130)mult+=.04*treeTalent(0);
  if(distance>=300)mult+=.04*treeTalent(2);
  if(playerMoving)mult+=.03*treeTalent(4);
  if(e.hp/e.max<=.35)mult+=.05*treeTalent(6);
  if(e.hp>=e.max)mult+=.06*treeTalent(8);
  if(e.boss)mult+=.03*treeTalent(9);
  if(treeDodge>0){mult+=.08*treeTalent(10);treeDodge=0;}
  if(treeRest>=1)mult+=.04*treeTalent(11);
  if(hasKey('polarity'))mult*=treePolarity++%2===0?.25:2.25;
  if(hasKey('solitude'))mult*=enemies.filter(other=>other.hp>0&&dist(other,p)<=240).length===1?2:.65;
 }
 branchingHitBase(e,d*mult);
 if(alive&&e.hp<=0&&!e.dummy){
  if(p.hp>0&&!dead)p.hp=Math.min(maxhp(),p.hp+maxhp()*.01*treeTalent(1));
  for(let action of SKILL_ACTIONS)cd[action]=Math.max(0,cd[action]-.1*treeTalent(7));
  if(hasKey('corpseburst')&&!treeExplosion){
   let targets=enemies.filter(other=>other!==e&&other.hp>0&&dist(other,e)<=170&&lineClear(e,other)).slice(0,6),power=Math.min(e.max*.2,damage()*8);
   treeExplosion=true;try{burst(e.x,e.y,170,'#e6a76b');for(let other of targets)hit(other,power)}finally{treeExplosion=false;}
  }
 }
};
// Resolve resource shielding before HP is removed and before fatal-rescue hooks.
function absorbTreeDamage(loss){
 let soul=hasKey('soulward'),ratio=soul?1:Math.min(1,.03*treeTalent(5)),price=soul?2:1,absorbed=Math.min(loss*ratio,Math.max(0,p.mp)/price);
 p.mp=Math.max(0,p.mp-absorbed*price);return loss-absorbed;
}
const branchingHurtBase=hurt;hurt=d=>{let before=p.hp;branchingHurtBase(d);if(p.hp<before)treeUnhurt=0;};
const branchingCastBase=cast;cast=n=>{let before=cd[3];let result=branchingCastBase(n);if(n===3&&before<=0&&cd[3]>0)treeDodge=3;return result};
const branchingUpdateBase=update;update=dt=>{
 let active=started&&!paused&&!dead,x=p?.x,y=p?.y;branchingUpdateBase(dt);
 if(!active||dead)return;
 treeDodge=Math.max(0,treeDodge-dt);treeUnhurt+=dt;
 treeRest=Math.hypot(p.x-x,p.y-y)>.01?0:treeRest+dt;
 if(treeUnhurt>=3&&p.hp>0)p.hp=Math.min(maxhp(),p.hp+maxhp()*.003*treeTalent(3)*dt);
};
// Keep controller inspection and focus restoration in the existing wrappers.
const branchingTreeHtml=treeHtml;
treeHtml=()=>{
 let owned=treeOwnership(),html=branchingTreeHtml().replace('大きなノードはKeystone：利点と代償があります。','大きな星と周囲9点を取得すると加護が発動。外周は戦い方を変える誓約。').replace('<div id="treeViewport">','<div class="branching-tree-layout"><div id="treeViewport">').replace('<div id="nodeDetail"></div>','<div id="nodeDetail"><p>星を選ぶと効果と加護の条件を表示</p></div></div>');
 html=html.replace(/(<g data-node="(\d+)"[^>]*class=")node /g,(all,prefix,id)=>prefix+'node '+(NODES[id].covenant?'covenant ':'')+(NODES[id].talent?'talent ':'')+(owned.complete.has(NODES[id].star)?'blessed ':''));
 let stars=TREE_STARS.map(star=>{let n=NODES[star.major],r=27,points=Array.from({length:10},(_,i)=>{let a=-Math.PI/2+i*Math.PI/5,d=i%2?12:r;return (n.x+Math.cos(a)*d)+','+(n.y+Math.sin(a)*d)}).join(' ');return '<polygon class="constellation-star '+(owned.complete.has(star.id)?'complete':'')+'" points="'+points+'"/>'}).join('');
 return html.replace('</svg></div><div id="nodeDetail">',stars+'</svg></div><div id="nodeDetail">');
};
const branchingInspectBase=inspectNode;inspectNode=id=>{
 branchingInspectBase(id);let n=NODES[id],star=TREE_STARS[n?.star];if(!star)return;
 let status=treeOwnership(),count=star.members.filter(id=>status.owned.has(id)).length,complete=status.complete.has(star.id),major=NODES[star.major];
 $('nodeDetail').insertAdjacentHTML('beforeend','<section class="star-blessing '+(complete?'active':'')+'"><small>星の加護 · '+star.name+'</small><p>'+ (complete?'発動中':count+' / '+star.members.length+' 小ノード · 大きな星 '+(status.owned.has(star.major)?'取得済み':'未取得'))+'</p><p>大きな星と、この星座の周囲すべてのノードを取得すると、専用効果が2倍。</p><p>'+TREE_TALENTS[major.talent.branch][1](major.talent.tier*2)+'</p></section>');
};
