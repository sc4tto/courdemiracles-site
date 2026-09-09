const PIXEL_SHEET_THEMES = [
  {id:'windows-2000',name:'Windows 2000',note:'Tecnico e compatto',colors:['#0a6f76','#d4d0c8','#ffffff']},
  {id:'xp-luna',name:'Windows XP Luna',note:'Morbido e colorato',colors:['#245edb','#ece9d8','#3c8b28']},
  {id:'aero',name:'Windows Aero',note:'Trasparente e profondo',colors:['#447fae','#dcecf7','#ffffff']},
  {id:'keramik',name:'KDE Keramik',note:'Volumetrico e gommoso',colors:['#718aa8','#e8edf2','#ffffff']},
  {id:'oxygen',name:'KDE Oxygen',note:'Tecnologico e lucido',colors:['#3b7fa8','#d9e8ef','#f9fcfd']},
  {id:'clearlooks',name:'GNOME Clearlooks',note:'Chiaro e ordinato',colors:['#729fcf','#eeeeec','#ffffff']},
  {id:'ubuntu-human',name:'Ubuntu Human',note:'Caldo e materico',colors:['#a94f20','#ead7bd','#fffaf1']},
  {id:'terminal',name:'Terminale GNU/Linux',note:'Scuro e minimale',colors:['#63e6a5','#111713','#243229']},
  {id:'flubber',name:'Flubber',note:'Elastico e organico',colors:['#22a96b','#caf7d7','#f7fff9']}
];

const THEME_STORAGE_KEY='pixel-sheet-theme';
const themeDialog=document.getElementById('theme-dialog');
const themeButton=document.getElementById('theme-button');
const themeList=document.getElementById('theme-list');
const themeCurrent=document.getElementById('theme-current');

function setPixelSheetTheme(id,{save=true}={}){
  const theme=PIXEL_SHEET_THEMES.find(item=>item.id===id)||PIXEL_SHEET_THEMES[0];
  document.documentElement.dataset.theme=theme.id;
  document.documentElement.style.colorScheme=theme.id==='terminal'?'dark':'light';
  themeButton.setAttribute('aria-label',`Tema: ${theme.name}. Apri selettore`);
  themeButton.title=`Tema attivo: ${theme.name}`;
  themeCurrent.textContent=`Attivo: ${theme.name}`;
  themeList.querySelectorAll('[data-theme-id]').forEach(button=>{
    const active=button.dataset.themeId===theme.id;
    button.classList.toggle('is-selected',active);
    button.setAttribute('aria-checked',String(active));
  });
  if(save)localStorage.setItem(THEME_STORAGE_KEY,theme.id);
}

themeList.innerHTML=PIXEL_SHEET_THEMES.map(theme=>`
  <button class="theme-option" type="button" role="radio" aria-checked="false" data-theme-id="${theme.id}">
    <span class="theme-swatch" aria-hidden="true">${theme.colors.map(color=>`<i style="background:${color}"></i>`).join('')}</span>
    <span><strong>${theme.name}</strong><small>${theme.note}</small></span>
    <span class="theme-check" aria-hidden="true">✓</span>
  </button>`).join('');

themeButton.addEventListener('click',()=>themeDialog.showModal());
themeList.addEventListener('click',event=>{
  const option=event.target.closest('[data-theme-id]');
  if(option)setPixelSheetTheme(option.dataset.themeId);
});

let storedTheme;
try{storedTheme=localStorage.getItem(THEME_STORAGE_KEY);}catch{}
setPixelSheetTheme(storedTheme||'windows-2000',{save:false});
