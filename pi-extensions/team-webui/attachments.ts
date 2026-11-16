import { readFile } from "node:fs/promises";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
const exec=promisify(execFile),LIMIT=64000;
export async function extractAttachment(path,name) {
  try {
    let text;
    if(/\.pdf$/i.test(name)) text=(await exec("pdftotext",["-layout","-f","1","-l","40",path,"-"],{timeout:10000,maxBuffer:1024*1024})).stdout;
    else if(/\.docx$/i.test(name)) text=(await exec("unzip",["-p",path,"word/document.xml"],{timeout:10000,maxBuffer:1024*1024})).stdout
      .replace(/<\/w:p>/g,"\n").replace(/<[^>]*>/g,"").replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/&amp;/g,"&").replace(/&quot;/g,'"');
    else {
      const bytes=await readFile(path);
      if(bytes.includes(0))return {};
      text=new TextDecoder("utf-8",{fatal:true}).decode(bytes);
    }
    return {text:text.slice(0,LIMIT),truncated:text.length>LIMIT};
  }catch{return {extraction:"No text preview. Use the original file with the session's tools."};}
}
