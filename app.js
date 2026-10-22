const $=s=>document.querySelector(s);
const S=JSON.parse(localStorage.getItem('prog')||'{}');
let D,C,R,MK={n:30,m:1,sel:null},goal=+localStorage.getItem('goal')||1;
const save=()=>localStorage.setItem('prog',JSON.stringify(S));
const qs=c=>c.topics.flatMap((t,ti)=>t.sections.flatMap(s=>s.questions.map((q,i)=>({...q,id:s.id+'-'+i,topic:t.name,sec:s.name,ti}))));
const done=q=>(S[q.id]?.streak||0)>=goal;
const shuf=a=>a.map(x=>[Math.random(),x]).sort((a,b)=>a[0]-b[0]).map(x=>x[1]);
const pct=(a,b)=>b?Math.round(a/b*100):0;

function home(){C=null;MK.sel=null;$('#app').innerHTML=`<main class=wrap><h1>${D.title}</h1><p class=mut>${D.tagline}</p><h2>Pick a course</h2><div class=grid>${D.courses.map((c,i)=>{const a=qs(c),m=a.filter(done).length;return `<div class=card onclick="go(${i})"><h3>${c.name}</h3><span class=pill>${c.tag}</span><div class=bar><i style="width:${pct(m,a.length)}%"></i></div><small>${m?m+' of '+a.length+' mastered':'Not started'}</small></div>`}).join('')}</div></main>`}
function go(i){C=D.courses[i];dash()}
function shell(main){const a=qs(C),m=a.filter(done).length;
$('#app').innerHTML=`<aside><a onclick="home()">‹ All courses</a><h2>${C.name}</h2><small>${C.tag} · ${a.length} questions</small><p>
<button onclick="dash()">Dashboard</button><button onclick="mock()">Mock exam</button><button onclick="notes()">Notes</button></p>
<small>Topics</small><button onclick="practice(shuf(qs(C)),'All topics, shuffled')">All topics, shuffled <b>${m}/${a.length}</b></button>
<button onclick="cram()">Cram mode <b>${a.filter(q=>q.hy).length}</b></button>
${C.topics.map(t=>`<details open><summary>${t.name}</summary>${t.sections.map(s=>`<button onclick="sec('${s.id}')">${s.name} <b>${s.questions.filter((_,i)=>done({id:s.id+'-'+i})).length}/${s.questions.length}</b></button>`).join('')}</details>`).join('')}</aside><main class=wrap>${main}</main>`}
function dash(){clearInterval(R?.t);const a=qs(C),m=a.filter(done).length,r=a.reduce((x,q)=>x+(S[q.id]?.right||0),0),w=a.reduce((x,q)=>x+(S[q.id]?.wrong||0),0);
shell(`<h1>Dashboard</h1><div class=card><div class=big>${pct(m,a.length)}%<small> mastered</small></div><div class=bar><i style="width:${pct(m,a.length)}%"></i></div><small>${m} of ${a.length} questions mastered</small><p>Recall goal: <button class="chip ${goal==1?'on':''}" onclick="setGoal(1)">1×</button><button class="chip ${goal==2?'on':''}" onclick="setGoal(2)">2×</button></p><button class=pri onclick="practice(shuf(qs(C).filter(q=>!done(q))),'Practice')">Continue practicing</button></div>
<div class=grid><div class=card>Accuracy<h3>${pct(r,r+w)}%</h3><small>${r} right · ${w} wrong</small></div><div class=card>Answered<h3>${r+w}</h3></div></div>`)}
function setGoal(g){goal=g;localStorage.setItem('goal',g);dash()}
const sec=id=>practice(qs(C).filter(q=>q.id.startsWith(id+'-')),C.topics.flatMap(t=>t.sections).find(s=>s.id==id).name);
const cram=()=>practice(shuf(qs(C).filter(q=>q.hy)),'Cram mode');
function notes(){shell(`<h1>Notes</h1>${C.topics.map(t=>`<div class=card><h3>${t.name}</h3><p>${t.notes||'No notes yet.'}</p></div>`).join('')}`)}

