const fs=require('node:fs'),path=require('node:path');
const crypto=require('node:crypto');
const root=__dirname,out=path.join(root,'dist');fs.rmSync(out,{recursive:true,force:true});fs.mkdirSync(out,{recursive:true});
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const esc=s=>String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const book=read('content/books/origins/book.json'),manifest=read('image-manifest.json');
const siteConfig=read('content/site.json');
require('./scripts/public-policy.cjs').checkSource(root);
const {createSeo}=require('./seo.cjs');
const configs=read('content/preview-layout.json');
const chapters=configs.map(config=>({...read(`content/books/${book.id}/${config.sourceChapter}`),number:config.displayChapterNumber,config}));
const additionalBooks=fs.readdirSync(path.join(root,'content/books')).filter(id=>id!==book.id).map(id=>{
 const metadata=read(`content/books/${id}/book.json`);
 const entries=require('./scripts/available-chapters.cjs').availableChapters(metadata,file=>read(`content/books/${id}/${file}`));
 if(metadata.id!==id)throw Error(`Invalid book id in ${id}`);
 return {...metadata,entries};
}).filter(b=>b.entries.length).sort((a,b)=>a.number-b.number);
const bookCounts={[book.id]:chapters.length,...Object.fromEntries(additionalBooks.map(b=>[b.id,b.entries.length]))};
fs.mkdirSync(path.join(out,'books'),{recursive:true});
for(const file of fs.readdirSync(path.join(root,'public/books')))fs.copyFileSync(path.join(root,'public/books',file),path.join(out,'books',file));
const downloads=read('public/books/downloads.json');
if(Object.keys(downloads).some(k=>['full','ebooks','print','covers'].includes(k)))throw Error('Publish samples before building the public site');
const publicBooks=new Set(['downloads.json',...downloads.samples.map(d=>d.file)]);
if(downloads.samples.length!==2||!publicBooks.has('origins-sample-chapters-01-03.pdf')||!publicBooks.has('origins-sample-chapters-01-03.epub'))throw Error('Only Book One PDF/EPUB samples may be published');
if(fs.readdirSync(path.join(out,'books')).some(f=>!publicBooks.has(f)))throw Error('Public books directory contains non-sample files');
const cover=read('content/book-one-marketing.json');
const archiveItems=read('content/vault/gallery.json');
const seo=createSeo({site:siteConfig,book,chapters,additionalBooks,cover,manifest,archiveItems,escape:esc});
const kindle=(label='Buy Kindle ebook',cls='button secondary')=>link(siteConfig.ebook.url,label,cls);
const buy=(label='Buy paperback on Amazon',cls='button')=>link(siteConfig.paperback.url,label,cls);
const series=()=>siteConfig.amazonSeriesUrl?link(esc(siteConfig.amazonSeriesUrl),'View series on Amazon','button secondary'):'';
const continueUrl=b=>b.amazonUrl||(b.number===1?siteConfig.ebook.url:b.ebook?.url||b.paperback?.url||siteConfig.amazonSeriesUrl);
const bookLabel=b=>`Book ${['','One','Two','Three','Four'][b.number]||b.number}`;
const editions=b=>[b.paperback?link(b.paperback.url,'Buy paperback on Amazon','button secondary'):'',b.ebook?link(b.ebook.url,'Buy Kindle ebook','button secondary'):''].join('');
const amazonSequels=()=>additionalBooks.filter(b=>b.paperback||b.ebook).map(b=>`<article><h3>${esc(b.title)}</h3><p><strong>${esc(bookLabel(b))}:</strong> ${esc(b.status)}. Available on Amazon in paperback and as a Kindle ebook.</p><div class="actions">${editions(b)}</div><p>${link(`${b.id}.html`,`Read ${bookLabel(b)}’s first chapter →`)}</p></article>`).join('');
const size=bytes=>bytes>1048576?`${(bytes/1048576).toFixed(1)} MB`:`${Math.ceil(bytes/1024)} KB`;
const url=n=>`${book.id}-chapter-${n}.html`;
const img=(file,alt)=>{const m=manifest[file];return `<img src="assets/${esc(m?.file||file)}" alt="${esc(alt)}" ${m?`width="${m.width}" height="${m.height}"`:''} loading="lazy" decoding="async">`};
const link=(href,text,cls='')=>`<a href="${href}" class="${cls}">${text}</a>`;
const shell=(title,body,page='book',activeBook=book)=>`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)} | Defenders of the Land</title><meta name="description" content="${esc(activeBook.description)}"><link rel="stylesheet" href="styles.css"><script defer src="site-nav.js"></script><script defer src="reader.js"></script></head><body data-page="${page}" data-book-id="${esc(activeBook.id)}" data-chapter-count="${bookCounts[activeBook.id]}" data-book-counts="${esc(JSON.stringify(bookCounts))}"><a class="skip" href="#main">Skip to content</a><header class="site-header">${link('index.html','Defenders<span>of the Land</span>','wordmark')}<button type="button" id="nav-toggle" class="nav-toggle" aria-expanded="false" aria-controls="site-navigation" aria-label="Open navigation"><span class="nav-toggle-icon" aria-hidden="true"><span></span><span></span><span></span></span><span class="nav-toggle-label">Menu</span></button><nav id="site-navigation" aria-label="Main navigation">${link('books.html','Books')}${link('characters.html','Characters')}${link('map.html','Map')}${link('author.html','Author')}${link('downloads.html','Free sample')}<button id="theme" aria-pressed="false">Dark mode</button></nav></header><main id="main">${body}</main><footer>Defenders of the Land · Jay Jones · ${link('paperback.html','Paperback & Kindle editions')}</footer></body></html>`;
function contentsPage(b,entries){
 const coverImage=b.number===1?siteConfig.coverImage:b.cover;
 const purchase=b.number===1?siteConfig:b;
 const editionButtons=[['paperback','Buy paperback on Amazon','button'],['ebook','Buy Kindle ebook','button secondary']].map(([format,label,cls])=>purchase[format]?.url?link(purchase[format].url,label,cls):`<button class="${cls}" type="button" disabled title="Amazon edition coming soon">${label}</button>`).join('');
 return shell(b.title,`<section class="contents book-contents"><div class="contents-book-header"><figure class="contents-cover">${img(coverImage,`${b.title} cover`).replace('loading="lazy"','loading="eager"')}</figure><div><p class="eyebrow">DEFENDERS OF THE LAND · ${esc(bookLabel(b).toUpperCase())}${b.status==='In progress'?' · IN PROGRESS':''}</p><h1>${esc(b.title)}</h1><p>${esc(b.number===1?'An illustrated Cleveland superhero adventure by Jay Jones. Read Chapter 1 here, then continue on Amazon.':b.description)}</p></div></div><div class="actions">${editionButtons}${link('paperback.html','About the editions','button secondary')}</div>${!purchase.paperback&&!purchase.ebook?'<p class="edition-note">Amazon editions coming soon.</p>':''}<p data-book-progress="${b.id}">0 of ${entries.length} chapters completed</p><a class="button" data-resume hidden>Continue reading →</a><ol class="chapter-list">${entries.map(c=>`<li>${link(`${b.id}-chapter-${c.number}.html`,`<span class="chapter-num">${String(c.number).padStart(2,'0')}</span><span>${esc(c.title)}</span><span class="read-label" data-read="${b.id}:${c.number}"></span>`)}</li>`).join('')}</ol></section>`,'book',b);
}
const pages={};
pages['author.html']=shell('About the Author',require('./author.cjs').createAuthor({site:siteConfig,archiveItems,escape:esc,link}),'author');
const vault=require('./vault.cjs').createVault({root,escape:esc,link,bookTwo:additionalBooks.find(b=>b.id==='book-two')});
pages['1990-vault.html']=shell('From the Vault: 1990',vault.body,'vault').replace('</head>','<link rel="stylesheet" href="vault.css"></head>');
const mapGeometry=read('content/map/downtown.geojson');
pages['map.html']=shell('Explore the Land',require('./map.cjs').createMap({geometry:mapGeometry,site:siteConfig,escape:esc}),'map').replace('</head>','<link rel="stylesheet" href="map.css"></head>');
pages['index.html']=shell('Book One: Origins',require('./landing.cjs').createLanding({books:[{...book,entries:chapters},...additionalBooks],site:siteConfig,escape:esc,img,link}),'home').replace('</head>','<link rel="preload" href="fonts/Bangers-Regular.ttf" as="font" type="font/ttf" crossorigin><link rel="preload" href="fonts/LibreBaskerville-Regular.ttf" as="font" type="font/ttf" crossorigin><link rel="stylesheet" href="landing.css"><script defer src="landing.js"></script></head>');
pages['origins.html']=contentsPage(book,chapters);
pages['books.html']=shell('Books',require('./books.cjs').createBooks({books:[book,...additionalBooks],site:siteConfig,escape:esc,img,link}),'books').replace('</head>','<link rel="stylesheet" href="books.css"></head>');

