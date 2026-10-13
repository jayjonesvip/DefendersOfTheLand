const {URL}=require('node:url');

function createSeo({site,book,chapters,additionalBooks,cover,manifest,escape}){
 const base=new URL(process.env.SITE_URL||site.url);
 if(base.protocol!=='https:'||base.search||base.hash)throw Error('SITE_URL must be an HTTPS site address without a query or fragment');
 const siteUrl=base.href.replace(/\/$/,'');
 const pageUrl=file=>file==='index.html'?siteUrl+'/':siteUrl+'/'+file;
 const artwork=site.coverImage||cover.frontArtwork;
 const imageFile=manifest[artwork]?.file||artwork;
 const imageUrl=pageUrl('assets/'+imageFile);
 const author={'@type':'Person','@id':siteUrl+'/#author',name:site.author};
 const website={'@type':'WebSite','@id':siteUrl+'/#website',url:pageUrl('index.html'),name:site.name,description:site.description,inLanguage:'en',creator:{'@id':author['@id']}};
 const bookName=b=>b.number===1?site.paperback.title:`${site.name}: Book ${b.number}`;
 const bookNode=b=>({'@type':'Book','@id':siteUrl+`/#${b.id}`,name:bookName(b),url:pageUrl(b.id+'.html'),author:{'@id':author['@id']},inLanguage:'en',genre:['Superhero fiction','Science fiction','Action and adventure'],description:b.number===1?site.description:b.description,...(b.number===1?{image:imageUrl,workExample:{'@id':siteUrl+'/#paperback'}}:b.cover?{image:pageUrl('assets/'+(manifest[b.cover]?.file||b.cover))}:{})});
 const paperback={'@type':'Book','@id':siteUrl+'/#paperback',name:site.paperback.title,url:site.paperback.url,author:{'@id':author['@id']},bookFormat:'https://schema.org/Paperback',inLanguage:'en',image:imageUrl,identifier:{'@type':'PropertyValue',propertyID:'ASIN',value:site.paperback.asin},exampleOfWork:{'@id':siteUrl+`/#${book.id}`},potentialAction:{'@type':'BuyAction',target:site.paperback.url}};
 const descriptions={
  'index.html':site.description,
  'paperback.html':`Buy ${site.paperback.title} by ${site.author} on Amazon. Explore the illustrated Cleveland superhero adventure and read a free sample.`,
  'origins.html':`Read all ${chapters.length} chapters of Defenders of the Land: Book One: Origins by Jay Jones. An illustrated superhero adventure set in Cleveland in 1987.`,
  'books.html':'Explore Defenders of the Land by Jay Jones: Book One: Origins in paperback and free online, plus the continuing illustrated adventures in Book Two.',
  'characters.html':'Meet the Cleveland superheroes and villains of Defenders of the Land by Jay Jones. Unlock character profiles as you read Book One: Origins.',
  'map.html':'Explore Cleveland landmarks from Defenders of the Land: Book One: Origins. Discover the illustrated superhero story’s connections to the city.',
  'downloads.html':'Download a free illustrated three-chapter PDF or EPUB sample of Defenders of the Land: Book One: Origins by Jay Jones, or buy the paperback on Amazon.',
  '404.html':'This page could not be found. Return to Defenders of the Land to read the illustrated Cleveland superhero adventures by Jay Jones.'
 };
 const titles={
  'index.html':'Defenders of the Land | Cleveland Superheroes by Jay Jones',
  'paperback.html':'Book One: Origins Paperback | Defenders of the Land',
  'origins.html':'Book One: Origins — Read All 18 Chapters | Defenders of the Land',
  'books.html':'Books by Jay Jones | Defenders of the Land',
  'characters.html':'Cleveland Superhero Characters | Defenders of the Land',
  'map.html':'Explore the Cleveland Story Map | Defenders of the Land',
  'downloads.html':'Free Book One PDF & EPUB Sample | Defenders of the Land',
  '404.html':'Page Not Found | Defenders of the Land'
 };
 const chapterPages=new Map();
 for(const b of [ {...book,entries:chapters},...additionalBooks]){
  if(b.number!==1){descriptions[b.id+'.html']=`Read the continuing Cleveland superhero adventures in ${site.name}: Book ${b.number} by ${site.author}. ${b.entries.length} illustrated chapters available.`;titles[b.id+'.html']=`Book ${b.number} — Read Online | ${site.name}`;}
  for(const c of b.entries){
   const file=`${b.id}-chapter-${c.number}.html`;
   chapterPages.set(file,{book:b,chapter:c});
   titles[file]=`${c.title} — Book ${b.number}, Chapter ${c.number} | ${site.name}`;
   descriptions[file]=`Read “${c.title},” Chapter ${c.number} of ${site.name}: ${b.number===1?'Book One: Origins':`Book ${b.number}`} by ${site.author}. An illustrated Cleveland superhero adventure.`;
  }
 }
 function render(file,html){
  if(!titles[file]||!descriptions[file])throw Error('Missing SEO metadata for '+file);
  const canonical=pageUrl(file),chapter=chapterPages.get(file);
  const activeBook=chapter?.book||additionalBooks.find(b=>file===b.id+'.html')||book;
  const previewArtwork=activeBook.number===1?artwork:(activeBook.cover||artwork);
  const previewImage=pageUrl('assets/'+(manifest[previewArtwork]?.file||previewArtwork));
  const previewSize=manifest[previewArtwork];
  const previewAlt=bookName(activeBook)+' cover';
  const page={'@type':file==='books.html'||file.endsWith('.html')&&['origins.html',...additionalBooks.map(b=>b.id+'.html')].includes(file)?'CollectionPage':'WebPage','@id':canonical+'#webpage',url:canonical,name:titles[file],description:descriptions[file],inLanguage:'en',isPartOf:{'@id':website['@id']}};
  const graph=[website,author,page];
  if(chapter){
   const c=chapter.chapter,b=chapter.book;
   graph.push(bookNode(b),{'@type':'Chapter','@id':canonical+'#chapter',name:c.title,position:c.number,url:canonical,isPartOf:{'@id':siteUrl+`/#${b.id}`},author:{'@id':author['@id']},inLanguage:'en',isAccessibleForFree:true});
   page.mainEntity={'@id':canonical+'#chapter'};
  }else if(['index.html','origins.html','paperback.html','downloads.html','books.html'].includes(file)){
   graph.push(bookNode(book),paperback);
   if(file==='books.html')graph.push(...additionalBooks.map(bookNode));
   page.mainEntity={'@id':file==='paperback.html'?paperback['@id']:siteUrl+`/#${book.id}`};
  }else{
   const b=additionalBooks.find(b=>file===b.id+'.html');if(b){graph.push(bookNode(b));page.mainEntity={'@id':siteUrl+`/#${b.id}`};}
  }
  const breadcrumbs=[{name:'Home',url:pageUrl('index.html')}];
  if(chapter)breadcrumbs.push({name:`Book ${chapter.book.number}${chapter.book.number===1?': Origins':''}`,url:pageUrl(chapter.book.id+'.html')});
  if(file!=='index.html')breadcrumbs.push({name:chapter?`Chapter ${chapter.chapter.number}: ${chapter.chapter.title}`:titles[file].split(' | ')[0],url:canonical});
  if(file!=='404.html')graph.push({'@type':'BreadcrumbList','@id':canonical+'#breadcrumbs',itemListElement:breadcrumbs.map((b,i)=>({'@type':'ListItem',position:i+1,name:b.name,item:b.url}))});
  const tags=[
   `<meta name="description" content="${escape(descriptions[file])}">`,
   `<meta name="author" content="${escape(site.author)}">`,
   `<link rel="icon" type="image/svg+xml" href="favicon.svg">`,
   `<meta name="robots" content="${file==='404.html'?'noindex, follow':'index, follow, max-image-preview:large'}">`,
   `<link rel="canonical" href="${escape(canonical)}">`,
   `<meta property="og:type" content="${chapter?'article':'website'}">`,
   `<meta property="og:site_name" content="${escape(site.name)}">`,
   `<meta property="og:locale" content="en_US">`,
   `<meta property="og:title" content="${escape(titles[file])}">`,
   `<meta property="og:description" content="${escape(descriptions[file])}">`,
   `<meta property="og:url" content="${escape(canonical)}">`,
   `<meta property="og:image" content="${escape(previewImage)}">`,
   ...(previewSize?[`<meta property="og:image:width" content="${previewSize.width}">`,`<meta property="og:image:height" content="${previewSize.height}">`]:[]),
   `<meta property="og:image:alt" content="${escape(previewAlt)}">`,
   `<meta name="twitter:card" content="summary_large_image">`,
   `<meta name="twitter:title" content="${escape(titles[file])}">`,
   `<meta name="twitter:description" content="${escape(descriptions[file])}">`,
   `<meta name="twitter:image" content="${escape(previewImage)}">`,
   `<meta name="twitter:image:alt" content="${escape(previewAlt)}">`,
   `<script type="application/ld+json">${JSON.stringify({'@context':'https://schema.org','@graph':graph}).replace(/</g,'\\u003c')}</script>`
  ].join('');
  return html.replace(/<title>.*?<\/title>/,`<title>${escape(titles[file])}</title>`).replace(/<meta name="description"[^>]*>/,'').replace('</head>',tags+'</head>');
 }
 function sitemap(files){return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${files.filter(f=>f!=='404.html').map(f=>`  <url><loc>${escape(pageUrl(f))}</loc></url>`).join('\n')}\n</urlset>\n`;}
 return {render,sitemap,siteUrl,pageUrl};
}
module.exports={createSeo};
