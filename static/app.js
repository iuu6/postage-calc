let stamps=[];

function getCookie(name){
const v=document.cookie.match('(^|;) ?'+name+'=([^;]*)(;|$)');
return v?JSON.parse(decodeURIComponent(v[2])):null;
}

function setCookie(name,value){
document.cookie=name+'='+encodeURIComponent(JSON.stringify(value))+';path=/;max-age=31536000';
}

async function loadStamps(){
const custom=getCookie('customStamps');
if(custom){
stamps=custom;
}else{
const res=await fetch('available.json');
stamps=await res.json();
}
renderStamps();
}

function renderStamps(){
const list=document.getElementById('stampList');
list.innerHTML=stamps.map(s=>`<li class="stamp-item"><span>面值: ${s.value}</span><span>张数: ${s.count===-1?'无限':s.count}</span></li>`).join('');
}

function addCustomStamp(){
const value=parseFloat(document.getElementById('customValue').value);
const count=parseInt(document.getElementById('customCount').value);
if(!value||!count)return alert('请输入有效值');
stamps.push({value,count});
setCookie('customStamps',stamps);
renderStamps();
document.getElementById('customValue').value='';
document.getElementById('customCount').value='';
}

function resetStamps(){
document.cookie='customStamps=;path=/;max-age=0';
loadStamps();
}

function calculate(){
const target=parseFloat(document.getElementById('targetAmount').value);
if(!target)return alert('请输入金额');
const results=findBestCombinations(target);
const div=document.getElementById('result');
if(results.length){
div.innerHTML=results.map((r,i)=>{
const total=r.stamps.reduce((sum,s)=>sum+s.value*s.used,0).toFixed(1);
const items=r.stamps.filter(s=>s.used).map(s=>`${s.value} × ${s.used}`).join(' + ');
return `<div class="result"><div class="result-item"><strong>方案${i+1} (总计: ${total}, ${r.count}张):</strong></div><div class="result-item">${items}</div></div>`;
}).join('');
}else{
div.innerHTML='<div class="result error">无法凑齐</div>';
}
}

function findBestCombinations(target){
const solutions=[];
const maxDiff=Math.max(...stamps.map(s=>s.value));

function dfs(idx,sum,used,count){
if(sum>=target){
const diff=sum-target;
if(diff<=maxDiff){
solutions.push({stamps:used.map((u,i)=>({value:stamps[i].value,used:u})),sum,count,diff});
}
return;
}
if(idx>=stamps.length)return;
const s=stamps[idx];
const maxUse=s.count===-1?Math.ceil((target+maxDiff-sum)/s.value):Math.min(s.count,Math.ceil((target+maxDiff-sum)/s.value));
for(let i=0;i<=maxUse;i++){
used[idx]=i;
dfs(idx+1,sum+s.value*i,used,count+i);
}
used[idx]=0;
}

dfs(0,0,Array(stamps.length).fill(0),0);
solutions.sort((a,b)=>a.diff-b.diff||a.count-b.count);
return solutions.slice(0,5);
}

loadStamps();
