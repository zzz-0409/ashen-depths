// Compose HUD text/attributes before committing. Later decorators win without
// exposing intermediate labels or rebuilding identical text nodes each tick.
let hudWriteBatch=null;
function hudWrite(element,key,value){
 if(!element)return;value=String(value);
 if(hudWriteBatch){let fields=hudWriteBatch.get(element);if(!fields){fields=new Map();hudWriteBatch.set(element,fields);}fields.set(key,value);return;}
 if(key==='text'){if(element.textContent!==value)element.textContent=value;}
 else if(key==='title'){if(element.title!==value)element.title=value;}
 else if(key.startsWith('data:')){let field=key.slice(5);if(element.dataset[field]!==value)element.dataset[field]=value;}
 else if(element.getAttribute?.(key)!==value)element.setAttribute(key,value);
}
function hudText(element,value){hudWrite(element,'text',value);}
function hudTitle(element,value){hudWrite(element,'title',value);}
function hudAttribute(element,name,value){hudWrite(element,name,value);}
function hudData(element,name,value){hudWrite(element,'data:'+name,value);}
function hudTitleValue(element){return hudWriteBatch?.get(element)?.get('title')??element.title;}
function batchHudWrites(render){
 if(hudWriteBatch)return render();
 let batch=new Map(),result;hudWriteBatch=batch;
 try{result=render();}catch(error){hudWriteBatch=null;throw error;}
 hudWriteBatch=null;for(let [element,fields]of batch)for(let [key,value]of fields)hudWrite(element,key,value);
 return result;
}
