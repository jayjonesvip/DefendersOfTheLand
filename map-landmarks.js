// One marker per real location. Each appearance supplies verified book copy and a
// public Chapter 1 preview URL; fictional addresses are never inferred.
// Optional photo: {src:'assets/approved-photo.webp',alt:'Describe the photo',width:1200,height:800,caption:'Author-supplied date/context'}.
(function(root){
 const landmarks=[
  {id:'lakefront',name:'Lake Erie waterfront',lat:41.5096,lng:-81.6965,book:1,blurb:'A strange flash over Lake Erie sets Cleveland’s unlikely heroes in motion.',chapterUrl:'origins-chapter-1.html',photo:null,appearances:{
   2:{blurb:'The lakefront remains part of the Defenders’ Cleveland.',chapterUrl:'book-two-chapter-1.html'},
   3:{blurb:'Laura Baxter looks out over Lake Erie as her story begins.',chapterUrl:'book-three-chapter-1.html'}
  }},
  {id:'public-square',name:'Public Square',lat:41.499644,lng:-81.693752,book:1,blurb:'At the heart of Cleveland, ordinary city life meets extraordinary trouble.',chapterUrl:'origins-chapter-1.html',photo:null,appearances:{
   2:{blurb:'Jenny listens to shopkeepers after the trouble downtown.',chapterUrl:'book-two-chapter-1.html'},
   4:{blurb:'Dork brings a stolen Army tank into Public Square.',chapterUrl:'book-four-chapter-1.html'}
  }},
  {id:'union-terminal',name:'Tower City / Union Terminal',lat:41.498254,lng:-81.693879,book:1,blurb:'Plans for Tower City reflect the changing Cleveland of 1987.',chapterUrl:'origins-chapter-1.html',photo:null,appearances:{
   4:{name:'Terminal Tower',blurb:'Dork has a shelf picked out for Terminal Tower.',chapterUrl:'book-four-chapter-1.html'}
  }},
  {id:'main-library',name:'Main Library',lat:41.501272,lng:-81.691381,book:1,blurb:'Jenny directs people toward safety at the Main Library.',chapterUrl:'origins-chapter-1.html',photo:null,appearances:{
   2:{blurb:'Jenny checks the records behind a waterfront claim.',chapterUrl:'book-two-chapter-1.html'}
  }}
 ];
 for(const p of landmarks){
  p.appearances[p.book]={name:p.name,blurb:p.blurb,chapterUrl:p.chapterUrl};
  p.books=Object.keys(p.appearances).map(Number);
 }
 if(typeof module==='object'&&module.exports)module.exports=landmarks;
 else root.defendersLandmarks=landmarks;
})(typeof window==='undefined'?globalThis:window);
