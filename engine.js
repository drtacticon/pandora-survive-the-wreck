/* Pandora: Survive the Wreck. Browser adaptation with one action per unit per round. */
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
function create(options={}){return {version:3,items:initialItems(),round:1,cold:options.classic?20:30,maxCold:options.classic?20:30,oxygen:100,active:'CO',systems:Object.fromEntries(Object.keys(systems).map(k=>[k,2])),crew:crewInfo.map(([id,name,role,pos,max])=>({id,name,role,pos,hp:max,max,acted:false})),bots:botInfo.map(([name,pos,ability,speed],i)=>({id:'bot'+i,name,pos,ability,speed,hp:4,max:4,controlled:false,acted:false,haul:false})),aliens:specimenInfo.map(([name,pos,speed,damage],i)=>({id:'spec'+i,name,pos,speed,damage,stun:0})),parts:22,charges:24,meds:5,searched:[],revealed:[],captured:0,breaches:['A2','C4'],log:[{round:1,text:'Five crew awake. Ten specimens loose. Major systems offline. Each crew member has ONE action per turn. Select a crew chit to begin.'}],over:null};}
const equipment={
  Turbolaser:{name:'Turbolaser',kind:'weapon',art:'Wpn_Turbolaser.png',description:'Stuns a specimen for four reaction phases.'},
  Stungun:{name:'Stungun',kind:'weapon',art:'Wpn_Stungun.png',description:'Portable stunner; three reaction phases.'},
  Stunrod:{name:'Stunrod',kind:'weapon',art:'Wpn_Stunrod.png',description:'Contact stunner; three reaction phases.'},
  Stunbomb:{name:'Stunbomb',kind:'weapon',art:'Wpn_Stunbomb.png',description:'Single use: stuns every specimen in the current space.'},
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
function upgrade(s){if(!s||![2,3].includes(s.version))return create();if(!Array.isArray(s.items))s.items=initialItems();s.version=3;for(const b of s.bots)if(b.controller===undefined)b.controller=null;if(bot(unit(s))&&fog(s,unit(s).pos)){const c=live(s)[0];if(c)s.active=c.id}return s;}
function fog(s,pos){return node(pos)?.type==='pod'&&!s.searched.includes(pos);}
function carried(s,u){return (s.items||[]).filter(i=>i.carrier===u.id);}
function has(s,u,type){return carried(s,u).some(i=>i.type===type);}
function loose(s,pos){return fog(s,pos)?[]:(s.items||[]).filter(i=>!i.carrier&&i.pos===pos);}
function visibleBots(s){return s.bots.filter(b=>b.hp>0&&!fog(s,b.pos));}
function visibleSpecimens(s,pos){return fog(s,pos)?[]:occupants(s,pos);}
function repairGain(s,u,system){return (u.id==='GSO'||['Imrebot','Ubot','EVABot'].includes(u.name)?3:2)+(has(s,u,'IKit')?1:0)+(system==='Computer'&&has(s,u,'CompKit')?1:0);}
function profile(s,u){const owned=s.bots.filter(b=>b.controller===u.id&&b.controlled&&b.hp>0);return {name:u.name,rank:bot(u)?'Autonomous support bot':u.id+' · '+u.role,specialty:bot(u)?u.ability:({CO:'Command and FTL restart',MO:'Medical treatment (+6 base stamina)',BIO:'Specimen handling and containment',GSO:'Major-system repairs (+3 base)',SO:'Survey and discovery'}[u.id]),stats:{stamina:u.hp+'/'+u.max,movement:bot(u)?u.speed+' spaces':'1 space',actions:u.acted?'Used this turn':'1 available',repair:bot(u)&&!['Imrebot','Ubot','EVABot'].includes(u.name)?'Not equipped':repairGain(s,u,'Power')+' points',armor:has(s,u,'Armorig')?'−1 attack damage':'None',location:u.pos},items:carried(s,u).filter(i=>equipment[i.type].kind!=='weapon'),weapons:carried(s,u).filter(i=>equipment[i.type].kind==='weapon'),bots:owned.filter(b=>!fog(s,b.pos)),concealedBots:owned.filter(b=>fog(s,b.pos)).length,controller:bot(u)?s.crew.find(c=>c.id===u.controller)||null:null,builtIn:bot(u)?(['Erobot','Specibot'].includes(u.name)?'Built-in stunner':u.name==='Reconbot'?'Built-in scanner':'Specialist chassis'):'Emergency suit stunner (uses shared charges)'};}
function dropLostEquipment(s){for(const i of s.items||[]){if(!i.carrier)continue;const u=[...s.crew,...s.bots].find(u=>u.id===i.carrier);if(u&&u.hp<=0){i.pos=u.pos;i.carrier=null}}}
function node(id){return nodes.find(n=>n.id===id)}
function unit(s){return [...s.crew,...s.bots].find(u=>u.id===s.active)}
function bot(u){return u.id.startsWith('bot')}
function occupants(s,pos){return s.aliens.filter(a=>a.pos===pos)}
function hostile(s,pos){return occupants(s,pos).some(a=>!a.stun)}
function log(s,text){s.log.unshift({round:s.round,text});s.log=s.log.slice(0,100)}
function allActed(s){return s.crew.filter(c=>c.hp>0).every(c=>c.acted)}
function live(s){return s.crew.filter(c=>c.hp>0)}
function path(a,b){if(a===b)return [a];const q=[[a]],seen=new Set([a]);while(q.length){let p=q.shift();for(let next of edges[p.at(-1)]){if(seen.has(next))continue;const n=[...p,next];if(next===b)return n;seen.add(next);q.push(n)}}return []}
function canControl(s,u,b){if(bot(u)||b.controlled||b.hp<=0||fog(s,b.pos))return false;const p=node(u.pos).pod;return (p&&(has(s,u,'CompComm')||has(s,u,'DconComm')))||b.pos===u.pos||p==='BotPod'||(p==='SurveyPod'&&['Specibot','Reconbot','Ambot'].includes(b.name))||(p==='SpecanalPod'&&b.name==='Specibot')||(p==='CrewPod'&&b.name==='Erobot')}
function capable(u,kind,system){if(!bot(u))return true;if(kind==='repair')return ['Imrebot','Ubot'].includes(u.name)||(u.name==='EVABot'&&system==='Power');if(kind==='stun')return ['Erobot','Specibot'].includes(u.name);if(kind==='capture')return u.name==='Specibot';if(kind==='scan')return u.name==='Reconbot';if(kind==='patch')return u.name==='EVABot';if(kind==='search')return ['Ambot','Ubot','Imrebot','Reconbot'].includes(u.name);return false}
function available(s){let u=unit(s);if(!u||s.over||u.hp<=0||u.acted||(bot(u)&&!u.controlled))return [];const n=node(u.pos),bad=hostile(s,u.pos),a=['wait'];if(n.type==='pod'&&!s.breaches.includes(u.pos)&&!s.searched.includes(u.pos)&&capable(u,'search'))a.push('search');const system=Object.keys(systems).find(k=>systems[k]===u.pos);if(!bad&&system&&s.systems[system]<9&&s.parts>=2&&capable(u,'repair',system))a.push('repair');if(occupants(s,u.pos).some(x=>!x.stun)&&capable(u,'stun')&&(bot(u)||s.charges>0))a.push('stun');if(occupants(s,u.pos).some(x=>x.stun)&&capable(u,'capture')&&(bot(u)||s.charges>0))a.push('capture');if(!bot(u)&&u.hp<u.max&&s.meds>0)a.push('heal');if(!bot(u)&&n.pod==='MedPod'&&!bad&&u.hp<u.max)a.push('medbay');if(!bad&&s.breaches.includes(u.pos)&&capable(u,'patch')&&(bot(u)||s.parts>=2))a.push('patch');if((bot(u)&&u.name==='Reconbot'||has(s,u,'Scanner'))&&!bad)a.push('scan');if(!bad&&loose(s,u.pos).length)a.push('pickup');if(carried(s,u).length)a.push('drop');if(!bad&&has(s,u,'BotKit')&&s.parts>=2&&s.bots.some(b=>b.controlled&&b.pos===u.pos&&b.hp>0&&b.hp<b.max))a.push('repairbot');if(!bot(u)&&u.pos===systems.Control&&!bad&&Object.values(s.systems).every(v=>v>=6)&&!s.aliens.length&&!s.breaches.length)a.push('launch');return a}
function canMove(s,to){const u=unit(s);if(s.over||!u||u.acted||u.hp<=0||(bot(u)&&!u.controlled)||!edges[to])return false;const steps=path(u.pos,to).length-1;if(steps<1)return false;if(!bot(u))return steps===1; // Bots use their printed speed, stopping at occupied intermediate spaces.
const p=path(u.pos,to);return steps<=u.speed&&!p.slice(1,-1).some(x=>hostile(s,x));}
function spend(s,u){u.acted=true;if(s.over)return;const next=s.crew.find(c=>c.hp>0&&!c.acted);if(next)s.active=next.id;else if(allActed(s))log(s,'Crew phase complete. Optional bot actions are available; then resolve the turn.');}
function action(s,type,arg){if(s.over)return false;let u=unit(s);if(!u||u.hp<=0||u.acted||(bot(u)&&!u.controlled))return false;
if(type==='move'){if(!canMove(s,arg))return false;u.pos=arg;log(s,`${u.name} moves to ${arg}${node(arg).type==='pod'?' · '+node(arg).name:''}.`);if(s.breaches.includes(arg)){const protectedUnit=has(s,u,'Enviorig')||u.name==='EVABot';u.hp=Math.max(0,u.hp-(protectedUnit?0:1));log(s,protectedUnit?`${u.name} is protected from the hull breach at ${arg}.`:`Hull breach at ${arg}: ${u.name} loses 1 stamina.`)}}
else if(type==='pickup'){const i=(s.items||[]).find(i=>i.id===arg);if(!i||!available(s).includes('pickup')||i.carrier||i.pos!==u.pos)return false;i.carrier=u.id;i.pos=null;log(s,u.name+' picks up '+equipment[i.type].name+'.');}
else if(type==='drop'){const i=carried(s,u).find(i=>i.id===arg);if(!i)return false;i.carrier=null;i.pos=u.pos;log(s,u.name+' drops '+equipment[i.type].name+' at '+u.pos+'.');}
else if(type==='repairbot'){const b=s.bots.find(b=>b.id===arg);if(!available(s).includes('repairbot')||!b||!b.controlled||b.pos!==u.pos||b.hp<=0||b.hp===b.max)return false;s.parts-=2;b.hp=b.max;log(s,u.name+' repairs '+b.name+' with the BotKit.');}
else if(type==='control'){const b=s.bots.find(b=>b.id===arg);if(!b||!canControl(s,u,b)||hostile(s,u.pos))return false;b.controlled=true;b.controller=u.id;log(s,`${u.name} establishes remote control of ${b.name}. Bot gets one action each turn.`)}
else {if(!available(s).includes(type))return false;
if(type==='search'){s.searched.push(u.pos);s.revealed.push(u.pos);let p=3+(u.name==='Ambot'?2:0);s.parts+=p;s.charges+=2;if(['Medical','Stasis','Crew'].includes(node(u.pos).name))s.meds++;log(s,`${u.name} searches ${u.pos}: +${p} parts, +2 charges. ${node(u.pos).name} pod identified.`)}
if(type==='repair'){const system=Object.keys(systems).find(k=>systems[k]===u.pos);let gain=repairGain(s,u,system);s.parts-=2;s.systems[system]=Math.min(9,s.systems[system]+gain);log(s,`${u.name} repairs ${system}: ${s.systems[system]}/9. ${s.systems[system]>=6?'System green.':'Still offline.'}`)}
if(type==='stun'){const a=occupants(s,u.pos).find(x=>!x.stun);if(!bot(u))s.charges--;const bomb=carried(s,u).find(i=>i.type==='Stunbomb');const duration=(has(s,u,'Turbolaser')?4:3)+(has(s,u,'WepKit')?1:0);for(const target of bomb?occupants(s,u.pos):[a])target.stun=duration;if(bomb)s.items=s.items.filter(i=>i.id!==bomb.id);log(s,`${u.name} stuns ${fog(s,u.pos)?'an unseen specimen':a.name}${bomb?' and every other specimen in the space':''}. Capture before it recovers.`)}
if(type==='capture'){const a=occupants(s,u.pos).find(x=>x.stun);if(!bot(u))s.charges--;s.aliens=s.aliens.filter(x=>x!==a);s.captured++;log(s,`${u.name} restrains ${a.name}. ${s.captured}/10 specimens secured.`)}
if(type==='heal'){s.meds--;u.hp=Math.min(u.max,u.hp+(u.id==='MO'?6:4)+(has(s,u,'MedKit')?2:0));log(s,`${u.name} uses a MedKit: stamina ${u.hp}/${u.max}.`)}
if(type==='medbay'){u.hp=Math.min(u.max,u.hp+4);log(s,`${u.name} recovers in the MedPod: ${u.hp}/${u.max}.`)}
if(type==='patch'){s.breaches=s.breaches.filter(x=>x!==u.pos);if(!bot(u))s.parts-=2;log(s,`${u.name} seals the hull breach at ${u.pos}.`)}
if(type==='scan'){const range=has(s,u,'Scanner')?2:1;const seen=nodes.filter(n=>n.type==='pod'&&!s.breaches.includes(n.id)&&path(u.pos,n.id).length-1<=range).map(n=>n.id);s.searched=[...new Set([...s.searched,...seen])];s.revealed=[...new Set([...s.revealed,...seen])];log(s,`${u.name} scans connected pods: ${seen.map(p=>p+' '+node(p).name).join(', ')||'No adjacent pods'}.`)}
if(type==='wait')log(s,`${u.name} holds position.`);
if(type==='launch'){s.over='won';log(s,`FTL restart successful. Pandora survives! ${live(s).length}/5 crew home, ${s.captured}/10 specimens secured in ${s.round} turns.`)}
}spend(s,u);check(s);return true;}
function select(s,id){const u=[...s.crew,...s.bots].find(u=>u.id===id);if(!u||u.hp<=0||(bot(u)&&(!u.controlled||fog(s,u.pos))))return false;s.active=id;return true}
function check(s){dropLostEquipment(s);if(!live(s).length||s.cold<=0||s.oxygen<=0){s.over='lost';log(s,!live(s).length?'All crew lost. Pandora falls silent.':'Cold shutdown. Ship systems have failed.')}}
function endTurn(s){if(s.over||!allActed(s))return false;log(s,`Turn ${s.round}: specimen reaction phase.`);
for(const a of s.aliens){if(a.stun){a.stun--;if(a.stun===0&&!fog(s,a.pos))log(s,`${a.name} recovers from stun.`);continue}const candidates=[...live(s),...s.bots.filter(b=>b.controlled&&b.hp>0)];if(!candidates.length)break;let targets=candidates.filter(u=>node(u.pos).deck===node(a.pos).deck);if(!targets.length)continue;targets.sort((x,y)=>path(a.pos,x.pos).length-path(a.pos,y.pos).length);const target=targets[0],p=path(a.pos,target.pos); // Approach only when within sensing range; distant specimens wander.
if(p.length<=5){a.pos=p[Math.min(a.speed,p.length-1)]}else{const opts=edges[a.pos].filter(x=>node(x).deck===node(a.pos).deck);a.pos=opts[(s.round+specimenInfo.findIndex(x=>x[0]===a.name))%opts.length]||a.pos}
const victim=candidates.find(u=>u.pos===a.pos);if(victim){const damage=Math.max(1,a.damage-(has(s,victim,'Armorig')?1:0));victim.hp=Math.max(0,victim.hp-damage);log(s,`${fog(s,a.pos)?'An unseen specimen':a.name} attacks ${victim.name} at ${a.pos}: −${damage} stamina.${victim.hp===0?' Unit lost.':''}`)}}
s.oxygen=Math.max(0,s.oxygen-(s.systems.Environment>=6?1:3)-s.breaches.length);if(s.systems.Power<6||s.round%2===0)s.cold--;s.round++;for(const u of [...s.crew,...s.bots])u.acted=false;const next=live(s)[0];if(next)s.active=next.id;check(s);if(!s.over)log(s,`Turn ${s.round} begins. Crew actions refreshed. Cold shutdown in ${s.cold} ticks.`);return true;}
const api={equipment,upgrade,fog,carried,has,loose,visibleBots,visibleSpecimens,profile,repairGain,nodes,edges,systems,titles,create,node,unit,bot,path,live,hostile,occupants,allActed,canControl,available,canMove,action,select,endTurn};if(typeof module!=='undefined')module.exports=api;root.Pandora=api;
})(typeof window==='undefined'?globalThis:window);