function prose(text){return text?`<p>${esc(text).replace(/\n/g,'<br>')}</p>`:''}
function renderChapters(activeBook,entries){for(const [index,c] of entries.entries()){
 const url=n=>`${activeBook.id}-chapter-${n}.html`,contents=`${activeBook.id}.html`;
 const label=activeBook.number===1?'BOOK ONE: ORIGINS':`BOOK ${activeBook.number}`;
 const opening=c.blocks.find(b=>b.art&&b.art===c.config?.openingArtwork);
 const art=b=>c.config?.illustrations?.[b.art]?.print===false?'':`<figure>${img(b.art,b.alt)}</figure>`;
 const body=c.blocks.map(b=>b.type==='heading'?`<h2 class="scene-heading">${esc(b.title)}</h2>`:`${b.art&&b.art!==c.config?.openingArtwork?art(b):''}${b.dialogue?prose('“'+b.dialogue+'”'):''}${prose(b.text)}`).join('');
 const next=entries[index+1],prev=entries[index-1];
 const continuation=activeBook.id==='book-three'&&!next?additionalBooks.find(b=>b.id==='book-four'):null;
 pages[url(c.number)]=shell(c.title,`<article class="reader" data-chapter="${activeBook.id}:${c.number}"><div class="reader-toolbar">${link(contents,'← Contents')}<div><button data-font="-" aria-label="Decrease font size">A−</button><button data-font="+" aria-label="Increase font size">A+</button><button id="focus" aria-pressed="false">Focus mode</button></div></div><div class="progress-row"><label for="reading-progress">Reading progress <span id="percent">0%</span></label><progress id="reading-progress" max="100" value="0"></progress></div><div id="resume-position" hidden><button id="restore">Return to saved place ↓</button></div><header class="chapter-heading"><p class="eyebrow">${esc(label)}</p><div class="chapter-number">${String(c.number).padStart(2,'0')}</div><h1>${esc(c.title)}</h1></header><div class="chapter-body">${opening?art(opening):''}${body}${prose(c.ending)}</div><div class="chapter-ending"><p class="eyebrow">END OF CHAPTER ${c.number}</p><nav aria-label="Chapter navigation">${link(prev?url(prev.number):contents,prev?'← Previous chapter':'← Contents')}<a class="button" data-complete data-next="${next?activeBook.id+':'+next.number:''}" href="${continueUrl(activeBook)}">Next: continue on Amazon →</a></nav>${continuation?`<p>${link(`${continuation.id}-chapter-${continuation.entries[0].number}.html`,`Continue to ${esc(continuation.title)} →`)}</p>`:''}</div></article>`,'reader',activeBook);
}}
renderChapters(book,chapters);
for(const b of additionalBooks){
 pages[`${b.id}.html`]=contentsPage(b,b.entries);
 renderChapters(b,b.entries);
}
const chars=fs.readdirSync(path.join(root,'content/characters')).map(f=>read('content/characters/'+f));
pages['characters.html']=shell('Characters',require('./characters.cjs').createCharacters({characters:chars,img,escape:esc,site:siteConfig})).replace('</head>','<link rel="stylesheet" href="characters.css"><script defer src="characters.js"></script></head>');
pages['downloads.html']=shell('Free sample',require('./downloads.cjs').createDownloads({books:[book,...additionalBooks],site:siteConfig,downloads,escape:esc,img,link}),'downloads').replace('</head>','<link rel="stylesheet" href="downloads.css"></head>');
pages['paperback.html']=shell('Paperback & Kindle editions',`<section class="contents paperback-page"><p class="eyebrow">DEFENDERS OF THE LAND · BY JAY JONES</p><h1>Paperback &amp; Kindle editions</h1><div class="actions">${series()}</div><p><em>Origins</em>, <em>Aftershock</em>, <em>Lava Lips</em>, and <em>Clash in Cleveland</em> are available on Amazon in paperback and as Kindle ebooks.</p><h2>Origins</h2><div class="paperback-layout"><figure>${img(siteConfig.coverImage||cover.frontArtwork,siteConfig.paperback.title+' paperback cover').replace('loading="lazy"','loading="eager" fetchpriority="high"')}</figure><div><p class="intro">${esc(book.description)}</p><p>An illustrated superhero adventure set in Cleveland in 1987.</p>${cover.blurb.map(prose).join('')}<div class="actions">${buy()}${kindle()}${link('downloads.html','Try a free sample','button secondary')}</div><p>${link('origins.html','Read the Chapter 1 preview →')}</p></div></div><h2>Choose your edition</h2><p><em>${esc(siteConfig.paperback.title)}</em> is an illustrated prose adventure by Jay Jones, with an illustrated Chapter 1 preview here. Choose the paperback for your bookshelf or the Kindle ebook for convenient offline reading. Paperback and Kindle editions are available on Amazon; current pricing and purchasing options are shown on their listings.</p><p>Prefer to try the story first? Download the first three chapters as a PDF or EPUB, or read Chapter 1 on this site.</p><h2>Continue the series on Amazon</h2>${amazonSequels()}</section>`,'product');
pages['404.html']=shell('Page not found',`<section class="contents"><h1>This page is missing.</h1>${link('index.html','Return to the book →','button')}</section>`);
// Remove obsolete generated pages only; manuscripts and PDF exports stay in place.
for(const file of fs.readdirSync(out).filter(f=>f.endsWith('.html')&&!Object.hasOwn(pages,f)))fs.unlinkSync(path.join(out,file));
const assetOut=path.join(out,'assets');fs.mkdirSync(assetOut,{recursive:true});
const used=new Set([...Object.values(pages).join('').matchAll(/src="assets\/([^"]+)"/g)].map(m=>m[1]));
used.add('D3-LICENSE.txt');
for(const f of fs.readdirSync(assetOut))if(!used.has(f))fs.unlinkSync(path.join(assetOut,f));
for(const f of used)fs.copyFileSync(path.join(root,['d3-7.9.0.min.js','D3-LICENSE.txt'].includes(f)?'public/vendor':'public/assets',f),path.join(assetOut,f));
fs.mkdirSync(path.join(out,'fonts'),{recursive:true});for(const f of ['Bangers-Regular.ttf','LibreBaskerville-Regular.ttf','OFL-Bangers.txt','OFL-LibreBaskerville.txt'])fs.copyFileSync(path.join(root,'public/fonts',f),path.join(out,'fonts',f));
for(const f of ['styles.css','landing.css','landing.js','downloads.css','characters.css','characters.js','map.css','map-landmarks.js','books.css','reader.js','site-nav.js','story-map.js','vault.css','vault-gallery.js'])fs.copyFileSync(path.join(root,f),path.join(out,f));
for(const file of vault.items.flatMap(item=>[item.original,...item.previews.map(p=>p.file)])){
 const target=path.join(out,file);fs.mkdirSync(path.dirname(target),{recursive:true});fs.copyFileSync(path.join(root,'public',file),target);
}
fs.copyFileSync(path.join(root,'content/vault/1990Vault.md'),path.join(out,'vault/1990/1990Vault.md'));
for(const name of ['favicon.svg','favicon-32.png','apple-touch-icon.png'])fs.copyFileSync(path.join(root,'public',name),path.join(out,name));
const stylesheetVersions=Object.fromEntries(['styles.css','vault.css','landing.css','downloads.css','characters.css','map.css','books.css'].map(file=>[file,crypto.createHash('sha256').update(fs.readFileSync(path.join(root,file))).digest('hex').slice(0,12)]));
for(const [file,html] of Object.entries(pages)){
 const versioned=html.replace(/href="(styles\.css|vault\.css|landing\.css|downloads\.css|characters\.css|map\.css|books\.css)"/g,(_,stylesheet)=>`href="${stylesheet}?v=${stylesheetVersions[stylesheet]}"`);
 fs.writeFileSync(path.join(out,file),seo.render(file,versioned));
}
fs.writeFileSync(path.join(out,'robots.txt'),`User-agent: *\nAllow: /\n\nSitemap: ${seo.siteUrl}/sitemap.xml\n`);
fs.writeFileSync(path.join(out,'sitemap.xml'),seo.sitemap(Object.keys(pages)));
const cname=path.join(out,'CNAME'),host=new URL(seo.siteUrl).hostname;
if(!host.endsWith('.github.io'))fs.writeFileSync(cname,host+'\n');
else if(fs.existsSync(cname))fs.unlinkSync(cname);
fs.writeFileSync(path.join(out,'.nojekyll'),'');
console.log(`Built ${Object.keys(pages).length} public pages; Chapter 1 previews only, with approved Book One samples.`);


