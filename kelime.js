/* Kelime Bahçesi — harf çarkı + çapraz bulmaca. Bölümler ve bonus sözlüğü aşağıdaki LEVELS içinde gömülü
   (hedef kelimeler elle seçildi; bonus havuzu Vikisözlük kelime listesinden harf kümesine göre süzüldü).
   Kayıt: kb_lvl (bölüm), kb_state (bölüm içi bulunanlar/ipuçları), kb_bonus (toplam bonus), kb_hint (ipucu hakkı). */
(function () {
  "use strict";
  function $(id) { return document.getElementById(id); }
  var LEVELS = [{"t":"çilek","l":"liçke","w":[{"w":"çilek","x":1,"y":1,"d":0},{"w":"çek","x":4,"y":0,"d":1},{"w":"ilke","x":2,"y":1,"d":1},{"w":"ilk","x":0,"y":3,"d":0},{"w":"çile","x":0,"y":2,"d":1},{"w":"elçi","x":2,"y":4,"d":0}],"gw":6,"gh":6,"b":["ekli","elik","ile","ilçe","kel","keçi","kil","kile","çeki","çelik","çil"]},{"t":"kemer","l":"merke","w":[{"w":"kemer","x":0,"y":2,"d":0},{"w":"krem","x":4,"y":1,"d":1},{"w":"emek","x":1,"y":0,"d":1},{"w":"kere","x":0,"y":0,"d":0}],"gw":5,"gh":5,"b":["eke","ekme","erek","erk","erke","erme","ermek","kem","keme","kemre","ker","kerem","merek"]},{"t":"lavanta","l":"vaantla","w":[{"w":"lavanta","x":0,"y":4,"d":0},{"w":"tan","x":5,"y":4,"d":1},{"w":"tavla","x":2,"y":2,"d":1},{"w":"alan","x":2,"y":6,"d":0},{"w":"nal","x":0,"y":2,"d":1},{"w":"tavan","x":4,"y":0,"d":1},{"w":"tava","x":2,"y":2,"d":0},{"w":"vatan","x":2,"y":0,"d":0}],"gw":7,"gh":7,"b":["ala","alatav","alt","ana","anal","ant","ata","aval","avanta","lan","lata","lav","lava","lavta","naat","tal","talan","tav","vaat","vana","vat"]},{"t":"tatlısın","l":"tsntaııl","w":[{"w":"tatlısın","x":0,"y":3,"d":0},{"w":"atlı","x":2,"y":2,"d":1},{"w":"nasıl","x":5,"y":1,"d":1},{"w":"altı","x":0,"y":1,"d":1},{"w":"altın","x":4,"y":5,"d":0},{"w":"asıl","x":4,"y":5,"d":1},{"w":"satın","x":1,"y":7,"d":0},{"w":"alın","x":7,"y":0,"d":1},{"w":"tatlı","x":2,"y":1,"d":1},{"w":"salt","x":6,"y":0,"d":0}],"gw":10,"gh":9,"b":["alt","altınsı","alıntı","ant","antlı","anı","anıt","anıtlı","anıtsı","ast","ası","asıltı","asılı","asıntı","atıl","atılı","lan","nal","nas","sal","salı","salıntı","san","sanlı","sanı","satı","stant","sıla","tal","tan","tanı","tanıt","tanıtlı","tas","tat","tın","tını","tıs","ısı","ısıl","ısın","ıttıla"]},{"t":"tiyatro","l":"rtoatyi","w":[{"w":"tiyatro","x":0,"y":3,"d":0},{"w":"tart","x":0,"y":0,"d":1},{"w":"rota","x":4,"y":1,"d":1},{"w":"toy","x":0,"y":0,"d":0},{"w":"oya","x":6,"y":3,"d":1},{"w":"ray","x":5,"y":5,"d":0},{"w":"trio","x":3,"y":1,"d":0},{"w":"yat","x":2,"y":3,"d":1},{"w":"orta","x":0,"y":5,"d":0}],"gw":8,"gh":6,"b":["ait","aort","ari","art","ati","irat","ita","iyot","ora","ortay","orya","riya","rot","tar","tat","tay","tayt","tirat","titr","tor","yar"]},{"t":"bardak","l":"abdkra","w":[{"w":"bardak","x":0,"y":2,"d":0},{"w":"kar","x":5,"y":2,"d":1},{"w":"arka","x":1,"y":2,"d":1},{"w":"ada","x":4,"y":0,"d":1},{"w":"bar","x":3,"y":4,"d":0},{"w":"dar","x":0,"y":5,"d":0},{"w":"kara","x":5,"y":2,"d":1},{"w":"kadar","x":1,"y":0,"d":0}],"gw":6,"gh":6,"b":["aba","abd","abra","adak","aka","akar","ara","arak","arda","ardak","ark","bad","barak","barda","bark","barka","dara","kaba"]},{"t":"orman","l":"amron","w":[{"w":"orman","x":2,"y":3,"d":0},{"w":"nam","x":4,"y":1,"d":1},{"w":"mor","x":2,"y":2,"d":1},{"w":"ona","x":3,"y":1,"d":0},{"w":"onar","x":3,"y":1,"d":0},{"w":"oran","x":6,"y":0,"d":1},{"w":"nar","x":0,"y":4,"d":0},{"w":"roman","x":0,"y":0,"d":1}],"gw":7,"gh":5,"b":["amor","mano","marn","maron","nom","norm","oma","onma","ora","ram","rom"]},{"t":"takvim","l":"itmvak","w":[{"w":"takvim","x":1,"y":5,"d":0},{"w":"atik","x":3,"y":2,"d":1},{"w":"kim","x":6,"y":3,"d":1},{"w":"mavi","x":2,"y":2,"d":0},{"w":"mat","x":1,"y":3,"d":1},{"w":"tav","x":4,"y":0,"d":1},{"w":"vakit","x":0,"y":0,"d":0}],"gw":7,"gh":6,"b":["ait","akim","akit","amit","ati","ika","ima","ita","kaim","kam","kat","kati","kav","kavi","kavim","kit","mai","maki","miat","mika","mit","tak","takim","tam","tamik","tavik","tik","tim","vaki","vat"]},{"t":"meydan","l":"namdye","w":[{"w":"meydan","x":0,"y":3,"d":0},{"w":"name","x":1,"y":0,"d":1},{"w":"maden","x":0,"y":1,"d":0},{"w":"yem","x":2,"y":3,"d":1},{"w":"dam","x":0,"y":5,"d":0},{"w":"medya","x":0,"y":3,"d":1},{"w":"nem","x":5,"y":3,"d":1},{"w":"adem","x":0,"y":7,"d":0}],"gw":6,"gh":8,"b":["ayn","dane","daye","dem","eda","edna","eman","emay","enam","endam","men","mey","meyan","nam","nema","ney","yad","yan","yen"]},{"t":"yorgan","l":"nyorag","w":[{"w":"yorgan","x":1,"y":4,"d":0},{"w":"yonga","x":5,"y":0,"d":1},{"w":"nar","x":6,"y":4,"d":1},{"w":"ona","x":4,"y":2,"d":0},{"w":"onay","x":1,"y":1,"d":1},{"w":"yoga","x":0,"y":1,"d":0},{"w":"organ","x":3,"y":3,"d":1},{"w":"oran","x":0,"y":7,"d":0}],"gw":7,"gh":8,"b":["argo","argon","ayn","gar","gayr","onar","ora","org","orya","oya","ray","yan","yar","yongar","yorga"]},{"t":"parmak","l":"rkampa","w":[{"w":"parmak","x":2,"y":4,"d":0},{"w":"park","x":2,"y":4,"d":1},{"w":"para","x":6,"y":3,"d":1},{"w":"arka","x":3,"y":1,"d":1},{"w":"rampa","x":2,"y":6,"d":0},{"w":"rakam","x":0,"y":1,"d":0},{"w":"marka","x":3,"y":0,"d":1},{"w":"kamp","x":1,"y":0,"d":1}],"gw":8,"gh":8,"b":["aka","akar","akma","ama","apak","ara","arak","arap","ark","arma","arp","arpa","kam","kama","kap","kapma","kar","kara","karma","kramp","mapa","mark","pak","parka","ram","ramak","ramp","rap"]},{"t":"kartal","l":"rkalat","w":[{"w":"kartal","x":0,"y":1,"d":0},{"w":"kara","x":1,"y":0,"d":1},{"w":"tarak","x":4,"y":0,"d":1},{"w":"tarla","x":0,"y":3,"d":0},{"w":"kral","x":4,"y":4,"d":0},{"w":"atak","x":6,"y":2,"d":1},{"w":"takla","x":0,"y":3,"d":1},{"w":"alt","x":0,"y":7,"d":0},{"w":"kart","x":0,"y":5,"d":0}],"gw":8,"gh":8,"b":["aka","akar","aktar","ala","ara","arak","ark","arka","art","ata","kal","kala","kar","kat","katar","lak","laka","lata","tak","taka","tal","talak","talk","tar"]},{"t":"terlik","l":"ketirl","w":[{"w":"terlik","x":0,"y":3,"d":0},{"w":"erik","x":2,"y":2,"d":1},{"w":"etli","x":4,"y":0,"d":1},{"w":"tekil","x":3,"y":0,"d":0},{"w":"etki","x":0,"y":2,"d":1},{"w":"ilke","x":0,"y":5,"d":0},{"w":"kitle","x":5,"y":3,"d":1},{"w":"litre","x":1,"y":7,"d":0}],"gw":8,"gh":8,"b":["ekli","ekti","elik","elit","elti","eril","erk","erkli","erlik","etik","etil","etlik","ile","ilk","kel","ker","kerti","ket","kil","kile","kiler","kir","kit","kitre","liet","lir","liret","ret","tek","tekir","tekli","tel","ter","terk","terki","terli","tik","tike","tikel","tire","tirle"]},{"t":"zeytin","l":"tzieny","w":[{"w":"zeytin","x":0,"y":4,"d":0},{"w":"zen","x":5,"y":2,"d":1},{"w":"tez","x":3,"y":2,"d":0},{"w":"yeni","x":1,"y":3,"d":1},{"w":"net","x":3,"y":0,"d":1},{"w":"yine","x":1,"y":0,"d":0},{"w":"niyet","x":0,"y":6,"d":0}],"gw":6,"gh":7,"b":["iye","ney","nezt","nite","niye","tein","ten","tezyin","tin","tiz","yen","yeti","yezit","ziynet"]},{"t":"iskele","l":"ekesli","w":[{"w":"iskele","x":0,"y":3,"d":0},{"w":"kese","x":3,"y":0,"d":1},{"w":"eski","x":0,"y":0,"d":1},{"w":"lise","x":4,"y":3,"d":1},{"w":"ilke","x":1,"y":6,"d":0},{"w":"elek","x":3,"y":1,"d":0},{"w":"sel","x":4,"y":5,"d":0},{"w":"leke","x":5,"y":0,"d":1}],"gw":7,"gh":7,"b":["eke","ekli","eksi","elik","esik","eslek","ile","ilk","kel","kele","kes","kesel","keseli","kil","kile","kils","sek","sekel","seki","sele","selek","ski"]},{"t":"kestane","l":"estnake","w":[{"w":"kestane","x":0,"y":3,"d":0},{"w":"sene","x":1,"y":0,"d":1},{"w":"kent","x":3,"y":0,"d":1},{"w":"kaset","x":3,"y":0,"d":0},{"w":"esnek","x":6,"y":3,"d":1},{"w":"tekne","x":4,"y":7,"d":0},{"w":"anket","x":4,"y":3,"d":1},{"w":"keten","x":0,"y":3,"d":1},{"w":"etken","x":2,"y":5,"d":0}],"gw":9,"gh":8,"b":["akne","aks","akse","ant","ask","ast","ate","eke","eksen","enek","ense","esen","esna","etek","eten","kan","kant","kas","kast","kasten","kat","kene","kenet","kes","kesat","kese","kesen","ket","kete","nas","nekes","net","sak","sake","san","saten","sek","sekant","sekte","sen","sena","senek","senet","sent","set","sten","tak","tan","tane","tank","tas","tek","teke","ten"]},{"t":"payanda","l":"npaaday","w":[{"w":"payanda","x":0,"y":2,"d":0},{"w":"dana","x":1,"y":1,"d":1},{"w":"ayna","x":1,"y":4,"d":0},{"w":"aday","x":6,"y":0,"d":1},{"w":"yan","x":2,"y":4,"d":1},{"w":"ada","x":3,"y":0,"d":1},{"w":"pay","x":2,"y":0,"d":0},{"w":"payda","x":2,"y":0,"d":0},{"w":"panda","x":0,"y":6,"d":0}],"gw":7,"gh":7,"b":["adap","ana","aya","ayan","ayn","payan","yad"]},{"t":"mozaik","l":"mkozai","w":[{"w":"mozaik","x":0,"y":3,"d":0},{"w":"maki","x":4,"y":0,"d":1},{"w":"koma","x":0,"y":1,"d":1},{"w":"kaz","x":3,"y":1,"d":0},{"w":"koza","x":5,"y":3,"d":1},{"w":"imza","x":3,"y":5,"d":0},{"w":"azim","x":3,"y":3,"d":1},{"w":"kim","x":1,"y":6,"d":0}],"gw":7,"gh":7,"b":["akim","azoik","ika","ikaz","ima","izam","kaim","kam","kom","komi","koz","mai","mazi","mika","mikoz","miza","moka","mozak","oma","zam","zamk","zoka","zom"]},{"t":"saçak","l":"akçsa","w":[{"w":"saçak","x":0,"y":2,"d":0},{"w":"kaç","x":2,"y":0,"d":1},{"w":"kasa","x":0,"y":0,"d":1},{"w":"çak","x":4,"y":0,"d":1},{"w":"akça","x":3,"y":2,"d":1},{"w":"saç","x":1,"y":4,"d":0}],"gw":5,"gh":6,"b":["aka","akaç","aks","asa","ask","kas","kaça","sak","saka"]},{"t":"taşıma","l":"aışmta","w":[{"w":"taşıma","x":0,"y":5,"d":0},{"w":"maaş","x":5,"y":3,"d":1},{"w":"taş","x":1,"y":4,"d":1},{"w":"atım","x":3,"y":3,"d":1},{"w":"aşma","x":3,"y":3,"d":0},{"w":"taşma","x":2,"y":3,"d":0},{"w":"atış","x":4,"y":0,"d":1},{"w":"tam","x":3,"y":0,"d":0}],"gw":7,"gh":7,"b":["ama","ata","ataş","atma","atışma","aşı","aşım","aşıt","mat","maş","maşa","taam","taşım","şama","şat"]},{"t":"sandalye","l":"aadyslen","w":[{"w":"sandalye","x":1,"y":3,"d":0},{"w":"yasal","x":7,"y":3,"d":1},{"w":"sandal","x":3,"y":1,"d":1},{"w":"ayna","x":5,"y":0,"d":1},{"w":"alay","x":5,"y":6,"d":0},{"w":"aslan","x":1,"y":2,"d":1},{"w":"dans","x":4,"y":0,"d":0},{"w":"yalan","x":0,"y":5,"d":0}],"gw":9,"gh":8,"b":["ada","adale","aday","ala","alan","alyan","alyans","ana","anal","asa","asal","asla","aslen","aya","ayal","ayan","ayla","ayn","dal","dalan","dalya","dalyan","dana","dane","daye","eda","edna","ela","elan","esna","laden","lades","lan","lanse","lens","ley","nadas","nal","nale","nas","ney","sade","sal","sala","salya","san","sana","sanal","say","saya","saye","seda","sel","sen","sena","yad","yal","yan","yanal","yas","yasa","yel","yen"]},{"t":"dondurma","l":"udoamrdn","w":[{"w":"dondurma","x":0,"y":3,"d":0},{"w":"onur","x":4,"y":1,"d":1},{"w":"duman","x":0,"y":3,"d":1},{"w":"moda","x":6,"y":3,"d":1},{"w":"orman","x":3,"y":6,"d":0},{"w":"roman","x":3,"y":5,"d":1},{"w":"ordu","x":4,"y":1,"d":0},{"w":"oran","x":1,"y":8,"d":0},{"w":"norm","x":7,"y":6,"d":1},{"w":"odun","x":2,"y":0,"d":1}],"gw":8,"gh":10,"b":["amor","dam","dar","daru","domur","don","donam","donma","donra","doru","dorum","dram","dua","dun","durma","madun","mano","marn","maron","maun","mor","mundar","nam","nar","nom","nur","oda","oma","omur","ona","onar","onda","ondurma","onma","onum","ora","orun","radon","ram","roda","rom","ruam","run","umar","uran"]},{"t":"kitaplık","l":"ıklapkit","w":[{"w":"kitaplık","x":2,"y":6,"d":0},{"w":"talip","x":3,"y":3,"d":1},{"w":"takip","x":6,"y":2,"d":1},{"w":"atkı","x":6,"y":3,"d":0},{"w":"kalıp","x":8,"y":3,"d":1},{"w":"iptal","x":0,"y":4,"d":0},{"w":"akıl","x":5,"y":6,"d":1},{"w":"kitap","x":1,"y":0,"d":1},{"w":"katkı","x":5,"y":3,"d":0},{"w":"altı","x":9,"y":0,"d":1}],"gw":10,"gh":10,"b":["ait","akik","akil","akit","akli","aklı","aklık","akı","ali","alp","alt","altık","alık","aplik","ati","atik","atlı","atık","atıl","ika","ila","ilk","ipka","ita","itap","kail","kak","kal","kalp","kalık","kalıt","kap","kapik","kaplı","kaplık","kapı","kat","kati","katil","katlı","katı","katık","kik","kikla","kil","kip","kit","klik","klip","kıl","kıt","kıta","kıtal","laik","lak","lap","lika","pak","paklık","pakt","pal","pat","pati","patik","pik","pil","plak","plati","pıt","tak","taklip","takı","tal","tali","talik","talk","tapi","tapı","tik","tip","tık","tıp","tıpa","ıtlak"]},{"t":"istasyon","l":"nastyios","w":[{"w":"istasyon","x":1,"y":3,"d":0},{"w":"ait","x":4,"y":3,"d":1},{"w":"iyon","x":1,"y":3,"d":1},{"w":"nota","x":8,"y":3,"d":1},{"w":"onay","x":6,"y":0,"d":1},{"w":"isyan","x":2,"y":1,"d":0},{"w":"inat","x":0,"y":6,"d":0},{"w":"soya","x":5,"y":6,"d":0},{"w":"asit","x":3,"y":0,"d":1}],"gw":9,"gh":7,"b":["ani","anot","ant","asi","asist","ast","ati","ayin","ayn","ayni","isnat","isot","ita","iyot","nas","nato","nisa","not","ona","onat","ons","oya","oysa","san","say","sin","sis","sit","siya","son","sonat","sos","soy","tan","tas","tasni","tay","tayin","tin","ton","tos","toy","yan","yani","yas","yat","yont"]},{"t":"kaldırım","l":"dlkraımı","w":[{"w":"kaldırım","x":0,"y":3,"d":0},{"w":"darlık","x":2,"y":0,"d":1},{"w":"kadı","x":2,"y":5,"d":0},{"w":"adım","x":3,"y":5,"d":1},{"w":"kırma","x":7,"y":0,"d":1},{"w":"alım","x":0,"y":8,"d":0},{"w":"akıl","x":2,"y":1,"d":0},{"w":"dram","x":0,"y":6,"d":1},{"w":"ırmak","x":5,"y":5,"d":1}],"gw":8,"gh":10,"b":["adlı","adıl","adımlık","aklı","akı","akım","alkım","alık","ardıl","ark","arlı","arı","arık","arılık","dal","dam","damlı","dar","darı","dılak","kal","kalım","kam","kar","karlı","karı","karılı","kral","kıl","kıldırma","kılma","kılır","kımıl","kır","kırmalı","kırılma","kırım","lak","lam","lıkır","mal","mark","rakı","rakım","ram","ılık","ılım","ılıma","ılımak","ıra","ırak","ırk"]},{"t":"çaydanlık","l":"nakıdyaçl","w":[{"w":"çaydanlık","x":0,"y":6,"d":0},{"w":"yakında","x":4,"y":0,"d":1},{"w":"yalın","x":1,"y":3,"d":0},{"w":"kanal","x":2,"y":0,"d":1},{"w":"adlı","x":1,"y":6,"d":1},{"w":"dayak","x":1,"y":1,"d":0},{"w":"aylık","x":6,"y":4,"d":1},{"w":"çaylak","x":8,"y":1,"d":1}],"gw":9,"gh":10,"b":["ada","adak","adaklı","adalı","aday","adaylık","adıl","adına","aka","akaç","aklan","aklı","akça","akçıl","akı","akıl","akın","ala","alan","alay","alaçık","aldanç","alkan","alnaç","alyan","alçak","alçı","alık","alın","alıç","ana","anal","analı","analık","anaç","anaçlık","andaç","andık","andıç","anlak","anlık","anı","anık","aya","ayak","ayaklı","ayakçı","ayakçın","ayal","ayan","aydın","ayla","aylak","aylakçı","aylı","ayn","ayna","aynalı","aynalık","aynı","ayça","ayı","ayık","ayın","açan","açkı","açlık","açı","açık","dal","dalak","dalan","dalya","dalyan","dalınç","dana","dayaklı","dayalı","dayanç","daylak","dayı","dılak","kadı","kadın","kal","kala","kalan","kalay","kalya","kalça","kalçın","kalın","kalıç","kan","kana","kanlı","kanı","kay","kaya","kayan","kayaç","kaynaç","kayın","kaç","kaça","kaçlı","kaçı","klan","kıl","kın","kına","kıya","kıç","lak","laka","lakçı","lan","layık","laçka","laçın","nal","nalayık","nalça","yad","yak","yaka","yakalı","yakı","yakın","yal","yalak","yalan","yalçın","yalı","yalınç","yan","yanak","yanaklı","yanal","yandık","yankı","yanlı","yanlık","yanık","yıl","yılan","çak","çakal","çakı","çakıl","çakın","çal","çalak","çalkı","çalı","çalık","çan","çanak","çandı","çay","çayan","çaylı","çaylık","çıkan","çın","çınlak","çıyan"]},{"t":"pazartesi","l":"zaeptrsia","w":[{"w":"pazartesi","x":0,"y":4,"d":0},{"w":"terazi","x":5,"y":4,"d":1},{"w":"ispat","x":7,"y":3,"d":1},{"w":"pazar","x":3,"y":1,"d":1},{"w":"trapez","x":1,"y":2,"d":0},{"w":"parti","x":4,"y":7,"d":0},{"w":"tez","x":6,"y":0,"d":1},{"w":"pasta","x":0,"y":4,"d":1},{"w":"asit","x":0,"y":8,"d":0}],"gw":9,"gh":10,"b":["ait","apaz","apre","apresiz","apse","ara","arap","araz","arazi","ari","ariza","arp","arpa","arsa","art","arz","asa","asap","asar","asi","asri","ast","astar","ata","atari","ate","ati","aza","azap","azar","azat","azit","erat","ersiz","esatir","esir","espri","etap","etsiz","eza","iare","irap","irat","irs","ister","ita","itap","para","parazit","pare","parite","pars","parsa","pas","pastra","pat","pata","pati","peri","pert","pes","pest","pir","pire","pis","pist","pres","priz","rap","rasat","raspa","rast","rate","reis","rest","ret","saat","sair","sap","sapa","sara","sarat","sari","sarp","sarpa","sarpi","satir","satrap","saz","sepi","ser","sera","serap","serapa","serazat","seri","sert","sertap","set","setir","seza","sezi","siper","sit","site","siz","size","star","step","ster","tapa","tapi","tapir","tar","taraz","tariz","tarz","tas","tasa","tasar","taze","tazip","tepi","tepir","tepsi","ter","terapi","teras","ters","terzi","tesir","tesri","tip","tire","tiz","trap","tras","trias","zait","zapt","zar","zarta","zat","zati","zer","zir","zira","ziraat"]},{"t":"salıncak","l":"ınsaalck","w":[{"w":"salıncak","x":0,"y":3,"d":0},{"w":"ancak","x":1,"y":3,"d":1},{"w":"sıcak","x":6,"y":0,"d":1},{"w":"kalın","x":3,"y":1,"d":0},{"w":"aslan","x":1,"y":6,"d":0},{"w":"kasa","x":4,"y":5,"d":1},{"w":"sancak","x":1,"y":2,"d":1},{"w":"kanal","x":3,"y":8,"d":0}],"gw":8,"gh":9,"b":["acı","aka","aklan","aklı","aklınca","aks","aksan","akı","akıl","akın","ala","alan","alkan","alık","alın","ana","anacık","anacıl","anal","analı","analık","anasıl","anca","anlak","anlık","anı","anık","asa","asal","ask","asklı","askı","asla","aslık","ası","asık","asıl","caka","cakalı","can","cana","canlı","cık","cılk","cıs","kal","kala","kalan","kalas","kalcı","kalınca","kan","kana","kanca","kancalı","kancıl","kanlı","kanı","kas","kasacı","kasalı","kaslı","kasnı","klan","klas","kıl","kılcan","kın","kına","kısa","kısaca","lak","laka","lakacı","lan","nacak","nakıs","nal","nas","nasıl","sac","sak","saka","sakal","sakalı","saklı","sakın","sakınca","sal","sala","salak","salcı","salı","salık","san","sana","sanal","sancı","sanlı","sanı","sanık","skala","sık","sıla","ıska","ıslak"]},{"t":"kalemlik","l":"elkimkla","w":[{"w":"kalemlik","x":0,"y":2,"d":0},{"w":"klima","x":7,"y":2,"d":1},{"w":"ilkel","x":5,"y":1,"d":1},{"w":"kalem","x":2,"y":0,"d":1},{"w":"elma","x":0,"y":4,"d":0},{"w":"aile","x":3,"y":4,"d":1},{"w":"kemik","x":2,"y":7,"d":0},{"w":"emlak","x":0,"y":4,"d":1}],"gw":8,"gh":9,"b":["akemi","akik","akil","akim","akli","alem","ali","alil","alim","alkil","allem","amel","amil","ekim","ekli","ela","elik","elim","elli","ellik","emik","emlik","ika","ikame","ikmal","ila","ilam","ile","ilk","ilke","illa","ille","ilme","ilmek","ima","imal","imale","imla","kail","kaim","kaime","kak","kal","kale","kam","kame","kek","keka","kel","kelam","kelik","kelli","kellik","kem","kemal","kemlik","kik","kikla","kil","kile","kim","klik","laik","lak","lake","lal","lale","lam","lame","lamel","lika","lim","lime","mai","mail","maile","maki","mal","mali","malik","meal","mekik","melal","melik","mika","mil","milel"]},{"t":"merdiven","l":"dnmevire","w":[{"w":"merdiven","x":0,"y":3,"d":0},{"w":"deve","x":1,"y":2,"d":1},{"w":"evren","x":6,"y":3,"d":1},{"w":"nem","x":0,"y":5,"d":0},{"w":"demir","x":4,"y":0,"d":1},{"w":"dere","x":5,"y":6,"d":0},{"w":"minder","x":2,"y":5,"d":1},{"w":"verim","x":1,"y":9,"d":0},{"w":"derin","x":3,"y":1,"d":0},{"w":"devrim","x":8,"y":5,"d":1}],"gw":9,"gh":11,"b":["dem","deme","demevi","demin","deni","denim","denme","deri","derme","dev","devim","devinme","devir","devirme","devre","devren","din","dine","dinme","direme","diren","direnme","dren","ede","eder","edi","edim","edinme","emen","emin","emir","ender","enir","erdem","erden","eren","erim","erime","erin","erinme","erme","ermin","evin","evirme","evre","evrim","imren","inme","ivme","medeni","men","meni","meri","mide","mine","mir","nedim","nedime","nere","nev","nevir","nim","remi","rende","verdi","vere","verem","veri","verme"]}];
  /* az kullanılan kelimeler: bulununca alt satırda kısa anlamı görünür (TDK) */
  var M = { kere: "defa, kez", salt: "yalnızca, sadece", trio: "üçlü", toy: "acemi, tecrübesiz", oya: "ince el işi, dantel", onar: "her birine on", nam: "ün, ad",
    atik: "çevik", tav: "uygun durum, kıvam", name: "mektup", adem: "insan, kişi", yonga: "ahşap kıymığı", zen: "bir Budizm öğretisi", maki: "bir maymun türü; çalılık",
    akça: "beyazımsı; eski para", norm: "kural, ölçü", talip: "isteyen, istekli", iyon: "elektrik yüklü atom", kadı: "eski yargıç", ispat: "kanıtlama", sancak: "bayrak",
    payda: "kesirde alt sayı", keten: "bir bitki ve kumaşı", takla: "baş üstü dönme",
    kemer: "mimaride eğri açıklık örtüsü", saçak: "çatının duvardan taşan kenarı", mozaik: "renkli parçalarla yapılan bezeme", payanda: "duvarı destekleyen dayak", iskele: "yapı yanına kurulan çalışma platformu; rıhtım", minder: "oturma şiltesi" };
  /* gizli cümle: 2–30. bölümlerin her biri bir harf açar (1. bölüm ısınma); 30'da tamamlanır */
  var SECRET_TXT = "Çabuk iyileş! ❤️ Suflen seni bekliyor.", SECRET = "ÇABUK İYİLEŞ! ❤️|SUFLEN SENİ|BEKLİYOR.", SEC_LETTERS = SECRET.replace(/[^A-ZÇĞİÖŞÜ]/g, "");
  /* açılma sırası karışık: kelime başları ve sesliler en sona; cümle ancak son bölümlerde okunur */
  var SEC_ORDER = [23, 8, 3, 16, 26, 12, 2, 19, 6, 14, 24, 28, 10, 4, 18, 27, 13, 22, 1, 9, 15, 7, 25, 20, 21, 11, 17, 5, 0];
  function secretHtml(revealed, newIdx, all) {
    var html = "", k = 0, parts = Array.from ? Array.from(SECRET) : SECRET.split("");
    for (var i = 0; i < parts.length; i++) {
      var ch = parts[i];
      if (ch === " ") { html += '</b><b class="w">'; continue; }
      if (ch === "|") { html += '</b><b class="br"></b><b class="w">'; continue; }   /* satır sonu */
      if (ch === "\ufe0f") continue;
      if (!/[A-ZÇĞİÖŞÜ]/.test(ch)) { html += '<i class="sym">' + ch + "</i>"; continue; }   /* ! ❤️ . hep görünür */
      var rank = SEC_ORDER.indexOf(k), shown = rank >= 0 && rank < revealed;
      html += '<i class="' + (all ? "all" : shown ? (rank === newIdx ? "new" : "") : "hid") + '">' + (shown ? ch : "·") + "</i>"; k++;
    }
    return '<b class="w">' + html + "</b>";
  }
  function secretRevealed() { var done = 0; try { if (localStorage.getItem("kb_done") === "1") return SEC_LETTERS.length; done = +localStorage.getItem("kb_lvl") || 0; } catch (e) {} return Math.max(0, Math.min(SEC_LETTERS.length, done - 1)); }   /* kb_lvl = tamamlanan bölüm sayısı; 1. bölüm harf vermez */
  var MSG_DONE = ["Bahçe büyüyor 🌱", "Bölüm bitti, güzel 🌸", "Harfler yerini buldu ✨", "Bir sonraki biraz daha uzun 📏", "Hızlısın, mimar işi 📐", "Kelimeler çiçek açtı 🌷"];
  var TR_UP = function (s) { return s.replace(/i/g, "İ").replace(/ı/g, "I").toUpperCase(); };
  var up = function (s) { try { return s.toLocaleUpperCase("tr-TR"); } catch (e) { return TR_UP(s); } };

  var lvl = 0, L = null, found = {}, hinted = {}, bonusFound = {}, bonusTotal = 0, hints = 1, sel = [], cells = {}, letters = [], dragging = false, tapMode = false;
  try {
    lvl = Math.min(LEVELS.length - 1, Math.max(0, +localStorage.getItem("kb_lvl") || 0));
    bonusTotal = +localStorage.getItem("kb_bonus") || 0;
    var h = localStorage.getItem("kb_hint"); hints = h === null ? 1 : +h;
  } catch (e) {}

  var gridEl = $("grid"), wrapEl = $("gridwrap"), wheelEl = $("wheel"), linesEl = $("wlines"), pill = $("pill"), pillTxt = $("pillTxt"), msgEl = $("kmsg"), over = $("over");
  function msg(t) { msgEl.textContent = t; }
  function burst(n) { if (window.__burst) try { window.__burst(n); } catch (e) {} }
  function save() {
    try {
      localStorage.setItem("kb_lvl", lvl); localStorage.setItem("kb_bonus", bonusTotal); localStorage.setItem("kb_hint", hints);
      localStorage.setItem("kb_state", JSON.stringify({ lvl: lvl, f: Object.keys(found), h: Object.keys(hinted), b: Object.keys(bonusFound) }));
    } catch (e) {}
  }

  /* ---------- bölüm kur ---------- */
  function load(i, restore) {
    lvl = i; L = LEVELS[i]; found = {}; hinted = {}; bonusFound = {}; sel = []; letters = L.l.split("");
    if (restore) {
      try {
        var st = JSON.parse(localStorage.getItem("kb_state") || "null");
        if (st && st.lvl === i) { st.f.forEach(function (w) { found[w] = 1; }); st.h.forEach(function (k) { hinted[k] = 1; }); st.b.forEach(function (w) { bonusFound[w] = 1; }); }
      } catch (e) {}
    }
    $("lvlNo").textContent = (i + 1) + "/" + LEVELS.length; $("bonusNo").textContent = bonusTotal; $("hintNo").textContent = hints;
    $("bSecret").hidden = secretRevealed() === 0;
    buildGrid(); buildWheel(); setPill(""); msg(i === 0 ? "Harflerin üstünde parmağını kaydır" : "");
    over.hidden = true; save();
    if (L.w.every(function (o) { return found[o.w]; })) checkDone();   /* kayıtlı bölüm zaten tamamsa (kesişmelerle açılmış son kelime) kartı hemen göster */
  }
  function buildGrid() {
    cells = {}; gridEl.innerHTML = "";
    var cw = wrapEl.clientWidth || 320, ch = wrapEl.clientHeight || 200;
    var gap = 3, size = Math.min(44, Math.floor((cw - 4) / L.gw) - gap, Math.floor((ch - 4) / L.gh) - gap);
    if (size < 20) { gap = 2; size = Math.min(44, Math.floor((cw - 2) / L.gw) - gap, Math.floor((ch - 2) / L.gh) - gap); }   /* küçük ekran + büyük bulmaca: dar boşluk */
    size = Math.max(13, size); gridEl.style.gap = gap + "px";
    gridEl.style.gridTemplateColumns = "repeat(" + L.gw + "," + size + "px)";
    gridEl.style.gridTemplateRows = "repeat(" + L.gh + "," + size + "px)";
    gridEl.style.fontSize = Math.round(size * 0.62) + "px";
    var occ = {};
    L.w.forEach(function (o) { for (var k = 0; k < o.w.length; k++) { var x = o.d === 0 ? o.x + k : o.x, y = o.d === 0 ? o.y : o.y + k; occ[x + "," + y] = o.w[k]; } });
    for (var y = 0; y < L.gh; y++) for (var x = 0; x < L.gw; x++) {
      var key = x + "," + y, d = document.createElement("div");
      if (occ[key]) { d.className = "cell"; d.dataset.ch = occ[key]; cells[key] = d; } else d.className = "cell empty";
      gridEl.appendChild(d);
    }
    L.w.forEach(function (o) { if (found[o.w]) reveal(o, false); });
    Object.keys(hinted).forEach(function (k) { if (cells[k]) { cells[k].textContent = up(cells[k].dataset.ch); cells[k].classList.add("on", "hint"); } });
    sweep();
  }
  function wordCells(o) { var a = []; for (var k = 0; k < o.w.length; k++) a.push(cells[(o.d === 0 ? o.x + k : o.x) + "," + (o.d === 0 ? o.y : o.y + k)]); return a; }
  function reveal(o, anim) {
    wordCells(o).forEach(function (c, k) {
      c.textContent = up(c.dataset.ch);
      if (anim) { c.classList.remove("pop"); setTimeout(function () { c.classList.add("on", "pop"); }, k * 45); } else c.classList.add("on");
    });
  }
  function buildWheel() {
    var old = wheelEl.querySelectorAll(".lt"); for (var i = 0; i < old.length; i++) wheelEl.removeChild(old[i]);
    var R = wheelEl.clientWidth / 2, n = letters.length, lr = n <= 5 ? 0.19 : n <= 7 ? 0.17 : 0.155, rad = R * (1 - lr - 0.06);
    letters.forEach(function (ch, i) {
      var a = -Math.PI / 2 + i * 2 * Math.PI / n, b = document.createElement("div");
      b.className = "lt"; b.textContent = up(ch); b.dataset.i = i;
      var s = R * lr * 2; b.style.width = b.style.height = s + "px"; b.style.fontSize = Math.round(s * 0.5) + "px";
      b.style.left = (R + rad * Math.cos(a) - s / 2) + "px"; b.style.top = (R + rad * Math.sin(a) - s / 2) + "px";
      b._cx = R + rad * Math.cos(a); b._cy = R + rad * Math.sin(a); b._r = s / 2;
      wheelEl.appendChild(b);
    });
    linesEl.setAttribute("viewBox", "0 0 " + (R * 2) + " " + (R * 2)); drawLines();
  }
  function ltEls() { return wheelEl.querySelectorAll(".lt"); }
  function drawLines() {
    var pts = sel.map(function (i) { var b = ltEls()[i]; return b._cx + "," + b._cy; });
    linesEl.innerHTML = pts.length > 1 ? '<polyline points="' + pts.join(" ") + '"/>' : "";
    var els = ltEls(); for (var i = 0; i < els.length; i++) els[i].classList.toggle("sel", sel.indexOf(i) >= 0);
  }
  function setPill(t) { pillTxt.textContent = t; pill.classList.toggle("has", !!t); }
  function curWord() { return sel.map(function (i) { return letters[i]; }).join(""); }

  /* ---------- harf seçimi: sürükleme + dokunma ---------- */
  function hit(px, py) {
    var r = wheelEl.getBoundingClientRect(), x = px - r.left, y = py - r.top, els = ltEls();
    for (var i = 0; i < els.length; i++) { var b = els[i], dx = x - b._cx, dy = y - b._cy; if (dx * dx + dy * dy <= (b._r * 1.1) * (b._r * 1.1)) return i; }
    return -1;
  }
  function addSel(i) {
    var k = sel.indexOf(i);
    if (k < 0) sel.push(i);
    else if (dragging && k === sel.length - 2) sel.pop();      /* sürüklerken geri gidince son harf kalkar */
    else return;
    drawLines(); setPill(up(curWord()));
  }
  var moved = false;
  wheelEl.addEventListener("pointerdown", function (e) {
    e.preventDefault(); var i = hit(e.clientX, e.clientY); if (i < 0) return;
    moved = false;
    if (!tapMode) sel = [];
    else if (sel.length && i === sel[sel.length - 1]) { sel.pop(); drawLines(); setPill(up(curWord())); return; }   /* dokunma modunda son harfe tekrar dokunmak geri alır */
    dragging = true; if (sel.indexOf(i) < 0) sel.push(i); drawLines(); setPill(up(curWord()));
    try { wheelEl.setPointerCapture(e.pointerId); } catch (err) {}
  });
  wheelEl.addEventListener("pointermove", function (e) { if (!dragging) return; e.preventDefault(); var i = hit(e.clientX, e.clientY); if (i >= 0 && i !== sel[sel.length - 1]) { moved = true; addSel(i); } });
  function endDrag(e) {
    if (!dragging) return; dragging = false;
    if (!moved) { tapMode = true; if (sel.length === 1) msg("Harflere dokun, sonra kelimeye bas"); return; }   /* dokunuş: seçim kalır, kelimeye basınca gönderilir */
    tapMode = false; submit();
  }
  wheelEl.addEventListener("pointerup", endDrag); wheelEl.addEventListener("pointercancel", function () { dragging = false; sel = []; tapMode = false; drawLines(); setPill(""); });
  pill.addEventListener("click", function () { if (sel.length >= 2) submit(); });

  /* ---------- gönder ---------- */
  function submit() {
    var w = curWord(); sel = []; tapMode = false; drawLines();
    if (w.length < 3) { setPill(""); return; }
    var target = null; for (var i = 0; i < L.w.length; i++) if (L.w[i].w === w) target = L.w[i];
    if (target) {
      if (found[w]) { flash("dup", "Onu bulmuştun"); return; }
      found[w] = 1; reveal(target, true); burst(w.length >= 6 ? 30 : 14); flash("ok", M[w] ? up(w) + " — " + M[w] : ""); sweep(); save();
      checkDone(); return;
    }
    if (L.b.indexOf(w) >= 0) {
      if (bonusFound[w]) { flash("dup", "Bonus zaten sende"); return; }
      bonusFound[w] = 1; bonusTotal++; $("bonusNo").textContent = bonusTotal;
      var cnt = Object.keys(bonusFound).length, t = "Bonus: " + up(w) + " ⭐";
      if (bonusTotal % 5 === 0) { hints++; $("hintNo").textContent = hints; t += " · +1 ipucu 💡"; }
      flash("bonus", t); save(); return;
    }
    flash("no", "Sözlükte yok");
  }
  function flash(kind, t) {
    pill.classList.remove("ok", "no", "dup", "bonus"); void pill.offsetWidth; pill.classList.add(kind);
    msg(t);
    setTimeout(function () { setPill(""); pill.classList.remove(kind); }, kind === "no" ? 650 : 450);
  }
  function hint() {
    var open = [];
    L.w.forEach(function (o) { if (found[o.w]) return; o.w.split("").forEach(function (ch, k) { var key = (o.d === 0 ? o.x + k : o.x) + "," + (o.d === 0 ? o.y : o.y + k); if (!hinted[key] && !cells[key].classList.contains("on")) open.push(key); }); });
    if (!open.length) return;
    if (hints <= 0) { msg("İpucu kalmadı; 5 bonus kelime = 1 ipucu"); return; }
    hints--; $("hintNo").textContent = hints;
    var key = open[Math.floor(Math.random() * open.length)], c = cells[key];
    hinted[key] = 1; c.textContent = up(c.dataset.ch); c.classList.add("on", "hint", "pop");
    sweep(); save(); checkDone();
  }
  /* bütün hücreleri (kesişen kelimeler ya da ipuçlarıyla) açılmış kelime bulunmuş sayılır — yoksa bölüm bitmez */
  function sweep() {
    L.w.forEach(function (o) { if (!found[o.w] && wordCells(o).every(function (x) { return x.classList.contains("on"); })) { found[o.w] = 1; wordCells(o).forEach(function (x) { x.classList.remove("hint"); }); } });
  }
  function checkDone() {
    if (!L.w.every(function (o) { return found[o.w]; })) return;
    var last = lvl >= LEVELS.length - 1, nb = Object.keys(bonusFound).length;
    $("overEyebrow").textContent = last ? "bahçe tamam 🌸" : "bölüm " + (lvl + 1) + " tamam 🌸";
    $("overTitle").textContent = up(L.t);
    $("overText").textContent = (M[L.t] ? up(L.t) + ": " + M[L.t] + ". " : "") + (last ? "30 bölümün hepsi bitti. Yeni harfler ekleyince haber ederim 🌱" : MSG_DONE[lvl % MSG_DONE.length]);
    $("overBonus").textContent = nb ? "Bu bölümde " + nb + " bonus kelime · ipucu: " + hints : "İpucu: " + hints;
    $("next").hidden = last;
    /* gizli cümle: bu bölümün harfi */
    var rev = Math.max(0, Math.min(SEC_LETTERS.length, lvl)), secEl = $("secret");   /* lvl: 0 tabanlı → 2. bölüm (lvl 1) 1. harfi açar */
    if (rev > 0) { secEl.hidden = false; secEl.innerHTML = secretHtml(rev, rev - 1, last); } else secEl.hidden = true;
    if (last) $("overText").innerHTML = "Çabuk iyileş! ❤️<br>Suflen seni<br>bekliyor.";
    burst(last ? 120 : 50);
    setTimeout(function () { over.hidden = false; }, 700);
    try { if (last) localStorage.setItem("kb_done", "1"); else { localStorage.setItem("kb_lvl", lvl + 1); localStorage.removeItem("kb_state"); } } catch (e) {}
  }
  $("next").onclick = function () { over.hidden = true; load(Math.min(LEVELS.length - 1, lvl + 1), false); };
  /* ipucu sihirli sözle açılır: "peki madem" */
  var HINT_PW = "peki madem";
  function askHint() {
    var open = L.w.some(function (o) { return !found[o.w]; }); if (!open) return;
    if (hints <= 0) { msg("İpucu kalmadı; 5 bonus kelime = 1 ipucu"); return; }
    $("hintPw").value = ""; $("hintPwMsg").textContent = ""; $("hintOv").hidden = false;
    setTimeout(function () { try { $("hintPw").focus(); } catch (e) {} }, 50);
  }
  function tryHint() {
    var v = ($("hintPw").value || "").toLocaleLowerCase("tr-TR").replace(/[^a-zçğıöşü]/g, "");
    if (v === HINT_PW.replace(/ /g, "")) { $("hintOv").hidden = true; hint(); }
    else { $("hintPwMsg").textContent = ["Olmadı (:", "Bu değil, bir daha", "Yakın değil 😅", "Hmm, o söz değil"][Math.floor(Math.random() * 4)]; $("hintPw").select(); }
  }
  $("bHint").onclick = askHint;
  $("hintGo").onclick = tryHint;
  $("hintPw").addEventListener("keydown", function (e) { if (e.key === "Enter") { e.preventDefault(); tryHint(); } });
  $("hintCancel").onclick = function () { $("hintOv").hidden = true; };
  $("bSecret").onclick = function () { var r = secretRevealed(); $("secret2").innerHTML = secretHtml(r, -1, r >= SEC_LETTERS.length); $("secretOv").hidden = false; };
  $("secretClose").onclick = function () { $("secretOv").hidden = true; };
  $("bShuffle").onclick = function () {
    for (var i = letters.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = letters[i]; letters[i] = letters[j]; letters[j] = t; }
    sel = []; setPill(""); buildWheel();
  };

  /* ---------- ölçü: tek ekran ---------- */
  function measure() {
    var st = document.querySelector("main"), cs = getComputedStyle(st), bs = getComputedStyle(document.body);
    var used = (parseFloat(cs.paddingTop) || 0) + (parseFloat(cs.paddingBottom) || 0) + (parseFloat(bs.paddingTop) || 0) + (parseFloat(bs.paddingBottom) || 0);
    var g = parseFloat(cs.rowGap || cs.gap); if (isNaN(g)) g = 8;
    var kids = st.children, n = 0, ww = $("wheelwrap");
    for (var k = 0; k < kids.length; k++) { n++; if (kids[k] !== wrapEl && kids[k] !== ww) used += kids[k].offsetHeight; }
    used += g * (n - 1);
    var vh = (window.visualViewport && window.visualViewport.height) || innerHeight;   /* Safari'de alt çubuk açıkken görünen alan */
    var free = Math.max(300, vh - used - 10), W = Math.min(st.clientWidth, 440);
    var wheel = Math.round(Math.min(W * 0.66, Math.max(172, free * 0.44)));
    ww.style.height = wheel + "px"; wheelEl.style.width = wheelEl.style.height = wheel + "px";
    wrapEl.style.height = Math.max(120, free - wheel) + "px";
  }
  function refit() { measure(); if (L) { buildGrid(); buildWheel(); drawLines(); } }
  addEventListener("resize", refit); addEventListener("orientationchange", function () { setTimeout(refit, 250); });
  if (window.visualViewport) window.visualViewport.addEventListener("resize", refit);
  window.addEventListener("pageshow", function () { setTimeout(refit, 60); });

  measure();
  var intro = $("intro"), seenIntro = false;
  try { seenIntro = localStorage.getItem("kb_intro") === "1"; } catch (e) {}
  if (!seenIntro) { intro.hidden = false; $("introGo").onclick = function () { intro.hidden = true; try { localStorage.setItem("kb_intro", "1"); } catch (e) {} load(lvl, true); }; }
  else load(lvl, true);
  if (seenIntro) { /* intro kapalıyken doğrudan yüklendi */ }

  if (location.hash === "#test") window.__kb = { load: load, submit: function (w) { sel = []; w.split("").forEach(function (ch) { var i = letters.indexOf(ch), used = {}; while (sel.indexOf(i) >= 0) i = letters.indexOf(ch, i + 1); sel.push(i); }); submit(); }, state: function () { return { lvl: lvl, found: Object.keys(found), bonus: bonusTotal, hints: hints, L: L }; }, hint: hint };
})();
