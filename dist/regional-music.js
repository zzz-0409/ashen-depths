// Human-composed CC0 recordings. No generated or oscillator-based background music.
const REGION_MUSIC=[
 {name:'草原',track:'flags',battle:'great-mission'}, {name:'洞窟',track:'doomed',battle:'waking-the-devil'},
 {name:'森林',track:'twists',battle:'great-mission'}, {name:'湿地',track:'doomed',battle:'waking-the-devil'},
 {name:'砂漠',track:'great-mission',battle:'flags'}, {name:'雪原',track:'spacetime',battle:'great-mission'},
 {name:'高原',track:'flags',battle:'waking-the-devil'}, {name:'火山',track:'waking-the-devil',battle:'doomed'},
 {name:'海岸',track:'warped',battle:'flags'}, {name:'遺跡',track:'twists',battle:'great-mission'},
 {name:'墓地',track:'doomed',battle:'waking-the-devil'}, {name:'裂け目',track:'spacetime',battle:'doomed'}
];
const RECORDED_REGIONAL_TRACKS={flags:'assets/audio/ehlers-flags.mp3',doomed:'assets/audio/ehlers-doomed.mp3',twists:'assets/audio/ehlers-twists.mp3','great-mission':'assets/audio/ehlers-great-mission.mp3',spacetime:'assets/audio/ehlers-spacetime.mp3','waking-the-devil':'assets/audio/ehlers-waking-the-devil.mp3',warped:'assets/audio/ehlers-warped.mp3'};
MUSIC_TRACKS.village=RECORDED_REGIONAL_TRACKS.warped;
MUSIC_TRACKS.explore=RECORDED_REGIONAL_TRACKS.flags;
MUSIC_TRACKS.battle=RECORDED_REGIONAL_TRACKS['great-mission'];
for(let [id,r]of REGION_MUSIC.entries()){MUSIC_TRACKS['region:'+id+':explore']=RECORDED_REGIONAL_TRACKS[r.track];MUSIC_TRACKS['region:'+id+':battle']=RECORDED_REGIONAL_TRACKS[r.battle];}
const regionSceneBase=chooseMusicScene;
chooseMusicScene=()=>{let scene=regionSceneBase(),id=typeof worldRegion==='number'?worldRegion:p?.campaign?.region;if((scene==='explore'||scene==='battle')&&Number.isInteger(id)&&REGION_MUSIC[id]){let key='region:'+id+':'+scene;if(scene==='explore'&&musicScene===key.replace(':explore',':battle')&&clock<musicThreatUntil)return musicScene;return key;}return scene;};
