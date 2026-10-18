const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, Browsers, fetchLatestBaileysVersion } = require("@whiskeysockets/baileys");
const P = require("pino");
const yts = require("yt-search");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const os = require("os");
const readline = require("readline");
const FormData = require("form-data");
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const ask = (q) => new Promise(res => rl.question(q, res));
const WOLFX_KEY = "wxa_u_539dc23597";
const AUDD_KEY = "e9c4a0f3ea033581dbca7a220ca5bb8a"
let PREFIX = ".";
let MODE = "Public";
let START = Date.now();
let antilinkGroups = new Map();
let warns = new Map();
function ram(){
  const used=process.memoryUsage().heapUsed/1024/1024;
  const total=os.totalmem()/1024/1024/1024;
  const p=Math.floor((used/(total*1024))*100);
  return { bar: "█".repeat(Math.floor(p/10))+"░".repeat(10-Math.floor(p/10)), p, used:used.toFixed(1), total:total.toFixed(2) };
}
// === DEAN-ULTRA V1 SHORT-ID PATCH - FIXED V5 ===
async function importSessionId(sid) {
  let trimmed = (sid || "").trim();
  if (!trimmed) throw new Error("Empty Session ID");
  
  // Handle both DEAN-ULTRA-xxxx and DEAN-ULTRA~xxxx
  let code = null;
  if (trimmed.includes('~')) {
    code = trimmed.split('~').pop().trim();
  } else if (trimmed.includes('-')) {
    const parts = trimmed.split('-');
    const last = parts.pop().trim();
    if (last.length < 25) code = last;
  }

  if (code) {
    console.log(`[DEAN] Short ID detected (${code}), fetching full session...`);
    const axios = require('axios');
    const fs = require('fs');
    const path = require('path');
    const { data } = await axios.get(`http://5.189.177.12:3002/session/${code}`);
    const bundle = data.bundle || data;
    const files = bundle.files || bundle;
    if (!fs.existsSync('./session')) fs.mkdirSync('./session', {recursive:true});
    for (const [name, content] of Object.entries(files)) {
      const fp = `./session/${name}`;
      fs.mkdirSync(path.dirname(fp), {recursive:true});
      fs.writeFileSync(fp, content, 'utf8');
    }
    console.log(`[DEAN] Short session restored: ${code}`);
    return;
  }

  // Long session fallback
  const fs = require('fs');
  const path = require('path');
  const b64 = trimmed.replace('DEAN-ULTRA~','').replace('DEAN-ULTRA-','');
  const jsonStr = Buffer.from(b64, 'base64url').toString();
  const bundle = JSON.parse(jsonStr);
  if (!fs.existsSync('./session')) fs.mkdirSync('./session', {recursive:true});
  for (const [name, content] of Object.entries(bundle.files)) {
    const fp = `./session/${name}`;
    fs.mkdirSync(path.dirname(fp), {recursive:true});
    fs.writeFileSync(fp, content, 'utf8');
  }
}
async function startBot(){
let phoneNumber=null;
let p='session/creds.json';
if(!fs.existsSync(p)){
try{
let envSid=process.env.SESSION_ID||"";
if(!envSid&&fs.existsSync('session.txt'))envSid=fs.readFileSync('session.txt','utf8').trim();
if(envSid){
console.log("[DEAN-ULTRA] Importing...");
await importSessionId(envSid);
}
}catch(e){console.log(e.message);}
}
  if(!fs.existsSync('./session/creds.json')){
    let choice = await ask("Your choice (1 or 2): ");
    if(choice=="1"){
      let sid = await ask("Enter your Session ID: ");
      await importSessionId(sid); // keep your import function
    }else{
      phoneNumber = (await ask("Enter Phone Number with country code: ")).replace(/[^0-9]/g,'');
    }
  }

  const { state, saveCreds } = await useMultiFileAuthState('./session');
  const { version } = await fetchLatestBaileysVersion().catch(()=>({version:null}));
  
  const sock = makeWASocket({
    auth: state, 
    logger: P({ level: 'silent' }), 
    version: version,
    browser: Browsers.ubuntu("Chrome"),
    printQRInTerminal: false,
    syncFullHistory: false,
    markOnlineOnConnect: false
  });
  
  sock.ev.on('creds.update', saveCreds);
  
  if(!state.creds.registered && phoneNumber){
    try{
      await new Promise(r=>setTimeout(r,2000));
      const code = await sock.requestPairingCode(phoneNumber);
      console.log(`\n🔑 YOUR CODE FOR ${phoneNumber}: ${code}\n`);
    }catch(e){ console.log("Pairing error:",e.message) }
  }

  sock.ev.on('connection.update', u=>{
    if(u.connection==='open'){
      console.log("╔════════════════════════════════════╗\n║ ✅ DEAN-ULTRA V1 CONNECTED SUCCESSFULLY ||\n╚════════════════════════════════════╝");
    }
    if(u.connection==='close' && u.lastDisconnect?.error?.output?.statusCode!==DisconnectReason.loggedOut) startBot();
  });
  sock.ev.on('messages.upsert', async ({messages})=>{
    const m=messages[0];
if(!m.message) return;
await sock.readMessages([m.key]).catch(()=>{});
    const from=m.key.remoteJid;
    const isGroup = from.endsWith('@g.us');
    const body=m.message.conversation||m.message.extendedTextMessage?.text||m.message.imageMessage?.caption||"";
      // === DEAN ULTRA - CLEAN PRO LOG (no yellow block) ===
const _time = new Date().toLocaleString('en-ZA', { timeZone: 'Africa/Gaborone', hour12: false }) + ' SAST';
const _date = new Date().toLocaleDateString('en-GB');
const _isG = from.endsWith('@g.us');
const _senderName = m.pushName || 'Unknown';
const _msgType = Object.keys(m.message || {})[0] || 'unknown';
let _groupName = '';
if(_isG){ try{ const meta = await sock.groupMetadata(from); _groupName = meta.subject; }catch{ _groupName = 'Unknown Group'; } }

console.log(`\x1b[38;2;0;200;255m┏━━━━『 \x1b[1m\x1b[38;2;255;255;255mDEAN ULTRA\x1b[0m\x1b[38;2;0;200;255m 』━━━━┓\x1b[0m`);
console.log(`\x1b[38;2;0;200;255m┃\x1b[0m \x1b[38;2;0;255;136m»\x1b[0m Sent Time: \x1b[37m${_time}\x1b[0m`);
console.log(`\x1b[38;2;0;200;255m┃\x1b[0m \x1b[38;2;0;255;136m»\x1b[0m Date: \x1b[37m${_date}\x1b[0m`);
console.log(`\x1b[38;2;0;200;255m┃\x1b[0m \x1b[38;2;0;255;136m»\x1b[0m Message Type: \x1b[90m${_msgType}\x1b[0m`);
console.log(`\x1b[38;2;0;200;255m┃\x1b[0m \x1b[38;2;0;255;136m»\x1b[0m Sender Name: \x1b[1m\x1b[97m${_senderName}\x1b[0m`);
console.log(`\x1b[38;2;0;200;255m┃\x1b[0m \x1b[38;2;0;255;136m»\x1b[0m Chat ID: \x1b[90m${from}\x1b[0m`);
if(_isG){
  console.log(`\x1b[38;2;0;200;255m┃\x1b[0m \x1b[38;2;0;255;136m»\x1b[0m Group: \x1b[38;2;0;255;136m${_groupName}\x1b[0m`);
  console.log(`\x1b[38;2;0;200;255m┃\x1b[0m \x1b[38;2;0;255;136m»\x1b[0m Group JID: \x1b[90m${from}\x1b[0m`);
}
console.log(`\x1b[38;2;0;200;255m┃\x1b[0m \x1b[38;2;0;255;136m»\x1b[0m Message: \x1b[1m\x1b[37m${body.slice(0,100)}\x1b[0m`);
console.log(`\x1b[38;2;0;200;255m┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛\x1b[0m\n`);
if(isGroup && antilinkGroups.has(from)){
let b=(body||"").toLowerCase();
if(b.includes("https://")||b.includes("http://")||b.includes("chat.whatsapp.com")||b.includes("www.")){
const mode=antilinkGroups.get(from);
const sender=m.key.participant||from;
try{
const md=await sock.groupMetadata(from);
let adm=md.participants.find(p=>p.id===sender);
if(adm&&(adm.admin||adm.isAdmin)) return;
}catch(e){}
try{
await sock.sendMessage(from,{delete:m.key});
let tag=sender.split("@")[0];
if(mode==="delete"){await sock.sendMessage(from,{text:"@"+tag+" Link deleted!",mentions:[sender]});}
if(mode==="warn"){
let c=(warns.get(sender)||0)+1;warns.set(sender,c);
if(c>=3){await sock.sendMessage(from,{text:"@"+tag+" 3 warnings - kicking!",mentions:[sender]});await sock.groupParticipantsUpdate(from,[sender],"remove");warns.delete(sender);}
else{await sock.sendMessage(from,{text:"@"+tag+" Warned! Links not allowed ("+c+"/3)",mentions:[sender]});}
}
if(mode==="kick"){await sock.sendMessage(from,{text:"@"+tag+" Kicked for link!",mentions:[sender]});await sock.groupParticipantsUpdate(from,[sender],"remove");}
}catch(e){}
}
}
    const lm = String(MODE||"public").toLowerCase();
    if(lm === "group") { if(!isGroup) return; }
    if(lm === "private") { if(isGroup) return; }
    const args=body.slice(PREFIX.length).trim().split(/ +/);
    const cmd=args.shift().toLowerCase();
    const query=args.join(" ");
    const hrstart = process.hrtime();
                 if(cmd==="menu"){
      try{
        const more = String.fromCharCode(8206).repeat(4001);
        let platform = "Panel";
        if(process.env.DYNO) platform = "Heroku";
        if(process.env.RENDER) platform = "Render";
        const elapsed = process.hrtime(hrstart);
        const speedMs = (elapsed[0]*1000 + elapsed[1]/1e6).toFixed(3);
        const ms = Date.now() - START;
        const s = Math.floor(ms/1000);
        const h = Math.floor(s/3600);
        const m2 = Math.floor((s%3600)/60);
        const sec = s%60;
        let up = "";
        if(h>0) up += `${h}h `;
        if(m2>0) up += `${m2}m `;
        up += `${sec}s`;
        if(s<60) up = `${s}s`;
        const memUsed = (process.memoryUsage().heapUsed / 1024 / 1024).toFixed(1);
        const memTotal = (os.totalmem() / 1024 / 1024 / 1024).toFixed(2);
        const r = ram();
                  const totalCmds = (fs.readFileSync(__filename,'utf8').match(/if\(cmd===/g)||[]).length;
              let text = `┌◇ DEAN-ULTRA ◇┐
│ PREFIX: [ ${PREFIX} ]
│ OWNER: Theo
│ MODE: 🌐 ${MODE}
│ PLATFORM: 💻 ${platform}
│ SPEED: ${speedMs} ms
│ UPTIME: ${up.trim()}
│ VERSION: v1.0.0
│ USAGE: ${memUsed} MB of ${memTotal} GB
│ RAM: [${r.bar}] ${r.p}%
│ │ COMMANDS: ${totalCmds}
└◇...${more}

╭──「 OWNER 」──
│ •.ping
│ •.uptime
│ •.setprefix
│ •.mode
╰──────
╭──「 DOWNLOADER 」──
│ •.play
│ •.song
│ •.video
│ •.fb
│ •.tt
│ •.yts
│ •.shazam
╰──────
╭──「 GROUP 」──
│ •.antilink
│ •.kick
│ •.close
│ •.open
│ •.link
│ •.approveall
│ •.promote
│ •.demote
│ •.tagall
│ •.listadmins
│ . approveall
│ . rejectall  
│ . tagall
╰──────

_By DEAN-ULTRA_ 👑`;  
        await sock.sendMessage(from, {text: text}, {quoted: m});
      }catch(e){ console.log("Menu error", e.message); }
    } 
    if(cmd==="ping"){
      const elapsed = process.hrtime(hrstart);
      const speed = (elapsed[0]*1000 + elapsed[1]/1e6).toFixed(3);
      return await sock.sendMessage(from,{text:`🚀 DEAN ULTRA SPEED: ${speed} ms`},{quoted:m});
    }
    if(cmd==="uptime" || cmd==="runtime"){
      const ms = Date.now() - START;
      const s = Math.floor(ms/1000);
      const h = Math.floor(s/3600);
      const m2 = Math.floor((s%3600)/60);
      const sec = s%60;
      let up = "";
      if(h>0) up += `${h}h `;
      if(m2>0) up += `${m2}m `;
      up += `${sec}s`;
      if(s<60) up = `${s}s`;
      const r = ram();
      const used = r.used || (process.memoryUsage().heapUsed/1024/1024).toFixed(1);
      const startStr = new Date(START).toLocaleString();
      const text = `DEAN-ULTRA UPTIME\n\n⏱️ ${up.trim()}\nRAM: ${used} MB\nStarted: ${startStr}`;
      return await sock.sendMessage(from,{text:text},{quoted:m});
    }
    if(cmd==="facebook" || cmd==="fb" || cmd==="fbdl"){
      if(!query) return await sock.sendMessage(from,{text:"*Give FB link*"},{quoted:m});
      try{
        const res = await axios.get(`https://apis.xwolf.space/api/download/facebook`, { params: { url: query }, headers: { "x-api-key": WOLFX_KEY } });
        const data = res.data?.data || res.data;
        const videoUrl = data?.hdUrl || data?.sdUrl || data?.hd || data?.sd || data?.url;
        if(!videoUrl) throw new Error("No URL found");
        const vid = await axios.get(videoUrl, { responseType: "arraybuffer", headers: { "User-Agent": "Mozilla/5.0" } });
        await sock.sendMessage(from, {video: Buffer.from(vid.data), caption: `*${data?.title || "DEAN-ULTRA"}* ✅`, mimetype: "video/mp4"}, {quoted:m});
      }catch(e){
        await sock.sendMessage(from,{text:`*FB Error:* ${e.message.slice(0,200)}`},{quoted:m});
      }
      return;
    }
    if(cmd==="tiktok" || cmd==="tt" || cmd==="tiktokdl" || cmd==="ttdl"){
      if(!query) return await sock.sendMessage(from,{text:"*Give TikTok link*"},{quoted:m});
      try{
        const res = await axios.get(`https://apis.xwolf.space/api/download/tiktok`, { params: { url: query }, headers: { "x-api-key": WOLFX_KEY } });
        const ttData = res.data?.data || res.data?.result || res.data;
        const videoUrl = ttData?.hdplay || ttData?.play || ttData?.wmplay || ttData?.download_url || ttData?.video;
        if(!videoUrl) return await sock.sendMessage(from,{text:"_Could not fetch_"},{quoted:m});
        const vid = await axios.get(videoUrl, {responseType:"arraybuffer", headers: {"User-Agent":"Mozilla/5.0"}});
        await sock.sendMessage(from, { video: Buffer.from(vid.data), caption: `*${ttData?.title || "TikTok"}* ✅`, mimetype: "video/mp4" }, {quoted:m});
      }catch(e){ await sock.sendMessage(from,{text:`_TT Failed: ${e.message}_`},{quoted:m}); }
    }
    if(cmd==="yts" || cmd==="ytsearch"){
      if(!query) return await sock.sendMessage(from,{text:"*Give search term*"},{quoted:m});
      try{
        const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
        const { data: html } = await axios.get(searchUrl, { headers: { "User-Agent": "Mozilla/5.0" } });
        const match = html.match(/var ytInitialData = (.*?);<\/script>/);
        if(!match) throw new Error("YouTube blocked parse");
        const ytData = JSON.parse(match[1]);
        const contents = ytData.contents?.twoColumnSearchResultsRenderer?.primaryContents?.sectionListRenderer?.contents?.[0]?.itemSectionRenderer?.contents || [];
        let results = [];
        for(let c of contents){
          const v = c.videoRenderer;
          if(v){ results.push({ title: v.title?.runs?.[0]?.text || "Untitled", videoId: v.videoId, url: `https://youtu.be/${v.videoId}` }); }
          if(results.length>=10) break;
        }
        let text = `*🔍 DEAN-ULTRA YTS*\n*Query:* ${query}\n\n`;
        results.forEach((v,i)=>{ text += `*${i+1}. ${v.title}*\n🔗 ${v.url}\n\n`; });
        await sock.sendMessage(from,{text},{quoted:m});
      }catch(e){ await sock.sendMessage(from,{text:`_YTS Failed: ${e.message}_`},{quoted:m}); }
    }
    if(cmd==="find" || cmd==="shazam"){
      try{
        const contextInfo = m.message?.extendedTextMessage?.contextInfo;
        const quotedMsg = contextInfo?.quotedMessage;
        if(!quotedMsg) return sock.sendMessage(from,{text:"*Reply to a video/song with.shazam*"},{quoted:m});
        const { downloadContentFromMessage } = require('@whiskeysockets/baileys');
        const quotedType = Object.keys(quotedMsg)[0];
        const mediaMsg = quotedMsg[quotedType];
        const stream = await downloadContentFromMessage(mediaMsg, quotedType.replace('Message',''));
        let chunks = []; for await (const c of stream) chunks.push(c);
        let buffer = Buffer.concat(chunks);
        const tmpIn = path.join(os.tmpdir(), `find_in_${Date.now()}.mp4`);
        const tmpOut = path.join(os.tmpdir(), `find_out_${Date.now()}.mp3`);
        fs.writeFileSync(tmpIn, buffer);
        let finalPath = tmpIn;
        try{
          const { execSync } = require('child_process');
          execSync(`ffmpeg -y -ss 1 -i "${tmpIn}" -t 20 -b:a 128k -ac 2 -ar 44100 "${tmpOut}"`, {timeout:15000});
          if(fs.existsSync(tmpOut)) finalPath = tmpOut;
        }catch(e){}
        let title=null, artist=null, cover=null, found=false;
        try{
          const form = new FormData();
          form.append('audio', fs.createReadStream(finalPath));
          const res = await axios.post('https://apix.wolvarex.com/api/shazam/recognize', form, { headers: {...form.getHeaders(), "x-api-key": WOLFX_KEY }, timeout: 60000 });
          const d = res.data?.data || res.data?.result || res.data?.track || res.data;
          if(d){ title = d.title || d.name; artist = d.artist || d.subtitle; cover = d.image || ""; if(title) found=true; }
        }catch(e){ console.log("APIX fail", e.message); }
        if(!found && AUDD_KEY){
          try{
            const form2 = new FormData();
            form2.append('file', fs.createReadStream(finalPath));
            form2.append('api_token', AUDD_KEY);
            form2.append('return', 'apple_music,spotify');
            const res2 = await axios.post('https://api.audd.io/', form2, { headers: form2.getHeaders(), timeout: 20000 });
            const r = res2.data?.result;
            if(r?.title){ title=r.title; artist=r.artist; cover=r.spotify?.album?.images?.[0]?.url||""; found=true; }
          }catch(e){}
        }
        try{ fs.unlinkSync(tmpIn); }catch{} try{ fs.unlinkSync(tmpOut); }catch{}
        if(!found) throw new Error("No match");
        let text = `*🎧 FOUND!*\n\n*Title:* ${title}\n*Artist:* ${artist}\n\n_Use.play ${title}_`;
        if(cover){ try{ await sock.sendMessage(from,{ image: { url: cover }, caption: text },{quoted:m}); } catch{ await sock.sendMessage(from,{text},{quoted:m}); } } else { await sock.sendMessage(from,{text},{quoted:m}); }
      }catch(e){ await sock.sendMessage(from,{text:`_Find failed: ${e.message}_`},{quoted:m}); }
    }
    if(cmd==="setprefix"){ PREFIX = query.trim() || PREFIX; return await sock.sendMessage(from,{text:`✅ Prefix: [ ${PREFIX} ]`},{quoted:m}); }
    if(cmd==="mode"){
      if(!query){ return await sock.sendMessage(from,{text:`Current: ${MODE}`},{quoted:m}); }
      MODE = query.trim().toLowerCase();
      try{ fs.mkdirSync('./data',{recursive:true}); let s={}; try{ s=JSON.parse(fs.readFileSync('./data/settings.json','utf8')); }catch(e){} s.mode=MODE; fs.writeFileSync('./data/settings.json', JSON.stringify(s, null, 2)); }catch(e){}
      return await sock.sendMessage(from,{text:`✅ Mode: ${MODE}`},{quoted:m});
    }
   if(cmd==="antilink"){
    if(!isGroup) return sock.sendMessage(from,{ text: 'Group only command' });
    let arg1 = (args[0] || "").toLowerCase();
    let arg2 = (args[1] || "").toLowerCase();
    let arg = arg1;

    // Fix for ".antilink on kick" or ".antilink on warn"
    if(arg1 === 'on' && arg2){
        arg = arg2;
    }

    if(!arg1){
        let st = antilinkGroups.has(from)? antilinkGroups.get(from) : 'OFF';
        return sock.sendMessage(from,{ text: 'Antilink\nStatus: ' + st + '\n\n.antilink delete | kick | warn | on | off' });
    }
    if(arg==='off'){
        antilinkGroups.delete(from);
        return sock.sendMessage(from,{ text: 'Antilink OFF' });
    }
    if(arg==='on') arg = 'delete';
    if(arg==='delete' || arg==='kick' || arg==='warn'){
        antilinkGroups.set(from, arg);
        return sock.sendMessage(from,{ text: 'Antilink ON - Mode: ' + arg });
    }
}
    if(cmd==="close"){ try{ await sock.groupSettingUpdate(from, 'announcement'); return await sock.sendMessage(from,{text:`🔒 Closed`},{quoted:m}); }catch(e){ return await sock.sendMessage(from,{text:`Need admin`},{quoted:m}); } }
    if(cmd==="open"){ try{ await sock.groupSettingUpdate(from, 'not_announcement'); return await sock.sendMessage(from,{text:`🔓 Opened`},{quoted:m}); }catch(e){ return await sock.sendMessage(from,{text:`Need admin`},{quoted:m}); } }
    if(cmd=="kick" || cmd=="remove"){
      try{
        if(!from.endsWith('@g.us')) return await sock.sendMessage(from,{text:'❌ Group only'},{quoted:m});
        let context = m.msg?.contextInfo || m.message?.extendedTextMessage?.contextInfo || {};
        let target = m.quoted?.sender || context.participant;
        if(!target) return await sock.sendMessage(from,{text:'❌ Reply to user'},{quoted:m});
        await sock.groupParticipantsUpdate(from, [target], 'remove');
        return await sock.sendMessage(from,{text:`✅ Removed @${target.split('@')[0]}`, mentions:[target]},{quoted:m});
      }catch(e){ return await sock.sendMessage(from,{text:`❌ Need admin`},{quoted:m}); }
    }
             if(cmd==="listadmins" || cmd==="admins" || cmd==="admin"){
      if(!from.endsWith('@g.us')) return await sock.sendMessage(from,{text:'❌ Group only'},{quoted:m});
      try{
        const md = await sock.groupMetadata(from);
        const admins = md.participants.filter(p=>p.admin);
        let txt = `*ADMINS - ${md.subject}*\n\n`;
        admins.forEach((a,i)=>{ txt += `${i+1}. @${a.id.split('@')[0]} ${a.admin==='superadmin'?'👑':''}\n`; });
        await sock.sendMessage(from,{text:txt, mentions:admins.map(a=>a.id)},{quoted:m});
        return;
      }catch(e){ await sock.sendMessage(from,{text:`❌ ${e.message}`},{quoted:m}); return; }
    }
if(cmd==="link" || cmd==="grouplink" || cmd==="invite"){
  try{
    const code = await sock.groupInviteCode(from);
    const gmeta = await sock.groupMetadata(from);
    const gname = gmeta.subject;
    return await sock.sendMessage(from,{
      text:`🔗 *GROUP INVITE LINK*\n\n📱 Group: ${gname}\n🔗 Link: https://chat.whatsapp.com/${code}`
    });
  }catch(e){
    return await sock.sendMessage(from,{text:`❌ Failed: ${e.message}`});
  }
}
     // approveall + rejectall - FINAL WORKING - no admin check
if(["approveall","approve","rejectall","reject","rall","aall"].includes(cmd)){
  const action = (cmd.includes("reject") || cmd==="rall") ? "reject" : "approve";
  try{
    if(!isGroup) return sock.sendMessage(from,{text:"❌ Group only"});
    
    await sock.sendMessage(from,{text:`⏳ Checking pending to ${action}...`});
    
    const pending = await sock.groupRequestParticipantsList(from);
    
    if(!pending || pending.length===0){
      return await sock.sendMessage(from,{text:`✅ No pending requests to ${action}`});
    }
    
    await sock.sendMessage(from,{text:`Found ${pending.length} pending, ${action}ing...`});
    
    let done = 0;
    for(let p of pending){
      try{
        const jid = p.jid || p.participant;
        await sock.groupRequestParticipantsUpdate(from,[jid],action);
        done++;
      }catch(e){
        console.log("Fail one:", e.message);
      }
      await new Promise(r=>setTimeout(r,1000));
    }
    
    await sock.sendMessage(from,{text:`${action==="approve"?"✅":"🗑️"} Done: ${action}ed ${done}/${pending.length}`});
    
  }catch(e){
    await sock.sendMessage(from,{text:`❌ Error: ${e.message}\nMake sure: 1) Bot is admin 2) Group Settings > Approve new members is ON`});
  }
}
     if(cmd==="promote"){
 try{
  if(!isGroup) return;
  let target = null;
  // reply check - 3 ways
  if(m.quoted) target = m.quoted.sender;
  else if(m.message?.extendedTextMessage?.contextInfo?.participant) target = m.message.extendedTextMessage.contextInfo.participant;
  else if(m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length) target = m.message.extendedTextMessage.contextInfo.mentionedJid[0];
  else if(args[0]){
   let num = args[0].replace(/[^0-9]/g,"");
   if(num){
     let meta = await sock.groupMetadata(from);
     let found = meta.participants.find(p=>p.id.includes(num));
     target = found ? found.id : num+"@s.whatsapp.net";
   }
  }
  if(!target) return sock.sendMessage(from,{text:"❌ Reply to user's message with .promote"});
  await sock.groupParticipantsUpdate(from,[target],"promote");
  await sock.sendMessage(from,{text:"✅ Promoted"});
 }catch(e){ await sock.sendMessage(from,{text:"❌ "+e.message}); }
}

if(cmd==="demote"){
 try{
  if(!isGroup) return;
  let target = null;
  if(m.quoted) target = m.quoted.sender;
  else if(m.message?.extendedTextMessage?.contextInfo?.participant) target = m.message.extendedTextMessage.contextInfo.participant;
  else if(m.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length) target = m.message.extendedTextMessage.contextInfo.mentionedJid[0];
  else if(args[0]){
   let num = args[0].replace(/[^0-9]/g,"");
   if(num){
     let meta = await sock.groupMetadata(from);
     let found = meta.participants.find(p=>p.id.includes(num));
     target = found ? found.id : num+"@s.whatsapp.net";
   }
  }
  if(!target) return sock.sendMessage(from,{text:"❌ Reply to user's message with .demote"});
  await sock.groupParticipantsUpdate(from,[target],"demote");
  await sock.sendMessage(from,{text:"✅ Demoted"});
 }catch(e){ await sock.sendMessage(from,{text:"❌ "+e.message}); }
}
      if(cmd==="tagall" || cmd==="tag" || cmd==="all"){
 try{
  if(!isGroup) return;
  const metadata = await sock.groupMetadata(from);
  const participants = metadata.participants.map(p=>p.id);
  let message = args.join(" ") || "📢 Attention everyone";
  
  let text = `${message}\n\n`;
  let count = 0;
  for(let mem of participants){
    // pretty tag list
    text += `▫️ @${mem.split("@")[0]}\n`;
    count++;
  }
  
  await sock.sendMessage(from, {text: text, mentions: participants});
 }catch(e){
  await sock.sendMessage(from,{text:"❌ Failed tagall: "+e.message});
 }
}
    if(cmd==="play"||cmd==="song"){
      if(!query){ await sock.sendMessage(from,{text:"Use "+PREFIX+"play song name"},{quoted:m}); return; }
      try{
        const searchQ = query;
        const searchRes = await axios.get(`https://apis.xwolf.space/api/music/ytmp3-search`, { params: { q: searchQ }, headers: { "x-api-key": WOLFX_KEY }, timeout: 20000 });
        let videoUrl = null; let videoTitle = searchQ;
        const data = searchRes.data;
        const first = data?.result?.[0] || data?.data?.[0] || data?.[0];
        if(first){ videoUrl = first.url || first.link || `https://youtube.com/watch?v=${first.videoId||first.id}`; videoTitle = first.title || searchQ; }
        else { const ytsRes = await yts(searchQ); const v = ytsRes.videos[0]; videoUrl = v.url; videoTitle = v.title; }
        const dlRes = await axios.get(`https://apis.xwolf.space/api/music/ytmp3-download`, { params: { url: videoUrl }, headers: { "x-api-key": WOLFX_KEY }, timeout: 25000 });
        const dlData = dlRes.data;
        const downloadUrl = dlData?.directURL || dlData?.downloadURL || dlData?.proxyURL || dlData?.result?.directURL || dlData?.result?.url || dlData?.url;
        let buf = null;
        if(downloadUrl){ const fileRes = await axios.get(downloadUrl, {responseType:"arraybuffer", timeout:40000}); buf = Buffer.from(fileRes.data); }
        else if(dlData?.result?.audio){ buf = Buffer.from(dlData.result.audio, 'base64'); }
        if(!buf) throw new Error("No download link");
        await sock.sendMessage(from, {audio: buf, mimetype: "audio/mpeg"}, {quoted: m});
        await sock.sendMessage(from, {document: buf, fileName: videoTitle+".mp3", mimetype: "audio/mpeg"}, {quoted: m});
      }catch(e){ await sock.sendMessage(from, {text:"Error: "+e.message}, {quoted:m}); }
    }
    if(cmd==="video"||cmd==="mp4"){
      const WOLVAREX_KEY = "wxa_f_98e5ff4817";
      if(!query) return await sock.sendMessage(from,{text:`Use "${PREFIX}video song name"`},{quoted:m});
      try{
        let v = (await yts(query)).videos[0];
        if(!v) return await sock.sendMessage(from,{text:"Not found"},{quoted:m});
        let apiUrl = `https://apix.wolvarex.com/download/mp4?url=${encodeURIComponent(v.url)}&q=${encodeURIComponent(v.title)}&provider=mp4&key=${WOLVAREX_KEY}`;
        let res = await axios.get(apiUrl, {timeout:30000});
        let downloadUrl = res.data.downloadUrl || res.data.proxyUrl;
        let fileRes = await axios.get(downloadUrl, {responseType:"arraybuffer", timeout:60000});
        let buf = Buffer.from(fileRes.data);
        await sock.sendMessage(from,{video: buf, mimetype:"video/mp4", fileName: v.title+".mp4", caption: v.title}, {quoted:m});
      }catch(e){ await sock.sendMessage(from,{text:"Video Error: "+e.message},{quoted:m}); }
    }
  });
  }    
startBot();