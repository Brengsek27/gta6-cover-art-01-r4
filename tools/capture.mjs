import {mkdirSync, rmSync, writeFileSync, readFileSync} from 'node:fs';
import {spawn} from 'node:child_process';
import {createServer} from 'node:net';
import {join} from 'node:path';

const root=new URL('..',import.meta.url).pathname;
const chrome='/home/hatch/.cache/puppeteer/chrome/linux-157.0.8103.50/chrome-linux64/chrome';
const captureDir=join(root,'tools/.capture');
const outputDir=join(root,'screenshots');
const shots=JSON.parse(readFileSync(join(root,'shots.json'),'utf8'));

function freePort(){return new Promise((resolve,reject)=>{const server=createServer();server.once('error',reject);server.listen(0,'127.0.0.1',()=>{const port=server.address().port;server.close(()=>resolve(port))})})}
function waitForLine(stream,pattern){return new Promise((resolve,reject)=>{let text='';const onData=chunk=>{text+=chunk.toString();const match=text.match(pattern);if(match){stream.off('data',onData);resolve(match[1])}};stream.on('data',onData);stream.once('error',reject);setTimeout(()=>reject(new Error(`Timed out waiting for ${pattern}`)),10000)})}
function cdp(ws,sessionId){let id=0;const pending=new Map();ws.addEventListener('message',event=>{const msg=JSON.parse(event.data);if(msg.id&&pending.has(msg.id)){pending.get(msg.id)(msg);pending.delete(msg.id)}});return(method,params={})=>new Promise((resolve,reject)=>{const requestId=++id;pending.set(requestId,msg=>msg.error?reject(new Error(msg.error.message)):resolve(msg.result));ws.send(JSON.stringify({id:requestId,method,params,...(sessionId?{sessionId}: {})}))})}
async function captureOne(call,name,w,h){let quality=82;for(;;){const result=await call('Page.captureScreenshot',{format:'jpeg',quality});const bytes=Buffer.from(result.data,'base64');if(bytes.length<=262144||quality<=45){writeFileSync(join(outputDir,name),bytes);return bytes.length}quality-=8}}

const servePort=await freePort();
mkdirSync(captureDir,{recursive:true});rmSync(outputDir,{recursive:true,force:true});mkdirSync(outputDir,{recursive:true});
const server=spawn(process.execPath,['serve.ts','--port',String(servePort)],{cwd:root,stdio:['ignore','pipe','pipe']});
try{
  await waitForLine(server.stdout,/app\/ is on http:\/\/localhost:\d+/);
  const debugPort=await freePort();
  const browser=spawn(chrome,['--headless=new','--no-sandbox',`--remote-debugging-port=${debugPort}`,`--user-data-dir=${captureDir}`],{cwd:root,stdio:['ignore','ignore','pipe']});
  try{
    const wsUrl=await waitForLine(browser.stderr,/(ws:\/\/127\.0\.0\.1:\d+\/devtools\/browser\/[\w-]+)/);
    const socket=new WebSocket(wsUrl);await new Promise((resolve,reject)=>{socket.addEventListener('open',resolve);socket.addEventListener('error',reject)});
    const call=cdp(socket);const target=await call('Target.createTarget',{url:'about:blank'});const attached=await call('Target.attachToTarget',{targetId:target.targetId,flatten:true});const page=cdp(socket,attached.sessionId);
    await page('Page.enable');
    for(const shot of shots){const url=`http://127.0.0.1:${servePort}/${shot.query}`;await page('Emulation.setDeviceMetricsOverride',{width:shot.w,height:shot.h,deviceScaleFactor:1,mobile:false});await page('Page.navigate',{url});for(let i=0;i<100;i++){const ready=await page('Runtime.evaluate',{expression:'window.__shotReady===true',returnByValue:true});if(ready.result.value)break;await new Promise(resolve=>setTimeout(resolve,50))}const size=await captureOne(page,shot.name,shot.w,shot.h);console.log(`${shot.name}: ${size} bytes`)}
    socket.close();
  }finally{browser.kill('SIGTERM')}
}finally{server.kill('SIGTERM')}
