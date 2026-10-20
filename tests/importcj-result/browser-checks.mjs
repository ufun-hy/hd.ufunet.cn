// Compare against the motion reference, adopting the later style reference's
// common 3.8 x 3.2 grid frame, then shortening one/two-field card heights.
// When the reference fits a round on one readable page, the result must match it
// exactly. Denser rounds use the per-page plan: real card height for the field
// count, a floor of 7% of the short side, at most 24 cards and balanced pages.
const {strict:assert}=await import('node:assert');
const task=await taskSpace(globalThis.RESULT_TEST_SPACE),page=task.page('p1');
await page.cdp('Network.enable');await page.cdp('Network.setCacheDisabled',{cacheDisabled:true});
await page.goto('http://127.0.0.1:8767/tests/importcj-result/');
await page.waitForFunction(()=>window.showResult&&ui.importResult);
const result=await page.evaluate(async()=>{
    const source=await (await fetch('./reference.html')).text(),errors=[];
    const sizes=[[1920,1080],[1920,1200],[1024,768],[2560,1080],[1080,1920],[375,812]];
    let scenarios=0;
    for(const f of [1,2,3,4])for(const [w,h] of sizes)for(const count of [1,2,3,4,6,10,12,15,20,31,40,60]){
        ui.root.style.cssText='width:'+w+'px;height:'+h+'px';showResult(count,'',{},f);
        const r=ui.importResult;r.stopAll();
        const occupied=h-ui.stage.querySelector('.screen-stage-dock').offsetTop;
        const ref=document.createElement('iframe');ref.style.cssText='position:absolute;left:-10000px;top:0;border:0;width:'+w+'px;height:'+h+'px';
        const html=source.replace('let n=3,f=4,ratio=16/9,','let n='+count+',f='+f+',ratio='+w+'/'+h+',')
            .replace('WF=[2.6,2.8,3.8,3.8]', 'WF=[3.8,3.8,3.8,3.8]')
            .replace('ch/HF[f-1]', 'ch/3.2')
            .replace("const barH=$('bar').offsetHeight;",'const barH='+occupied+';')
            .replace('grid.style.cssText=', 'window.expected={W,H,u,m,lay,pages,cardW,cardH};grid.style.cssText=');
        await new Promise(resolve=>{ref.onload=resolve;ref.srcdoc=html;document.body.appendChild(ref);});
        const e=ref.contentWindow.expected;
        if(!e)throw Error('Reference did not execute');
        const same=(actual,expected,label)=>{if(Math.abs(actual-expected)>.05)errors.push({w,h,count,label,actual,expected});};
        same(r.width,e.W,'stage width');same(r.height,e.H,'stage height');
        const floor=Math.max(32,.07*Math.min(r.width,r.height)),referenceFits=e.pages===1&&e.lay.fs>=floor;
        if(referenceFits){
            same(r.pages.length,1,'page count');same(r.pages[0].capacity,e.m,'capacity');
            for(const k of ['c','r','g','cw','ch','fs'])same(r.pages[0].layout[k],e.lay[k],'layout '+k);
        }else{
            if(r.pages.length>e.pages)errors.push({f,w,h,count,problem:'more pages than reference',actual:r.pages.length,expected:e.pages});
            const sizes=r.pages.map(p=>p.winners.length);
            if(Math.max(...sizes)-Math.min(...sizes)>1)errors.push({f,w,h,count,problem:'unbalanced pages',sizes:sizes.join('+')});
            if(Math.max(...sizes)>24)errors.push({f,w,h,count,problem:'page over 24 cards',sizes:sizes.join('+')});
            for(const p of r.pages)if(p.capacity>1&&p.layout.fs<floor-.05)errors.push({f,w,h,count,problem:'font below floor',fs:p.layout.fs,floor});
        }
        const seen=[];
        for(let p=0;p<r.pages.length;p++){
            r.pageIndex=p;r.render(false);
            const lay=r.pages[p].layout,cards=[...r.board.querySelectorAll('.import-result-card')];
            for(const c of cards){
                c.classList.remove('done');
                const rect=c.getBoundingClientRect(),board=r.board.getBoundingClientRect();
                if(referenceFits){same(rect.width,e.cardW,'card width');same(rect.height,e.cardH,'card height');}
                const expectedFont=lay.fs;
                same(parseFloat(getComputedStyle(c.querySelector('.import-result-main')).fontSize),expectedFont*.8,'main font (80% default)');
                same(rect.width/expectedFont,3.8,'card width/font proportion');
                same(rect.height/expectedFont,[1.9,2.4,3.2,3.2][f-1],'card height/font proportion');
                if(f>=2)same(parseFloat(getComputedStyle(c.querySelector('.import-result-secondary')).fontSize),expectedFont*.5,'secondary font');
                if(f>=3)same(parseFloat(getComputedStyle(c.querySelector('.import-result-extra')).fontSize),Math.max(13,lay.fs*.3),'extra font');
                if(c.querySelectorAll('[data-field-value]').length!==f)errors.push({f,w,h,count,problem:'wrong field count'});
                if(rect.left<board.left-1||rect.right>board.right+1||rect.top<board.top-1||rect.bottom>board.bottom+1)errors.push({w,h,count,p,problem:'card outside board'});
            }
            seen.push(...r.pages[p].winners.map(x=>x.recordId));
        }
        if(seen.length!==count||new Set(seen).size!==count)errors.push({w,h,count,problem:'lost/duplicate winners'});
        if(JSON.stringify(fixtureInput)!==fixtureOriginal)errors.push({problem:'input mutated'});
        ref.remove();scenarios++;
    }
    ui.root.style.cssText='width:100%;height:100%';showResult(3);
    return {errors,scenarios};
});
console.log(result);assert.deepEqual(result.errors,[]);
const edge=await page.evaluate(()=>{
    const out={};
    showResult(3);out.header=!ui.importResult.header.querySelector('.import-result-award,.import-result-count')&&ui.importResult.title.textContent.includes('小米');
    showResult(1,'zero');ui.importResult.render(false);out.zero=ui.importResult.pages[0].winners[0].name==='0'&&ui.importResult.el.textContent.includes('000012');
    showResult(1,'empty');ui.importResult.render(false);out.empty=ui.importResult.el.textContent.includes('信息缺失');
    showResult(1,'xss');ui.importResult.render(false);out.xss=!ui.importResult.board.querySelector('img,script');
    showResult(3,'',{resultmainfield:'2',resultextra1:'1',resultextra2:'1',resultextra3:'0'});
    out.mapping=ui.importResult.pages[0].winners[0].name==='020902'&&JSON.stringify(ui.importResult.pages[0].winners[0].extras)==='["A09"]';
    showResult(31,'groups');let r=ui.importResult;r.stopAll();
    // Each prize group has its own card size; pages within one group share it.
    const widths={};for(let p=0;p<r.pages.length;p++){r.pageIndex=p;r.render(false);(widths[r.pages[p].groupIndex]=widths[r.pages[p].groupIndex]||new Set()).add(r.board.querySelector('.import-result-card').style.width);}
    out.groups=Object.values(widths).every(set=>set.size===1)&&r.total===31&&r.pages[0].group.awardname==='一等奖'&&r.pages[1].group.awardname==='二等奖';
    const index=r.pageIndex;ui.setState('records');out.records=r.rotation===null&&r.timers.length===0&&r.el.hidden;
    ui.setState('result');out.return=r.pageIndex===index&&!r.el.querySelector('.is-pending,.done,.sw');
    ui.setState('ready');out.ready=r.el.hidden&&r.rotation===null&&r.timers.length===0;
    showResult(3,'message');out.message=!ui.importResult&&!!ui.resultPanel.querySelector('.screen-stage-result-avatar')&&ui.resultPanel.textContent.includes('留言内容保持原样');
    showResult(31);r=ui.importResult;ui.destroy();out.destroy=r.rotation===null&&r.timers.length===0&&!document.querySelector('.import-result');
    showResult(0);out.emptyResult=ui.importResult.el.textContent.includes('暂无中奖结果');
    showResult(3);return out;
});
console.log(edge);for(const [key,value] of Object.entries(edge))assert.ok(value,key);

