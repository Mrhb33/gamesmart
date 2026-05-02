const fs = require('fs');
let html = fs.readFileSync('c:/smartgame/main.html', 'utf8');

// 1. Add PWA manifest to head
html = html.replace('</title>', '</title>\n<link rel="manifest" href="./manifest.json">');

// 2. Add Shop tab to nav
html = html.replace('<button class="nav-tab" data-tab="profile"', '<button class="nav-tab" data-tab="shop" onclick="switchTab(\'shop\')" role="tab"><i class="fas fa-store"></i><span class="tab-label">Shop</span></button>\n  <button class="nav-tab" data-tab="profile"');

// 3. Add Daily Challenge to Hub
html = html.replace('<div class="category-grid" id="categoryGrid"></div>', '<div class="daily-card" id="dailyCard" onclick="startDaily()" style="margin-bottom:24px;padding:24px;background:linear-gradient(135deg, rgba(245,158,11,0.1), rgba(245,158,11,0.2));border:1px solid var(--accent);border-radius:20px;cursor:pointer;"><h3><i class="fas fa-calendar-star"></i> Daily Challenge</h3><p style="color:var(--muted);font-size:14px;margin-top:6px;">Complete 10 hard questions for massive XP and Coins!</p></div>\n  <div class="category-grid" id="categoryGrid"></div>');

// 4. Add Shop Screen
let shopScreen = `
<!-- SHOP -->
<section id="sShop" class="screen" role="region">
  <div style="width:100%;max-width:1100px;">
    <div class="achievements-header">
      <h2>Avatar Shop</h2>
      <span style="color:var(--accent);font-size:18px;font-weight:700;"><i class="fas fa-coins"></i> <span id="shopCoins">0</span></span>
    </div>
    <div class="category-grid" id="shopGrid"></div>
  </div>
</section>
`;
html = html.replace('<!-- PROFILE -->', shopScreen + '\n<!-- PROFILE -->');

// 5. Add Coins and Share to Results
html = html.replace('<div class="lbl">XP Earned</div></div>', '<div class="lbl">XP Earned</div></div>\n      <div class="result-detail-box"><div class="val" style="color:#eab308" id="resCoins">0</div><div class="lbl">Coins</div></div>');
html = html.replace('<button class="btn btn-ghost" id="reviewBtn">', '<button class="btn btn-ghost" id="shareBtn"><i class="fas fa-share-nodes"></i> Share</button>\n      <button class="btn btn-ghost" id="reviewBtn">');

// 6. Add Coins to Profile
html = html.replace('<div class="profile-stat-card"><div class="pval">${S.totalXP}</div>', '<div class="profile-stat-card"><div class="pval">${S.coins||0}</div><div class="plbl">Total Coins</div></div>\n    <div class="profile-stat-card"><div class="pval">${S.totalXP}</div>');

// 7. Add Lifelines to Quiz
let lifelines = `
<div style="display:flex;gap:12px;margin-bottom:20px;width:100%;">
  <button class="btn btn-ghost btn-sm" id="llFifty" style="flex:1;border-color:var(--accent3);color:var(--accent3)"><i class="fas fa-divide"></i> 50/50 (20 <i class="fas fa-coins"></i>)</button>
  <button class="btn btn-ghost btn-sm" id="llTime" style="flex:1;border-color:var(--accent2);color:var(--accent2)"><i class="fas fa-snowflake"></i> Freeze (20 <i class="fas fa-coins"></i>)</button>
</div>
`;
html = html.replace('<div class="progress-outer">', lifelines + '<div class="progress-outer">');

