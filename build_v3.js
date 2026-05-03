const fs = require('fs');
const { execSync } = require('child_process');

// Validate questions before building
console.log('Validating question set...');
try {
  execSync('node validate_questions.js', { stdio: 'inherit', cwd: __dirname });
} catch (e) {
  console.error('\nBUILD ABORTED: Question validation failed. Fix questions.json before building.');
  process.exit(1);
}

let html = fs.readFileSync('c:/smartgame/main.html', 'utf8');

// Helper: insert once (replace marker if already injected)
function injectAfter(html, marker, content, uniqueId) {
  if (html.includes(uniqueId)) return html;
  return html.replace(marker, content + marker);
}
function injectBefore(html, marker, content, uniqueId) {
  if (html.includes(uniqueId)) return html;
  return html.replace(marker, content + '\n' + marker);
}
function replaceOnce(html, search, replace, uniqueId) {
  if (html.includes(uniqueId)) return html;
  return html.replace(search, replace);
}

// 1. PWA manifest
html = injectAfter(html, '</title>', '\n<link rel="manifest" href="./manifest.json">', 'rel="manifest"');

// 2. Add Shop tab to nav (only once)
const shopTab = '<button class="nav-tab" data-tab="shop" onclick="switchTab(\'shop\')" role="tab"><i class="fas fa-store"></i><span class="tab-label">Shop</span></button>';
if (!html.includes('data-tab="shop"')) {
  html = html.replace('<button class="nav-tab" data-tab="profile"', shopTab + '\n  <button class="nav-tab" data-tab="profile"');
}

// 3. Add Daily Challenge to Hub (only once)
if (!html.includes('id="dailyCard"')) {
  html = html.replace('<div class="category-grid" id="categoryGrid"></div>',
    '<div class="daily-card" id="dailyCard" onclick="startDaily()" style="margin-bottom:24px;padding:24px;background:linear-gradient(135deg, rgba(245,158,11,0.1), rgba(245,158,11,0.2));border:1px solid var(--accent);border-radius:20px;cursor:pointer;transition:all .3s;"><h3><i class="fas fa-calendar-day"></i> Daily Challenge</h3><p style="color:var(--muted);font-size:14px;margin-top:6px;">Complete 10 hard questions for massive XP and Coins!</p></div>\n  <div class="category-grid" id="categoryGrid"></div>');
}

// 4. Add Shop Screen (only once)
if (!html.includes('id="sShop"')) {
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
}

// 5. Add Coins to Results (only once)
if (!document.getElementById ? true : !html.includes('id="resCoins"')) {
  // Add coins result box before correct box if not already there
  let coinsBox = '<div class="result-detail-box"><div class="val" style="color:#eab308" id="resCoins">0</div><div class="lbl">Coins</div></div>';
  if (!html.includes('id="resCoins"')) {
    html = html.replace('<div class="result-detail-box"><div class="val" style="color:var(--accent2)" id="resCorrect">', coinsBox + '\n      <div class="result-detail-box"><div class="val" style="color:var(--accent2)" id="resCorrect">');
  }
}

// 6. Add Share button (only once)
if (!html.includes('id="shareBtn"')) {
  html = html.replace('<button class="btn btn-ghost" id="reviewBtn">', '<button class="btn btn-ghost" id="shareBtn"><i class="fas fa-share-nodes"></i> Share</button>\n      <button class="btn btn-ghost" id="reviewBtn">');
}

// 7. Add Lifelines to Quiz (only once)
if (!html.includes('id="llFifty"')) {
  let lifelines = `
<div style="display:flex;gap:10px;margin-bottom:16px;width:100%;">
  <button class="btn btn-ghost btn-sm" id="llFifty" style="flex:1;border-color:var(--accent3);color:var(--accent3);min-height:44px"><i class="fas fa-percent"></i> 50/50</button>
  <button class="btn btn-ghost btn-sm" id="llTime" style="flex:1;border-color:var(--accent2);color:var(--accent2);min-height:44px"><i class="fas fa-snowflake"></i> Freeze</button>
</div>
`;
  html = html.replace('<div class="progress-outer">', lifelines + '<div class="progress-outer">');
}

