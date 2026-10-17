// Execute the real stopLottery entry point with local result data and stubbed external dependencies.
const {strict:assert}=await import('node:assert');
const task=await taskSpace(globalThis.RESULT_TEST_SPACE),page=task.page('p1');
await page.cdp('Network.enable');await page.cdp('Network.setCacheDisabled',{cacheDisabled:true});
await page.goto('http://127.0.0.1:8767/tests/importcj-result/');
await page.waitForFunction(()=>window.showResult&&ui.importResult);
const checks=await page.evaluate(async()=>{
    const source=await(await fetch('/public/static/js/screenjs/screenimportcj.js')).text();
    const results=[];
    for(const flytype of ['1','5','6']){
        showResult(0);ui.setState('drawing');
        let controller,videoPlays=0,videoPauses=0,legacyWrites=0,scrolls=0,resultsShown=0,stops=0;
        const video={play(){videoPlays++;},pause(){videoPauses++;}};
        function $(selector){const chain={length:selector==='.firevideo2'?1:0,0:video};
            for(const method of ['show','hide','unbind','bind','addClass','removeClass','text','css'])chain[method]=()=>chain;
            chain.html=()=>{legacyWrites++;return chain;};return chain;}
        const THREE={Object3D:function(){}};
        const define=(name,deps,factory)=>{controller=factory({ajaxSubmit(){throw Error('No business API permitted');}},{},()=>'',{},()=>{},THREE,{},null,null,null,null,null);};
        const callbacks=[];
        new Function('define','$','isroundcj','isautoscroll','setTimeout',source)(define,$,'0','1',fn=>callbacks.push(fn));
        const setResult=ui.setResult.bind(ui);ui.setResult=(data,prize)=>{resultsShown++;return setResult(data,prize);};
        Object.assign(controller,{flytype,isstart:'2',visualState:'drawing',prizeInfo:[{stoptype:'1'}],prizeIndex:0,
            currentLuckerList:[{id:1,datafield1:'A09',datafield2:'020902'}],currentLuckerHtml:'legacy result',stageUi:ui,
            getPrize:()=>({prizename:'测试礼品'}),stoprollitem(){stops++;},haloStage:{stop(){}},danmakuStage:{setResult(){}},
            setVisualState(state){this.visualState=state;ui.setState(state);},initautoScroll(){scrolls++;}});
        const first=controller.stopLottery(),second=controller.stopLottery();callbacks.forEach(fn=>fn());
        const card=ui.importResult.board.querySelector('.import-result-card');
        results.push({flytype,first,second,resultsShown,stops,videoPlays,videoPauses,legacyWrites,scrolls,
            concealed:getComputedStyle(card).visibility==='hidden'&&card.textContent==='',state:controller.isstart});
    }
    showResult(3);return results;
});
console.log(checks);
for(const c of checks){assert.equal(c.first,true);assert.equal(c.second,false);assert.equal(c.resultsShown,1);assert.equal(c.videoPlays,0);assert.equal(c.videoPauses,1);assert.equal(c.legacyWrites,0);assert.equal(c.scrolls,0);assert.equal(c.concealed,true);assert.equal(c.state,'3');}
console.log('PASS: real stopLottery path, one result renderer, no legacy video or hidden result animation, repeat stop ignored');
