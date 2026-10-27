// Leave these blank until real contact details/social accounts are supplied.
const footerSettings={
 contactUrl:'', // [CONTACT EMAIL OR FORM URL]
 socialUrls:{Facebook:'',Instagram:'',X:'',Goodreads:''} // [SOCIAL URL: Facebook/Instagram/X/Goodreads]
};
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const navigation=[['books.html','Books'],['characters.html','Characters'],['web-comics.html','Comics'],['map.html','Map'],['1990-vault.html','Vault'],['author.html','Author'],['downloads.html','Free sample']];
const current=(file,href)=>file===href?' aria-current="page"':'';
function renderHeader(file){return `<header class="site-header"><a href="index.html" class="wordmark"${current(file,'index.html')}>Defenders<span>of the Land</span></a><button type="button" id="nav-toggle" class="nav-toggle" aria-expanded="false" aria-controls="site-navigation" aria-label="Open navigation"><span class="nav-toggle-icon" aria-hidden="true"><span></span><span></span><span></span></span><span class="nav-toggle-label">Menu</span></button><nav id="site-navigation" aria-label="Main navigation">${navigation.map(([href,label])=>`<a href="${href}"${current(file,href)}>${label}</a>`).join('')}<button id="theme" aria-pressed="false">Dark mode</button></nav></header>`;}
function contactLink(){
 const value=footerSettings.contactUrl.trim();if(!value)return '';
 const href=/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)?'mailto:'+value:value;
 if(!/^(https:\/\/|mailto:)/.test(href))throw Error('Contact must be a real HTTPS form URL or email address');
 return `<a href="${esc(href)}"${href.startsWith('https:')?' rel="noopener"':''}>Contact</a>`;
}
function renderFooter(file){return `<footer class="site-footer"><p class="footer-brand">Defenders of the Land · Jay Jones</p><nav aria-label="Footer"><a href="paperback.html"${current(file,'paperback.html')}>Paperback &amp; Kindle editions</a><a href="downloads.html"${current(file,'downloads.html')}>Free sample</a><a href="author.html"${current(file,'author.html')}>Author</a><a href="https://www.amazon.com/author/jayjonesvip" rel="noopener">Jay Jones on Amazon</a><a href="https://www.amazon.com/dp/B0HMXH258N" rel="noopener">Series on Amazon</a>${contactLink()}${Object.entries(footerSettings.socialUrls).filter(([,url])=>url.trim()).map(([label,url])=>{if(!/^https:\/\//.test(url))throw Error('Social links must be real HTTPS URLs');return `<a href="${esc(url)}" rel="noopener">${label}</a>`;}).join('')}</nav>${footerSettings.contactUrl.trim()?'<p class="footer-invitation">For book clubs, libraries, and bloggers: get in touch.</p>':''}</footer>`;}
module.exports={renderHeader,renderFooter,footerSettings,navigation};
