/* Decorative startup only. Never controls protection state or permissions. */
(()=>{
 const phone=document.querySelector('.phone');if(!phone)return;
 const reduced=matchMedia('(prefers-reduced-motion: reduce)');
 if(reduced.matches)return;
 const layer=document.createElement('div');layer.className='security-launch';layer.setAttribute('aria-hidden','true');
 const mark=new Image();mark.className='security-launch-mark';mark.alt='';mark.width=156;mark.height=156;
 let closed=false,hold,removal;
 function finish(immediate=false){if(closed)return;closed=true;clearTimeout(deadline);clearTimeout(hold);layer.dataset.leaving='true';if(immediate)layer.remove();else removal=setTimeout(()=>layer.remove(),340);reduced.removeEventListener('change',onMotion)}
 function onMotion(e){if(e.matches)finish(true)}
 const deadline=setTimeout(()=>finish(true),2400);
 mark.onload=()=>{if(closed)return;layer.dataset.ready='true';hold=setTimeout(()=>finish(),1550)};
 mark.onerror=()=>finish(true);
 const art=document.createElement('div');art.className='security-launch-art';
 art.innerHTML=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><defs><linearGradient id="launch-warm" x1="80" y1="80" x2="410" y2="430" gradientUnits="userSpaceOnUse"><stop stop-color="#fff0d6"/><stop offset="1" stop-color="#ff8738"/></linearGradient></defs><path class="launch-ring" pathLength="1" d="M358 143A158 158 0 1 0 409 296" fill="none" stroke="url(#launch-warm)" stroke-width="28" stroke-linecap="round"/><g class="launch-center"><path d="M196 195L256 174L316 195V263Q316 311 256 341Q196 311 196 263Z" fill="#f9f4ea"/><path d="M232 256L251 275L283 237" fill="none" stroke="#252d32" stroke-width="15" stroke-linecap="round" stroke-linejoin="round"/><circle cx="412" cy="227" r="14" fill="#ff994b"/></g></svg>`;
 layer.append(art);phone.append(layer);reduced.addEventListener('change',onMotion);
 window.addEventListener('pagehide',()=>{finish(true);clearTimeout(removal);layer.remove()},{once:true});
 mark.src=new URL('assets/brand/logo.svg',document.currentScript.src).href;
})();
