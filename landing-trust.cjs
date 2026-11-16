// Reuse only the approved public Chapter 1 art and text. This is a web preview,
// not a reproduction of the paperback's interior page layout.
function createTrust({books,settings,escape:esc,img,link}){
 const chapter=require('./content/books/origins/chapter-01.json');
 const scene=chapter.blocks.find(block=>block.art);
 return `<section class="launch-trust launch-added-section" aria-labelledby="trust-title">
 <p class="eyebrow">BIG IMAGINATIONS WELCOME</p>
 <h2 id="trust-title">Why Kids &amp; Parents Love This Series</h2>
 <ul class="trust-stats" aria-label="Series at a glance"><li><strong>${books.length} Books</strong><span>One Cleveland to defend</span></li><li><strong>${settings.paperbackPages} Pages</strong><span>Origins paperback · illustrated</span></li><li><strong>Ages 9–14</strong><span>Superhero chapter book adventures</span></li></ul>
 <div class="trust-reasons"><p><strong>For kids:</strong> A flying boxing glove, runaway inventions and heroes with plenty to figure out. There’s always someone unexpected to root for.</p><p><strong>For grown-ups:</strong> Pictures alongside the story, with courage, friendship and responsibility at its heart. Peek inside to see if it’s right for your reader.</p></div>
 <!-- TESTIMONIAL SLOTS: Add verified quotes with permission before displaying.
 Parent: “[Exact approved quote about their child's reading experience.]” — [Name, parent of a reader age X]
 Teacher: “[Exact approved quote about classroom or independent reading.]” — [Name, grade/role]
 Do not publish these editorial placeholders as real endorsements. -->
 <div class="trust-preview"><figure class="trust-interior"><div class="trust-web-preview"><div class="trust-preview-art">${img(scene.art,scene.alt)}</div><div class="trust-preview-text"><p class="eyebrow">ORIGINS · CHAPTER 1</p><h3>${esc(chapter.title)}</h3><p>${esc(scene.text)}</p></div></div><figcaption>Art and text from Chapter 1 of <em>Origins</em>. Web preview; paperback layout differs.</figcaption></figure><div class="trust-preview-copy"><h3>Take a peek inside Origins</h3><p>A scientist buys an ordinary boxing glove. His plan? Bring it to life. Getting it to follow orders is another story.</p>${link('origins-chapter-1.html','Read Chapter 1 free →','launch-section-link')}</div></div>
 <!-- INTERIOR SPREAD SLOT: Replace .trust-web-preview with an author-approved
 image of an actual Chapter 1 paperback spread, with width, height and descriptive
 alt text. Update the caption to identify the edition and pages. Review it through
 the public-preview inventory workflow before adding the asset. -->
 </section>`;
}
module.exports={createTrust};
