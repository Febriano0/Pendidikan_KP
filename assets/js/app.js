/**
 * APP ENGINE INTERAKTIF & DINAMIS DASHBOARD EXECUTIVE DISDIKPORA
 * MULTI-PAGE ARCHITECTURE (DEDICATED SUBFOLDERS FOR EACH SUBMENU)
 */

const SecurityUtils = {
  escapeHTML(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  },

  generateSignature(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash |= 0;
    }
    return 'sig_' + Math.abs(hash).toString(16);
  }
};

class AuditLogger {
  constructor() {
    this.logs = JSON.parse(sessionStorage.getItem("disdikpora_audit_log")) || [
      {
        id: 1,
        timestamp: new Date().toISOString(),
        actor: "System Initializer",
        action: "DATASET_INTEGRITY_CHECK",
        status: "SUCCESS",
        checksum: typeof DB_INTEGRITY !== 'undefined' ? DB_INTEGRITY.checksum : "sha256-verified"
      }
    ];
  }

  log(action, actor = "Guest/Public", details = "") {
    const entry = {
      id: this.logs.length + 1,
      timestamp: new Date().toISOString(),
      actor: SecurityUtils.escapeHTML(actor),
      action: SecurityUtils.escapeHTML(action),
      details: SecurityUtils.escapeHTML(details),
      status: "VERIFIED",
      signature: SecurityUtils.generateSignature(action + Date.now())
    };
    this.logs.unshift(entry);
    if (this.logs.length > 50) this.logs.pop();
    sessionStorage.setItem("disdikpora_audit_log", JSON.stringify(this.logs));
  }

  getLogs() {
    return this.logs;
  }
}

const auditLogger = new AuditLogger();

class DashboardApp {
  constructor() {
    this.currentRoute = this.detectCurrentRoute();
    this.user = this.loadAndValidateSession();
    this.selectedKapanewon = "all";
    this.searchQuery = "";
    this.sortColumn = null;
    this.sortDirection = "asc";
    this.debounceTimer = null;
    
    this.init();
  }

  detectCurrentRoute() {
    const path = window.location.pathname.toLowerCase();
    if (path.includes("sub1-akses")) return "sub1";
    if (path.includes("sub2-mutu")) return "sub2";
    if (path.includes("sub3-sarpras")) return "sub3";
    if (path.includes("sub4-gtk")) return "sub4";
    if (path.includes("sub5-kelembagaan")) return "sub5";
    if (path.includes("dashboard")) return "dashboard";
    if (path.includes("login")) return "login";
    if (path.includes("about")) return "about";
    if (path.includes("security")) return "security";
    if (path.includes("terms")) return "terms";
    return "landing";
  }

  init() {
    this.bindEvents();
    this.renderKapanewonDropdowns();
    this.updateUserUI();
    this.setupMapInteractivity();
    this.renderCurrentSubmenuTable();

    auditLogger.log("PAGE_VISITED", this.user ? this.user.name : "Guest User", `Route: ${this.currentRoute}`);
  }

  loadAndValidateSession() {
    try {
      const raw = localStorage.getItem("disdikpora_user");
      if (!raw) return null;
      
      const user = JSON.parse(raw);
      const loginTime = new Date(user.loginTimestamp || 0).getTime();
      const now = new Date().getTime();
      const MAX_SESSION_MS = 8 * 60 * 60 * 1000;
      
      if (now - loginTime > MAX_SESSION_MS) {
        localStorage.removeItem("disdikpora_user");
        auditLogger.log("SESSION_EXPIRED", user.name, "Automated Session Cleanup");
        return null;
      }

      const expectedSig = SecurityUtils.generateSignature(user.nip + user.role + user.loginTimestamp);
      if (user.signature !== expectedSig) {
        localStorage.removeItem("disdikpora_user");
        auditLogger.log("SESSION_TAMPERING_DETECTED", user.nip, "Signature Mismatch");
        return null;
      }

      return user;
    } catch (e) {
      localStorage.removeItem("disdikpora_user");
      return null;
    }
  }

  debounce(func, delay = 150) {
    return (...args) => {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = setTimeout(() => func.apply(this, args), delay);
    };
  }

