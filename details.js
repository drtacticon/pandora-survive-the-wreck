/* Context information is derived only from discoverable game records. */
window.PandoraDetails=(function(){
  const P=window.Pandora,by=id=>document.getElementById(id),art=n=>'assets/'+encodeURIComponent(n);
  const safe=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  let bridge;
  const stats=entries=>`<dl class="profile-stats">${entries.map(([k,v])=>`<div><dt>${safe(k)}</dt><dd>${safe(v)}</dd></div>`).join('')}</dl>`;
  const unitArt=u=>P.bot(u)?'Bot_'+u.name+'.png':'Crew_'+u.id+'.png';
  function close(){if(by('info-dialog').open)by('info-dialog').close()}
  function open(title,image,kind,content){
    by('info-content').innerHTML=`<button class="profile-dismiss" data-close-info aria-label="Close information window">×</button><div class="unit-profile-heading">${image?`<img src="${art(image)}" alt="${safe(title)} chit">`:'<span class="room-record-icon" aria-hidden="true">▱</span>'}<div><div class="kicker">${safe(kind)}</div><h2 id="info-name" tabindex="-1" autofocus>${safe(title)}</h2></div></div>${content}<div class="dialog-actions"><button data-close-info class="primary">Close information</button></div>`;
    if(!by('info-dialog').open)by('info-dialog').showModal();by('info-name').focus({preventScroll:true});by('info-dialog').scrollTop=0;
  }
  function room(id){
    const s=bridge.state(),r=P.roomRecord(s,id);if(!r)return;
    let content=`${r.damaged?'<p class="damage-warning">Hull damage · repair the hull before searching this room.</p>':''}<h3>Room statistics</h3>${stats([['Deck',r.deck],['Space',r.id],['Type',r.type],['Hull',r.damaged?'Damaged':'Intact'],['Discovery',r.concealed?'Unsearched':'Searched'],['Connected to',r.neighbors.join(', ')]])}<h3>Crew present</h3>${r.crew.length?r.crew.map(u=>`<button class="record-link" data-details-unit="${u.id}"><img src="${art(unitArt(u))}" alt="${safe(u.name)} chit"><span>${safe(u.name)}<small>${safe(u.role)} · ${u.hp}/${u.max} stamina</small></span></button>`).join(''):'<p class="empty">No crew present.</p>'}`;
    if(r.concealed)content+='<h3>Contents concealed</h3><p class="empty">Items, specimens, and bots are hidden until this room is searched. Unseen specimens can still attack.</p>';
    else{
      content+=`<h3>Specimens</h3>${r.specimens.length?r.specimens.map(a=>`<button class="record-link" data-details-specimen="${a.id}"><img src="${art('Specimen_'+a.name+'.png')}" alt="${safe(a.name)} chit"><span>${safe(a.name)}<small>${a.stun?'Stunned · '+a.stun+' reaction phases':'Active'}</small></span></button>`).join(''):'<p class="empty">None present.</p>'}`;
      content+=`<h3>Bots</h3>${r.bots.length?r.bots.map(b=>`<button class="record-link" data-details-unit="${b.id}"><img src="${art(unitArt(b))}" alt="${safe(b.name)} chit"><span>${safe(b.name)}<small>${b.controlled?'Controlled':'Dormant'} · ${b.hp}/${b.max} stamina</small></span></button>`).join(''):'<p class="empty">None present.</p>'}`;
      content+=`<h3>Loose items</h3>${r.items.length?r.items.map(i=>`<button class="record-link" data-details-item="${i.id}"><img src="${art(P.equipment[i.type].art)}" alt="${safe(P.equipment[i.type].name)} chit"><span>${safe(P.equipment[i.type].name)}<small>Not carried</small></span></button>`).join(''):'<p class="empty">None present.</p>'}`;
    }
    open(r.id+' · '+r.name,null,'ROOM INFORMATION',content);
  }
  function specimen(id){
    const s=bridge.state(),a=P.specimenRecord(s,id);if(!a)return;
    open(a.name,'Specimen_'+a.name+'.png','BIOLOGICAL SPECIMEN',`<h3>Specimen statistics</h3>${stats([['Location',a.pos],['Movement',a.speed+' spaces'],['Attack',a.damage+' stamina'],['Status',a.stun?'Stunned':'Active'],['Stun remaining',a.stun+' reaction phases'],['Reaction',a.stun?'Recovers over time':'Moves and attacks']])}<p class="profile-note">Specimens react when the turn is resolved. Stun this specimen before capturing it. Concealment does not stop its movement or attacks.</p>`);
  }
  function item(id){
    const s=bridge.state(),i=P.itemRecord(s,id);if(!i)return;
    const u=P.unit(s),available=P.available(s);
    let action='';
    if(!i.owner&&i.pos===u.pos&&available.includes('pickup'))action=`<button class="primary" data-info-action="pickup:${i.id}">Pick up · one action</button>`;
    if(i.owner===u.name&&available.includes('drop'))action=`<button data-info-action="drop:${i.id}">Drop · one action</button>`;
    open(i.name,i.art,i.kind==='weapon'?'WEAPON RECORD':'EQUIPMENT RECORD',`<h3>Equipment statistics</h3>${stats([['Category',i.kind==='weapon'?'Weapon':'Equipment'],['Location',i.pos],['Carried by',i.owner||'Nobody · loose chit']])}<h3>Capability</h3><p>${safe(i.description)}</p><p class="profile-note">Picking up or dropping equipment uses one action. Inspecting information uses no action.</p>${action}`);
  }
  function init(api){
    bridge=api;
    document.addEventListener('contextmenu',e=>{
      const target=e.target.closest('[data-item],[data-specimen],[data-inspect],[data-unit],[data-space],[data-details-item],[data-details-specimen],[data-details-unit],[data-details-room]');
      if(!target)return;e.preventDefault();e.stopPropagation();
      if(target.dataset.item||target.dataset.detailsItem)item(target.dataset.item||target.dataset.detailsItem);
      else if(target.dataset.specimen||target.dataset.detailsSpecimen)specimen(target.dataset.specimen||target.dataset.detailsSpecimen);
      else if(target.dataset.inspect||target.dataset.unit||target.dataset.detailsUnit){close();bridge.inspectUnit(target.dataset.inspect||target.dataset.unit||target.dataset.detailsUnit)}
      else room(target.dataset.space||target.dataset.detailsRoom);
    });
    document.addEventListener('click',e=>{
      const target=e.target.closest('[data-close-info],[data-details-room],[data-details-specimen],[data-details-item],[data-details-unit],[data-info-action]');if(!target)return;
      if(target.hasAttribute('data-close-info'))close();
      else if(target.dataset.detailsRoom)room(target.dataset.detailsRoom);
      else if(target.dataset.detailsSpecimen)specimen(target.dataset.detailsSpecimen);
      else if(target.dataset.detailsItem)item(target.dataset.detailsItem);
      else if(target.dataset.detailsUnit){close();bridge.inspectUnit(target.dataset.detailsUnit)}
      else if(target.dataset.infoAction){const [type,id]=target.dataset.infoAction.split(':');close();if(by('unit-dialog').open)by('unit-dialog').close();bridge.act(type,id)}
    });
  }
  return {init,room,specimen,item};
})();
