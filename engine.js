/* Pandora: Survive the Wreck. Browser adaptation with three actions per human, two per specimen, one per bot. */
(function(root){
'use strict';
const decks='ABC';
const pods=[['CompPod','NavPod','ConPod','CrewPod','MedPod','SurveyPod','Scapelok'],['SpecanalPod','RestraintPod1','RestraintPod2','StasisPod','StagePod','DconPod','Landlok'],['PowerPod','EnvioPod','BotPod','MaintPod','WepPod','RestraintPod3','Exlok']];
const titles={CompPod:'Computer',NavPod:'Navigation',ConPod:'Control',CrewPod:'Crew',MedPod:'Medical',SurveyPod:'Survey',Scapelok:'Escape lock',SpecanalPod:'Specimen analysis',RestraintPod1:'Restraint I',RestraintPod2:'Restraint II',RestraintPod3:'Restraint III',StasisPod:'Stasis',StagePod:'Staging',DconPod:'Decontamination',Landlok:'Landing lock',PowerPod:'Power',EnvioPod:'Environment',BotPod:'Bot control',MaintPod:'Maintenance',WepPod:'Weapons',Exlok:'Exterior lock'};
const nodes=[]; const edges={};
for(let d=0;d<3;d++){
  for(let p=1;p<=7;p++)nodes.push({id:decks[d]+p,deck:d,type:'pod',pod:pods[d][p-1],name:titles[pods[d][p-1]],x:p===7?77:[272,538,803][(p-1)%3],y:(p<=3?66:p<=6?310:185)+d*377});
  for(let i=0;i<3;i++)nodes.push({id:decks[d]+[14,25,36][i],deck:d,type:'tube',name:'Tube '+decks[d]+[14,25,36][i],x:[272,538,803][i],y:185+d*377});
  nodes.push({id:decks[d]+'R',deck:d,type:'risor',name:'Risor '+decks[d],x:1018,y:185+d*377});
}
nodes.forEach(n=>edges[n.id]=[]);
function link(a,b){edges[a].push(b);edges[b].push(a)}
for(const d of decks){for(const [p,t] of [[1,14],[4,14],[2,25],[5,25],[3,36],[6,36],[7,14]])link(d+p,d+t);link(d+'14',d+'25');link(d+'25',d+'36');link(d+'36',d+'R')}
link('AR','BR');link('BR','CR');link('AR','CR');
const systems={Computer:'A1',Navigation:'A2',Control:'A3',Power:'C1',Environment:'C2'};
const crewInfo=[['CO','Strof','Commander','A7',8],['MO','Kelly','Medical officer','A4',8],['BIO','Charybdis','Biologist','B7',7],['GSO','Skraaling','General services','C7',9],['SO','Gepidus','Survey officer','B4',8]];
const botInfo=[['Ambot','C4','Cargo carrier; salvage +2 parts.',3],['Erobot','A5','Built-in stunner; no charge needed.',3],['EVABot','C3','Repairs Power and hull breaches.',4],['Imrebot','C5','Repairs all five major systems.',4],['Ubot','B6','Repairs all five major systems.',4],['Reconbot','A6','Built-in scanner reveals connected pods.',5],['Specibot','B1','Stuns and restrains specimens.',7]];
const specimenInfo=[['Grendel','B2',2,3],['Golem','C6',1,3],['Typhoo','B3',2,2],['Shazam','B5',2,2],['Mary','C4',2,3],['Blind Pig','B6',1,1],['Fletcher','A6',2,1],['Scrod','C5',1,1],['Mother','B1',1,2],['Mouse','A5',1,1]];
const specimenModifiers={Grendel:{intelligence:-1,aggression:3,shield:3},Golem:{intelligence:3,aggression:3,shield:3},Typhoo:{intelligence:-1,aggression:2,shield:3},Shazam:{intelligence:-1,aggression:3,shield:0},Mary:{intelligence:3,aggression:0,shield:1},'Blind Pig':{intelligence:0,aggression:1,shield:2},Fletcher:{intelligence:-1,aggression:1,shield:2},Scrod:{intelligence:0,aggression:0,shield:3},Mother:{intelligence:3,aggression:0,shield:3},Mouse:{intelligence:3,aggression:2,shield:0}};
function d6(rng){return Math.min(6,Math.floor(rng()*6)+1)}
function generateTraits(name,rng=Math.random){const modifiers=specimenModifiers[name]||{intelligence:0,aggression:0,shield:0},result={};for(const key of ['intelligence','aggression','shield']){const roll=d6(rng)+d6(rng)+modifiers[key];result[key]=Math.max(1,Math.min(9,roll-2))}result.maxShield=result.shield;return result;}
function actionLimit(u){return bot(u)?1:3}
function remaining(u){if(u.hp<=0)return 0;return Number.isFinite(u.actionsLeft)?u.actionsLeft:u.acted?0:actionLimit(u)}
function actionsRemaining(s){return live(s).reduce((sum,u)=>sum+remaining(u),0)}
function transferTargets(s,u){return [...s.crew,...s.bots].filter(v=>v.id!==u.id&&v.hp>0&&v.pos===u.pos&&(!bot(v)||!fog(s,v.pos)));}
function stunPower(s,u){if(carried(s,u).some(i=>i.type==='Stunbomb'))return 5;if(bot(u))return u.name==='Specibot'?5:4;if(has(s,u,'Turbolaser'))return 9;if(has(s,u,'Stunrod'))return 4;if(has(s,u,'Stungun'))return 3;return 2;}
function create(options={}){return {version:4,items:initialItems(),round:1,cold:options.classic?20:30,maxCold:options.classic?20:30,oxygen:100,active:'CO',systems:Object.fromEntries(Object.keys(systems).map(k=>[k,2])),crew:crewInfo.map(([id,name,role,pos,max])=>({id,name,role,pos,hp:max,max,acted:false,actionsLeft:3})),bots:botInfo.map(([name,pos,ability,speed],i)=>({id:'bot'+i,name,pos,ability,speed,hp:4,max:4,controlled:false,acted:false,actionsLeft:1,haul:false})),aliens:specimenInfo.map(([name,pos,speed,damage],i)=>({id:'spec'+i,name,pos,speed,damage,stun:0,...generateTraits(name,options.rng||Math.random)})),parts:22,charges:24,meds:5,searched:[],revealed:[],captured:0,breaches:['A2','C4'],log:[{round:1,text:'Five crew awake. Ten specimens loose. Major systems offline. Each crew member has THREE actions per turn; specimens have TWO. Item handling is free. Select a crew chit to begin.'}],over:null};}
const equipment={
  Turbolaser:{name:'Turbolaser',kind:'weapon',art:'Wpn_Turbolaser.png',description:'Stun power 9. Breaks Shield before stunning for four reaction phases.'},
  Stungun:{name:'Stungun',kind:'weapon',art:'Wpn_Stungun.png',description:'Stun power 3. Breaks Shield before stunning for three reaction phases.'},
  Stunrod:{name:'Stunrod',kind:'weapon',art:'Wpn_Stunrod.png',description:'Stun power 4. Breaks Shield before stunning for three reaction phases.'},
  Stunbomb:{name:'Stunbomb',kind:'weapon',art:'Wpn_Stunbomb.png',description:'Single use: hits every specimen in the current space with stun power 5; stuns those whose Shield breaks.'},
  CompComm:{name:'CompComm',kind:'item',art:'Com_CompComm.png',description:'Remote link: control discovered bots from any pod.'},
  DconComm:{name:'DconComm',kind:'item',art:'Com_DconComm.png',description:'Remote link: control discovered bots from any pod.'},
  Scanner:{name:'Scanner',kind:'item',art:'Com_Scanner.png',description:'Searches connected pods remotely, up to two spaces away.'},
  MedKit:{name:'MedKit',kind:'item',art:'Kit_MedKit.png',description:'Adds two stamina to treatment using shared medical supplies.'},
  BotKit:{name:'BotKit',kind:'item',art:'Kit_BotKit.png',description:'Repairs a controlled bot in the same space; costs two shared parts.'},
  WepKit:{name:'WepKit',kind:'item',art:'Kit_WepKit.png',description:'Adds one reaction phase to stun duration.'},
  CompKit:{name:'CompKit',kind:'item',art:'Kit_CompKit.png',description:'Adds one point to Computer repairs.'},
  IKit:{name:'IKit',kind:'item',art:'Kit_IKit.png',description:'Adds one point to major-system repairs.'},
  Enviorig:{name:'Enviorig',kind:'item',art:'Rig_Enviorig.png',description:'Protects its carrier from entering a hull breach.'},
  Armorig:{name:'Armorig',kind:'item',art:'Rig_Armorig.png',description:'Reduces specimen attack damage by one, to a minimum of one.'}
};
function initialItems(){return Object.entries({Turbolaser:'C5',Stungun:'A4',Stunrod:'B4',Stunbomb:'C6',CompComm:'A1',DconComm:'B6',Scanner:'A6',MedKit:'A5',BotKit:'C3',WepKit:'C5',CompKit:'A1',IKit:'C4',Enviorig:'C7',Armorig:'B5'}).map(([type,pos],i)=>({id:'item'+i,type,pos,carrier:null}));}
function upgrade(s,rng=Math.random){if(!s||![2,3,4].includes(s.version))return create();if(!Array.isArray(s.items))s.items=initialItems();for(const u of [...s.crew,...s.bots]){const limit=actionLimit(u);if(!Number.isFinite(u.actionsLeft))u.actionsLeft=limit-(u.acted?1:0);u.actionsLeft=Math.max(0,Math.min(limit,u.actionsLeft));u.acted=u.actionsLeft===0;}for(const b of s.bots)if(b.controller===undefined)b.controller=null;for(const a of s.aliens){if(!Number.isFinite(a.intelligence)||!Number.isFinite(a.aggression)||!Number.isFinite(a.shield)){Object.assign(a,generateTraits(a.name,rng));if(a.stun>0)a.shield=0;}if(!Number.isFinite(a.maxShield))a.maxShield=a.shield;}s.version=4;if(bot(unit(s))&&fog(s,unit(s).pos)){const c=live(s)[0];if(c)s.active=c.id}return s;}
function fog(s,pos){return node(pos)?.type==='pod'&&!s.searched.includes(pos);}
function carried(s,u){return (s.items||[]).filter(i=>i.carrier===u.id);}
function has(s,u,type){return carried(s,u).some(i=>i.type===type);}
function loose(s,pos){return fog(s,pos)?[]:(s.items||[]).filter(i=>!i.carrier&&i.pos===pos);}
function visibleBots(s){return s.bots.filter(b=>b.hp>0&&!fog(s,b.pos));}
function visibleSpecimens(s,pos){return fog(s,pos)?[]:occupants(s,pos);}
function repairGain(s,u,system){return (u.id==='GSO'||['Imrebot','Ubot','EVABot'].includes(u.name)?3:2)+(has(s,u,'IKit')?1:0)+(system==='Computer'&&has(s,u,'CompKit')?1:0);}
function profile(s,u){const owned=s.bots.filter(b=>b.controller===u.id&&b.controlled&&b.hp>0);return {name:u.name,rank:bot(u)?'Autonomous support bot':u.id+' · '+u.role,specialty:bot(u)?u.ability:({CO:'Command and FTL restart',MO:'Medical treatment (+6 base stamina)',BIO:'Specimen handling and containment',GSO:'Major-system repairs (+3 base)',SO:'Survey and discovery'}[u.id]),stats:{stamina:u.hp+'/'+u.max,movement:bot(u)?u.speed+' spaces':'1 space',actions:remaining(u)+'/'+actionLimit(u)+' remaining','stun power':stunPower(s,u)+' Shield damage',repair:bot(u)&&!['Imrebot','Ubot','EVABot'].includes(u.name)?'Not equipped':repairGain(s,u,'Power')+' points',armor:has(s,u,'Armorig')?'−1 attack damage':'None',location:u.pos},items:carried(s,u).filter(i=>equipment[i.type].kind!=='weapon'),weapons:carried(s,u).filter(i=>equipment[i.type].kind==='weapon'),bots:owned.filter(b=>!fog(s,b.pos)),concealedBots:owned.filter(b=>fog(s,b.pos)).length,controller:bot(u)?s.crew.find(c=>c.id===u.controller)||null:null,builtIn:bot(u)?(['Erobot','Specibot'].includes(u.name)?'Built-in stunner':u.name==='Reconbot'?'Built-in scanner':'Specialist chassis'):'Emergency suit stunner (uses shared charges)'};}
function dropLostEquipment(s){for(const i of s.items||[]){if(!i.carrier)continue;const u=[...s.crew,...s.bots].find(u=>u.id===i.carrier);if(u&&u.hp<=0){i.pos=u.pos;i.carrier=null}}}
function roomRecord(s,id){const n=node(id);if(!n)return null;const hidden=fog(s,id);return {id,name:hidden?'Unsearched pod':n.name,type:n.type,deck:'ABC'[n.deck],concealed:hidden,damaged:s.breaches.includes(id),neighbors:[...edges[id]],crew:s.crew.filter(c=>c.hp>0&&c.pos===id),bots:hidden?[]:visibleBots(s).filter(b=>b.pos===id),specimens:visibleSpecimens(s,id),items:loose(s,id)};}
function specimenRecord(s,id){const a=s.aliens.find(a=>a.id===id);if(!a||fog(s,a.pos))return null;return {id:a.id,name:a.name,pos:a.pos,speed:a.speed,damage:a.damage,stun:a.stun,intelligence:a.intelligence,aggression:a.aggression,shield:a.shield,maxShield:a.maxShield,actions:2,portrait:'Monster_'+a.name+'.jpg'};}
function itemRecord(s,id){const i=(s.items||[]).find(i=>i.id===id);if(!i)return null;const owner=i.carrier?[...s.crew,...s.bots].find(u=>u.id===i.carrier):null;if(!owner&&fog(s,i.pos)||owner&&bot(owner)&&fog(s,owner.pos))return null;return {id:i.id,type:i.type,...equipment[i.type],pos:owner?owner.pos:i.pos,owner:owner?owner.name:null,ownerId:i.carrier||null};}
function node(id){return nodes.find(n=>n.id===id)}
function unit(s){return [...s.crew,...s.bots].find(u=>u.id===s.active)}
function bot(u){return u.id.startsWith('bot')}
function occupants(s,pos){return s.aliens.filter(a=>a.pos===pos)}
function hostile(s,pos){return occupants(s,pos).some(a=>!a.stun)}
function log(s,text){s.log.unshift({round:s.round,text});s.log=s.log.slice(0,100)}
function allActed(s){return s.crew.filter(c=>c.hp>0).every(c=>remaining(c)===0)}
function live(s){return s.crew.filter(c=>c.hp>0)}
function path(a,b){if(a===b)return [a];const q=[[a]],seen=new Set([a]);while(q.length){let p=q.shift();for(let next of edges[p.at(-1)]){if(seen.has(next))continue;const n=[...p,next];if(next===b)return n;seen.add(next);q.push(n)}}return []}
function canControl(s,u,b){if(bot(u)||b.controlled||b.hp<=0||fog(s,b.pos))return false;const p=node(u.pos).pod;return (p&&(has(s,u,'CompComm')||has(s,u,'DconComm')))||b.pos===u.pos||p==='BotPod'||(p==='SurveyPod'&&['Specibot','Reconbot','Ambot'].includes(b.name))||(p==='SpecanalPod'&&b.name==='Specibot')||(p==='CrewPod'&&b.name==='Erobot')}
function capable(u,kind,system){if(!bot(u))return true;if(kind==='repair')return ['Imrebot','Ubot'].includes(u.name)||(u.name==='EVABot'&&system==='Power');if(kind==='stun')return ['Erobot','Specibot'].includes(u.name);if(kind==='capture')return u.name==='Specibot';if(kind==='scan')return u.name==='Reconbot';if(kind==='patch')return u.name==='EVABot';if(kind==='search')return ['Ambot','Ubot','Imrebot','Reconbot'].includes(u.name);return false}
function available(s){const u=unit(s);if(!u||s.over||u.hp<=0||(bot(u)&&!u.controlled))return [];const n=node(u.pos),bad=hostile(s,u.pos),a=[];if(loose(s,u.pos).length)a.push('pickup');if(carried(s,u).length){a.push('drop');if(transferTargets(s,u).length)a.push('give');}if(remaining(u)<=0)return a;a.push('wait','pass');if(n.type==='pod'&&!s.breaches.includes(u.pos)&&!s.searched.includes(u.pos)&&capable(u,'search'))a.push('search');const system=Object.keys(systems).find(k=>systems[k]===u.pos);if(!bad&&system&&s.systems[system]<9&&s.parts>=2&&capable(u,'repair',system))a.push('repair');if(occupants(s,u.pos).some(x=>!x.stun)&&capable(u,'stun')&&(bot(u)||s.charges>0))a.push('stun');if(occupants(s,u.pos).some(x=>x.stun&&x.shield===0)&&capable(u,'capture')&&(bot(u)||s.charges>0))a.push('capture');if(!bot(u)&&u.hp<u.max&&s.meds>0)a.push('heal');if(!bot(u)&&n.pod==='MedPod'&&!bad&&u.hp<u.max)a.push('medbay');if(!bad&&s.breaches.includes(u.pos)&&capable(u,'patch')&&(bot(u)||s.parts>=2))a.push('patch');if((bot(u)&&u.name==='Reconbot'||has(s,u,'Scanner'))&&!bad)a.push('scan');if(!bad&&has(s,u,'BotKit')&&s.parts>=2&&s.bots.some(b=>b.controlled&&b.pos===u.pos&&b.hp>0&&b.hp<b.max))a.push('repairbot');if(!bot(u)&&u.pos===systems.Control&&!bad&&Object.values(s.systems).every(v=>v>=6)&&!s.aliens.length&&!s.breaches.length)a.push('launch');return a;}
function canMove(s,to){const u=unit(s);if(s.over||!u||remaining(u)<=0||u.hp<=0||(bot(u)&&!u.controlled)||!edges[to])return false;const steps=path(u.pos,to).length-1;if(steps<1)return false;if(!bot(u))return steps===1; // Bots use their printed speed, stopping at occupied intermediate spaces.
const p=path(u.pos,to);return steps<=u.speed&&!p.slice(1,-1).some(x=>hostile(s,x));}
function spend(s,u){u.actionsLeft=Math.max(0,remaining(u)-1);u.acted=u.actionsLeft===0;if(s.over||!u.acted)return;const next=s.crew.find(c=>c.hp>0&&remaining(c)>0);if(next)s.active=next.id;else if(allActed(s))log(s,'Crew phase complete. Free item handling and optional bot actions remain available; then resolve the turn.');}
function action(s,type,arg){if(s.over)return false;let u=unit(s);const free=['pickup','drop','give'].includes(type);if(!u||u.hp<=0||(!free&&remaining(u)<=0)||(bot(u)&&!u.controlled))return false;
if(type==='move'){if(!canMove(s,arg))return false;u.pos=arg;log(s,`${u.name} moves to ${arg}${node(arg).type==='pod'?' · '+node(arg).name:''}.`);if(s.breaches.includes(arg)){const protectedUnit=has(s,u,'Enviorig')||u.name==='EVABot';u.hp=Math.max(0,u.hp-(protectedUnit?0:1));log(s,protectedUnit?`${u.name} is protected from the hull breach at ${arg}.`:`Hull breach at ${arg}: ${u.name} loses 1 stamina.`)}}
else if(type==='pickup'){const i=(s.items||[]).find(i=>i.id===arg);if(!i||!available(s).includes('pickup')||i.carrier||i.pos!==u.pos)return false;i.carrier=u.id;i.pos=null;log(s,u.name+' picks up '+equipment[i.type].name+'.');}
else if(type==='drop'){const i=carried(s,u).find(i=>i.id===arg);if(!i)return false;i.carrier=null;i.pos=u.pos;log(s,u.name+' drops '+equipment[i.type].name+' at '+u.pos+'.');}
else if(type==='give'){const i=carried(s,u).find(i=>i.id===arg?.itemId),to=transferTargets(s,u).find(v=>v.id===arg?.recipientId);if(!i||!to)return false;i.carrier=to.id;i.pos=null;log(s,u.name+' gives '+equipment[i.type].name+' to '+to.name+'.');}
else if(type==='repairbot'){const b=s.bots.find(b=>b.id===arg);if(!available(s).includes('repairbot')||!b||!b.controlled||b.pos!==u.pos||b.hp<=0||b.hp===b.max)return false;s.parts-=2;b.hp=b.max;log(s,u.name+' repairs '+b.name+' with the BotKit.');}
else if(type==='control'){const b=s.bots.find(b=>b.id===arg);if(!b||!canControl(s,u,b)||hostile(s,u.pos))return false;b.controlled=true;b.controller=u.id;log(s,`${u.name} establishes remote control of ${b.name}. Bot gets one action each turn.`)}
else {if(!available(s).includes(type))return false;
if(type==='search'){s.searched.push(u.pos);s.revealed.push(u.pos);let p=3+(u.name==='Ambot'?2:0);s.parts+=p;s.charges+=2;if(['Medical','Stasis','Crew'].includes(node(u.pos).name))s.meds++;log(s,`${u.name} searches ${u.pos}: +${p} parts, +2 charges. ${node(u.pos).name} pod identified.`)}
if(type==='repair'){const system=Object.keys(systems).find(k=>systems[k]===u.pos);let gain=repairGain(s,u,system);s.parts-=2;s.systems[system]=Math.min(9,s.systems[system]+gain);log(s,`${u.name} repairs ${system}: ${s.systems[system]}/9. ${s.systems[system]>=6?'System green.':'Still offline.'}`)}
if(type==='stun'){const a=occupants(s,u.pos).find(x=>!x.stun);if(!bot(u))s.charges--;const bomb=carried(s,u).find(i=>i.type==='Stunbomb'),power=stunPower(s,u),duration=(has(s,u,'Turbolaser')&&!bomb?4:3)+(has(s,u,'WepKit')?1:0);for(const target of bomb?occupants(s,u.pos).filter(x=>!x.stun):[a]){target.shield=Math.max(0,target.shield-power);const label=fog(s,u.pos)?'an unseen specimen':target.name;if(target.shield===0){target.stun=duration;log(s,u.name+' breaks the Shield and stuns '+label+' for '+duration+' reaction phases.');}else log(s,u.name+' hits '+label+': Shield '+target.shield+'/'+target.maxShield+'.');}if(bomb)s.items=s.items.filter(i=>i.id!==bomb.id);}
if(type==='capture'){const a=occupants(s,u.pos).find(x=>x.stun&&x.shield===0);if(!bot(u))s.charges--;s.aliens=s.aliens.filter(x=>x!==a);s.captured++;log(s,`${u.name} restrains ${a.name}. ${s.captured}/10 specimens secured.`)}
if(type==='heal'){s.meds--;u.hp=Math.min(u.max,u.hp+(u.id==='MO'?6:4)+(has(s,u,'MedKit')?2:0));log(s,`${u.name} uses a MedKit: stamina ${u.hp}/${u.max}.`)}
if(type==='medbay'){u.hp=Math.min(u.max,u.hp+4);log(s,`${u.name} recovers in the MedPod: ${u.hp}/${u.max}.`)}
if(type==='patch'){s.breaches=s.breaches.filter(x=>x!==u.pos);if(!bot(u))s.parts-=2;log(s,`${u.name} seals the hull breach at ${u.pos}.`)}
if(type==='scan'){const range=has(s,u,'Scanner')?2:1;const seen=nodes.filter(n=>n.type==='pod'&&!s.breaches.includes(n.id)&&path(u.pos,n.id).length-1<=range).map(n=>n.id);s.searched=[...new Set([...s.searched,...seen])];s.revealed=[...new Set([...s.revealed,...seen])];log(s,`${u.name} scans connected pods: ${seen.map(p=>p+' '+node(p).name).join(', ')||'No adjacent pods'}.`)}
if(type==='pass'){u.actionsLeft=1;log(s,u.name+' passes remaining actions.');}if(type==='wait')log(s,`${u.name} holds position.`);
if(type==='launch'){s.over='won';log(s,`FTL restart successful. Pandora survives! ${live(s).length}/5 crew home, ${s.captured}/10 specimens secured in ${s.round} turns.`)}
}if(!free)spend(s,u);check(s);return true;}
function select(s,id){const u=[...s.crew,...s.bots].find(u=>u.id===id);if(!u||u.hp<=0||(bot(u)&&(!u.controlled||fog(s,u.pos))))return false;s.active=id;return true}
function check(s){dropLostEquipment(s);if(!live(s).length||s.cold<=0||s.oxygen<=0){s.over='lost';log(s,!live(s).length?'All crew lost. Pandora falls silent.':'Cold shutdown. Ship systems have failed.')}}
function monsterTurn(s,a,rng){
 if(a.stun>0){a.stun--;if(a.stun===0&&!fog(s,a.pos))log(s,a.name+' recovers from stun.');return;}
 for(let step=0;step<2;step++){
  const candidates=[...live(s),...s.bots.filter(b=>b.controlled&&b.hp>0)];if(!candidates.length)return;
  const choices=candidates.filter(u=>a.intelligence>=7||node(u.pos).deck===node(a.pos).deck);if(!choices.length)continue;
  choices.sort((x,y)=>{const dx=path(a.pos,x.pos).length-1,dy=path(a.pos,y.pos).length-1;return a.intelligence>=6?(dx*3+x.hp/x.max*2)-(dy*3+y.hp/y.max*2):dx-dy;});
  const target=choices[0],route=path(a.pos,target.pos),range=2+Math.floor(a.intelligence/2),detected=route.length-1<=range;
  if(!detected){const opts=edges[a.pos].filter(p=>node(p).deck===node(a.pos).deck);a.pos=opts[(s.round+step+specimenInfo.findIndex(x=>x[0]===a.name))%opts.length]||a.pos;continue;}
  const aggressive=d6(rng)+d6(rng)+a.aggression>=12;
  if(!aggressive&&a.aggression<=4){for(let move=0;move<a.speed;move++){const distance=path(a.pos,target.pos).length;const opts=[...edges[a.pos]].filter(p=>(a.intelligence>=7||node(p).deck===node(a.pos).deck)&&path(p,target.pos).length>distance);opts.sort((x,y)=>path(y,target.pos).length-path(x,target.pos).length||(a.intelligence>=6?edges[y].length-edges[x].length:0));if(opts[0])a.pos=opts[0];else break;}continue;}
  if(a.pos===target.pos){if(aggressive){const damage=Math.max(1,a.damage-(has(s,target,'Armorig')?1:0));target.hp=Math.max(0,target.hp-damage);log(s,(fog(s,a.pos)?'An unseen specimen':a.name)+' attacks '+target.name+' at '+a.pos+': −'+damage+' stamina.'+(target.hp===0?' Unit lost.':''));}continue;}
  a.pos=route[Math.min(a.speed,route.length-1)];
 }
}
function endTurn(s,rng=Math.random){if(s.over||!allActed(s))return false;log(s,'Turn '+s.round+': specimens take two actions each.');for(const a of s.aliens)monsterTurn(s,a,rng);s.oxygen=Math.max(0,s.oxygen-(s.systems.Environment>=6?1:3)-s.breaches.length);if(s.systems.Power<6||s.round%2===0)s.cold--;s.round++;for(const u of [...s.crew,...s.bots]){u.actionsLeft=actionLimit(u);u.acted=false;}const next=live(s)[0];if(next)s.active=next.id;check(s);if(!s.over)log(s,'Turn '+s.round+' begins. Human actions refreshed to three. Cold shutdown in '+s.cold+' ticks.');return true;}
const api={specimenModifiers,generateTraits,actionLimit,remaining,actionsRemaining,transferTargets,stunPower,monsterTurn,roomRecord,specimenRecord,itemRecord,equipment,upgrade,fog,carried,has,loose,visibleBots,visibleSpecimens,profile,repairGain,nodes,edges,systems,titles,create,node,unit,bot,path,live,hostile,occupants,allActed,canControl,available,canMove,action,select,endTurn};if(typeof module!=='undefined')module.exports=api;root.Pandora=api;
})(typeof window==='undefined'?globalThis:window);
