const {strict:assert}=await import('node:assert');
const task=await taskSpace(globalThis.RESULT_TEST_SPACE),page=task.page('p1');
await page.cdp('Network.enable');await page.cdp('Network.setCacheDisabled',{cacheDisabled:true});
await page.goto('http://127.0.0.1:8767/tests/importcj-result/');
await page.waitForFunction(()=>window.showResult&&ui.importResult);
const result=await page.evaluate(()=>{
    const errors=[];let scenarios=0;
    for(const count of [3,6,10,40]){
        ui.root.style.cssText='width:1280px;height:900px';showResult(count);
        for(let width=1280;width<=2400;width+=20){
            ui.root.style.width=width+'px';const r=ui.importResult;r.layout();r.stopAll();
            let expected=null,seen=[];
            for(let p=0;p<r.pages.length;p++){
                r.pageIndex=p;r.render(false);
                for(const card of r.board.querySelectorAll('.import-result-card')){
                    card.classList.remove('done');
                    const rect=card.getBoundingClientRect(),board=r.board.getBoundingClientRect();
                    const size=[rect.width,rect.height,getComputedStyle(card.querySelector('.import-result-main')).fontSize];
                    if(expected&&JSON.stringify(expected)!==JSON.stringify(size))errors.push({width,count,p,problem:'pagination changes card size'});
                    expected=size;
                    if(rect.left<board.left-1||rect.right>board.right+1||rect.top<board.top-1||rect.bottom>board.bottom+1)errors.push({width,count,p,problem:'card outside board'});
                }
                seen.push(...r.pages[p].winners.map(w=>w.recordId));
            }
            if(seen.length!==count||new Set(seen).size!==count)errors.push({problem:'lost or duplicate winners'});
            scenarios++;
        }
    }
    const r=ui.importResult;
    if(getComputedStyle(r.el).backgroundImage!=='none'||getComputedStyle(r.el).backgroundColor!=='rgba(0, 0, 0, 0)')errors.push({problem:'background changed'});
    const style=el=>{let s=getComputedStyle(el);return [s.background,s.borderColor,s.color,s.boxShadow].join('|');};
    const dock=style(ui.stage.querySelector('.screen-stage-dock')),button=style(ui.btnPrimary);
    showResult(3,'message');
    if(dock!==style(ui.stage.querySelector('.screen-stage-dock'))||button!==style(ui.btnPrimary))errors.push({problem:'console style changed'});
    ui.root.style.cssText='width:1280px;height:900px;zoom:1.5';showResult(20);
    ui.importResult.stopAll();ui.importResult.render(false);
    for(const c of ui.importResult.board.querySelectorAll('.import-result-card')){
        c.classList.remove('done');const a=c.getBoundingClientRect(),b=ui.importResult.board.getBoundingClientRect();
        if(a.left<b.left-1||a.right>b.right+1||a.top<b.top-1||a.bottom>b.bottom+1)errors.push({problem:'zoom overflows grid'});
    }
    ui.root.style.cssText='width:100%;height:100%';showResult(3);
    return {errors,scenarios};
});
console.log(result);assert.deepEqual(result.errors,[]);
await page.evaluate(()=>ui.root.style.setProperty('--screen-stage-action-bottom','140px'));
await page.waitForFunction(()=>{
    const r=ui.importResult,dock=ui.stage.querySelector('.screen-stage-dock');
    return Math.abs(r.height-(dock.offsetTop-6))<1;
});
assert.ok(await page.evaluate(()=>ui.importResult.content.getBoundingClientRect().bottom<ui.stage.querySelector('.screen-stage-dock').getBoundingClientRect().top),'dock remains outside result stage');
await page.evaluate(()=>{ui.root.style.cssText='width:100%;height:100%';showResult(3);});
console.log('PASS: resize, fixed pagination dimensions, CSS zoom, dock avoidance and preserved theme');
