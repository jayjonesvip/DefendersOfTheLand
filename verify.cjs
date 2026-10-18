const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const out=path.join(__dirname,'dist');let links=0;
require('./verify-available-chapters.cjs');
require('./verify-seo.cjs').check();
for(const f of fs.readdirSync(out).filter(x=>x.endsWith('.html'))){const html=fs.readFileSync(path.join(out,f),'utf8');assert.equal((html.match(/<h1[ >]/g)||[]).length,1,f+' must have one h1');for(const m of html.matchAll(/(?:href|src)="([^"#]+)"/g)){const ref=m[1].split(/[?#]/)[0];if(/^(https?:|data:)/.test(ref))continue;assert(fs.existsSync(path.join(out,ref)),`${f}: missing ${ref}`);links++}assert(!html.includes('Blackwell_Family_Character_Files'));assert(!html.includes('PROJECT BLACKOUT BANSHEE'));}
const publicDownloads=JSON.parse(fs.readFileSync(path.join(out,'books/downloads.json')));
assert.equal(publicDownloads.samples.length,2);assert.equal(publicDownloads.sampleEpub.chapters,3);
assert.deepEqual(publicDownloads.samples.map(d=>d.file).sort(),['origins-sample-chapters-01-03.epub','origins-sample-chapters-01-03.pdf']);
assert.deepEqual(fs.readdirSync(path.join(out,'books')).sort(),['downloads.json',...publicDownloads.samples.map(d=>d.file)].sort());
for(const d of publicDownloads.samples){const bytes=fs.readFileSync(path.join(out,'books',d.file));assert.equal(bytes.length,d.bytes);assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),d.sha256);}
const publishing=path.join(__dirname,'output/publishing');
const downloads=JSON.parse(fs.readFileSync(path.join(publishing,'downloads.json')));
assert.equal(downloads.full.length,2);assert.equal(downloads.covers.length,3);assert.equal(downloads.print.length,1);assert.deepEqual(downloads.chapters.map(c=>c.number),Array.from({length:18},(_,i)=>i+1));
const cover=JSON.parse(fs.readFileSync(path.join(__dirname,'print/cover.json'))),factor={'standard-color-white':.002252,'premium-color-white':.002347}[cover.paper];assert.equal(downloads.paperback.paper,cover.paper);assert.equal(downloads.paperback.interiorPages,downloads.print[0].pages);assert.equal(downloads.print[0].pages%2,0);assert(Math.abs(downloads.paperback.spineInches-downloads.print[0].pages*factor)<1e-9);
assert(downloads.paperback.frontResolutionMeets300Dpi);assert(downloads.paperback.frontEffectiveDpi>=300);
assert.equal(downloads.ebooks.length,1);assert.equal(downloads.ebookCovers.length,1);assert.equal(downloads.epub.chapters,18);assert.equal(downloads.epub.layout,'reflowable');
for(const file of [...downloads.ebooks,...downloads.ebookCovers]){const bytes=fs.readFileSync(path.join(publishing,file.file));assert.equal(bytes.length,file.bytes);assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),file.sha256);}
assert.equal(fs.readFileSync(path.join(publishing,downloads.ebooks[0].file)).subarray(0,2).toString(),'PK');
const bookTwoPdf=JSON.parse(fs.readFileSync(path.join(publishing,'book-two-pdf-build.json')));
const bookTwoPdfBytes=fs.readFileSync(path.join(publishing,bookTwoPdf.file));
assert.equal(bookTwoPdfBytes.subarray(0,5).toString(),'%PDF-');assert.equal(bookTwoPdfBytes.length,bookTwoPdf.bytes);
assert.equal(crypto.createHash('sha256').update(bookTwoPdfBytes).digest('hex'),bookTwoPdf.sha256);
const availableBookTwo=require('./scripts/available-chapters.cjs').availableChapters(JSON.parse(fs.readFileSync(path.join(__dirname,'content/books/book-two/book.json'))),file=>JSON.parse(fs.readFileSync(path.join(__dirname,'content/books/book-two',file))));
assert.equal(bookTwoPdf.chapters,availableBookTwo.length);
assert.deepEqual(bookTwoPdf.chapterStarts.map(chapter=>chapter.number),availableBookTwo.map(chapter=>chapter.number));
assert(bookTwoPdf.pages>0);assert(bookTwoPdf.printLayoutIsProvisional);assert(!fs.existsSync(path.join(out,'books',bookTwoPdf.file)),'Full Book Two PDF stays private');
const epubBuilds=JSON.parse(fs.readFileSync(path.join(publishing,'epub-builds.json'))).books;
const expectedBooks=fs.readdirSync(path.join(__dirname,'content/books')).filter(id=>{
 const metadata=JSON.parse(fs.readFileSync(path.join(__dirname,'content/books',id,'book.json')));
 return id==='origins'||metadata.chapters.some(file=>JSON.parse(fs.readFileSync(path.join(__dirname,'content/books',id,file))).available);
});
assert.deepEqual(epubBuilds.map(b=>b.bookId).sort(),expectedBooks.sort());
for(const report of epubBuilds){
 const bytes=fs.readFileSync(path.join(publishing,report.file));assert.equal(bytes.subarray(0,2).toString(),'PK');assert.equal(bytes.length,report.bytes);assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),report.sha256);
 assert(!fs.existsSync(path.join(out,'books',report.file)),`Full EPUB exposed on website: ${report.file}`);
 if(report.bookId!=='origins'){
  const metadata=JSON.parse(fs.readFileSync(path.join(__dirname,'content/books',report.bookId,'book.json')));
  assert.equal(report.chapters,metadata.chapters.filter(file=>JSON.parse(fs.readFileSync(path.join(__dirname,'content/books',report.bookId,file))).available).length);
 }
}
for(const report of epubBuilds.filter(b=>fs.existsSync(path.join(__dirname,'print',b.bookId+'-cover.json')))){
 const config=JSON.parse(fs.readFileSync(path.join(__dirname,'print',report.bookId+'-cover.json')));
 const spec=JSON.parse(fs.readFileSync(path.join(publishing,report.bookId+'-print-specifications.json')));
 if(config.interiorPdf){
  const interior=JSON.parse(fs.readFileSync(path.join(publishing,report.bookId+'-pdf-build.json')));
  const bytes=fs.readFileSync(path.join(publishing,config.interiorPdf));
  assert.equal(interior.file,config.interiorPdf);assert(interior.paperbackInterior);assert.equal(interior.pages%2,0);assert(interior.pages>=72);
  assert.equal(interior.chapters,report.chapters);assert.equal(interior.interiorIllustrations,report.interiorIllustrations);
  assert.equal(spec.interiorPages,interior.pages);assert.equal(spec.interiorFile,interior.file);
  assert.equal(bytes.length,interior.bytes);assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),interior.sha256);
  assert.equal(spec.interiorSha256,interior.sha256);assert(!fs.existsSync(path.join(out,'books',interior.file)));
 }else assert.equal(spec.interiorPages,config.interiorPageCount);
 assert.equal(spec.provisional,config.pageCountIsProvisional);
 assert(Math.abs(spec.spineInches-spec.interiorPages*.002252)<1e-9);assert(spec.printFrontEffectiveDpi>=300);assert.deepEqual(spec.barcodeBoxInches,[2,1.2]);
 const bytes=fs.readFileSync(path.join(publishing,report.bookId+'-kdp-cover.pdf'));
 assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),spec.sha256);
 for(const file of spec.files)assert(!fs.existsSync(path.join(out,'books',file)),`Publishing cover exposed on website: ${file}`);
 assert(report.coverIncluded,'Configured cover must be in the EPUB');
}
for(const pdf of [...downloads.full,...downloads.chapters,...downloads.covers,...downloads.print]){const bytes=fs.readFileSync(path.join(publishing,pdf.file));assert.equal(bytes.subarray(0,5).toString(),'%PDF-');assert.equal(bytes.length,pdf.bytes);assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),pdf.sha256);assert(pdf.pages>0);}
require('./verify-hosted-local.cjs').check().then(()=>require('./verify-vault.cjs').check()).then(()=>require('./verify-reader.cjs').check()).then(()=>require('./verify-book-two.cjs').check()).then(()=>require('./verify-epub.cjs').check()).then(()=>console.log(`PASS: ${links} links/assets, two public samples and separate publishing files with matching checksums; full web reader, EPUB chapters, navigation and desktop/mobile layouts.`)).catch(e=>{console.error(e);process.exitCode=1});
