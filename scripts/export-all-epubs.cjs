const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process');
const root=path.resolve(__dirname,'..'),python=process.env.PDF_PYTHON||'python';
const booksRoot=path.join(root,'content/books');
const books=fs.readdirSync(booksRoot,{withFileTypes:true}).filter(d=>d.isDirectory()).map(d=>{
 const book=JSON.parse(fs.readFileSync(path.join(booksRoot,d.name,'book.json'),'utf8'));
 if(book.id!==d.name)throw Error('Book ID must match directory: '+d.name);
 const available=book.chapters.filter(file=>JSON.parse(fs.readFileSync(path.join(booksRoot,d.name,file),'utf8')).available);
 return {...book,available};
}).filter(b=>b.id==='origins'||b.available.length).sort((a,b)=>a.number-b.number);
const reports=[];
for(const book of books){
 cp.execFileSync(python,['scripts/export-epub.py','--book',book.id],{cwd:root,stdio:'inherit'});
 const report=JSON.parse(fs.readFileSync(path.join(root,'tmp',book.id==='origins'?'epub':'epub-'+book.id,'quality-report.json'),'utf8'));
 reports.push(report);
}
// Downloadable samples are a Book One feature, regardless of future book metadata.
cp.execFileSync(python,['scripts/export-epub.py','--book','origins','--sample'],{cwd:root,stdio:'inherit'});
fs.mkdirSync(path.join(root,'output/publishing'),{recursive:true});
fs.writeFileSync(path.join(root,'output/publishing/epub-builds.json'),JSON.stringify({books:reports},null,2)+'\n');
console.log(`Built full EPUBs for ${reports.length} books; only Book One has a downloadable sample.`);
