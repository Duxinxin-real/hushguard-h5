/* Local interaction model. No system permission, network analysis, media access or cloud upload occurs. */
(() => {
const q=s=>document.querySelector(s),qa=s=>[...document.querySelectorAll(s)],esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const key='security-preview-flows-v1';
const fresh=()=>({permissions:false,scanned:false,items:[],checks:{},feedback:'',protection:[]});
let data;try{data=Object.assign(fresh(),JSON.parse(localStorage.getItem(key)||'null'))}catch{data=fresh()}
function save(){try{localStorage.setItem(key,JSON.stringify(data))}catch{controls.querySelector('.storage-note').textContent='Storage unavailable: changes will last for this session only.'}}
const phone=q('.phone'),page=document.createElement('section');page.className='flow-page';page.hidden=true;phone.append(page);
let leave=null,backAction=null,view=null,focusBefore=null;
function cleanup(){if(leave){const f=leave;leave=null;f()}}
function home(){hiddenUnlocked=false;hiddenAuthActive=false;hiddenAuthEpoch++;cleanup();page.hidden=true;page.innerHTML='';page.inert=false;removeView();qa('.phone>header,.phone>.tab-page,.phone>.nav').forEach(e=>e.inert=false);q('.nav [aria-current]')?.focus()}
function screen(title,html,back=home,tool=''){cleanup();removeView();page.hidden=false;page.dataset.layout='';page.innerHTML=`<div class="flow-head"><button class="flow-back" aria-label="Back">${icon('chevron')}</button><h2>${esc(title)}</h2>${tool}</div><div class="flow-body">${html}</div>`;qa('.phone>header,.phone>.tab-page,.phone>.nav').forEach(e=>e.inert=true);backAction=back;q('.flow-back').onclick=back;page.querySelector('.flow-body').scrollTop=0;page.querySelector('.flow-back').focus()}

function layout(name){page.dataset.layout=name}
function dock(...selectors){const bar=document.createElement('div');bar.className='flow-actions';selectors.forEach(sel=>{const node=q(sel);if(node)bar.append(node)});if(bar.children.length)page.append(bar)}

const primary=(id,text)=>`<button class="primary" id="${id}">${text}</button>`;
const secondary=(id,text)=>`<button class="secondary" id="${id}">${text}</button>`;
const row=(id,label,ico='chevron',sub='')=>`<button class="flow-row" id="${id}">${icon(ico)}<span>${label}${sub?`<small>${sub}</small>`:''}</span>${icon('chevron')}</button>`;
const emblem=ico=>`<div class="flow-emblem">${icon(ico)}</div>`;
function empty(title,body,ico='photo'){return `<div class="flow-empty">${icon(ico)}<h3>${title}</h3><p>${body}</p></div>`}
function closeModal(){q('#dialog').close()}
// Keep the existing dialog and source handlers but use non-top-layer display inside the canvas.
const dialog=q('#dialog'),shade=document.createElement('div');shade.className='flow-shade';shade.hidden=true;phone.append(shade);phone.append(dialog);
modal=function(title,content){if(!dialog.open)focusBefore=document.activeElement;shade.hidden=false;page.inert=true;qa('.phone>header,.phone>.tab-page,.phone>.nav').forEach(e=>e.inert=true);q('#dialog-title').textContent=title;q('#dialog-content').innerHTML=content;if(!dialog.open)dialog.show();dialog.querySelector('button')?.focus()};
dialog.addEventListener('close',()=>{shade.hidden=true;page.inert=false;qa('.phone>header,.phone>.tab-page,.phone>.nav').forEach(e=>e.inert=!page.hidden);focusBefore?.isConnected&&focusBefore.focus()});
shade.onclick=e=>{if(e.detail<2)closeModal()};dialog.onclick=null;
function confirm(title,body,label,action){modal(title,`<p>${body}</p>${primary('confirm-action',label)}${secondary('cancel-action','Cancel')}`);q('#cancel-action').onclick=closeModal;q('#confirm-action').onclick=()=>{closeModal();action()}}
document.addEventListener('keydown',e=>{if(e.key==='Escape'){e.preventDefault();if(dialog.open)closeModal();else if(view)removeView();else if(!page.hidden)backAction?.()}if(e.key==='Tab'&&dialog.open){const nodes=[...dialog.querySelectorAll('button,input,textarea,[tabindex="0"]')].filter(e=>!e.disabled);if(e.shiftKey&&document.activeElement===nodes[0]){e.preventDefault();nodes.at(-1).focus()}else if(!e.shiftKey&&document.activeElement===nodes.at(-1)){e.preventDefault();nodes[0].focus()}}});
const controls=document.createElement('details');controls.className='preview-controls';controls.innerHTML='<summary>Prototype controls</summary><p>Local simulation only. Uses bundled landscape photos; no personal media, system settings, cloud or feedback service is accessed.</p><label>Next result <select id="flow-scenario"><option value="safe">Safe / success</option><option value="risk">Risk</option><option value="unavailable">Unavailable</option><option value="offline">Offline</option><option value="failure">Failure</option><option value="empty">Empty</option></select></label><button id="flow-reset">Reset preview</button><button id="flow-revoke">Revoke access</button><p class="storage-note"></p>';document.body.append(controls);controls.hidden=true;
const scenario=()=>localStorage.getItem('security-preview-scenario')||'safe';
window.addEventListener('storage',e=>{if(e.key==='security-preview-command'){if(e.newValue?.startsWith('reset')){localStorage.removeItem(key);location.reload()}if(e.newValue?.startsWith('revoke'))q('#flow-revoke').click()}});
q('#flow-reset').onclick=()=>confirm('Reset preview?','Clear this prototype’s saved selections and passcodes?','Reset',()=>{localStorage.removeItem(key);location.reload()});
q('#flow-revoke').onclick=()=>{data.permissions=false;protections.forEach(p=>{p.authorized=false;p.enabled=false});persistProtection();syncProtection();save()};
// Settings: no unconfirmed brand, version, external policy or feedback destination.
q('#settings').onclick=settings;
function settings(){screen('Settings',row('about','About','shield')+row('hidden-passcode-settings',data.hiddenCredential?'Change Hidden media passcode':'Set Hidden media passcode','lock')+'<div class="flow-list">'+row('policy','Privacy Policy','lock')+row('terms','Terms of Use','doc')+'</div>'+row('feedback','Feedback','chat'));layout('settings');q('#about').onclick=()=>screen('About',emblem('shield')+'<div class="flow-center"><h3>Security · Privacy</h3><p>Manage protection, review device and Wi-Fi checks, and keep private media organized.</p></div>'+row('about-features','Features','gauge'),settings);q('#policy').onclick=()=>policy('Privacy Policy');q('#terms').onclick=()=>policy('Terms of Use');q('#feedback').onclick=feedback;q('#hidden-passcode-settings').onclick=hiddenPasscodeSettings;}
function policy(title){screen(title,'<div class="policy-empty">'+empty('Not available','This information is currently unavailable. Please try again later.','doc')+'</div>'+primary('retry-policy','Try again'),settings);layout('empty');dock('#retry-policy');q('#retry-policy').onclick=()=>policy(title)}
phone.addEventListener('click',e=>{if(e.target.closest('#about-features'))screen('Features',row('feature-security','Security','shield')+row('feature-status','Status','gauge')+row('feature-privacy','Privacy','eye'),settings)});
phone.addEventListener('click',e=>{const id=e.target.closest('[id]')?.id;const m={'feature-security':'security','feature-status':'status','feature-privacy':'privacy'};if(m[id]){home();q(`[data-tab="${m[id]}"]`).click()}});
function feedback(){screen('Feedback','<label for="feedback-message">Your feedback</label><textarea id="feedback-message" maxlength="2000" placeholder="Tell us what could be better"></textarea><p id="feedback-error" class="flow-error" role="status"></p>'+primary('save-feedback','Save draft'),settings);q('#feedback-message').value=data.feedback;q('#feedback-message').oninput=()=>{data.feedback=q('#feedback-message').value;save()};layout('feedback');dock('#save-feedback');q('#save-feedback').onclick=()=>{if(data.feedback.trim().length<10){q('#feedback-error').textContent='Please enter at least 10 characters.';return}screen('Feedback saved',emblem('chat')+'<p>Your draft is saved on this device. It has not been sent.</p>'+primary('feedback-done','Done'),feedback);q('#feedback-done').onclick=settings}}
// Consistent cancellable operations. The complete callback never runs after leaving.
function operation(title,label,done,cancel=home){screen(title,`<div class="flow-center">${emblem('refresh')}<h3>${label}</h3><div class="flow-percent" id="operation-value">0%</div><div class="flow-meter" role="progressbar" aria-label="${label}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="0"><i></i></div></div>${secondary('operation-cancel','Cancel')}`,cancel);layout('operation');dock('#operation-cancel');let value=0;const timer=setInterval(()=>{value=Math.min(100,value+5);q('#operation-value').textContent=value+'%';q('.flow-meter').setAttribute('aria-valuenow',value);q('.flow-meter i').style.width=value+'%';if(value===100){clearInterval(timer);leave=null;done()}},80);leave=()=>clearInterval(timer);q('#operation-cancel').onclick=cancel;}
function errorPage(title,reason,retry,back){screen(title,empty('Couldn’t complete',reason,'refresh')+primary('operation-retry','Try again'),back);layout('empty');dock('#operation-retry');q('#operation-retry').onclick=retry}
// Phone and Wi-Fi result states and reason details.
function runCheck(kind){const chosen=scenario();operation(kind+' Security','Checking…',()=>{const result={status:['offline','failure','unavailable'].includes(chosen)?'Unavailable':chosen==='risk'?'Risk':'Safe',reason:chosen,time:Date.now()};data.checks[kind]=result;save();checkResult(kind)},home)}
function checkResult(kind){const r=data.checks[kind];if(!r)return runCheck(kind);const details=kind==='Phone'?['Protection settings','Permission access']:['Wi-Fi Authentication','DNS Security'];screen(kind+' Security',`<div class="flow-center">${emblem(kind==='Phone'?'phone':'wifi')}<div class="flow-status ${r.status.toLowerCase()}">${r.status}</div><p>${r.status==='Safe'?'No issues found in this check.':r.status==='Risk'?'Some settings need your attention.':r.reason==='offline'?'No network connection.':r.reason==='failure'?'The check could not finish.':'Required information is unavailable.'}</p><p class="flow-time">${new Date(r.time).toLocaleString()}</p></div>${details.map((t,i)=>row('check-detail-'+i,t,kind==='Phone'?'shield':'wifi',r.status)).join('')}${primary('check-again','Check again')}`);layout('result');page.dataset.result=r.status.toLowerCase();dock('#check-again');details.forEach((t,i)=>q('#check-detail-'+i).onclick=()=>checkDetail(kind,t));q('#check-again').onclick=()=>runCheck(kind)}
function checkDetail(kind,title){const r=data.checks[kind],missing=r.status==='Unavailable';screen(title,`<div class="flow-card"><div class="flow-status ${r.status.toLowerCase()}">${r.status}</div><p>${r.status==='Safe'?'No anomaly was found in the checks that completed. This result does not guarantee complete safety.':r.status==='Risk'?'The current configuration may expose information. Review the settings below before continuing.':'This check has insufficient information. Reconnect and try again.'}</p></div>${kind==='Wi-Fi'?`<div class="flow-card"><div class="flow-kv"><span>Network</span><strong>${missing?'Unavailable':'Home Wi-Fi'}</strong></div><div class="flow-kv"><span>IP address</span><strong>${missing?'Unavailable':'192.0.2.24'}</strong></div><div class="flow-kv"><span>IP region</span><strong>${missing?'Unavailable':'United States'}</strong></div><div class="flow-kv"><span>${title.includes('DNS')?'DNS response':'Authentication'}</span><strong>${missing?'Unavailable':r.status==='Risk'?'Needs review':title.includes('DNS')?'Consistent':'WPA3'}</strong></div></div>`:'<div class="flow-card"><p>Review your protection permissions and enable the features you want to use.</p></div>'}${primary('detail-recheck','Check again')}`,()=>checkResult(kind));layout('detail');dock('#detail-recheck');q('#detail-recheck').onclick=()=>runCheck(kind)}
qa('.check').forEach(b=>b.onclick=()=>runCheck(b.dataset.kind));
// Media records have stable identities; all counters derive from these records.
const photos=['forest','river','mountains','coast','shore','landscape'];
const catalog=Array.from({length:24},(_,i)=>({id:'media-'+i,group:i<12?0:i<20?1:2,name:['Forest','River','Mountains','Coast','Shore','Landscape'][i%6]+' '+(i+1),src:'assets/media/'+photos[i%6]+'.jpg',hidden:false}));
catalog.push({id:'video-1',group:2,name:'Flowers',src:'assets/media/flower.mp4',poster:'assets/media/forest.jpg',type:'video',hidden:false});
function item(id){return catalog.find(x=>x.id===id)}
function removeView(){view?.querySelector('video')?.pause();view?.remove();view=null;page.inert=false}
function previewMedia(id){const m=item(id);if(!m)return;view=document.createElement('div');view.className='flow-view';view.innerHTML=`<div class="flow-head"><button class="flow-back" aria-label="Close media">${icon('chevron')}</button><h2>${esc(m.name)}</h2></div>${m.type==='video'?`<video src="${m.src}" controls playsinline preload="metadata" aria-label="${esc(m.name)}"></video>`:`<img src="${m.src}" alt="${esc(m.name)}">`}`;phone.append(view);page.inert=true;view.querySelector('button').onclick=removeView;view.querySelector('button').focus()}
function grid(ids,selected){return `<div class="flow-grid">${ids.map(id=>{const m=item(id);return `<div class="flow-tile"><button class="flow-photo" data-preview="${id}" aria-label="View ${m.name}"><img src="${m.poster||m.src}" alt="${m.name}"></button>${selected?`<button class="flow-select" data-select="${id}" aria-label="Select ${m.name}" aria-pressed="${selected.has(id)}">${selected.has(id)?icon('shield'):''}</button>`:''}<p>${m.name}</p></div>`}).join('')}</div>`}
function wireGrid(selected,onChange){qa('[data-preview]').forEach(b=>b.onclick=()=>previewMedia(b.dataset.preview));qa('[data-select]').forEach(b=>b.onclick=()=>{const id=b.dataset.select;selected.has(id)?selected.delete(id):selected.add(id);b.setAttribute('aria-pressed',selected.has(id));b.innerHTML=selected.has(id)?icon('shield'):'';onChange()})}
function picker(title,available,submit,back){const selected=new Set();screen(title,available.length?`<div class="flow-toolbar"><span class="flow-count" id="selected-count">0 selected</span><button id="select-all">Select all</button></div>${grid(available,selected)}${primary('pick-submit','Continue')}`:empty('No photos available','No more items to add.'),back);layout('picker');if(!available.length)return;dock('#pick-submit');function update(){q('#selected-count').textContent=selected.size+' selected';q('#pick-submit').disabled=!selected.size}wireGrid(selected,update);q('#select-all').onclick=()=>{const all=selected.size===available.length;q('#select-all').textContent=all?'Select all':'Deselect all';available.forEach(id=>all?selected.delete(id):selected.add(id));qa('[data-select]').forEach(b=>{b.setAttribute('aria-pressed',selected.has(b.dataset.select));b.innerHTML=selected.has(b.dataset.select)?icon('shield'):''});update()};q('#pick-submit').onclick=()=>submit([...selected]);update()}
function privacyHome(){scanned=data.scanned;hidden=data.items.filter(x=>x.hidden).length;groups.forEach((g,i)=>g.count=data.items.filter(x=>x.group===i&&!x.hidden).length);q('#privacy-before').hidden=data.scanned;q('#privacy-after').hidden=!data.scanned;q('#hidden-count').textContent=hidden;if(data.scanned){renderResults();qa('[data-group]').forEach(b=>b.onclick=()=>reviewItems(Number(b.dataset.group)));q('#review-all').onclick=()=>reviewItems()}}
function startScan(){if(!data.permissions){modal('Photo access',`${emblem('photo')}<p>Allow access to the photos you choose to review.</p>${primary('photo-access','Select photos')}${secondary('photo-not-now','Not now')}`);q('#photo-not-now').onclick=closeModal;q('#photo-access').onclick=()=>{closeModal();data.permissions=true;save();doScan()};return}doScan()}
function doScan(){const chosen=scenario();operation('Privacy','Scanning photos…',()=>{if(['failure','unavailable'].includes(chosen)){errorPage('Privacy','Photos could not be scanned. Your previous results have been kept.',doScan,home);return}if(!data.scanned){data.items=chosen==='empty'?[]:catalog.slice(0,24).map(x=>({...x}));data.scanned=true}save();privacyHome();home()},home)}
function reviewItems(group){const ids=data.items.filter(x=>!x.hidden&&(group===undefined||x.group===group)).map(x=>x.id);picker(group===undefined?'Review photos':groups[group].name,ids,selected=>confirm('Hide photos?',`${selected.length} selected photos will move to Hidden media.`,'Hide photos',()=>{const finish=()=>{data.items.forEach(x=>{if(selected.includes(x.id))x.hidden=true});save();privacyHome();screen('Photos hidden',emblem('eye')+`<div class="flow-center"><h3>${selected.length} photos hidden</h3></div>`+primary('hidden-done','Done'),()=>reviewItems(group));layout('success');dock('#hidden-done');q('#hidden-done').onclick=home};if(!data.hiddenCredential)hiddenAuthenticate(finish,()=>reviewItems(group));else finish()}),home);if(ids.length)q('#pick-submit').textContent='Hide selected';else page.querySelector('.flow-body').innerHTML=empty('Nothing to review','There are no photos in this category.','photo')}
function hiddenMedia(){if(!hiddenUnlocked)return hiddenAuthenticate(hiddenMedia);const ids=data.items.filter(x=>x.hidden).map(x=>x.id);picker('Hidden media',ids,selected=>confirm('Restore photos?',`${selected.length} photos will return to your review list.`,'Restore photos',()=>{data.items.forEach(x=>{if(selected.includes(x.id))x.hidden=false});save();privacyHome();hiddenMedia()}),home);if(ids.length)q('#pick-submit').textContent='Restore selected';else page.querySelector('.flow-body').innerHTML=empty('No hidden media','Photos you hide will appear here.','folder')}

// Hidden media prototype passcode.
let hiddenUnlocked=false,hiddenAuthActive=false,hiddenAuthEpoch=0;
async function hiddenDigest(pin,salt){
 const bytes=new TextEncoder().encode(salt+':'+pin);
 return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)),b=>b.toString(16).padStart(2,'0')).join('');
}
function hiddenAuthenticate(done,back=home,promptTitle){
 hiddenAuthActive=true;hiddenUnlocked=false;
 const epoch=++hiddenAuthEpoch,existing=data.hiddenCredential;let first='';
 function show(confirming=false){
  pinScreen({screenTitle:'Hidden media',title:existing?(promptTitle||'Enter Hidden media<br>passcode'):confirming?'Confirm Hidden media<br>passcode':'Create Hidden media<br>passcode',
   id:'hidden-pin',buttonId:'hidden-pin-submit',label:existing?'Unlock':confirming?'Save passcode':'Continue',
   back:()=>{if(confirming){first='';show(false)}else{hiddenAuthActive=false;hiddenAuthEpoch++;back()}},
   submit:async(value,error)=>{
    if(!/^\d{4}$/.test(value)){error('Enter 4 digits.');return}
    if(!existing&&!confirming){first=value;show(true);return}
    if(!existing&&value!==first){error('Passcodes don’t match. Try again.');return}
    const button=q('#hidden-pin-submit');button.disabled=true;
    try{
     const salt=existing?.salt||Array.from(crypto.getRandomValues(new Uint8Array(16)),b=>b.toString(16).padStart(2,'0')).join('');
     const hash=await hiddenDigest(value,salt);if(epoch!==hiddenAuthEpoch)return;
     if(existing&&hash!==existing.hash){error('Incorrect passcode. Try again.');return}
     if(!existing){
      const credential={salt,hash};data.hiddenCredential=credential;
      try{localStorage.setItem(key,JSON.stringify(data))}catch{delete data.hiddenCredential;throw Error('storage')}
     }
     hiddenAuthActive=false;hiddenUnlocked=true;done();
    }catch{if(epoch===hiddenAuthEpoch)error('Could not save or verify. Please try again.')}
   }});
 }
 show();
}

