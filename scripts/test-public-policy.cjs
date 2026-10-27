const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const {checkSource}=require('./public-policy.cjs'),root=path.resolve(__dirname,'..');
function fixture(t){const dir=fs.mkdtempSync(path.join(os.tmpdir(),'defenders-public-'));t.after(()=>fs.rmSync(dir,{recursive:true,force:true}));for(const name of ['content','public','image-manifest.json','public-preview-inventory.json','website-originals.json'])fs.cpSync(path.join(root,name),path.join(dir,name),{recursive:true});return dir;}
test('approved private export passes the public source boundary',()=>checkSource(root));
test('later chapter source is rejected',t=>{const dir=fixture(t);fs.writeFileSync(path.join(dir,'content/books/book-four/chapter-02.json'),'{}');assert.throws(()=>checkSource(dir),/Unapproved website source/);});
test('KDP production directories are rejected',t=>{const dir=fixture(t);fs.mkdirSync(path.join(dir,'print'));assert.throws(()=>checkSource(dir),/Private book production material/);});
test('extra complete ebook is rejected',t=>{const dir=fixture(t);fs.writeFileSync(path.join(dir,'public/books/complete-book.epub'),'test');assert.throws(()=>checkSource(dir),/Unapproved website source/);});
test('changed preview bytes are rejected',t=>{const dir=fixture(t);fs.appendFileSync(path.join(dir,'content/books/book-four/chapter-01.json'),' ');assert.throws(()=>checkSource(dir),/Preview differs from private export/);});
test('changed website-exclusive comic bytes are rejected',t=>{const dir=fixture(t);fs.appendFileSync(path.join(dir,'public/assets/flaming-head-origin-comic-v1.webp'),' ');assert.throws(()=>checkSource(dir),/Preview differs from private export/);});

test('rebuild removes obsolete chapter pages and private artifacts from deploy output',()=>{
 const cp=require('node:child_process');
 for(const name of ['book-four-chapter-12.html','assets/obsolete-private-art.webp','books/book-four-kdp-interior.pdf']){const file=path.join(root,'dist',name);fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,'obsolete output sentinel');}
 cp.execFileSync(process.execPath,['build.cjs'],{cwd:root,stdio:'pipe'});
 for(const name of ['book-four-chapter-12.html','assets/obsolete-private-art.webp','books/book-four-kdp-interior.pdf'])assert(!fs.existsSync(path.join(root,'dist',name)));
});
