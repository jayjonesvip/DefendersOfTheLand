const fs=require('node:fs'),assert=require('node:assert/strict'),path=require('node:path');
const root=path.resolve(__dirname,'..'),out=path.join(root,'dist'),config=require('../content/website-seo.json'),site=require('../content/site.json');
const decode=s=>s.replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&lt;/g,'<').replace(/&gt;/g,'>');
const get=(html,name)=>{const match=html.match(new RegExp(`<meta (?:name|property)="${name}" content="([^"]*)">`));assert(match,`Missing ${name}`);return decode(match[1]);};
config.pages={...config.pages,...require('../flaming-head-origin.cjs').metadata,...require('../why-so-evil.cjs').metadata,...require('../loaded-glove.cjs').metadata,...require('../sticky-situation.cjs').metadata,...require('../super-perch.cjs').metadata};
const titles=[],descriptions=[],url=page=>site.url+(page==='index.html'?'/':'/'+page);
for(const [file,metadata]of Object.entries(config.pages)){
 const html=fs.readFileSync(path.join(out,file),'utf8'),title=decode(html.match(/<title>(.*?)<\/title>/)[1]),description=get(html,'description');
 assert.equal(title,metadata.title);assert(title.length<60);assert.equal(description,metadata.description);assert(description.length>=150&&description.length<=160);titles.push(title);descriptions.push(description);
 assert.equal((html.match(/rel="canonical"/g)||[]).length,1);assert(html.includes(`rel="canonical" href="${url(file)}"`));assert.equal(get(html,'og:url'),url(file));
 for(const prefix of ['og','twitter']){assert.equal(get(html,prefix+':title'),title);assert.equal(get(html,prefix+':description'),description);}
 const graph=JSON.parse(html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)[1])['@graph'];
 assert.equal(new Set(graph.map(n=>n['@id'])).size,graph.length,'Duplicate entity IDs');
 assert(!graph.some(n=>n.aggregateRating||n.review||n.reviewCount));assert(!/\[ISBN\]|\[DATE PUBLISHED\]/.test(JSON.stringify(graph)));
 for(const edition of graph.filter(n=>n['@type']==='Book'&&n.bookFormat)){
  const id=edition.exampleOfWork['@id'].split('#')[1];
  if(edition.bookFormat.endsWith('/Paperback')&&(file==='paperback.html'||['origins.html','book-two.html','book-three.html','book-four.html'].includes(file))){const actual=config.paperbacks[id];assert.equal(edition.isbn,actual.isbn);assert.equal(edition.datePublished,actual.datePublished);let checksum=0;for(let i=0;i<12;i++)checksum+=Number(edition.isbn[i])*(i%2?3:1);assert.equal((10-checksum%10)%10,Number(edition.isbn[12]));}
  else{assert(!edition.isbn&&!edition.datePublished,'Only mark publication facts on pages where those facts are visible');}
  assert(/^https:\/\/www.amazon.com\/dp\//.test(edition.url));
 }
 const image=get(html,'og:image');assert.equal(image,get(html,'twitter:image'));assert(fs.existsSync(path.join(out,new URL(image).pathname)));
 if(file==='flaming-head-origin.html'){const share=require('../flaming-head-origin.cjs').socialImage;assert(image.endsWith('/assets/'+share.file));assert.equal(get(html,'og:image:width'),'1200');assert.equal(get(html,'og:image:height'),'630');assert.equal(get(html,'og:image:type'),'image/jpeg');assert.equal(get(html,'og:image:alt'),share.alt);assert.equal(get(html,'twitter:image:alt'),share.alt);}
 if(['web-comics.html','index.html','books.html','characters.html','map.html','paperback.html','author.html','downloads.html'].includes(file)){assert(image.endsWith(config.socialImage.file));assert.equal(get(html,'og:image:width'),'1200');assert.equal(get(html,'og:image:height'),'630');}
 if(file==='why-so-evil.html'){const share=require('../why-so-evil.cjs').socialImage;assert(image.endsWith('/assets/'+share.file));assert.equal(get(html,'og:image:width'),'1200');assert.equal(get(html,'og:image:height'),'630');assert.equal(get(html,'og:image:type'),'image/jpeg');assert.equal(get(html,'og:image:alt'),share.alt);assert.equal(get(html,'twitter:image:alt'),share.alt);assert.equal(graph.find(node=>node['@type']==='ComicStory').name,'WHY SO EVIL?');}
 if(file==='loaded-glove.html'){const comic=require('../loaded-glove.cjs');assert(image.endsWith('/assets/'+comic.socialImage.file));assert.equal(get(html,'og:image:width'),'1200');assert.equal(get(html,'og:image:height'),'630');assert.equal(get(html,'og:image:type'),'image/jpeg');assert.equal(get(html,'og:image:alt'),comic.socialImage.alt);assert.equal(get(html,'twitter:image:alt'),comic.socialImage.alt);assert.equal(graph.find(node=>node['@type']==='ComicStory').name,comic.title);}
 if(file==='sticky-situation.html'){const c=require('../sticky-situation.cjs');assert(image.endsWith('/assets/'+c.socialImage.file));assert.equal(get(html,'og:image:width'),'1200');assert.equal(get(html,'og:image:height'),'630');assert.equal(get(html,'og:image:type'),'image/jpeg');assert.equal(get(html,'og:image:alt'),c.socialImage.alt);assert.equal(get(html,'twitter:image:alt'),c.socialImage.alt);assert.equal(graph.find(n=>n['@type']==='ComicStory').name,c.title);}
 if(file==='super-perch.html'){const c=require('../super-perch.cjs');assert(image.endsWith('/assets/'+c.socialImage.file));assert.equal(get(html,'og:image:width'),'1200');assert.equal(get(html,'og:image:height'),'630');assert.equal(get(html,'og:image:type'),'image/jpeg');assert.equal(get(html,'og:image:alt'),c.socialImage.alt);assert.equal(get(html,'twitter:image:alt'),c.socialImage.alt);assert.equal(graph.find(n=>n['@type']==='ComicStory').name,c.title);}
 if(file==='author.html')assert.equal(get(html,'twitter:card'),'summary_large_image');
 if(['origins.html','book-two.html','book-three.html','book-four.html'].includes(file)){const id=file.slice(0,-5);assert(html.includes(config.paperbacks[id].isbn));assert(html.includes(`datetime="${config.paperbacks[id].datePublished}"`));assert.equal(graph.filter(n=>n.bookFormat).length,2);}
 if(file==='index.html'){assert.equal(graph.find(n=>n['@type']==='BookSeries').hasPart.length,4);assert.equal(graph.filter(n=>n.bookFormat).length,8);}
}
assert.equal(new Set(titles).size,Object.keys(config.pages).length);assert.equal(new Set(descriptions).size,Object.keys(config.pages).length);
const sitemap=fs.readFileSync(path.join(out,'sitemap.xml'),'utf8'),entries=[...sitemap.matchAll(/<url><loc>(.*?)<\/loc><lastmod>(.*?)<\/lastmod><\/url>/g)];assert.equal(entries.length,Object.keys(config.pages).length);for(const [,loc,date]of entries){const file=loc===site.url+'/'?'index.html':new URL(loc).pathname.slice(1);assert.equal(date,config.pages[file].lastModified);assert(/^\d{4}-\d{2}-\d{2}$/.test(date));assert(!loc.includes('404.html')&&!loc.endsWith('/index.html'));}
assert(fs.readFileSync(path.join(out,'robots.txt'),'utf8').includes('Sitemap: '+site.url+'/sitemap.xml'));
console.log('PASS: 22 unique optimized heads, canonicals, social assets, four works/eight editions, validated paperback ISBNs/dates, no Kindle identifier guessing, visible edition details and truthful sitemap dates.');
