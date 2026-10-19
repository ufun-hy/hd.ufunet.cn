// Execute real controller methods with a local Promise replacing the draw request.
const {strict:assert}=await import('node:assert');
const task=await taskSpace(globalThis.RESULT_TEST_SPACE),page=task.page('p1');
await page.goto('http://127.0.0.1:8767/tests/importcj-result/jump.html');
await page.waitForFunction(()=>window.showJump&&window.jQuery);
const result=await page.evaluate(async()=>{
    const source=await(await fetch('/public/static/js/screenjs/screenimportcj.js')).text();
    const original={setTimeout,clearTimeout,setInterval,clearInterval,now:Date.now};
    const jobs=new Map();let now=0,id=100000;
    Date.now=()=>now;window.setTimeout=(fn,ms=0)=>{jobs.set(++id,{fn,time:now+ms,repeat:0});return id;};
    window.setInterval=(fn,ms)=>{jobs.set(++id,{fn,time:now+ms,repeat:ms});return id;};
    window.clearTimeout=window.clearInterval=id=>jobs.delete(id);
    const tick=ms=>{const to=now+ms;let n=0;while(true){const next=[...jobs].filter(([,j])=>j.time<=to).sort((a,b)=>a[1].time-b[1].time)[0];if(!next)break;if(++n>10000)throw Error('clock runaway');const [key,j]=next;now=j.time;if(j.repeat)j.time+=j.repeat;else jobs.delete(key);j.fn();}now=to;};
    const check=(value,label)=>{if(!value)throw Error(label);},report=[];
    let controller;
    function setup(stoptype,videoMode,round){
        if(controller)controller.unbindStageFooterOffset();
        if(window.ui)ui.destroy();jobs.clear();
        document.querySelectorAll('.mock-media').forEach(n=>n.remove());
        const metrics={calls:[],masked:0,endPlays:0,drawPlays:0,drawPauses:0,legacy:0,completions:0,bgPlays:0};let resolve,reject;
        const core={ajaxSubmit(url,data){check(url==='/screen/importcj/savelucker','no other API permitted');metrics.calls.push({url,data});return new Promise((a,b)=>{resolve=a;reject=b;});},
            hiddentxt(value){metrics.masked++;return String(value).slice(0,3)+'****'+String(value).slice(-4);},hideFootAndQr(){},bgmusicpause(){},bgmusicplay(){metrics.bgPlays++;},getdom(){return $([]);}};
        function define(name,deps,factory){controller=factory(core,{showMsg(){}},()=>{metrics.legacy++;return '';},{},()=>{},{Object3D:function(){}},{},null,null,null,jumpStageModule,null);}
        new Function('define','$','isroundcj','isautoscroll','maxrollnum','XCV3Config',source)(define,$,round?'1':'0','1',1,{rhdid:1});
        const rows=Array.from({length:3},(_,i)=>({dataid:i+1,datafield1:'C'+i,datafield2:'候选'+i,datafield3:'1381234000'+i}));
        Object.assign(controller,{flytype:'7',isstart:'1',visualState:'ready',datas:rows,fieldconfig:[{fieldname:'座位'},{fieldname:'姓名'},{fieldname:'手机',fieldsecret:'1'}],resultConfig:{},prizeInfo:[{id:1,prizename:'测试礼品',stoptype}],prizeIndex:0,drawCount:3,
            unifiedPrize:{update(){}},getPrize:()=>({id:1,prizename:'测试礼品'}),getCurrentPrizeId:()=>1,validateDrawCount:()=>({ok:true,value:3}),
            syncLegacyDrawCount(){},rememberLastSuccessfulPrize(){},syncPrizeStats(){},getDanmakuSpeedPreset:()=> 'normal',
            getControlSnapshot(){return {state:this.visualState,primaryText:this.visualState==='drawing'?'停止抽奖':'开始抽奖',primaryEnabled:true};},
            initrollitem(){throw Error('new style must not build hidden rolling list');},changerollitem(){throw Error('new style must not run hidden timer');},initShapePR(){throw Error('new style must not use THREE');},
            stopOnerollitem(){throw Error('new style ignores legacy stop type');},stoprollitem(){throw Error('new style has no old rolling timer');},removeautoScroll(){}});
        controller.mountStageUi();window.ui=controller.stageUi;
        const oldSetResult=ui.setResult;ui.setResult=function(){throw Error('completion must not call setResult');};
        const oldState=controller.setVisualState;controller.setVisualState=function(state){if(state==='result')metrics.completions++;return oldState.call(this,state);};
        function media(tag,identity){const node=document.createElement(tag);node.className='mock-media '+identity;if(identity[0]==='#'){node.id=identity.slice(1);node.className='mock-media';}document.body.appendChild(node);node.pause=()=>{if(identity==='#cjingmusic')metrics.drawPauses++;};node.play=()=>{if(identity==='#cjendmusic')metrics.endPlays++;if(identity==='#cjingmusic')metrics.drawPlays++;return identity==='firevideo1'&&videoMode==='reject'?Promise.reject(Error('test media rejection')):Promise.resolve();};return node;}
        const video=videoMode?media('video','firevideo1'):null;
        media('video','firevideo2');media('audio','#cjingmusic');media('audio','#cjendmusic');
        const winners=Array.from({length:3},(_,i)=>({id:i+1,datafield1:'W'+i,datafield2:'中奖'+i,datafield3:'1391234000'+i}));
        const respond=()=>resolve({code:0,msg:{list:round?[{prizename:'一等奖',luckers:winners.slice(0,1)},{prizename:'二等奖',luckers:winners.slice(1)}]:winners,lucker:{prizenum:30,luckernum:3}}});
        return {metrics,video,respond,reject:()=>reject(Error('network')),rows:JSON.stringify(rows),oldSetResult};
    }
    try{
        for(const stoptype of ['1','2','3','4'])for(const videoMode of ['', 'slow','fast','reject']){
            const t=setup(stoptype,videoMode,false),c=controller;
            check(c.startLottery()===true&&c.startLottery()===false&&t.metrics.calls.length===1,'one draw request');
            t.respond();await Promise.resolve();
            check(c.isstart==='2'&&c.visualState==='starting'&&!c.stopLottery(),'cannot stop preparing');
            check(JSON.stringify(c.datas)===t.rows&&t.metrics.masked===6,'candidate copy and one masking pass per record');
            tick(50);await Promise.resolve();
            if(videoMode==='fast')$(t.video).trigger('ended');
            if(videoMode!=='slow')check(c.jumpStarted&&c.visualState==='starting','startup guard remains until 3s');
            tick(2950);
            if(videoMode==='slow'){
                check(c.visualState==='starting'&&!c.jumpStarted&&!c.stopLottery(),'slow video retains starting gate');
                $(t.video).trigger('ended');
            }
            check(c.visualState==='drawing'&&c.jumpStarted,'drawing ready');
            const r=ui.importResult,card=r.board.firstElementChild.firstElementChild;
            check(!r.board.innerHTML.includes('中奖')&&!r.board.innerHTML.includes('1391234'),'no winner leakage before reveal');
            check(c.stopLottery()===true&&c.stopLottery()===false&&c.handlePrimaryAction()===false,'repeat stops ignored');
            check(c.isstart==='2'&&c.visualState==='drawing'&&ui.btnPrimary.disabled,'public state stays drawing during reveal');
            check(c.openRecords()===false&&c.handleCloseAction()===false,'records and close blocked while revealing');
            c.syncSharedControls();check(ui.btnPrimary.disabled&&ui.btnPrimaryText.textContent==='揭晓中…','poll cannot unlock');
            check(t.metrics.endPlays===0&&t.metrics.drawPauses===1,'draw audio stops before first reveal');
            tick(500);check(t.metrics.endPlays===1,'result audio at first reveal');
            if(t.video)$(t.video).trigger('ended');
            tick(1000);check(c.isstart==='3'&&c.visualState==='result'&&t.metrics.completions===1,'complete once');
            check(card===r.board.firstElementChild.firstElementChild&&t.metrics.legacy===0,'no legacy render or first-page rebuild');
            check(r.board.textContent.includes('139****0000')&&!r.board.textContent.includes('13912340000'),'winner privacy');
            check(c.closeResult()===true&&!r.jump&&!r.active,'close cancels session');
            tick(4000);check(t.metrics.completions===1&&t.metrics.endPlays===1,'late callbacks inert');
            report.push({stoptype,videoMode:videoMode||'none'});
        }
        // Multi-prize response uses the actual first group's size, not maxrollnum.
        let t=setup('3','',true);controller.startLottery();t.respond();await Promise.resolve();tick(3000);
        check(ui.importResult.pages[0].winners.length===1&&ui.importResult.total===3,'round normalization');controller.stopLottery();tick(500);check(controller.isstart==='3','one-card first group completes');
        // Late draw response after pagehide/cancel must not create a new session.
        t=setup('1','',false);controller.startLottery();controller.cancelJumpRun();t.respond();await Promise.resolve();tick(5000);check(!ui.importResult.jump&&t.metrics.drawPlays===0,'cancel invalidates network response');
        // A previous round's pending reset/video callbacks cannot affect a new request.
        t=setup('1','slow',false);controller.startLottery();t.respond();await Promise.resolve();tick(50);controller.cancelJumpRun();controller.isstart='1';controller.drawRequestPending=false;controller.setVisualState('ready');
        check(controller.startLottery()===true,'new request after cancel');tick(3000);check(controller.drawRequestPending&&controller.visualState==='requesting'&&!controller.jumpStarted,'old timers ignore new run');
        t.respond();await Promise.resolve();tick(3000);$(t.video).trigger('ended');controller.stopLottery();controller.cancelJumpRun();tick(4000);check(t.metrics.completions===0,'cancel reveal callback');
        t=setup('1','',false);controller.startLottery();t.respond();await Promise.resolve();tick(3000);controller.stopLottery();tick(2000);controller.closeResult();controller.startLottery();t.respond();await Promise.resolve();tick(1100);check(t.metrics.bgPlays===0,'previous close cannot resume background audio during new draw');
        // Rejected requests restore ready state and do not start a renderer.
        t=setup('1','',false);controller.startLottery();t.reject();await Promise.resolve();check(!controller.drawRequestPending&&controller.visualState==='ready'&&!ui.importResult.jump,'network failure recovers');
        return {cases:report.length,round:true,staleResponse:true,staleTimers:true,cancelReveal:true,requestFailure:true};
    }finally{
        if(controller){controller.cancelJumpRun();controller.unbindStageFooterOffset();}if(window.ui)ui.destroy();
        document.querySelectorAll('.mock-media').forEach(n=>n.remove());Object.assign(window,{setTimeout:original.setTimeout,clearTimeout:original.clearTimeout,setInterval:original.setInterval,clearInterval:original.clearInterval});Date.now=original.now;showJump({count:6});
    }
});
console.log(result);assert.equal(result.cases,16);
console.log('PASS: actual start/stop controller, one mocked request, video gates, privacy, legacy stop types, stale callbacks and cancellation');