function hiddenPasscodeSettings(){
 const finish=()=>{hiddenUnlocked=false;hiddenAuthActive=false;hiddenAuthEpoch++;settings();toast('Hidden media passcode saved')};
 if(!data.hiddenCredential)return hiddenAuthenticate(finish,settings);
 hiddenAuthenticate(()=>{
  hiddenUnlocked=false;hiddenAuthActive=true;
  const epoch=++hiddenAuthEpoch,original=data.hiddenCredential;let first='';
  const cancel=()=>{hiddenAuthActive=false;hiddenAuthEpoch++;settings()};
  function show(confirming=false){
   pinScreen({screenTitle:'Hidden media',title:confirming?'Confirm new<br>passcode':'Create new<br>passcode',
    id:'hidden-new-pin',buttonId:'hidden-new-submit',label:confirming?'Save passcode':'Continue',
    back:()=>{if(confirming){first='';show(false)}else cancel()},
    submit:async(value,error)=>{
     if(!/^\d{4}$/.test(value)){error('Enter 4 digits.');return}
     if(!confirming){first=value;show(true);return}
     if(value!==first){error('Passcodes don’t match. Try again.');return}
     q('#hidden-new-submit').disabled=true;
     try{
      const salt=Array.from(crypto.getRandomValues(new Uint8Array(16)),b=>b.toString(16).padStart(2,'0')).join('');
      const hash=await hiddenDigest(value,salt);if(epoch!==hiddenAuthEpoch)return;
      if(data.hiddenCredential!==original){error('Passcode changed. Return to Settings and try again.');return}
      const credential={salt,hash};
      localStorage.setItem(key,JSON.stringify({...data,hiddenCredential:credential}));
      data.hiddenCredential=credential;finish();
     }catch{if(epoch===hiddenAuthEpoch)error('Could not save. Your current passcode is unchanged.')}
    }});
  }
  show();
 },settings,'Enter current<br>passcode');
}

