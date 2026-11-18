var currentRole='';

// === CONSENT ===
function checkConsent(){
  if(!document.getElementById('consent').checked){
    document.getElementById('consent_err').classList.add('show');return;
  }
  document.getElementById('consent_err').classList.remove('show');
  goTo(0);
}

// === ROLE SELECTION ===
function selectRole(role){
  currentRole=role;
  document.querySelectorAll('.role-card').forEach(c=>c.classList.remove('selected-role'));
  event.currentTarget.classList.add('selected-role');
  document.getElementById('role_err').classList.remove('show');
}
function resetRole(){
  currentRole='';
  document.querySelectorAll('.role-card').forEach(function(c){c.classList.remove('selected-role');});
  goTo(0);
}
function confirmRole(){
  if(!currentRole){document.getElementById('role_err').classList.add('show');return;}
  goTo(1);
}

// === NAVIGATION WITH BROWSER HISTORY ===
var currentPage='intro';
var submitted=false;

function showPage(p){
  document.querySelectorAll('.page').forEach(function(pg){pg.classList.remove('active');});
  var pageId=p==='intro'?'Intro':p==='2b'?'2b':p==='2d'?'2d':p==='3b'?'3b':p==='success'?'Success':p;
  document.getElementById('page'+pageId).classList.add('active');
  var bar=document.getElementById('progressBar');
  if(p==='intro'||p===0||p==='success'){bar.innerHTML='';}
  else if(currentRole==='direksi'){
    bar.innerHTML='<div class="progress-step '+(p==1?'active':'done')+'">1 &mdash; Data &amp; Risiko</div><div class="progress-step '+(p==='2d'?'active':'')+'">2 &mdash; Perspektif Strategis</div>';
  }else{
    var s1=p==1?'active':(p==='2b'||p==='3b')?'done':'';
    var s2=p==='2b'?'active':p==='3b'?'done':'';
    var s3=p==='3b'?'active':'';
    bar.innerHTML='<div class="progress-step '+s1+'">1 &mdash; Data &amp; Risiko</div><div class="progress-step '+s2+'">2 &mdash; Penilaian Risiko</div><div class="progress-step '+s3+'">3 &mdash; Kesiapan &amp; Masukan</div>';
  }
  document.getElementById('pi1').textContent=currentRole==='direksi'?'Halaman 1 dari 2':'Halaman 1 dari 3';
  window.scrollTo({top:0,behavior:'smooth'});
  currentPage=p;
}

function goTo(p){
  showPage(p);
  history.pushState({page:p,role:currentRole},'','#page-'+p);
}

// Browser back/forward button support
window.addEventListener('popstate',function(e){
  if(e.state&&e.state.page!==undefined){
    currentRole=e.state.role||currentRole;
    showPage(e.state.page);
  }else{
    showPage('intro');
  }
});

// Warn before closing/refreshing if form has data
window.addEventListener('beforeunload',function(e){
  if(!submitted&&currentPage!=='intro'&&currentPage!==0&&currentPage!=='success'){
    e.preventDefault();
    e.returnValue='';
  }
});

// Set initial state
history.replaceState({page:'intro',role:''},'','#page-intro');

// === VALIDATION ===
function clearErrors(id){
  var p=document.getElementById('page'+id)||document.getElementById(id);
  if(!p)return;
  p.querySelectorAll('.error-border').forEach(e=>e.classList.remove('error-border'));
  p.querySelectorAll('.error-msg').forEach(e=>e.classList.remove('show'));
  var b=p.querySelector('.error-banner');if(b)b.classList.remove('show');
}
function showErr(id){var el=document.getElementById(id);if(el)el.classList.add('show');}
function markBorder(el){el.classList.add('error-border');}

