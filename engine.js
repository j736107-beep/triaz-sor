/* Triage NiSŁ – logika decyzyjna. Autor: Wujek Fido. Narzędzie pomocnicze, niecertyfikowane. */
(function(root){
// poziomy: r = czerwony (zostaje na SOR, lekarz natychmiast), o = pomarańczowy/żółty (telefon do konsultanta), m = drobna dolegliwość (może NiSŁ)
var REGIONS=[
 {id:'neuro',name:'Głowa / neurologia',cons:'internista',items:[
  ['n_focal','Objawy ogniskowe: niedowład, opadnięty kącik ust, zaburzenia mowy/widzenia (FAST)','r'],
  ['n_thunder','Nagły „najgorszy w życiu” ból głowy (piorunujący)','r'],
  ['n_seiz','Drgawki / utrata przytomności teraz lub w ciągu 24 h','r'],
  ['n_conf','Nowe splątanie, zaburzenia świadomości','r'],
  ['n_mening','Sztywność karku z gorączką','r'],
  ['n_headtr','Uraz głowy (z wymiotami, utratą przytomności, na lekach p/krzepliwych lub >65 r.ż.)','r'],
  ['n_vert','Zawroty głowy / zaburzenia równowagi, podwójne widzenie, niezborność','o'],
  ['n_synk','Omdlenie (przejściowa utrata przytomności) – obecnie bez objawów','o'],
  ['n_head','Ból głowy inny niż zwykle / narastający','o'],
  ['n_headmin','Ból głowy typowy dla pacjenta (znany, jak zwykle), bez objawów alarmowych','m'],
  ['n_ent','Ból gardła / ucha / zatok, katar, kaszel (infekcja górnych dróg oddechowych)','m'],
  ['n_eye','Zaczerwienienie oka bez urazu i bez pogorszenia widzenia','m']]},
 {id:'chest',name:'Klatka piersiowa / krążenie / oddech',cons:'internista',items:[
  ['c_pain','Ból w klatce piersiowej (ucisk, pieczenie, promieniowanie)','r'],
  ['c_dysp','Duszność spoczynkowa / nie mówi pełnymi zdaniami','r'],
  ['c_palp','Kołatanie serca z omdleniem, bólem lub dusznością','r'],
  ['c_hemopt','Krwioplucie','r'],
  ['c_palp2','Kołatanie serca – obecnie bez innych objawów','o'],
  ['c_dysp2','Duszność wysiłkowa nowa lub narastająca, obrzęki nóg','o'],
  ['c_htn','Wysokie ciśnienie bez objawów narządowych','o'],
  ['c_cough','Kaszel / przeziębienie bez duszności','m'],
  ['c_wall','Ból ściany klatki ewidentnie mięśniowy/uciskowy u młodego, bez czynników ryzyka','o']]},
 {id:'abd',name:'Brzuch / układ moczowy',cons:'chirurg',items:[
  ['a_acute','Silny ból brzucha, brzuch twardy/deskowaty','r'],
  ['a_gib','Krwawienie z przewodu pokarmowego: fusowate wymioty, smoliste stolce, krew w stolcu','r'],
  ['a_aaa','Ból brzucha/pleców >50 r.ż. z omdleniem lub tętniącym oporem (tętniak?)','r'],
  ['a_preg','Ból brzucha lub krwawienie z dróg rodnych w ciąży / możliwa ciąża','r'],
  ['a_pain','Ból brzucha umiarkowany, utrzymujący się','o'],
  ['a_vom','Uporczywe wymioty / biegunka z cechami odwodnienia','o'],
  ['a_ret','Zatrzymanie moczu','o'],
  ['a_colic','Ból w okolicy lędźwiowej (kolka nerkowa?) / gorączka z bólem lędźwi','o'],
  ['a_uti','Łagodne objawy dyzuryczne (pieczenie, częstomocz) bez gorączki i bólu lędźwi','m'],
  ['a_gi','Łagodna biegunka / nudności bez odwodnienia i bez krwi','m']]},
 {id:'limb',name:'Kończyny / uraz',cons:'chirurg',items:[
  ['l_isch','Zimna, blada, bez tętna kończyna / nagły silny ból kończyny','r'],
  ['l_open','Złamanie otwarte, deformacja, krwotok','r'],
  ['l_major','Uraz wielomiejscowy / mechanizm wysokoenergetyczny (wypadek, upadek z wysokości)','r'],
  ['l_frac','Uraz kończyny: nie może obciążyć (4 kroki) lub ból kostny wg Ottawa – podejrzenie złamania','o'],
  ['l_dvt','Jednostronny obrzęk i ból łydki (zakrzepica?)','o'],
  ['l_wound','Rana wymagająca szycia / opatrzenia','o'],
  ['l_back','Ból pleców z zaburzeniami czucia, oddawania moczu/stolca','r'],
  ['l_sprain','Skręcenie stawu: chodzi samodzielnie, bez bólu kostnego wg Ottawa','m'],
  ['l_minor','Drobne otarcie / stłuczenie bez deformacji','m'],
  ['l_chron','Przewlekły ból kręgosłupa/stawów bez nowych objawów neurologicznych','m']]},
 {id:'skin',name:'Skóra / wysypka',cons:'internista',items:[
  ['s_pete','Wybroczyny / plamica nieblednąca przy ucisku z gorączką lub złym stanem','r'],
  ['s_anaph','Pokrzywka z obrzękiem warg/języka, chrypką, dusznością lub spadkiem RR (anafilaksja)','r'],
  ['s_blist','Rozległe pęcherze, złuszczanie skóry, zajęcie błon śluzowych','r'],
  ['s_cell','Zaczerwienienie szerzące się, gorące, bolesne (cellulitis) / ropień','o'],
  ['s_burn','Oparzenie większe niż dłoń pacjenta, twarzy, rąk, krocza','o'],
  ['s_urt','Pokrzywka bez obrzęku i bez duszności','o'],
  ['s_rash','Drobna wysypka bez gorączki i bez wybroczyn, dobry stan','m'],
  ['s_bite','Drobne ukąszenie owada / kleszcz bez reakcji ogólnej','m']]},
 {id:'gen',name:'Ogólne / czynniki ryzyka',cons:'internista',items:[
  ['g_preg','Ciąża','o'],
  ['g_ac','Leki przeciwkrzepliwe (NOAC, warfaryna, heparyna)','o'],
  ['g_imm','Immunosupresja / chemioterapia / neutropenia','o'],
  ['g_surg','Operacja / zabieg w ostatnich 4 tygodniach','o'],
  ['g_frail','Wiek >65 i krucha osoba / niesamodzielna','o'],
  ['g_tox','Zatrucie / alkohol / środki odurzające','o'],
  ['g_sick','Pacjent „wygląda źle” wg ratownika (intuicja kliniczna)','o'],
  ['g_rx','Kontynuacja leczenia / recepta / zaświadczenie','m'],
  ['g_chron','Przewlekła, stabilna dolegliwość bez zmian','m']]}
];
var ITEM={};REGIONS.forEach(function(r){r.items.forEach(function(i){ITEM[i[0]]={id:i[0],t:i[1],lv:i[2],reg:r.id,cons:r.cons}})});
// immunosupresja z gorączką i antykoagulacja z urazem eskalują
function news2(v){
 var s=0,parts={},three=false;
 function a(k,p){parts[k]=p;s+=p;if(p===3)three=true}
 var rr=v.rr; a('rr',rr<=8?3:rr<=11?1:rr<=20?0:rr<=24?2:3);
 var o=v.spo2; a('spo2',o<=91?3:o<=93?2:o<=95?1:0);
 a('o2',v.o2?2:0);
 var t=v.temp; a('temp',t<=35?3:t<=36?1:t<=38?0:t<=39?1:2);
 var sb=v.sbp; a('sbp',sb<=90?3:sb<=100?2:sb<=110?1:sb<=219?0:3);
 var h=v.hr; a('hr',h<=40?3:h<=50?1:h<=90?0:h<=110?1:h<=130?2:3);
 a('acvpu',(v.avpu&&v.avpu!=='A')||v.gcs<15?3:0);
 return {score:s,parts:parts,single3:three};
}
var REQ=['sbp','dbp','hr','spo2','temp','rr','weight','age','sex','avpu','gcs','pain'];
var LBL={sbp:'RR skurczowe',dbp:'RR rozkurczowe',hr:'Tętno',spo2:'SpO₂',temp:'Temperatura',rr:'Częstość oddechów',weight:'Masa ciała',age:'Wiek',sex:'Płeć',avpu:'AVPU',gcs:'GCS',pain:'Ból NRS'};
var RANGE={sbp:[30,300],dbp:[10,200],hr:[20,250],spo2:[50,100],temp:[30,44],rr:[3,70],weight:[1,300],age:[0,120],gcs:[3,15],pain:[0,10],glu:[10,1500]};
function missing(v,checks){
 var m=[];REQ.forEach(function(k){var x=v[k];if(x===undefined||x===null||x===''||(typeof x==='number'&&isNaN(x)))m.push(LBL[k]);else if(RANGE[k]&&(x<RANGE[k][0]||x>RANGE[k][1]))m.push(LBL[k]+' (poza zakresem)')});
 REGIONS.forEach(function(r){var st=checks[r.id];if(!st||(!st.none&&!(st.items&&st.items.length)))m.push('Region: '+r.name+' – zaznacz „brak objawów” lub objawy')});
 return m;
}
function decide(v,checks){
 var miss=missing(v,checks);
 if(miss.length)return {level:'incomplete',missing:miss};
 var R=[],O=[],M=[],cons={};
 function red(t){R.push(t)} function or(t,c){O.push(t);cons[c||'internista']=1}
 var n=news2(v);
 // parametry życiowe
 if(v.spo2<92)red('SpO₂ '+v.spo2+'% (<92%)');
 if(v.sbp<90)red('RR skurczowe '+v.sbp+' mmHg (<90)');
 if(v.sbp>220)red('RR skurczowe '+v.sbp+' mmHg (>220)');
 if(v.dbp>=120)red('RR rozkurczowe '+v.dbp+' mmHg (≥120)');
 if(v.hr<40)red('Tętno '+v.hr+'/min (<40)');
 if(v.hr>130)red('Tętno '+v.hr+'/min (>130)');
 if(v.rr<9||v.rr>=25)red('Oddechy '+v.rr+'/min');
 if(v.gcs<15||v.avpu!=='A')red('Zaburzenia świadomości (GCS '+v.gcs+', AVPU '+v.avpu+')');
 if(v.temp<35)red('Hipotermia '+v.temp+' °C');
 if(v.temp>39.5&&v.hr>100)red('Gorączka '+v.temp+' °C z tachykardią '+v.hr+'/min');
 if(v.glu!=null&&!isNaN(v.glu)){if(v.glu<70)red('Hipoglikemia '+v.glu+' mg/dl');else if(v.glu>300)red('Glikemia '+v.glu+' mg/dl (>300)');else if(v.glu>250)or('Glikemia '+v.glu+' mg/dl (>250)')}
 if(v.o2)red('Wymaga tlenoterapii');
 var q=(v.rr>=22?1:0)+(v.sbp<=100?1:0)+(v.gcs<15?1:0);
 if(q>=2)red('qSOFA '+q+' – podejrzenie sepsy');
 if(n.score>=7)red('NEWS2 '+n.score+' (≥7 – wysokie ryzyko)');
 else if(n.score>=5)or('NEWS2 '+n.score+' (5–6 – średnie ryzyko)');
 else if(n.single3)or('NEWS2: pojedynczy parametr za 3 pkt');
 else if(n.score>=3)or('NEWS2 '+n.score+' (3–4)');
 if(v.pain>=8)or('Silny ból NRS '+v.pain);
 else if(v.pain>=5)or('Umiarkowany ból NRS '+v.pain+' (ocena lekarska)');
 if(v.temp>=38.5&&R.length===0)or('Gorączka '+v.temp+' °C');
 if(v.age<18)or('Pacjent <18 r.ż. – NEWS2 nie dotyczy dzieci, konsultacja');
 if(v.sbp>=180&&v.sbp<=220)or('RR skurczowe '+v.sbp+' mmHg (≥180)');
 if(v.dbp>=110&&v.dbp<120)or('RR rozkurczowe '+v.dbp+' mmHg (≥110)');
 if(v.hr>110&&v.hr<=130)or('Tachykardia '+v.hr+'/min');
 // objawy
 var sel={};REGIONS.forEach(function(r){var st=checks[r.id];if(st&&!st.none)(st.items||[]).forEach(function(id){sel[id]=1})});
 Object.keys(sel).forEach(function(id){var it=ITEM[id];if(!it)return;
  if(it.lv==='r')red(it.t);else if(it.lv==='o')or(it.t,it.cons);else M.push(it.t)});
 // kombinacje
 if(sel.g_imm&&v.temp>=38)red('Gorączka u pacjenta z immunosupresją/neutropenią');
 if(sel.g_ac&&(sel.l_minor||sel.l_frac||sel.l_wound||sel.n_headtr))red('Uraz u pacjenta na lekach przeciwkrzepliwych');
 if(sel.g_preg&&v.sbp>=140)red('Ciąża z RR ≥140 (stan przedrzucawkowy?)');
 if(v.age>=65&&sel.l_minor&&sel.g_frail)or('Upadek u osoby starszej, kruchej',"chirurg");
 if(!Object.keys(sel).length&&!R.length&&!O.length)or('Brak zaznaczonej dolegliwości – określ powód zgłoszenia');
 var level=R.length?'red':O.length?'orange':'blue';
 var c=Object.keys(cons);if(level==='orange'&&!c.length)c=['internista'];
 return {level:level,red:R,orange:O,minor:M,consult:level==='orange'?c.sort():[],news2:n,qsofa:q};
}
var api={REGIONS:REGIONS,ITEM:ITEM,news2:news2,decide:decide,missing:missing,LBL:LBL};
if(typeof module!=='undefined')module.exports=api;else root.TRI=api;
})(this);
