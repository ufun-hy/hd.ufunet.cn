const {strict:assert}=await import('node:assert');
const task=await taskSpace(globalThis.RESULT_TEST_SPACE),page=task.page('p1');
await page.cdp('Network.enable');await page.cdp('Network.setCacheDisabled',{cacheDisabled:true});
await page.goto('http://127.0.0.1:8767/tests/importcj-result/?count=40&fields=4');
await page.waitForFunction(()=>window.ui&&ui.importResult);
const result=await page.evaluate(()=>{
 const checks={};
 for(const fields of [1,2,3,4]){
  const real={setTimeout,clearTimeout,setInterval,clearInterval};let now=0,id=100000;const jobs=new Map();
  window.setTimeout=(fn,delay=0)=>{jobs.set(++id,{fn,time:now+delay});return id;};
  window.clearTimeout=key=>jobs.delete(key);
  function tick(to){while(true){const next=[...jobs].filter(([,j])=>j.time<=to).sort((a,b)=>a[1].time-b[1].time)[0];if(!next)break;const[key,j]=next;now=j.time;jobs.delete(key);j.fn();}now=to;}
  try{
   ui.root.style.cssText='width:375px;height:812px';showResult(40,'',{},fields);
   const r=ui.importResult,buttons=[r.prev,r.next,r.pause];
   checks['buttons'+fields]=!r.pager.hidden&&buttons.every(b=>b.tagName==='BUTTON');
   r.pause.click();tick(20000);
   checks['pause'+fields]=r.pageIndex===0&&r.rotation===null&&r.pause.textContent==='继续轮播'&&!r.board.querySelector('.is-pending');
   r.next.click();
   checks['manualWhilePaused'+fields]=r.pageIndex===1&&r.paused&&r.rotation===null&&!!r.board.querySelector('.is-pending')&&!!r.board.querySelector('.sw');
   r.prev.click();
   checks['returnStatic'+fields]=r.pageIndex===0&&!r.board.querySelector('.done,.sw,.is-pending')&&!r.content.querySelector('.import-result-particle');
   r.next.click();
   checks['interruptedReturnStatic'+fields]=r.pageIndex===1&&!r.board.querySelector('.done,.sw,.is-pending');
   r.pause.click();tick(23999);checks['resumeHold'+fields]=r.pageIndex===1;
   tick(24000);checks['resume'+fields]=r.pageIndex===2&&!!r.board.querySelector('.sw');
   r.prev.click();r.next.click();r.prev.click();tick(24001);
   checks['rapidSwitch'+fields]=r.pageIndex===1&&!r.board.querySelector('.is-pending,.sw,.done')&&r.timers.length===0;
   r.pause.click();ui.setState('records');ui.setState('result');
   checks['pauseSurvivesReturn'+fields]=r.paused&&r.rotation===null;
   r.pageIndex=r.pages.length-1;r.render(false);r.next.click();checks['wrap'+fields]=r.pageIndex===0;
   const rect=r.pager.getBoundingClientRect(),content=r.content.getBoundingClientRect();
   checks['fitsPortrait'+fields]=rect.bottom<=content.bottom+1&&r.pager.scrollWidth<=r.content.clientWidth;
   r.destroy();checks['cleanup'+fields]=r.rotation===null&&r.timers.length===0;
  }finally{Object.assign(window,real);showResult(3);}
 }
 checks.singlePageHidden=ui.importResult.pager.hidden;
 return checks;
});
console.log(result);for(const [key,value]of Object.entries(result))assert.ok(value,key);
