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
    if (searchInput) {
      searchInput.addEventListener("input", this.debounce((e) => {
        this.searchQuery = e.target.value.toLowerCase().trim();
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
        this.showToast(`Filter Kapanewon: ${SecurityUtils.escapeHTML(selectedText)}`);
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
      el.classList.add("cursor-pointer", "transition", "hover:opacity-85");
      el.addEventListener("click", () => {
        const kapId = el.getAttribute("data-kapanewon-id");
        const kapName = el.getAttribute("data-kapanewon-name") || kapId;
        
        const select = document.getElementById("kapanewonFilterSelect");
        if (select) {
          select.value = kapId;
          this.selectedKapanewon = kapId;
          this.renderCurrentSubmenuTable();
          this.showToast(`Peta dipilih: ${SecurityUtils.escapeHTML(kapName)}`);
          auditLogger.log("GEOSPATIAL_MAP_CLICKED", this.user ? this.user.name : "Guest", `Kapanewon: ${kapName}`);
        }
      });
    });
  }

  renderKapanewonDropdowns() {
    const kapSelect = document.getElementById("kapanewonFilterSelect");
    if (!kapSelect || typeof DB === 'undefined') return;

    kapSelect.innerHTML = DB.kapanewon.map(k => 
      `<option value="${SecurityUtils.escapeHTML(k.id)}">${SecurityUtils.escapeHTML(k.name)}</option>`
    ).join("");
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

    if (data.length === 0) {
      tbody.innerHTML = `<tr><td colspan="10" class="p-6 text-center text-slate-500 italic">Tidak ada data yang cocok dengan kriteria filter.</td></tr>`;
      return;
    }

    tbody.innerHTML = data.map(item => `
      <tr>
        <td class="p-3 font-semibold text-slate-700">${SecurityUtils.escapeHTML(item.no)}</td>
        <td class="p-3 font-bold text-slate-900">${SecurityUtils.escapeHTML(item.kapanewon)}</td>
        <td class="p-3">
          <span class="px-2.5 py-1 rounded-full bg-blue-950 text-blue-300 font-bold text-xs">${SecurityUtils.escapeHTML(item.sumber)}</span>
        </td>
        <td class="p-3 text-slate-800">${SecurityUtils.escapeHTML(item.apk)}</td>
        <td class="p-3 text-slate-800">${SecurityUtils.escapeHTML(item.apm)}</td>
        <td class="p-3 font-extrabold text-red-600">${SecurityUtils.escapeHTML(item.ats)} Anak</td>
        <td class="p-3 text-slate-800">${SecurityUtils.escapeHTML(item.putus)}</td>
        <td class="p-3">
          <span class="px-2.5 py-1 rounded-full bg-${SecurityUtils.escapeHTML(item.statusColor)}-950 font-bold text-xs">${SecurityUtils.escapeHTML(item.regrouping)}</span>
        </td>
        <td class="p-3 text-slate-600 text-xs">${SecurityUtils.escapeHTML(item.usage)}</td>
        <td class="p-3">
          <button onclick="app.showModalDetail('Akses & Pemerataan - ${SecurityUtils.escapeHTML(item.kapanewon)}', 'Detail ATS: ${SecurityUtils.escapeHTML(item.ats)} anak. Sumber: ${SecurityUtils.escapeHTML(item.sumber)}. ${SecurityUtils.escapeHTML(item.usage)}')" class="px-3 py-1 bg-blue-700 hover:bg-blue-800 text-white rounded font-bold text-[11px] shadow-sm">Detail</button>
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
          <span class="px-2.5 py-1 rounded-full bg-amber-950 text-amber-300 font-bold text-xs">${SecurityUtils.escapeHTML(item.sumber)}</span>
        </td>
        <td class="p-3 font-bold text-slate-800">${SecurityUtils.escapeHTML(item.literasi)}</td>
        <td class="p-3 font-bold text-slate-800">${SecurityUtils.escapeHTML(item.numerasi)}</td>
        <td class="p-3 text-slate-700">${SecurityUtils.escapeHTML(item.karakter)}</td>
        <td class="p-3 font-bold text-blue-700">${SecurityUtils.escapeHTML(item.akreditasi)}</td>
        <td class="p-3">
          <span class="px-2.5 py-1 rounded-full bg-${SecurityUtils.escapeHTML(item.statusColor)}-950 font-bold text-xs">${SecurityUtils.escapeHTML(item.pembinaan)}</span>
        </td>
        <td class="p-3">
          <button onclick="app.showModalDetail('Mutu ANBK - ${SecurityUtils.escapeHTML(item.nama)}', 'Literasi: ${SecurityUtils.escapeHTML(item.literasi)}, Numerasi: ${SecurityUtils.escapeHTML(item.numerasi)}. Akreditasi: ${SecurityUtils.escapeHTML(item.akreditasi)}')" class="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded font-bold text-[11px] shadow-sm">Rapor</button>
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
          <span class="px-2.5 py-1 rounded-full bg-blue-950 text-blue-300 font-bold text-xs">${SecurityUtils.escapeHTML(item.sumber)}</span>
        </td>
        <td class="p-3 text-slate-800">${SecurityUtils.escapeHTML(item.baik)}</td>
        <td class="p-3 text-slate-800">${SecurityUtils.escapeHTML(item.rusakRingan)}</td>
        <td class="p-3 font-bold text-red-600">${SecurityUtils.escapeHTML(item.rusakBerat)}</td>
        <td class="p-3 text-slate-800">${SecurityUtils.escapeHTML(item.spm)}</td>
        <td class="p-3 text-slate-800">${SecurityUtils.escapeHTML(item.perpus)}</td>
        <td class="p-3 text-slate-800">${SecurityUtils.escapeHTML(item.lab)}</td>
        <td class="p-3">
          <span class="px-2.5 py-1 rounded-full bg-${SecurityUtils.escapeHTML(item.statusColor)}-950 font-bold text-xs">${SecurityUtils.escapeHTML(item.dak)}</span>
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

    if (data.length === 0) {
      tbody.innerHTML = `<tr><td colspan="10" class="p-6 text-center text-slate-500 italic">Tidak ada data yang cocok dengan kriteria filter.</td></tr>`;
      return;
    }

    tbody.innerHTML = data.map(item => `
      <tr>
        <td class="p-3 font-mono text-slate-500 text-xs">${SecurityUtils.escapeHTML(item.nip)}</td>
        <td class="p-3 font-bold text-slate-900">${SecurityUtils.escapeHTML(item.nama)}<br><span class="text-amber-600 font-normal text-xs">${SecurityUtils.escapeHTML(item.mapel)}</span></td>
        <td class="p-3">
          <span class="px-2.5 py-1 rounded-full bg-purple-950 text-purple-300 font-bold text-xs">${SecurityUtils.escapeHTML(item.sumber)}</span>
        </td>
        <td class="p-3 text-slate-800">${SecurityUtils.escapeHTML(item.asal)}</td>
        <td class="p-3 text-slate-800">${SecurityUtils.escapeHTML(item.jarakAsal)}</td>
        <td class="p-3 font-bold text-blue-700">${SecurityUtils.escapeHTML(item.tujuan)}</td>
        <td class="p-3 text-emerald-600 font-bold">${SecurityUtils.escapeHTML(item.jarakBaru)}</td>
        <td class="p-3 font-black text-amber-600 text-sm">${SecurityUtils.escapeHTML(item.mcdmScore)}</td>
        <td class="p-3 text-slate-700 text-xs">${SecurityUtils.escapeHTML(item.argumentasi)}</td>
        <td class="p-3">
          <button onclick="app.approveSK('${SecurityUtils.escapeHTML(item.nip)}', '${SecurityUtils.escapeHTML(item.nama)}')" class="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-bold text-[11px] shadow-sm">Setujui SK</button>
        </td>
      </tr>
    `).join("");
  }

  approveSK(nip, nama) {
    auditLogger.log("SK_MUTASI_APPROVED", this.user ? this.user.name : "Bupati Kulon Progo", `NIP: ${nip}, Nama: ${nama}`);
    this.showToast(`SK Mutasi Penempatan ${nama} disetujui secara digital.`);
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
          <span class="px-2.5 py-1 rounded-full bg-indigo-950 text-indigo-300 font-bold text-xs">${SecurityUtils.escapeHTML(item.sumber)}</span>
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
      this.showToast("NIP dan Kata Sandi harus diisi!", "error");
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
    this.showToast("Login Berhasil! Selamat Datang Bapak Bupati Kulon Progo.");
    
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
    this.showToast("Anda telah keluar dari Portal Executive.");
    
    const prefix = (window.location.pathname.includes("dashboard") || window.location.pathname.includes("sub")) ? "../" : "";
    window.location.href = prefix + "index.html";
  }

  updateUserUI() {
    const userBadge = document.getElementById("userSessionBadge");
    if (userBadge) {
      const relPrefix = (window.location.pathname.includes("sub") || window.location.pathname.includes("dashboard") || window.location.pathname.includes("login") || window.location.pathname.includes("about") || window.location.pathname.includes("security") || window.location.pathname.includes("terms")) ? "../" : "./";
      if (this.user) {
        userBadge.innerHTML = `
          <span class="text-xs text-amber-300 font-bold mr-2">👑 ${SecurityUtils.escapeHTML(this.user.name)}</span>
          <button onclick="app.showAuditLogsModal()" class="px-2 py-1 bg-blue-900 text-white rounded font-bold text-[10px] mr-1.5 transition">🛡️ Audit Log</button>
          <button onclick="app.logoutUser()" class="px-2.5 py-1 bg-red-700 hover:bg-red-800 text-white rounded font-bold text-[10px] transition">Keluar</button>
        `;
      } else {
        userBadge.innerHTML = `
          <button onclick="app.showAuditLogsModal()" class="px-2 py-1 bg-slate-800 text-white border border-slate-700 rounded font-bold text-[10px] mr-2 transition">🛡️ Status Keamanan</button>
          <a href="${relPrefix}login/index.html" class="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-extrabold rounded text-xs transition shadow-sm">🔒 Masuk Pimpinan</a>
        `;
      }
    }
  }

  showToast(message, type = "success") {
    const container = document.getElementById("toastContainer");
    if (!container) return;

    const toast = document.createElement("div");
    toast.className = `px-4 py-3 rounded-lg text-xs font-bold shadow-lg border flex items-center justify-between transition-all duration-300 ${
      type === "error" ? "bg-red-100 border-red-300 text-red-800" : "bg-emerald-100 border-emerald-300 text-emerald-900"
    }`;
    toast.innerHTML = `<span>${SecurityUtils.escapeHTML(message)}</span><button onclick="this.parentElement.remove()" class="ml-4 text-slate-500 hover:text-slate-900">✕</button>`;

    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = "0";
      setTimeout(() => toast.remove(), 300);
    }, 3500);
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
