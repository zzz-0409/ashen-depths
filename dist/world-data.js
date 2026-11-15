// Campaign content is shared by spawning, contracts, the bestiary and crafting.
const REGION_ROWS=[
 ['風渡りの草原','#557143','草原','草牙狼,角兎,野盗斥候,草原の射手,苔亀,疾走猪,胞子茸,風羽鳥','群狼王フェン,大角のベヒモス,盗賊王ローク,嵐翼ガルダ'],
 ['燐光の洞窟','#405b62','洞窟','洞穴蝙蝠,岩晶の精,坑道亡者,燐光の精霊,岩甲獣,穴掘り獣,晶洞の灯,地底蛇','晶殻グラニト,晶妃セレネ,坑道監督ヴァル,地底竜オルム'],
 ['深緑の森林','#294d38','森林','樹皮狼,蔓蛇,森の追放者,棘弓兵,根の巨人,跳躍豹,毒胞子,梟の精霊','古樹エルダ,茨姫ロゼ,黒豹王ノクス,森守りアウル'],
 ['腐水の湿地','#43533e','湿地','泥牙鰐,沼の妖火,沈み人,毒霧の射手,泥甲獣,沼跳蛙,腐敗花,幽水霊','毒沼王ヴェノム,水葬の司祭,泥巨人モルガ,腐樹の母'],
 ['赤砂の砂漠','#a2824e','砂漠','砂狼,砂晶の精,砂賊,砂弓狩人,砂岩巨兵,流砂蜥蜴,熱砂の灯,砂霊','砂海竜サハル,砂后ネフラ,砂賊将アジム,日輪の守護者'],
 ['白銀の雪原','#96b5bc','雪原','雪狼,氷角兎,凍結亡者,氷槍兵,氷甲熊,雪跳豹,霜花,吹雪精','氷牙王スコル,雪嵐の巨人,霜妃フレイヤ,白竜イス'],
 ['雷鳴の高原','#626880','高原','雷牙狼,雷晶の精,高原兵,雷弓兵,帯電ゴーレム,雷走獣,雷光の灯,嵐精','雷帝ヴォルト,嵐角ライノ,天空の槍,雷鳥サンダラ'],
 ['灼熱の火山','#834a36','火山','溶岩犬,火晶の精,灰の兵士,火矢兵,溶岩巨人,火走蜥蜴,火の灯,熔精','熔王イグニス,火竜バルグ,噴火の巨獣,灰后シンダー'],
 ['沈没の海岸','#3d7e85','海岸','海牙獣,潮晶の精,溺れた水兵,珊瑚弓兵,巨甲亀,潮跳魚,海月,潮精','深海王ネレウス,巨岩カルキノ,幽霊船長,渦潮のセイレーン'],
 ['忘却の遺跡','#777565','遺跡','遺跡猟犬,青銅の魔導器,石像兵,石弓像,古代巨像,守護豹,魔導球,記憶霊','古王アトラス,千眼の監視者,忘却の女王,遺跡心臓'],
 ['黄昏の墓地','#62536e','墓地','骨狼,冥府の灯,墓守,骨弓兵,墓石巨人,影豹,死花,怨霊','死王モルド,墓守長ガロン,夜哭の花嫁,魂喰いアビス'],
 ['終焉の裂け目','#4b3869','裂け目','虚空狼,星喰いの結晶,裂界兵,虚空狙撃兵,崩壊巨像,次元猟獣,終末の眼,深淵霊','時喰いクロノス,星葬の竜,虚無后エクリプス,終焉王アザレク']
];
const ENEMY_ROLES=[
 {name:'群れの近接',hp:1,speed:115,range:70,windup:.65,recovery:.55,damage:1,pattern:'bite'},
 {name:'連射',hp:.8,speed:95,range:290,windup:.8,recovery:.6,damage:.7,pattern:'burst'},
 {name:'突き',hp:1.15,speed:95,range:115,windup:.7,recovery:.7,damage:1.3,pattern:'spear'},
 {name:'狙撃',hp:.85,speed:80,range:460,windup:1.1,recovery:.9,damage:1.5,pattern:'shot'},
 {name:'範囲打撃',hp:2.4,speed:60,range:145,windup:1.2,recovery:1,damage:1.8,pattern:'slam'},
 {name:'突進',hp:1.2,speed:130,range:340,windup:1,recovery:1,damage:1.4,pattern:'charge'},
 {name:'設置攻撃',hp:1,speed:65,range:370,windup:1.25,recovery:.9,damage:1.4,pattern:'mark'},
 {name:'放射弾',hp:1.25,speed:85,range:310,windup:1,recovery:.9,damage:1.1,pattern:'nova'}
];
const REGIONS=REGION_ROWS.map((row,id)=>({id,name:row[0],color:row[1],biome:row[2],level:1+id*4,enemies:row[3].split(',').map((name,i)=>({id:'r'+id+'e'+i,name,region:id,role:i,boss:false})),bosses:row[4].split(',').map((name,i)=>({id:'r'+id+'b'+i,name,region:id,role:i+4,boss:true,index:i}))}));
const SPECIES=Object.fromEntries(REGIONS.flatMap(r=>[...r.enemies,...r.bosses]).map(e=>[e.id,e]));
const MATERIAL_TIERS=[{name:'並',part:'欠片',chance:.64,color:'#c1c8c3'},{name:'良',part:'上質片',chance:.25,color:'#86c994'},{name:'希少',part:'霊核',chance:.09,color:'#82b8f1'},{name:'伝説',part:'宝珠',chance:.02,color:'#f0bc62'}];
const MATERIALS=Object.fromEntries(Object.values(SPECIES).flatMap(e=>MATERIAL_TIERS.map((t,i)=>[e.id+':'+i,{id:e.id+':'+i,species:e.id,tier:i,name:e.name+'の'+t.part,color:t.color}])));
const BOSS_ARENAS=[{cx:40,cy:10},{cx:43,cy:40},{cx:13,cy:43},{cx:27,cy:26}];
const WORLD_BALANCE='hunt-1';
// Art direction: no spiders, insects, larvae or arthropod-like silhouettes.
// Keep species IDs stable so existing contracts, materials and saves remain valid.
for(let [id,form]of Object.entries({r1e3:'crystal',r1e4:'beast',r1b1:'guardian',r3b2:'guardian',r4b1:'guardian',r8b1:'guardian'}))SPECIES[id].visualForm=form;


