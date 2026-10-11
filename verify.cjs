const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const out=path.join(__dirname,'dist');let links=0;
for(const f of fs.readdirSync(out).filter(x=>x.endsWith('.html'))){const html=fs.readFileSync(path.join(out,f),'utf8');assert.equal((html.match(/<h1[ >]/g)||[]).length,1,f+' must have one h1');for(const m of html.matchAll(/(?:href|src)="([^"#]+)"/g)){const ref=m[1].split('#')[0];if(/^(https?:|data:)/.test(ref))continue;assert(fs.existsSync(path.join(out,ref)),`${f}: missing ${ref}`);links++}assert(!html.includes('Blackwell_Family_Character_Files'));assert(!html.includes('PROJECT BLACKOUT BANSHEE'));}
const publicDownloads=JSON.parse(fs.readFileSync(path.join(out,'books/downloads.json')));
assert.equal(publicDownloads.samples.length,2);assert.equal(publicDownloads.sampleEpub.chapters,3);
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
for(const pdf of [...downloads.full,...downloads.chapters,...downloads.covers,...downloads.print]){const bytes=fs.readFileSync(path.join(publishing,pdf.file));assert.equal(bytes.subarray(0,5).toString(),'%PDF-');assert.equal(bytes.length,pdf.bytes);assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),pdf.sha256);assert(pdf.pages>0);}
require('./verify-reader.cjs').check().then(()=>require('./verify-book-two.cjs').check()).then(()=>require('./verify-epub.cjs').check()).then(()=>console.log(`PASS: ${links} links/assets, two public samples and separate publishing files with matching checksums; full web reader, EPUB chapters, navigation and desktop/mobile layouts.`)).catch(e=>{console.error(e);process.exitCode=1});
