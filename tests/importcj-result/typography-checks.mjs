const {strict:assert}=await import('node:assert');
const task=await taskSpace(globalThis.RESULT_TEST_SPACE),page=task.page('p1');
await page.cdp('Network.enable');await page.cdp('Network.setCacheDisabled',{cacheDisabled:true});
await page.goto('http://127.0.0.1:8767/tests/importcj-result/?fields=4');
await page.waitForFunction(()=>window.ui&&ui.importResult);
const result=await page.evaluate(()=>{
 const errors=[],checks={};let scenarios=0;
 const check=(ok,label,context={})=>{if(!ok)errors.push({label,...context});};
 const card=()=>ui.importResult.board.querySelector('.import-result-card');
 const fonts=c=>[...c.querySelectorAll('[data-field-value]')].map(n=>parseFloat(getComputedStyle(n).fontSize));
 for(const [w,h]of[[1920,1080],[1024,768],[1080,1920],[375,812]])for(const f of[1,2,3,4]){
  let dimensions,capacity,recordsSize;
  for(const scale of[50,100,150]){
   const context={w,h,f,scale};scenarios++;ui.root.style.cssText=`width:${w}px;height:${h}px`;
   const config={};for(let i=1;i<=4;i++)config['resultfieldscale'+i]=scale;
   showResult(40,'',config,f);const r=ui.importResult;r.stopAll();r.render(false);
   const size=card().style.width+'|'+card().style.height;
   if(dimensions)check(size===dimensions&&capacity===r.pages.map(p=>p.capacity).join(),'geometry changes with scale',context);
   dimensions=size;capacity=r.pages.map(p=>p.capacity).join();
   const before=fonts(card());
   for(let p=0;p<r.pages.length;p++){
    r.pageIndex=p;r.render(false);check(JSON.stringify(fonts(card()))===JSON.stringify(before),'page typography changed',context);
    for(const c of r.board.querySelectorAll('.import-result-card')){
     const bounds=c.getBoundingClientRect();
     for(const node of c.querySelectorAll('[data-field-value]')){
      const rect=node.getBoundingClientRect();
      check(rect.top>=bounds.top-.5&&rect.bottom<=bounds.bottom+.5,'vertical text clipping',context);
      check(node.scrollWidth<=node.clientWidth+1,'short field clipped',context);
     }
    }
   }
   ui.setRecords(fixtureInput);ui.setState('records');
   const record=ui.recordsListWrap.querySelector('.import-record-card'),rs=[record.offsetWidth,record.offsetHeight].join(':');
   if(recordsSize)check(rs===recordsSize,'record size changes with scale',context);recordsSize=rs;
   for(const node of record.querySelectorAll('[data-field-value]')){
    const a=node.getBoundingClientRect(),b=record.getBoundingClientRect();
    check(a.top>=b.top-.5&&a.bottom<=b.bottom+.5,'record text outside card',context);
   }
  }
 }
 ui.root.style.cssText='width:1920px;height:1080px';
 showResult(40,'',{},2);let r=ui.importResult;r.stopAll();r.render(false);
 checks.defaultMain=Math.abs(fonts(card())[0]-r.pages[r.pageIndex].layout.fs*.8)<.02;
 const data=Array.from({length:40},(_,i)=>({id:i+1,datafield1:i===39?'运营支持部门组':'A09',datafield2:'张伟'}));
 ui.setResult(data,{});r.stopAll();r.render(false);const fit=fonts(card())[0];
 checks.longLastPageAffectsFirst=fit<r.pages[r.pageIndex].layout.fs*.8;
 const seen=[];for(let p=0;p<r.pages.length;p++){r.pageIndex=p;r.render(false);seen.push(fonts(card())[0]);}
 checks.allPagesSame=seen.every(x=>x===fit);
 checks.longChineseFits=[...r.board.querySelectorAll('.import-result-main')].every(n=>n.scrollWidth<=n.clientWidth+1);
 const previous=fit;r.layout();checks.resizeStable=fonts(card())[0]===previous;
 showResult(1,'extreme',{},2);r=ui.importResult;r.stopAll();r.render(false);
 const main=card().querySelector('.import-result-main');
 checks.extremeEllipsis=main.scrollWidth>main.clientWidth&&getComputedStyle(main).textOverflow==='ellipsis'&&parseFloat(main.style.fontSize)>=Math.min(r.pages[r.pageIndex].layout.fs*.8,Math.max(12,r.pages[r.pageIndex].layout.fs*.4))-.02&&main.title===fixtureInput[0].datafield1;
 showResult(3,'',{resultmainfield:'2',resultextra1:'1',resultextra2:'3',resultextra3:'4',resultfieldscale1:60,resultfieldscale2:120,resultfieldscale3:80,resultfieldscale4:110},4);
 r=ui.importResult;r.stopAll();r.render(false);ui.setRecords(fixtureInput);ui.setState('records');
 checks.mapping=[card(),ui.recordsListWrap.querySelector('.import-record-card')].every(c=>[...c.querySelectorAll('[data-field-value]')].map(n=>n.dataset.fieldScale).join(',')==='1.2,0.6,0.8,1.1');
 checks.inputUntouched=JSON.stringify(fixtureInput)===fixtureOriginal;
 for(const invalid of['garbage',0,999,'Infinity','',null]){
  showResult(3,'',{resultfieldscale1:invalid},1);r=ui.importResult;r.stopAll();r.render(false);
  check(card().querySelector('.import-result-main').dataset.fieldScale==='1','invalid scale fallback',{invalid});
 }
 for(const text of['WWWiii-12','研发中心A09','财务管理部','😀测试A09']){
  showResult(40,'',{},1);ui.setResult(Array.from({length:40},(_,i)=>({id:i+1,datafield1:text})),{});r=ui.importResult;r.stopAll();r.render(false);
  const n=card().querySelector('.import-result-main');check(n.scrollWidth<=n.clientWidth+1,'mixed-script fitting',{text});
 }
 // Newly formatted/privacy-masked values replace old measurements.
 ui.setResult([{id:1,datafield1:'张**'}],{});r=ui.importResult;r.stopAll();r.render(false);
 checks.maskPreserved=card().textContent==='张**'&&Math.abs(fonts(card())[0]-r.pages[r.pageIndex].layout.fs*.8)<.02;
 ui.root.style.cssText='width:100%;height:100%';showResult(10,'department',{resultcardmode:'transparent'},2);
 return {errors,checks,scenarios};
});
console.log(result);assert.deepEqual(result.errors,[]);for(const[k,v]of Object.entries(result.checks))assert.ok(v,k);
