const {strict:assert}=await import('node:assert');
const task=await taskSpace(globalThis.RESULT_TEST_SPACE),page=task.page('p1');
await page.cdp('Network.enable');await page.cdp('Network.setCacheDisabled',{cacheDisabled:true});
await page.goto('http://127.0.0.1:8767/tests/importcj-result/?fields=4');
await page.waitForFunction(()=>window.ui&&ui.importResult);
const result=await page.evaluate(()=>{
 const errors=[];let scenarios=0;
 const colors=['#112233','#445566','#778899','#123456'];
 const expected=['rgb(18, 52, 86)','rgb(68, 85, 102)','rgb(17, 34, 51)','rgb(119, 136, 153)'];
 const check=(ok,label,context)=>{if(!ok)errors.push({label,...context});};
 for(const [w,h]of [[1920,1080],[1024,768],[1080,1920]])for(const fields of [1,2,3,4])for(const mode of ['gold','transparent','softgold','ivory','custom'])for(const count of [3,8,40]){
  const context={w,h,fields,mode,count};scenarios++;
  ui.root.style.cssText=`width:${w}px;height:${h}px`;
  const config={resultcardmode:mode,resultcardcolor:'#e6f0ff',resultmainfield:'4',resultextra1:'2',resultextra2:'1',resultextra3:'3'};
  // Keep field selection valid for each schema, then test reordered colors at four fields.
  if(fields!==4)for(const key of ['resultmainfield','resultextra1','resultextra2','resultextra3'])delete config[key];
  showResult(count,'',config,fields,colors);
  const r=ui.importResult,first=r.board.querySelector('.import-result-card');
  check(first.classList.contains('done')&&!first.classList.contains('is-pending'),'immediate reveal',context);
  check([...r.board.querySelectorAll('.is-pending [data-field-value]')].every(n=>!n.textContent),'pending concealed',context);
  r.stopAll();r.render(false);ui.setRecords(fixtureInput);ui.setState('records');
  const card=r.board.querySelector('.import-result-card'),record=ui.recordsListWrap.querySelector('.import-record-card');
  const a=getComputedStyle(card),b=getComputedStyle(record);
  check(a.backgroundColor===b.backgroundColor&&a.backgroundImage===b.backgroundImage,'shared background',context);
  const wanted=fields===4?expected:colors.slice(0,fields).map(c=>{const e=document.createElement('span');e.style.color=c;document.body.append(e);const color=getComputedStyle(e).color;e.remove();return color;});
  for(const node of [card,record])check(JSON.stringify([...node.querySelectorAll('[data-field-value]')].map(n=>getComputedStyle(n).color))===JSON.stringify(wanted),'field colors',context);
  if(mode==='transparent')check(a.borderTopWidth==='1px'&&a.boxShadow==='none'&&b.boxShadow==='none'&&a.backgroundColor==='rgba(255, 255, 255, 0.08)','transparent palette',context);
  if(mode==='softgold'){
   check(a.borderTopWidth==='0px'&&b.borderTopWidth==='0px'&&a.backgroundImage==='linear-gradient(165deg, rgb(245, 223, 166), rgb(226, 185, 96))','soft gold palette',context);
   check((a.boxShadow.match(/rgba/g)||[]).length===(r.pages[0].winners.length>6?1:2),'page glow threshold',context);
   check((b.boxShadow.match(/rgba/g)||[]).length===(count>6?1:2),'records glow threshold',context);
  }
  if(mode==='ivory')check(a.borderLeftWidth==='0px'&&parseFloat(a.borderTopWidth)>0&&a.borderTopColor==='rgb(226, 185, 96)'&&a.backgroundColor==='rgb(251, 247, 238)','ivory palette',context);
  if(mode==='custom')check(a.backgroundColor==='rgb(230, 240, 255)'&&a.backgroundImage==='none','custom palette',context);
  check(getComputedStyle(ui.recordsDrawer.querySelector('.screen-stage-records-drawer')).backgroundColor==='rgba(8, 10, 22, 0.86)','transparent panel',context);
  check(getComputedStyle(ui.recordsDrawer.querySelector('.screen-stage-records-backdrop')).backgroundColor==='rgba(0, 0, 0, 0.35)','backdrop',context);
  const size=[card.style.width,card.style.height],background=a.background;
  for(let index=1;index<r.pages.length;index++){
   r.pageIndex=index;r.render(false);const next=r.board.querySelector('.import-result-card');
   check(JSON.stringify([next.style.width,next.style.height])===JSON.stringify(size),'fixed pagination size',context);
   check(getComputedStyle(next).background===background,'pagination palette',context);
  }
 }
 showResult(3,'',{resultcardmode:'unknown'},4);check(ui.importResult.el.dataset.cardStyle==='gold','legacy fallback',{});
 return {scenarios,errors};
});
console.log(result);assert.deepEqual(result.errors,[]);
