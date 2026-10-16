/* Triage SOR – 5 kategorii pilności (§ 6 ust. 9 rozp. MZ ws. SOR, Dz.U. 2025 poz. 1646). Autor: Wujek Fido. Narzędzie pomocnicze, niecertyfikowane. */
(function(root){
var LV=[{k:'red',n:'CZERWONY',min:0,t:'natychmiastowy kontakt z lekarzem'},{k:'orange',n:'POMARAŃCZOWY',min:10,t:'do 10 minut'},{k:'yellow',n:'ŻÓŁTY',min:60,t:'do 60 minut'},{k:'green',n:'ZIELONY',min:120,t:'do 120 minut'},{k:'blue',n:'NIEBIESKI',min:240,t:'do 240 minut'}];
// [id, tekst, poziom 0=czerwony 1=pomarańczowy 2=żółty 3=zielony 4=drobne (niebieski)]
var REGIONS=[
 {id:'abc',name:'Dyskryminatory ogólne (ABC, wstrząs, krwawienie)',cons:'internista',items:[
  ['x_air','Zagrożona drożność dróg oddechowych / stridor / ślinotok','0'],
  ['x_breath','Niewydolny oddech: brak oddechu, oddech agonalny, skrajna duszność','0'],
  ['x_shock','Wstrząs: blada, zimna, spocona skóra, nitkowate tętno, CRT >2 s','0'],
  ['x_conv','Drgawki obecnie','0'],
  ['x_bleedM','Krwotok niekontrolowany (masywny)','0'],
  ['x_bleed','Krwawienie niewielkie, nie daje się zatamować','2'],
  ['x_cold','Wychłodzenie / pacjent „wygląda bardzo źle”','1']]},
 {id:'neuro',name:'Głowa / neurologia',cons:'internista',items:[
  ['n_befast','BE-FAST: równowaga, oczy, twarz, ręka, mowa – nowe objawy ogniskowe','1'],
  ['n_thunder','Nagły „najgorszy w życiu” ból głowy (piorunujący)','1'],
  ['n_seiz','Drgawki w ciągu 24 h (obecnie ustąpiły)','1'],
  ['n_conf','Nowe splątanie / zaburzenia świadomości w wywiadzie','1'],
  ['n_mening','Sztywność karku, ból głowy z gorączką','1'],
  ['n_headtr','Uraz głowy z utratą przytomności, wymiotami lub na lekach p/krzepliwych','1'],
  ['n_headtr2','Uraz głowy bez utraty przytomności i bez objawów','3'],
  ['n_vert','Zawroty głowy / zaburzenia równowagi, podwójne widzenie','2'],
  ['n_synk','Omdlenie – obecnie bez objawów','2'],
  ['n_head','Ból głowy inny niż zwykle / narastający','2'],
  ['n_headmin','Ból głowy typowy dla pacjenta, bez objawów alarmowych','4'],
  ['n_ent','Ból gardła / ucha / zatok, katar, kaszel (infekcja górnych dróg)','4'],
  ['n_eye','Zaczerwienienie oka bez urazu i bez pogorszenia widzenia','4'],
  ['n_eyeT','Uraz oka / nagła utrata lub pogorszenie widzenia','1']]},
 {id:'chest',name:'Klatka piersiowa / krążenie / oddech',cons:'internista',items:[
  ['c_pain','Ból w klatce piersiowej o charakterze wieńcowym (ucisk, pieczenie, promieniowanie)','1'],
  ['c_dysp','Duszność ostra / nie mówi pełnymi zdaniami','1'],
  ['c_palp','Kołatanie serca z omdleniem, bólem lub dusznością','1'],
  ['c_hemopt','Krwioplucie','2'],
  ['c_palp2','Kołatanie serca – obecnie bez innych objawów','2'],
  ['c_dysp2','Duszność wysiłkowa nowa/narastająca, obrzęki nóg','2'],
  ['c_htn','Wysokie ciśnienie bez objawów narządowych','3'],
  ['c_wall','Ból ściany klatki ewidentnie mięśniowy u młodego, bez czynników ryzyka','3'],
  ['c_cough','Kaszel / przeziębienie bez duszności','4']]},
 {id:'abd',name:'Brzuch / układ moczowy',cons:'chirurg',items:[
  ['a_acute','Silny ból brzucha, brzuch deskowaty','1'],
  ['a_gib','Krwawienie z p. pokarmowego: fusowate wymioty, smoliste stolce, krew','1'],
  ['a_aaa','Ból brzucha/pleców >50 r.ż. z omdleniem lub tętniącym oporem','0'],
  ['a_testis','Nagły ból jądra','1'],
  ['a_pain','Ból brzucha umiarkowany, utrzymujący się','2'],
  ['a_vom','Uporczywe wymioty / biegunka z odwodnieniem','2'],
  ['a_ret','Zatrzymanie moczu','2'],
  ['a_colic','Ból w okolicy lędźwiowej (kolka nerkowa?) / gorączka z bólem lędźwi','2'],
  ['a_uti','Łagodne objawy dyzuryczne bez gorączki i bez bólu lędźwi','4'],
  ['a_gi','Łagodna biegunka / nudności bez odwodnienia i bez krwi','4']]},
 {id:'limb',name:'Uraz / mechanizm / kończyny',cons:'chirurg',items:[
  ['l_major','Mechanizm wysokoenergetyczny: wypadek komunikacyjny, upadek >3 m, potrącenie, uraz penetrujący','1'],
  ['l_multi','Uraz wielomiejscowy','0'],
  ['l_isch','Zimna, blada, bez tętna kończyna / nagły silny ból kończyny','1'],
  ['l_open','Złamanie otwarte, duża deformacja','1'],
  ['l_back','Ból pleców z zaburzeniami czucia / zwieraczy','1'],
  ['l_spine','Uraz kręgosłupa szyjnego – ból, tkliwość','2'],
  ['l_frac','Nie może obciążyć (4 kroki) lub ból kostny wg Ottawa – podejrzenie złamania','2'],
  ['l_dvt','Jednostronny obrzęk i ból łydki','2'],
  ['l_wound','Rana wymagająca szycia / opatrzenia','3'],
  ['l_sprain','Skręcenie stawu: chodzi samodzielnie, bez bólu kostnego wg Ottawa','4'],
  ['l_minor','Drobne otarcie / stłuczenie bez deformacji','4'],
  ['l_chron','Przewlekły ból kręgosłupa/stawów bez nowych objawów neurologicznych','4']]},
 {id:'skin',name:'Skóra / wysypka / alergia',cons:'internista',items:[
  ['s_anaph','Anafilaksja: obrzęk warg/języka, chrypka, duszność lub spadek RR','0'],
  ['s_pete','Wybroczyny / plamica nieblednąca z gorączką lub złym stanem','1'],
  ['s_blist','Rozległe pęcherze, złuszczanie skóry, zajęcie błon śluzowych','1'],
  ['s_burnL','Oparzenie rozległe (>10% u dorosłego) / twarzy, dróg oddechowych','1'],
  ['s_burn','Oparzenie większe niż dłoń / rąk, krocza','2'],
  ['s_cell','Zaczerwienienie szerzące się, gorące, bolesne / ropień','3'],
  ['s_urt','Pokrzywka bez obrzęku i bez duszności','3'],
  ['s_rash','Drobna wysypka bez gorączki i bez wybroczyn, dobry stan','4'],
  ['s_bite','Drobne ukąszenie owada / kleszcz bez reakcji ogólnej','4']]},
 {id:'psych',name:'Psychiatria / zatrucie',cons:'internista',items:[
  ['p_att','Próba samobójcza / wysokie ryzyko samobójstwa (plan, środki)','1'],
  ['p_agg','Pobudzenie, agresja, zagrożenie dla siebie lub innych','1'],
  ['p_od','Zatrucie lekami / substancjami (zamierzone lub nieznana ilość)','1'],
  ['p_idea','Myśli samobójcze bez planu','2'],
  ['p_alc','Upojenie alkoholowe, przytomny, bez urazu','2'],
  ['p_psy','Zaostrzenie choroby psychicznej, spokojny','3'],
  ['p_anx','Lęk / bezsenność / stres, bez ryzyka samobójstwa','4']]},
 {id:'gen',name:'Ciąża / czynniki ryzyka / inne',cons:'internista',items:[
  ['g_pregB','Ciąża: krwawienie, ból brzucha, ból głowy z zaburzeniami widzenia, brak ruchów płodu','1'],
  ['g_labor','Poród w toku / odpływanie płynu','1'],
  ['g_preg','Ciąża (inne dolegliwości)','2'],
  ['g_imm','Immunosupresja / chemioterapia / neutropenia','2'],
  ['g_ac','Leki przeciwkrzepliwe (NOAC, warfaryna, heparyna)','3'],
  ['g_surg','Operacja / zabieg w ostatnich 4 tygodniach','3'],
  ['g_frail','Wiek >65 i krucha osoba / niesamodzielna','3'],
  ['g_rx','Kontynuacja leczenia / recepta / zaświadczenie','4'],
  ['g_chron','Przewlekła, stabilna dolegliwość bez zmian','4']]}
];
var ITEM={};REGIONS.forEach(function(r){r.items.forEach(function(i){ITEM[i[0]]={id:i[0],t:i[1],lv:+i[2],reg:r.id,cons:r.cons}})});
// zakresy pediatryczne (APLS/EPLS, orientacyjne): [wiek do, HR min, HR max, RR min, RR max, SBP min]
var PED=[[1,110,160,30,40,70],[2,100,150,25,35,80],[5,95,140,25,30,80],[12,80,120,20,25,90],[16,60,100,15,20,100]];
function pedRange(age){for(var i=0;i<PED.length;i++)if(age<PED[i][0])return{hr:[PED[i][1],PED[i][2]],rr:[PED[i][3],PED[i][4]],sbp:PED[i][5]};return null}
function news2(v){
 var s=0,parts={},three=false;function a(k,p){parts[k]=p;s+=p;if(p===3)three=true}
 var rr=v.rr;a('rr',rr<=8?3:rr<=11?1:rr<=20?0:rr<=24?2:3);
 var o=v.spo2;a('spo2',o<=91?3:o<=93?2:o<=95?1:0);a('o2',v.o2?2:0);
 var t=v.temp;a('temp',t<=35?3:t<=36?1:t<=38?0:t<=39?1:2);
 var sb=v.sbp;a('sbp',sb<=90?3:sb<=100?2:sb<=110?1:sb<=219?0:3);
 var h=v.hr;a('hr',h<=40?3:h<=50?1:h<=90?0:h<=110?1:h<=130?2:3);
 a('acvpu',(v.avpu&&v.avpu!=='A')||v.gcs<15?3:0);
 return {score:s,parts:parts,single3:three};
}
var REQ=['sbp','dbp','hr','spo2','temp','rr','weight','age','sex','avpu','gcs','pain','onset'];
var LBL={sbp:'RR skurczowe',dbp:'RR rozkurczowe',hr:'Tętno',spo2:'SpO₂',temp:'Temperatura',rr:'Częstość oddechów',weight:'Masa ciała',age:'Wiek',sex:'Płeć',avpu:'AVPU',gcs:'GCS',pain:'Ból NRS',onset:'Początek objawów'};
var RANGE={sbp:[30,300],dbp:[10,200],hr:[20,300],spo2:[50,100],temp:[25,44],rr:[3,90],weight:[0.5,300],age:[0,120],gcs:[3,15],pain:[0,10]};
function missing(v,checks){
 var m=[];REQ.forEach(function(k){var x=v[k];if(x===undefined||x===null||x===''||(typeof x==='number'&&isNaN(x)))m.push(LBL[k]);else if(RANGE[k]&&(x<RANGE[k][0]||x>RANGE[k][1]))m.push(LBL[k]+' (poza zakresem)')});
 REGIONS.forEach(function(r){var st=checks[r.id];if(!st||(!st.none&&!(st.items&&st.items.length)))m.push(r.name+' – zaznacz „brak” lub objawy')});
 return m;
}
function decide(v,checks){
 var miss=missing(v,checks);if(miss.length)return {level:'incomplete',missing:miss};
 var reasons=[],cons={},minor=[];
 function add(l,t,c){reasons.push({lv:l,t:t});if(l>=2&&c)cons[c]=1}
 var adult=v.age>=16,n=adult?news2(v):null,P=adult?null:pedRange(v.age);
 // świadomość
 if(v.gcs<=8||v.avpu==='P'||v.avpu==='U')add(0,'Nieprzytomny / GCS '+v.gcs+', AVPU '+v.avpu);
 else if(v.gcs<15||v.avpu==='V'||v.avpu==='C')add(1,'Zaburzenia świadomości (GCS '+v.gcs+', AVPU '+v.avpu+')');
 // oddech / saturacja
 if(v.spo2<90)add(0,'SpO₂ '+v.spo2+'% (<90%)');else if(v.spo2<92)add(1,'SpO₂ '+v.spo2+'% (<92%)');else if(v.spo2<94)add(2,'SpO₂ '+v.spo2+'% (92–93%)');
 if(v.o2)add(1,'Wymaga tlenoterapii');
 if(adult){
  if(v.rr<8||v.rr>35)add(0,'Oddechy '+v.rr+'/min');else if(v.rr<9||v.rr>=25)add(1,'Oddechy '+v.rr+'/min');else if(v.rr>=21)add(3,'Oddechy '+v.rr+'/min (21–24)');
  if(v.sbp<90)add(0,'RR skurczowe '+v.sbp+' mmHg (<90) – wstrząs?');else if(v.sbp<100&&v.hr>100)add(1,'RR '+v.sbp+' mmHg z tętnem '+v.hr+' (wskaźnik wstrząsowy)');
  if(v.sbp>220||v.dbp>=120)add(1,'RR '+v.sbp+'/'+v.dbp+' mmHg (≥220 lub rozkurczowe ≥120)');else if(v.sbp>=180||v.dbp>=110)add(2,'RR '+v.sbp+'/'+v.dbp+' mmHg (≥180/110)');
  if(v.hr<40||v.hr>150)add(0,'Tętno '+v.hr+'/min');else if(v.hr>130)add(1,'Tętno '+v.hr+'/min (>130)');else if(v.hr>110||v.hr<50)add(2,'Tętno '+v.hr+'/min');
  var q=(v.rr>=22?1:0)+(v.sbp<=100?1:0)+(v.gcs<15?1:0);
  if(q>=2)add(1,'qSOFA '+q+' – podejrzenie sepsy');
  if(n.score>=7)add(1,'NEWS2 '+n.score+' (≥7 – wysokie ryzyko)');else if(n.score>=5)add(2,'NEWS2 '+n.score+' (5–6)');else if(n.single3)add(2,'NEWS2: pojedynczy parametr za 3 pkt');else if(n.score>=3)add(3,'NEWS2 '+n.score+' (3–4)');
 }else{
  if(v.sbp<P.sbp-10)add(0,'RR skurczowe '+v.sbp+' – hipotensja dla wieku (norma ≥'+P.sbp+')');else if(v.sbp<P.sbp)add(1,'RR skurczowe '+v.sbp+' poniżej normy dla wieku (≥'+P.sbp+')');
  if(v.hr<P.hr[0]*0.8||v.hr>P.hr[1]*1.25)add(1,'Tętno '+v.hr+' – znacznie poza normą dla wieku ('+P.hr.join('–')+')');else if(v.hr<P.hr[0]||v.hr>P.hr[1])add(2,'Tętno '+v.hr+' poza normą dla wieku ('+P.hr.join('–')+')');
  if(v.rr<P.rr[0]*0.6||v.rr>P.rr[1]*1.4)add(1,'Oddechy '+v.rr+' – znacznie poza normą dla wieku ('+P.rr.join('–')+')');else if(v.rr<P.rr[0]||v.rr>P.rr[1])add(2,'Oddechy '+v.rr+' poza normą dla wieku ('+P.rr.join('–')+')');
  if(v.age<0.25&&v.temp>=38)add(1,'Gorączka u niemowlęcia <3 mies.');
 }
 // temperatura
 if(v.temp<32)add(0,'Głęboka hipotermia '+v.temp+' °C');else if(v.temp<35)add(1,'Hipotermia '+v.temp+' °C');
 else if(v.temp>=41)add(1,'Hipertermia '+v.temp+' °C');else if(v.temp>39.5&&v.hr>100&&adult)add(1,'Gorączka '+v.temp+' °C z tachykardią '+v.hr+'/min (sepsa?)');
 else if(v.temp>=38.5)add(2,'Gorączka '+v.temp+' °C',"internista");else if(v.temp>=38)add(3,'Gorączka '+v.temp+' °C',"internista");
 // glukoza
 if(v.glu!=null&&!isNaN(v.glu)){var gm=function(x){return x+' mg/dl ('+(Math.round(x/18.016*10)/10).toString().replace('.',',')+' mmol/l)'};if(v.glu<70)add(1,'Hipoglikemia '+gm(v.glu));else if(v.glu>250)add(2,'Hiperglikemia '+gm(v.glu));}
 // ból
 if(v.pain>=8)add(1,'Ból bardzo silny NRS '+v.pain);else if(v.pain>=5)add(2,'Ból umiarkowany NRS '+v.pain);
 // objawy
 var sel={};REGIONS.forEach(function(r){var st=checks[r.id];if(st&&!st.none)(st.items||[]).forEach(function(id){sel[id]=1})});
 Object.keys(sel).forEach(function(id){var it=ITEM[id];if(!it)return;if(it.lv===4)minor.push(it.t);else add(it.lv,it.t,it.cons)});
 // kombinacje
 if(sel.n_befast&&(v.onset==='sudden'||v.onset==='h24'))add(0,'Kod udarowy: objawy ogniskowe ≤24 h – w oknie terapeutycznym');
 if(sel.g_imm&&v.temp>=38)add(1,'Gorączka u pacjenta z immunosupresją/neutropenią');
 if(sel.g_ac&&(sel.l_minor||sel.l_frac||sel.l_wound||sel.n_headtr2||sel.l_major))add(1,'Uraz u pacjenta na lekach przeciwkrzepliwych');
 if((sel.g_preg||sel.g_pregB)&&v.sbp>=140)add(1,'Ciąża z RR ≥140 (stan przedrzucawkowy?)');
 if(sel.n_head&&v.onset==='sudden')add(1,'Ból głowy o nagłym początku');
 if(!Object.keys(sel).length&&!reasons.length)add(3,'Brak zaznaczonej dolegliwości – określ powód zgłoszenia');
 var lv=4;reasons.forEach(function(r){if(r.lv<lv)lv=r.lv});
 reasons.sort(function(a,b){return a.lv-b.lv});
 var c=Object.keys(cons).sort();if((lv===2||lv===3)&&!c.length)c=['internista'];
 var L=LV[lv];
 return {level:L.k,lvl:lv,name:L.n,maxMin:L.min,maxTxt:L.t,reasons:reasons,minor:minor,consult:(lv===2||lv===3)?c:[],news2:n,qsofa:adult?q:null,ped:!adult,alarm:lv<=1,
  dest:DEST[lv]};
}
var DEST=['SOR – obszar resuscytacyjno-zabiegowy, lekarz natychmiast','SOR – obszar terapii, lekarz do 10 min','SOR – obszar terapii / obserwacji','SOR – obszar terapii (kolor zielony)','Skierowanie do NiSŁ (nocna i świąteczna opieka zdrowotna)'];
// kolor TOPSOR (jeśli nadany) jest wiążący: czas, termin i miejsce wg TOPSOR
function applyTopsor(d,tk){if(!d||d.level==='incomplete')return d;var o=Object.assign({},d,{appLevel:d.level,appName:d.name,topsor:null,mismatch:false});
 var i=-1;LV.forEach(function(l,j){if(l.k===tk)i=j});if(i<0)return o;var L=LV[i];
 o.topsor=L.k;o.mismatch=L.k!==d.level;o.level=L.k;o.lvl=i;o.name=L.n;o.maxMin=L.min;o.maxTxt=L.t;o.dest=DEST[i];o.alarm=d.alarm||i<=1;o.consult=(i===2||i===3)?(d.consult.length?d.consult:['internista']):[];return o}
function deadline(t,d){return new Date(t.getTime()+d.maxMin*60000)}
var api={applyTopsor:applyTopsor,DEST:DEST,LV:LV,REGIONS:REGIONS,ITEM:ITEM,PED:PED,pedRange:pedRange,news2:news2,decide:decide,missing:missing,deadline:deadline,LBL:LBL};
if(typeof module!=='undefined')module.exports=api;else root.TRI=api;
})(this);
