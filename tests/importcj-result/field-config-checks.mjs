// Exercise the real template submit preparation without saving any activity.
const {strict:assert}=await import('node:assert');
const task=await taskSpace(globalThis.RESULT_TEST_SPACE),page=task.page('p1');
await page.goto('http://127.0.0.1:8767/tests/importcj-result/');
const checks=await page.evaluate(async()=>{
 const out={};
 for(const path of['/app/web/view/hdconfig/importcj/index.html','/app/hdmanage/view/configimportcj/index.html']){
  const source=await(await fetch(path)).text();
  const row=source.match(/<script id='fieldone-tpl' type="text\/template">([\s\S]*?)<\/script>/)[1];
  const start=source.indexOf('var scaleValid = true;'),end=source.indexOf('var postData = webcore.serializeObject($form);',start);
  const prepare=new Function('$form','zamnotice',source.slice(start,end));
  const form=document.createElement('form');form.innerHTML='<table><tbody class="fieldlists">'+row.repeat(3)+'</tbody></table>';document.body.appendChild(form);
  let error=null;
  const stub={find:selector=>({each:fn=>form.querySelectorAll(selector).forEach((n,i)=>fn.call(n,i))}),formValidation(){}};
  const notice={showTips(type,message){error=message;}};
  const inputs=()=>[...form.querySelectorAll('.import-field-scale')];
  out[path+' default']=inputs().every(n=>n.value==='100'&&n.min==='50'&&n.max==='150');
  inputs().forEach((n,i)=>n.value=String([60,110,140][i]));prepare(stub,notice);
  out[path+' save']=!error&&new FormData(form).get('styleconfig[resultfieldscale2]')==='110';
  form.querySelector('tr').remove();prepare(stub,notice);
  out[path+' delete']=inputs().map(n=>n.name+'='+n.value).join('|')==='styleconfig[resultfieldscale1]=110|styleconfig[resultfieldscale2]=140';
  form.querySelector('tbody').insertAdjacentHTML('beforeend',row);prepare(stub,notice);
  out[path+' add']=inputs()[2].name==='styleconfig[resultfieldscale3]'&&inputs()[2].value==='100';
  for(const value of['','49','151','99.5']){error=null;inputs()[0].value=value;prepare(stub,notice);out[path+' invalid '+value]=!!error;}
  out[path+' existing row binding']=source.includes('name="styleconfig[resultfieldscale{$fieldIndex+1}]"')&&source.includes("$config['styleconfig']['resultfieldscale'.($fieldIndex+1)]??100");
  form.remove();
 }
 return out;
});console.log(checks);for(const[k,v]of Object.entries(checks))assert.ok(v,k);