function validatePage1(){
  clearErrors(1);var ok=true;
  if(!document.getElementById('nama').value.trim()){markBorder(document.getElementById('nama'));showErr('nama_err');ok=false;}
  if(!document.getElementById('direktorat').value.trim()){markBorder(document.getElementById('direktorat'));showErr('direktorat_err');ok=false;}
  if(!document.querySelector('input[name="b1"]:checked')){showErr('b1_err');ok=false;}
  var b2ok=true;
  ['b2_r1','b2_a1','b2_r2','b2_a2','b2_r3','b2_a3'].forEach(function(id){var el=document.getElementById(id);if(!el.value.trim()){markBorder(el);b2ok=false;}});
  if(!b2ok){showErr('b2_err');ok=false;}
  var b3groups=document.querySelectorAll('.b3u');var b3ok=true;
  b3groups.forEach(function(g){if(!g.querySelector('.rb.sel'))b3ok=false;});
  if(!b3ok){showErr('b3_err');ok=false;}
  if(!ok)document.querySelector('#page1 .error-banner').classList.add('show');
  return ok;
}

function validatePage2b(){
  clearErrors('page2b');var ok=true;
  for(var t=1;t<=8;t++){
    var rows=document.querySelectorAll('#riskTable tr[data-topic="'+t+'"]:not(.topic-row)');
    var has=false;
    rows.forEach(function(row){var g=row.querySelectorAll('.rbg');if(g.length>=2&&g[0].querySelector('.rb.sel')&&g[1].querySelector('.rb.sel'))has=true;});
    if(!has)ok=false;
  }
  if(!ok)document.getElementById('err2b').classList.add('show');
  return ok;
}

function validatePage2d(){
  clearErrors('page2d');var ok=true;
  ['d2','d5','e1'].forEach(function(id){var el=document.getElementById(id);if(!el.value.trim()){markBorder(el);showErr(id+'_err');ok=false;}});
  if(!ok)document.getElementById('err2d').classList.add('show');
  return ok;
}

function validatePage3b(){
  clearErrors('page3b');var ok=true;
  for(var i=1;i<=8;i++){if(!document.querySelector('input[name="d1_'+i+'"]:checked'))ok=false;}
  if(!document.querySelector('input[name="d1_1"]:checked'))showErr('d1_err');
  ['d2b','d3b','d5b','e1b'].forEach(function(id){var el=document.getElementById(id);if(!el.value.trim()){markBorder(el);showErr(id+'_err');ok=false;}});
  if(!ok)document.getElementById('err3b').classList.add('show');
  return ok;
}

function validateAndNext(from){
  var ok=false;
  if(from==1){ok=validatePage1();if(ok)goTo(currentRole==='direksi'?'2d':'2b');}
  else if(from==='2b'){ok=validatePage2b();if(ok)goTo('3b');}
  if(!ok)window.scrollTo({top:0,behavior:'smooth'});
}

