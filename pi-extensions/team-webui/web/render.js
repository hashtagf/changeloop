import {marked,DOMPurify} from '/vendor/markdown.js';
const el=(tag,cls,text)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n;};
const button=(text,fn)=>{const b=el('button','render-button',text);b.type='button';b.onclick=fn;return b;};
let mermaid,serial=0,queue=Promise.resolve(),viewer;
const diagrams=new Map();
function openImage(src,alt) {
  if(!viewer){viewer=el('dialog','image-viewer');viewer.setAttribute('aria-label','Image preview');document.body.append(viewer);}
  const image=el('img');image.src=src;image.alt=alt||'Image preview';
  viewer.replaceChildren(button('Close',()=>viewer.close()),image);if(!viewer.open)viewer.showModal();
}
export function imagePreview(src,alt='Image preview') {
  const container=el('figure','image-preview'),image=el('img','message-image');image.alt=alt;image.loading='lazy';image.referrerPolicy='no-referrer';image.src=src;
  const show=button('Expand image',()=>openImage(src,alt));image.onerror=()=>{container.replaceChildren(el('p','render-error','Image unavailable'),el('small','',alt));};container.append(image,show);return container;
}
async function diagram(source,container) {
  if(source.length>12000){container.textContent='Diagram exceeds preview limit; source is available below.';return;}
  if(diagrams.has(source)){container.replaceChildren(imagePreview(diagrams.get(source),'Mermaid diagram'));return;}
  container.textContent='Rendering diagram…';
  queue=queue.catch(()=>{}).then(async()=>{
    if(!container.isConnected)return;
    try {
      if(!mermaid){mermaid=(await import('/vendor/mermaid.js')).default;mermaid.initialize({startOnLoad:false,securityLevel:'strict',theme:'dark',htmlLabels:false,flowchart:{htmlLabels:false},maxTextSize:12000,maxEdges:200,suppressErrorRendering:true});}
      // Source directives cannot relax site configuration or add external images.
      if(/%%\{|^---\s*$/m.test(source))throw Error('Diagram configuration directives are not supported.');
      const result=await mermaid.render('pi-diagram-'+(++serial),source);
      const clean=DOMPurify.sanitize(result.svg,{USE_PROFILES:{svg:true,svgFilters:true},FORBID_TAGS:['foreignObject','image','a','script'],FORBID_ATTR:['onload','onclick']});
      const doc=new DOMParser().parseFromString(clean,'image/svg+xml');
      for(const n of doc.querySelectorAll('[href],[xlink\\:href]'))for(const attr of ['href','xlink:href'])if(n.hasAttribute(attr)&&!n.getAttribute(attr).startsWith('#'))n.removeAttribute(attr);
      const url=URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(doc.documentElement)],{type:'image/svg+xml'}));
      diagrams.set(source,url);while(diagrams.size>30){const key=diagrams.keys().next().value;URL.revokeObjectURL(diagrams.get(key));diagrams.delete(key);}
      if(container.isConnected)container.replaceChildren(imagePreview(url,'Mermaid diagram'));
    }catch{if(container.isConnected)container.replaceChildren(el('p','render-error','Diagram could not be rendered. Check its source below.'));}
  });
}
export function renderMarkdown(text,parent,{streaming=false,loadLocalImage}={}) {
  const fragment=DOMPurify.sanitize(marked.parse(String(text||''),{gfm:true,breaks:false}),{RETURN_DOM_FRAGMENT:true,USE_PROFILES:{html:true},FORBID_TAGS:['style','form','button','textarea','select','iframe','object','embed'],FORBID_ATTR:['style','id','name'],ADD_ATTR:['disabled']});
  for(const link of fragment.querySelectorAll('a')){
    const href=link.getAttribute('href')||'';
    if(!/^(https?:|mailto:|#)/i.test(href))link.removeAttribute('href');
    else {link.target='_blank';link.rel='noopener noreferrer';}
  }
  for(const input of fragment.querySelectorAll('input')){if(input.type!=='checkbox')input.remove();else input.disabled=true;}
  for(const image of fragment.querySelectorAll('img')) {
    const src=image.getAttribute('src')||'',alt=image.alt||'Markdown image';
    const slot=el('div','image-slot');image.replaceWith(slot);
    if(/^data:image\/(png|jpeg|gif|webp);base64,[A-Za-z0-9+/=]+$/i.test(src)&&src.length<7000000)slot.append(imagePreview(src,alt));
    else if(/^https?:\/\//i.test(src)) {
      slot.append(el('span','',alt),button('Load external image',()=>{slot.replaceChildren(imagePreview(src,alt));}));
    }else if(src && loadLocalImage && !/^[a-z][a-z0-9+.-]*:/i.test(src)&&!src.startsWith('//')) {
      const load=button('Preview '+alt,async()=>{load.disabled=true;try{const value=await loadLocalImage(src);slot.replaceChildren(imagePreview(value,alt));}catch{slot.replaceChildren(el('p','render-error','Image unavailable in this worktree.'));}});slot.append(load);
    }else slot.textContent=alt+' · unsupported image source';
  }
  for(const table of fragment.querySelectorAll('table')){const wrap=el('div','markdown-table');table.replaceWith(wrap);wrap.append(table);wrap.tabIndex=0;}
  for(const code of fragment.querySelectorAll('pre > code')) {
    const source=code.textContent,lang=(code.className.match(/language-([^\s]+)/)||[])[1]||'code',pre=code.parentElement;
    const block=el('section','code-block'),bar=el('div','code-toolbar');bar.append(el('span','',lang),button('Copy',async e=>{try{await navigator.clipboard.writeText(source);e.target.textContent='Copied';}catch{e.target.textContent='Select text to copy';}}));
    pre.replaceWith(block);block.append(bar);
    if(lang.toLowerCase()==='mermaid'){
      const preview=el('div','mermaid-preview'),details=el('details');details.append(el('summary','','Diagram source'),pre);block.append(preview,details);
      if(streaming)preview.textContent='Diagram preview appears when this response finishes.';else requestAnimationFrame(()=>void diagram(source,preview));
    }else block.append(pre);
  }
  parent.append(fragment);
}
