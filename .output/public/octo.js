/* OCTO — tema compartilhado (site + iframes). Chave única: localStorage["octo-theme"] = light|dark|system */
(function(){
  var KEY="octo-theme", mq=window.matchMedia("(prefers-color-scheme: dark)");
  function pref(){try{return localStorage.getItem(KEY)||"system"}catch(e){return "system"}}
  function eff(p){return p==="system"?(mq.matches?"dark":"light"):p}
  function apply(){
    var t=eff(pref()), r=document.documentElement;
    r.setAttribute("data-theme",t); r.classList.toggle("dark",t==="dark");
    r.style.colorScheme=t;
  }
  window.OctoTheme={
    get:pref, effective:function(){return eff(pref())},
    set:function(p){try{localStorage.setItem(KEY,p)}catch(e){} apply();
      try{window.dispatchEvent(new CustomEvent("octo-theme"))}catch(e){}},
    toggle:function(){this.set(eff(pref())==="dark"?"light":"dark")}
  };
  apply();
  window.addEventListener("storage",function(e){if(e.key===KEY)apply()});
  try{mq.addEventListener("change",apply)}catch(e){}
})();
