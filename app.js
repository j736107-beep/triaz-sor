(function(){var $=function(i){return document.getElementById(i)},T=window.TRI,checks={},last=null,muted=localStorage.getItem('triMute')==='1',ac=null,sirenOn=false,osc=null,lfoT=null,tStart=new Date();
function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
// regiony
var RH='';T.REGIONS.forEach(function(r){RH+='<section class="reg todo" id="reg_'+r.id+'"><h3>'+r.name+'</h3><label class="it none"><input type="checkbox" data-none="'+r.id+'"> Brak objawów / nie dotyczy</label><div class="items">';
 r.items.forEach(function(i){RH+='<label class="it '+i[2]+'"><input type="checkbox" data-reg="'+r.id+'" value="'+i[0]+'"> '+esc(i[1])+'</label>'});RH+='</div></section>'});
$('regions').innerHTML=RH;
// dźwięk – WebAudio, odblokowany pierwszym kliknięciem
function unlock(){try{if(!ac)ac=new (window.AudioContext||window.webkitAudioContext)();if(ac.state==='suspended')ac.resume()}catch(e){}}
['pointerdown','keydown','touchstart'].forEach(function(e){document.addEventListener(e,unlock,true)});
function siren(){if(muted||!ac)return;stopSiren();var g=ac.createGain();g.gain.value=0.25;g.connect(ac.destination);osc=ac.createOscillator();osc.type='sawtooth';osc.connect(g);var t=ac.currentTime;
 for(var k=0;k<8;k++){osc.frequency.setValueAtTime(650,t+k*0.5);osc.frequency.linearRampToValueAtTime(1350,t+k*0.5+0.25);osc.frequency.linearRampToValueAtTime(650,t+k*0.5+0.5)}
 osc.start(t);osc.stop(t+4);g.gain.setValueAtTime(0.25,t+3.8);g.gain.linearRampToValueAtTime(0,t+4)}
function stopSiren(){try{if(osc)osc.stop()}catch(e){}osc=null}
function setMute(){$('mute').textContent=muted?'🔇':'🔊';if(muted)stopSiren()}
$('mute').onclick=function(){muted=!muted;localStorage.setItem('triMute',muted?'1':'0');setMute()};setMute();
$('startDiscOk').onclick=function(){$('startDisc').style.display='none'};
function num(id){var v=$(id).value.trim().replace(',','.');return v===''?NaN:parseFloat(v)}
function vals(){return{sbp:num('sbp'),dbp:num('dbp'),hr:num('hr'),spo2:num('spo2'),temp:num('temp'),rr:num('rr'),weight:num('weight'),age:num('age'),sex:$('sex').value,avpu:$('avpu').value,gcs:num('gcs'),pain:num('pain'),glu:isNaN(num('glu'))?null:num('glu'),o2:$('o2').checked}}
function flagCls(k,v){var x=v[k];if(isNaN(x))return'';var n=T.news2(Object.assign({rr:16,spo2:98,temp:37,sbp:120,hr:70,avpu:'A',gcs:15},(function(){var o={};o[k]=x;return o})()));
 var p=n.parts[{sbp:'sbp',hr:'hr',spo2:'spo2',temp:'temp',rr:'rr'}[k]];return p===undefined?'':p>=3?'bad':p>=1?'warn':'ok'}
function upd(){var v=vals();['sbp','hr','spo2','temp','rr'].forEach(function(k){$(k).className=flagCls(k,v)});
 $('gcs').className=isNaN(v.gcs)?'':v.gcs<15?'bad':'ok';
 T.REGIONS.forEach(function(r){var st=checks[r.id],el=$('reg_'+r.id);el.classList.toggle('todo',!st||(!st.none&&!st.items.length));el.querySelector('.items').classList.toggle('off',!!(st&&st.none))});
 var d=T.decide(v,checks),h='';
 if(d.level==='incomplete')h='<div class="card incomplete"><h2>⏳ Uzupełnij dane</h2>Brakuje:<ul>'+d.missing.map(function(m){return'<li>'+esc(m)+'</li>'}).join('')+'</ul></div>';
 else{var t={blue:'🔵 NIEBIESKI – można skierować do NiSŁ (opieka całodobowa)',orange:'🟠 ŻÓŁTY/POMARAŃCZOWY – zadzwoń do konsultanta: '+d.consult.join(' / '),red:'🔴 CZERWONY – pacjent zostaje na SOR, lekarz natychmiast'}[d.level];
  h='<div class="card '+d.level+'"><h2>'+t+'</h2>NEWS2: <b>'+d.news2.score+'</b> · qSOFA: <b>'+d.qsofa+'</b>';
  if(d.red.length)h+='<p><b>Czerwone flagi:</b></p><ul>'+d.red.map(function(x){return'<li>'+esc(x)+'</li>'}).join('')+'</ul>';
  if(d.orange.length)h+='<p><b>Wymaga oceny lekarskiej:</b></p><ul>'+d.orange.map(function(x){return'<li>'+esc(x)+'</li>'}).join('')+'</ul>';
  if(d.level==='blue')h+='<p>Dolegliwości drobne: '+(d.minor.map(esc).join('; ')||'—')+'</p><p>Parametry prawidłowe, brak czerwonych flag. Poinformuj pacjenta: przy pogorszeniu – natychmiast powrót na SOR.</p>';
  h+='</div>'}
 $('result').innerHTML=h;$('print').disabled=d.level==='incomplete';
 var red=d.level==='red';$('lamp').classList.toggle('on',red);
 if(red&&!sirenOn)siren();if(!red)stopSiren();sirenOn=red;last=d}
document.addEventListener('input',upd);document.addEventListener('change',function(e){var t=e.target;
 if(t.dataset.none){var r=t.dataset.none;checks[r]=checks[r]||{items:[]};checks[r].none=t.checked;if(t.checked){checks[r].items=[];document.querySelectorAll('input[data-reg="'+r+'"]').forEach(function(c){c.checked=false})}}
 else if(t.dataset.reg){var g=t.dataset.reg;checks[g]=checks[g]||{items:[]};checks[g].items=[].slice.call(document.querySelectorAll('input[data-reg="'+g+'"]:checked')).map(function(c){return c.value});
  if(checks[g].items.length){checks[g].none=false;document.querySelector('input[data-none="'+g+'"]').checked=false}}
 upd()});
function fmt(d){function p(n){return('0'+n).slice(-2)}return p(d.getDate())+'.'+p(d.getMonth()+1)+'.'+d.getFullYear()+' '+p(d.getHours())+':'+p(d.getMinutes())}
function reset(){document.querySelectorAll('#form input,#form select').forEach(function(e){if(e.type==='checkbox')e.checked=false;else e.value=''});checks={};tStart=new Date();$('time').value=fmt(tStart);$('report').innerHTML='';stopSiren();sirenOn=false;upd();window.scrollTo(0,0)}
$('reset').onclick=function(){if(confirm('Wyczyścić dane i zacząć nowego pacjenta?'))reset()};
function report(){var v=vals(),d=last,n=d.news2.parts,rows=[['RR',v.sbp+'/'+v.dbp+' mmHg',n.sbp],['Tętno',v.hr+' /min',n.hr],['SpO₂',v.spo2+' %'+(v.o2?' (tlen)':''),n.spo2+n.o2],['Temperatura',v.temp+' °C',n.temp],['Oddechy',v.rr+' /min',n.rr],['Świadomość','GCS '+v.gcs+', AVPU '+v.avpu,n.acvpu],['Ból NRS',v.pain,''],['Glukoza',v.glu==null?'—':v.glu+' mg/dl','']];
 var sym='';T.REGIONS.forEach(function(r){var st=checks[r.id];sym+='<tr><th>'+r.name+'</th><td>'+(st.none?'brak objawów':st.items.map(function(i){return esc(T.ITEM[i].t)}).join('<br>'))+'</td></tr>'});
 var dec={blue:'NIEBIESKI – kwalifikacja do przekierowania do NiSŁ',orange:'ŻÓŁTY/POMARAŃCZOWY – wymaga konsultacji telefonicznej: '+d.consult.join(' / '),red:'CZERWONY – pozostaje w SOR, pilna ocena lekarska'}[d.level];
 $('report').innerHTML='<h1>Szpitalny Oddział Ratunkowy – Szpital w Nowym Targu</h1><div><b>Triage: wstępna ocena i kwalifikacja do przekierowania do NiSŁ</b> (nocna i świąteczna opieka zdrowotna)</div><div>Data i godzina oceny: '+fmt(tStart)+' · wydruk: '+fmt(new Date())+'</div>'+
 '<h2>Pacjent</h2><table><tr><th>Imię i nazwisko</th><td>'+esc($('pname').value)+'</td><th>PESEL/ID</th><td>'+esc($('pid').value)+'</td></tr><tr><th>Wiek / płeć</th><td>'+v.age+' / '+v.sex+'</td><th>Masa ciała</th><td>'+v.weight+' kg</td></tr><tr><th>Powód zgłoszenia</th><td colspan="3">'+esc($('complaint').value)+'</td></tr></table>'+
 '<h2>Parametry życiowe (NEWS2 = '+d.news2.score+', qSOFA = '+d.qsofa+')</h2><table><tr><th>Parametr</th><th>Wartość</th><th>pkt NEWS2</th></tr>'+rows.map(function(r){return'<tr><td>'+r[0]+'</td><td'+(r[2]>=3?' class="flag"':'')+'>'+esc(r[1])+(r[2]>=3?' ⚠':'')+'</td><td>'+r[2]+'</td></tr>'}).join('')+'</table>'+
 '<h2>Objawy</h2><table>'+sym+'</table><div class="dec"><b>Decyzja: '+dec+'</b>'+(d.red.length?'<br>Czerwone flagi: '+d.red.map(esc).join('; '):'')+(d.orange.length?'<br>Wymaga oceny: '+d.orange.map(esc).join('; '):'')+(d.level==='blue'?'<br>Brak czerwonych flag, parametry prawidłowe. Pacjent poinformowany o powrocie na SOR przy pogorszeniu.':'')+'</div>'+
 '<p><small>Narzędzie pomocnicze, niecertyfikowane; decyzję podejmuje ratownik/lekarz. Oparte na NEWS2 (RCP 2017), qSOFA, zasadach triage MTS/ESI, regułach Ottawa. Autor: Wujek Fido.</small></p>'+
 '<div class="sig"><div>Podpis i pieczątka ratownika</div><div>Lekarz NiSŁ – przyjął (data, godzina, podpis)</div></div>'}
$('print').onclick=function(){if(!last||last.level==='incomplete')return;report();window.print()};
window.addEventListener('beforeprint',function(){if(last&&last.level!=='incomplete')report()});
reset();
window.__tri={vals:vals,checks:function(){return checks},last:function(){return last}};
})();
