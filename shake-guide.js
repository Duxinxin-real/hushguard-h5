/* Illustrated iOS walkthrough. H5 mini-player stays inside this phone canvas.
   Completion is user-confirmed, never inferred from opening Settings. */
(()=>{
const phone=document.querySelector('.phone'),p=protections[0],oldGuide=showPermissionGuide,oldClick=p.button.onclick;
if(!p.confirmedByUser){p.authorized=false;p.enabled=false;syncProtection()}
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const layer=document.createElement('section');layer.className='shake-layer';layer.hidden=true;layer.setAttribute('aria-label','Shake Ad Protection tutorial');
layer.innerHTML=`<div class="shake-heading"><h2>Shake Ad Protection</h2><button aria-label="Close tutorial">×</button></div><div class="shake-player" role="img" aria-label="Animated iOS settings walkthrough"><div class="shake-ios-status"><span>9:41</span><span><img src="assets/icons/signal.svg" alt=""><img src="assets/icons/wifi.svg" alt=""><img src="assets/icons/battery-full.svg" alt=""></span></div><div class="shake-ios-nav"></div><div class="shake-ios-scroll"></div><div class="shake-ios-home"></div><div class="shake-focus"></div><img class="shake-hand" src="assets/tutorial/hand.svg" alt=""><div class="shake-ripple"></div></div><div class="shake-progress"></div><p class="shake-caption"></p><button class="primary shake-open">Open</button><p class="shake-foot">Availability depends on your iOS version and region.</p><button class="shake-mini-expand" aria-label="Expand tutorial"></button>`;
phone.append(layer);
const away=document.createElement('section');away.className='shake-return';away.hidden=true;away.innerHTML='<button class="shake-back">‹ Back to HushGuard</button><h2>Settings</h2><div class="shake-ios-group"><div class="shake-ios-row">Privacy &amp; Security</div></div><p>Follow the tutorial in the corner.</p>';phone.append(away);
const prompt=document.createElement('section');prompt.className='shake-confirm';prompt.hidden=true;prompt.setAttribute('role','dialog');prompt.setAttribute('aria-modal','true');prompt.setAttribute('aria-label','Confirm Shake Ad Protection');prompt.innerHTML='<div class="shake-confirm-card"><h2>Did you enable it?</h2><p>Have you added the apps you want to Restrict Motion Data?</p><button class="shake-yes">Yes, I’ve enabled it</button><button class="shake-no">Not yet — continue</button></div>';phone.append(prompt);
const $=s=>layer.querySelector(s),scroll=$('.shake-ios-scroll'),nav=$('.shake-ios-nav'),focus=$('.shake-focus'),hand=$('.shake-hand'),ripple=$('.shake-ripple');
const row=(s,target=false,end='chevron')=>`<div class="shake-ios-row" ${target?'data-target="true"':''}>${s}${end==='toggle'?'<span class="shake-ios-toggle"></span>':end==='selected'?'<span style="margin-left:auto;color:#007aff">✓</span>':end==='none'?'':'<img src="assets/icons/chevron-right.svg" alt="">'}</div>`;
const group=(rows)=>'<div class="shake-ios-group">'+rows+'</div>';
const scenes=[
 {title:'Settings',back:'',caption:'Scroll down to Privacy & Security',html:'<h3>Settings</h3>'+group(row('Airplane Mode')+row('Wi-Fi')+row('Bluetooth')+row('Cellular')+row('Personal Hotspot')+row('Battery'))+group(['General','Accessibility','StandBy','Camera','Control Center','Display & Brightness','Home Screen & App Library','Search','Siri','Wallpaper','Notifications','Sounds & Haptics','Focus','Screen Time','Face ID & Passcode','Emergency SOS'].map(s=>row(s)).join('')+row('Privacy & Security',true))+group(row('Apps'))},
 {title:'Privacy & Security',back:'Settings',caption:'Scroll to Motion & Fitness',html:group(row('Location Services')+row('Tracking'))+group(['Contacts','Calendars','Reminders','Photos','Bluetooth','Local Network','Nearby Interactions','Microphone','Speech Recognition','Camera','Health','HomeKit','Media & Apple Music'].map(s=>row(s)).join('')+row('Motion & Fitness',true))+group(row('Safety Check')+row('Sensitive Content Warning'))},
 {title:'Motion & Fitness',back:'Privacy & Security',caption:'Tap Restrict Motion Data',html:group(row('Fitness Tracking',false,'toggle'))+'<p class="shake-ios-note">Allow apps to access your motion and fitness activity.</p>'+group(row('Restrict Motion Data',true))},
 {title:'Restrict Motion Data',back:'Motion & Fitness',caption:'Tap Edit to choose apps',edit:true,html:'<p class="shake-ios-note" style="margin-top:20px">Choose apps to restrict access to motion data.</p>'},
 {title:'Restrict Motion Data',back:'Motion & Fitness',caption:'Select the apps you want to restrict',edit:true,html:'<div class="shake-ios-label">APPS</div>'+group(row('Example App',true,'none'))},
 {title:'Restrict Motion Data',back:'Motion & Fitness',caption:'Tap Done to save your selection',done:true,html:'<div class="shake-ios-label">APPS</div>'+group(row('Example App',false,'selected'))},
 {title:'Restrict Motion Data',back:'Motion & Fitness',caption:'The app is now in your restricted list',rest:true,html:'<div class="shake-ios-label">RESTRICTED APPS</div>'+group(row('Example App',false,'none'))}
];
$('.shake-progress').innerHTML=scenes.map((s,i)=>`<button aria-label="Tutorial step ${i+1}" data-scene="${i}"></button>`).join('');
let index=0,start=0,raf=0,active=false,pending=false,remaining=[],all=false,returned=false,lastFrame=0;
const duration=5200,ease=t=>1-Math.pow(1-Math.max(0,Math.min(1,t)),3);
function inert(on){phone.querySelectorAll(':scope>header,:scope>.tab-page,:scope>.nav').forEach(e=>e.inert=on)}
function scene(i){index=i;const s=scenes[i];nav.innerHTML=`<span class="ios-back">${s.back?'‹':''}</span><span class="ios-title">${s.title}</span>${s.edit||s.done?'<span class="ios-edit">'+(s.done?'Done':'Edit')+'</span>':''}`;scroll.innerHTML=s.html;scroll.scrollTop=0;if(!reduced.matches)scroll.animate([{opacity:.3,transform:'translateX(35px)'},{opacity:1,transform:'translateX(0)'}],{duration:320,easing:'ease-out'});$('.shake-caption').textContent=s.caption;layer.querySelectorAll('[data-scene]').forEach((b,n)=>b.setAttribute('aria-current',String(n===i)));start=performance.now();layer.dataset.scene=String(i);focus.style.opacity=hand.style.opacity=ripple.style.opacity=0;}
function paint(t){const s=scenes[index],elapsed=t-start;let target=scroll.querySelector('[data-target]');const max=scroll.scrollHeight-scroll.clientHeight;const desired=target?Math.max(0,Math.min(max,target.offsetTop-scroll.offsetTop-180)):0;
 if(!reduced.matches){const down=ease((elapsed-500)/1800);scroll.scrollTop=desired*down+(index<2&&elapsed>2400&&elapsed<3000?14*Math.sin((elapsed-2400)/600*Math.PI):0)}else scroll.scrollTop=desired;
 const menu=(s.edit||s.done)&&!target;const y=target?target.offsetTop-scroll.scrollTop:48,x=menu?244:18,yy=menu?48:y,w=menu?40:256;
 if(!s.rest){const ready=reduced.matches||elapsed>2600;focus.style.cssText=`left:${x}px;top:${yy}px;width:${w}px;height:${menu?34:43}px;opacity:${ready?1:0}`;hand.style.cssText=`left:${menu?251:226}px;top:${yy+16}px;opacity:${ready?1:0};transform:scale(${elapsed>3450&&elapsed<3800?.85:1})`;const pulse=(elapsed-3400)/700;ripple.style.cssText=`left:${menu?244:220}px;top:${yy+6}px;opacity:${pulse>0&&pulse<1?1-pulse:0};transform:scale(${1+Math.max(0,pulse)})`}
 if(index<2&&elapsed>500&&elapsed<2300&&!reduced.matches){hand.style.cssText=`left:218px;top:${400-150*((elapsed-500)%900)/900}px;opacity:.85`; }
 layer.dataset.scroll=String(Math.round(scroll.scrollTop));lastFrame++;layer.dataset.frames=String(lastFrame);
 if(elapsed>duration&&!reduced.matches)scene((index+1)%scenes.length);if(active)raf=requestAnimationFrame(paint);
}
function play(){if(active)return;active=true;raf=requestAnimationFrame(paint)}
function stop(){active=false;cancelAnimationFrame(raf)}
function end(){stop();layer.hidden=away.hidden=prompt.hidden=true;layer.classList.remove('mini');pending=false;sessionStorage.removeItem('hushguard-shake-pending');inert(false)}
function show(targets=[p],enableAll=false){remaining=targets.filter(x=>x!==p);all=enableAll;layer.hidden=false;away.hidden=prompt.hidden=true;layer.classList.remove('mini');inert(true);scene(0);play();$('.shake-open').focus()}
function ask(){if(!pending||returned)return;returned=true;away.hidden=true;prompt.hidden=false;inert(true);prompt.querySelector('.shake-yes').focus()}
$('.shake-open').onclick=()=>{pending=true;returned=false;sessionStorage.setItem('hushguard-shake-pending','1');layer.classList.add('mini');away.hidden=false;inert(true);away.querySelector('button').focus()};
$('.shake-mini-expand').onclick=()=>{layer.classList.remove('mini');away.hidden=true;returned=false;$('.shake-open').focus()};
$('.shake-heading button').onclick=()=>{end();p.button.focus()};
away.querySelector('button').onclick=ask;
prompt.querySelector('.shake-no').onclick=()=>{prompt.hidden=true;returned=false;away.hidden=false;play();away.querySelector('button').focus()};
prompt.querySelector('.shake-yes').onclick=()=>{const queue=remaining,wasAll=all;end();p.authorized=true;p.enabled=true;p.confirmedByUser=true;syncProtection();if(queue.length)oldGuide(queue,wasAll);else{if(wasAll)protections.forEach(x=>x.enabled=true);checkProtection()}p.button.focus()};
layer.querySelectorAll('[data-scene]').forEach(b=>b.onclick=()=>scene(Number(b.dataset.scene)));
showPermissionGuide=function(targets,enableAll=false){if(targets.includes(p)){show(targets,enableAll)}else oldGuide(targets,enableAll)};
p.button.onclick=()=>{if(p.enabled)oldClick();else show([p])};
document.addEventListener('visibilitychange',()=>{if(document.hidden){if(active)stop()}else{if(!layer.hidden)play();if(pending)ask()}});
window.addEventListener('pagehide',stop);
document.addEventListener('keydown',e=>{if(!layer.hidden&&e.key==='Tab'){const area=!prompt.hidden?prompt:!away.hidden?away:layer;const buttons=[...area.querySelectorAll('button')].filter(b=>b.offsetWidth>0);if(e.shiftKey&&document.activeElement===buttons[0]){e.preventDefault();buttons.at(-1)?.focus()}else if(!e.shiftKey&&document.activeElement===buttons.at(-1)){e.preventDefault();buttons[0]?.focus()}}if(!layer.hidden&&e.key==='Escape'){e.stopImmediatePropagation();if(prompt.hidden)end()}},true);
if(sessionStorage.getItem('hushguard-shake-pending')){show([p]);pending=true;layer.classList.add('mini');ask()}
})();
