const {strict:assert}=await import('node:assert');
const task=await taskSpace(globalThis.RESULT_TEST_SPACE),page=task.page('p1');
await page.cdp('Network.enable');await page.cdp('Network.setCacheDisabled',{cacheDisabled:true});
await page.goto('http://127.0.0.1:8767/tests/importcj-result/?fields=4');
await page.waitForFunction(()=>window.ui&&ui.importResult);
const checks=await page.evaluate(()=>{
 const checks={},colors=['#112233','#445566','#778899','#123456'];
 const first=()=>ui.importResult.board.querySelector('.import-result-card');
 const styles=card=>[...card.querySelectorAll('[data-field-value]')].map(n=>getComputedStyle(n).color);
 const record=()=>ui.recordsListWrap.querySelector('.import-record-card');
 showResult(3,'',{},4);ui.importResult.stopAll();ui.importResult.render(false);
 const defaults=getComputedStyle(first()).backgroundImage,defaultSize=[first().style.width,first().style.height];
 const dock=()=>getComputedStyle(ui.stage.querySelector('.screen-stage-dock')).background;
 const oldDock=dock();
 const config={resultcardmode:'custom',resultcardcolor:'#e6f0ff',resultmainfield:'4',resultextra1:'2',resultextra2:'1',resultextra3:'3'};
 showResult(3,'',config,4,colors);ui.setRecords(fixtureInput);
 checks.background=getComputedStyle(first()).backgroundColor==='rgb(230, 240, 255)'&&getComputedStyle(record()).backgroundColor==='rgb(230, 240, 255)'&&getComputedStyle(first()).backgroundImage==='none';
 const expected=['rgb(18, 52, 86)','rgb(68, 85, 102)','rgb(17, 34, 51)','rgb(119, 136, 153)'];
 checks.order=JSON.stringify(styles(first()))===JSON.stringify(expected)&&JSON.stringify(styles(record()))===JSON.stringify(expected);
 checks.labels=[...first().querySelectorAll('em')].every(n=>getComputedStyle(n).color==='rgb(107, 61, 16)');
 checks.firstImmediate=first().classList.contains('done')&&!first().classList.contains('is-pending');
 checks.pending=[...ui.importResult.board.querySelectorAll('.is-pending [data-field-value]')].every(n=>n.textContent==='');
 checks.size=JSON.stringify(defaultSize)===JSON.stringify([first().style.width,first().style.height]);
 checks.dock=dock()===oldDock;
 ui.importResult.layout();checks.resize=JSON.stringify(styles(first()))===JSON.stringify(expected);
 ui.setState('records');ui.setState('result');checks.return=JSON.stringify(styles(first()))===JSON.stringify(expected)&&!first().classList.contains('done');
 const input=[{datafield1:'',datafield2:'姓名',datafield3:'部门',datafield4:'00001'}];
 showResult(1,'',{resultcardmode:'custom',resultcardcolor:'#fff'},4,colors);ui.setResult(input,{});ui.setRecords(input);
 checks.fallback=first().querySelector('[data-field-value]').textContent==='姓名'&&styles(first())[0]==='rgb(68, 85, 102)'&&styles(record())[0]==='rgb(68, 85, 102)';
 checks.invalid=true;
 for(const color of ['not-a-color','red;display:none','url(https://example.invalid/x)','var(--screen-stage-gold)','inherit']){
  showResult(1,'',{resultcardmode:'custom',resultcardcolor:color},4,[color,color,color,color]);ui.setRecords(fixtureInput);
  checks.invalid=checks.invalid&&getComputedStyle(first()).backgroundImage===defaults&&getComputedStyle(record()).backgroundImage===defaults&&styles(first()).every(c=>c==='rgb(58, 28, 6)');
 }
 showResult(1,'',{resultcardmode:'gold',resultcardcolor:'#123456'},4);ui.setRecords(fixtureInput);
 checks.defaultMode=getComputedStyle(first()).backgroundImage===defaults&&getComputedStyle(record()).backgroundImage===defaults;
 showResult(60,'',config,4,colors);const r=ui.importResult;r.stopAll();
 checks.pagination=r.pages.length>1;
 for(let p=0;p<r.pages.length;p++){r.pageIndex=p;r.render(false);checks.pagination=checks.pagination&&getComputedStyle(first()).backgroundColor==='rgb(230, 240, 255)'&&JSON.stringify(styles(first()))===JSON.stringify(expected);}
 showResult(3,'message',config);checks.sharedUnchanged=!ui.importResult&&!ui.stage.style.getPropertyValue('--import-card-background');
 showResult(3,'',{resultcardmode:'custom',resultcardcolor:'#e6f0ff'},4,colors);
 return checks;
});
console.log(checks);for(const [name,ok]of Object.entries(checks))assert.ok(ok,name);
