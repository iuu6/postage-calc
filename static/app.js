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
const result=findBestCombination(target);
const div=document.getElementById('result');
if(result){
const total=result.reduce((sum,r)=>sum+r.value*r.used,0).toFixed(1);
div.innerHTML=`<div class="result"><div class="result-item"><strong>最优方案 (总计: ${total}):</strong></div>${result.map(r=>r.used?`<div class="result-item">${r.value} × ${r.used}</div>`:'').join('')}</div>`;
}else{
div.innerHTML='<div class="result error">无法凑齐</div>';
}
}

function findBestCombination(target){
const sorted=[...stamps].sort((a,b)=>b.value-a.value);
let best=null;
let minStamps=Infinity;
let minDiff=Infinity;

function dfs(idx,remain,used,total){
const sum=target-remain;
if(remain<=0){
const diff=sum-target;
if(total<minStamps||(total===minStamps&&diff<minDiff)){
minStamps=total;
minDiff=diff;
best=used.map((u,i)=>({value:sorted[i].value,used:u}));
}
return;
}
if(idx>=sorted.length||total>=minStamps)return;
const s=sorted[idx];
const max=s.count===-1?Math.ceil(remain/s.value)+1:Math.min(s.count,Math.ceil(remain/s.value)+1);
for(let i=max;i>=0;i--){
used[idx]=i;
dfs(idx+1,remain-s.value*i,used,total+i);
}
used[idx]=0;
}

dfs(0,target,Array(sorted.length).fill(0),0);
return best;
}

loadStamps();
