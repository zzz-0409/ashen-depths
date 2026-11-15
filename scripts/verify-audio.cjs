const fs=require('fs'),path=require('path'),crypto=require('crypto');
// File integrity and credit presence, not legal clearance or audio decoding.
module.exports=function verifyAudio(root,referenced,fail){
 const directory=path.join(root,'assets/audio'),manifestPath=path.join(directory,'manifest.json');
 if(!referenced.size&&!fs.existsSync(manifestPath))return 0;
 let manifest;try{manifest=JSON.parse(fs.readFileSync(manifestPath,'utf8'));if(!Array.isArray(manifest))throw Error('array required');}catch{fail('Audio manifest missing or invalid');return 0;}
 let credits='';try{credits=fs.readFileSync(path.join(root,'AUDIO-LICENSES.txt'),'utf8');}catch{fail('Audio credits missing');}
 const names=new Set();let verified=0;
 for(const item of manifest){
  if(!item||typeof item.name!=='string'||!/^[-a-z0-9]+\.(ogg|mp3)$/.test(item.name)||names.has(item.name)){fail('Invalid or duplicate audio manifest filename');continue;}
  names.add(item.name);const file=path.join(directory,item.name);
  if(!fs.existsSync(file)){fail('Missing audio: '+item.name);continue;}
  const data=fs.readFileSync(file),hash=crypto.createHash('sha256').update(data).digest('hex');
  if(item.name.endsWith('.ogg')?(data.length<27||data.toString('ascii',0,4)!=='OggS'||data[4]!==0):(data.length<3||!(data.toString('ascii',0,3)==='ID3'||data[0]===255&&(data[1]&224)===224)))fail('Invalid audio header: '+item.name);
  if(data.length!==item.bytes||hash!==item.sha256)fail('Audio original checksum differs: '+item.name);
  if(item.license!=='CC0-1.0'||!/^\d{4}-\d{2}-\d{2}$/.test(item.verifiedOn||''))fail('Audio license metadata invalid: '+item.name);
  if(!credits.includes('assets/audio/'+item.name))fail('Audio credit absent: '+item.name);
  verified++;
 }
 for(const ref of referenced)if(!names.has(ref.slice('assets/audio/'.length)))fail('Unmanifested audio reference: '+ref);
 if(fs.existsSync(directory))for(const name of fs.readdirSync(directory))if(/\.(ogg|mp3)$/.test(name)&&!names.has(name))fail('Unmanifested audio file: '+name);
 const sfxPath=path.join(directory,'sfx/provenance.json');
 if(fs.existsSync(sfxPath)){try{const sfx=JSON.parse(fs.readFileSync(sfxPath,'utf8')),seen=new Set();if(sfx.license!=='CC0-1.0'||!Array.isArray(sfx.files))throw Error('invalid metadata');for(const item of sfx.files){if(!/^[-a-zA-Z0-9_]+\.ogg$/.test(item.file)||seen.has(item.file))throw Error('invalid SFX filename');seen.add(item.file);const bytes=fs.readFileSync(path.join(directory,'sfx',item.file));if(bytes.toString('ascii',0,4)!=='OggS'||crypto.createHash('sha256').update(bytes).digest('hex')!==item.sha256)throw Error('SFX checksum: '+item.file);if(!credits.includes(item.author)||!credits.includes(item.source))throw Error('SFX credit: '+item.file);verified++;}for(const file of fs.readdirSync(path.join(directory,'sfx')))if(file.endsWith('.ogg')&&!seen.has(file))throw Error('Unmanifested SFX: '+file);}catch(error){fail('SFX verification: '+error.message);}}
 return verified;
};
