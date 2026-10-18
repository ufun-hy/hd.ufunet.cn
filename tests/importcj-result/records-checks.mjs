const {strict:assert}=await import('node:assert');
const task=await taskSpace(globalThis.RESULT_TEST_SPACE),page=task.page('p1');
await page.cdp('Network.enable');await page.cdp('Network.setCacheDisabled',{cacheDisabled:true});
await page.goto('http://127.0.0.1:8767/tests/importcj-result/');
await page.waitForFunction(()=>window.showResult&&ui.importResult);
const result=await page.evaluate(async()=>{
 const source=await(await fetch('./records-reference.html')).text(),errors=[];let scenarios=0;
 for(const f of [1,2,3,4])for(const [w,h] of [[1920,1080],[1024,768],[1080,1920],[375,812]])for(const n of [3,12,60]){
  ui.root.style.cssText='width:'+w+'px;height:'+h+'px';showResult(n,'',{},f);ui.setRecords(fixtureInput);ui.setState('records');
  const ref=document.createElement('iframe');ref.style.cssText='position:absolute;left:-10000px;border:0;width:'+w+'px;height:'+h+'px';
  const html=source.replace('let n=12,f=4,ratio=16/9,','let n='+n+',f='+f+',ratio='+w+'/'+h+',').replace("const barH=$('bar').offsetHeight;",'const barH=-6;');
  await new Promise(resolve=>{ref.onload=resolve;ref.srcdoc=html;document.body.appendChild(ref);});
  const d=ref.contentDocument,win=ref.contentWindow;
  const same=(a,b,kind)=>{if(Math.abs(a-b)>.06)errors.push({f,w,h,n,kind,actual:a,reference:b});};
  const card=ui.recordsListWrap.querySelector('.import-record-card'),expected=d.querySelector('.t');
  const pairs=[['.import-record-main','.p'],['.import-record-secondary','.s2'],['.import-record-fields em','.ex em'],['.import-record-fields b','.ex b']];
  same(card.offsetHeight,expected.offsetHeight,'card height');
  same(parseFloat(getComputedStyle(card).width),parseFloat(win.getComputedStyle(expected).width),'card width');
  same(ui.recordsDrawer.querySelector('.screen-stage-records-drawer').offsetWidth,d.querySelector('#panel').offsetWidth,'panel width');
  for(const [a,b]of pairs){const x=card.querySelector(a),y=expected.querySelector(b);if(!!x!==!!y)errors.push({f,kind:'field structure'});if(x&&y)same(parseFloat(getComputedStyle(x).fontSize),parseFloat(win.getComputedStyle(y).fontSize)*(a==='.import-record-main'?.8:1),a+' font');}
  if(ui.recordsListWrap.querySelectorAll('.import-record-card').length!==n)errors.push({f,n,kind:'lost cards'});
  if(card.querySelectorAll('[data-field-value]').length!==f)errors.push({f,kind:'wrong fields'});
  ref.remove();scenarios++;
 }
 ui.root.style.cssText='width:100%;height:100%';
 const checks={};
 showResult(3,'',{resultmainfield:'4',resultextra1:'1',resultextra2:'3',resultextra3:'2'},4);
 ui.importResult.stopAll();ui.importResult.render(false);ui.setRecords(fixtureInput);
 const a=ui.importResult.board.querySelector('.import-result-card'),b=ui.recordsListWrap.querySelector('.import-record-card');
 checks.sameFields=a.textContent===b.textContent&&a.textContent==='020902A09部门市场部姓名张伟';
 checks.immutable=JSON.stringify(fixtureInput)===fixtureOriginal;
 ui.setRecords([{showitems:['V29','张伟','市场部','012907']}]);
 checks.showitems=ui.recordsListWrap.textContent==='012907V29部门市场部姓名张伟';
 showResult(3,'',{resultmainfield:'1',resultextra1:'2',resultextra2:'2',resultextra3:'0'},4);ui.setRecords(fixtureInput);
 checks.disabledAndDuplicate=ui.importResult.fieldCount===2&&!ui.recordsListWrap.querySelector('.import-record-fields');
 showResult(1,'',{},4);const data=[{datafield1:'',datafield2:'王芳',datafield3:'研发部',datafield4:'000012'}];ui.setResult(data,{});ui.setRecords(data);
 checks.fallback=ui.recordsListWrap.textContent==='王芳研发部编号000012'&&ui.importResult.groups[0].winners[0].name==='王芳';
 showResult(31,'groups',{},4);ui.setRecords(fixtureInput);checks.groups=ui.recordsListWrap.querySelectorAll('.screen-stage-records-section').length===2&&ui.recordsTotalCount.textContent==='31';
 ui.setRecords([]);checks.empty=ui.recordsEmptyState.style.display==='flex'&&ui.recordsTotalCount.textContent==='0';
 ui.setRecords([], 'loading');checks.loading=ui.recordsLoadingState.style.display==='flex';
 ui.setRecords('请求失败','error');checks.error=ui.recordsErrorState.style.display==='flex'&&ui.recordsErrorMsg.textContent==='请求失败';
 showResult(1,'xss',{},4);ui.setRecords(fixtureInput);checks.xss=!ui.recordsListWrap.querySelector('img,script');
 showResult(1,'zero');ui.setRecords(fixtureInput);checks.zero=ui.recordsListWrap.textContent==='0000012';
 showResult(3,'',{},4);return {errors,scenarios,checks};
});
console.log(result);assert.deepEqual(result.errors,[]);for(const [name,ok]of Object.entries(result.checks))assert.equal(ok,true,name);