function practice(list,title,exam,mins){clearInterval(R?.t);R={list,title,exam,i:0,ok:0,ans:[],left:exam?list.length*mins*60:0};
if(!list.length)return shell('<h1>Nothing here yet</h1><p>Every question in this set is mastered, or the set is empty.</p>');
if(exam&&mins)R.t=setInterval(()=>{R.left--;const e=$('#tm');if(e)e.textContent=Math.floor(R.left/60)+':'+String(R.left%60).padStart(2,'0');if(R.left<=0)fin()},1000);show()}
function show(){const q=R.list[R.i];if(!q)return fin();R.sel=null;R.ch=false;
shell(`<h1>${R.title}</h1><div class=card><small>${q.topic} › ${q.sec} · ${R.i+1} of ${R.list.length} <b id=tm></b></small><h3>${q.q}</h3>${q.options.map((o,k)=>`<button class=opt id=o${k} onclick="pick(${k})"><b>${'ABCDE'[k]}</b>${o}</button>`).join('')}<div id=fb></div><button class=pri id=nx onclick="nxt()">${R.exam?'Next':'Check answer'}</button></div>`)}
function pick(k){if(R.ch)return;R.sel=k;document.querySelectorAll('.opt').forEach((b,j)=>b.classList.toggle('sel',j==k))}
function nxt(){const q=R.list[R.i];if(R.ch){R.i++;return show()}if(R.sel==null)return;
if(R.exam){R.ans[R.i]=R.sel;R.i++;return show()}
R.ch=true;const ok=R.sel==q.answer,p=S[q.id]||(S[q.id]={right:0,wrong:0,streak:0});
if(ok){p.right++;p.streak++;R.ok++}else{p.wrong++;p.streak=0}save();
$('#o'+q.answer).classList.add('good');if(!ok)$('#o'+R.sel).classList.add('bad');
$('#fb').innerHTML=`<div class=fb><b>${ok?'Correct':'Not quite'}</b><p>${q.explain||''}</p></div>`;$('#nx').textContent='Next question'}
function fin(){clearInterval(R.t);const ok=R.exam?R.list.filter((q,i)=>R.ans[i]==q.answer).length:R.ok;
shell(`<h1>${R.title}</h1><div class=card><div class=big>${pct(ok,R.list.length)}%</div><p>${ok} of ${R.list.length} correct</p><button class=pri onclick="dash()">Back to dashboard</button></div>`)}

function mock(){const T=C.topics;MK.sel??=T.map((_,i)=>i);
shell(`<h1>Mock exam</h1><div class=card><p><label>Questions <input id=mn type=number min=1 value=${MK.n}></label></p><p>Topics<br>${T.map((t,i)=>`<button class="chip ${MK.sel.includes(i)?'on':''}" onclick="tg(${i})">${t.name}</button>`).join('')}</p><p><label>Minutes per question (0 = no timer) <input id=mm type=number min=0 value=${MK.m}></label></p><button class=pri onclick="startMock()">Start exam</button></div>`)}
function rd(){MK.n=+$('#mn').value||30;MK.m=+$('#mm').value||0}
function tg(i){rd();MK.sel=MK.sel.includes(i)?MK.sel.filter(x=>x!=i):[...MK.sel,i];mock()}
function startMock(){rd();practice(shuf(qs(C).filter(q=>MK.sel.includes(q.ti))).slice(0,MK.n),'Mock exam',true,MK.m)}

fetch('data/courses.json').then(r=>r.json()).then(d=>{D=d;document.title=d.title;home()}).catch(()=>$('#app').innerHTML='<main class=wrap><h1>Could not load data</h1><p>Open this through a web server or GitHub Pages, not by double-clicking the file.</p></main>');
