const cp=require('node:child_process'),path=require('node:path');
cp.execFileSync(process.execPath,['scripts/export-all-epubs.cjs'],{cwd:path.resolve(__dirname,'..'),stdio:'inherit'});
cp.execFileSync(process.env.PDF_PYTHON||'python',['scripts/publish-samples.py'],{cwd:path.resolve(__dirname,'..'),stdio:'inherit'});
