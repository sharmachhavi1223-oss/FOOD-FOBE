// Cursor
const cur=document.getElementById('cur'),cur2=document.getElementById('cur2');
let mx=0,my=0,rx=0,ry=0;
document.addEventListener('mousemove',e=>{mx=e.clientX;my=e.clientY});
(function loop(){
  cur.style.transform=`translate(${mx-4}px,${my-4}px)`;
  rx+=(mx-rx)*.1;ry+=(my-ry)*.1;
  cur2.style.transform=`translate(${rx-18}px,${ry-18}px)`;
  requestAnimationFrame(loop);
})();

// Particles
const canvas=document.getElementById('bg-canvas');
const ctx=canvas.getContext('2d');
let W,H;
function resize(){W=canvas.width=innerWidth;H=canvas.height=innerHeight}
resize();window.addEventListener('resize',resize);
const particles=Array.from({length:90},()=>({
  x:Math.random()*2000,y:Math.random()*1200,r:Math.random()*1.2+.2,
  vx:(Math.random()-.5)*.2,vy:(Math.random()-.5)*.2,life:Math.random(),
  ml:Math.random()*.015+.003,
  hue:Math.random()<.6?'255,61,0':Math.random()<.5?'245,201,71':'0,201,122'
}));
function animParticles(){
  ctx.clearRect(0,0,W,H);
  // connections
  for(let i=0;i<particles.length;i++){
    for(let j=i+1;j<particles.length;j++){
      const dx=particles[i].x-particles[j].x,dy=particles[i].y-particles[j].y;
      const d=Math.sqrt(dx*dx+dy*dy);
      if(d<120){ctx.beginPath();ctx.moveTo(particles[i].x,particles[i].y);ctx.lineTo(particles[j].x,particles[j].y);ctx.strokeStyle=`rgba(255,61,0,${(1-d/120)*.03})`;ctx.lineWidth=.4;ctx.stroke()}
    }
  }
  particles.forEach(p=>{
    p.x+=p.vx;p.y+=p.vy;p.life+=p.ml;
    if(p.life>1){p.life=0;p.x=Math.random()*W;p.y=Math.random()*H}
    if(p.x<0||p.x>W)p.vx*=-1;if(p.y<0||p.y>H)p.vy*=-1;
    const a=Math.sin(p.life*Math.PI)*.3;
    ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
    ctx.fillStyle=`rgba(${p.hue},${a})`;ctx.fill();
  });
  requestAnimationFrame(animParticles);
}
animParticles();

// Page nav
function showPage(id){
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  document.querySelectorAll('.nav-btn').forEach(b=>b.classList.remove('active'));
  const map={'home':0,'post':1,'dashboard':2,'map-page':3,'mobile':4};
  const btns=document.querySelectorAll('.nav-btn');
  if(map[id]!==undefined)btns[map[id]].classList.add('active');
  window.scrollTo(0,0);
  if(id==='map-page')setTimeout(drawMap,100);
}

// Scroll reveals
function initReveals(){
  const els=document.querySelectorAll('.hh-step,.mini-card,.kpi,.avail-item,.feed-item,.panel,.ms-card,.phone-frame');
  const obs=new IntersectionObserver(ents=>{
    ents.forEach((e,i)=>{
      if(e.isIntersecting){e.target.style.opacity='1';e.target.style.transform='translateY(0)'}
    });
  },{threshold:.1});
  els.forEach((el,i)=>{
    el.style.opacity='0';el.style.transform='translateY(28px)';
    el.style.transition=`opacity .6s ${(i%5)*.08}s ease, transform .6s ${(i%5)*.08}s ease`;
    obs.observe(el);
  });
}
initReveals();

// Post form live preview
let selectedFoodEmoji='🍛';let selectedTime='2 hrs';
function selectFood(el,emoji,name){
  document.querySelectorAll('.food-type-btn').forEach(b=>b.classList.remove('active'));
  el.classList.add('active');selectedFoodEmoji=emoji;
  document.getElementById('pc-emoji').textContent=emoji;
  updatePreview();
}
function selectTime(el,t){
  document.querySelectorAll('.time-btn').forEach(b=>b.classList.remove('active'));
  el.classList.add('active');selectedTime=t;
  document.getElementById('pc-time').textContent=t;
}
function updatePreview(){
  const n=document.getElementById('f-name').value;
  const ev=document.getElementById('f-event').value;
  const loc=document.getElementById('f-loc').value;
  const qty=document.getElementById('qty-range').value;
  if(n)document.getElementById('pc-name').textContent=n;
  if(ev)document.getElementById('pc-event').textContent=ev;
  if(loc)document.getElementById('pc-loc').textContent='📍 '+loc;
  document.getElementById('pc-qty').textContent=qty+' kg';
}
function submitFood(){
  document.getElementById('success-overlay').classList.add('show');
  setTimeout(()=>{
    document.getElementById('success-overlay').classList.remove('show');
    showPage('map-page');
  },3500);
}