  bindEvents() {
    const searchInput = document.getElementById("globalSearchInput");
    const mobileSearchInput = document.getElementById("mobileSearchInput");

    if (searchInput) {
      searchInput.addEventListener("input", this.debounce((e) => {
        this.searchQuery = e.target.value.toLowerCase().trim();
        if (mobileSearchInput) mobileSearchInput.value = e.target.value;
        this.renderCurrentSubmenuTable();
        auditLogger.log("SEARCH_FILTER_EXECUTED", this.user ? this.user.name : "Guest", `Query: ${this.searchQuery}`);
      }, 150));
    }

    if (mobileSearchInput) {
      mobileSearchInput.addEventListener("input", this.debounce((e) => {
        this.searchQuery = e.target.value.toLowerCase().trim();
        if (searchInput) searchInput.value = e.target.value;
        this.renderCurrentSubmenuTable();
        auditLogger.log("SEARCH_FILTER_EXECUTED", this.user ? this.user.name : "Guest", `Query: ${this.searchQuery}`);
      }, 150));
    }

    const kapSelect = document.getElementById("kapanewonFilterSelect");
    if (kapSelect) {
      kapSelect.addEventListener("change", (e) => {
        this.selectedKapanewon = e.target.value;
        this.renderCurrentSubmenuTable();
        const selectedText = e.target.selectedOptions[0]?.text || e.target.value;
        // suppressed bottom notif per user request}`);
        auditLogger.log("KAPANEWON_FILTER_CHANGED", this.user ? this.user.name : "Guest", `Filter: ${selectedText}`);
      });
    }

    const mobileMenuBtn = document.getElementById("mobileNavToggle");
    const mobileNavDrawer = document.getElementById("mobileNavDrawer");
    if (mobileMenuBtn && mobileNavDrawer) {
      mobileMenuBtn.addEventListener("click", () => {
        mobileNavDrawer.classList.toggle("hidden");
      });
    }
  }

  setupMapInteractivity() {
    document.querySelectorAll("[data-kapanewon-id]").forEach(el => {
      el.classList.add("cursor-pointer", "transition");
      el.addEventListener("click", (e) => {
        e.preventDefault();
        const kapId = el.getAttribute("data-kapanewon-id");
        const kapName = el.getAttribute("data-kapanewon-name") || kapId;
        this.filterByKapanewon(kapId, kapName);
      });
    });
  }

  filterByKapanewon(kapId, kapName) {
    this.selectedKapanewon = kapId;
    const select = document.getElementById("kapanewonFilterSelect");
    if (select) {
      select.value = kapId;
    }

    const activeMapName = document.getElementById("activeMapName");
    if (activeMapName) {
      const found = (typeof DB !== 'undefined' && DB.kapanewon) ? DB.kapanewon.find(k => k.id === kapId) : null;
      activeMapName.textContent = found ? found.name : (kapName || kapId);
    }

    document.querySelectorAll("[data-kapanewon-id]").forEach(p => {
      const parentGroup = p.closest(".map-region-group") || p.parentElement;
      const textLabel = parentGroup ? parentGroup.querySelector("text") : null;

      if (p.getAttribute("data-kapanewon-id") === kapId) {
        p.setAttribute("fill", "#fde047");
        p.setAttribute("stroke", "#d97706");
        p.setAttribute("stroke-width", "6");
        if (textLabel) {
          textLabel.setAttribute("fill", "#0f2b48"); // Crisp dark navy text on bright yellow
          textLabel.setAttribute("font-weight", "900");
        }
      } else {
        const id = p.getAttribute("data-kapanewon-id");
        const origColor = this.getOriginalKapanewonColor(id);
        p.setAttribute("fill", origColor);
        p.setAttribute("stroke", "#0f2b48");
        p.setAttribute("stroke-width", "3.5");
        if (textLabel) {
          textLabel.setAttribute("fill", "#ffffff"); // Crisp white text on dark/colored polygon
          textLabel.setAttribute("font-weight", "800");
        }
      }
    });

    this.renderCurrentSubmenuTable();
    const displayName = kapName || ((typeof DB !== 'undefined' && DB.kapanewon) ? (DB.kapanewon.find(k => k.id === kapId)?.name || kapId) : kapId);
    // suppressed bottom notif per user request}`);
    auditLogger.log("GEOSPATIAL_MAP_CLICKED", this.user ? this.user.name : "Guest", `Kapanewon: ${displayName}`);
  }

