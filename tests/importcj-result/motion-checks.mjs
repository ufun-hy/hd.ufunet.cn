const {strict:assert}=await import('node:assert');
const task=await taskSpace(globalThis.RESULT_TEST_SPACE),page=task.page('p1');
await page.goto('http://127.0.0.1:8767/tests/importcj-result/');
await page.waitForFunction(()=>window.showResult&&ui.importResult);
// A local virtual clock verifies exact demo timings without a slow, flaky wall-clock test.
const result=await page.evaluate(()=>{
    const realTimeout=window.setTimeout,realInterval=window.setInterval,realClearTimeout=window.clearTimeout,realClearInterval=window.clearInterval;
    const jobs=new Map();let now=0,id=100000;
    window.setTimeout=(fn,ms=0)=>{jobs.set(++id,{fn,time:now+ms,repeat:0});return id;};
    window.setInterval=(fn,ms)=>{jobs.set(++id,{fn,time:now+ms,repeat:ms});return id;};
    window.clearTimeout=window.clearInterval=id=>jobs.delete(id);
    function tick(to){
        while(true){const next=[...jobs].filter(([,j])=>j.time<=to).sort((a,b)=>a[1].time-b[1].time)[0];if(!next)break;
            const [key,j]=next;now=j.time;if(j.repeat)j.time+=j.repeat;else jobs.delete(key);j.fn();}
        now=to;
    }
    const checks={};
    try{
        ui.root.style.cssText='width:375px;height:812px';showResult(40);
        const r=ui.importResult,cards=[...r.board.querySelectorAll('.import-result-card')],values=cards.map(c=>c.textContent),count=cards.length,step=Math.min(380,2200/count);
        checks.pages=r.pages.length>1;
        checks.noRandomInterval=[...jobs.values()].every(j=>j.repeat!==60);
        tick(1199);checks.wait=cards.every(c=>c.classList.contains('rolling'));
        checks.finalTextFromStart=cards.every((c,i)=>c.textContent===values[i]);
        tick(1200);checks.first=cards[0].classList.contains('done')&&cards[0].classList.contains('sw')&&cards.slice(1).every(c=>c.classList.contains('rolling'));
        checks.particles=r.content.querySelectorAll('.import-result-particle').length===(count>6?8:14);
        const style=getComputedStyle(cards[0]),shine=getComputedStyle(cards[0],'::after');
        checks.pop=style.animationDuration==='0.55s'&&style.animationTimingFunction==='cubic-bezier(0.2, 1.4, 0.4, 1)';
        checks.shine=shine.animationDuration==='1s'&&shine.animationDelay==='0.15s';
        tick(1200+(count-1)*step);checks.sequential=cards.every(c=>c.classList.contains('done'))&&cards.every((c,i)=>c.textContent===values[i]);
        const firstTurn=1200+count*step+2500+4000;
        tick(firstTurn-1);checks.firstPageHold=r.pageIndex===0;
        tick(firstTurn);checks.firstTurn=r.pageIndex===1&&!r.board.querySelector('.rolling,.sw')&&!!r.board.querySelector('.done');
        tick(firstTurn+4000);checks.fourSeconds=r.pageIndex===2%r.pages.length;
        ui.setState('records');checks.cleanup=r.rotation===null&&r.timers.length===0&&!r.content.querySelector('.import-result-particle');
        tick(firstTurn+20000);checks.noHiddenRotation=r.pageIndex===2%r.pages.length;
        ui.destroy();
    }finally{
        window.setTimeout=realTimeout;window.setInterval=realInterval;window.clearTimeout=realClearTimeout;window.clearInterval=realClearInterval;
        showResult(3);
    }
    return checks;
});
console.log(result);for(const [k,v]of Object.entries(result))assert.ok(v,k);
await page.cdp('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
assert.ok(await page.evaluate(()=>{showResult(6);return !ui.importResult.board.querySelector('.rolling,.done,.sw');}));
await page.cdp('Emulation.setEmulatedMedia',{features:[]});
await page.evaluate(()=>{ui.root.style.cssText='width:100%;height:100%';showResult(3);});
console.log('PASS: reference reveal/shine/particle/rotation timings, confirmed values only, cleanup and reduced motion');
