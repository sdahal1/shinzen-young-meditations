import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
const root=process.argv[2]||'docs';
const course=JSON.parse(fs.readFileSync(path.join(root,'data/course.json'),'utf8'));
const sources=JSON.parse(fs.readFileSync(path.join(root,'data/sources.json'),'utf8'));
const sourceIds=new Set(sources.map(s=>s.id));
assert.equal(sourceIds.size,sources.length);
assert.equal(sources.filter(s=>s.kind==='media').length,course.group==='integra'?30:12);
assert.equal(course.practices.length,4);
for(const m of course.modules){assert.ok(m.concepts.length>=4);assert.ok(m.cheat.length>=4);assert.ok(m.quiz.options[m.quiz.answer]);for(const id of m.sources)assert.ok(sourceIds.has(id));if(m.practice)assert.ok(course.practices.some(p=>p.id===m.practice));}
for(const s of sources){
 for(const ext of ['md','txt'])assert.ok(fs.existsSync(path.join(root,'library',s.id+'.'+ext)));
 if(s.kind==='media'){assert.ok(s.segments.length>0);for(const g of s.segments){assert.ok(g.start>=0&&g.end>=g.start&&g.end<=s.duration+.01);assert.ok(g.text.trim());}assert.equal(s.words,s.segments.reduce((n,g)=>n+g.text.split(/\s+/).filter(Boolean).length,0));
 const txt=fs.readFileSync(path.join(root,'library',s.id+'.txt'),'utf8');for(const g of s.segments)assert.ok(txt.includes(g.text.trim()),s.id+' missing transcript text');}
 else assert.ok(fs.existsSync(path.join(root,'library',s.pdf)));
}
for(const p of course.practices){const ids=new Set(p.steps.map(s=>s.id));assert.equal(ids.size,p.steps.length);for(const id of p.sources)assert.ok(sourceIds.has(id));for(const s of p.steps){for(const next of [s.next,...(s.choices||[]).map(c=>c.next)].filter(Boolean))assert.ok(next==='reflect'||ids.has(next),p.id+' invalid transition '+next);}}
assert.ok(fs.readFileSync(path.join(root,'library/full-guide.pdf')).subarray(0,5).toString()==='%PDF-');
const code=fs.readFileSync(path.join(root,'app.js'),'utf8').replace(/\ninit\(\);\s*$/,'');
assert.ok(!/fetch\(['"]https?:/.test(code));
assert.ok(!/(?:href|src)="\/(?!\/)/.test(fs.readFileSync(path.join(root,'index.html'),'utf8')));
const nodes=new Map();const element=id=>{if(!nodes.has(id))nodes.set(id,{value:'',textContent:'',innerHTML:'',classList:{add(){},remove(){}},addEventListener(){},showModal(){this.open=true;},close(){this.open=false;},focus(){},select(){this.selected=true;}});return nodes.get(id);};
let stored='',clipboard='',storageFail=false;
const document={querySelector:element,querySelectorAll:()=>[],addEventListener(){},createElement:()=>({click(){},remove(){}}),body:{appendChild(){}}};
const context=vm.createContext({inputCourse:course,inputSources:sources,console,document,location:{hash:''},window:{addEventListener(){},scrollTo(){}},Date,Math,Map,Set,JSON,Intl,URL,Blob,setTimeout:()=>1,clearTimeout(){},navigator:{clipboard:{writeText:async t=>{clipboard=t;}}},localStorage:{getItem:()=>stored,setItem:(key,value)=>{if(storageFail)throw new Error('storage denied');stored=value;}}});
vm.runInContext(code,context);const run=x=>vm.runInContext(x,context);run('course=inputCourse;sources=inputSources;state=fresh();');
assert.ok(run('home()').length>1000);assert.ok(run('libraryView()').length>1000);assert.ok(run('about()').length>1000);
for(const m of course.modules){const h=run(`handoff('lesson:${m.id}')`);for(const id of m.sources){const s=sources.find(s=>s.id===id);if(s.segments){assert.ok(h.includes(s.segments[0].text.trim()));assert.ok(h.includes(s.segments.at(-1).text.trim()));}else assert.ok(h.includes(s.pages[0].text));}assert.ok(!h.includes('undefined'));assert.ok(run(`lessonView(lesson('${m.id}'))`).includes('data-handoff'));}
for(const p of course.practices){run(`startSession('${p.id}');var testSession=state.sessions.at(-1);testSession.fields.topic='MY ORIGINAL TOPIC';testSession.fields.X='MY ORIGINAL EMOTION';`);for(const step of p.steps){run(`testSession.step='${step.id}';testSession.status='active';`);assert.ok(run('sessionView(testSession)').length>500);const h=run('handoff("session:"+testSession.id)');assert.ok(h.includes('MY ORIGINAL TOPIC'));assert.ok(!h.includes('undefined'));for(const next of [...new Set([step.next,...(step.choices||[]).map(c=>c.next)].filter(Boolean))]){run(`testSession.step='${step.id}';testSession.status='active';advance(testSession,'${next}');`);assert.equal(run('testSession.status'),next==='reflect'?'finished':'active');if(next!=='reflect')assert.equal(run('testSession.step'),next);}}
 run("testSession.status='paused';");assert.ok(run('handoff("session:"+testSession.id)').includes('Do not restart or resume'));run("testSession.status='finished';");assert.ok(run('handoff("session:"+testSession.id)').includes('Do not restart or resume'));
}
if(course.group==='integra'){
 run("startSession('standard');var s=state.sessions.at(-1);s.fields.topic='Original';s.fields.A='OLD A';s.step='renameA';s.fields.A='NEW A';advance(s,'aimA');");assert.equal(run('s.step'),'aimA');assert.equal(run('s.fields.A'),'NEW A');
 run("startSession('advanced');var s=state.sessions.at(-1);s.fields.topic='Original';s.fields.X='FIRST FEELING';advance(s,'identity');s.fields.current='MY IDENTITY';advance(s,'goal');s.fields.current='TO HAVE SOMETHING';advance(s,'next');s.fields.current='NEW CONTENT';advance(s,'identity');");assert.equal(run('s.fields.X'),'NEW CONTENT');assert.equal(run('s.fields.A'),'');assert.equal(run('s.fields.goal'),'');assert.equal(run('s.fields.initialEmotion'),'FIRST FEELING');assert.equal(run('s.fields.topic'),'Original');assert.ok(run('s.history.some(h=>h.answer==="TO HAVE SOMETHING")'));
 assert.ok(!course.practices.find(p=>p.id==='advanced').steps.some(s=>['intention','message'].includes(s.id)));
}
// A handoff of an older journal entry must never pick up a new session's inputs.
run(`startSession('${course.practices[0].id}');var old=state.sessions.at(-1);old.fields.topic='OLDER SELECTED ENTRY';old.fields.after='OLDER REFLECTION';var oldId=old.id;startSession('${course.practices[1].id}');state.sessions.at(-1).fields.topic='UNRELATED NEW SESSION';`);
const oldHandoff=run('handoff("session:"+oldId)');assert.ok(oldHandoff.includes('OLDER SELECTED ENTRY'));assert.ok(oldHandoff.includes('OLDER REFLECTION'));assert.ok(!oldHandoff.includes('UNRELATED NEW SESSION'));
assert.throws(()=>run("handoff('session:missing')"));
run('var backup=JSON.parse(JSON.stringify(state));var restored=cleanState(backup);');assert.equal(run('restored.sessions.length'),run('state.sessions.length'));assert.equal(run('restored.sessions.find(s=>s.id===oldId).fields.after'),'OLDER REFLECTION');assert.throws(()=>run("cleanState({version:1,course:'other-course',sessions:[]})"));
run("var attack=JSON.parse(JSON.stringify(state));attack.sessions.push({...attack.sessions[0],id:'<img onerror=alert(1)>'});var cleaned=cleanState(attack);");assert.equal(run('cleaned.sessions.length'),run('state.sessions.length'));
storageFail=true;assert.equal(run('save()'),false);storageFail=false;
run('showHandoff("session:"+oldId)');await run('copyHandoff()');assert.ok(clipboard.includes('OLDER SELECTED ENTRY'));assert.ok(!clipboard.includes('UNRELATED NEW SESSION'));
run('navigator.clipboard=null');assert.equal(await run('copyHandoff()'),false);assert.ok(element('#handoff-text').selected);
console.log(`PASS ${course.group}: ${sources.length} full sources, ${course.modules.length} lessons, all practice branches, original-topic preservation, selected-entry handoffs, backup validation, clipboard fallback, storage failure, relative paths and PDF.`);