document.addEventListener('visibilitychange',()=>{
 if(document.hidden&&(hiddenUnlocked||hiddenAuthActive)){hiddenUnlocked=false;hiddenAuthActive=false;hiddenAuthEpoch++;if(dialog.open)closeModal();home()}
});

q('#scan').onclick=startScan;q('#rescan').onclick=startScan;q('#review-all').onclick=()=>reviewItems();q('#hidden-media').onclick=hiddenMedia;privacyHome();
// Shared keypad for Hidden media authentication.
function pinScreen({screenTitle='Hidden media',title,kind='lock',id,buttonId,label,back,submit,length=4}){
 screen(screenTitle,`<div class="pin-heading">${emblem(kind)}<h3>${title}</h3></div><div class="pin-entry"><div class="pin-slots ${length>4?'pin-legacy':''}" aria-hidden="true">${Array.from({length},()=>'<span></span>').join('')}</div><input id="${id}" class="pin-input" type="password" aria-label="Passcode" inputmode="none" autocomplete="off" maxlength="${length}" aria-describedby="pin-error"></div><p id="pin-error" class="flow-error pin-error" role="alert"></p><div class="pin-keypad" aria-label="Numeric keypad">${[1,2,3,4,5,6,7,8,9].map(n=>`<button type="button" data-digit="${n}" aria-label="${n}">${n}</button>`).join('')}<span></span><button type="button" data-digit="0" aria-label="0">0</button><button type="button" class="pin-delete" aria-label="Delete digit">Delete</button></div>${primary(buttonId,label)}`,back);
 layout('pin');dock('#'+buttonId);const input=q('#'+id),button=q('#'+buttonId),slots=[...page.querySelectorAll('.pin-slots span')];
 const update=()=>{input.value=input.value.replace(/\D/g,'').slice(0,length);slots.forEach((el,i)=>{el.classList.toggle('filled',i<input.value.length);el.classList.toggle('next',i===input.value.length)});q('#pin-error').textContent='';page.classList.remove('pin-invalid');button.disabled=input.value.length<4};
 input.oninput=update;input.onkeydown=e=>{if(e.key==='Enter'&&!button.disabled){e.preventDefault();button.click()}};
 page.querySelectorAll('[data-digit]').forEach(b=>b.onclick=()=>{if(input.value.length<length){input.value+=b.dataset.digit;update()}});
 page.querySelector('.pin-delete').onclick=()=>{input.value=input.value.slice(0,-1);update()};
 button.onclick=()=>submit(input.value,message=>{q('#pin-error').textContent=message;page.classList.add('pin-invalid');input.value='';slots.forEach(el=>el.classList.remove('filled','next'));button.disabled=true});update();
}
// Shared protection persistence and disable confirmation, preserving existing home UI.
function persistProtection(){data.protection=protections.map(p=>({authorized:p.authorized,enabled:p.enabled,confirmedByUser:!!p.confirmedByUser}));save()}
protections.forEach((p,i)=>{if(data.protection[i])Object.assign(p,data.protection[i]);p.button.onclick=()=>{if(!p.authorized){showPermissionGuide([p]);return}if(p.enabled){confirm('Turn off protection?',`${p.name} will be turned off.`,'Turn Off',()=>{p.enabled=false;persistProtection();checkProtection()})}else{p.enabled=true;persistProtection();checkProtection()}}});
const oldSync=syncProtection;syncProtection=function(){oldSync();persistProtection()};syncProtection();
let enablingAll=false;const originalGuide=showPermissionGuide;showPermissionGuide=function(targets,all=false,contextTitle){enablingAll=all;originalGuide(targets,all,contextTitle);enhanceGuide()};
master.onclick=()=>{const missing=protections.filter(p=>!p.authorized);if(missing.length)showPermissionGuide(missing,true);else{protections.forEach(p=>p.enabled=true);persistProtection();checkProtection()}};
function enhanceGuide(){const art=q('.ios-guide');if(!art)return;const motionIndex=[0,1,2,3].find(i=>art.classList.contains('ios-guide-'+i));if(motionIndex!==undefined){clearInterval(guideTimer);const motion=window.SecurityTutorialMotion.mount(art,motionIndex);const grant=q('#grant-permission'),handler=grant.onclick;grant.onclick=()=>{motion.stop();handler();if(!dialog.open&&enablingAll){protections.forEach(p=>p.enabled=true);enablingAll=false;syncProtection()}persistProtection();enhanceGuide()};return;}let step=0,startX=0;const dots=document.createElement('div');dots.className='guide-dots';dots.innerHTML=[0,1,2].map(i=>`<button aria-label="Tutorial step ${i+1}" aria-current="${i===0}"></button>`).join('');art.after(dots);const draw=i=>{step=(i+3)%3;qa('.permission-steps li').forEach((li,n)=>li.classList.toggle('current',n===step));[...dots.children].forEach((b,n)=>b.setAttribute('aria-current',n===step));art.style.backgroundPositionX=art.classList.contains('ios-guide-1')||art.classList.contains('ios-guide-3')?'100%':'0%';art.style.transform=step===2?'scale(1.02)':'scale(1)'};clearInterval(guideTimer);if(!matchMedia('(prefers-reduced-motion: reduce)').matches)guideTimer=setInterval(()=>draw(step+1),1800);[...dots.children].forEach((b,i)=>b.onclick=()=>draw(i));art.onpointerdown=e=>{startX=e.clientX;art.setPointerCapture(e.pointerId)};art.onpointerup=e=>{if(Math.abs(e.clientX-startX)>20)draw(step+(e.clientX<startX?1:-1))};art.tabIndex=0;art.onkeydown=e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();draw(step+(e.key==='ArrowRight'?1:-1))}};const grant=q('#grant-permission'),handler=grant.onclick;grant.onclick=()=>{handler();if(!dialog.open&&enablingAll){protections.forEach(p=>p.enabled=true);enablingAll=false;syncProtection()}persistProtection();enhanceGuide()}}
phone.addEventListener('click',e=>{if(e.detail>1&&e.target.closest('.flow-page button,#dialog button')){e.preventDefault();e.stopImmediatePropagation()}},true);
window.Flow={home,data,save,screen,layout,dock,confirm,operation,emblem,row,primary,secondary,esc};
})();
