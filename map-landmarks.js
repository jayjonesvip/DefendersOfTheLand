// Edit this one array to add locations. lat/lng are real-world locator coordinates.
// For a confirmed future location, fill lat/lng and chapterUrl, then remove comingSoon.
// Replace [BLURB: ...] with spoiler-free author copy. Keep chapterUrl at Chapter 1.
// Optional photo: {src:'assets/approved-photo.webp',alt:'Describe the photo',width:1200,height:800,caption:'Author-supplied date/context'}.
(function(root){
 const landmarks=[
  {id:'lakefront',name:'Lake Erie waterfront',lat:41.5096,lng:-81.6965,book:1,blurb:'[BLURB: Lake Erie waterfront]',chapterUrl:'origins-chapter-1.html',photo:null},
  {id:'public-square',name:'Public Square',lat:41.499644,lng:-81.693752,book:1,blurb:'[BLURB: Public Square]',chapterUrl:'origins-chapter-1.html',photo:null},
  {id:'union-terminal',name:'Tower City / Union Terminal',lat:41.498254,lng:-81.693879,book:1,blurb:'[BLURB: Tower City / Union Terminal]',chapterUrl:'origins-chapter-1.html',photo:null},
  {id:'main-library',name:'Main Library',lat:41.501272,lng:-81.691381,book:1,blurb:'[BLURB: Main Library]',chapterUrl:'origins-chapter-1.html',photo:null},
  {id:'book-two-soon',name:'Book Two landmarks',lat:null,lng:null,book:2,blurb:'[BLURB: Book Two locations]',chapterUrl:null,photo:null,comingSoon:true},
  {id:'book-three-soon',name:'Book Three landmarks',lat:null,lng:null,book:3,blurb:'[BLURB: Book Three locations]',chapterUrl:null,photo:null,comingSoon:true},
  {id:'book-four-soon',name:'Book Four landmarks',lat:null,lng:null,book:4,blurb:'[BLURB: Book Four locations]',chapterUrl:null,photo:null,comingSoon:true}
 ];
 if(typeof module==='object'&&module.exports)module.exports=landmarks;
 else root.defendersLandmarks=landmarks;
})(typeof window==='undefined'?globalThis:window);
