const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const ids=['origins','book-two','book-three','book-four'];
function files(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?files(path.join(dir,e.name)):[path.join(dir,e.name)]);}
function checkSource(root){
 for(const name of ['print','publishing','requirements.txt','docs/art','docs/editorial'])assert(!fs.existsSync(path.join(root,name)),`Private book production material in website repository: ${name}`);
 const inventory=JSON.parse(fs.readFileSync(path.join(root,'public-preview-inventory.json'),'utf8'));
 const originals=JSON.parse(fs.readFileSync(path.join(root,'website-originals.json'),'utf8'));
 for(const entry of originals.files)assert(/^public\/assets\/[a-z0-9-]+\.(?:webp|jpg)$/.test(entry.path),'Website originals must be approved WebP or JPEG marketing assets');
 const approvedFiles=[...inventory.files,...originals.files];
 const allowed=new Map(approvedFiles.map(f=>[f.path,f.sha256]));
 assert.equal(allowed.size,approvedFiles.length,'Duplicate preview or website-original inventory path');
 for(const [name,hash] of allowed){
  assert(!path.isAbsolute(name)&&!name.split(/[\\/]/).includes('..'),'Unsafe preview path');
  assert(name.startsWith('content/')||name.startsWith('public/')||name==='image-manifest.json','Unapproved preview path');
  const data=fs.readFileSync(path.join(root,name));
  assert.equal(crypto.createHash('sha256').update(data).digest('hex'),hash,`Preview differs from private export: ${name}`);
 }
 for(const folder of ['content','public'])for(const file of files(path.join(root,folder))){
  const name=path.relative(root,file).split(path.sep).join('/');
  assert(allowed.has(name),`Unapproved website source: ${name}`);
 }
 assert.deepEqual(fs.readdirSync(path.join(root,'content/books')).sort(),[...ids].sort());
 for(const id of ids){
  const dir=path.join(root,'content/books',id);
  assert.deepEqual(fs.readdirSync(dir).sort(),['book.json','chapter-01.json'],`Only Chapter 1 may be public: ${id}`);
  const book=JSON.parse(fs.readFileSync(path.join(dir,'book.json'))),chapter=JSON.parse(fs.readFileSync(path.join(dir,'chapter-01.json')));
  assert.deepEqual(book.chapters,['chapter-01.json']);assert.equal(chapter.number,1);assert.equal(chapter.available,true);
  assert(/^https:\/\/(www\.)?amazon\.com\//.test(book.amazonUrl),`Missing Amazon continuation: ${id}`);
 }
 const downloads=JSON.parse(fs.readFileSync(path.join(root,'public/books/downloads.json')));
 assert.deepEqual(fs.readdirSync(path.join(root,'public/books')).sort(),['downloads.json','origins-sample-chapters-01-03.epub','origins-sample-chapters-01-03.pdf']);
 assert.equal(downloads.samples.length,2);assert.equal(downloads.sampleEpub.chapters,3);
 assert(!downloads.full&&!downloads.ebooks&&!downloads.print&&!downloads.covers);
 for(const sample of downloads.samples){
  const bytes=fs.readFileSync(path.join(root,'public/books',sample.file));
  assert.equal(bytes.length,sample.bytes);assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),sample.sha256);
 }
 return inventory;
}
module.exports={checkSource,files,ids};
