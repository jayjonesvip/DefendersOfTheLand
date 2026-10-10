const assert=require('node:assert/strict'),crypto=require('node:crypto');
const base=(process.argv[2]||'https://jayjonesvip.github.io/DefendersOfTheLand').replace(/\/$/,'');
async function get(file){const response=await fetch(`${base}/${file}`);assert.equal(response.status,200,`${file}: HTTP ${response.status}`);return response}
(async()=>{
 const manifest=await(await get('books/downloads.json')).json();
 for(const file of ['index.html','origins.html','downloads.html',...manifest.chapters.map(c=>`origins-chapter-${c.number}.html`)]){
  const html=await(await get(file)).text();assert(html.includes('Defenders of the Land'),file);assert(!html.includes('http://127.0.0.1'),file);
 }
 const pdfs=[...manifest.full,...manifest.chapters,...manifest.covers,...manifest.print];assert.equal(pdfs.length,24);
 // Check downloaded bytes rather than relying on successful HEAD responses.
 for(const pdf of pdfs){const response=await get(`books/${pdf.file}`);assert(response.headers.get('content-type').includes('application/pdf'));const bytes=Buffer.from(await response.arrayBuffer());assert.equal(bytes.subarray(0,5).toString(),'%PDF-');assert.equal(bytes.length,pdf.bytes);assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),pdf.sha256,pdf.file)}
 for(const file of [...manifest.ebooks,...manifest.ebookCovers]){const response=await get(`books/${file.file}`);const bytes=Buffer.from(await response.arrayBuffer());assert.equal(bytes.length,file.bytes);assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),file.sha256,file.file)}
 console.log(`PASS: hosted reader, 18 chapters, all 24 PDFs, EPUB and Kindle cover at ${base}`);
})().catch(e=>{console.error(e);process.exitCode=1});