// Prize images show for any winner count/orientation; a failed URL stays hidden
// in that round and is requested again by the next round.
const image=await page.evaluate(async()=>{
    const out={},wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
    const next=(img,type)=>Promise.race([new Promise(resolve=>img.addEventListener(type,()=>resolve(true),{once:true})),wait(3000).then(()=>false)]);
    ui.root.style.cssText='width:1080px;height:1920px';showResult(20);let r=ui.importResult;
    out.manyPortrait=!r.image.hidden&&r.image.getAttribute('src')==='/public/static/images/sys/prizeimg.png';
    ui.root.style.cssText='width:100%;height:100%';
    const bad='/public/static/images/sys/__missing_prize__.png',winners=[{id:1,datafield1:'A01'}];
    ui.setResult(winners,{prizename:'失败重试',prizeimg:bad});r=ui.importResult;
    out.firstFailure=await next(r.image,'error');
    r.layout();r.changePage&&r.render(false);out.failedStaysHidden=r.image.hidden;
    const retry=next(r.image,'error');ui.setResult(winners,{prizename:'失败重试',prizeimg:bad});
    out.nextRoundRetries=await retry;out.retryVisibleUntilFailure=r.image.getAttribute('src')===bad;
    const load=next(r.image,'load');ui.setResult(winners,{prizename:'恢复',prizeimg:'/public/static/images/sys/prizeimg.png'});
    out.recovered=await load&&!r.image.hidden;
    showResult(3);return out;
});
console.log(image);for(const [key,value] of Object.entries(image))assert.ok(value,key);
