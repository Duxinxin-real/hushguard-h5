/* Continuous, locally rendered operation illustrations. Paths: Apple support;
   not a pixel-exact iOS recording. No system permissions are changed here. */
(() => {
const W=540,H=810,STEP=1850,FINAL=3600;
const chapter=(title,back,rows,target,caption,options={})=>({title,back,rows,target,caption,...options});
const sequences={
 shake:[chapter('Settings','',[{label:'Privacy & Security'}],0,'Open Privacy & Security'),chapter('Privacy & Security','Settings',[{label:'Motion & Fitness'}],0,'Open Motion & Fitness'),chapter('Motion & Fitness','Privacy & Security',[{label:'Restrict Motion Data'}],0,'Open Restrict Motion Data'),chapter('Restrict Motion Data','Motion & Fitness',[],0,'Tap Edit',{edit:true}),chapter('Restrict Motion Data','Motion & Fitness',[{label:'Example App',kind:'selection',stateLabel:'Selected'}],0,'Select an app',{group:'APPS'}),chapter('Restrict Motion Data','Motion & Fitness',[{label:'Example App'}],0,'App added to the restricted list',{group:'RESTRICTED APPS',final:true,rest:true})],
 web:[chapter('Settings','',[{label:'Apps'}],0,'Tap Apps'),chapter('Apps','Settings',[{label:'Safari'}],0,'Choose Safari'),chapter('Safari','Apps',[{label:'Extensions'}],0,'Open Extensions'),chapter('Extensions','Safari',[{label:'HushGuard',kind:'toggle'}],0,'Enable the content blocker',{group:'CONTENT BLOCKERS',final:true})],
 call:[chapter('Settings','',[{label:'Apps'}],0,'Tap Apps'),chapter('Apps','Settings',[{label:'Phone'}],0,'Choose Phone'),chapter('Phone','Apps',[{label:'Call Blocking & Identification'}],0,'Open Call Blocking & Identification'),chapter('Call Blocking & Identification','Phone',[{label:'HushGuard',kind:'toggle'}],0,'Enable call identification',{group:'CALL IDENTIFICATION APPS',final:true})],
 sms:[chapter('Messages','',[],0,'Open Filter',{filter:true}),chapter('Filters','Messages',[{label:'Manage Filtering'}],0,'Open Manage Filtering'),chapter('Manage Filtering','Filters',[{label:'Screen Unknown Senders',kind:'toggle'},{label:'SMS Filters'}],0,'Turn on Screen Unknown Senders'),chapter('Manage Filtering','Filters',[{label:'Screen Unknown Senders',kind:'toggle',on:true},{label:'SMS Filters'}],1,'Open SMS Filters',{same:true}),chapter('SMS Filters','Manage Filtering',[{label:'HushGuard',kind:'selection'}],0,'Enable the SMS filter',{group:'SMS FILTERS',final:true})]
};
const clamp=n=>Math.max(0,Math.min(1,n));const ease=n=>1-Math.pow(1-clamp(n),3);
function rounded(ctx,x,y,w,h,r,fill){ctx.beginPath();ctx.roundRect(x,y,w,h,r);ctx.fillStyle=fill;ctx.fill()}
function text(ctx,str,x,y,size=27,color='#141519',weight=400){ctx.fillStyle=color;ctx.font=`${weight} ${size}px -apple-system,BlinkMacSystemFont,sans-serif`;ctx.textBaseline='middle';ctx.fillText(str,x,y)}
function lines(ctx,str,x,y,max,size=27,color='#141519',weight=400){ctx.font=`${weight} ${size}px -apple-system,BlinkMacSystemFont,sans-serif`;const words=str.split(' ');let line='',row=0;for(const word of words){const next=line?line+' '+word:word;if(ctx.measureText(next).width>max&&line){text(ctx,line,x,y+row*(size+7),size,color,weight);line=word;row++}else line=next}text(ctx,line,x,y+row*(size+7),size,color,weight)}
function rowY(s,i){return (s.group?256:224)+i*104}
function activation(s,local){return s.final?ease((local-1050)/340):ease((local-1120)/340)}
function drawScreen(ctx,s,local,{completed=false}={}){
 ctx.fillStyle='#f2f2f7';ctx.fillRect(0,0,W,H);text(ctx,'9:41',34,32,22,'#16171a',600);
 // No invented app icons or logos. Only the verified menu/action labels are shown.
 if(s.back)text(ctx,s.back,28,88,26,'#0877ef');
 lines(ctx,s.title,30,150,480,s.title.length>29?32:43,'#151619',700);
 if(s.edit){text(ctx,'Edit',448,88,24,'#0877ef');return}
 if(s.filter){rounded(ctx,380,205,128,55,27,'#fff');text(ctx,'Filter',410,233,24,'#0877ef',500);return}
 if(s.group)text(ctx,s.group,34,210,20,'#7c7d84',450);
 s.rows.forEach((r,i)=>{
  const y=rowY(s,i),active=completed?1:activation(s,local),on=r.on?1:r.kind?active:0;
  rounded(ctx,24,y,492,96,18,'#fff');
  const max=r.kind?340:454;lines(ctx,r.label,44,y+45,max,r.label.length>26?28:33);
  if(r.kind==='toggle'){
   const x=430,yy=y+28;rounded(ctx,x,yy,66,40,20,on>.01?`rgb(${Math.round(201-147*on)},${Math.round(203+ -4*on)},${Math.round(209-120*on)})`:'#c9cbd1');
   ctx.shadowColor='#0002';ctx.shadowBlur=4;ctx.shadowOffsetY=1;rounded(ctx,x+3+26*on,yy+3,34,34,17,'#fff');ctx.shadowBlur=0;ctx.shadowOffsetY=0;
  }else if(r.kind==='selection'&&on>0){ctx.globalAlpha=on;rounded(ctx,386,y+30,112,36,18,'#e6f6ec');text(ctx,r.stateLabel||'Enabled',399,y+48,20,'#24884c',550);ctx.globalAlpha=1}
 });
}
function tap(ctx,s,local){if(s.rest)return;const start=s.final?650:800;const p=(local-start)/650;if(p<0||p>1)return;const x=s.filter?446:466,y=s.edit?88:s.filter?233:rowY(s,s.target)+48;ctx.save();ctx.globalAlpha=Math.sin(p*Math.PI)*.8;ctx.strokeStyle='#ff9b43';ctx.lineWidth=3;ctx.beginPath();ctx.arc(x,y,15+25*p,0,Math.PI*2);ctx.stroke();ctx.globalAlpha=Math.sin(p*Math.PI)*.7;ctx.fillStyle='#ffb475';ctx.beginPath();ctx.arc(x,y,7,0,Math.PI*2);ctx.fill();ctx.restore()}
function create(canvas,key,{onChapter=()=>{},autoplay=true}={}){
 const chapters=sequences[key];if(!chapters)throw Error('Unsupported tutorial');canvas.width=W;canvas.height=H;const ctx=canvas.getContext('2d');const starts=chapters.map((_,i)=>i*STEP),duration=(chapters.length-1)*STEP+FINAL;
 let raf=0,running=true,origin=performance.now(),offset=0,last=-1,frames=0;
 function render(time){let t=((time%duration)+duration)%duration,index=Math.min(chapters.length-1,Math.floor(t/STEP)),local=t-starts[index];const s=chapters[index];ctx.clearRect(0,0,W,H);
  if(index>0&&!s.same&&local<380){const p=ease(local/380);ctx.save();ctx.translate(-W*.25*p,0);drawScreen(ctx,chapters[index-1],STEP,{completed:true});ctx.fillStyle=`rgba(0,0,0,${p*.06})`;ctx.fillRect(0,0,W,H);ctx.restore();ctx.save();ctx.translate(W*(1-p),0);drawScreen(ctx,s,0);ctx.restore()}
  else drawScreen(ctx,s,local);
  tap(ctx,s,local);canvas.dataset.chapter=String(index);canvas.dataset.time=String(Math.round(t));canvas.dataset.enabled=String(Boolean(s.final&&activation(s,local)>=1));canvas.dataset.frames=String(++frames);canvas.dataset.running=String(running);
  if(last!==index){last=index;onChapter(index,s.caption)}
 }
 function tick(now){if(!running)return;render(offset+now-origin);raf=requestAnimationFrame(tick)}
 function seek(index){offset=starts[Math.max(0,Math.min(chapters.length-1,index))];origin=performance.now();last=-1;render(offset)}
 function destroy(){running=false;cancelAnimationFrame(raf);canvas.dataset.running='false'}
 render(0);if(autoplay)raf=requestAnimationFrame(tick);else{running=false;render(duration-500)}
 return {seek,destroy,render,duration,chapters,canvas,get chapter(){return Number(canvas.dataset.chapter)}};
}
function mount(art,index){const key={0:'shake',1:'web',2:'call',3:'sms'}[index];if(!key)return null;
 const host=art.closest('.permission-guide');art.classList.add('motion-guide');art.style.transform='none';art.style.backgroundImage='none';art.innerHTML=`<canvas aria-label="${key==='shake'?'Restrict Motion Data':key==='web'?'Safari content blocker':key==='call'?'Call identification':'SMS filtering'} operation animation"></canvas>`;
 host.querySelector('.permission-steps')?.remove();host.querySelector('.guide-caption')?.remove();host.querySelector('.guide-dots')?.remove();
 const caption=document.createElement('div');caption.className='motion-caption';caption.setAttribute('aria-live','off');const dots=document.createElement('div');dots.className='guide-dots';dots.innerHTML=sequences[key].map((_,i)=>`<button aria-label="Tutorial step ${i+1}" aria-current="false"></button>`).join('');art.after(dots);dots.after(caption);
 const player=create(art.querySelector('canvas'),key,{autoplay:!matchMedia('(prefers-reduced-motion: reduce)').matches,onChapter:(i,label)=>{caption.textContent=label;[...dots.children].forEach((b,n)=>b.setAttribute('aria-current',String(n===i)))}});
 [...dots.children].forEach((b,i)=>b.onclick=()=>player.seek(i));let start=0;art.tabIndex=0;art.onpointerdown=e=>{start=e.clientX;art.setPointerCapture(e.pointerId)};art.onpointerup=e=>{if(Math.abs(e.clientX-start)>24)player.seek(player.chapter+(e.clientX<start?1:-1))};art.onkeydown=e=>{if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();player.seek(player.chapter+(e.key==='ArrowRight'?1:-1))}};
 const stop=()=>{player.destroy();art.onpointerdown=art.onpointerup=art.onkeydown=null};document.querySelector('#dialog').addEventListener('close',stop,{once:true});return {stop,player};
}
window.SecurityTutorialMotion={create,mount,sequences};
})();
