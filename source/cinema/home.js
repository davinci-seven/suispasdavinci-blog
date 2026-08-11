
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
  metrics=chapters.map(ch=>({
    top:ch.offsetTop,
    range:Math.max(1,ch.offsetHeight-innerHeight),
    center:ch.offsetTop+Math.max(1,ch.offsetHeight-innerHeight)*.5
  }));
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
  smoothY += (targetY-smoothY)*(reduced?1:.14);
  let nearest=0,dist=Infinity;
  metrics.forEach((m,i)=>{
    const p=clamp((smoothY-m.top)/m.range);
    const ch=chapters[i];
    const enter=clamp(p*4);
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
    const d=Math.abs(smoothY-m.center);
    if(d<dist){dist=d;nearest=i}
  });
  root.style.setProperty('--page-p',clamp(smoothY/pageRange).toFixed(4));
  root.style.setProperty('--page-h',(clamp(smoothY/pageRange)*100).toFixed(2)+'%');
  setTheme(nearest);
  requestAnimationFrame(frame);
}
const counterObserver=new IntersectionObserver(entries=>{
  entries.forEach(entry=>{
    if(!entry.isIntersecting||entry.target.dataset.done)return;
    entry.target.dataset.done='1';
    const end=Number(entry.target.dataset.count||0);
    const suffix=entry.target.dataset.suffix||'';
    const start=performance.now(),duration=1100;
    function tick(now){
      const t=clamp((now-start)/duration);
      const e=1-Math.pow(1-t,4);
      entry.target.textContent=Math.round(end*e)+suffix;
      if(t<1)requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  });
},{threshold:.55});
document.querySelectorAll('[data-count]').forEach(el=>counterObserver.observe(el));

addEventListener('resize',measure,{passive:true});
addEventListener('load',measure,{once:true});
measure(); setTheme(0); requestAnimationFrame(frame);
})();