// === DATA COLLECTION ===
function collectFormData(){
  var d={};
  d.role=currentRole;
  d.nama=document.getElementById('nama').value||'';
  d.direktorat=document.getElementById('direktorat').value||'';
  d.tanggal=document.getElementById('tanggal').value||'';
  var b1=document.querySelector('input[name="b1"]:checked');d.b1=b1?b1.value:'';
  d.b2_r1=document.getElementById('b2_r1').value||'';d.b2_a1=document.getElementById('b2_a1').value||'';
  d.b2_r2=document.getElementById('b2_r2').value||'';d.b2_a2=document.getElementById('b2_a2').value||'';
  d.b2_r3=document.getElementById('b2_r3').value||'';d.b2_a3=document.getElementById('b2_a3').value||'';
  d.b3_urgency={};
  document.querySelectorAll('.b3u').forEach(function(g){
    var s=g.querySelector('.rb.sel');
    if(s)d.b3_urgency[g.dataset.b3]=s.dataset.v;
  });

  if(currentRole==='direksi'){
    d.d2=document.getElementById('d2').value||'';
    d.d5=document.getElementById('d5').value||'';
    d.e1=document.getElementById('e1').value||'';
    d.risks=[];d.riskCount=0;
  }else{
    d.risks=[];
    document.querySelectorAll('#riskTable tr[data-topic]:not(.topic-row)').forEach(function(row){
      var cells=row.querySelectorAll('td');var kode=cells[0]?cells[0].textContent.trim():'';var desc=cells[1]?cells[1].textContent.trim():'';
      var inp=row.querySelectorAll('td input[type="text"]');if(inp.length>=2){kode=inp[0].value||'';desc=inp[1].value||'';}
      var g=row.querySelectorAll('.rbg');var dm='',km='';
      if(g[0]){var s=g[0].querySelector('.rb.sel');if(s)dm=s.dataset.v;}
      if(g[1]){var s=g[1].querySelector('.rb.sel');if(s)km=s.dataset.v;}
      if(dm||km)d.risks.push({kode:kode,deskripsi:desc,dampak:dm,kemungkinan:km});
    });
    d.riskCount=d.risks.length;
    for(var i=1;i<=8;i++){var r=document.querySelector('input[name="d1_'+i+'"]:checked');d['d1_'+i]=r?r.value:'';}
    d.d2=document.getElementById('d2b').value||'';
    d.d3=document.getElementById('d3b').value||'';
    d.d5=document.getElementById('d5b').value||'';
    d.e1=document.getElementById('e1b').value||'';
    d.e2=document.getElementById('e2b').value||'';
  }
  return d;
}

function submitForm(){
  if(currentRole==='direksi'){if(!validatePage2d()){window.scrollTo({top:0,behavior:'smooth'});return;}}
  else{if(!validatePage3b()){window.scrollTo({top:0,behavior:'smooth'});return;}}
  var data=collectFormData();
  var btn=document.querySelector(currentRole==='direksi'?'#btnSubmitD':'#btnSubmitB');
  var orig=btn.textContent;btn.textContent='Mengirim...';btn.disabled=true;btn.style.opacity='0.6';
  fetch('/api/submit',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)})
  .then(function(r){if(!r.ok)throw new Error('Server error '+r.status);return r.json();})
  .then(function(){
    submitted=true;
    document.getElementById('s_nama').textContent=data.nama||'—';
    document.getElementById('s_role').textContent=currentRole==='direksi'?'Direksi':'BOD-1';
    document.getElementById('s_dir').textContent=data.direktorat||'—';
    var now=new Date();
    document.getElementById('s_time').textContent=now.toLocaleDateString('id-ID',{day:'numeric',month:'long',year:'numeric'})+', '+now.toLocaleTimeString('id-ID',{hour:'2-digit',minute:'2-digit'});
    if(currentRole==='direksi'){document.getElementById('s_count_row').style.display='none';}
    else{document.getElementById('s_count').textContent=data.riskCount;}
    goTo('success');
  })
  .catch(function(err){alert('Gagal mengirim: '+err.message);btn.textContent=orig;btn.disabled=false;btn.style.opacity='1';});
}

// === (rank badges removed — B3 now uses .rb urgency badges) ===

// === RISK BADGES ===
document.querySelectorAll('.rb').forEach(function(b){
  b.addEventListener('click',function(){
    var grp=this.closest('.rbg');
    if(this.classList.contains('sel')){this.classList.remove('sel');}
    else{grp.querySelectorAll('.rb').forEach(function(s){s.classList.remove('sel');});this.classList.add('sel');}
  });
});

// === RADIO PILL ===
document.querySelectorAll('.radio-item').forEach(function(item){
  item.addEventListener('click',function(){
    var grp=this.closest('.radio-group');
    grp.querySelectorAll('.radio-item').forEach(function(r){r.classList.remove('checked');});
    this.classList.add('checked');
    var radio=this.querySelector('input[type="radio"]');if(radio)radio.checked=true;
  });
});

// === CLEAR ERRORS ON INPUT ===
document.querySelectorAll('input,textarea,select').forEach(function(el){
  el.addEventListener('input',function(){el.classList.remove('error-border');});
  el.addEventListener('change',function(){el.classList.remove('error-border');});
});