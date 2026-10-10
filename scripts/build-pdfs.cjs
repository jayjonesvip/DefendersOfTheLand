const fs=require('node:fs'),path=require('node:path'),cp=require('node:child_process');
const root=path.resolve(__dirname,'..'),python=process.env.PDF_PYTHON||'python';
function run(command,args){cp.execFileSync(command,args,{cwd:root,stdio:'inherit'});}
fs.mkdirSync(path.join(root,'dist/books'),{recursive:true});
run(process.execPath,['scripts/export-illustrated.cjs']);
run(python,['scripts/export-text.py']);
run(python,['scripts/finalize-pdfs.py']);
