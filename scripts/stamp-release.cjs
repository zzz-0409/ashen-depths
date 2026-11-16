// Run after all dist edits, before packaging/deploying. No credentials or source upload.
const fs=require('fs'),path=require('path'),crypto=require('crypto');
require('./build-signature-dispatch.cjs');
const root=path.resolve(__dirname,'../dist'),hash=crypto.createHash('sha256');
function files(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(entry=>entry.isDirectory()?files(path.join(dir,entry.name)):[path.join(dir,entry.name)]);}
for(let file of files(root).sort()){let name=path.relative(root,file).replaceAll(path.sep,'/');if(['release.json','build-id.js'].includes(name))continue;hash.update(name+'\0');hash.update(fs.readFileSync(file));hash.update('\0');}
let revision=hash.digest('hex');fs.writeFileSync(path.join(root,'build-id.js'),"const CLIENT_RELEASE_ID='"+revision+"';\n");fs.writeFileSync(path.join(root,'release.json'),JSON.stringify({revision})+'\n');console.log('Stamped release '+revision);

const serverRelease=path.resolve(__dirname,'../server/game-release.mjs');if(fs.existsSync(path.dirname(serverRelease)))fs.writeFileSync(serverRelease,"export const SERVER_RELEASE='"+revision+"';\n");
