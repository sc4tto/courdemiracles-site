const themePresets={
  windows2000:{name:'Windows 2000',desktop:'#008080',panel:'#d4d0c8',title:'#000080',accent:'#008000',text:'#000000',radius:0,border:2,spacing:8,shadow:2,highlight:90,iconSize:20,iconGap:8,iconY:0,mobileScale:110,touchTarget:48},
  xp:{name:'XP Luna',desktop:'#5b9bd5',panel:'#ece9d8',title:'#245edb',accent:'#3c8b28',text:'#102a56',radius:8,border:2,spacing:10,shadow:7,highlight:82,iconSize:20,iconGap:8,iconY:0,mobileScale:115,touchTarget:50},
  aero:{name:'Windows Aero',desktop:'#6ba7c7',panel:'#e8f5fb',title:'#3b7ca6',accent:'#1688ce',text:'#17334a',radius:10,border:2,spacing:11,shadow:10,highlight:94,iconSize:21,iconGap:9,iconY:0,mobileScale:116,touchTarget:50},
  keramik:{name:'KDE Keramik',desktop:'#8fa2b4',panel:'#e6e7e8',title:'#526d87',accent:'#527aa3',text:'#1c2732',radius:13,border:3,spacing:10,shadow:9,highlight:88,iconSize:21,iconGap:8,iconY:-1,mobileScale:116,touchTarget:50},
  oxygen:{name:'KDE Oxygen',desktop:'#263647',panel:'#edf2f5',title:'#2d5f91',accent:'#3daee9',text:'#172634',radius:6,border:2,spacing:10,shadow:8,highlight:86,iconSize:20,iconGap:8,iconY:0,mobileScale:114,touchTarget:48},
  clearlooks:{name:'GNOME Clearlooks',desktop:'#729fcf',panel:'#eeeeec',title:'#3465a4',accent:'#4e9a06',text:'#2e3436',radius:5,border:2,spacing:10,shadow:5,highlight:78,iconSize:20,iconGap:8,iconY:0,mobileScale:113,touchTarget:48},
  ubuntu:{name:'Ubuntu Human',desktop:'#8c5a32',panel:'#f4e7d3',title:'#9b4f16',accent:'#e57d15',text:'#3d2618',radius:7,border:2,spacing:11,shadow:7,highlight:82,iconSize:20,iconGap:9,iconY:0,mobileScale:115,touchTarget:50},
  terminal:{name:'Terminale GNU/Linux',desktop:'#0b0f0c',panel:'#101713',title:'#18241d',accent:'#40e070',text:'#d5ffe0',radius:0,border:1,spacing:8,shadow:4,highlight:30,iconSize:19,iconGap:8,iconY:0,mobileScale:108,touchTarget:46},
  flubber:{name:'Flubber',desktop:'#8fdca8',panel:'#dff7e7',title:'#119b59',accent:'#00a957',text:'#103b25',radius:22,border:2,spacing:13,shadow:12,highlight:96,iconSize:21,iconGap:9,iconY:-1,mobileScale:120,touchTarget:52}
};
const themeNumbers={radius:[0,32],border:[1,5],spacing:[4,20],shadow:[0,20],highlight:[0,100],iconSize:[14,28],iconGap:[2,16],iconY:[-4,4],mobileScale:[90,140],touchTarget:[44,60]};
const hexThemeKeys=['desktop','panel','title','accent','text'];
function normalizeTheme(input){if(!input||typeof input!=='object')throw new Error('Tema non valido');const base=themePresets.windows2000,out={name:String(input.name||'Tema personale').slice(0,60)};for(const key of hexThemeKeys){const value=String(input[key]||base[key]);if(!/^#[0-9a-f]{6}$/i.test(value))throw new Error(`Colore ${key} non valido`);out[key]=value;}for(const [key,[min,max]] of Object.entries(themeNumbers)){const value=Number(input[key]??base[key]);if(!Number.isFinite(value))throw new Error(`Valore ${key} non valido`);out[key]=Math.max(min,Math.min(max,value));}out.iconOffsets=input.iconOffsets&&typeof input.iconOffsets==='object'?input.iconOffsets:{};return out;}
function applyTheme(theme){const root=document.documentElement.style;root.setProperty('--desktop',theme.desktop);root.setProperty('--paper',theme.panel);root.setProperty('--panel',theme.panel);root.setProperty('--panel-bottom',`color-mix(in srgb, ${theme.panel}, #000 7%)`);root.setProperty('--title',theme.title);root.setProperty('--accent',theme.accent);root.setProperty('--ink',theme.text);root.setProperty('--muted',`color-mix(in srgb, ${theme.text}, ${theme.panel} 45%)`);root.setProperty('--radius',`${theme.radius}px`);root.setProperty('--border-size',`${theme.border}px`);root.setProperty('--spacing',`${theme.spacing}px`);root.setProperty('--depth',theme.shadow);}
function setupThemes(){const select=$('theme-select');select.innerHTML=Object.entries(themePresets).map(([id,t])=>`<option value="${id}">${t.name}</option>`).join('');const savedId=localStorage.getItem('pixel-sheet-theme-id');if(savedId&&themePresets[savedId])select.value=savedId;applyTheme(themePresets[select.value]||themePresets.windows2000);select.addEventListener('change',()=>{applyTheme(themePresets[select.value]);localStorage.setItem('pixel-sheet-theme-id',select.value);localStorage.removeItem('pixel-sheet-custom-theme');$('theme-status').textContent=`Tema applicato: ${themePresets[select.value].name}`;});$('theme-input').addEventListener('change',async event=>{try{const file=event.target.files?.[0];if(!file)return;const data=JSON.parse(await file.text());if(data.schemaVersion!==undefined&&Number(data.schemaVersion)!==1)throw new Error('Versione del tema non supportata');const custom=normalizeTheme(data);let option=select.querySelector('[value="custom"]');if(!option){option=document.createElement('option');option.value='custom';select.append(option);}option.textContent=`${custom.name} (personale)`;themePresets.custom=custom;select.value='custom';applyTheme(custom);localStorage.setItem('pixel-sheet-theme-id','custom');localStorage.setItem('pixel-sheet-custom-theme',JSON.stringify(custom));$('theme-status').textContent=`Tema importato: ${custom.name}`;}catch(error){$('theme-status').textContent=`Importazione non riuscita: ${error.message}`;}finally{event.target.value='';}});try{const custom=normalizeTheme(JSON.parse(localStorage.getItem('pixel-sheet-custom-theme')));themePresets.custom=custom;const option=document.createElement('option');option.value='custom';option.textContent=`${custom.name} (personale)`;select.append(option);if(savedId==='custom'){select.value='custom';applyTheme(custom);}}catch{}}

const palettes = {
  primary: ['#FF0000','#00FF00','#0000FF'],
  'primary-bw': ['#000000','#FF0000','#00FF00','#0000FF','#FFFFFF'],
  cmy: ['#00FFFF','#FF00FF','#FFFF00'],
  gray: Array.from({length:8},(_,i)=>{const v=Math.round(i*255/7).toString(16).padStart(2,'0');return `#${v}${v}${v}`;})
};
const kernels = {
  floyd:[[1,0,7/16],[-1,1,3/16],[0,1,5/16],[1,1,1/16]],
  atkinson:[[1,0,1/8],[2,0,1/8],[-1,1,1/8],[0,1,1/8],[1,1,1/8],[0,2,1/8]],
  sierra:[[1,0,2/4],[-1,1,1/4],[0,1,1/4]],
  stucki:[[1,0,8/42],[2,0,4/42],[-2,1,2/42],[-1,1,4/42],[0,1,8/42],[1,1,4/42],[2,1,2/42],[-2,2,1/42],[-1,2,2/42],[0,2,4/42],[1,2,2/42],[2,2,1/42]],
  jjn:[[1,0,7/48],[2,0,5/48],[-2,1,3/48],[-1,1,5/48],[0,1,7/48],[1,1,5/48],[2,1,3/48],[-2,2,1/48],[-1,2,3/48],[0,2,5/48],[1,2,3/48],[2,2,1/48]]
};
const $=id=>document.getElementById(id);
let source=null, sourceFile=null, result=null;
let imageLoadGeneration=0, pendingSourceUrl=null;
const conversionState={version:0,snapshot:null,canvas:null,blobPromise:null};

function cloneSnapshot(snapshot){
  return snapshot ? {...snapshot,source:{...snapshot.source},output:{...snapshot.output},settings:{...snapshot.settings}} : null;
}

function emitConversionChange(){
  window.dispatchEvent(new CustomEvent('pixelsheet:conversionchange',{detail:cloneSnapshot(conversionState.snapshot)}));
}

function invalidateConversion({announce=true}={}){
  const hadConversion=Boolean(conversionState.snapshot);
  conversionState.version+=1;
  conversionState.snapshot=null;
  conversionState.canvas=null;
  conversionState.blobPromise=null;
  result=null;
  $('save-png').disabled=true;
  $('create-nft').disabled=true;
  $('result-canvas').classList.toggle('is-stale',hadConversion);
  if(announce&&hadConversion)$('status').textContent='Impostazioni modificate · genera una nuova anteprima.';
  emitConversionChange();
}

function canvasToPngBlob(canvas){
  return new Promise((resolve,reject)=>canvas.toBlob(blob=>blob?resolve(blob):reject(new Error('Impossibile creare il file PNG.')),'image/png'));
}

function publishConversion(canvas,metadata){
  const version=conversionState.version+1;
  conversionState.version=version;
  conversionState.snapshot=Object.freeze({
    version,
    createdAt:new Date().toISOString(),
    source:Object.freeze({...metadata.source}),
    output:Object.freeze({...metadata.output}),
    settings:Object.freeze({...metadata.settings})
  });
  conversionState.canvas=canvas;
  conversionState.blobPromise=null;
  result=canvas;
  canvas.classList.remove('is-stale');
  $('save-png').disabled=false;
  $('create-nft').disabled=false;
  emitConversionChange();
}

window.PixelSheetConversion=Object.freeze({
  getSnapshot(){return cloneSnapshot(conversionState.snapshot);},
  async getBlob(){
    const version=conversionState.version;
    if(!conversionState.snapshot||!conversionState.canvas)throw new Error('Genera prima una conversione valida.');
    if(!conversionState.blobPromise)conversionState.blobPromise=canvasToPngBlob(conversionState.canvas);
    const blob=await conversionState.blobPromise;
    if(version!==conversionState.version||!conversionState.snapshot)throw new Error('La conversione è stata modificata. Genera una nuova anteprima.');
    return blob;
  }
});
function hexRgb(h){return [1,3,5].map(i=>parseInt(h.slice(i,i+2),16));}
function linear(v){v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4;}
function oklab(rgb){const [r,g,b]=rgb.map(linear),l=Math.cbrt(.4122214708*r+.5363325363*g+.0514459929*b),m=Math.cbrt(.2119034982*r+.6806995451*g+.1073969566*b),s=Math.cbrt(.0883024619*r+.2817188376*g+.6299787005*b);return [.2104542553*l+.793617785*m-.0040720468*s,1.9779984951*l-2.428592205*m+.4505937099*s,.0259040371*l+.7827717662*m-.808675766*s];}
function transform(rgb,metric){if(metric==='rgb')return rgb.map(v=>v/255);if(metric==='linear')return rgb.map(linear);return oklab(rgb);}
function nearest(rgb,pal,palMetric,metric){const p=transform(rgb,metric);let best=0,dist=Infinity;palMetric.forEach((c,i)=>{const d=(p[0]-c[0])**2+(p[1]-c[1])**2+(p[2]-c[2])**2;if(d<dist){dist=d;best=i;}});return best;}
function updatePalette(){const colors=palettes[$('palette').value];$('swatches').innerHTML=colors.map(c=>`<span class="swatch" style="background:${c}" title="${c}"></span>`).join('');}
function updateSize(){if(!source)return;const w=+$('cell-width').value,h=Math.max(1,Math.round(source.height*w/source.width)),p=+$('pitch').value;$('size-info').textContent=`Altezza: ${h} · Celle: ${(w*h).toLocaleString('it-IT')} · ${(w*p).toFixed(1)} × ${(h*p).toFixed(1)} mm`;}
function drawSource(img){const c=$('source-canvas');c.width=img.width;c.height=img.height;c.getContext('2d').drawImage(img,0,0);}
$('image-input').addEventListener('change',e=>{
  const generation=++imageLoadGeneration;
  const file=e.target.files[0];
  if(pendingSourceUrl){URL.revokeObjectURL(pendingSourceUrl);pendingSourceUrl=null;}
  invalidateConversion();
  source=null;
  sourceFile=null;
  $('convert').disabled=true;
  if(!file){
    $('file-name').textContent='Nessuna immagine selezionata';
    $('status').textContent='Pronto';
    return;
  }
  sourceFile=file;
  $('status').textContent='Caricamento immagine…';
  const img=new Image();
  const objectUrl=URL.createObjectURL(file);
  pendingSourceUrl=objectUrl;
  const finishLoad=()=>{
    URL.revokeObjectURL(objectUrl);
    if(pendingSourceUrl===objectUrl)pendingSourceUrl=null;
  };
  img.onload=()=>{
    if(generation!==imageLoadGeneration){finishLoad();return;}
    source=img;
    drawSource(img);
    $('file-name').textContent=`${file.name} · ${img.width} × ${img.height} px`;
    $('convert').disabled=false;
    $('status').textContent='Immagine pronta · genera l’anteprima.';
    updateSize();
    finishLoad();
  };
  img.onerror=()=>{
    if(generation!==imageLoadGeneration){finishLoad();return;}
    sourceFile=null;
    $('file-name').textContent='Impossibile aprire l’immagine selezionata';
    $('status').textContent='Errore durante il caricamento dell’immagine.';
    finishLoad();
  };
  img.src=objectUrl;
});

['cell-width','pitch'].forEach(id=>$(id).addEventListener('input',()=>{updateSize();invalidateConversion();}));
$('resampling').addEventListener('change',()=>invalidateConversion());
$('palette').addEventListener('change',()=>{updatePalette();invalidateConversion();});
$('metric').addEventListener('change',()=>invalidateConversion());
$('dither').addEventListener('change',()=>invalidateConversion());
document.querySelectorAll('.tab').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('.tab,.view').forEach(x=>x.classList.remove('active'));b.classList.add('active');$(`${b.dataset.tab}-view`).classList.add('active');}));
function convert(){if(!source)return;const w=Math.max(8,Math.min(1200,+$('cell-width').value||160)),h=Math.max(1,Math.round(source.height*w/source.width));if(w*h>500000){$('status').textContent='Riduci la larghezza: limite web di 500.000 celle.';return;}const temp=document.createElement('canvas');temp.width=w;temp.height=h;const ctx=temp.getContext('2d',{willReadFrequently:true});ctx.imageSmoothingEnabled=$('resampling').value==='smooth';ctx.drawImage(source,0,0,w,h);const image=ctx.getImageData(0,0,w,h),work=new Float32Array(image.data),colors=palettes[$('palette').value],pal=colors.map(hexRgb),metric=$('metric').value,palMetric=pal.map(c=>transform(c,metric)),method=$('dither').value,idx=new Uint16Array(w*h);$('status').textContent='Conversione in corso…';
  if(method==='bayer'){const m=[[0,8,2,10],[12,4,14,6],[3,11,1,9],[15,7,13,5]];for(let y=0;y<h;y++)for(let x=0;x<w;x++){const k=(y*w+x)*4,t=(m[y%4][x%4]/16-.5)*64;idx[y*w+x]=nearest([work[k]+t,work[k+1]+t,work[k+2]+t],pal,palMetric,metric);}}
  else if(method==='none'){for(let i=0;i<w*h;i++){const k=i*4;idx[i]=nearest([work[k],work[k+1],work[k+2]],pal,palMetric,metric);}}
  else {const key=method.startsWith('floyd')?'floyd':method,kernel=kernels[key],serp=method==='floyd-serpentine'||['sierra','stucki','jjn'].includes(method);for(let y=0;y<h;y++){const rev=serp&&y%2,begin=rev?w-1:0,end=rev?-1:w,step=rev?-1:1;for(let x=begin;x!==end;x+=step){const k=(y*w+x)*4,old=[work[k],work[k+1],work[k+2]],choice=nearest(old,pal,palMetric,metric);idx[y*w+x]=choice;const err=old.map((v,i)=>v-pal[choice][i]);for(const [dx,dy,weight] of kernel){const nx=x+dx*step,ny=y+dy;if(nx>=0&&nx<w&&ny<h){const n=(ny*w+nx)*4;for(let c=0;c<3;c++)work[n+c]=Math.max(0,Math.min(255,work[n+c]+err[c]*weight));}}}}}
  const out=$('result-canvas'),outCtx=out.getContext('2d');out.width=w;out.height=h;const pixels=outCtx.createImageData(w,h),counts=Array(colors.length).fill(0);for(let i=0;i<idx.length;i++){const c=pal[idx[i]],k=i*4;pixels.data[k]=c[0];pixels.data[k+1]=c[1];pixels.data[k+2]=c[2];pixels.data[k+3]=255;counts[idx[i]]++;}outCtx.putImageData(pixels,0,0);publishConversion(out,{source:{name:sourceFile?.name||'immagine',type:sourceFile?.type||'',width:source.width,height:source.height},output:{width:w,height:h,mimeType:'image/png'},settings:{cellWidth:w,resampling:$('resampling').value,pitchMm:+$('pitch').value,palette:$('palette').value,metric,dither:method}});$('result-view').querySelector('p')?.remove();$('stats').innerHTML=colors.map((c,i)=>`<div class="stat-row"><span class="stat-color" style="background:${c}"></span><code>${c}</code><span>${counts[i].toLocaleString('it-IT')}</span><span>${(counts[i]*100/idx.length).toFixed(2)}%</span></div>`).join('');$('status').textContent=`Anteprima pronta · ${w} × ${h} celle`;}
$('convert').addEventListener('click',()=>setTimeout(convert,20));
$('save-png').addEventListener('click',()=>{if(!result)return;result.toBlob(blob=>{const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='immagine_quantizzata.png';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);},'image/png');});
setupThemes();
updatePalette();
