'use strict';

/** Script do editor visual v3 — idêntico ao blog-1782058741657 (referência) */
function editorV3Script(slug) {
  return `(function(){
var BG=document.getElementById('art-bg');
var OL=document.getElementById('art-overlay');
var CV=document.getElementById('the-canvas');
var LOGO=document.getElementById('el-logo')||document.querySelector('.logo-img,.logo-cyberfest,.art-content .lg');
var TITL=document.getElementById('el-title')||document.querySelector('#el-title,.headline,.hl,h1.headline');
var SUB=document.getElementById('el-sub')||document.querySelector('#el-sub,.subtitulo,.subtitle,.sb');
var ECO=document.getElementById('el-eco');
var OLS={original:null,dark:'rgba(2,5,10,.92)',
  light:'radial-gradient(ellipse at center,rgba(255,255,255,.10) 0%,rgba(2,5,10,.78) 100%)',
  accent:'linear-gradient(135deg,rgba(20,168,244,.40) 0%,rgba(2,5,10,.85) 100%)',
  none:'rgba(0,0,0,0)'};
var S={x:50,y:50,z:110,bo:100,fl:false,oo:100,bgc:'#02050A',ol:'original',fw:'700',ta:'left',
  lx:0,ly:0,ls:100,lo:100,tx:0,ty:0,ts:100,sx:0,sy:0,ex:0,ey:0,eo:75};

function uBg(){
  if(!BG)return;
  if(BG.tagName==='IMG'){
    BG.style.objectPosition=S.x+'% '+S.y+'%';
    BG.style.transform=(S.fl?'scaleX(-1) ':'')+'scale('+(S.z/100)+')';
    BG.style.opacity=S.bo/100;
  }else{
    BG.style.backgroundPosition=S.x+'% '+S.y+'%';
    BG.style.backgroundSize=S.z+'%';
    BG.style.opacity=S.bo/100;
    BG.style.transform=S.fl?'scaleX(-1)':'none';
  }
}
function uOL(){
  if(!OL)return;
  OL.style.opacity=S.oo/100;
  if(S.ol!=='original')OL.style.background=OLS[S.ol]||'';
}
function uCV(){if(CV)CV.style.backgroundColor=S.bgc;}
function uTxt(){
  document.querySelectorAll('#el-title,.headline,.hl,.art-content h1').forEach(function(h){
    h.style.fontWeight=S.fw;h.style.textAlign=S.ta;
  });
}
function uEl(){
  if(LOGO){LOGO.style.transform='translate('+S.lx+'px,'+S.ly+'px) scale('+(S.ls/100)+')';LOGO.style.transformOrigin='0 50%';LOGO.style.opacity=S.lo/100;}
  if(TITL){TITL.style.transform='translate('+S.tx+'px,'+S.ty+'px) scale('+(S.ts/100)+')';TITL.style.transformOrigin='0 0';}
  if(SUB)SUB.style.transform='translate('+S.sx+'px,'+S.sy+'px)';
  if(ECO){
    ECO.style.transform=(S.ex||S.ey)?('translate('+S.ex+'px,'+S.ey+'px)'):'';
    ECO.querySelectorAll('img').forEach(function(i){i.style.opacity=S.eo/100;});
  }
}
function all(){uBg();uOL();uCV();uTxt();uEl();}

function sl(id,k,vid,suf,fn){
  var e=document.getElementById(id),v=document.getElementById(vid);
  if(!e)return;
  e.addEventListener('input',function(){S[k]=parseFloat(this.value);if(v)v.textContent=this.value+suf;fn();});
}
sl('sx','x','vx','%',uBg);sl('sy','y','vy','%',uBg);sl('sz','z','vz','%',uBg);sl('sbo','bo','vbo','%',uBg);
sl('soo','oo','voo','%',uOL);
sl('slx','lx','vlx','px',uEl);sl('sly','ly','vly','px',uEl);sl('sls','ls','vls','%',uEl);sl('slo','lo','vlo','%',uEl);
sl('stx','tx','vtx','px',uEl);sl('sty','ty','vty','px',uEl);sl('sts','ts','vts','%',uEl);
sl('ssx','sx','vsx','px',uEl);sl('ssy','sy','vsy','px',uEl);
sl('sex','ex','vex','px',uEl);sl('sey','ey','vey','px',uEl);sl('seo','eo','veo','%',uEl);

var bf=document.getElementById('btnFlip');
if(bf)bf.addEventListener('click',function(){S.fl=!S.fl;this.textContent=S.fl?'ON':'OFF';this.classList.toggle('on',S.fl);uBg();});

var cp=document.getElementById('cpick'),ch=document.getElementById('chex');
if(cp)cp.addEventListener('input',function(){S.bgc=this.value;if(ch)ch.value=this.value;uCV();});
if(ch)ch.addEventListener('input',function(){var v=this.value.trim();if(/^#[0-9a-fA-F]{6}$/.test(v)){S.bgc=v;if(cp)cp.value=v;uCV();}});

var os=document.getElementById('ols');
if(os)os.addEventListener('change',function(){S.ol=this.value;uOL();});

document.querySelectorAll('#fwseg .ep-sb').forEach(function(b){b.addEventListener('click',function(){
  document.querySelectorAll('#fwseg .ep-sb').forEach(function(x){x.classList.remove('on');});
  this.classList.add('on');S.fw=this.dataset.v;uTxt();
});});
document.querySelectorAll('#taseg .ep-sb').forEach(function(b){b.addEventListener('click',function(){
  document.querySelectorAll('#taseg .ep-sb').forEach(function(x){x.classList.remove('on');});
  this.classList.add('on');S.ta=this.dataset.v;uTxt();
});});

document.getElementById('rstAll').addEventListener('click',function(){
  S.x=50;S.y=50;S.z=110;S.bo=100;S.fl=false;S.oo=100;S.bgc='#02050A';S.ol='original';S.fw='700';S.ta='left';
  [['sx',50,'vx','%'],['sy',50,'vy','%'],['sz',110,'vz','%'],['sbo',100,'vbo','%'],['soo',100,'voo','%']].forEach(function(a){
    var e=document.getElementById(a[0]);if(e)e.value=a[1];var v=document.getElementById(a[2]);if(v)v.textContent=a[1]+a[3];
  });
  if(bf){bf.textContent='OFF';bf.classList.remove('on');}
  if(cp)cp.value='#02050A';if(ch)ch.value='#02050A';if(os)os.value='original';
  document.querySelectorAll('#fwseg .ep-sb').forEach(function(b){b.classList.toggle('on',b.dataset.v==='700');});
  document.querySelectorAll('#taseg .ep-sb').forEach(function(b){b.classList.toggle('on',b.dataset.v==='left');});
  all();
});
document.getElementById('rstEl').addEventListener('click',function(){
  S.lx=0;S.ly=0;S.ls=100;S.lo=100;S.tx=0;S.ty=0;S.ts=100;S.sx=0;S.sy=0;S.ex=0;S.ey=0;S.eo=75;
  [['slx',0,'vlx','px'],['sly',0,'vly','px'],['sls',100,'vls','%'],['slo',100,'vlo','%'],
   ['stx',0,'vtx','px'],['sty',0,'vty','px'],['sts',100,'vts','%'],
   ['ssx',0,'vsx','px'],['ssy',0,'vsy','px'],
   ['sex',0,'vex','px'],['sey',0,'vey','px'],['seo',75,'veo','%']].forEach(function(a){
    var e=document.getElementById(a[0]);if(e)e.value=parseFloat(a[1]);
    var v=document.getElementById(a[2]);if(v)v.textContent=a[1]+a[3];
  });
  uEl();
});

document.getElementById('btnExport').addEventListener('click',function(){
  var self=this;self.textContent='⏳ Gerando...';self.classList.add('busy');
  var canvas=document.getElementById('the-canvas');
  domtoimage.toPng(canvas,{width:540,height:675,quality:1,bgcolor:'#02050A'}).then(function(dataUrl){
    var a=document.createElement('a');a.download='cybersecfest-${slug}.png';a.href=dataUrl;
    document.body.appendChild(a);a.click();document.body.removeChild(a);
    self.textContent='✓ Baixado!';self.classList.remove('busy');
    setTimeout(function(){self.textContent='⬇ Exportar PNG';},2500);
  }).catch(function(){self.textContent='⬇ Exportar PNG';self.classList.remove('busy');});
});

var tbt=document.querySelector('.tb-title');
if(tbt){var h=document.querySelector('#el-title,.headline,.hl');if(h)tbt.textContent=h.textContent.trim().slice(0,65);}
all();
})();`;
}

module.exports = { editorV3Script };
