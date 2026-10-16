// Run using the same RESULT_TEST_SPACE binding as browser-checks.mjs.
const {strict:assert}=await import('node:assert');
const task=await taskSpace(globalThis.RESULT_TEST_SPACE),page=task.page('p1');
await page.goto('http://127.0.0.1:8767/tests/importcj-result/');
await page.waitForFunction(()=>window.showResult&&ui.importResult);
const result=await page.evaluate(()=>{
    const errors=[];
    for(const [count,cols] of [[3,3],[4,2],[6,3],[10,5]]){
        ui.root.style.cssText='width:1280px;height:900px';showResult(count);
        let previous=0;
        for(let width=1280;width<=2400;width+=20){
            ui.root.style.width=width+'px';const r=ui.importResult;r.layout();
            const l=r.pages[0].layout;
            if(l.cols!==cols)errors.push({count,width,problem:'column jump',cols:l.cols});
            if(previous && (l.width<previous-.1||l.width-previous>20/cols+.1))errors.push({count,width,problem:'discontinuous width'});
            if(r.el.querySelector('.is-revealing,.is-entering'))errors.push({count,width,problem:'resize replays animation'});
            previous=l.width;
        }
    }
    showResult(31);let r=ui.importResult;
    if(new Set(r.pages.map(p=>p.layout.width)).size!==1)errors.push({problem:'last page enlarges cards'});
    let paginationScenarios=0;
    for(const [width,height] of [[1920,1080],[1280,900],[375,812]]){
        for(const longText of [false,true]){
            ui.root.style.cssText='width:'+width+'px;height:'+height+'px';
            showResult(31,'groups');
            const groups=JSON.parse(fixtureOriginal);
            groups.push({awardname:'特别奖',prizename:'特别奖礼品',luckers:[{id:32,datafield1:longText?'研发中心嘉宾十二号':'C01',datafield2:'000032',datafield3:longText?'华东区域产品研发部':''}]});
            ui.setResult(groups);r=ui.importResult;r.paused=true;
            let expected=null,seen=[];
            for(let i=0;i<r.pages.length;i++){
                r.pageIndex=i;r.render(false,false);
                for(const card of r.board.children){
                    const rect=card.getBoundingClientRect();
                    const size=[rect.width,rect.height,getComputedStyle(card.querySelector('.import-result-main')).fontSize,getComputedStyle(card.querySelector('.import-result-extra')).fontSize];
                    if(expected && JSON.stringify(size)!==JSON.stringify(expected))errors.push({width,height,longText,page:i,problem:'card size/font changes across prizes/pages',size,expected});
                    expected=size;
                    const board=r.board.getBoundingClientRect();
                    if(rect.left<board.left-2||rect.right>board.right+2||rect.top<board.top-2||rect.bottom>board.bottom+2)errors.push({width,height,longText,page:i,problem:'group card outside board'});
                }
                seen.push(...r.pages[i].winners.map(w=>w.recordId));
            }
            if(seen.length!==32||new Set(seen).size!==32)errors.push({problem:'group pagination loses or duplicates winners'});
            paginationScenarios++;
        }
    }
    if(getComputedStyle(r.el).backgroundImage!=='none'||getComputedStyle(r.el).backgroundColor!=='rgba(0, 0, 0, 0)')errors.push({problem:'background override'});
    const dock=el=>{let s=getComputedStyle(el);return [s.backgroundImage,s.backgroundColor,s.borderColor,s.boxShadow,s.color].join('|');};
    const actual=dock(ui.stage.querySelector('.screen-stage-dock'));
    const button=dock(ui.btnPrimary);
    showResult(3,'message');
    if(actual!==dock(ui.stage.querySelector('.screen-stage-dock'))||button!==dock(ui.btnPrimary))errors.push({problem:'console override'});
    ui.root.style.cssText='width:100%;height:100%';showResult(3);
    return {errors,widthScenarios:228,paginationScenarios};
});
console.log(result);assert.deepEqual(result.errors,[]);
