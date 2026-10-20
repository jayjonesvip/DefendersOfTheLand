// Private illustrated PDFs; default Book Two review, or --book ID --paperback.
// Book One's locked exporter is independent.
const fs=require('node:fs'),path=require('node:path'),http=require('node:http'),cp=require('node:child_process');
const {chromium}=require('playwright');
const root=path.resolve(__dirname,'..'),read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const bookId=process.argv.includes('--book')?process.argv[process.argv.indexOf('--book')+1]:'book-two';
if(!/^book-[a-z]+$/.test(bookId))throw Error('Invalid book ID');
const paperback=process.argv.includes('--paperback');
const book=read(`content/books/${bookId}/book.json`),manifest=read('image-manifest.json');
const volume=`BOOK ${{2:'TWO',3:'THREE',4:'FOUR'}[book.number]||book.number}`;
const chapters=require('./available-chapters.cjs').availableChapters(book,f=>read(`content/books/${bookId}/`+f));
if(!chapters.length)throw Error('No available chapters for '+bookId);
const tmp=path.join(root,`tmp/${bookId}-pdf`);fs.mkdirSync(tmp,{recursive:true});
const esc=s=>String(s||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const expected=[],art=[];
const server=http.createServer((req,res)=>{try{const url=decodeURIComponent(req.url.split('?')[0]);const file=url==='/paged.js'?path.join(root,'node_modules/pagedjs/dist/paged.polyfill.js'):path.resolve(root,'.'+url);if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}res.setHeader('Content-Type',({'.js':'text/javascript','.ttf':'font/ttf','.webp':'image/webp','.png':'image/png'})[path.extname(file)]||'text/html');res.end(fs.readFileSync(file));}catch{res.writeHead(404).end();}});
(async()=>{let browser;try{
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const base=`http://127.0.0.1:${server.address().port}`;
 const image=(file,alt,cover=false)=>{const asset=manifest[file]?.file||file;art.push(asset);return `<figure${cover?' class="cover"':''}><img src="${base}/public/assets/${asset}" alt="${esc(alt)}"></figure>`;};
 const prose=text=>{if(!text)return '';expected.push(text);return `<p>${esc(text)}</p>`;};
 const reviewNotice=paperback?'':`<p>Illustrated review PDF · Unpublished</p>${book.status==='In progress'?`<p>Work in progress · ${chapters.length} ${chapters.length===1?'chapter':'chapters'} available</p>`:''}`;
 const body=`${paperback?'':`<section class="cover-page">${image(book.cover,book.title+' cover',true)}</section>`}<section class="front title"><h1>DEFENDERS<br>OF THE LAND</h1><h2>${esc(book.title)}</h2><p>${esc(book.author)}</p>${reviewNotice}</section>${paperback?`<section class="front copyright"><p>Copyright © 2026 ${esc(book.author)}. All rights reserved.</p><p>This is a work of fiction.</p></section>`:''}<section class="front contents"><h1>Contents</h1><ol>${chapters.map(c=>`<li><a href="#chapter-${c.number}">${c.number}. ${esc(c.title)}</a></li>`).join('')}</ol></section>`+chapters.map(c=>`<section class="chapter" id="chapter-${c.number}"><header data-chapter="${c.number}"><div>${volume} · CHAPTER ${c.number}</div><h1>${esc(c.title)}</h1></header>${c.blocks.map(b=>(b.art?image(b.art,b.alt):'')+(b.type==='heading'?`<h2>${esc(b.title)}</h2>`:'')+prose(b.text)).join('')}${prose(c.ending)}</section>`).join('');
 const html=`<!doctype html><html lang="en"><meta charset="utf-8"><title>${esc(book.title)} — illustrated PDF</title><style>
 @font-face{font-family:BookSerif;src:url('${base}/print/fonts/LibreBaskerville-Regular.ttf')}@font-face{font-family:BookDisplay;src:url('${base}/print/fonts/Bangers-Regular.ttf')}
 @page{size:6in 9in;margin:.65in .65in;@top-center{content:'DEFENDERS OF THE LAND · ${volume}';font-family:BookSerif;font-size:7pt;color:#666}@bottom-center{content:counter(page);font-family:BookSerif;font-size:9pt}}
 @page front{@top-center{content:none}@bottom-center{content:none}}@page cover{margin:0;@top-center{content:none}@bottom-center{content:none}}
 *{box-sizing:border-box}body{margin:0;font-family:BookSerif,serif;font-size:11pt;line-height:1.4;color:#202426}h1,h2{font-family:BookDisplay,sans-serif;font-weight:400;text-align:center}h1{font-size:28pt;line-height:1.1;margin:12pt 0 20pt}h2{font-size:19pt;margin:18pt 0 12pt}p{margin:0;text-indent:.18in;text-align:justify;break-inside:avoid;orphans:3;widows:3}.chapter{break-before:page}header{break-inside:avoid;text-align:center}header div{font-size:8pt;letter-spacing:.08em}figure{margin:16pt 0;break-inside:avoid;text-align:center}img{display:block;max-width:100%;max-height:6.6in;width:auto;height:auto;margin:auto}.cover-page{page:cover;break-after:page}.cover{width:6in;height:9in;margin:0}.cover img{width:6in;height:9in;max-height:9in;object-fit:contain}.front{page:front;break-after:page}.title{padding-top:1.4in;text-align:center}.title h1{font-size:44pt}.title p{text-align:center;text-indent:0;margin-top:30pt;font-size:10pt}.contents ol{list-style:none;padding:0}.contents li{font-size:10pt;line-height:1.5;margin-bottom:6pt}.contents a{color:inherit;text-decoration:none}@media print{.pagedjs_page{margin:0!important;box-shadow:none}}
 ${paperback?'.contents a::after{content:target-counter(attr(href),page);float:right}':''}
 </style><script>window.PagedConfig={auto:false};</script><body><div id="source">${body}</div><script src="${base}/paged.js"></script></body></html>`;
 fs.writeFileSync(path.join(tmp,'source.html'),html);fs.writeFileSync(path.join(tmp,'expected.json'),JSON.stringify(expected));
 browser=await chromium.launch({headless:true,...(process.env.BOOK_CHROMIUM?{executablePath:process.env.BOOK_CHROMIUM}:{})});const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.emulateMedia({media:'print'});await page.goto(base+'/print/runtime.html');await page.setContent(html,{waitUntil:'load'});
 await page.evaluate(async()=>{await document.fonts.ready;for(const img of document.images)await img.decode();await new Paged.Previewer().preview(document.getElementById('source').innerHTML,undefined,document.body);document.getElementById('source').remove();});
 const layout=await page.evaluate(()=>({pages:document.querySelectorAll('.pagedjs_page').length,chapters:[...document.querySelectorAll('[data-chapter]')].map(e=>({number:Number(e.dataset.chapter),page:Number(e.closest('.pagedjs_page').dataset.pageNumber)})),images:[...document.querySelectorAll('.pagedjs_page img')].map(i=>({width:i.naturalWidth,height:i.naturalHeight}))}));
 if(errors.length||layout.chapters.length!==chapters.length||layout.images.length!==art.length||layout.images.some(i=>!i.width))throw Error('PDF layout/resource failure: '+errors.join('; '));
 layout.paperback=paperback;layout.bookId=bookId;
 layout.chapters.forEach((c,i)=>{if(c.number!==chapters[i].number)throw Error('PDF chapter order changed');c.title=chapters[i].title;});
 fs.writeFileSync(path.join(tmp,'layout.json'),JSON.stringify(layout));await page.pdf({path:path.join(tmp,'raw.pdf'),printBackground:true,preferCSSPageSize:true,displayHeaderFooter:false});
 }finally{await browser?.close();await new Promise(r=>server.close(r));}
 cp.execFileSync(process.env.PDF_PYTHON||'python',['scripts/validate-book-two-pdf.py','--book',bookId],{cwd:root,stdio:'inherit'});
})().catch(e=>{console.error(e);process.exitCode=1;});