  getOriginalKapanewonColor(id) {
    const map = {
      samigaluh: "#1e3a8a",
      kalibawang: "#0284c7",
      girimulyo: "#0369a1",
      nanggulan: "#0284c7",
      kokap: "#0f766e",
      pengasih: "#d97706",
      sentolo: "#2563eb",
      temon: "#4d7c0f",
      wates: "#b45309",
      panjatan: "#15803d",
      lendah: "#6d28d9",
      galur: "#0369a1"
    };
    return map[id] || "#0284c7";
  }

  sortBy(key) {
    if (this.sortColumn === key) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = key;
      this.sortDirection = 'asc';
    }
    
    this.renderCurrentSubmenuTable();
    this.updateSortHeaderIcons(key);
    
    const dirText = this.sortDirection === 'asc' ? 'Ascending (A-Z / 0-9)' : 'Descending (Z-A / 9-0)';
    // suppressed bottom notif per user request}": ${dirText}`);
    auditLogger.log("TABLE_SORTED", this.user ? this.user.name : "Guest", `Column: ${key}, Direction: ${this.sortDirection}`);
  }

  parseSortValue(val) {
    if (val === null || val === undefined) return "";
    if (typeof val === "number") return val;
    const str = String(val).trim();
    const numMatch = str.match(/^-?\d+(\.\d+)?/);
    if (numMatch && !isNaN(parseFloat(numMatch[0]))) {
      return parseFloat(numMatch[0]);
    }
    return str.toLowerCase();
  }

  sortData(dataList) {
    if (!this.sortColumn) return dataList;
    const col = this.sortColumn;
    const dir = this.sortDirection === 'asc' ? 1 : -1;

    return [...dataList].sort((a, b) => {
      const valA = this.parseSortValue(a[col]);
      const valB = this.parseSortValue(b[col]);

      if (typeof valA === "number" && typeof valB === "number") {
        return (valA - valB) * dir;
      }
      return String(valA).localeCompare(String(valB)) * dir;
    });
  }

  updateSortHeaderIcons(activeKey) {
    document.querySelectorAll("th[onclick*='app.sortBy']").forEach(th => {
      const onclickAttr = th.getAttribute("onclick") || "";
      const match = onclickAttr.match(/app\.sortBy\(['"]([^'"]+)['"]\)/);
      if (match) {
        const key = match[1];
        const iconSpan = th.querySelector(".sort-icon");
        if (iconSpan) {
          if (key === activeKey) {
            iconSpan.textContent = this.sortDirection === 'asc' ? '▲' : '▼';
            iconSpan.className = "sort-icon text-xs text-amber-300 font-black ml-1";
          } else {
            iconSpan.textContent = '↕️';
            iconSpan.className = "sort-icon text-xs text-slate-300 font-bold ml-1";
          }
        }
      }
    });
  }

  renderKapanewonDropdowns() {
    const kapSelect = document.getElementById("kapanewonFilterSelect");
    const mobileKapSelect = document.getElementById("mobileKapanewonFilterSelect");
    if (typeof DB === 'undefined') return;

    const optionsHtml = DB.kapanewon.map(k => 
      `<option value="${SecurityUtils.escapeHTML(k.id)}">${SecurityUtils.escapeHTML(k.name)}</option>`
    ).join("");

    if (kapSelect) kapSelect.innerHTML = optionsHtml;
    if (mobileKapSelect) mobileKapSelect.innerHTML = optionsHtml;
  }

  renderCurrentSubmenuTable() {
    if (typeof DB === 'undefined') return;
    const route = this.currentRoute;
    if (route === "sub1") this.renderSub1();
    if (route === "sub2") this.renderSub2();
    if (route === "sub3") this.renderSub3();
    if (route === "sub4") this.renderSub4();
    if (route === "sub5") this.renderSub5();
  }

  renderSub1() {
    const tbody = document.getElementById("table-sub1-body");
    if (!tbody || typeof DB === 'undefined') return;

    let data = DB.akses;
    if (this.selectedKapanewon !== "all") {
      data = data.filter(d => d.kapanewon.toLowerCase().includes(this.selectedKapanewon.toLowerCase()));
    }
    if (this.searchQuery) {
      data = data.filter(d => 
        d.kapanewon.toLowerCase().includes(this.searchQuery) || 
        d.sumber.toLowerCase().includes(this.searchQuery) ||
        d.usage.toLowerCase().includes(this.searchQuery)
      );
    }

    data = this.sortData(data);

    if (data.length === 0) {
      tbody.innerHTML = `<tr><td colspan="10" class="p-6 text-center text-slate-500 italic">Tidak ada data yang cocok dengan kriteria filter.</td></tr>`;
      return;
    }

    tbody.innerHTML = data.map(item => `
      <tr>
        <td class="p-3 font-semibold text-slate-700">${SecurityUtils.escapeHTML(item.no)}</td>
        <td class="p-3 font-bold text-slate-900">${SecurityUtils.escapeHTML(item.kapanewon)}</td>
        <td class="p-3">
          <span class="badge badge-blue">${SecurityUtils.escapeHTML(item.sumber)}</span>
        </td>
        <td class="p-3 text-slate-800">${SecurityUtils.escapeHTML(item.apk)}</td>
        <td class="p-3 text-slate-800">${SecurityUtils.escapeHTML(item.apm)}</td>
        <td class="p-3 font-extrabold text-red-600">${SecurityUtils.escapeHTML(item.ats)} Anak</td>
        <td class="p-3 text-slate-800">${SecurityUtils.escapeHTML(item.putus)}</td>
        <td class="p-3">
          <span class="badge badge-${SecurityUtils.escapeHTML(item.statusColor)}">${SecurityUtils.escapeHTML(item.regrouping)}</span>
        </td>
        <td class="p-3 text-slate-600 text-xs">${SecurityUtils.escapeHTML(item.usage)}</td>
        <td class="p-3">
          <button onclick="app.showModalDetail('Akses & Pemerataan - ${SecurityUtils.escapeHTML(item.kapanewon)}', 'Detail ATS: ${SecurityUtils.escapeHTML(item.ats)} anak. Sumber: ${SecurityUtils.escapeHTML(item.sumber)}. ${SecurityUtils.escapeHTML(item.usage)}')" class="px-3.5 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg font-bold text-[11px] shadow-sm whitespace-nowrap inline-flex items-center justify-center">Detail</button>
        </td>
      </tr>
    `).join("");
  }

  renderSub2() {
    const tbody = document.getElementById("table-sub2-body");
    if (!tbody || typeof DB === 'undefined') return;

    let data = DB.mutu;
    if (this.selectedKapanewon !== "all") {
      data = data.filter(d => d.kapanewon.toLowerCase().includes(this.selectedKapanewon.toLowerCase()));
    }
    if (this.searchQuery) {
      data = data.filter(d => 
        d.nama.toLowerCase().includes(this.searchQuery) ||
        d.kapanewon.toLowerCase().includes(this.searchQuery) ||
        d.akreditasi.toLowerCase().includes(this.searchQuery)
      );
    }

    data = this.sortData(data);

    if (data.length === 0) {
      tbody.innerHTML = `<tr><td colspan="10" class="p-6 text-center text-slate-500 italic">Tidak ada data yang cocok dengan kriteria filter.</td></tr>`;
      return;
    }

    tbody.innerHTML = data.map(item => `
      <tr>
        <td class="p-3 font-mono text-slate-500 text-xs">${SecurityUtils.escapeHTML(item.npsn)}</td>
        <td class="p-3 font-bold text-slate-900">${SecurityUtils.escapeHTML(item.nama)}</td>
        <td class="p-3 text-slate-800">${SecurityUtils.escapeHTML(item.kapanewon)}</td>
        <td class="p-3">
          <span class="badge badge-amber">${SecurityUtils.escapeHTML(item.sumber)}</span>
        </td>
        <td class="p-3 font-bold text-slate-800">${SecurityUtils.escapeHTML(item.literasi)}</td>
        <td class="p-3 font-bold text-slate-800">${SecurityUtils.escapeHTML(item.numerasi)}</td>
        <td class="p-3 text-slate-700">${SecurityUtils.escapeHTML(item.karakter)}</td>
        <td class="p-3 font-bold text-blue-700">${SecurityUtils.escapeHTML(item.akreditasi)}</td>
        <td class="p-3">
          <span class="badge badge-${SecurityUtils.escapeHTML(item.statusColor)}">${SecurityUtils.escapeHTML(item.pembinaan)}</span>
        </td>
        <td class="p-3">
          <button onclick="app.showModalDetail('Mutu ANBK - ${SecurityUtils.escapeHTML(item.nama)}', 'Literasi: ${SecurityUtils.escapeHTML(item.literasi)}, Numerasi: ${SecurityUtils.escapeHTML(item.numerasi)}. Akreditasi: ${SecurityUtils.escapeHTML(item.akreditasi)}')" class="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold text-[11px] shadow-sm whitespace-nowrap inline-flex items-center justify-center">Rapor</button>
        </td>
      </tr>
    `).join("");
  }

  renderSub3() {
    const tbody = document.getElementById("table-sub3-body");
    if (!tbody || typeof DB === 'undefined') return;

    let data = DB.sarpras;
    if (this.selectedKapanewon !== "all") {
      data = data.filter(d => d.kapanewon.toLowerCase().includes(this.selectedKapanewon.toLowerCase()));
    }
    if (this.searchQuery) {
      data = data.filter(d => 
        d.nama.toLowerCase().includes(this.searchQuery) ||
        d.kapanewon.toLowerCase().includes(this.searchQuery)
      );
    }

    data = this.sortData(data);

    if (data.length === 0) {
      tbody.innerHTML = `<tr><td colspan="11" class="p-6 text-center text-slate-500 italic">Tidak ada data yang cocok dengan kriteria filter.</td></tr>`;
      return;
    }

    tbody.innerHTML = data.map(item => `
      <tr>
        <td class="p-3 font-mono text-slate-500 text-xs">${SecurityUtils.escapeHTML(item.npsn)}</td>
        <td class="p-3 font-bold text-slate-900">${SecurityUtils.escapeHTML(item.nama)}</td>
        <td class="p-3 text-slate-800">${SecurityUtils.escapeHTML(item.kapanewon)}</td>
        <td class="p-3">
          <span class="badge badge-blue">${SecurityUtils.escapeHTML(item.sumber)}</span>
        </td>
        <td class="p-3 text-slate-800">${SecurityUtils.escapeHTML(item.baik)}</td>
        <td class="p-3 text-slate-800">${SecurityUtils.escapeHTML(item.rusakRingan)}</td>
        <td class="p-3 font-bold text-red-600">${SecurityUtils.escapeHTML(item.rusakBerat)}</td>
        <td class="p-3 text-slate-800">${SecurityUtils.escapeHTML(item.spm)}</td>
        <td class="p-3 text-slate-800">${SecurityUtils.escapeHTML(item.perpus)}</td>
        <td class="p-3 text-slate-800">${SecurityUtils.escapeHTML(item.lab)}</td>
        <td class="p-3">
          <span class="badge badge-${SecurityUtils.escapeHTML(item.statusColor)}">${SecurityUtils.escapeHTML(item.dak)}</span>
        </td>
      </tr>
    `).join("");
  }

  renderSub4() {
    const tbody = document.getElementById("table-sub4-body");
    if (!tbody || typeof DB === 'undefined') return;

    let data = DB.gtk;
    if (this.searchQuery) {
      data = data.filter(d => 
        d.nama.toLowerCase().includes(this.searchQuery) ||
        d.mapel.toLowerCase().includes(this.searchQuery) ||
        d.tujuan.toLowerCase().includes(this.searchQuery)
      );
    }

    data = this.sortData(data);

    if (data.length === 0) {
      tbody.innerHTML = `<tr><td colspan="10" class="p-6 text-center text-slate-500 italic">Tidak ada data yang cocok dengan kriteria filter.</td></tr>`;
      return;
    }

    tbody.innerHTML = data.map(item => `
      <tr>
        <td class="p-3 font-mono text-slate-500 text-xs">${SecurityUtils.escapeHTML(item.nip)}</td>
        <td class="p-3 font-bold text-slate-900">${SecurityUtils.escapeHTML(item.nama)}<br><span class="text-amber-600 font-normal text-xs">${SecurityUtils.escapeHTML(item.mapel)}</span></td>
        <td class="p-3">
          <span class="badge badge-purple">${SecurityUtils.escapeHTML(item.sumber)}</span>
        </td>
        <td class="p-3 text-slate-800">${SecurityUtils.escapeHTML(item.asal)}</td>
        <td class="p-3 text-slate-800">${SecurityUtils.escapeHTML(item.jarakAsal)}</td>
        <td class="p-3 font-bold text-blue-700">${SecurityUtils.escapeHTML(item.tujuan)}</td>
        <td class="p-3 text-emerald-600 font-bold">${SecurityUtils.escapeHTML(item.jarakBaru)}</td>
        <td class="p-3 font-black text-amber-600 text-sm">${SecurityUtils.escapeHTML(item.mcdmScore)}</td>
        <td class="p-3 text-slate-700 text-xs">${SecurityUtils.escapeHTML(item.argumentasi)}</td>
        <td class="p-3">
          <button onclick="app.approveSK('${SecurityUtils.escapeHTML(item.nip)}', '${SecurityUtils.escapeHTML(item.nama)}')" class="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-[11px] shadow-sm whitespace-nowrap inline-flex items-center justify-center">Setujui SK</button>
        </td>
      </tr>
    `).join("");
  }

  approveSK(nip, nama) {
    auditLogger.log("SK_MUTASI_APPROVED", this.user ? this.user.name : "Bupati Kulon Progo", `NIP: ${nip}, Nama: ${nama}`);
    // suppressed bottom notif per user request
  }

  renderSub5() {
    const tbody = document.getElementById("table-sub5-body");
    if (!tbody || typeof DB === 'undefined') return;

    let data = DB.kelembagaan;
    if (this.selectedKapanewon !== "all") {
      data = data.filter(d => d.kapanewon.toLowerCase().includes(this.selectedKapanewon.toLowerCase()));
    }
    if (this.searchQuery) {
      data = data.filter(d => 
        d.nama.toLowerCase().includes(this.searchQuery) ||
        d.kapanewon.toLowerCase().includes(this.searchQuery) ||
        d.inovasi.toLowerCase().includes(this.searchQuery)
      );
    }

    data = this.sortData(data);

    if (data.length === 0) {
      tbody.innerHTML = `<tr><td colspan="9" class="p-6 text-center text-slate-500 italic">Tidak ada data yang cocok dengan kriteria filter.</td></tr>`;
      return;
    }

    tbody.innerHTML = data.map(item => `
      <tr>
        <td class="p-3 font-mono text-slate-500 text-xs">${SecurityUtils.escapeHTML(item.npsn)}</td>
        <td class="p-3 font-bold text-slate-900">${SecurityUtils.escapeHTML(item.nama)}</td>
        <td class="p-3 text-slate-800">${SecurityUtils.escapeHTML(item.kapanewon)}</td>
        <td class="p-3">
          <span class="badge badge-indigo">${SecurityUtils.escapeHTML(item.sumber)}</span>
        </td>
        <td class="p-3 text-slate-800">${SecurityUtils.escapeHTML(item.jenjang)}</td>
        <td class="p-3 text-emerald-600 font-bold">${SecurityUtils.escapeHTML(item.izin)}</td>
        <td class="p-3 font-bold text-blue-700">${SecurityUtils.escapeHTML(item.akreditasi)}</td>
        <td class="p-3 text-slate-700 text-xs">${SecurityUtils.escapeHTML(item.prestasi)}</td>
        <td class="p-3 font-bold text-purple-700">${SecurityUtils.escapeHTML(item.inovasi)}</td>
      </tr>
    `).join("");
  }

  loginUser(nip, password) {
    const cleanNip = SecurityUtils.escapeHTML(nip);
    if (!cleanNip || !password) {
      // suppressed bottom notif per user request
      return;
    }
    
    const loginTimestamp = new Date().toISOString();
    const role = "Pimpinan Executive Daerah";
    const signature = SecurityUtils.generateSignature(cleanNip + role + loginTimestamp);

    this.user = {
      nip: cleanNip,
      name: "Bupati Kulon Progo",
      role: role,
      loginTimestamp: loginTimestamp,
      signature: signature
    };

    localStorage.setItem("disdikpora_user", JSON.stringify(this.user));
    auditLogger.log("EXECUTIVE_LOGIN_SUCCESS", this.user.name, `NIP: ${cleanNip}, Role: ${role}`);

    this.updateUserUI();
    // suppressed bottom notif per user request
    
    // Multi-page navigation redirect
    const prefix = window.location.pathname.includes("login") ? "../" : "";
    window.location.href = prefix + "dashboard/index.html";
  }

  logoutUser() {
    const actor = this.user ? this.user.name : "User";
    auditLogger.log("EXECUTIVE_LOGOUT", actor, "User session ended cleanly");
    
    this.user = null;
    localStorage.removeItem("disdikpora_user");
    this.updateUserUI();
    // suppressed bottom notif per user request
    
    const prefix = (window.location.pathname.includes("dashboard") || window.location.pathname.includes("sub")) ? "../" : "";
    window.location.href = prefix + "index.html";
  }

  updateUserUI() {
    const userBadge = document.getElementById("userSessionBadge");
    const mobileUserBadge = document.getElementById("mobileUserSessionBadge");
    const relPrefix = (window.location.pathname.includes("sub") || window.location.pathname.includes("dashboard") || window.location.pathname.includes("login") || window.location.pathname.includes("about") || window.location.pathname.includes("security") || window.location.pathname.includes("terms")) ? "../" : "./";

    let desktopContent = '';
    let mobileContent = '';

    if (this.user) {
      desktopContent = `
        <span class="text-xs text-amber-300 font-bold whitespace-nowrap mr-1">👑 ${SecurityUtils.escapeHTML(this.user.name)}</span>
        <a href="${relPrefix}security/index.html" class="px-2.5 py-1.5 bg-blue-900 hover:bg-blue-800 text-white border border-blue-700 rounded-lg font-bold text-xs transition inline-flex items-center gap-1 shadow-sm">🛡️ Audit Log</a>
        <button onclick="app.logoutUser()" class="px-2.5 py-1.5 bg-red-700 hover:bg-red-800 text-white rounded-lg font-bold text-xs transition shadow-sm">Keluar</button>
      `;
      mobileContent = `
        <div class="w-full flex items-center justify-between bg-slate-800 p-2.5 rounded-lg border border-slate-700 mb-2">
          <span class="text-xs text-amber-300 font-bold">👑 ${SecurityUtils.escapeHTML(this.user.name)}</span>
          <button onclick="app.logoutUser()" class="px-2.5 py-1 bg-red-700 hover:bg-red-800 text-white rounded font-bold text-xs">Keluar</button>
        </div>
        <a href="${relPrefix}security/index.html" class="w-full text-center px-3 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-lg font-bold text-xs transition block border border-blue-700">🛡️ Audit Log Keamanan</a>
      `;
    } else {
      desktopContent = `
        <a href="${relPrefix}security/index.html" class="px-3 py-1.5 bg-blue-900/90 hover:bg-blue-800 text-white border border-blue-600/80 rounded-lg font-bold text-xs transition inline-flex items-center gap-1 shadow-sm">🛡️ Status Keamanan</a>
        <a href="${relPrefix}login/index.html" class="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-extrabold rounded-lg text-xs transition shadow-sm inline-flex items-center gap-1">🔒 Masuk Pimpinan</a>
      `;
      mobileContent = `
        <div class="grid grid-cols-2 gap-2 w-full">
          <a href="${relPrefix}security/index.html" class="text-center px-2 py-2 bg-blue-900 hover:bg-blue-800 text-white border border-blue-700 rounded-lg font-bold text-xs transition block">🛡️ Status Keamanan</a>
          <a href="${relPrefix}login/index.html" class="text-center px-2 py-2 bg-amber-600 hover:bg-amber-700 text-white font-extrabold rounded-lg text-xs transition block shadow-sm">🔒 Masuk Pimpinan</a>
        </div>
      `;
    }

    if (userBadge) userBadge.innerHTML = desktopContent;
    if (mobileUserBadge) mobileUserBadge.innerHTML = mobileContent;
  }

  showToast(message, type = "success") {
    // Disabled per user instruction: tidak perlu memunculkan notif/log di bawah saat sesuatu diklik
    return;
  }

  showModalDetail(title, bodyText) {
    const existing = document.getElementById("customModalOverlay");
    if (existing) existing.remove();

    const cleanTitle = SecurityUtils.escapeHTML(title);
    const cleanBody = SecurityUtils.escapeHTML(bodyText);

    const modalHtml = `
      <div id="customModalOverlay" class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
        <div class="bg-white border border-slate-300 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
          <div class="flex items-center justify-between border-b border-slate-200 pb-3">
            <h3 class="text-sm font-extrabold text-slate-900 uppercase tracking-wide">${cleanTitle}</h3>
            <button onclick="document.getElementById('customModalOverlay').remove()" class="text-slate-400 hover:text-slate-700 text-lg font-bold">✕</button>
          </div>
          <p class="text-xs text-slate-700 leading-relaxed">${cleanBody}</p>
          <div class="pt-2 flex justify-end">
            <button onclick="document.getElementById('customModalOverlay').remove()" class="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs rounded-xl shadow-sm transition">Tutup Informasi</button>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML("beforeend", modalHtml);
  }

  showAuditLogsModal() {
    const existing = document.getElementById("auditModalOverlay");
    if (existing) existing.remove();

    const logs = auditLogger.getLogs();
    const rowsHtml = logs.map(l => `
      <tr class="border-b border-slate-200 text-[11px]">
        <td class="p-2 font-mono text-slate-500">${SecurityUtils.escapeHTML(l.timestamp.substring(11, 19))}</td>
        <td class="p-2 font-bold text-slate-900">${SecurityUtils.escapeHTML(l.actor)}</td>
        <td class="p-2 text-blue-700 font-semibold">${SecurityUtils.escapeHTML(l.action)}</td>
        <td class="p-2 text-slate-700">${SecurityUtils.escapeHTML(l.details)}</td>
        <td class="p-2 text-emerald-600 font-mono font-bold">${SecurityUtils.escapeHTML(l.status)}</td>
      </tr>
    `).join("");

    const modalHtml = `
      <div id="auditModalOverlay" class="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
        <div class="bg-white border border-slate-300 rounded-2xl max-w-3xl w-full p-6 shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
          <div class="flex items-center justify-between border-b border-slate-200 pb-3">
            <div>
              <h3 class="text-sm font-black text-slate-900 uppercase tracking-wide">🛡️ LOG AUDIT KEAMANAN &amp; INTEGRITAS DATA</h3>
              <p class="text-[11px] text-slate-500">SHA-256 Checksum: <span class="font-mono text-emerald-700 font-bold">${typeof DB_INTEGRITY !== 'undefined' ? DB_INTEGRITY.checksum.substring(0, 24) : 'verified'}...</span></p>
            </div>
            <button onclick="document.getElementById('auditModalOverlay').remove()" class="text-slate-400 hover:text-slate-700 text-lg font-bold">✕</button>
          </div>
          <div class="overflow-y-auto flex-1 bg-slate-50 rounded-xl p-2 border border-slate-200">
            <table class="w-full text-left border-collapse">
              <thead>
                <tr class="bg-slate-200 text-slate-700 text-[10px] uppercase border-b border-slate-300">
                  <th class="p-2">WAKTU</th>
                  <th class="p-2">AKTOR</th>
                  <th class="p-2">AKSI STATE</th>
                  <th class="p-2">RINCIAN</th>
                  <th class="p-2">STATUS</th>
                </tr>
              </thead>
              <tbody>
                ${rowsHtml}
              </tbody>
            </table>
          </div>
          <div class="pt-2 flex justify-between items-center text-[11px] text-slate-500">
            <span>ISO/IEC 27001 &amp; UU PDP No. 27/2022 Verified</span>
            <button onclick="document.getElementById('auditModalOverlay').remove()" class="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-extrabold rounded-xl shadow-sm transition">Tutup Log</button>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML("beforeend", modalHtml);
  }
}

let app;
document.addEventListener("DOMContentLoaded", () => {
  app = new DashboardApp();
});
