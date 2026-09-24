// Run: replace globalThis.LIUYAN_TEST_SPACE with an existing numeric Ego task-space ID, then pipe to ego-browser nodejs.
const {strict: assert} = await import('node:assert');
const task = await taskSpace(globalThis.LIUYAN_TEST_SPACE);
const page = task.page('p1');
const results = [];
const check = (name, value) => { assert.ok(value, name); results.push(name); };
await page.goto('http://127.0.0.1:8766');
await page.waitForFunction(() => window.require && require.defined('screenliuyancj') && require('screenliuyancj').winnerCountReady);
await page.waitForFunction(() => document.querySelectorAll('.message-danmaku-field .message-danmaku-card').length >= 4);
check('Ready: real Danmuku rows and one shared Stage/Prize', await page.evaluate(() => {
    const c = require('screenliuyancj');
    return c.danmaku.manager.showLength >= 4 && c.danmaku.messages.length === 24 && c.getRemainingCount() === 7 &&
        document.querySelectorAll('.screen-stage-ui').length === 1 && document.querySelectorAll('.screen-prize').length === 1 && !document.querySelector('.rolldmBox');
}));
check('Socket message deduplication, bounded buffer, HTML safety and moderation deletion', await page.evaluate(() => {
    const c = require('screenliuyancj'), m = {id:'live',type:'1',nickname:'<script>bad</script>',content:'hello<img src=x onerror="window.__xss=1"><script>window.__xss=1</script>'};
    socketCallback({type:'liuyancjmsg',messages:[m,m]});
    const duplicateOK = c.danmaku.messages.filter(x=>x.id==='live').length === 1;
    const n=document.createElement('div'); c.danmaku.card(n,m);
    const safe = !n.querySelector('script,[onerror]') && !window.__xss;
    socketCallback({type:'screendeldm',msgid:'live'});
    const removed = !c.danmaku.messages.some(x=>x.id==='live');
    for(let i=0;i<400;i++)c.danmaku.add({id:'burst'+i,nickname:'用户',content:'批量留言'});
    return duplicateOK && safe && removed && c.danmaku.messages.length === 300 && c.danmaku.manager.stashLength <= 12 && c.danmaku.pendingMessages.length <= 30;
}));
check('Common danmaku switch delegates without starting a second manager', await page.evaluate(() => {
    const f=require('fulldm'),d=require('screenliuyancj').danmaku;
    f.stop(); const off = !d.isVisible() && !d.manager.runing;
    f.start(); return off && d.isVisible() && d.manager.runing && !f.dmmanager;
}));
await page.click('button[aria-label="开始抽奖"]');
await page.waitForFunction(() => require('screenliuyancj').danmaku.factor === 4);
check('Only original draw endpoint, duplicate start refused, acceleration active', await page.evaluate(() => {
    const c=require('screenliuyancj');
    return c.getVisualState()==='drawing' && c.startLottery()===false && c.danmaku.factor===4 && calls.filter(x=>/savelucker$/.test(x.url)).length===1;
}));
await page.click('button[aria-label="停止抽奖"]');
check('Locking gates duplicate stop, prize changes and Records', await page.evaluate(() => {
    const c=require('screenliuyancj');
    return c.animationLockPending && c.stopLottery()===false && c.selectPrize(1)===false && c.openRecords()===false && document.querySelector('.screen-stage-dock .is-primary').disabled;
}));
await page.waitForFunction(() => document.querySelector('.message-danmaku').getAttribute('data-state')==='locked');
check('Spotlight uses backend winner message, never selects a candidate locally', await page.evaluate(() => {
    const spot=document.querySelector('.message-danmaku-spotlight');
    return spot.textContent.includes('后端中奖用户 1') && spot.textContent.includes('这条中奖留言由接口返回') && getComputedStyle(document.querySelector('.screen-prize')).visibility === 'hidden';
}));
await page.waitForFunction(() => require('screenliuyancj').getVisualState()==='result');
check('Shared result and one result notification', await page.evaluate(() => document.querySelector('.screen-stage-result').textContent.includes('后端中奖用户 1') && effects.filter(x=>x==='sendLuckerTpl').length===1 && document.querySelector('.message-danmaku').getBoundingClientRect().height===0));
await page.click('button[aria-label="关闭结果"]');
check('Close returns to live Ready stream', await page.evaluate(() => require('screenliuyancj').danmaku.state==='ready' && require('screenliuyancj').getRemainingCount()===6));
await page.click('button[aria-label="查看中奖记录"]');
await page.waitForFunction(() => document.querySelectorAll('.screen-stage-records-card').length===4);
await page.click('.screen-stage-records-card-delete >> nth=0');
await page.waitForFunction(() => require('screenliuyancj').currentWinnerCount===3 && !require('screenliuyancj').winnerMutationPending);
await page.click('.screen-stage-records-close');
check('Record delete and close keep counts authoritative', await page.evaluate(() => require('screenliuyancj').getRemainingCount()===7));
check('Clear mutation lock rejects switching and start', await page.evaluate(() => {
    const c=require('screenliuyancj');c.clearCurrentPrizeWinners();return c.winnerMutationPending && c.selectPrize(1)===false && c.startLottery()===false;
}));
await page.waitForFunction(() => require('screenliuyancj').getRemainingCount()===10);
await page.keyboard.press('ArrowRight');
await page.waitForFunction(() => require('screenliuyancj').getRemainingCount()===5);
await page.keyboard.press('ArrowLeft');
await page.waitForFunction(() => require('screenliuyancj').getRemainingCount()===10);
check('Prize A/B counts remain separate after clear', true);
check('Stale history cannot overwrite a newer Records result', await page.evaluate(async () => {
    const c=require('screenliuyancj');holdReads=true;c.loadPrizeLuckers('A');
    holdReads=false;testWinners.A=[{recordid:201,nickname:'新纪录'}];c.openRecords();
    await new Promise(resolve=>setTimeout(resolve,70));pendingReads.shift()();
    await Promise.resolve();const ok=c.currentWinnerCount===1;c.closeRecords();return ok;
}));
await page.evaluate(() => { nextDrawFails=true; });
await page.click('button[aria-label="开始抽奖"]');
await page.waitForFunction(() => require('screenliuyancj').getVisualState()==='ready' && effects.includes('模拟接口失败'));
check('Request failure resumes live stream without entering lock', await page.evaluate(() => require('screenliuyancj').danmaku.state==='ready' && !require('screenliuyancj').animationLockPending));
await page.click('button[aria-label="开始抽奖"]');
await page.waitForFunction(() => require('screenliuyancj').getVisualState()==='drawing');
check('Disposal during lock cancels reveal and releases engine timers', await page.evaluate(async () => {
    const c=require('screenliuyancj'),d=c.danmaku,before=effects.filter(x=>x==='sendLuckerTpl').length;
    c.stopLottery();c.destroySharedUi();
    await new Promise(resolve=>setTimeout(resolve,1800));
    return d.disposed && d.manager===null && d.timers.length===0 && effects.filter(x=>x==='sendLuckerTpl').length===before && document.querySelectorAll('.screen-stage-ui').length===0;
}));
check('Legacy fulldm retains its manager, start/stop and message path without delegation', await page.evaluate(() => {
    const f=require('fulldm');
    f.init($('.fulldmBox'), {isloop:'1',loadhistory:'2',dmrolltype:'1',dmspeed:'2',opendm:'1',needavatar:'1',neednickname:'1'});
    f.addBullet({id:'legacy',type:'1',nickname:'普通弹幕',content:'兼容测试'});
    const ok=!!f.dmmanager && f.dmmanager.runing && f.newBullet.some(x=>x.id==='legacy');
    f.stop();const stopped=!f.dmmanager.runing;f.start();const started=f.dmmanager.runing;f.stop();
    return ok && stopped && started;
}));
// Isolate another round for empty history, late common config and multiple winners.
await page.reload();
await page.waitForFunction(() => window.require && require.defined('screenliuyancj') && require('screenliuyancj').winnerCountReady);
check('Empty stream accepts its first message and late config keeps the common switch', await page.evaluate(() => {
    const c=require('screenliuyancj'),f=require('fulldm'),d=c.danmaku;
    d.reset(); const empty=d.messages.length===0 && d.status.textContent.includes('第一条');
    f.init($('.fulldmBox'),{opendm:'2'}); const muted=!d.isVisible();
    socketCallback({type:'liuyancjmsg',messages:[{id:'first',type:'1',nickname:'新用户',content:'第一条留言'}]});
    const first=d.messages.length===1 && !d.manager.runing;
    f.start();c.setDrawCount(4);return empty && muted && first && d.manager.runing;
}));
await page.click('button[aria-label="开始抽奖"]');
await page.waitForFunction(() => require('screenliuyancj').getVisualState()==='drawing');
await page.click('button[aria-label="停止抽奖"]');
await page.waitForFunction(() => document.querySelector('.message-danmaku').getAttribute('data-state')==='locked');
check('Multi-winner lock stays within stage and keeps Prize hidden', await page.evaluate(() => {
    const cards=[...document.querySelectorAll('.message-danmaku-spotlight .message-danmaku-card')],host=document.querySelector('.liuyancj-mainbox').getBoundingClientRect();
    return cards.length===3 && document.querySelector('.message-danmaku-spotlight').textContent.includes('另有 1 位') &&
        cards.every(n=>{const r=n.getBoundingClientRect();return r.top>=host.top && r.bottom<=host.bottom;}) &&
        getComputedStyle(document.querySelector('.screen-prize')).visibility==='hidden';
}));
await page.waitForFunction(() => require('screenliuyancj').getVisualState()==='result');
check('Full result includes every winner', await page.evaluate(() => require('screenliuyancj').lastDrawMessages.length===4 && document.querySelector('.screen-stage-result').textContent.includes('后端中奖用户 4')));
check('No JavaScript errors', await page.evaluate(() => errors.length===0));
console.log(JSON.stringify({passed:results.length, results},null,2));
