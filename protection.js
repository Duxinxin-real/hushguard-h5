// Simulated permissions only: this preview never changes system settings.
const protections=[
 {button:document.querySelector('#motion-setup'),name:'Shake Ad Protection',steps:['Open Privacy & Security','Choose Motion & Fitness','Enable Restrict Motion Data'],note:'Where available on your iOS version and region.'},
 {button:document.querySelector('.ad .switch'),name:'Web Ad Block',steps:['Open Safari settings','Choose Extensions','Enable the security extension']},
 {button:document.querySelector('[aria-label="Call Blocker"]'),name:'Call Blocker',steps:['Open Phone settings','Choose Call Blocking & Identification','Enable the security app']},
 {button:document.querySelector('[aria-label="SMS Filter"]'),name:'SMS Filter',steps:['Open Messages settings','Choose Unknown & Spam','Select the security app']}
].map(p=>({...p,authorized:false,enabled:false}));
const master=document.querySelector('#all-power'),security=document.querySelector('#security');
let checking=false,checkTimer,guideTimer;
master.removeAttribute('aria-pressed');
const progress=document.querySelector('.security-gauge .gauge-svg');
const progressArc=progress.querySelector('path:last-child');
progressArc.setAttribute('pathLength','100');
progressArc.style.strokeDasharray='100';
progress.setAttribute('role','progressbar');
progress.setAttribute('aria-label','Checking protection');
progress.setAttribute('aria-valuemin','0');progress.setAttribute('aria-valuemax','100');
function syncProtection(){
 const ready=protections.every(p=>p.enabled);
 protections.forEach(p=>{p.button.setAttribute('aria-checked',String(p.enabled));p.button.disabled=checking});
 security.dataset.state=checking?'checking':ready?'protected':'unprotected';
 document.querySelector('#protection-title').textContent=checking?'Checking…':ready?'Protected':'Not protected';
 document.querySelector('#protection-count').textContent=checking?'Checking your protection':ready?'All protections are on':'Tap to protect';
 master.disabled=checking||ready;master.setAttribute('aria-label',ready?'All protections are on':'Open protection');
 progress.setAttribute('aria-label',checking?'Checking protection':ready?'Protected':'Not protected');
}
function checkProtection(){
 clearInterval(checkTimer);checking=true;syncProtection();let value=0;progressArc.style.strokeDashoffset='100';progress.setAttribute('aria-valuenow','0');
 checkTimer=setInterval(()=>{value=Math.min(100,value+5);progressArc.style.strokeDashoffset=String(100-value);progress.setAttribute('aria-valuenow',value);if(value===100){clearInterval(checkTimer);setTimeout(()=>{checking=false;syncProtection()},180)}},90);
}
function showPermissionGuide(targets,all=false,contextTitle){
 clearInterval(guideTimer);let position=0;
 function renderGuide(){
  const p=targets[position];
  if(!p){document.querySelector('#dialog').close();document.querySelector('[data-tab="security"]').click();checkProtection();return}
  const guideTitle=contextTitle&&targets.length===1?contextTitle:p.name;
  modal(guideTitle,`<div class="permission-guide"><div class="ios-guide ios-guide-${protections.indexOf(p)}" role="img" aria-label="${guideTitle} settings guide"><span class="settings-highlight"></span><span class="tap-pulse"></span></div><div class="guide-caption">${position+1} / ${targets.length} · Enable protection</div><ol class="permission-steps">${p.steps.map((step,i)=>`<li class="${i===0?'current':''}"><span>${i+1}</span>${step}</li>`).join('')}</ol><button class="primary" id="grant-permission">Open Settings</button></div>`);
  let step=0;clearInterval(guideTimer);guideTimer=setInterval(()=>{step=(step+1)%3;document.querySelectorAll('.permission-steps li').forEach((li,i)=>li.classList.toggle('current',i===step))},1400);
  document.querySelector('#grant-permission').onclick=()=>{p.authorized=true;p.enabled=true;clearInterval(guideTimer);position++;syncProtection();renderGuide()};
 }
 renderGuide();
}
master.onclick=()=>{const missing=protections.filter(p=>!p.authorized);if(missing.length){protections.filter(p=>p.authorized).forEach(p=>p.enabled=true);showPermissionGuide(missing);}else{protections.forEach(p=>p.enabled=true);checkProtection()}};
protections.forEach(p=>p.button.onclick=()=>{if(!p.authorized){showPermissionGuide([p]);return}p.enabled=!p.enabled;checkProtection()});
document.querySelector('#dialog').addEventListener('close',()=>clearInterval(guideTimer));
checkProtection();
