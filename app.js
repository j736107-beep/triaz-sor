(function(){var $=function(i){return document.getElementById(i)},T=window.TRI,checks={},last=null,muted=localStorage.getItem('triMute')==='1',ac=null,sirenOn=-1,osc=null,lfoT=null,tStart=new Date();
function esc(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
// regiony
var RH='';T.REGIONS.forEach(function(r){RH+='<section class="reg todo" id="reg_'+r.id+'"><h3>'+r.name+'</h3><label class="it none"><input type="checkbox" data-none="'+r.id+'"> Brak objawów / nie dotyczy</label><div class="items">';
 r.items.forEach(function(i){RH+='<label class="it L'+i[2]+'"><input type="checkbox" data-reg="'+r.id+'" value="'+i[0]+'"> '+esc(i[1])+'</label>'});RH+='</div></section>'});
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
function vals(){return{sbp:num('sbp'),dbp:num('dbp'),hr:num('hr'),spo2:num('spo2'),temp:num('temp'),rr:num('rr'),weight:num('weight'),age:num('age'),sex:$('sex').value,avpu:$('avpu').value,gcs:num('gcs'),pain:num('pain'),glu:isNaN(num('glu'))?null:num('glu'),o2:$('o2').checked,onset:$('onset').value}}
function flagCls(k,v){var x=v[k];if(isNaN(x))return'';var n=T.news2(Object.assign({rr:16,spo2:98,temp:37,sbp:120,hr:70,avpu:'A',gcs:15},(function(){var o={};o[k]=x;return o})()));
 var p=n.parts[{sbp:'sbp',hr:'hr',spo2:'spo2',temp:'temp',rr:'rr'}[k]];return p===undefined?'':p>=3?'bad':p>=1?'warn':'ok'}
function upd(){var v=vals();['sbp','hr','spo2','temp','rr'].forEach(function(k){$(k).className=flagCls(k,v)});
 $('gcs').className=isNaN(v.gcs)?'':v.gcs<15?'bad':'ok';
 T.REGIONS.forEach(function(r){var st=checks[r.id],el=$('reg_'+r.id);el.classList.toggle('todo',!st||(!st.none&&!st.items.length));el.querySelector('.items').classList.toggle('off',!!(st&&st.none))});
 var d=T.applyTopsor(T.decide(v,checks),$('topsor').value),h='';var COL={red:'🔴',orange:'🟠',yellow:'🟡',green:'🟢',blue:'🔵'};
 if(d.level==='incomplete')h='<div class="card incomplete"><h2>⏳ Uzupełnij dane</h2>Brakuje:<ul>'+d.missing.map(function(m){return'<li>'+esc(m)+'</li>'}).join('')+'</ul></div>';
 else{var tt=ttime(),dl=T.deadline(tt,d);
  h=(d.mismatch?'<div class="warnbox">⚠️ Rozbieżność z TOPSOR – obowiązuje kategoria z TOPSOR (TOPSOR: '+d.name+', aplikacja: '+d.appName+')</div>':'')+'<div class="card '+d.level+'"><h2>'+COL[d.level]+' '+d.name+(d.topsor?' (TOPSOR)':' (propozycja aplikacji)')+' – '+d.maxTxt+'</h2><div><i>Wynik pomocniczy – obowiązuje kategoria nadana w TOPSOR</i></div><div>Triage: '+hm(tt)+' · lekarz najpóźniej do: <b>'+hm(dl)+'</b> · <span class="cd" id="cd"></span></div><div><b>'+esc(d.dest)+'</b></div>';
  if(d.consult.length)h+='<div>Sugerowany konsultant: <b>'+d.consult.join(' / ')+'</b></div>';
  h+='<div>'+(d.news2?'NEWS2: <b>'+d.news2.score+'</b> · qSOFA: <b>'+d.qsofa+'</b>':'Pacjent pediatryczny – zakresy parametrów wg wieku (NEWS2 nie dotyczy)')+'</div>';
  if(d.reasons.length)h+='<p><b>Powody (od najpilniejszego):</b></p><ul class="rs">'+d.reasons.map(function(x){return'<li class="l'+x.lv+'">'+COL[T.LV[x.lv].k]+' '+esc(x.t)+'</li>'}).join('')+'</ul>';
  if(d.level==='blue')h+='<p>Dolegliwości drobne: '+(d.minor.map(esc).join('; ')||'—')+'. Poinformuj pacjenta: przy pogorszeniu – natychmiast powrót na SOR.</p>';
  h+='</div>'}
 $('result').innerHTML=h;var HB={red:'#c62828',orange:'#ef6c00',yellow:'#c79100',green:'#2e7d32',blue:'#1565c0'};document.querySelector('header').style.background=HB[d.level]||'#1565c0';document.querySelector('header b').textContent=d.name?('Triage: '+d.name+' – '+d.maxTxt):'Triage SOR (5 kolorów) v2';$('print').disabled=d.level==='incomplete';
 var al=!!d.alarm;$('lamp').classList.toggle('on',al);$('lamp').classList.toggle('or',d.level==='orange');
 var key=al?d.lvl:-1;if(al&&key!==sirenOn)siren();if(!al)stopSiren();sirenOn=key;last=d;tick()}
function hm(d){return('0'+d.getHours()).slice(-2)+':'+('0'+d.getMinutes()).slice(-2)}
function ttime(){var t=$('time').value.split(':'),d=new Date(tStart);if(t.length===2){d.setHours(+t[0],+t[1],0,0)}return d}
function tick(){var e=$('cd');if(!e||!last||last.level==='incomplete')return;if(last.maxMin===0){e.textContent='NATYCHMIAST';return}var ms=T.deadline(ttime(),last)-new Date(),m=Math.floor(Math.abs(ms)/60000),s=Math.floor(Math.abs(ms)/1000)%60;e.textContent=(ms<0?'PRZEKROCZONO o ':'pozostało ')+m+':'+('0'+s).slice(-2)}
setInterval(tick,1000);
document.addEventListener('input',upd);document.addEventListener('change',function(e){var t=e.target;
 if(t.dataset.none){var r=t.dataset.none;checks[r]=checks[r]||{items:[]};checks[r].none=t.checked;if(t.checked){checks[r].items=[];document.querySelectorAll('input[data-reg="'+r+'"]').forEach(function(c){c.checked=false})}}
 else if(t.dataset.reg){var g=t.dataset.reg;checks[g]=checks[g]||{items:[]};checks[g].items=[].slice.call(document.querySelectorAll('input[data-reg="'+g+'"]:checked')).map(function(c){return c.value});
  if(checks[g].items.length){checks[g].none=false;document.querySelector('input[data-none="'+g+'"]').checked=false}}
 upd()});
function fmt(d){function p(n){return('0'+n).slice(-2)}return p(d.getDate())+'.'+p(d.getMonth()+1)+'.'+d.getFullYear()+' '+p(d.getHours())+':'+p(d.getMinutes())}
function reset(){document.querySelectorAll('#form input,#form select,#topsor').forEach(function(e){if(e.type==='checkbox')e.checked=false;else e.value=''});checks={};tStart=new Date();$('time').value=hm(tStart);$('report').innerHTML='';stopSiren();sirenOn=-1;upd();window.scrollTo(0,0)}
$('reset').onclick=function(){if(confirm('Wyczyścić dane i zacząć nowego pacjenta?'))reset()};
function report(){var v=vals(),d=last,tt=ttime(),dl=T.deadline(tt,d),n=d.news2?d.news2.parts:{},P=d.news2?function(k){return n[k]}:function(){return'–'};
 var rows=[['RR',v.sbp+'/'+v.dbp+' mmHg','sbp'],['Tętno',v.hr+' /min','hr'],['SpO₂',v.spo2+' %'+(v.o2?' (tlen)':''),'spo2'],['Temperatura',v.temp+' °C','temp'],['Oddechy',v.rr+' /min','rr'],['Świadomość','GCS '+v.gcs+', AVPU '+v.avpu,'acvpu'],['Ból NRS',v.pain,''],['Glukoza',v.glu==null?'—':v.glu+' mg/dl','']];
 var ON={sudden:'nagły (minuty)',h24:'w ciągu 24 h',d7:'1–7 dni',chron:'>7 dni / przewlekłe'};
 var sym='';T.REGIONS.forEach(function(r){var st=checks[r.id];sym+='<tr><th>'+r.name+'</th><td>'+(st.none?'brak':st.items.map(function(i){return esc(T.ITEM[i].t)}).join('<br>'))+'</td></tr>'});
 var BG={red:'#c62828;color:#fff',orange:'#ef6c00;color:#fff',yellow:'#fbc02d;color:#000',green:'#2e7d32;color:#fff',blue:'#1e88e5;color:#fff'}[d.level];
 $('report').innerHTML='<h1>Karta segregacji medycznej (triage) – SOR Szpital w Nowym Targu</h1><div>Data: '+fmt(tStart).slice(0,10)+' · godzina triage: <b>'+hm(tt)+'</b> · wydruk: '+fmt(new Date())+'</div>'+
 '<div><b>Kolor nadany w TOPSOR: '+(d.topsor?d.name:'brak')+'</b> · propozycja aplikacji: '+d.appName+'</div>'+(d.mismatch?'<div class="warnp">⚠ Rozbieżność z TOPSOR – obowiązuje kategoria z TOPSOR</div>':'')+'<div class="band" style="background:'+BG+'">'+(d.topsor?'TOPSOR: ':'')+d.name+' – '+d.maxTxt+(d.maxMin?' · lekarz najpóźniej do '+hm(dl):' · NATYCHMIAST')+'</div>'+
 '<h2>Pacjent</h2><table><tr><th>Imię i nazwisko</th><td>'+esc($('pname').value)+'</td><th>PESEL/ID</th><td>'+esc($('pid').value)+'</td></tr><tr><th>Wiek / płeć</th><td>'+v.age+' / '+v.sex+'</td><th>Masa ciała</th><td>'+v.weight+' kg</td></tr><tr><th>Powód zgłoszenia</th><td>'+esc($('complaint').value)+'</td><th>Początek objawów</th><td>'+ON[v.onset]+'</td></tr></table>'+
 '<h2>Parametry życiowe ('+(d.news2?'NEWS2 = '+d.news2.score+', qSOFA = '+d.qsofa:'pacjent pediatryczny – normy wg wieku')+')</h2><table><tr><th>Parametr</th><th>Wartość</th><th>pkt NEWS2</th></tr>'+rows.map(function(r){var p=r[2]?P(r[2]):'';if(r[2]==='spo2'&&d.news2)p=n.spo2+n.o2;return'<tr><td>'+r[0]+'</td><td'+(p>=3?' class="flag"':'')+'>'+esc(r[1])+(p>=3?' ⚠':'')+'</td><td>'+p+'</td></tr>'}).join('')+'</table>'+
 '<h2>Dyskryminatory / objawy</h2><table>'+sym+'</table>'+
 '<div class="dec"><b>Kategoria: '+d.name+'</b> (maks. czas do pierwszego kontaktu z lekarzem: '+d.maxTxt+')<br><b>Decyzja / miejsce: '+esc(d.dest)+'</b>'+(d.consult.length?'<br>Sugerowany konsultant: '+d.consult.join(' / '):'')+
 (d.reasons.length?'<br>Powody: '+d.reasons.map(function(r){return T.LV[r.lv].n+': '+esc(r.t)}).join('; '):'')+(d.level==='blue'?'<br>Brak dyskryminatorów pilności. Pacjent poinformowany o powrocie na SOR przy pogorszeniu.':'')+'</div>'+
 '<p><b>Wynik pomocniczy – obowiązuje kategoria nadana w TOPSOR.</b></p><p><small>Kategorie pilności wg § 6 ust. 9 rozporządzenia MZ z 27.06.2019 w sprawie SOR (t.j. Dz.U. 2025 poz. 1646). Narzędzie pomocnicze, niecertyfikowane; decyzję podejmuje ratownik/lekarz. Dyskryminatory wzorowane na MTS, NEWS2 (RCP 2017), qSOFA, regułach Ottawa. Autor: Wujek Fido.</small></p>'+
 '<div class="sig"><div>Podpis i pieczątka ratownika / pielęgniarki systemu</div>'+(d.level==='blue'?'<div>Lekarz NiSŁ – przyjął (data, godzina, podpis)</div>':'')+'</div>'}
$('print').onclick=function(){if(!last||last.level==='incomplete')return;report();window.print()};
window.addEventListener('beforeprint',function(){if(last&&last.level!=='incomplete')report()});
reset();
window.__tri={vals:vals,checks:function(){return checks},last:function(){return last}};
})();
