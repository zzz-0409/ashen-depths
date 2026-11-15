// Briefs live only in the selected quest's detail. They never change progression.
const GUILD_CONTACTS=[
 ['街道番ミラ','村へ物資を運ぶ街道','荷車が安全に通れる道を取り戻したい'],
 ['坑夫長ダン','調査隊が消息を絶った坑道','残された燐光石と調査隊の足跡を調べたい'],
 ['森番リネ','黒い樹液が流れる森','根を蝕む力がどこから来たのか突き止めたい'],
 ['水汲みのサラ','村へ続く湿地の水源','腐水を運ぶ流れを調べ、井戸を守りたい'],
 ['隊商長ハディ','古王朝の門へ続く砂路','隊商の避難路と門の手掛かりを確保したい'],
 ['遠征隊のユナ','旗が凍りついた雪原','行方不明の遠征隊が残した道標を探したい'],
 ['観測士レオ','雷に閉ざされた高原','裂け目の鍵に反応する雷を観測したい'],
 ['鍛冶師ガル','古い炉が眠る火山','門を封じる武器の製法を持ち帰りたい'],
 ['灯台守ネリ','沈没都市へ続く海岸','海に消えた製法と船長の記憶を探したい'],
 ['記録官セト','古代の守護者が眠る遺跡','終焉王の帰還を止める方法を読み解きたい'],
 ['墓守イオ','かつての冒険者が眠る墓地','門を封じた者たちの魂から最後の鍵を託されたい'],
 ['ギルド長エナ','村々を脅かす終焉の裂け目','皆が帰れる明日を、この手で取り戻したい']
];
const HUNT_REASONS=[
 '群れが通行人を追い立てている。',
 '脇道からの襲撃で調査が止まっている。',
 '見張りの交代路が塞がれている。',
 '遠くからの狙撃で物資を運べない。',
 '大きな個体が退路を踏み荒らしている。',
 '足の速い個体が伝令を追い詰めている。',
 '危険な力が野営地の近くへ広がっている。',
 '異変を帯びた個体が探索隊を妨げている。'
];
function guildQuestNarrative(q,c=campaign()){
 if(!q||!SPECIES[q.target]||!GUILD_CONTACTS[q.region])return null;
 let spec=SPECIES[q.target],[contact,place,purpose]=GUILD_CONTACTS[q.region],repeat=(c.questDone||[]).includes(q.id);
 if(q.target==='ex100skill')return{contact:'ギルド長エナ',text:'星紡ぎの竜が裂け目に現れた。削り取った星紡ぎの欠片を持ち帰れば、スキル工房で未知の属性を持つジェムを製作できる。欠片50個で200種類のスキルから1つを抽選する。'};
 if(q.kind==='ex')return{contact:'ギルド長エナ',text:spec.exRank===100
  ?(repeat?'一度退けても、裂け目は原初の終焉を呼び戻す。持ち帰った欠片を装備に変え、今度はさらに深く切り込もう。':'裂け目の奥に原初の終焉が待っている。一度で倒せなくても、削り取った欠片を持ち帰り、村の工房で次の一戦へつなごう。')
  :'歴戦の冒険者へ。'+spec.name+'の出現が確認された。'+place+'で培った力を試し、終焉に立ち向かう経験を持ち帰ってほしい。'};
 if(q.kind==='trial')return{contact:'試験官エナ',text:'次の地域を任せられるか、'+spec.name+'との実戦で見極める。討伐して帰還するまでが試験だ。昇格後には、この地の奥に潜む強敵の調査も任せたい。'};
 if(q.kind==='secret')return{contact,text:'昇格したあなたにだけ頼みたい。通常の調査では届かなかった奥地に、'+spec.name+'が姿を現した。危険を承知で挑む冒険者を募っている。'};
 if(q.id==='hunt:r0e0'&&!repeat)return{contact,text:'ようこそ、灯火の村へ。まずは街道の草牙狼を'+q.required+'体退けてほしい。拾った素材を持って帰っておいで。最初の装備づくりは、村の工房が手伝うよ。'};
 if(repeat)return{contact,text:place+'で再び'+spec.name+'が確認された。前回の調査を生かし、もう一度安全を確保してほしい。'};
 return{contact,text:q.kind==='hunt'?HUNT_REASONS[spec.role]+' '+spec.name+'を退け、'+purpose+'。':spec.name+'が'+place+'の調査を阻んでいる。討伐して、'+purpose+'。'};
}
function guildNarrativeHtml(q){let brief=guildQuestNarrative(q);return brief?'<details class="quest-brief"><summary>手紙：'+gearEscape(brief.contact)+'</summary><p>'+gearEscape(brief.text)+'</p></details>':'';}
function guildHabitatHtml(q){let s=q&&SPECIES[q.target];if(q?.kind!=='hunt'||!s||s.boss)return '';let h=enemyHabitat(s.role,s.region);return '<details class="quest-brief"><summary>探しやすい場所：地図の'+h.label+'</summary><p>地域地図の淡い円が主な生息域です。円の外にも出現します。敵の正確な位置は、近づいて視界に入ると◆で表示されます。</p></details>';}
const narrativeBoardDetailBase=guildBoardDetail;guildBoardDetail=q=>narrativeBoardDetailBase(q).replace('<p class="guild-selection-status">',guildNarrativeHtml(q)+guildHabitatHtml(q)+'<p class="guild-selection-status">');
