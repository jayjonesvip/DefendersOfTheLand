const assert=require('node:assert/strict'),crypto=require('node:crypto');
const base=(process.argv[2]||'https://jayjonesvip.github.io/DefendersOfTheLand').replace(/\/$/,'');
async function get(file){const response=await fetch(`${base}/${file}`);assert.equal(response.status,200,`${file}: HTTP ${response.status}`);return response}
(async()=>{
 const manifest=await(await get('books/downloads.json')).json();assert.equal(manifest.samples.length,2);assert.equal(manifest.sampleEpub.chapters,3);assert(!manifest.full&&!manifest.ebooks&&!manifest.print);
 for(const file of ['index.html','books.html','book-two.html','book-two-chapter-1.html','book-two-chapter-2.html','book-two-chapter-3.html','book-two-chapter-4.html','book-two-chapter-5.html','book-two-chapter-6.html','origins.html','downloads.html','map.html',...manifest.chapters.map(c=>`origins-chapter-${c.number}.html`)]){
  const html=await(await get(file)).text();assert(html.includes('Defenders of the Land'),file);assert(!html.includes('http://127.0.0.1'),file);assert(!html.includes('Download chapter PDF'),file);
 }
 for(const asset of ['story-map.js','assets/d3-7.9.0.min.js','assets/book-two-chapter-01-tutoring-graduation.webp','assets/book-two-chapter-02-jenny-practice-face-v2.webp','assets/book-two-chapter-02-seth-practice-face-v2.webp','assets/book-two-chapter-03-rooftop-talk-face-v2.webp','assets/book-two-chapter-03-seth-success-face-v2.webp','assets/book-two-chapter-03-jenny-success-face-v2.webp','assets/book-two-chapter-04-jenny-award.webp','assets/book-two-chapter-05-larry-advice.webp','assets/book-two-chapter-05-reporting-rounds.webp','assets/book-two-chapter-05-new-shoes.webp','assets/book-two-chapter-06-perch-farewell.webp','assets/book-two-chapter-06-lake-superior-sunset.webp'])await get(asset);
 for(const sample of manifest.samples){const response=await get(`books/${sample.file}`);const bytes=Buffer.from(await response.arrayBuffer());assert.equal(bytes.length,sample.bytes);assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),sample.sha256,sample.file)}
 const removed=['defenders-of-the-land-origins-illustrated.pdf','defenders-of-the-land-origins-text.pdf','defenders-of-the-land-origins.epub','origins-kdp-interior.pdf','origins-kdp-cover.pdf','origins-front-cover.pdf','origins-back-cover.pdf','origins-ebook-cover.jpg',...Array.from({length:18},(_,i)=>`origins-chapter-${String(i+1).padStart(2,'0')}.pdf`)];
 await Promise.all(removed.map(async file=>{const response=await fetch(`${base}/books/${file}`);assert.equal(response.status,404,`Removed download still available: ${file}`)}));
 console.log(`PASS: all 18 Book One chapters, Book Two Chapters 1–6 and art, two combined samples, and 26 removed download URLs at ${base}`);
})().catch(e=>{console.error(e);process.exitCode=1});