// 8. JS Logic - only inject if not already present
if (!html.includes('const AVATARS =')) {
  let jsUpdate = `
const vibe = (t) => { if(navigator.vibrate) navigator.vibrate(t); };

S.coins = 0; S.unlockedAvatars = ['A']; S.avatar = 'A';
S.lastDaily = 0; S.dailyStreak = 0; S.isDaily = false; S.lifelinesUsed = {fifty:0, time:0};

function saveState() { try{localStorage.setItem('cerebrum_save', JSON.stringify(S, (k,v) => (v instanceof Set ? [...v] : v)));}catch(e){} }
function loadState() {
  try{
    let d = localStorage.getItem('cerebrum_save');
    if(d) {
      let p = JSON.parse(d);
      delete p.timerInterval; delete p.qs; delete p.qIndex; delete p.quizScore;
      delete p.quizStreak; delete p.quizXP; delete p.quizStartTime; delete p.timeLeft;
      delete p.questionAnswered; delete p.lastQuizAnswers; delete p.quizStarted; delete p.isDaily; delete p._shuffled;
      S = {...S, ...p};
      S.newAchievements = new Set(S.newAchievements||[]);
      S.unlockedAchievements = new Set(S.unlockedAchievements||[]);
    }
  }catch(e){localStorage.removeItem('cerebrum_save');}
}
loadState(); document.addEventListener('DOMContentLoaded', () => { if(S.playerName !== 'Explorer') updateAvatars(); });

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
function buyAva(id, cost) { if(S.coins>=cost) { S.coins-=cost; S.unlockedAvatars.push(id); saveState(); renderShop(); sfxC(); } else { vibe(200); sfxW(); showToast('Not enough coins!'); } }
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
  if(!requireQuestions()) return;
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
  llT.onclick = () => { if(S.coins>=20 && !S.lifelinesUsed.time && !S.questionAnswered) { S.coins-=20; S.lifelinesUsed.time=1; saveState(); sfxK(); updateLL(); S.timeLeft+=10000; showToast('+10s Freeze!'); } };
}

function doFifty() {
  let q=S.qs[S.qIndex];
  let wrongDisplayIdxs = S._shuffled.map((o,i)=>o.origIdx!==q.a?i:-1).filter(i=>i>=0);
  wrongDisplayIdxs = shuffle(wrongDisplayIdxs).slice(0,2);
  let btns=document.querySelectorAll('.option-btn');
  wrongDisplayIdxs.forEach(i => { btns[i].style.opacity='0.2'; btns[i].style.pointerEvents='none'; });
}

function tryShare() {
  sfxK();
  let catLabel = S.isDaily?'Daily Challenge':(CATEGORY_META[S.curCat]?CATEGORY_META[S.curCat].name+' Lvl '+S.curLevel:'Quiz');
  let txt = \`Cerebrum Quest - \${catLabel}\\nScore: \${S.quizScore}/\${S.qs.length}\\nStreak: \${S.bestStreak}\`;
  if(navigator.share) navigator.share({title:'Cerebrum Quest', text:txt}).catch(()=>{});
  else if(navigator.clipboard) navigator.clipboard.writeText(txt).then(()=>showToast('Copied!')).catch(()=>showToast('Could not copy'));
  else showToast('Share not supported');
}

function confetti() {
  for(let i=0;i<40;i++){
    let p=document.createElement('div'); p.style.cssText='position:fixed;width:8px;height:8px;border-radius:50%;left:50%;top:50%;z-index:9999;pointer-events:none;';
    p.style.backgroundColor=['#f59e0b','#10b981','#06b6d4','#ef4444'][Math.floor(Math.random()*4)];
    let a=Math.random()*Math.PI*2, v=Math.random()*12+5;
    p.style.transition='all .9s cubic-bezier(.2,1,.3,1)';
    document.body.appendChild(p);
    requestAnimationFrame(()=>{
      p.style.transform=\`translate(\${Math.cos(a)*v*20}px, \${Math.sin(a)*v*20+180}px) rotate(\${Math.random()*360}deg)\`;
      p.style.opacity='0';
    });
    setTimeout(()=>p.remove(), 950);
  }
}
`;

  let qStart = html.indexOf('const QUESTIONS = {');
  if (qStart !== -1) {
    html = html.substring(0, qStart) + jsUpdate + '\n\n' + html.substring(qStart);
  }
}

