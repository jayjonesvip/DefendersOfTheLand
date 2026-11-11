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
 assert.deepEqual(fs.readdirSync(path.join(root,'content/books')).sort(),[...ids,'book-five','book-six'].sort());
 for(const id of ids){
  const dir=path.join(root,'content/books',id);
  assert.deepEqual(fs.readdirSync(dir).sort(),['book.json','chapter-01.json'],`Only Chapter 1 may be public: ${id}`);
  const book=JSON.parse(fs.readFileSync(path.join(dir,'book.json'))),chapter=JSON.parse(fs.readFileSync(path.join(dir,'chapter-01.json')));
  assert.deepEqual(book.chapters,['chapter-01.json']);assert.equal(chapter.number,1);assert.equal(chapter.available,true);
  assert(/^https:\/\/(www\.)?amazon\.com\//.test(book.amazonUrl),`Missing Amazon continuation: ${id}`);
 }
 assert.deepEqual(fs.readdirSync(path.join(root,'content/books/book-five')),['book.json']);
 const fifth=JSON.parse(fs.readFileSync(path.join(root,'content/books/book-five/book.json')));
 assert.deepEqual(fifth.chapters,[]);
 assert.equal(fifth.amazonUrl,'https://www.amazon.com/dp/B0HQFT91NJ');
 assert.deepEqual(fs.readdirSync(path.join(root,'content/books/book-six')),['book.json']);
 const sixth=JSON.parse(fs.readFileSync(path.join(root,'content/books/book-six/book.json')));
 assert.deepEqual(sixth.chapters,[]);assert.equal(sixth.amazonUrl,'https://www.amazon.com/dp/B0HR6DZ716');
 assert(!fs.existsSync(path.join(root,'public/books')),'Book downloads must not be served; use Amazon sample links');
 const activities=JSON.parse(fs.readFileSync(path.join(root,'content/activities.json')));
 const downloads=new Set([...activities.sheets.map(s=>'public/'+s.pdf),...activities.puzzles.flatMap(p=>[p.pdf,p.answer,p.combined].map(f=>'public/'+f)),'public/'+activities.archive,'public/'+activities.allArchive]);
 assert.equal(activities.sheets.length,7);assert.equal(activities.puzzles.length,3);assert.equal(downloads.size,18);
 for(const name of downloads)assert(/^public\/activities\/[a-z0-9-]+\.(?:pdf|zip)$/.test(name)&&allowed.has(name),'Activity downloads must be explicitly approved');
 for(const file of files(path.join(root,'public'))){const name=path.relative(root,file).split(path.sep).join('/');if(/\.(?:pdf|epub|zip)$/i.test(file))assert(downloads.has(name),'Only explicitly approved activity PDFs and ZIP collections may be served');}
 return inventory;
}
module.exports={checkSource,files,ids};
