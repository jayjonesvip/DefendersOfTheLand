const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),http=require('node:http'),{spawn}=require('node:child_process');
async function check(){
 const dist=path.join(__dirname,'dist'),requested=new Set();let blocked;
 const server=http.createServer((req,res)=>{
  const resource=decodeURIComponent(req.url.split('?')[0]).replace(/^\/reader\//,'');
  requested.add(resource);
  const file=path.resolve(dist,resource);
  if(!file.startsWith(dist+path.sep)||resource===blocked){res.writeHead(404).end();return;}
  try{res.end(fs.readFileSync(file));}catch{res.writeHead(404).end();}
 });
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const base=`http://127.0.0.1:${server.address().port}/reader`;
 const verify=()=>new Promise((resolve,reject)=>{
  const child=spawn(process.execPath,['scripts/verify-hosted.cjs',base],{cwd:__dirname});let output='';
  child.stdout.on('data',data=>output+=data);child.stderr.on('data',data=>output+=data);
  child.on('error',reject);child.on('close',code=>resolve({code,output}));
 });
 try{
  let result=await verify();assert.equal(result.code,0,result.output);
  const gallery=JSON.parse(fs.readFileSync(path.join(__dirname,'content/vault/gallery.json')));
  for(const item of gallery)for(const image of item.previews)assert(requested.has(image.file),`Responsive candidate not verified: ${image.file}`);
  const html=fs.readFileSync(path.join(dist,'book-two-chapter-2.html'),'utf8');
  blocked=html.match(/src="(assets\/[^"]+)"/)[1];
  result=await verify();assert.notEqual(result.code,0,'Missing current artwork must fail hosted verification');
  assert(result.output.includes(`${blocked}: HTTP 404`),result.output);
  const fallback=gallery[0].previews.find(image=>image.width===432).file;
  blocked=gallery[0].previews.find(image=>image.width===864).file;
  assert.equal((await fetch(`${base}/${fallback}`)).status,200,'Responsive fallback remains available');
  result=await verify();assert.notEqual(result.code,0,'Missing srcset-only artwork must fail hosted verification');
  assert(result.output.includes(`${blocked}: HTTP 404`),result.output);
  console.log('PASS: hosted verification checks generated assets under a site prefix and rejects missing src and srcset-only artwork.');
 }finally{await new Promise(resolve=>server.close(resolve));}
}
module.exports={check};
if(require.main===module)check().catch(error=>{console.error(error);process.exitCode=1;});
