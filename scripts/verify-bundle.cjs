// Read-only verification of either dist or an expanded release ZIP.
const fs=require('fs'),path=require('path'),vm=require('vm'),crypto=require('crypto');
const root=path.resolve(process.argv[2]||path.join(__dirname,'../dist')),failures=[],checked=new Set(),audioReferences=new Set();
const fail=message=>failures.push(message);
function localFile(reference,from='index.html'){
 if(/^(?:https?:|data:|\/\/|#)/.test(reference))return null;
 let relative=reference.split(/[?#]/)[0],file=path.resolve(path.dirname(path.join(root,from)),relative);
 if(!file.startsWith(root+path.sep)){fail('Reference escapes bundle: '+from+' -> '+reference);return null;}
 if(!fs.existsSync(file)||!fs.statSync(file).isFile()){fail('Missing reference: '+from+' -> '+reference);return null;}
 checked.add(path.relative(root,file).replaceAll(path.sep,'/'));return file;
}
function files(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(entry=>entry.isDirectory()?files(path.join(dir,entry.name)):[path.join(dir,entry.name)]);}
const list=files(root),html=fs.readFileSync(path.join(root,'index.html'),'utf8'),scripts=[];
for(let match of html.matchAll(/<(script|link)\b[^>]*?\b(?:src|href)=["']([^"']+)["']/g)){
 let file=localFile(match[2]);if(file&&match[1]==='script')scripts.push(file);
}
if(new Set(scripts).size!==scripts.length)fail('Duplicate script includes can register input twice');
try{new vm.Script(scripts.map(file=>fs.readFileSync(file,'utf8')).join('\n;\n'),{filename:'combined-script-order.js'});}catch(error){fail('Combined script declarations: '+error.message);}
for(let file of list){
 let name=path.relative(root,file).replaceAll(path.sep,'/');
 if(file.endsWith('.js')){
  let source=fs.readFileSync(file,'utf8');try{new vm.Script(source,{filename:name});}catch(error){fail('Syntax: '+name+': '+error.message);}
  for(let match of source.matchAll(/["'](assets\/audio\/[^"']+\.(?:ogg|mp3))["']/g)){audioReferences.add(match[1]);localFile(match[1],name);}
  for(let match of source.matchAll(/\.(?:assetSrc|src)\s*=\s*["']([^"']+)["']/g))if(match[1].startsWith('assets/'))localFile(match[1],name);
 }
 if(file.endsWith('.css'))for(let match of fs.readFileSync(file,'utf8').matchAll(/url\(\s*["']?([^"')\s]+)["']?\s*\)/g))localFile(match[1],name);
 if(file.endsWith('.png')){
  let data=fs.readFileSync(file);if(data.length<33||data.subarray(0,8).toString('hex')!=='89504e470d0a1a0a'||data.toString('ascii',12,16)!=='IHDR'||!data.readUInt32BE(16)||!data.readUInt32BE(20))fail('Invalid PNG header: '+name);
 }
}
const audioFiles=require('./verify-audio.cjs')(root,audioReferences,fail);
// Match the production release stamper, including every image and stylesheet.
let hash=crypto.createHash('sha256');for(let file of list.sort()){
 let name=path.relative(root,file).replaceAll(path.sep,'/');if(['release.json','build-id.js'].includes(name))continue;
 hash.update(name+'\0');hash.update(fs.readFileSync(file));hash.update('\0');
}
let revision=hash.digest('hex'),declared=JSON.parse(fs.readFileSync(path.join(root,'release.json'),'utf8')).revision;
if(revision!==declared)fail('release.json differs from bundle content');
if(!fs.readFileSync(path.join(root,'build-id.js'),'utf8').includes("CLIENT_RELEASE_ID='"+revision+"'"))fail('Client update ID differs from bundle content');
let report={passed:!failures.length,revision,files:list.length,scripts:scripts.length,referencedFiles:checked.size,pngFiles:list.filter(file=>file.endsWith('.png')).length,audioFiles,failures,scope:'Static bundle references, JavaScript syntax, PNG/Ogg headers, audio original checksums/credit presence and exact release hash. Does not prove runtime behavior, media decoding, legal clearance, gameplay or hosted deployment.'};
if(process.argv[3])fs.writeFileSync(process.argv[3],JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report,null,2));if(failures.length)process.exitCode=1;
