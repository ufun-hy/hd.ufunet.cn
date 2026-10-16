// Run with: { printf 'globalThis.RESULT_TEST_SPACE=12;\n'; cat tests/importcj-result/browser-checks.mjs; } | ego-browser nodejs
const {strict:assert}=await import('node:assert');
const task=await taskSpace(globalThis.RESULT_TEST_SPACE);
const page=task.page('p1');
await page.goto('http://127.0.0.1:8767/tests/importcj-result/');
await page.waitForFunction(()=>window.showResult && window.ui);
const matrix=await page.evaluate(()=>{
    const errors=[],results=[];
    const sizes=[[1920,1080],[1920,1200],[1024,768],[2560,1080],[1080,1920],[375,812]];
    for(const [w,h] of sizes){
        ui.root.style.cssText='width:'+w+'px;height:'+h+'px;';
        for(const count of [1,2,3,4,5,6,7,10,12,13,30,31]){
            showResult(count);
            const r=ui.importResult;
            const flattened=r.pages.flatMap(p=>p.winners);
            if(flattened.length!==count || new Set(flattened.map(w=>w.recordId)).size!==count)errors.push([w,h,count,'lost/duplicate winners']);
            if(r.pages.some(p=>p.winners.length>12 || p.layout.main<h*.045-.1)) errors.push([w,h,count,'page capacity/minimum font']);
            for(let pi=0;pi<r.pages.length;pi++){
                r.pageIndex=pi;r.render(false);
                for(const el of r.board.querySelectorAll('.import-result-card')){
                    const rect=el.getBoundingClientRect(), board=r.board.getBoundingClientRect();
                    if(rect.left<board.left-2 || rect.right>board.right+2 || rect.top<board.top-2 || rect.bottom>board.bottom+2)errors.push([w,h,count,'card outside board',pi]);
                    for(const t of el.querySelectorAll('.import-result-main,.import-result-extras')){
                        if(t.scrollWidth>t.clientWidth+2 || t.getBoundingClientRect().bottom>rect.bottom-2)errors.push([w,h,count,'text overflow',pi]);
                    }
                }
            }
            results.push({w,h,count,pages:r.pages.length,cols:r.pages[0].layout.cols});
            if(JSON.stringify(fixtureInput)!==fixtureOriginal) errors.push([w,h,count,'mutated source']);
        }
    }
    return {errors,scenarios:results.length,results};
});
console.log({errors:matrix.errors,scenarios:matrix.scenarios});
assert.deepEqual(matrix.errors,[]);
const edge=await page.evaluate(()=>{
    const out={};
    ui.root.style.cssText='width:1920px;height:1080px';
    showResult(12,'long');let r=ui.importResult;
    out.long=r.pages.length>1 && r.pages.every(p=>p.winners.every(w=>w.extras.length===3));
    out.longOverflow=[...r.board.querySelectorAll('.import-result-card')].every(c=>c.scrollHeight<=c.clientHeight+2 && c.scrollWidth<=c.clientWidth+2);
    showResult(1,'zero');out.zero=ui.importResult.el.textContent.includes('000012')&&ui.importResult.pages[0].winners[0].name==='0';
    showResult(1,'empty');out.empty=ui.importResult.el.textContent.includes('信息缺失');
    showResult(1,'xss');out.xss=!ui.importResult.board.querySelector('img,script');
    showResult(3,'',{resultmainfield:'2',resultextra1:'1',resultextra2:'1',resultextra3:'0'});
    out.mapping=ui.importResult.pages[0].winners[0].name==='020902' && JSON.stringify(ui.importResult.pages[0].winners[0].extras)==='["A09"]';
    showResult(31);r=ui.importResult;r.changePage(1,true);out.manual=r.paused&&r.timer===null&&r.pageIndex===1;
    r.pause.click();out.resume=!r.paused&&r.timer!==null;
    const old=r.pageIndex;ui.setState('records');out.records=r.timer===null&&r.el.hidden;
    ui.setState('result');out.return=r.pageIndex===old&&!r.el.querySelector('.is-revealing');
    ui.setState('ready');out.ready=r.el.hidden&&r.timer===null;
    showResult(13,'groups');r=ui.importResult;
    out.groups=r.pages[0].group.awardname==='一等奖'&&r.pages[1].group.awardname==='二等奖'&&r.total===13;
    showResult(3,'message');out.message=!ui.importResult&&!!ui.resultPanel.querySelector('.screen-stage-result-avatar')&&ui.resultPanel.textContent.includes('留言内容保持原样');
    showResult(31);r=ui.importResult;ui.destroy();out.destroy=r.timer===null&&!document.querySelector('.import-result');
    showResult(3);
    return out;
});
console.log(edge);for(const [name,ok] of Object.entries(edge))assert.ok(ok,name);
console.log('PASS: layout matrix and result lifecycle/field/compatibility checks');
