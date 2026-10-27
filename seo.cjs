const {URL}=require('node:url');
function createSeo({site,book,chapters,additionalBooks,cover,manifest,archiveItems,websiteSeo,escape}){
 const base=new URL(process.env.SITE_URL||site.url);
 if(base.protocol!=='https:'||base.search||base.hash)throw Error('SITE_URL must be an HTTPS site address without a query or fragment');
 const siteUrl=base.href.replace(/\/$/,''),pageUrl=file=>file==='index.html'?siteUrl+'/':siteUrl+'/'+file;
 const allBooks=[{...book,entries:chapters},...additionalBooks];
 const image=b=>pageUrl('assets/'+(manifest[b.cover]?.file||b.cover));
 const author={'@type':'Person','@id':siteUrl+'/#author',name:site.author,url:pageUrl('author.html'),image:pageUrl('assets/jay-jones-author.jpg'),sameAs:[site.amazonAuthorUrl]};
 const website={'@type':'WebSite','@id':siteUrl+'/#website',url:pageUrl('index.html'),name:site.name,description:site.description,inLanguage:'en',creator:{'@id':author['@id']}};
 const series={'@type':'BookSeries','@id':siteUrl+'/#series',name:site.name,url:pageUrl('books.html'),sameAs:site.amazonSeriesUrl,author:{'@id':author['@id']},hasPart:allBooks.map(b=>({'@type':'Book','@id':siteUrl+'/#'+b.id,name:b.title,url:pageUrl(b.id+'.html')}))};
 const description=b=>b.number===1?'An illustrated Cleveland superhero adventure by Jay Jones.':b.description;
 const bookNode=b=>({'@type':'Book','@id':siteUrl+'/#'+b.id,name:b.title,url:pageUrl(b.id+'.html'),author:{'@id':author['@id']},image:image(b),description:description(b),inLanguage:'en',isPartOf:{'@id':series['@id']},workExample:['paperback','ebook'].map(format=>({'@id':siteUrl+'/#'+b.id+'-'+format}))});
 const editions=(b,includeFacts=true)=>['paperback','ebook'].map(format=>{
  const p=(b.number===1?site:b)[format],details=format==='paperback'&&includeFacts?websiteSeo.paperbacks[b.id]:{};
  return {'@type':'Book','@id':siteUrl+'/#'+b.id+'-'+format,name:b.title,author:{'@id':author['@id']},bookFormat:'https://schema.org/'+(format==='paperback'?'Paperback':'EBook'),image:image(b),description:description(b),inLanguage:'en',url:p.url,identifier:{'@type':'PropertyValue',propertyID:'ASIN',value:p.asin},...details,exampleOfWork:{'@id':siteUrl+'/#'+b.id},potentialAction:{'@type':'BuyAction',target:p.url}};
 });
 const comic=require('./flaming-head-origin.cjs');
 const prequel=require('./why-so-evil.cjs');
 const loadedGlove=require('./loaded-glove.cjs');
 const metadata={...websiteSeo.pages,...comic.metadata,...prequel.metadata,...loadedGlove.metadata,'404.html':{title:'Page Not Found | Defenders of the Land',description:'This page could not be found. Return to Defenders of the Land to read the illustrated Cleveland superhero adventures by Jay Jones.'}};
 const chapterPages=new Map();for(const b of allBooks)for(const c of b.entries)chapterPages.set(b.id+'-chapter-'+c.number+'.html',{book:b,chapter:c});
 function render(file,html){
  if(!metadata[file])throw Error('Missing SEO metadata for '+file);
  const {title,description:pageDescription}=metadata[file],canonical=pageUrl(file),chapter=chapterPages.get(file);
  const activeComic=[comic,prequel,loadedGlove].find(story=>story.file===file);
  const activeBook=chapter?.book||allBooks.find(b=>file===b.id+'.html')||book;
  const isVault=file==='1990-vault.html',isAuthor=file==='author.html',archivePreview=isVault?archiveItems[0].previews.at(-1):null;
  const seriesPages=['web-comics.html','index.html','books.html','characters.html','map.html','paperback.html','author.html','downloads.html'];
  const share=websiteSeo.socialImage;
  let previewImage=image(activeBook),previewSize=manifest[activeBook.cover],previewAlt=`Cover of ${activeBook.title} by ${site.author}.`,mime='image/webp';
  if(seriesPages.includes(file)){previewImage=pageUrl('assets/'+share.file);previewSize=share;previewAlt=share.alt;mime=share.type;}
  if(isVault){previewImage=pageUrl(archivePreview.file);previewSize={width:archivePreview.width,height:Math.round(archivePreview.width*archiveItems[0].height/archiveItems[0].width)};previewAlt=archiveItems[0].alt;}
  if(activeComic){previewImage=pageUrl('assets/'+activeComic.socialImage.file);previewSize=activeComic.socialImage;previewAlt=activeComic.socialImage.alt;mime=activeComic.socialImage.type;}
  const page={'@type':['books.html','origins.html',...additionalBooks.map(b=>b.id+'.html')].includes(file)?'CollectionPage':'WebPage','@id':canonical+'#webpage',url:canonical,name:title,description:pageDescription,inLanguage:'en',isPartOf:{'@id':website['@id']}};
  const graph=[website,author,page];
  if(activeComic){const story={'@type':'ComicStory','@id':canonical+'#comic',name:activeComic.title||'Flaming Head: The One Who Fell',url:canonical,author:{'@id':author['@id']},image:previewImage,inLanguage:'en',isAccessibleForFree:true,isPartOf:{'@id':page['@id']}};graph.push(story);page.mainEntity={'@id':story['@id']};}
  if(isAuthor){page['@type']='ProfilePage';page.mainEntity={'@id':author['@id']};}
  if(isVault){
   const gallery={'@type':'ImageGallery','@id':canonical+'#gallery',name:'From the Vault: 1990 — restored comic pages',url:canonical+'#vault-gallery',associatedMedia:archiveItems.map(item=>({'@type':'ImageObject',name:item.title,caption:item.caption,description:item.alt,contentUrl:pageUrl(item.original),thumbnailUrl:pageUrl(item.previews[0].file),width:item.width,height:item.height}))};
   const article={'@type':'Article','@id':canonical+'#article',headline:'From the Vault: The 1990 Origins of Cleveland’s Superheroes',description:pageDescription,author:{'@type':'Person',name:'Jason Jones'},image:previewImage,isPartOf:{'@id':page['@id']},inLanguage:'en',url:canonical+'#vault-retrospective'};
   graph.push(gallery,article);page.mainEntity={'@id':gallery['@id']};
  }
  if(chapter){
   const b=chapter.book,c=chapter.chapter;graph.push(series,bookNode(b),...editions(b,false),{'@type':'Chapter','@id':canonical+'#chapter',name:c.title,position:c.number,url:canonical,isPartOf:{'@id':siteUrl+'/#'+b.id},author:{'@id':author['@id']},inLanguage:'en',isAccessibleForFree:true});page.mainEntity={'@id':canonical+'#chapter'};
  }else if(['index.html','books.html','paperback.html','downloads.html'].includes(file)){
   graph.push(series,...allBooks.flatMap(b=>[bookNode(b),...editions(b,file==='paperback.html')]));page.mainEntity={'@id':file==='downloads.html'?siteUrl+'/#origins':series['@id']};
  }else{const b=allBooks.find(b=>file===b.id+'.html');if(b){graph.push(series,bookNode(b),...editions(b));page.mainEntity={'@id':siteUrl+'/#'+b.id};}}
  const breadcrumbs=[{name:'Home',url:pageUrl('index.html')}];if(isVault)breadcrumbs.push({name:'About the Author',url:pageUrl('author.html')});if(chapter)breadcrumbs.push({name:`Book ${chapter.book.number}: ${chapter.book.title}`,url:pageUrl(chapter.book.id+'.html')});if(file!=='index.html')breadcrumbs.push({name:chapter?`Chapter ${chapter.chapter.number}: ${chapter.chapter.title}`:title.split(' | ')[0],url:canonical});if(file!=='404.html')graph.push({'@type':'BreadcrumbList','@id':canonical+'#breadcrumbs',itemListElement:breadcrumbs.map((b,i)=>({'@type':'ListItem',position:i+1,name:b.name,item:b.url}))});
  const tags=[
   `<meta name="description" content="${escape(pageDescription)}">`,
   `<meta name="author" content="${escape(site.author)}">`,
   '<link rel="icon" type="image/svg+xml" href="favicon.svg?v=flame-d-1">','<link rel="icon" type="image/png" sizes="32x32" href="favicon-32.png">','<link rel="apple-touch-icon" sizes="180x180" href="apple-touch-icon.png">',
   `<meta name="robots" content="${file==='404.html'?'noindex, follow':'index, follow, max-image-preview:large'}">`,
   `<link rel="canonical" href="${escape(canonical)}">`,
   `<meta property="og:type" content="${chapter||isVault||activeComic?'article':'website'}">`,
   `<meta property="og:site_name" content="${escape(site.name)}">`,'<meta property="og:locale" content="en_US">',
   `<meta property="og:title" content="${escape(title)}">`,`<meta property="og:description" content="${escape(pageDescription)}">`,`<meta property="og:url" content="${escape(canonical)}">`,
   `<meta property="og:image" content="${escape(previewImage)}">`,
   ...(previewSize?[`<meta property="og:image:width" content="${previewSize.width}">`,`<meta property="og:image:height" content="${previewSize.height}">`]:[]),
   `<meta property="og:image:type" content="${mime}">`,`<meta property="og:image:alt" content="${escape(previewAlt)}">`,
   `<meta name="twitter:card" content="summary_large_image">`,`<meta name="twitter:title" content="${escape(title)}">`,`<meta name="twitter:description" content="${escape(pageDescription)}">`,`<meta name="twitter:image" content="${escape(previewImage)}">`,`<meta name="twitter:image:alt" content="${escape(previewAlt)}">`,
   `<script type="application/ld+json">${JSON.stringify({'@context':'https://schema.org','@graph':graph}).replace(/</g,'\\u003c')}</script>`
  ].join('');
  return html.replace(/<title>.*?<\/title>/,`<title>${escape(title)}</title>`).replace(/<meta name="description"[^>]*>/,'').replace('</head>',tags+'</head>');
 }
 function sitemap(files){return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${files.filter(f=>f!=='404.html').map(f=>{const date=metadata[f].lastModified;if(date&&!/^\d{4}-\d{2}-\d{2}$/.test(date))throw Error('Invalid lastmod: '+f);return `  <url><loc>${escape(pageUrl(f))}</loc>${date?`<lastmod>${date}</lastmod>`:''}</url>`;}).join('\n')}\n</urlset>\n`;}
 return {render,sitemap,siteUrl,pageUrl};
}
module.exports={createSeo};
