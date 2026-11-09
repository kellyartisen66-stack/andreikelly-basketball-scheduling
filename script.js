const STORAGE = {
  teams: "ak_teams",
  courts: "ak_courts",
  games: "ak_games"
};

const seedTeams = [
  {id: crypto.randomUUID(), name:"Tigers", coach:"Coach Santos"},
  {id: crypto.randomUUID(), name:"Falcons", coach:"Coach Reyes"},
  {id: crypto.randomUUID(), name:"Eagles", coach:"Coach Cruz"},
  {id: crypto.randomUUID(), name:"Spartans", coach:"Coach Lim"},
  {id: crypto.randomUUID(), name:"Lions", coach:"Coach Garcia"},
  {id: crypto.randomUUID(), name:"Wolves", coach:"Coach Mendoza"}
];

const seedCourts = [
  {id: crypto.randomUUID(), name:"Court 1", location:"Main Gymnasium"},
  {id: crypto.randomUUID(), name:"Court 2", location:"Main Gymnasium"}
];

function isoDateOffset(days){
  const d = new Date();
  d.setDate(d.getDate()+days);
  return d.toISOString().slice(0,10);
}

function initData(){
  if(!localStorage.getItem(STORAGE.teams)) localStorage.setItem(STORAGE.teams, JSON.stringify(seedTeams));
  if(!localStorage.getItem(STORAGE.courts)) localStorage.setItem(STORAGE.courts, JSON.stringify(seedCourts));
  if(!localStorage.getItem(STORAGE.games)){
    const t = JSON.parse(localStorage.getItem(STORAGE.teams));
    const c = JSON.parse(localStorage.getItem(STORAGE.courts));
    const games = [
      {id:crypto.randomUUID(), date:isoDateOffset(1), start:"08:00", end:"09:00", courtId:c[0].id, teamA:t[0].id, teamB:t[1].id},
      {id:crypto.randomUUID(), date:isoDateOffset(1), start:"09:00", end:"10:00", courtId:c[0].id, teamA:t[2].id, teamB:t[3].id},
      {id:crypto.randomUUID(), date:isoDateOffset(1), start:"08:00", end:"09:00", courtId:c[1].id, teamA:t[4].id, teamB:t[5].id}
    ];
    localStorage.setItem(STORAGE.games, JSON.stringify(games));
  }
}

const getTeams = () => JSON.parse(localStorage.getItem(STORAGE.teams) || "[]");
const getCourts = () => JSON.parse(localStorage.getItem(STORAGE.courts) || "[]");
const getGames = () => JSON.parse(localStorage.getItem(STORAGE.games) || "[]");
const saveTeams = v => localStorage.setItem(STORAGE.teams, JSON.stringify(v));
const saveCourts = v => localStorage.setItem(STORAGE.courts, JSON.stringify(v));
const saveGames = v => localStorage.setItem(STORAGE.games, JSON.stringify(v));

function findTeam(id){ return getTeams().find(x=>x.id===id); }
function findCourt(id){ return getCourts().find(x=>x.id===id); }

function formatDate(date){
  return new Date(date+"T00:00:00").toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"});
}
function formatTime(time){
  const [h,m]=time.split(":").map(Number);
  const d=new Date(); d.setHours(h,m,0,0);
  return d.toLocaleTimeString("en-US",{hour:"numeric",minute:"2-digit"});
}

function switchPage(name){
  document.querySelectorAll(".page").forEach(p=>p.classList.remove("active-page"));
  document.getElementById("page-"+name).classList.add("active-page");
  document.querySelectorAll(".nav-link").forEach(b=>b.classList.toggle("active", b.dataset.page===name));
  document.getElementById("sidebar").classList.remove("open");
  renderAll();
}

function showModal(id){ document.getElementById(id).classList.add("show"); }
function closeModal(id){ document.getElementById(id).classList.remove("show"); }

function renderStats(){
  document.getElementById("statTeams").textContent=getTeams().length;
  document.getElementById("statGames").textContent=getGames().length;
  document.getElementById("statCourts").textContent=getCourts().length;
}

function gameRows(games, limit){
  const sorted=[...games].sort((a,b)=> (a.date+a.start).localeCompare(b.date+b.start));
  const arr=limit ? sorted.slice(0,limit) : sorted;
  if(!arr.length) return `<tr><td colspan="7" class="empty-row">No game schedules yet.</td></tr>`;
  return arr.map((g,i)=>{
    const a=findTeam(g.teamA)?.name||"Unknown";
    const b=findTeam(g.teamB)?.name||"Unknown";
    const court=findCourt(g.courtId)?.name||"Unknown";
    return `<tr>
      <td>${i+1}</td>
      <td>${formatDate(g.date)}</td>
      <td>${formatTime(g.start)}${limit ? " – "+formatTime(g.end):""}</td>
      ${limit ? `<td>${court}</td><td><strong>${a}</strong> &nbsp; vs &nbsp; <strong>${b}</strong></td><td><span class="badge green">Scheduled</span></td>` :
      `<td>${formatTime(g.end)}</td><td>${court}</td><td><strong>${a}</strong> vs <strong>${b}</strong></td><td><button class="icon-btn danger" onclick="deleteGame('${g.id}')">Delete</button></td>`}
    </tr>`;
  }).join("");
}

