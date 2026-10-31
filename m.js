/* Métricas propias de San Isidro: visitas, origen, dispositivo y embudo de pedido.
   Se guardan en Supabase (tabla web_eventos). No usa cookies de terceros. */
(function(){try{
  if(navigator.webdriver) return;
  var LS=window.localStorage, SS=window.sessionStorage;
  if(LS.getItem("si_notrack")==="1") return;
  var U="https://mluvrdqusnbkqsoeuexc.supabase.co/rest/v1/web_eventos",
      K="sb_publishable_geoLSQB5FU1mE7ZfTiKOhQ_EYFHzydo";
  function nid(){return Math.random().toString(36).slice(2,10)+Date.now().toString(36);}
  function clasifica(us,host,medium,ads){
    var s=((us||"")+" "+(host||"")).toLowerCase();
    var R=[["chatgpt","ChatGPT"],["openai","ChatGPT"],["perplexity","Perplexity"],["claude.ai","Claude"],["anthropic","Claude"],
      ["gemini","Gemini"],["bard.google","Gemini"],["copilot","Copilot"],["meta.ai","Meta AI"],
      ["instagram","Instagram"],["facebook","Facebook"],["fb.","Facebook"],["fb ","Facebook"],["whatsapp","WhatsApp"],["wa.me","WhatsApp"],
      ["tiktok","TikTok"],["linkedin","LinkedIn"],["lnkd","LinkedIn"],["pinterest","Pinterest"],["youtube","YouTube"],
      ["mail.google","Correo"],["google","Google"],["bing","Bing"],["duckduckgo","DuckDuckGo"],["yahoo","Yahoo"],["ecosia","Ecosia"],
      ["mail","Correo"],["outlook","Correo"],["newsletter","Correo"]];
    for(var i=0;i<R.length;i++){ if(s.indexOf(R[i][0])>-1){
      var n=R[i][1];
      if((n==="Google"||n==="Bing")&&(ads||/cpc|ppc|paid/.test(medium||""))) n+=" Ads";
      if((n==="Facebook"||n==="Instagram")&&/cpc|paid|ads/.test(medium||"")) n+=" Ads";
      return n; } }
    if(!s.trim()||s.indexOf("cultivosanisidro")>-1||s.indexOf("cultivossanisidro")>-1) return "Directo";
    return (host||us).replace(/^www\./,"").slice(0,80);
  }
  var TZ={"America/Bogota":"Colombia","America/Mexico_City":"México","America/Monterrey":"México","America/Cancun":"México","America/Tijuana":"México",
    "America/Panama":"Panamá","America/Lima":"Perú","America/Guayaquil":"Ecuador","America/Caracas":"Venezuela","America/Santiago":"Chile",
    "America/Sao_Paulo":"Brasil","America/Costa_Rica":"Costa Rica","America/Guatemala":"Guatemala","America/El_Salvador":"El Salvador",
    "America/Santo_Domingo":"Rep. Dominicana","America/Puerto_Rico":"Puerto Rico","America/Montevideo":"Uruguay","America/Asuncion":"Paraguay",
    "America/La_Paz":"Bolivia","America/Toronto":"Canadá","America/Vancouver":"Canadá","America/Edmonton":"Canadá","America/Winnipeg":"Canadá","America/Halifax":"Canadá",
    "Europe/Madrid":"España","Europe/London":"Reino Unido","Europe/Amsterdam":"Países Bajos","Europe/Berlin":"Alemania","Europe/Paris":"Francia",
    "Europe/Rome":"Italia","Europe/Brussels":"Bélgica","Europe/Zurich":"Suiza","Europe/Vienna":"Austria","Europe/Lisbon":"Portugal","Europe/Dublin":"Irlanda",
    "Europe/Stockholm":"Suecia","Europe/Copenhagen":"Dinamarca","Europe/Oslo":"Noruega","Europe/Warsaw":"Polonia","Europe/Moscow":"Rusia","Europe/Istanbul":"Turquía",
    "Asia/Tokyo":"Japón","Asia/Seoul":"Corea del Sur","Asia/Shanghai":"China","Asia/Hong_Kong":"Hong Kong","Asia/Taipei":"Taiwán","Asia/Singapore":"Singapur",
    "Asia/Dubai":"Emiratos Árabes","Asia/Riyadh":"Arabia Saudita","Asia/Qatar":"Catar","Asia/Kolkata":"India","Asia/Bangkok":"Tailandia","Asia/Manila":"Filipinas",
    "Australia/Sydney":"Australia","Australia/Melbourne":"Australia"};
  function pais(){var t="";try{t=Intl.DateTimeFormat().resolvedOptions().timeZone||"";}catch(e){}
    if(TZ[t]) return TZ[t];
    if(/^America\/(New_York|Chicago|Denver|Los_Angeles|Phoenix|Anchorage|Detroit|Boise|Indiana|Kentucky|North_Dakota|Juneau|Menominee|Nome|Sitka|Yakutat|Adak)/.test(t)||t==="Pacific/Honolulu") return "Estados Unidos";
    if(/^America\/Argentina/.test(t)) return "Argentina";
    return t||"—";}
  var vis=LS.getItem("si_vid"); if(!vis){vis=nid();LS.setItem("si_vid",vis);}
  var ses=SS.getItem("si_sid"), src=SS.getItem("si_src"), camp=SS.getItem("si_cmp")||"", ref=SS.getItem("si_ref")||"";
  if(!ses){
    ses=nid(); var q=new URLSearchParams(location.search);
    var us=q.get("utm_source")||"", med=(q.get("utm_medium")||"").toLowerCase(), ads=!!(q.get("gclid")||q.get("gbraid")||q.get("wbraid")||q.get("msclkid"));
    if(q.get("fbclid")&&!us) us="facebook";
    camp=[q.get("utm_campaign"),q.get("utm_medium")].filter(Boolean).join(" / ").slice(0,120);
    var h=""; try{h=document.referrer?new URL(document.referrer).hostname:"";}catch(e){}
    if(q.get("gclid")&&!us) us="google";
    src=clasifica(us,h,med,ads); ref=h.slice(0,300);
    SS.setItem("si_sid",ses);SS.setItem("si_src",src);SS.setItem("si_cmp",camp);SS.setItem("si_ref",ref);
  }
  var ua=navigator.userAgent, disp=/iPad|Tablet/i.test(ua)?"Tablet":(/Mobi|Android|iPhone/i.test(ua)?"Celular":"Computador");
  var zona=pais();
  function ruta(){var h=location.hash||""; if(/^#\/admin/.test(h)) return null;
    return (location.pathname+(h?h.split("?")[0]:"")).slice(0,300);}
  function send(tipo,dato,valor){
    var r=ruta(); if(r===null) return;
    var b={tipo:tipo,ruta:r,titulo:(document.title||"").slice(0,300),fuente:src,referente:ref,campana:camp,
      dispositivo:disp,idioma:(navigator.language||"").slice(0,20),zona:zona,visitante:vis,sesion:ses};
    if(dato!=null) b.dato=String(dato).slice(0,300);
    if(valor!=null&&!isNaN(+valor)) b.valor=+valor;
    try{fetch(U,{method:"POST",keepalive:true,headers:{"apikey":K,"Content-Type":"application/json","Prefer":"return=minimal"},body:JSON.stringify(b)}).catch(function(){});}catch(e){}
  }
  var last="";
  function vista(){var r=ruta(); if(r===null||r===last) return; last=r; send("pagina");}
  window.siTrack=function(t,d,v){ if(LS.getItem("si_notrack")!=="1") send(t,d,v); };
  vista(); window.addEventListener("hashchange",vista);
  document.addEventListener("click",function(e){
    var a=e.target&&e.target.closest&&e.target.closest("a[href]"); if(!a) return;
    var u=a.getAttribute("href")||"", k=null;
    if(/wa\.me|whatsapp/i.test(u)) k="WhatsApp";
    else if(/^mailto:/i.test(u)) k="Correo";
    else if(/^tel:/i.test(u)) k="Teléfono";
    else if(/instagram\.com/i.test(u)) k="Instagram";
    else if(/facebook\.com/i.test(u)) k="Facebook";
    else if(/\/pedidos\/?/.test(u)&&location.pathname.indexOf("/pedidos")!==0) k="Ir al portal de pedidos";
    if(k) send("clic",k);
  },true);
}catch(e){}})();
