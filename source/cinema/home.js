(function(){
'use strict';
const root=document.documentElement;
const chapters=[...document.querySelectorAll('.chapter')];
const railNo=document.getElementById('rail-number');
const railLabel=document.getElementById('rail-label');
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
let metrics=[],smoothY=scrollY,targetY=scrollY,pageRange=1,activeIndex=-1;
const clamp=(n,a=0,b=1)=>Math.max(a,Math.min(b,n));
function measure(){
  metrics=chapters.map(ch=>({top:ch.offsetTop,range:Math.max(1,ch.offsetHeight-innerHeight),center:ch.offsetTop+Math.max(1,ch.offsetHeight-innerHeight)*.5}));
  pageRange=Math.max(1,document.documentElement.scrollHeight-innerHeight);
}
function setTheme(index){
  if(index===activeIndex)return;
  activeIndex=index;
  const ch=chapters[index];
  const dark=ch.dataset.theme==='dark';
  root.style.setProperty('--top-ink',dark?'#f2ecdf':'#191817');
  root.style.setProperty('--rail-ink',dark?'#f2ecdf':'#191817');
  railNo.textContent=String(index+1).padStart(2,'0')+' / '+String(chapters.length).padStart(2,'0');
  railLabel.textContent=ch.dataset.label||'';
}
function frame(){
  targetY=scrollY;
  smoothY+=(targetY-smoothY)*(reduced?1:.14);
  let nearest=0,dist=Infinity;
  metrics.forEach((m,i)=>{
    const p=clamp((smoothY-m.top)/m.range),ch=chapters[i],enter=clamp(p*4);
    ch.style.setProperty('--p',p.toFixed(4));
    ch.style.setProperty('--copy-y',((.5-p)*42).toFixed(2)+'px');
    ch.style.setProperty('--copy-o',(.18+enter*.82).toFixed(3));
    ch.style.setProperty('--art-y',((.5-p)*22).toFixed(2)+'px');
    ch.style.setProperty('--reveal',((1-enter)*12).toFixed(2)+'%');
    ch.style.setProperty('--art-scale',(1.08-clamp(p)*.045).toFixed(4));
    ch.style.setProperty('--img-x',((.5-p)*2.6).toFixed(3)+'%');
    ch.style.setProperty('--img-y',((.5-p)*1.8).toFixed(3)+'%');
    ch.style.setProperty('--fog-one',(p*9).toFixed(2)+'%');
    ch.style.setProperty('--fog-two',(-p*12).toFixed(2)+'%');
    ch.style.setProperty('--snow-one',(p*90).toFixed(1)+'px');
    ch.style.setProperty('--snow-two',(-p*120).toFixed(1)+'px');
    const cardIn=clamp(p*2.2);
    ch.style.setProperty('--card-y',((1-cardIn)*38).toFixed(2)+'px');
    ch.style.setProperty('--card-o',(.15+cardIn*.85).toFixed(3));
    ch.style.setProperty('--line-p',clamp(p*1.4).toFixed(3));
    const articleIn=clamp(p*2);
    ch.style.setProperty('--article-x',((1-articleIn)*26).toFixed(2)+'px');
    ch.style.setProperty('--article-o',(.2+articleIn*.8).toFixed(3));
    const d=Math.abs(smoothY-m.center);if(d<dist){dist=d;nearest=i}
  });
  root.style.setProperty('--page-p',clamp(smoothY/pageRange).toFixed(4));
  root.style.setProperty('--page-h',(clamp(smoothY/pageRange)*100).toFixed(2)+'%');
  setTheme(nearest);requestAnimationFrame(frame);
}
const counterObserver=new IntersectionObserver(entries=>{entries.forEach(entry=>{
  if(!entry.isIntersecting||entry.target.dataset.done)return;
  entry.target.dataset.done='1';
  const end=Number(entry.target.dataset.count||0),suffix=entry.target.dataset.suffix||'',start=performance.now(),duration=1100;
  function tick(now){const t=clamp((now-start)/duration),e=1-Math.pow(1-t,4);entry.target.textContent=Math.round(end*e)+suffix;if(t<1)requestAnimationFrame(tick)}
  requestAnimationFrame(tick);
})},{threshold:.55});
document.querySelectorAll('[data-count]').forEach(el=>counterObserver.observe(el));
addEventListener('resize',measure,{passive:true});addEventListener('load',measure,{once:true});measure();setTheme(0);requestAnimationFrame(frame);
})();

(function(){
'use strict';
const objectUrls=[];
async function readPart(url){
  const r=await fetch(url,{cache:'force-cache'});
  if(!r.ok)throw new Error('artwork '+r.status+' '+url);
  return (await r.text()).replace(/\s+/g,'');
}
function base64ToBlobUrl(b64){
  const raw=atob(b64.replace(/\s+/g,''));
  const bytes=new Uint8Array(raw.length);
  for(let i=0;i<raw.length;i++)bytes[i]=raw.charCodeAt(i);
  const url=URL.createObjectURL(new Blob([bytes],{type:'image/webp'}));
  objectUrls.push(url);
  return url;
}
async function applyChunkedPhoto(selector,baseUrl,chunkCount,position){
  const el=document.querySelector(selector);if(!el)return;
  try{
    const urls=[];
    for(let i=0;i<chunkCount;i++)urls.push(baseUrl+'.'+i);
    const parts=await Promise.all(urls.map(readPart));
    const blobUrl=base64ToBlobUrl(parts.join(''));
    const probe=new Image();probe.src=blobUrl;await probe.decode();
    el.style.setProperty('background-image','linear-gradient(180deg,rgba(0,0,0,.015),rgba(0,0,0,.08)),url("'+blobUrl+'")','important');
    el.style.setProperty('background-size','cover','important');
    el.style.setProperty('background-position',position||'center','important');
    el.classList.add('photo-ready');
  }catch(err){console.error('[Seven cinema] artwork failed:',selector,err)}
}
applyChunkedPhoto('.workflow-art','/cinema/img/workflow-automation.webp.b64',3,'54% center');
applyChunkedPhoto('.ai-art','/cinema/img/ai-production.webp.b64',3,'56% center');
applyChunkedPhoto('.writing-art','/cinema/img/writing-public.webp.b64',2,'63% center');
applyChunkedPhoto('.final-art','/cinema/img/final-montreal-v11.webp.b64',2,'58% center');
addEventListener('pagehide',()=>objectUrls.forEach(URL.revokeObjectURL),{once:true});
})();
