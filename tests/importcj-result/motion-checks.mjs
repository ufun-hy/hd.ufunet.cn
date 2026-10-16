// Run in the same Ego task space after browser-checks.mjs.
const {strict:assert}=await import('node:assert');
const task=await taskSpace(globalThis.RESULT_TEST_SPACE),page=task.page('p1');
await page.goto('http://127.0.0.1:8767/tests/importcj-result/');
await page.waitForFunction(()=>window.showResult && ui.importResult);
assert.ok(await page.evaluate(()=>{
    showResult(31,'',{resultinterval:4});const r=ui.importResult;
    window.firstCards=r.board.firstChild;
    const end=Math.max(...[...r.board.children].map(c=>parseFloat(c.style.getPropertyValue('--ir-delay'))+.85));
    return end<=2 && r.pages.length>1 && r.interval===4000 && r.timer!==null;
}),'bounded row reveal and rotation timer');
await page.waitForFunction(()=>ui.importResult.pageIndex===1,undefined,{timeout:9000});
assert.ok(await page.evaluate(()=>!ui.importResult.el.querySelector('.is-revealing')),'no reveal replay on auto page');
await page.click('.import-result-page-button:nth-child(1)');
assert.ok(await page.evaluate(()=>ui.importResult.paused && ui.importResult.timer===null && ui.importResult.pageIndex===0),'manual click pauses rotation');
assert.ok(await page.evaluate(()=>{
    const r=ui.importResult;ui.root.style.zoom='1.5';r.layout();
    const b=r.board.getBoundingClientRect();
    return [...r.board.children].every(c=>{const x=c.getBoundingClientRect();return x.left>=b.left-2&&x.right<=b.right+2&&x.bottom<=b.bottom+2;});
}),'CSS zoom stays within local coordinate layout');
await page.evaluate(()=>{ui.root.style.zoom='';ui.root.style.setProperty('--screen-stage-action-bottom','140px');});
await page.waitForFunction(()=>parseFloat(ui.importResult.content.style.bottom)>=200);
assert.ok(await page.evaluate(()=>{
    showResult(1,'extreme');const r=ui.importResult,c=r.board.firstChild;
    return c.classList.contains('is-wrapped')&&c.scrollHeight>c.clientHeight&&c.textContent.includes('长字段'.repeat(60))&&c.querySelector('.import-result-main').scrollWidth<=c.clientWidth;
}),'exceptionally long text retains complete scrollable content');
await page.cdp('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
assert.ok(await page.evaluate(()=>{showResult(6);return !ui.importResult.el.querySelector('.is-revealing,.is-entering');}),'reduced motion');
await page.cdp('Emulation.setEmulatedMedia',{features:[]});
await page.evaluate(()=>{ui.root.style.cssText='width:100%;height:100%';showResult(3);});
console.log('PASS: real timer, reveal bound, manual pause, zoom, footer offset, extreme text and reduced motion');