function renderDashboard(){
  document.getElementById("dashboardGames").innerHTML=gameRows(getGames(),5);
  renderCalendar();
}

function renderTeams(){
  const teams=getTeams();
  document.getElementById("teamsTable").innerHTML = teams.length ? teams.map((t,i)=>`
    <tr><td>${i+1}</td><td><strong>${t.name}</strong></td><td>${t.coach||"—"}</td>
    <td><button class="icon-btn danger" onclick="deleteTeam('${t.id}')">Delete</button></td></tr>`).join("")
    : `<tr><td colspan="4" class="empty-row">No teams added yet.</td></tr>`;
}

function renderCourts(){
  const courts=getCourts();
  document.getElementById("courtGrid").innerHTML = courts.length ? courts.map(c=>`
    <article class="court-card">
      <div class="court-icon">🏀</div>
      <h3>${c.name}</h3>
      <p>${c.location||"No location specified"}</p>
      <button class="icon-btn danger" onclick="deleteCourt('${c.id}')">Delete Court</button>
    </article>`).join("") : `<p>No courts added yet.</p>`;
}

function populateSelects(){
  const teams=getTeams();
  const courts=getCourts();
  const teamOptions=`<option value="">Select team</option>`+teams.map(t=>`<option value="${t.id}">${t.name}</option>`).join("");
  document.getElementById("teamA").innerHTML=teamOptions;
  document.getElementById("teamB").innerHTML=teamOptions;
  document.getElementById("teamViewSelect").innerHTML=`<option value="">Select a team</option>`+teams.map(t=>`<option value="${t.id}">${t.name}</option>`).join("");
  document.getElementById("gameCourt").innerHTML=`<option value="">Select court</option>`+courts.map(c=>`<option value="${c.id}">${c.name}</option>`).join("");
  document.getElementById("filterCourt").innerHTML=`<option value="">All Courts</option>`+courts.map(c=>`<option value="${c.id}">${c.name}</option>`).join("");
}

function renderSchedule(){
  const date=document.getElementById("filterDate").value;
  const court=document.getElementById("filterCourt").value;
  let games=getGames();
  if(date) games=games.filter(g=>g.date===date);
  if(court) games=games.filter(g=>g.courtId===court);
  document.getElementById("scheduleTable").innerHTML=gameRows(games);
}

function renderTeamView(){
  const id=document.getElementById("teamViewSelect").value;
  const tbody=document.getElementById("teamViewTable");
  if(!id){ tbody.innerHTML=`<tr><td colspan="4" class="empty-row">Select a team to view its schedule.</td></tr>`; return; }
  const games=getGames().filter(g=>g.teamA===id||g.teamB===id).sort((a,b)=>(a.date+a.start).localeCompare(b.date+b.start));
  tbody.innerHTML=games.length?games.map(g=>{
    const opp=g.teamA===id?findTeam(g.teamB)?.name:findTeam(g.teamA)?.name;
    return `<tr><td>${formatDate(g.date)}</td><td>${formatTime(g.start)} – ${formatTime(g.end)}</td><td>${opp||"Unknown"}</td><td>${findCourt(g.courtId)?.name||"Unknown"}</td></tr>`;
  }).join(""):`<tr><td colspan="4" class="empty-row">No games assigned to this team.</td></tr>`;
}

