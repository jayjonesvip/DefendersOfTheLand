const fs=require('node:fs'),path=require('node:path');
const root=__dirname,out=path.join(root,'dist');fs.mkdirSync(out,{recursive:true});
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const esc=s=>String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const book=read('content/books/origins/book.json'),manifest=read('image-manifest.json');
const configs=fs.readdirSync(path.join(root,'print')).filter(f=>f==='sample.json'||/^chapter\d+\.json$/.test(f)).map(f=>read('print/'+f)).filter(c=>c.book===book.id).sort((a,b)=>a.displayChapterNumber-b.displayChapterNumber);
const chapters=configs.map(config=>({...read(`content/books/${book.id}/${config.sourceChapter}`),number:config.displayChapterNumber,config}));
const downloads=read('dist/books/downloads.json');
if(Object.keys(downloads).some(k=>['full','ebooks','print','covers'].includes(k)))throw Error('Publish samples before building the public site');
const publicBooks=new Set(['downloads.json',...downloads.samples.map(d=>d.file)]);
if(fs.readdirSync(path.join(out,'books')).some(f=>!publicBooks.has(f)))throw Error('Public books directory contains non-sample files');
const cover=read('print/cover.json');
const size=bytes=>bytes>1048576?`${(bytes/1048576).toFixed(1)} MB`:`${Math.ceil(bytes/1024)} KB`;
const url=n=>`${book.id}-chapter-${n}.html`;
const img=(file,alt)=>{const m=manifest[file];return `<img src="assets/${esc(m?.file||file)}" alt="${esc(alt)}" ${m?`width="${m.width}" height="${m.height}"`:''} loading="lazy" decoding="async">`};
const link=(href,text,cls='')=>`<a href="${href}" class="${cls}">${text}</a>`;
const shell=(title,body,page='book')=>`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)} | Defenders of the Land</title><meta name="description" content="${esc(book.description)}"><link rel="stylesheet" href="styles.css"><script defer src="reader.js"></script></head><body data-page="${page}" data-chapter-count="${chapters.length}"><a class="skip" href="#main">Skip to content</a><header class="site-header">${link('index.html','Defenders<span>of the Land</span>','wordmark')}<nav aria-label="Main navigation">${link('origins.html','Contents')}${link('characters.html','Characters')}${link('downloads.html','Free sample')}<button id="theme" aria-pressed="false">Dark mode</button></nav></header><main id="main">${body}</main><footer>Defenders of the Land · Jay Jones</footer></body></html>`;
const rows=()=>chapters.map(c=>`<li>${link(url(c.number),`<span class="chapter-num">${String(c.number).padStart(2,'0')}</span><span>${esc(c.title)}</span><span class="read-label" data-read="${book.id}:${c.number}"></span>`)}</li>`).join('');
const pages={};
pages['index.html']=shell('Book One: Origins',`<section class="landing"><figure class="cover">${img(cover.frontArtwork,'Defenders of the Land — Origins, issue one cover')}</figure><div><p class="eyebrow">BOOK ONE · ORIGINS</p><h1>Defenders<br>of the Land</h1><p class="author">Jay Jones</p><p class="intro">${esc(book.description)}</p><p>Read all of Book One free here. The Kindle edition offers convenient offline reading.</p><div class="actions">${link(url(1),'Start reading →','button')}${link('downloads.html','Download a free sample','button secondary')}<a class="button secondary" data-resume hidden>Continue reading →</a></div>${link('origins.html',`View all ${chapters.length} chapters`,'contents-link')}</div></section>`,'home');
pages['origins.html']=shell('Contents',`<section class="contents"><p class="eyebrow">DEFENDERS OF THE LAND · BOOK ONE</p><h1>Origins</h1><p data-book-progress="${book.id}">0 of ${chapters.length} chapters completed</p><a class="button" data-resume hidden>Continue reading →</a><ol class="chapter-list">${rows()}</ol></section>`);
function prose(text){return text?`<p>${esc(text).replace(/\n/g,'<br>')}</p>`:''}
for(const [index,c] of chapters.entries()){
 const opening=c.blocks.find(b=>b.art===c.config.openingArtwork);
 const art=b=>c.config.illustrations[b.art]?.print===false?'':`<figure>${img(b.art,b.alt)}</figure>`;
 const body=c.blocks.map(b=>`${b.art&&b.art!==c.config.openingArtwork?art(b):''}${b.dialogue?prose('“'+b.dialogue+'”'):''}${prose(b.text)}`).join('');
 const next=chapters[index+1],prev=chapters[index-1];
 pages[url(c.number)]=shell(c.title,`<article class="reader" data-chapter="${book.id}:${c.number}"><div class="reader-toolbar">${link('origins.html','← Contents')}<div><button data-font="-" aria-label="Decrease font size">A−</button><button data-font="+" aria-label="Increase font size">A+</button><button id="focus" aria-pressed="false">Focus mode</button></div></div><div class="progress-row"><label for="reading-progress">Reading progress <span id="percent">0%</span></label><progress id="reading-progress" max="100" value="0"></progress></div><div id="resume-position" hidden><button id="restore">Return to saved place ↓</button></div><header class="chapter-heading"><p class="eyebrow">BOOK ONE: ORIGINS</p><div class="chapter-number">${String(c.number).padStart(2,'0')}</div><h1>${esc(c.title)}</h1></header><div class="chapter-body">${opening?art(opening):''}${body}${prose(c.ending)}</div><div class="chapter-ending"><p class="eyebrow">END OF CHAPTER ${c.number}</p><nav aria-label="Chapter navigation">${link(prev?url(prev.number):'origins.html',prev?'← Previous chapter':'← Contents')}<a class="button" data-complete data-next="${next?book.id+':'+next.number:''}" href="${next?url(next.number):'origins.html'}">${next?'Next chapter →':'Finish & return to contents →'}</a></nav></div></article>`,'reader');
}
const chars=fs.readdirSync(path.join(root,'content/characters')).map(f=>read('content/characters/'+f));
pages['characters.html']=shell('Characters',`<section class="contents"><p class="eyebrow">THE PEOPLE OF THE LAND</p><h1>Characters</h1><p>Profiles open as you finish their introduction chapters.</p><div class="profiles">${chars.map(c=>{const n=['seth','jenny'].includes(c.id)?configs.find(config=>config.sourceChapter==='chapter-02b.json').displayChapterNumber:(configs.find(config=>config.sourceChapter===`chapter-${String(c.introducedIn).padStart(2,'0')}.json`)?.displayChapterNumber||1);return `<article id="${esc(c.id)}" data-reveal="origins:${n}">${img(c.image,c.alias).replace('loading="lazy"','loading="eager"')}<h2>${esc(c.alias)}</h2><p class="sealed-message">Read Chapter ${n} to open this profile.</p><div class="profile-details" hidden>${prose(c.name)}${prose(c.role)}${prose(c.personality)}</div></article>`}).join('')}</div></section>`);
pages['downloads.html']=shell('Free sample',`<section class="contents downloads"><p class="eyebrow">BOOK ONE · ORIGINS</p><h1>Take a free sample</h1><p>Read all 18 chapters free on this website, or download the first three chapters with their illustrations to try offline.</p><div class="download-books">${downloads.samples.map(d=>`<article><h2>${esc(d.label)}</h2><p>${d.pages?`${d.pages} pages · `:''}${size(d.bytes)}</p><a class="button" href="books/${esc(d.file)}" download>Download ${d.file.endsWith('.epub')?'EPUB':'PDF'} sample ↓</a></article>`).join('')}</div><h2>Keep reading Book One</h2><p>The whole adventure is free to read here. A complete Kindle edition offers the convenience of keeping it in your Kindle library and reading offline.</p><div class="actions">${link(url(1),'Read Book One free →','button')}${link('origins.html','See all 18 chapters','button secondary')}</div><p>Kindle purchase link will be added when the edition is published.</p></section>`,'downloads');
pages['404.html']=shell('Page not found',`<section class="contents"><h1>This page is missing.</h1>${link('index.html','Return to the book →','button')}</section>`);
// Remove obsolete generated pages only; manuscripts and PDF exports stay in place.
for(const file of fs.readdirSync(out).filter(f=>f.endsWith('.html')&&!Object.hasOwn(pages,f)))fs.unlinkSync(path.join(out,file));
const assetOut=path.join(out,'assets');fs.mkdirSync(assetOut,{recursive:true});
const used=new Set([...Object.values(pages).join('').matchAll(/src="assets\/([^"]+)"/g)].map(m=>m[1]));
for(const f of fs.readdirSync(assetOut))if(!used.has(f))fs.unlinkSync(path.join(assetOut,f));
for(const f of used)fs.copyFileSync(path.join(root,'public/assets',f),path.join(assetOut,f));
fs.mkdirSync(path.join(out,'fonts'),{recursive:true});for(const f of ['Bangers-Regular.ttf','LibreBaskerville-Regular.ttf','OFL-Bangers.txt','OFL-LibreBaskerville.txt'])fs.copyFileSync(path.join(root,'print/fonts',f),path.join(out,'fonts',f));
for(const f of ['styles.css','reader.js'])fs.copyFileSync(path.join(root,f),path.join(out,f));
const site=process.env.SITE_URL?.replace(/\/$/,'');
for(const [file,html] of Object.entries(pages))fs.writeFileSync(path.join(out,file),html.replace('</head>',site?`<link rel="canonical" href="${esc(site+'/'+file)}"></head>`:'</head>'));
fs.writeFileSync(path.join(out,'robots.txt'),`User-agent: *\nAllow: /\n${site?'Sitemap: '+site+'/sitemap.xml\n':''}`);
if(site)fs.writeFileSync(path.join(out,'sitemap.xml'),`<?xml version="1.0"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${Object.keys(pages).map(f=>`<url><loc>${esc(site+'/'+f)}</loc></url>`).join('')}</urlset>`);
else if(fs.existsSync(path.join(out,'sitemap.xml')))fs.unlinkSync(path.join(out,'sitemap.xml'));
fs.writeFileSync(path.join(out,'.nojekyll'),'');
console.log(`Built ${Object.keys(pages).length} pages; ${chapters.length} chapters synchronized with paperback settings.`);


