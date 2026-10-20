// Real ResultView + dedicated stage; synthetic candidates only, no business API.
const {strict:assert}=await import('node:assert');
const task=await taskSpace(globalThis.RESULT_TEST_SPACE),page=task.page('p1');
await page.cdp('Network.enable');await page.cdp('Network.setCacheDisabled',{cacheDisabled:true});
await page.goto('http://127.0.0.1:8767/tests/importcj-result/jump.html');
await page.waitForFunction(()=>window.showJump&&ui.importResult);
const results=await page.evaluate(()=>{
    const originals={setTimeout,clearTimeout,setInterval,clearInterval,now:Date.now,random:Math.random};
    const jobs=new Map();let now=0,id=100000,random=0;
    Date.now=()=>now;Math.random=()=>((random++%29)+.1)/30;
    window.setTimeout=(fn,ms=0)=>{jobs.set(++id,{fn,time:now+ms,repeat:0});return id;};
    window.setInterval=(fn,ms)=>{jobs.set(++id,{fn,time:now+ms,repeat:ms});return id;};
    window.clearTimeout=window.clearInterval=id=>jobs.delete(id);
    function tick(ms){const to=now+ms;let safety=0;while(true){const next=[...jobs].filter(([,j])=>j.time<=to).sort((a,b)=>a[1].time-b[1].time)[0];if(!next)break;if(++safety>10000)throw Error('Clock runaway');const [key,j]=next;now=j.time;if(j.repeat)j.time+=j.repeat;else jobs.delete(key);j.fn();}now=to;}
    const report=[],check=(ok,label)=>{if(!ok)throw Error(label);};
    const cards=()=>[...ui.importResult.board.querySelectorAll('.import-result-card')];
    const values=c=>[...c.querySelectorAll('[data-field-value]')].map(n=>n.textContent).join('|');
    try{
        for(const fields of [1,2,3,4])for(const count of [1,3,6,10,20,40])for(const theme of ['gold','transparent','softgold','ivory','custom']){
            showJump({fields,count,config:{resultcardmode:theme,resultcardcolor:'#e1eeff',resultfieldscale1:'125',resultfieldscale2:'150'}});
            const r=ui.importResult,initial=cards(),nodes=initial.slice(),initialText=initial.map(values),sizes=initial.map(c=>c.querySelector('[data-field-value]').style.fontSize);
            check(initial.length===r.pages[0].winners.length,'first page capacity');
            check(initial.every(c=>c.classList.contains('is-jumping'))&&!r.el.hidden,'visible jump cards');
            check(!r.board.innerHTML.includes('中奖嘉宾')&&!r.board.innerHTML.includes('W001'),'no confirmed values in any DOM attributes');
            check(initial.every(c=>getComputedStyle(c.querySelector('[data-field-value]')).color==='rgb(237, 246, 255)'),'jump text overrides result colors');
            check(initial.every(c=>getComputedStyle(c).borderLeftStyle==='solid'&&getComputedStyle(c).borderTopColor==='rgb(112, 188, 255)'&&getComputedStyle(c).backgroundImage.includes('27, 71, 151')),'all result themes use blue jump border and background');
            check(r.pager.hidden&&r.rotation===null,'no premature pagination');
            tick(90);check(initial.some((c,i)=>values(c)!==initialText[i]),'candidates tick');
            check(initial.every((c,i)=>c.querySelector('[data-field-value]').style.fontSize===sizes[i]),'stable typography');
            r.layout();check(cards().every((c,i)=>c===nodes[i]),'same-page resize preserves nodes');
            check(stopJump()===true&&stopJump()===false,'one stop');
            ui.update({state:'drawing',primaryText:'停止抽奖',primaryEnabled:true});
            check(ui.btnPrimary.disabled&&ui.btnPrimaryText.textContent==='揭晓中…'&&ui.btnRecords.disabled,'polling cannot unlock gate');
            tick(499);check(r.revealedWinners.size===0,'first waits 500ms');
            tick(1);check(r.revealedWinners.size===1&&values(nodes[0]).startsWith('W001'),'first winner');
            const locked=values(nodes[0]);tick(90);check(values(nodes[0])===locked,'revealed data remains locked');
            if(initial.length>1)check(nodes.slice(1).every(c=>c.classList.contains('is-jumping')),'remaining cards still jumping');
            tick(3000);check(ui.state==='result'&&jumpEvents.join(',')==='first,complete','one completion');
            check(cards().every((c,i)=>c===nodes[i])&&!r.board.querySelector('.is-jumping'),'same cards become results');
            check(cards().every((c,i)=>values(c)===r.pages[0].winners[i].displayFields.map(f=>f.value).join('|')),'all confirmed values');
            check(!ui.btnPrimary.disabled,'result gate restored');
            check(JSON.stringify(jumpWinners).includes('W001'),'input not overwritten');
            report.push({fields,count,theme});
        }
        showJump({count:31,groups:true});let r=ui.importResult;
        check(r.pages[0].winners.length===2&&cards().length===2,'small first prize group');
        stopJump();tick(920);check(ui.state==='result','group reveal completion');
        tick(6499);check(r.pageIndex===0,'2500ms buffer then 4000ms countdown');
        tick(1);check(r.pageIndex===1&&!r.board.querySelector('.is-jumping'),'subsequent page uses normal confirmed reveal');
        tick(3000);ui.setState('records');ui.setState('result');check(!r.board.querySelector('.is-jumping,.is-pending,.done'),'return from records static');
        // A real capacity change must not re-randomize a winner already revealed.
        ui.root.style.cssText='width:375px;height:812px';showJump({count:40});r=ui.importResult;stopJump();tick(500);
        const first=cards()[0],locked=values(first),beforeCapacity=r.pages[0].capacity;
        // Pick a target that really changes the page capacity under the current plan.
        for(const [w,h] of [[1920,1080],[1080,1920],[2560,1080],[1024,768]]){ui.root.style.cssText='width:'+w+'px;height:'+h+'px';r.layout();if(r.pages[0].capacity!==beforeCapacity)break;}
        check(r.pages[0].capacity!==beforeCapacity,'resize changes capacity');check(cards()[0]===first&&values(first)===locked,'lock survives repagination');
        r.updateJumpCandidates([{datafield1:'NEW',datafield2:'新增候选',datafield3:'研发',datafield4:'133****1234'}]);tick(90);
        check(values(first)===locked&&cards().slice(1).some(c=>values(c).startsWith('NEW')),'candidate updates affect only unlocked cards');
        tick(4000);check(ui.state==='result'&&jumpEvents.length===2,'resized completion');
        for(const [width,height] of [[1920,1080],[1080,1920],[1280,800]])for(const zoom of [.5,1,1.5]){
            ui.root.style.cssText='width:'+width+'px;height:'+height+'px;zoom:'+zoom;showJump({count:40});r=ui.importResult;
            const nodes=cards();stopJump();tick(500);const locked=values(nodes[0]);
            ui.root.style.zoom=String(zoom+.1);r.layout();
            check(cards().every((card,i)=>card===nodes[i])&&values(nodes[0])===locked,'CSS zoom retains cards and locks');
            ui.stage.querySelector('.screen-stage-dock').style.bottom='160px';r.layout();
            check(values(cards()[0])===locked,'dock movement retains lock');
            const board=r.board.getBoundingClientRect();
            for(const card of cards()){
                card.classList.remove('done');const rect=card.getBoundingClientRect();
                check(rect.left>=board.left-1&&rect.right<=board.right+1&&rect.bottom<=board.bottom+1,'jump card stays in resized board');
            }
            tick(4000);check(ui.state==='result','dock change still completes');
        }
        ui.root.style.cssText='width:100%;height:100%';
        showJump({count:3,candidates:[{datafield1:'',datafield2:'回退姓名',datafield3:'运营部',datafield4:'139****0001'},{datafield1:'C99',datafield2:'另一个姓名',datafield3:'市场部',datafield4:'139****0002'}]});r=ui.importResult;
        const outer=cards(),size=outer.map(c=>c.style.height);tick(900);
        check(cards().every((c,i)=>c===outer[i]&&c.style.height===size[i]),'mixed field structures keep outer dimensions');
        check([...r.board.querySelectorAll('[data-field-value]')].every(n=>parseFloat(n.style.fontSize)>0),'fallback field typography measured');
        stopJump();tick(2000);check(cards().every(c=>c.querySelector('[data-field-value="0"]').getAttribute('data-field-index')==='0'),'revealed field mapping restored');
        // Hidden document completes an in-flight reveal, but only pauses candidate ticks.
        const hidden=Object.getOwnPropertyDescriptor(document,'hidden');
        showJump({count:6});r=ui.importResult;
        Object.defineProperty(document,'hidden',{configurable:true,value:true});r.onVisibility();
        check(![...jobs.values()].some(j=>j.repeat===90),'hidden tick suspended');
        Object.defineProperty(document,'hidden',{configurable:true,value:false});r.onVisibility();check([...jobs.values()].some(j=>j.repeat===90),'visible tick resumed');
        stopJump();Object.defineProperty(document,'hidden',{configurable:true,value:true});r.onVisibility();
        check(ui.state==='result'&&jumpEvents.join(',')==='first,complete'&&!r.board.querySelector('.is-jumping'),'hidden reveal completes');
        if(hidden)Object.defineProperty(document,'hidden',hidden);else delete document.hidden;
        showJump({count:6});stopJump();const retired=ui.importResult;ui.destroy();tick(5000);check(jumpEvents.length===0&&!retired.jump,'destroy invalidates callbacks');
        showJump({count:6});stopJump();ui.setState('ready');tick(5000);check(jumpEvents.length===0&&!ui.importResult.jump,'ready cancels callbacks');
        // Empty primaries, selected field order, long values, zeroes and markup remain safe text.
        showJump({count:1,config:{resultmainfield:'2',resultextra1:'1',resultextra2:'4',resultextra3:'3'},candidates:[{datafield1:'C09',datafield2:'',datafield3:'市场部',datafield4:'长'.repeat(120)}],winners:[{datafield1:0,datafield2:'',datafield3:'<img src=x onerror=alert(1)>',datafield4:'138****0123'}]});
        r=ui.importResult;stopJump();tick(500);check(cards()[0].querySelector('[data-field-value]').textContent==='0','empty main fallback keeps zero');check(!r.board.querySelector('img'),'no markup injection');
        return {matrixCases:report.length,edgeCases:'timing, groups, resize, polling, privacy, hidden, cancel, safe fields'};
    }finally{
        if(window.ui)ui.destroy();Object.assign(window,{setTimeout:originals.setTimeout,clearTimeout:originals.clearTimeout,setInterval:originals.setInterval,clearInterval:originals.clearInterval});Date.now=originals.now;Math.random=originals.random;showJump({count:6});
    }
});
console.log(results);assert.equal(results.matrixCases,120);
await page.cdp('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
assert.ok(await page.evaluate(()=>{showJump({count:6});stopJump();return ui.state==='result'&&jumpEvents.join(',')==='first,complete'&&!ui.importResult.board.querySelector('.is-jumping');}));
await page.cdp('Emulation.setEmulatedMedia',{features:[]});
console.log('PASS: data jump presentation, lifecycle and reduced motion');
