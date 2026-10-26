// Runs only in this public repository's Actions workflow, with explicit approval.
const assert=require('node:assert/strict');
assert.equal(process.env.GITHUB_REPOSITORY,'jayjonesvip/DefendersOfTheLand');
assert(process.env.GITHUB_TOKEN,'Actions token is required');
const base='https://api.github.com/repos/'+process.env.GITHUB_REPOSITORY;
async function api(route,method='GET'){
 const response=await fetch(base+route,{method,headers:{Authorization:'Bearer '+process.env.GITHUB_TOKEN,Accept:'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28'},signal:AbortSignal.timeout(30000)});
 assert(response.ok,`GitHub artifact cleanup: ${method} ${route}: HTTP ${response.status}`);
 return response.status===204?null:response.json();
}
async function artifacts(){const result=[];for(let page=1;;page++){const data=await api('/actions/artifacts?per_page=100&page='+page);result.push(...data.artifacts);if(data.artifacts.length<100)break;}return result;}
(async()=>{
 const old=(await artifacts()).filter(a=>a.name==='kdp-publishing-files');
 for(const artifact of old){assert(Number.isSafeInteger(artifact.id));await api('/actions/artifacts/'+artifact.id,'DELETE');}
 assert(!(await artifacts()).some(a=>a.name==='kdp-publishing-files'),'Old KDP artifacts remain');
 console.log(`Removed ${old.length} legacy public KDP download artifacts; website deployment artifacts retained.`);
})().catch(error=>{console.error(error);process.exitCode=1});