function renderCalendar(){
  const games=getGames();
  const now=new Date();
  const year=now.getFullYear(), month=now.getMonth();
  document.getElementById("calendarLabel").textContent=now.toLocaleDateString("en-US",{month:"long",year:"numeric"});
  const first=new Date(year,month,1).getDay();
  const days=new Date(year,month+1,0).getDate();
  const headers=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"].map(x=>`<div class="cal-head">${x}</div>`).join("");
  let cells="";
  for(let i=0;i<first;i++) cells+=`<div></div>`;
  for(let d=1;d<=days;d++){
    const iso=`${year}-${String(month+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
    const has=games.some(g=>g.date===iso);
    const today=d===now.getDate();
    cells+=`<div class="cal-day ${has?"has-game":""} ${today?"today":""}">${d}</div>`;
  }
  document.getElementById("calendar").innerHTML=`<div class="cal-grid">${headers}${cells}</div>`;
}

function hasCourtConflict(candidate){
  return getGames().some(g =>
    g.date===candidate.date &&
    g.courtId===candidate.courtId &&
    candidate.start < g.end &&
    candidate.end > g.start
  );
}

window.deleteGame=function(id){
  if(!confirm("Delete this game schedule?")) return;
  saveGames(getGames().filter(g=>g.id!==id));
  renderAll();
}
window.deleteTeam=function(id){
  if(getGames().some(g=>g.teamA===id||g.teamB===id)){
    alert("This team is already used in a game schedule. Delete its games first.");
    return;
  }
  saveTeams(getTeams().filter(t=>t.id!==id));
  renderAll();
}
window.deleteCourt=function(id){
  if(getGames().some(g=>g.courtId===id)){
    alert("This court is already used in a game schedule. Delete its games first.");
    return;
  }
  saveCourts(getCourts().filter(c=>c.id!==id));
  renderAll();
}

function flash(msg,type="success"){
  const box=document.getElementById("scheduleMessage");
  box.className=`message ${type}`;
  box.textContent=msg;
  setTimeout(()=>box.classList.add("hidden"),3500);
}

function renderAll(){
  renderStats();
  renderDashboard();
  renderTeams();
  renderCourts();
  populateSelects();
  renderSchedule();
  renderTeamView();
}

document.addEventListener("DOMContentLoaded",()=>{
  initData();
  renderAll();

  document.querySelectorAll(".nav-link").forEach(btn=>btn.addEventListener("click",()=>switchPage(btn.dataset.page)));
  document.querySelectorAll("[data-go]").forEach(btn=>btn.addEventListener("click",()=>switchPage(btn.dataset.go)));
  document.querySelectorAll("[data-close]").forEach(btn=>btn.addEventListener("click",()=>closeModal(btn.dataset.close)));
  document.querySelectorAll(".modal").forEach(m=>m.addEventListener("click",e=>{ if(e.target===m) closeModal(m.id); }));

  document.getElementById("menuBtn").addEventListener("click",()=>document.getElementById("sidebar").classList.toggle("open"));
  document.getElementById("openTeamModal").addEventListener("click",()=>showModal("teamModal"));
  document.getElementById("openCourtModal").addEventListener("click",()=>showModal("courtModal"));
  document.getElementById("openScheduleModal").addEventListener("click",()=>showModal("scheduleModal"));
  document.getElementById("heroCreateSchedule").addEventListener("click",()=>{switchPage("schedule"); showModal("scheduleModal");});

  document.getElementById("teamForm").addEventListener("submit",e=>{
    e.preventDefault();
    const name=document.getElementById("teamName").value.trim();
    const coach=document.getElementById("teamCoach").value.trim();
    const teams=getTeams();
    if(teams.some(t=>t.name.toLowerCase()===name.toLowerCase())) return alert("Team name already exists.");
    teams.push({id:crypto.randomUUID(),name,coach});
    saveTeams(teams); e.target.reset(); closeModal("teamModal"); renderAll();
  });

  document.getElementById("courtForm").addEventListener("submit",e=>{
    e.preventDefault();
    const name=document.getElementById("courtName").value.trim();
    const location=document.getElementById("courtLocation").value.trim();
    const courts=getCourts();
    if(courts.some(c=>c.name.toLowerCase()===name.toLowerCase())) return alert("Court name already exists.");
    courts.push({id:crypto.randomUUID(),name,location});
    saveCourts(courts); e.target.reset(); closeModal("courtModal"); renderAll();
  });

  document.getElementById("scheduleForm").addEventListener("submit",e=>{
    e.preventDefault();
    const candidate={
      id:crypto.randomUUID(),
      teamA:document.getElementById("teamA").value,
      teamB:document.getElementById("teamB").value,
      date:document.getElementById("gameDate").value,
      courtId:document.getElementById("gameCourt").value,
      start:document.getElementById("startTime").value,
      end:document.getElementById("endTime").value
    };
    const alertBox=document.getElementById("conflictAlert");
    alertBox.classList.add("hidden");

    if(candidate.teamA===candidate.teamB){
      alertBox.textContent="Team A and Team B must be different.";
      alertBox.classList.remove("hidden"); return;
    }
    if(candidate.end<=candidate.start){
      alertBox.textContent="End time must be later than start time.";
      alertBox.classList.remove("hidden"); return;
    }
    if(hasCourtConflict(candidate)){
      alertBox.textContent="Scheduling conflict: another game already uses this court during the selected time.";
      alertBox.classList.remove("hidden"); return;
    }

    const games=getGames(); games.push(candidate); saveGames(games);
    e.target.reset(); closeModal("scheduleModal"); renderAll();
    switchPage("schedule"); flash("Game schedule saved successfully. No court overlap detected.");
  });

  document.getElementById("filterDate").addEventListener("change",renderSchedule);
  document.getElementById("filterCourt").addEventListener("change",renderSchedule);
  document.getElementById("clearFilters").addEventListener("click",()=>{
    document.getElementById("filterDate").value="";
    document.getElementById("filterCourt").value="";
    renderSchedule();
  });
  document.getElementById("teamViewSelect").addEventListener("change",renderTeamView);
});
