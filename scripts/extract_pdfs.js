const fs = require('fs');
const path = require('path');
const pdf = require('pdf-parse');

async function extract(file){
  const dataBuffer = fs.readFileSync(file);
  const data = await pdf(dataBuffer);
  return data.text;
}

(async ()=>{
  const files = ['MBA_Headshots.pdf','MBA_Website_Checklist.pdf','MBA Corporate Engagement Questionnaire (002).pdf'];
  for(const f of files){
    const p = path.join(__dirname,'..',f);
    if(!fs.existsSync(p)){ console.log(`Missing: ${p}`); continue; }
    try{
      const text = await extract(p);
      const out = path.join(__dirname, f.replace(/\.pdf$/,'') + '.txt');
      fs.writeFileSync(out, text, 'utf8');
      console.log(`Wrote ${out}`);
    }catch(err){
      console.error(`Failed ${f}:`, err.message);
    }
  }
})();
