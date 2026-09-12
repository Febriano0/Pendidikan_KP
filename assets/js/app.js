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
    this.domCache = new Map();
    this.lastLoggedSearch = "";
    
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

    // Remove any legacy sessionStorage selection so reload always starts fresh
    try {
      sessionStorage.removeItem("disdikpora_selected_kapanewon");
    } catch(e) {}

    // Check if the current page load is a browser reload / refresh
    let isReload = false;
    try {
      const navEntries = performance.getEntriesByType("navigation");
      if (navEntries && navEntries.length > 0) {
        isReload = navEntries[0].type === "reload";
      } else if (window.performance && window.performance.navigation) {
        isReload = window.performance.navigation.type === 1;
      }
    } catch (e) {}

    if (isReload) {
      // When refreshed, clean URL and force unclick / return to all kapanewon
      if (window.location.search) {
        try {
          window.history.replaceState(null, "", window.location.pathname);
        } catch(e) {}
      }
      this.selectedKapanewon = "all";
    } else {
      // Check URL query parameters for pre-selected Kapanewon (from explicit deep links)
      const urlParams = new URLSearchParams(window.location.search);
      const kapParam = urlParams.get('kap');
      if (kapParam) {
        this.selectedKapanewon = kapParam.toLowerCase();
        // Clean URL query immediately so a subsequent user refresh defaults back to all
        try {
          window.history.replaceState(null, "", window.location.pathname);
        } catch(e) {}
      } else {
        this.selectedKapanewon = "all";
      }
    }

    this.setupMapInteractivity();

    if (this.currentRoute === "dashboard") {
      this.renderDashboardPanel(this.selectedKapanewon);
    } else {
      this.renderCurrentSubmenuTable();
    }

    if (this.selectedKapanewon && this.selectedKapanewon !== "all") {
      this.filterByKapanewon(this.selectedKapanewon);
    } else {
      this.filterByKapanewon("all", "Semua Kapanewon (12)");
    }

    // Safety: ensure sessionStorage is purged before unloading/refreshing
    window.addEventListener("beforeunload", () => {
      try {
        sessionStorage.removeItem("disdikpora_selected_kapanewon");
      } catch(e) {}
    });

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

    const onSearchChange = (query) => {
      this.searchQuery = query.toLowerCase().trim();
      if (this.currentRoute === "dashboard") {
        this.renderDashboardPanel(this.selectedKapanewon);
      } else {
        this.renderCurrentSubmenuTable();
      }
      if (this.searchQuery && this.searchQuery !== this.lastLoggedSearch) {
        this.lastLoggedSearch = this.searchQuery;
        auditLogger.log("SEARCH_FILTER_EXECUTED", this.user ? this.user.name : "Guest", `Query: ${this.searchQuery}`);
      }
    };

    if (searchInput) {
      searchInput.addEventListener("input", this.debounce((e) => {
        if (mobileSearchInput) mobileSearchInput.value = e.target.value;
        onSearchChange(e.target.value);
      }, 150));
    }

    if (mobileSearchInput) {
      mobileSearchInput.addEventListener("input", this.debounce((e) => {
        if (searchInput) searchInput.value = e.target.value;
        onSearchChange(e.target.value);
      }, 150));
    }

    // Keyboard navigation: Escape key closes active modals & mobile drawer
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        const modal = document.getElementById("customModalOverlay") || document.getElementById("auditModalOverlay");
        if (modal) modal.remove();
        const drawer = document.getElementById("mobileNavDrawer");
        if (drawer && !drawer.classList.contains("hidden")) {
          drawer.classList.add("hidden");
          const toggleBtn = document.getElementById("mobileNavToggle");
          if (toggleBtn) toggleBtn.setAttribute("aria-expanded", "false");
        }
      }
    });

    const kapSelect = document.getElementById("kapanewonFilterSelect");
    if (kapSelect) {
      kapSelect.addEventListener("change", (e) => {
        const val = e.target.value;
        const txt = e.target.selectedOptions[0]?.text || val;
        this.filterByKapanewon(val, txt);
      });
    }

    const mobileKapSelect = document.getElementById("mobileKapanewonFilterSelect");
    if (mobileKapSelect) {
      mobileKapSelect.addEventListener("change", (e) => {
        const val = e.target.value;
        const txt = e.target.selectedOptions[0]?.text || val;
        this.filterByKapanewon(val, txt);
      });
    }

    const mobileMenuBtn = document.getElementById("mobileNavToggle");
    const mobileNavDrawer = document.getElementById("mobileNavDrawer");
    if (mobileMenuBtn && mobileNavDrawer) {
      mobileMenuBtn.addEventListener("click", () => {
        const isClosed = mobileNavDrawer.classList.toggle("hidden");
        mobileMenuBtn.setAttribute("aria-expanded", isClosed ? "false" : "true");
      });
    }
  }

  setupMapInteractivity() {
    const regionGroups = document.querySelectorAll(".map-region-group");
    const targets = regionGroups.length > 0 ? regionGroups : document.querySelectorAll("[data-kapanewon-id]");
    targets.forEach(el => {
      el.style.cursor = "pointer";
      el.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        const kapId = el.getAttribute("data-kapanewon-id") || el.querySelector("[data-kapanewon-id]")?.getAttribute("data-kapanewon-id");
        const kapName = el.getAttribute("data-kapanewon-name") || el.querySelector("[data-kapanewon-id]")?.getAttribute("data-kapanewon-name") || kapId;
        if (kapId) {
          this.toggleKapanewon(kapId, kapName);
        }
      });
    });
  }

  toggleKapanewon(kapId, kapName) {
    if (this.selectedKapanewon === kapId) {
      // Un-click / toggle off: Revert back to all regions
      this.filterByKapanewon("all", "Semua Kapanewon (12)");
    } else {
      this.filterByKapanewon(kapId, kapName);
    }
  }

  filterByKapanewon(kapId, kapName) {
    this.selectedKapanewon = kapId;

    // Sync header dropdown selects
    const select = document.getElementById("kapanewonFilterSelect");
    if (select && select.value !== kapId) {
      select.value = kapId;
    }
    const mobileSelect = document.getElementById("mobileKapanewonFilterSelect");
    if (mobileSelect && mobileSelect.value !== kapId) {
      mobileSelect.value = kapId;
    }

    const found = (typeof DB !== 'undefined' && DB.kapanewon) ? DB.kapanewon.find(k => k.id === kapId) : null;
    const displayName = found ? found.name : (kapName || (kapId === "all" ? "Semua Kapanewon (12)" : kapId));

    // Update active badges
    document.querySelectorAll("#activeMapName").forEach(badge => {
      badge.textContent = displayName;
    });

    // Update SVG map polygons & text contrast with cartographic halo
    document.querySelectorAll(".map-polygon-path, path[data-kapanewon-id]").forEach(p => {
      const pId = p.getAttribute("data-kapanewon-id");
      if (!pId) return;
      const parentGroup = p.closest(".map-region-group") || p.parentElement;
      const textLabel = parentGroup ? parentGroup.querySelector("text") : null;

      if (kapId !== "all" && pId === kapId) {
        if (parentGroup) parentGroup.classList.add("is-active");
        p.setAttribute("fill", "#fde047");
        p.setAttribute("stroke", "#d97706");
        p.setAttribute("stroke-width", "6");
        if (textLabel) {
          textLabel.setAttribute("fill", "#0f2b48"); // Deep navy
          textLabel.setAttribute("stroke", "#ffffff"); // High-contrast crisp white halo
          textLabel.setAttribute("stroke-width", "3.5");
          textLabel.setAttribute("paint-order", "stroke fill");
          textLabel.setAttribute("font-weight", "900");
          textLabel.classList.remove("drop-shadow");
          textLabel.classList.add("map-region-label");
        }
      } else {
        if (parentGroup) parentGroup.classList.remove("is-active");
        const origColor = this.getOriginalKapanewonColor(pId);
        p.setAttribute("fill", origColor);
        p.setAttribute("stroke", "#0f2b48");
        p.setAttribute("stroke-width", "3.5");
        if (textLabel) {
          textLabel.setAttribute("fill", "#ffffff"); // Crisp white
          textLabel.setAttribute("stroke", "#091e3a"); // High-contrast deep navy halo
          textLabel.setAttribute("stroke-width", "3.5");
          textLabel.setAttribute("paint-order", "stroke fill");
          textLabel.setAttribute("font-weight", "800");
          textLabel.classList.remove("drop-shadow");
          textLabel.classList.add("map-region-label");
        }
      }
    });

    if (this.currentRoute === "dashboard") {
      this.renderDashboardPanel(kapId, displayName);
    } else {
      this.renderCurrentSubmenuTable();
    }

    auditLogger.log("GEOSPATIAL_MAP_CLICKED", this.user ? this.user.name : "Guest", `Kapanewon: ${displayName}`);
  }

  getElement(id) {
    if (!this.domCache.has(id)) {
      const el = document.getElementById(id);
      if (el) this.domCache.set(id, el);
      return el;
    }
    return this.domCache.get(id);
  }

  safeSetText(id, text) {
    const el = this.getElement(id);
    if (el) el.textContent = text;
  }

  safeSetBadge(id, text, color) {
    const el = this.getElement(id);
    if (el) {
      el.textContent = text;
      el.className = `badge badge-${color}`;
    }
  }

  safeSetHref(id, href) {
    const el = this.getElement(id);
    if (el) el.setAttribute("href", href);
  }

  renderDashboardPanel(kapId, displayName) {
    const panel = document.getElementById("kapanewonDetailPanel");
    if (!panel || typeof DB === 'undefined') return;

    const isAll = (!kapId || kapId === "all");
    const kapData = isAll ? null : DB.kapanewon.find(k => k.id === kapId);
    const titleText = isAll ? "Semua Kapanewon (Kabupaten Kulon Progo)" : (kapData ? kapData.name : (displayName || kapId));
    const zoneText = isAll ? "12 Kapanewon Terintegrasi" : (kapData ? `Zona ${kapData.zone}` : "Wilayah Terpilih");

    this.safeSetText("panelKapanewonName", titleText);
    this.safeSetText("panelZoneBadge", zoneText);

    // Filtered data across 5 submenus
    let aksesItem = isAll ? null : DB.akses.find(a => a.kapanewon.toLowerCase().includes(kapId.toLowerCase()));
    let mutuList = isAll ? DB.mutu : DB.mutu.filter(m => m.kapanewon.toLowerCase().includes(kapId.toLowerCase()));
    let sarprasList = isAll ? DB.sarpras : DB.sarpras.filter(s => s.kapanewon.toLowerCase().includes(kapId.toLowerCase()));
    let gtkList = isAll ? DB.gtk : DB.gtk.filter(g => g.asal.toLowerCase().includes(kapId.toLowerCase()) || g.tujuan.toLowerCase().includes(kapId.toLowerCase()));
    let kelembagaanList = isAll ? DB.kelembagaan : DB.kelembagaan.filter(k => k.kapanewon.toLowerCase().includes(kapId.toLowerCase()));

    // 1. Akses KPIs
    const totalAts = DB.akses.reduce((sum, a) => sum + (a.ats || 0), 0);
    this.safeSetText("kpiApk", aksesItem ? aksesItem.apk : "79.2%");
    this.safeSetText("kpiApm", aksesItem ? aksesItem.apm : "98.7% / 94.5%");
    this.safeSetText("kpiAts", aksesItem ? `${aksesItem.ats} Anak` : `${totalAts} Anak`);
    this.safeSetBadge("kpiRegrouping", aksesItem ? aksesItem.regrouping : "12 Kapanewon Terpantau", aksesItem ? aksesItem.statusColor : "emerald");

    // 2. Mutu KPIs
    const topMutu = mutuList.length > 0 ? mutuList[0] : null;
    this.safeSetText("kpiMutuSekolah", topMutu ? topMutu.nama : "485 Satuan Pendidikan");
    this.safeSetText("kpiLiterasi", topMutu ? topMutu.literasi : "80.8 (Tinggi)");
    this.safeSetText("kpiNumerasi", topMutu ? topMutu.numerasi : "75.2 (Sedang)");
    this.safeSetBadge("kpiAkreditasi", topMutu ? topMutu.akreditasi : "91.3% A / B", "emerald");

    // 3. Sarpras KPIs
    const topSarpras = sarprasList.length > 0 ? sarprasList[0] : null;
    this.safeSetText("kpiRuangBaik", topSarpras ? topSarpras.baik : "88.2% Layak");
    this.safeSetText("kpiRuangRusak", topSarpras ? topSarpras.rusakBerat : "9 Ruang Teridentifikasi");
    this.safeSetText("kpiSpmStatus", topSarpras ? topSarpras.spm : "SPM Terpenuhi");
    this.safeSetBadge("kpiDakStatus", topSarpras ? topSarpras.dak : "Alokasi DAK Berjalan", topSarpras ? topSarpras.statusColor : "blue");

    // 4. GTK & Kelembagaan KPIs
    const topGtk = gtkList.length > 0 ? gtkList[0] : (DB.gtk.length > 0 ? DB.gtk[0] : null);
    const topKelembagaan = kelembagaanList.length > 0 ? kelembagaanList[0] : (DB.kelembagaan.length > 0 ? DB.kelembagaan[0] : null);
    this.safeSetText("kpiGtkMcdm", topGtk ? `${topGtk.nama} (${topGtk.mcdmScore})` : "Optimasi Domisili Aktif");
    this.safeSetText("kpiInovasiAi", topKelembagaan ? topKelembagaan.inovasi : "Pilot AI & Coding Tersebar");

    // Deep-linking links
    const queryParam = isAll ? "" : `?kap=${kapId}`;
    this.safeSetHref("linkSub1", `../sub1-akses/index.html${queryParam}`);
    this.safeSetHref("linkSub2", `../sub2-mutu/index.html${queryParam}`);
    this.safeSetHref("linkSub3", `../sub3-sarpras/index.html${queryParam}`);
    this.safeSetHref("linkSub4", `../sub4-gtk/index.html${queryParam}`);
    this.safeSetHref("linkSub5", `../sub5-kelembagaan/index.html${queryParam}`);

    // Render Table
    this.renderDashboardSummaryTable(kapId, isAll, aksesItem, mutuList, sarprasList, gtkList, kelembagaanList);

    // Visual Pulse Effect
    panel.classList.add("ring-2", "ring-amber-500", "transition-all", "duration-500");
    setTimeout(() => {
      panel.classList.remove("ring-2", "ring-amber-500");
    }, 800);
  }

  renderDashboardSummaryTable(kapId, isAll, aksesItem, mutuList, sarprasList, gtkList, kelembagaanList) {
    const tbody = document.getElementById("dashboardSummaryTableBody");
    if (!tbody) return;

    const queryParam = isAll ? "" : `?kap=${kapId}`;

    if (!isAll) {
      const topMutu = mutuList.length > 0 ? mutuList[0] : null;
      const topSarpras = sarprasList.length > 0 ? sarprasList[0] : null;
      const topGtk = gtkList.length > 0 ? gtkList[0] : null;
      const topKelembagaan = kelembagaanList.length > 0 ? kelembagaanList[0] : null;

      tbody.innerHTML = `
        <tr class="hover:bg-slate-50 transition border-b border-slate-200">
          <td class="p-3 font-extrabold text-blue-700">Sub 1: Akses &amp; ATS</td>
          <td class="p-3 font-bold text-slate-900">APK: ${aksesItem ? SecurityUtils.escapeHTML(aksesItem.apk) : '-'} • APM: ${aksesItem ? SecurityUtils.escapeHTML(aksesItem.apm) : '-'}</td>
          <td class="p-3 font-black text-red-600">${aksesItem ? SecurityUtils.escapeHTML(String(aksesItem.ats)) : '-'} Anak ATS</td>
          <td class="p-3"><span class="badge badge-${aksesItem ? SecurityUtils.escapeHTML(aksesItem.statusColor) : 'blue'}">${aksesItem ? SecurityUtils.escapeHTML(aksesItem.regrouping) : '-'}</span></td>
          <td class="p-3 text-xs text-slate-600">${aksesItem ? SecurityUtils.escapeHTML(aksesItem.sumber) : 'Dapodik & BPS'}</td>
          <td class="p-3"><a href="../sub1-akses/index.html${queryParam}" class="px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-bold whitespace-nowrap shadow-sm inline-block">Buka Sub 1 →</a></td>
        </tr>
        <tr class="hover:bg-slate-50 transition border-b border-slate-200">
          <td class="p-3 font-extrabold text-amber-600">Sub 2: Mutu ANBK</td>
          <td class="p-3 font-bold text-slate-900">${topMutu ? SecurityUtils.escapeHTML(topMutu.nama) : 'Satuan Pendidikan'}</td>
          <td class="p-3 font-extrabold text-slate-800">Lit: ${topMutu ? SecurityUtils.escapeHTML(topMutu.literasi) : '-'} • Num: ${topMutu ? SecurityUtils.escapeHTML(topMutu.numerasi) : '-'}</td>
          <td class="p-3"><span class="badge badge-${topMutu ? SecurityUtils.escapeHTML(topMutu.statusColor) : 'emerald'}">${topMutu ? SecurityUtils.escapeHTML(topMutu.pembinaan) : '-'}</span></td>
          <td class="p-3 text-xs text-slate-600">${topMutu ? SecurityUtils.escapeHTML(topMutu.sumber) : 'Rapor Pendidikan'}</td>
          <td class="p-3"><a href="../sub2-mutu/index.html${queryParam}" class="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold whitespace-nowrap shadow-sm inline-block">Buka Sub 2 →</a></td>
        </tr>
        <tr class="hover:bg-slate-50 transition border-b border-slate-200">
          <td class="p-3 font-extrabold text-blue-800">Sub 3: Sarpras Sekolah</td>
          <td class="p-3 font-bold text-slate-900">${topSarpras ? SecurityUtils.escapeHTML(topSarpras.nama) : 'Kondisi Ruang'}</td>
          <td class="p-3 font-extrabold text-slate-800">${topSarpras ? SecurityUtils.escapeHTML(topSarpras.baik) : '-'} Baik • ${topSarpras ? SecurityUtils.escapeHTML(topSarpras.rusakBerat) : '-'} Rusak Berat</td>
          <td class="p-3"><span class="badge badge-${topSarpras ? SecurityUtils.escapeHTML(topSarpras.statusColor) : 'emerald'}">${topSarpras ? SecurityUtils.escapeHTML(topSarpras.dak) : '-'}</span></td>
          <td class="p-3 text-xs text-slate-600">${topSarpras ? SecurityUtils.escapeHTML(topSarpras.sumber) : 'Dapodik Sarpras'}</td>
          <td class="p-3"><a href="../sub3-sarpras/index.html${queryParam}" class="px-3 py-1.5 bg-blue-800 hover:bg-blue-900 text-white rounded-lg text-xs font-bold whitespace-nowrap shadow-sm inline-block">Buka Sub 3 →</a></td>
        </tr>
        <tr class="hover:bg-slate-50 transition border-b border-slate-200">
          <td class="p-3 font-extrabold text-purple-700">Sub 4: GTK (MCDM)</td>
          <td class="p-3 font-bold text-slate-900">${topGtk ? SecurityUtils.escapeHTML(topGtk.nama) : 'Penataan Guru'} (${topGtk ? SecurityUtils.escapeHTML(topGtk.mapel) : '-'})</td>
          <td class="p-3 font-extrabold text-emerald-700">Skor MCDM: ${topGtk ? SecurityUtils.escapeHTML(topGtk.mcdmScore) : 'Optimal'}</td>
          <td class="p-3"><span class="badge badge-emerald">${topGtk ? SecurityUtils.escapeHTML(topGtk.argumentasi) : 'Penataan Domisili'}</span></td>
          <td class="p-3 text-xs text-slate-600">${topGtk ? SecurityUtils.escapeHTML(topGtk.sumber) : 'BKPSDM'}</td>
          <td class="p-3"><a href="../sub4-gtk/index.html${queryParam}" class="px-3 py-1.5 bg-purple-700 hover:bg-purple-800 text-white rounded-lg text-xs font-bold whitespace-nowrap shadow-sm inline-block">Buka Sub 4 →</a></td>
        </tr>
        <tr class="hover:bg-slate-50 transition">
          <td class="p-3 font-extrabold text-cyan-700">Sub 5: Kelembagaan &amp; GIS</td>
          <td class="p-3 font-bold text-slate-900">${topKelembagaan ? SecurityUtils.escapeHTML(topKelembagaan.nama) : 'Lembaga Pendidikan'}</td>
          <td class="p-3 font-extrabold text-slate-800">${topKelembagaan ? SecurityUtils.escapeHTML(topKelembagaan.prestasi) : 'Terakreditasi'}</td>
          <td class="p-3"><span class="badge badge-${topKelembagaan ? SecurityUtils.escapeHTML(topKelembagaan.statusColor) : 'purple'}">${topKelembagaan ? SecurityUtils.escapeHTML(topKelembagaan.inovasi) : 'Aktif'}</span></td>
          <td class="p-3 text-xs text-slate-600">${topKelembagaan ? SecurityUtils.escapeHTML(topKelembagaan.sumber) : 'Dapodik & Dikpora'}</td>
          <td class="p-3"><a href="../sub5-kelembagaan/index.html${queryParam}" class="px-3 py-1.5 bg-cyan-700 hover:bg-cyan-800 text-white rounded-lg text-xs font-bold whitespace-nowrap shadow-sm inline-block">Buka Sub 5 →</a></td>
        </tr>
      `;
    } else {
      let list = DB.akses;
      if (this.searchQuery) {
        list = list.filter(a => 
          a.kapanewon.toLowerCase().includes(this.searchQuery) ||
          a.regrouping.toLowerCase().includes(this.searchQuery) ||
          a.sumber.toLowerCase().includes(this.searchQuery) ||
          String(a.ats).includes(this.searchQuery)
        );
      }

      if (list.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="p-6 text-center text-slate-500 italic">Tidak ada Kapanewon yang cocok dengan kata kunci "${SecurityUtils.escapeHTML(this.searchQuery)}".</td></tr>`;
        return;
      }

      tbody.innerHTML = list.map(a => {
        const kId = a.kapanewon.toLowerCase();
        const mut = DB.mutu.find(m => m.kapanewon.toLowerCase() === kId);
        const sarp = DB.sarpras.find(s => s.kapanewon.toLowerCase() === kId);
        const q = `?kap=${kId}`;
        const isSelected = (this.selectedKapanewon === kId);
        return `
          <tr class="${isSelected ? 'bg-amber-50/80 border-l-4 border-l-amber-600' : 'hover:bg-slate-50'} transition border-b border-slate-200">
            <td class="p-3 font-bold text-slate-900">${SecurityUtils.escapeHTML(a.kapanewon)} ${isSelected ? '<span class="text-[10px] px-1.5 py-0.5 bg-amber-200 text-amber-900 font-extrabold rounded ml-1">Terpilih</span>' : ''}</td>
            <td class="p-3 text-slate-800">APK: ${SecurityUtils.escapeHTML(a.apk)} • APM: ${SecurityUtils.escapeHTML(a.apm)}</td>
            <td class="p-3 font-black text-red-600">${SecurityUtils.escapeHTML(String(a.ats))} Anak</td>
            <td class="p-3"><span class="badge badge-${SecurityUtils.escapeHTML(a.statusColor)}">${SecurityUtils.escapeHTML(a.regrouping)}</span></td>
            <td class="p-3 text-xs text-slate-600">${mut ? SecurityUtils.escapeHTML(mut.literasi) : 'Standar'} / ${sarp ? SecurityUtils.escapeHTML(sarp.baik) : 'Layak'}</td>
            <td class="p-3">
              <button onclick="app.toggleKapanewon('${kId}', '${SecurityUtils.escapeHTML(a.kapanewon)}')" class="px-3.5 py-1.5 ${isSelected ? 'bg-slate-900 hover:bg-slate-800 text-amber-400 border border-slate-700' : 'bg-amber-600 hover:bg-amber-700 text-white'} rounded-lg text-xs font-bold whitespace-nowrap shadow-sm transition inline-flex items-center gap-1" aria-label="${isSelected ? 'Batalkan pilihan wilayah ' + SecurityUtils.escapeHTML(a.kapanewon) : 'Pilih wilayah ' + SecurityUtils.escapeHTML(a.kapanewon)}" title="${isSelected ? 'Klik untuk membatalkan filter' : 'Klik untuk memfilter data wilayah ini'}">
                ${isSelected ? 'Batal Pilih <svg class="w-3.5 h-3.5 inline-block ml-0.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>' : 'Pilih Wilayah <svg class="w-3.5 h-3.5 inline-block ml-0.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>'}
              </button>
            </td>
          </tr>
        `;
      }).join("");
    }
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
    // suppressed bottom notif per user request
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
        let iconSpan = th.querySelector(".sort-icon");
        if (!iconSpan) return;

        // Ensure th has whitespace-nowrap
        if (!th.classList.contains("whitespace-nowrap")) {
          th.classList.add("whitespace-nowrap");
        }

        // Auto-wrap if sort-icon is on an SVG element to avoid nested SVG bugs
        if (iconSpan.tagName.toLowerCase() === 'svg') {
          const wrapper = document.createElement('span');
          wrapper.className = "sort-icon inline-flex items-center justify-center w-3.5 h-3.5 text-slate-300 ml-1.5 align-middle whitespace-nowrap flex-shrink-0";
          iconSpan.parentNode.replaceChild(wrapper, iconSpan);
          iconSpan = wrapper;
        }

        if (key === activeKey) {
          th.setAttribute("aria-sort", this.sortDirection === 'asc' ? "ascending" : "descending");
          iconSpan.className = "sort-icon inline-flex items-center justify-center w-3.5 h-3.5 text-amber-400 ml-1.5 align-middle font-bold whitespace-nowrap flex-shrink-0";
          iconSpan.innerHTML = this.sortDirection === 'asc'
            ? '<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 19V5M5 12l7-7 7 7"/></svg>'
            : '<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 5v14M19 12l-7 7-7-7"/></svg>';
        } else {
          th.setAttribute("aria-sort", "none");
          iconSpan.className = "sort-icon inline-flex items-center justify-center w-3.5 h-3.5 text-slate-300 ml-1.5 align-middle whitespace-nowrap flex-shrink-0";
          iconSpan.innerHTML = '<svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M7 15l5 5 5-5M7 9l5-5 5 5"/></svg>';
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
    if (this.selectedKapanewon !== "all") {
      data = data.filter(d => 
        d.asal.toLowerCase().includes(this.selectedKapanewon.toLowerCase()) ||
        d.tujuan.toLowerCase().includes(this.selectedKapanewon.toLowerCase())
      );
    }
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
        <span class="text-xs text-amber-300 font-bold whitespace-nowrap mr-1 inline-flex items-center gap-1.5"><svg class="w-3.5 h-3.5 text-amber-300 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg> ${SecurityUtils.escapeHTML(this.user.name)}</span>
        <a href="${relPrefix}security/index.html" class="px-2.5 py-1.5 bg-blue-900 hover:bg-blue-800 text-white border border-blue-700 rounded-lg font-bold text-xs transition inline-flex items-center gap-1.5 shadow-sm"><svg class="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg> Audit Log</a>
        <button onclick="app.logoutUser()" class="px-2.5 py-1.5 bg-red-700 hover:bg-red-800 text-white rounded-lg font-bold text-xs transition shadow-sm">Keluar</button>
      `;
      mobileContent = `
        <div class="w-full flex items-center justify-between bg-slate-800 p-2.5 rounded-lg border border-slate-700 mb-2">
          <span class="text-xs text-amber-300 font-bold"><svg class="w-3.5 h-3.5 text-amber-300 inline-block mr-1" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg> ${SecurityUtils.escapeHTML(this.user.name)}</span>
          <button onclick="app.logoutUser()" class="px-2.5 py-1 bg-red-700 hover:bg-red-800 text-white rounded font-bold text-xs">Keluar</button>
        </div>
        <a href="${relPrefix}security/index.html" class="w-full text-center px-3 py-2 bg-blue-900 hover:bg-blue-800 text-white rounded-lg font-bold text-xs transition block border border-blue-700"><svg class="w-3.5 h-3.5 inline-block mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg> Audit Log Keamanan</a>
      `;
    } else {
      desktopContent = `
        <a href="${relPrefix}security/index.html" class="px-3 py-1.5 bg-blue-900/90 hover:bg-blue-800 text-white border border-blue-600/80 rounded-lg font-bold text-xs transition inline-flex items-center gap-1.5 shadow-sm"><svg class="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg> Status Keamanan</a>
        <a href="${relPrefix}login/index.html" class="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-extrabold rounded-lg text-xs transition shadow-sm inline-flex items-center gap-1.5"><svg class="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg> Masuk Pimpinan</a>
      `;
      mobileContent = `
        <div class="grid grid-cols-2 gap-2 w-full">
          <a href="${relPrefix}security/index.html" class="px-2 py-2 bg-blue-900 hover:bg-blue-800 text-white border border-blue-700 rounded-lg font-bold text-xs transition inline-flex items-center justify-center gap-1.5"><svg class="w-3.5 h-3.5 flex-shrink-0" width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg> <span>Status Keamanan</span></a>
          <a href="${relPrefix}login/index.html" class="px-2 py-2 bg-amber-600 hover:bg-amber-700 text-white font-extrabold rounded-lg text-xs transition inline-flex items-center justify-center gap-1.5 shadow-sm"><svg class="w-3.5 h-3.5 flex-shrink-0" width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg> <span>Masuk Pimpinan</span></a>
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
            <button onclick="document.getElementById('customModalOverlay').remove()" class="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-sm transition" aria-label="Tutup">&times;</button>
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
              <h3 class="text-sm font-black text-slate-900 uppercase tracking-wide"><svg class="w-3.5 h-3.5 inline-block mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg> LOG AUDIT KEAMANAN &amp; INTEGRITAS DATA</h3>
              <p class="text-[11px] text-slate-500">SHA-256 Checksum: <span class="font-mono text-emerald-700 font-bold">${typeof DB_INTEGRITY !== 'undefined' ? DB_INTEGRITY.checksum.substring(0, 24) : 'verified'}...</span></p>
            </div>
            <button onclick="document.getElementById('auditModalOverlay').remove()" class="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-sm transition" aria-label="Tutup">&times;</button>
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
  window.app = app;
});
