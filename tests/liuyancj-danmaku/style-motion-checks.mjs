// Run with globalThis.LIUYAN_TEST_SPACE set to the existing Ego task-space ID.
const {strict: assert} = await import('node:assert');
const task = await taskSpace(globalThis.LIUYAN_TEST_SPACE), page = task.page('p1');
const results = [];
const check = (name, condition) => { assert.ok(condition, name); results.push(name); };
const cases = [
    {dmrolltype:'1',dmtype:'1',dmpos:'2',needavatar:'2',neednickname:'2',needbg:'2',fontsize:'32',dmspeed:'1'},
    {dmrolltype:'2',dmtype:'2',dmpos:'3',needavatar:'1',neednickname:'1',needbg:'1',fontsize:'38',dmspeed:'2'},
    {dmrolltype:'3',dmtype:'2',dmpos:'1',needavatar:'1',neednickname:'2',needbg:'1',bgcolortype:'2',vwidth:'360'},
    {dmrolltype:'4',dmtype:'1',dmpos:'4',needavatar:'2',neednickname:'1',needbg:'1',fontcolortype:'2',dmspeed:'3',ismiji:'2',configDelay:'600'}
];
for (const config of cases) {
    await page.goto('http://127.0.0.1:8766/?'+new URLSearchParams(config));
    await page.waitForFunction(() => require.defined('screenliuyancj') && require('screenliuyancj').danmaku?.manager);
    check('Backend template/settings preserved for direction '+config.dmrolltype, await page.evaluate(() => {
        const d=require('screenliuyancj').danmaku,f=require('fulldm'),c=fixtureConfig;
        const data={id:'style-check',type:'1',nickname:'样式检查',avatar:'/static/images/sys/prizeimg.png',content:'后台设置的留言'};
        const original=Math.random; Math.random=()=>0.25;
        const actual=document.createElement('div'),expected=document.createElement('div');
        try {d.renderBarrage({data},actual);f.rebindBarragedom({data:Object.assign({},data)},expected);}
        finally {Math.random=original;}
        d.field.appendChild(actual);
        const content=actual.querySelector('.fulldmBox-msg'),info=actual.querySelector('.fulldmBox-info');
        const css=getComputedStyle(content),area=getComputedStyle(d.field),bg=getComputedStyle(info).backgroundColor;
        const ok=actual.innerHTML===expected.innerHTML && css.fontSize===c.fontsize+'px' &&
            !!actual.querySelector('.fulldmBox-avatar')===(c.needavatar==='1') &&
            actual.textContent.includes('样式检查')===(c.neednickname==='1') &&
            (c.needbg==='2' ? bg==='rgba(0, 0, 0, 0)' : bg!=='rgba(0, 0, 0, 0)') &&
            parseFloat(area.height)===(c.dmpos==='1'?800:400) &&
            parseFloat(area.top)===(c.dmpos==='3'?200:c.dmpos==='4'?400:0) &&
            d.manager.opts.direction===['right','left','bottom','top'][Number(c.dmrolltype)-1] &&
            d.manager.opts.width===c.vwidth && d.manager.opts.interval===(c.ismiji==='2'?1:2) &&
            JSON.stringify(d.manager.opts.times)===JSON.stringify(f.rollspeed()) &&
            d.manager.opts.container===f.container[0] && document.querySelectorAll('.fulldmBox').length===1;
        actual.remove(); return ok;
    }));
    await page.waitForFunction(() => require('screenliuyancj').danmaku.manager.showLength>0);
    await page.click('button[aria-label="开始抽奖"]');
    await page.waitForFunction(() => require('screenliuyancj').getVisualState()==='drawing');
    const acceleration = await page.evaluate(async () => {
        const d=require('screenliuyancj').danmaku, values=[];
        await new Promise(resolve=>{const started=performance.now();function sample(){values.push(d.factor);if(d.factor>=2.2||performance.now()-started>=1800)resolve();else setTimeout(sample,25);}sample();});
        return {distinct:new Set(values.map(x=>x.toFixed(3))).size,values,target:d.drawFactor,times:d.manager.opts.times,base:d.baseTimes};
    });
    check('Continuous acceleration and speed ceiling for direction '+config.dmrolltype,
        acceleration.distinct>8 && acceleration.values.every((v,i,a)=>!i||v>=a[i-1]) &&
        Math.abs(acceleration.values.at(-1)-2.2)<0.001 && acceleration.target===2.2 &&
        acceleration.times.every((time,i)=>Math.abs(time-acceleration.base[i]/2.2)<0.001) &&
        await page.evaluate(()=>require('screenliuyancj').danmaku.feedInterval===600));
    await page.waitForFunction(() => !require('screenliuyancj').startupPending);
    const deceleration=await page.evaluate(async()=>{
        const c=require('screenliuyancj'),d=c.danmaku;
        let b;d.manager.each(x=>{if(!b && x.getMovePercent()<0.6)b=x;});
        const samples=[],started=performance.now();c.stopLottery();
        await new Promise(resolve=>{function sample(){
            const matrix=b?.node?new DOMMatrixReadOnly(getComputedStyle(b.node).transform):null;
            samples.push({t:performance.now()-started,factor:d.factor,opacity:Number(getComputedStyle(d.field).opacity),
                phase:d.field.getAttribute('data-phase'),position:matrix?(d.manager.opts.direction==='left'||d.manager.opts.direction==='right'?matrix.m41:matrix.m42):null});
            if(c.getVisualState()==='result'||performance.now()-started>=1600)resolve();else setTimeout(sample,25);
        }sample();});
        return {samples,direction:d.manager.opts.direction,state:c.getVisualState(),cards:!!document.querySelector('.message-danmaku-card,.message-danmaku-spotlight'),errors};
    });
    const samples=deceleration.samples,sign=['right','bottom'].includes(deceleration.direction)?-1:1;
    check('Smooth deceleration, continuous position and single reveal for direction '+config.dmrolltype,
        samples.length>12 && samples.every((v,i,a)=>!i || (v.factor<=a[i-1].factor && v.opacity<=a[i-1].opacity+0.001)) &&
        samples.some(v=>v.phase==='coasting' && v.opacity>=0.9 && v.factor<=0.31) &&
        samples.some(v=>v.phase==='fading' && v.opacity<0.9) &&
        samples.every((v,i,a)=>!i || v.position===null || a[i-1].position===null ||
            ((v.position-a[i-1].position)*sign>=-2 && Math.abs(v.position-a[i-1].position)<80)) &&
        samples.some(v=>v.position!==null) && deceleration.state==='result' && !deceleration.cards && !deceleration.errors.length);
    await page.click('button[aria-label="关闭结果"]');
    await page.waitForFunction(() => require('screenliuyancj').danmaku.factor===1);
    check('Restores exact backend speed for direction '+config.dmrolltype,await page.evaluate(()=>{
        const d=require('screenliuyancj').danmaku;
        return d.state==='ready' && JSON.stringify(d.manager.opts.times)===JSON.stringify(require('fulldm').rollspeed());
    }));
}
await page.cdp('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
await page.goto('http://127.0.0.1:8766');
await page.waitForFunction(()=>require.defined('screenliuyancj')&&require('screenliuyancj').winnerCountReady);
await page.click('button[aria-label="开始抽奖"]');
await page.waitForFunction(()=>require('screenliuyancj').getVisualState()==='drawing'&&!require('screenliuyancj').startupPending);
check('Reduced motion retains baseline speed',await page.evaluate(()=>require('screenliuyancj').danmaku.factor===1));
await page.click('button[aria-label="停止抽奖"]');
check('Reduced motion reveals directly without intermediate cards',await page.evaluate(()=>require('screenliuyancj').getVisualState()==='result'&&!document.querySelector('.message-danmaku-spotlight')));
await page.cdp('Emulation.setEmulatedMedia',{features:[]});
await page.goto('http://127.0.0.1:8766');
await page.waitForFunction(()=>require.defined('screenliuyancj')&&require('screenliuyancj').winnerCountReady);
await page.click('button[aria-label="开始抽奖"]');
await page.waitForFunction(()=>require('screenliuyancj').getVisualState()==='drawing'&&!require('screenliuyancj').startupPending);
check('Hidden-page fallback reveals once when animation frames stop',await page.evaluate(async()=>{
    const c=require('screenliuyancj'),d=c.danmaku,before=effects.filter(x=>x==='sendLuckerTpl').length;
    c.stopLottery();
    Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'));
    clearTimeout(d.animationTimer);d.animationTimer=null;
    await new Promise(resolve=>setTimeout(resolve,1500));
    const ok=c.visualState==='result'&&!c.animationLockPending&&effects.filter(x=>x==='sendLuckerTpl').length===before+1;
    delete document.hidden;document.dispatchEvent(new Event('visibilitychange'));
    return ok;
}));
console.log(JSON.stringify({passed:results.length,results},null,2));