// Live counter
let meals=92400;
setInterval(()=>{
  if(Math.random()>.5){meals+=Math.floor(Math.random()*3)+1;
  const el=document.getElementById('live-num');
  if(el)el.textContent=(meals/1000).toFixed(1)+'K';}
},5000);

// Map drawing
const mapData=[
  {x:.35,y:.38,emoji:'🍛',title:'Sharma Wedding Feast',event:'Wedding Reception',loc:'Baner, Pune',color:'#FF3D00',qty:'~80 kg',time:'3 hrs'},
  {x:.52,y:.55,emoji:'🥘',title:'Sunshine Hotel Buffet',event:'Hotel Surplus',loc:'Kothrud, Pune',color:'#FFC947',qty:'~35 kg',time:'1.5 hrs'},
  {x:.45,y:.3,emoji:'🍲',title:'Verma Birthday Banquet',event:'Birthday Banquet',loc:'Aundh, Pune',color:'#FF3D00',qty:'~55 kg',time:'5 hrs'},
  {x:.22,y:.6,emoji:'🫕',title:'TechPark Canteen',event:'Corporate Lunch',loc:'Hinjawadi',color:'#FFC947',qty:'~28 kg',time:'2 hrs'},
  {x:.3,y:.45,emoji:'🥗',title:'Patel Engagement',event:'Engagement Ceremony',loc:'Wakad, Pune',color:'#FF3D00',qty:'~70 kg',time:'4 hrs'},
];
let selectedMapPin=0;
function drawMap(){
  const mc=document.getElementById('map-draw');
  if(!mc)return;
  const rect=mc.parentElement.getBoundingClientRect();
  mc.width=rect.width;mc.height=rect.height;
  const c=mc.getContext('2d');
  const W=mc.width,H=mc.height;
  // Grid lines
  c.strokeStyle='rgba(245,237,216,.04)';c.lineWidth=1;
  for(let x=0;x<W;x+=60){c.beginPath();c.moveTo(x,0);c.lineTo(x,H);c.stroke()}
  for(let y=0;y<H;y+=60){c.beginPath();c.moveTo(0,y);c.lineTo(W,y);c.stroke()}
  // Road paths
  c.strokeStyle='rgba(245,237,216,.08)';c.lineWidth=3;
  [[[0,H*.4],[W*.6,H*.35],[W,H*.3]],[[W*.3,0],[W*.35,H*.5],[W*.3,H]],[[0,H*.6],[W*.5,H*.55],[W,H*.5]]].forEach(pts=>{
    c.beginPath();c.moveTo(pts[0][0],pts[0][1]);for(let i=1;i<pts.length;i++)c.lineTo(pts[i][0],pts[i][1]);c.stroke();
  });
  // Pins
  mapData.forEach((d,i)=>{
    const px=d.x*W,py=d.y*H;
    const isSelected=i===selectedMapPin;
    // Glow
    const g=c.createRadialGradient(px,py,0,px,py,isSelected?60:35);
    g.addColorStop(0,d.color.replace(')',',')+'0.25)'.replace('rgb','rgba'));
    g.addColorStop(1,'transparent');
    c.fillStyle=g;c.beginPath();c.arc(px,py,isSelected?60:35,0,Math.PI*2);c.fill();
    // Pin circle
    c.fillStyle=isSelected?d.color:'rgba(28,28,26,0.9)';
    c.strokeStyle=d.color;c.lineWidth=isSelected?2.5:1.5;
    c.beginPath();c.arc(px,py,isSelected?22:16,0,Math.PI*2);c.fill();c.stroke();
    // Emoji
    c.font=`${isSelected?18:12}px serif`;c.textAlign='center';c.textBaseline='middle';
    c.fillText(d.emoji,px,py);
    if(isSelected){
      // Pulsing ring
      c.strokeStyle=d.color;c.lineWidth=1;c.globalAlpha=.3;
      c.beginPath();c.arc(px,py,34,0,Math.PI*2);c.stroke();c.globalAlpha=1;
    }
  });
  // Show info panel
  const d=mapData[selectedMapPin];
  const info=document.getElementById('map-info');
  document.getElementById('mi-event').textContent=d.event;
  document.getElementById('mi-title').textContent=d.title;
  document.getElementById('mi-loc').textContent='📍 '+d.loc;
  info.classList.add('show');
}
function selectPin(i){
  selectedMapPin=i;
  document.querySelectorAll('.ms-card').forEach((c,j)=>c.classList.toggle('selected',j===i));
  drawMap();
}
window.addEventListener('resize',()=>{if(document.getElementById('map-page').classList.contains('active'))drawMap();});
