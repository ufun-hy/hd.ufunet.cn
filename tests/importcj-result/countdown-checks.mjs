const {strict:assert}=await import('node:assert');
const task=await taskSpace(globalThis.RESULT_TEST_SPACE),page=task.page('p1');
await page.cdp('Network.enable');await page.cdp('Network.setCacheDisabled',{cacheDisabled:true});
await page.goto('http://127.0.0.1:8767/tests/importcj-result/?fields=2&count=40');
await page.waitForFunction(()=>window.ui&&ui.importResult);
const checks=await page.evaluate(()=>{
 const checks={},real={setTimeout,clearTimeout},realNow=Date.now;let now=0,id=100000;const jobs=new Map();
 window.setTimeout=(fn,delay=0)=>{jobs.set(++id,{fn,time:now+delay});return id;};window.clearTimeout=key=>jobs.delete(key);Date.now=()=>now;
 function tick(to){while(true){const next=[...jobs].filter(([,j])=>j.time<=to).sort((a,b)=>a[1].time-b[1].time)[0];if(!next)break;const[k,j]=next;now=j.time;jobs.delete(k);j.fn();}now=to;}
 try{
  ui.root.style.cssText='width:1440px;height:900px';showResult(40,'',{},2);const r=ui.importResult;
  const card=r.board.querySelector('.import-result-card'),width=parseFloat(card.style.width),font=parseFloat(card.querySelector('.import-result-main').style.fontSize);
  checks.cardProportions=Math.abs(width/(font/.8)-3.8)<.01&&Math.abs(parseFloat(card.style.height)/(font/.8)-2.4)<.01;
  checks.noOperationText=r.prev.textContent==='‹'&&r.next.textContent==='›'&&r.pause.textContent==='';
  checks.thinLine=getComputedStyle(r.progress).height==='1px'&&!r.progress.querySelector('svg,circle');
  checks.waitForReveal=!r.progressAnimation&&r.rotationDeadline===null;
  const ready=r.revealReadyAt;tick(ready);
  checks.exactFourSeconds=r.rotationDeadline-now===4000&&r.progressAnimation.effect.getTiming().duration===4000;
  tick(ready+1250);r.pause.click();
  checks.freeze=r.rotationRemaining===2750&&r.rotation===null&&!r.progressAnimation&&r.progressFill.style.transform==='scaleX(0.3125)';
  tick(ready+20000);checks.paused=r.pageIndex===0;
  r.pause.click();checks.resumeDuration=r.progressAnimation.effect.getTiming().duration===2750;
  tick(ready+22749);checks.notEarly=r.pageIndex===0;
  tick(ready+22750);checks.turn=r.pageIndex===1&&r.rotationRemaining===4000&&r.rotationDeadline===null&&!!r.board.querySelector('.is-pending');
  r.prev.click();checks.seenPageStartsImmediately=r.pageIndex===0&&r.rotationDeadline-now===4000;
  r.next.click();checks.manualResets=r.rotationRemaining===4000&&r.progressAnimation.effect.getTiming().duration===4000;
  ui.setState('records');checks.cleanup=r.rotation===null&&!r.progressAnimation;
  ui.destroy();
 }finally{Date.now=realNow;Object.assign(window,real);showResult(3);}
 return checks;
});console.log(checks);for(const [k,v]of Object.entries(checks))assert.ok(v,k);