// Hook into pickA for haptics (only once)
if (!html.includes('if(isCor){ vibe(')) {
  html = html.replace('if(isCor){', 'if(isCor){ vibe([50,50,50]);');
}

// Inject coins to finishLvl (only once)
if (!html.includes('let coinsEarned = st * 10;')) {
  let oldPassedStr = 'if(passed && !ld.completed){';
  let passedIndex = html.indexOf(oldPassedStr);
  if (passedIndex !== -1) {
    let injection = `let coinsEarned = st * 10; if(S.isDaily && passed) coinsEarned = 100; S.coins += coinsEarned; if(S.isDaily) { S.lastDaily = new Date().toDateString(); S.dailyStreak++; S.isDaily=false; } saveState();\n  `;
    html = html.substring(0, passedIndex) + injection + html.substring(passedIndex);
  }
}

// Add coin display to results (only once)
if (!html.includes("document.getElementById('resCoins').textContent=coinsEarned")) {
  html = html.replace("document.getElementById('resXP').textContent=S.quizXP;", "document.getElementById('resXP').textContent=S.quizXP; document.getElementById('resCoins').textContent=coinsEarned||0;");
}

// Add Confetti (only once)
if (!html.includes("ban.classList.add('show'); confetti();")) {
  html = html.replace("ban.classList.add('show');", "ban.classList.add('show'); confetti();");
}

// Update shop navigation check (only once)
if (!html.includes("['hub','shop','achievements','profile'].forEach")) {
  html = html.replace("['hub','achievements','profile'].forEach(t=>{", "['hub','shop','achievements','profile'].forEach(t=>{");
}
// Add shop active check (only once)
if (html.includes("else if (t === 'achievements')") && !html.includes("else if (t === 'shop') isActive = id === 'sShop';")) {
  html = html.replace("else if (t === 'achievements')", "else if (t === 'shop') isActive = id === 'sShop';\n    else if (t === 'achievements')");
}

// Update loadQ to call updateLL (only once - just ensure it's there)
// This is handled in the loadQ function itself

// Connect shareBtn (only once)
if (!html.includes("let sBtn = document.getElementById('shareBtn');")) {
  html = html.replace("document.getElementById('reviewBtn').onclick", "let sBtn = document.getElementById('shareBtn'); if(sBtn) sBtn.onclick=tryShare;\n  document.getElementById('reviewBtn').onclick");
}

// Hook into initial rendering for Shop and Avatars
if (!html.includes("if(id==='sShop') renderShop();")) {
  html = html.replace("if(id==='sAchievements') renderAchievements();", "if(id==='sShop') { renderShop(); saveState(); }\n  if(id==='sAchievements') renderAchievements();");
}

// updateAvatars in renderProfile
if (!html.includes("document.getElementById('profileName').textContent=S.playerName; updateAvatars();")) {
  html = html.replace("document.getElementById('profileName').textContent=S.playerName;", "document.getElementById('profileName').textContent=S.playerName; updateAvatars();");
}

fs.writeFileSync('c:/smartgame/main.html', html);
console.log('Successfully built v3 HTML.');