// Update JS Logic
let jsUpdate = `
const vibe = (t) => { if(navigator.vibrate) navigator.vibrate(t); };

S.coins = 0; S.unlockedAvatars = ['A']; S.avatar = 'A';
S.lastDaily = 0; S.dailyStreak = 0; S.isDaily = false; S.lifelinesUsed = {fifty:0, time:0};

function saveState() { localStorage.setItem('cerebrum_save', JSON.stringify(S, (k,v) => (v instanceof Set ? [...v] : v))); }
function loadState() { 
  let d = localStorage.getItem('cerebrum_save'); 
  if(d) { 
    let p = JSON.parse(d); 
    S = {...S, ...p}; 
    S.newAchievements = new Set(S.newAchievements||[]); 
    S.unlockedAchievements = new Set(S.unlockedAchievements||[]);
  }
}
loadState();

// Register SW
if('serviceWorker' in navigator) navigator.serviceWorker.register('./sw.js');

const AVATARS = [
  {id:'A', icon:'fa-user', cost:0}, {id:'B', icon:'fa-robot', cost:100}, {id:'C', icon:'fa-dragon', cost:250}, {id:'D', icon:'fa-ghost', cost:500}
];

function renderShop() {
  let el = document.getElementById('shopCoins');
  if(el) el.textContent = S.coins;
  let grid = document.getElementById('shopGrid'); 
  if(!grid) return;
  grid.innerHTML = '';
  AVATARS.forEach(a => {
    let unl = S.unlockedAvatars.includes(a.id);
    let card = document.createElement('div'); card.className = 'category-card';
    card.innerHTML = \`<div class="cat-icon"><i class="fas \${a.icon}"></i></div>
      <div class="cat-name">Avatar \${a.id}</div>
      <div style="margin-top:12px;">\${unl ? (S.avatar===a.id ? '<button class="btn btn-gold btn-sm disabled">Equipped</button>' : '<button class="btn btn-ghost btn-sm" onclick="equipAva(\\''+a.id+'\\')">Equip</button>') : '<button class="btn btn-gold btn-sm" onclick="buyAva(\\''+a.id+'\\', '+a.cost+')"><i class="fas fa-coins"></i> '+a.cost+'</button>'}</div>\`;
    grid.appendChild(card);
  });
}
function buyAva(id, cost) { if(S.coins>=cost) { S.coins-=cost; S.unlockedAvatars.push(id); saveState(); renderShop(); sfxC(); } else { sfxW(); showToast('Not enough coins!'); } }
function equipAva(id) { S.avatar=id; saveState(); renderShop(); updateAvatars(); sfxK(); }
function updateAvatars() {
  let a = AVATARS.find(x=>x.id===S.avatar);
  if(a) { 
    let i = '<i class="fas '+a.icon+'"></i>';
    document.getElementById('hubAvatar').innerHTML=i; document.getElementById('profileBigAvatar').innerHTML=i; 
  } else {
    document.getElementById('hubAvatar').textContent=S.playerName.charAt(0); document.getElementById('profileBigAvatar').textContent=S.playerName.charAt(0);
  }
}

function startDaily() {
  sfxK();
  let today = new Date().toDateString();
  if(S.lastDaily === today) { showToast('Daily Challenge already completed!'); return; }
  S.isDaily = true; S.curCat = 'daily'; S.curLevel = 5; S.qIndex=0; S.quizScore=0; S.quizStreak=0; S.quizXP=0; S.lastQuizAnswers=[]; S.quizStarted=false;
  
  let allHard = [];
  Object.values(QUESTIONS).forEach(arr => allHard.push(...arr.filter(q=>q.lvl>=4)));
  S.qs = shuffle(allHard).slice(0, 10);
  
  document.getElementById('quizCatName').textContent = 'Daily Challenge';
  document.getElementById('quizCatDot').style.background = 'var(--accent)';
  document.getElementById('quizTotal').textContent=S.qs.length;
  S.lifelinesUsed = {fifty:0, time:0}; updateLL();
  updateStats(); showScreen('sQuiz'); loadQ();
}

function updateLL() {
  let llF = document.getElementById('llFifty');
  let llT = document.getElementById('llTime');
  if(!llF || !llT) return;
  llF.disabled = S.coins<20 || S.lifelinesUsed.fifty;
  llT.disabled = S.coins<20 || S.lifelinesUsed.time;
  llF.onclick = () => { if(S.coins>=20 && !S.lifelinesUsed.fifty && !S.questionAnswered) { S.coins-=20; S.lifelinesUsed.fifty=1; saveState(); sfxK(); updateLL(); doFifty(); } };
  llT.onclick = () => { if(S.coins>=20 && !S.lifelinesUsed.time && !S.questionAnswered) { S.coins-=20; S.lifelinesUsed.time=1; saveState(); sfxK(); updateLL(); S.timeLeft+=10000; showToast('+10s Freeze Time!'); } };
}

function doFifty() {
  let q=S.qs[S.qIndex]; let wrong = [0,1,2,3].filter(i=>i!==q.a); wrong = shuffle(wrong).slice(0,2);
  let btns=document.querySelectorAll('.option-btn');
  wrong.forEach(w => { btns[w].style.opacity='0.2'; btns[w].style.pointerEvents='none'; });
}

function tryShare() {
  sfxK();
  let txt = \`Cerebrum Quest - \${S.isDaily?'Daily Challenge':CATEGORY_META[S.curCat].name+' Lvl '+S.curLevel}\\nScore: \${S.quizScore}/\${S.qs.length}\\nStreak: 🔥\${S.bestStreak}\`;
  if(navigator.share) navigator.share({title:'Cerebrum Quest', text:txt}).catch(e=>{});
  else { navigator.clipboard.writeText(txt); showToast('Copied to clipboard!'); }
}

function confetti() {
  for(let i=0;i<50;i++){
    let p=document.createElement('div'); p.style.position='fixed'; p.style.width='10px'; p.style.height='10px';
    p.style.backgroundColor=['#f59e0b','#10b981','#06b6d4','#ef4444'][Math.floor(Math.random()*4)];
    p.style.left='50%'; p.style.top='50%'; p.style.zIndex='9999'; p.style.pointerEvents='none';
    let a=Math.random()*Math.PI*2, v=Math.random()*15+5;
    p.style.transition='all 1s cubic-bezier(.2,1,.3,1)';
    document.body.appendChild(p);
    setTimeout(()=>{ p.style.transform=\`translate(\${Math.cos(a)*v*20}px, \${Math.sin(a)*v*20 + 200}px) rotate(\${Math.random()*360}deg)\`; p.style.opacity='0'; }, 50);
    setTimeout(()=>p.remove(), 1050);
  }
}
`;

// Insert the JS logic
let qStart = html.indexOf('const QUESTIONS = {');
html = html.substring(0, qStart) + jsUpdate + '\n\n' + html.substring(qStart);

// Hook into pickA for haptics
html = html.replace('if(isCor){', 'if(isCor){ vibe([50,50,50]);');
html = html.replace('else { sfxW();', 'else { vibe(200); sfxW();');

// Inject coins to finishLvl
let oldPassedStr = 'if(passed && !ld.completed){';
let passedIndex = html.indexOf(oldPassedStr);
if (passedIndex !== -1) {
  let injection = `let coinsEarned = st * 10; if(S.isDaily && passed) coinsEarned = 100; S.coins += coinsEarned; if(S.isDaily) { S.lastDaily = new Date().toDateString(); S.dailyStreak++; S.isDaily=false; } saveState();\n  `;
  html = html.substring(0, passedIndex) + injection + html.substring(passedIndex);
}

// Add coin display to results
html = html.replace("document.getElementById('resXP').textContent=S.quizXP;", "document.getElementById('resXP').textContent=S.quizXP; document.getElementById('resCoins').textContent=coinsEarned||0;");

// Add Confetti
html = html.replace("ban.classList.add('show');", "ban.classList.add('show'); confetti();");

// Update shop navigation check
html = html.replace("['hub','achievements','profile'].forEach(t=>{", "['hub','shop','achievements','profile'].forEach(t=>{");
html = html.replace("else if (t === 'achievements')", "else if (t === 'shop') isActive = id === 'sShop';\n    else if (t === 'achievements')");

// Update loadQ to call updateLL
html = html.replace("S.quizStartTime=Date.now();", "S.quizStartTime=Date.now(); updateLL();");

// Connect shareBtn
html = html.replace("document.getElementById('reviewBtn').onclick", "let sBtn = document.getElementById('shareBtn'); if(sBtn) sBtn.onclick=tryShare;\n  document.getElementById('reviewBtn').onclick");

// Hook into initial rendering to render Shop and Avatars, and save state on Hub
html = html.replace("if(id==='sHub') updateHub();", "if(id==='sHub') { updateHub(); saveState(); }\n  if(id==='sShop') renderShop();");

// Make sure updateAvatars is called in startGame
html = html.replace("document.getElementById('profileName').textContent=S.playerName;", "document.getElementById('profileName').textContent=S.playerName; updateAvatars();");

// Also call updateAvatars at the start after loadState if S.playerName exists
html = html.replace("loadState();", "loadState(); document.addEventListener('DOMContentLoaded', () => { if(S.playerName !== 'Explorer') updateAvatars(); });");

fs.writeFileSync('c:/smartgame/main.html', html);
console.log('Successfully built v3 HTML.');