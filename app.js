const APP_LINKS = {
  atlas: "https://atlante.courdemiracles.net/",
  quiz: "https://courdemiracles.net/apps/quiz-arte/",
  pixel: "https://courdemiracles-pixel-sheet.vercel.app/apps/pixel-sheet-converter/",
  irisToroid: "https://www.geogebra.org/m/wnr6bwjd",
  geogebraProfile: "https://www.geogebra.org/u/scat_to",
};

const contentItems = {
  readme: {
    index: "00",
    code: "README / PROTOTIPO 02",
    title: "Unix Atelier",
    description: "Un ambiente personale per attraversare architettura, strumenti e media. Puoi usare il tavolo, l’archivio laterale, la mappa sferica oppure il terminale.",
    path: "~/cour-de-miracles/README",
    meta: [["stato", "interattivo"], ["navigazione", "4 workspace"], ["comandi", "Ctrl + K"], ["interfaccia", "tiling"]],
    workspace: "sphere",
    workspaceLabel: "Esplora la sfera",
  },
  architecture: {
    index: "01",
    code: "ARCH / PORTFOLIO",
    title: "Architettura",
    description: "Indice destinato ai progetti di architettura. La struttura distingue le schede finali dai materiali di processo e dai documenti consultabili.",
    path: "~/architettura/indice.portfolio",
    meta: [["sezioni", "4"], ["formato", "schede progetto"], ["contenuti", "da inserire"], ["accesso", "workspace 03"]],
    workspace: "portfolio",
    workspaceLabel: "Apri il portfolio",
  },
  drawings: {
    index: "02",
    code: "ARCH / PROCESSO",
    title: "Disegni e modelli",
    description: "Area per piante, sezioni, dettagli, schizzi e modelli. I materiali potranno essere raggruppati per progetto e ordinati per fase di lavoro.",
    path: "~/architettura/disegni-modelli",
    meta: [["tipi", "disegni + modelli"], ["ordine", "per progetto"], ["vista", "griglia"], ["stato", "struttura pronta"]],
    workspace: "portfolio",
    workspaceLabel: "Vedi la struttura",
  },
  models: {
    index: "03",
    code: "ARCH / MODELLI",
    title: "Modelli",
    description: "Raccolta per fotografie di modelli fisici, viste tridimensionali e passaggi di sviluppo digitale.",
    path: "~/architettura/modelli",
    meta: [["supporti", "fisico + digitale"], ["ordine", "cronologico"], ["schede", "per progetto"], ["stato", "da popolare"]],
    workspace: "portfolio",
    workspaceLabel: "Torna all’indice",
  },
  documents: {
    index: "04",
    code: "ARCH / DOCUMENTI",
    title: "Tavole PDF",
    description: "Archivio per tavole, dossier e testi in PDF, consultabili direttamente e disponibili per il download quando desiderato.",
    path: "~/architettura/documenti",
    meta: [["formato", "PDF"], ["lettura", "nel browser"], ["download", "facoltativo"], ["stato", "da popolare"]],
    workspace: "portfolio",
    workspaceLabel: "Apri il portfolio",
  },
  irisToroid: {
    index: "05",
    code: "ARCH / GEOMETRIA PARAMETRICA",
    title: "Iris Toroid",
    description: "Costruzione geometrica parametrica tridimensionale, consultabile e modificabile interattivamente in GeoGebra.",
    path: "~/architettura/iris-toroid.ggb",
    meta: [["tipo", "modello parametrico 3D"], ["piattaforma", "GeoGebra"], ["autore", "scaT_To"], ["stato", "interattivo"]],
    href: APP_LINKS.irisToroid,
    actionLabel: "Esplora Iris Toroid",
  },
  geogebraProfile: {
    index: "06",
    code: "ARCH / ARCHIVIO PARAMETRICO",
    title: "Archivio GeoGebra",
    description: "Indice generale delle costruzioni geometriche e dei modelli parametrici pubblicati nel profilo GeoGebra scaT_To.",
    path: "~/architettura/geogebra.index",
    meta: [["tipo", "archivio esterno"], ["contenuti", "costruzioni GeoGebra"], ["profilo", "scaT_To"], ["stato", "in aggiornamento"]],
    href: APP_LINKS.geogebraProfile,
    actionLabel: "Apri il profilo GeoGebra",
  },
  laboratory: {
    index: "07",
    code: "LAB / APPLICAZIONI",
    title: "Laboratorio",
    description: "Il nucleo operativo raccoglie le applicazioni già utilizzabili e i prototipi ancora in sviluppo.",
    path: "~/laboratorio",
    meta: [["online", "3 applicazioni"], ["prototipi", "1"], ["apertura", "nel browser"], ["stato", "operativo"]],
    children: ["atlas", "quiz", "pixel", "trace"],
  },
  atlas: {
    index: "08",
    code: "LAB / WEB APP",
    title: "Atlante storico",
    description: "Atlante interattivo per esplorare epoche, aree geografiche, città e documenti attraverso una struttura visuale.",
    path: "~/laboratorio/atlante.web",
    meta: [["tipo", "web app"], ["indirizzo", "atlante.courdemiracles.net"], ["stato", "online"], ["apertura", "nuova scheda"]],
    href: APP_LINKS.atlas,
    actionLabel: "Avvia l’atlante",
  },
  quiz: {
    index: "09",
    code: "LAB / DIDATTICA",
    title: "Quiz di storia dell’arte",
    description: "Applicazione interattiva per lo studio e il riconoscimento di 73 opere di storia dell’arte.",
    path: "~/laboratorio/quiz-arte.web",
    meta: [["tipo", "quiz interattivo"], ["contenuti", "73 opere"], ["stato", "online"], ["apertura", "nel browser"]],
    href: APP_LINKS.quiz,
    actionLabel: "Avvia il quiz",
  },
  pixel: {
    index: "10",
    code: "LAB / IMMAGINI",
    title: "Pixel Sheet Converter",
    description: "Converte immagini in matrici di pixel e celle, con temi selezionabili, collegamento MetaMask e pubblicazione NFT su OpenSea.",
    path: "~/laboratorio/pixel-sheet.web",
    meta: [["tipo", "strumento web"], ["wallet", "MetaMask"], ["stato", "online"], ["pubblicazione", "OpenSea"]],
    href: APP_LINKS.pixel,
    actionLabel: "Avvia il convertitore",
  },
  trace: {
    index: "11",
    code: "LAB / PROTOTIPO",
    title: "Trace Sheet Studio",
    description: "Strumento in sviluppo per l’analisi e la vettorializzazione di immagini e disegni.",
    path: "~/laboratorio/trace-studio.dev",
    meta: [["tipo", "prototipo"], ["ambito", "immagini"], ["stato", "in sviluppo"], ["accesso", "non pubblicato"]],
  },
  profile: {
    index: "12",
    code: "PROFILE / IDENTITÀ",
    title: "Profilo",
    description: "Spazio predisposto per biografia, curriculum, competenze, contatti e collegamenti ai profili esterni.",
    path: "~/profilo",
    meta: [["documenti", "biografia + CV"], ["contatti", "da inserire"], ["social", "da collegare"], ["stato", "struttura pronta"]],
  },
  media: {
    index: "13",
    code: "MEDIA / INDEX",
    title: "Audio e video",
    description: "Workspace pensato per raccogliere tracce SoundCloud, video YouTube e sperimentazioni audiovisive senza interrompere la navigazione.",
    path: "~/media",
    meta: [["audio", "SoundCloud"], ["video", "YouTube"], ["lettore", "da collegare"], ["accesso", "workspace 04"]],
    workspace: "media",
    workspaceLabel: "Apri media",
  },
  soundcloud: {
    index: "14",
    code: "MEDIA / AUDIO",
    title: "SoundCloud",
    description: "Il lettore verrà collegato qui quando sarà disponibile l’indirizzo del profilo o della playlist.",
    path: "~/media/soundcloud",
    meta: [["sorgente", "SoundCloud"], ["modalità", "player incorporato"], ["link", "da configurare"], ["stato", "in attesa"]],
  },
  youtube: {
    index: "15",
    code: "MEDIA / VIDEO",
    title: "YouTube",
    description: "I video potranno essere riprodotti in questo workspace quando sarà disponibile l’indirizzo del canale o della playlist.",
    path: "~/media/youtube",
    meta: [["sorgente", "YouTube"], ["modalità", "player incorporato"], ["link", "da configurare"], ["stato", "in attesa"]],
  },
};

const desktop = document.querySelector("#desktop");
const workspacePanels = [...document.querySelectorAll("[data-workspace-panel]")];
const workspaceTabs = [...document.querySelectorAll(".workspace-tab")];
const previewContent = document.querySelector("#preview-content");
const previewPath = document.querySelector("#preview-path");
const previewIndex = document.querySelector("#preview-index");
const statusMessage = document.querySelector("#status-message");
const terminalOutput = document.querySelector("#terminal-output");
const terminalForm = document.querySelector("#terminal-form");
const terminalInput = document.querySelector("#terminal-input");

const tileDefaults = { archive: 230, preview: 330, terminal: 190 };
function setTileSize(name, value) {
  if (name === "archive") {
    document.querySelector(".desktop-body").style.setProperty("--archive-width", `${Math.max(175, Math.min(420, value))}px`);
  } else if (name === "preview") {
    const maximum = Math.max(280, document.querySelector(".workspace-desk").clientWidth - 420);
    document.querySelector(".workspace-desk").style.setProperty("--preview-width", `${Math.max(280, Math.min(maximum, value))}px`);
  } else {
    const maximum = Math.max(110, document.querySelector(".workspace-desk").clientHeight - 260);
    document.querySelector(".workspace-desk").style.setProperty("--terminal-height", `${Math.max(110, Math.min(maximum, value))}px`);
  }
  window.dispatchEvent(new Event("resize"));
}
document.querySelectorAll("[data-tile-resize]").forEach(handle => {
  const name = handle.dataset.tileResize;
  handle.addEventListener("pointerdown", event => {
    if (window.innerWidth <= 900) return;
    event.preventDefault();
    handle.setPointerCapture(event.pointerId);
    handle.classList.add("is-dragging");
    document.body.classList.add("is-tile-resizing");
    document.body.dataset.axis = name === "terminal" ? "y" : "x";
  });
  handle.addEventListener("pointermove", event => {
    if (!handle.hasPointerCapture(event.pointerId)) return;
    const workspace = document.querySelector(".workspace-desk").getBoundingClientRect();
    const value = name === "archive" ? event.clientX : name === "preview" ? workspace.right - event.clientX : workspace.bottom - event.clientY;
    setTileSize(name, value);
  });
  const finish = event => {
    if (handle.hasPointerCapture(event.pointerId)) handle.releasePointerCapture(event.pointerId);
    handle.classList.remove("is-dragging");
    document.body.classList.remove("is-tile-resizing");
    delete document.body.dataset.axis;
  };
  handle.addEventListener("pointerup", finish);
  handle.addEventListener("pointercancel", finish);
  handle.addEventListener("dblclick", () => setTileSize(name, tileDefaults[name]));
  handle.addEventListener("keydown", event => {
    const keys = name === "terminal" ? ["ArrowUp", "ArrowDown"] : ["ArrowLeft", "ArrowRight"];
    if (!keys.includes(event.key)) return;
    event.preventDefault();
    const current = name === "archive" ? document.querySelector(".file-browser").offsetWidth : name === "preview" ? document.querySelector(".preview-window").offsetWidth : document.querySelector(".terminal-window").offsetHeight;
    const positive = event.key === "ArrowRight" || event.key === "ArrowDown";
    const direction = name === "archive" ? (positive ? 1 : -1) : (positive ? -1 : 1);
    setTileSize(name, current + direction * 10);
  });
});
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

let currentWorkspace = "desk";
let lastPreview = "readme";
let commandHistory = [];
let historyIndex = 0;

const folderRows = [...document.querySelectorAll("[data-folder]")];

function setFolderExpanded(row, expanded, persist = true) {
  const group = document.getElementById(row.getAttribute("aria-controls"));
  if (!group) return;
  row.setAttribute("aria-expanded", String(expanded));
  row.classList.toggle("is-expanded", expanded);
  row.querySelector(".tree-twist").textContent = expanded ? "⌄" : "›";
  group.hidden = !expanded;
  if (persist) {
    try { sessionStorage.setItem(`cdm-folder-${row.dataset.folder}`, expanded ? "open" : "closed"); } catch { /* storage facoltativo */ }
  }
}

folderRows.forEach((row) => {
  let expanded = row.getAttribute("aria-expanded") === "true";
  try {
    const saved = sessionStorage.getItem(`cdm-folder-${row.dataset.folder}`);
    if (saved) expanded = saved === "open";
  } catch { /* mantieni lo stato iniziale */ }
  setFolderExpanded(row, expanded, false);
  row.addEventListener("click", () => setFolderExpanded(row, row.getAttribute("aria-expanded") !== "true"));
  row.addEventListener("keydown", (event) => {
    if (event.key === "ArrowRight") { event.preventDefault(); setFolderExpanded(row, true); }
    if (event.key === "ArrowLeft") { event.preventDefault(); setFolderExpanded(row, false); }
  });
});

function escapeHtml(value) {
  return String(value).replace(/[&<>'"]/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;",
  })[character]);
}

function announce(message) {
  statusMessage.innerHTML = `<i aria-hidden="true"></i>${escapeHtml(message)}`;
}

function switchWorkspace(name, options = {}) {
  if (!workspacePanels.some((panel) => panel.dataset.workspacePanel === name)) name = "desk";
  currentWorkspace = name;
  desktop.dataset.workspace = name;
  workspacePanels.forEach((panel) => {
    const active = panel.dataset.workspacePanel === name;
    panel.hidden = !active;
    panel.classList.toggle("is-active", active);
    panel.setAttribute("aria-hidden", String(!active));
    panel.inert = !active;
  });
  workspaceTabs.forEach((tab) => {
    const active = tab.dataset.switch === name;
    tab.classList.toggle("is-active", active);
    tab.setAttribute("aria-selected", String(active));
    tab.tabIndex = active ? 0 : -1;
  });
  if (name === "sphere") {
    deskSphere.stop();
    window.requestAnimationFrame(() => spaceSphere.start());
  } else {
    spaceSphere.stop();
    if (name === "desk") window.requestAnimationFrame(() => deskSphere.start());
    else deskSphere.stop();
  }
  if (options.announce !== false) {
    const labels = { desk: "workspace 01 · tavolo", sphere: "workspace 02 · sfera", portfolio: "workspace 03 · portfolio", media: "workspace 04 · media" };
    announce(labels[name]);
  }
}

function previewMarkup(item) {
  const meta = item.meta.map(([label, value]) => `<div><small>${escapeHtml(label)}</small><strong>${escapeHtml(value)}</strong></div>`).join("");
  const appChildren = item.children ? `<div class="preview-actions">${item.children.map((id) => `<button class="secondary" type="button" data-preview-open="${id}">${escapeHtml(contentItems[id].title)}</button>`).join("")}</div>` : "";
  const action = item.href
    ? `<a href="${item.href}" target="_blank" rel="noopener noreferrer">${escapeHtml(item.actionLabel || "Apri applicazione")} ↗</a>`
    : item.workspace
      ? `<button type="button" data-preview-workspace="${item.workspace}">${escapeHtml(item.workspaceLabel || "Apri workspace")}</button>`
      : "";
  return `
    <span class="preview-code">${escapeHtml(item.code)}</span>
    <h2>${escapeHtml(item.title)}</h2>
    <p class="preview-lead">${escapeHtml(item.description)}</p>
    <div class="preview-diagram" aria-hidden="true"></div>
    <div class="preview-meta">${meta}</div>
    ${appChildren}
    ${action ? `<div class="preview-actions">${action}</div>` : ""}
  `;
}

function renderPreview(id, options = {}) {
  const item = contentItems[id] || contentItems.readme;
  lastPreview = id in contentItems ? id : "readme";
  previewPath.textContent = item.path;
  previewIndex.textContent = item.index;
  previewContent.innerHTML = previewMarkup(item);
  document.querySelectorAll("[data-open]").forEach((button) => button.classList.toggle("is-selected", button.dataset.open === lastPreview));
  previewContent.querySelectorAll("[data-preview-open]").forEach((button) => button.addEventListener("click", () => renderPreview(button.dataset.previewOpen)));
  previewContent.querySelectorAll("[data-preview-workspace]").forEach((button) => button.addEventListener("click", () => switchWorkspace(button.dataset.previewWorkspace)));
  if (options.switchToDesk !== false) switchWorkspace("desk", { announce: false });
  announce(`${item.title} · anteprima aperta`);
}

function openExternal(id) {
  const item = contentItems[id];
  if (!item || !item.href) return false;
  window.open(item.href, "_blank", "noopener,noreferrer");
  announce(`${item.title} · apertura in una nuova scheda`);
  return true;
}

function selectMedia(id) {
  const item = contentItems[id] || contentItems.media;
  const screen = document.querySelector(".monitor-screen");
  screen.innerHTML = `<div class="waveform" aria-hidden="true"></div><div class="monitor-copy"><span class="section-code">${escapeHtml(item.code)}</span><h2>${escapeHtml(item.title)}</h2><p>${escapeHtml(item.description)}</p><button type="button" data-monitor-preview="${escapeHtml(id)}">Apri la scheda</button></div>`;
  screen.querySelector("[data-monitor-preview]").addEventListener("click", () => renderPreview(id));
  document.querySelectorAll(".media-tracks [data-open]").forEach((button) => button.classList.toggle("is-selected", button.dataset.open === id));
  announce(`${item.title} · sorgente selezionata`);
}

document.querySelectorAll("[data-switch]").forEach((button) => button.addEventListener("click", () => switchWorkspace(button.dataset.switch)));
document.querySelectorAll("[data-open]").forEach((button) => {
  button.addEventListener("click", () => {
    if (button.closest(".workspace-media")) selectMedia(button.dataset.open);
    else renderPreview(button.dataset.open);
  });
});

workspaceTabs.forEach((tab, index) => {
  tab.addEventListener("keydown", (event) => {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    let next = index;
    if (event.key === "ArrowRight") next = (index + 1) % workspaceTabs.length;
    if (event.key === "ArrowLeft") next = (index - 1 + workspaceTabs.length) % workspaceTabs.length;
    if (event.key === "Home") next = 0;
    if (event.key === "End") next = workspaceTabs.length - 1;
    workspaceTabs[next].focus();
    switchWorkspace(workspaceTabs[next].dataset.switch);
  });
});

function terminalLine(text, tone = "") {
  const line = document.createElement("p");
  line.className = "terminal-line";
  if (tone) {
    const span = document.createElement("span");
    span.className = tone;
    span.textContent = text;
    line.append(span);
  } else line.textContent = text;
  terminalOutput.append(line);
  document.querySelector("#terminal").scrollTop = document.querySelector("#terminal").scrollHeight;
}

function terminalPrompt(command) {
  const line = document.createElement("p");
  line.className = "terminal-line";
  line.innerHTML = `<span class="prompt">atelier@cdm</span>:<span class="info">~</span>$ ${escapeHtml(command)}`;
  terminalOutput.append(line);
}

function executeCommand(rawCommand, options = {}) {
  const command = rawCommand.trim().toLowerCase().replace(/\s+/g, " ");
  if (!command) return;
  if (options.echo !== false) terminalPrompt(rawCommand.trim());
  if (options.remember !== false) {
    commandHistory.push(rawCommand.trim());
    historyIndex = commandHistory.length;
  }
  const aliases = {
    "open atlas": "atlas", "apri atlante": "atlas", atlante: "atlas", atlas: "atlas",
    "open quiz": "quiz", "apri quiz": "quiz", quiz: "quiz",
    "open pixel": "pixel", "apri pixel": "pixel", pixel: "pixel",
  };
  if (command === "clear" || command === "pulisci") {
    terminalOutput.replaceChildren();
    announce("terminale pulito");
    return;
  }
  if (command === "help" || command === "aiuto") {
    terminalLine("comandi: desk · sphere · portfolio · media", "info");
    terminalLine("open atlas · open quiz · open pixel · open architecture");
    terminalLine("clear · Ctrl+K per la palette dei comandi");
    announce("guida dei comandi visualizzata");
    return;
  }
  if (["desk", "tavolo", "open desk"].includes(command)) {
    switchWorkspace("desk"); terminalLine("workspace 01 montato", "info"); return;
  }
  if (["sphere", "sfera", "open sphere"].includes(command)) {
    switchWorkspace("sphere"); terminalLine("workspace 02 montato", "info"); return;
  }
  if (["portfolio", "open portfolio", "apri portfolio"].includes(command)) {
    switchWorkspace("portfolio"); terminalLine("workspace 03 montato", "info"); return;
  }
  if (["media", "open media", "apri media"].includes(command)) {
    switchWorkspace("media"); terminalLine("workspace 04 montato", "info"); return;
  }
  if (["architecture", "architettura", "open architecture", "apri architettura"].includes(command)) {
    renderPreview("architecture"); terminalLine("anteprima architettura aperta", "info"); return;
  }
  if (aliases[command]) {
    const id = aliases[command];
    terminalLine(`avvio ${contentItems[id].title}…`, "info");
    openExternal(id);
    return;
  }
  terminalLine(`comando non trovato: ${command}`, "error");
  terminalLine("digita help per vedere i comandi disponibili", "warn");
  announce("comando non riconosciuto");
}

terminalForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const value = terminalInput.value;
  terminalInput.value = "";
  executeCommand(value);
});

terminalInput.addEventListener("keydown", (event) => {
  if (event.key === "ArrowUp") {
    event.preventDefault();
    historyIndex = Math.max(0, historyIndex - 1);
    terminalInput.value = commandHistory[historyIndex] || "";
  }
  if (event.key === "ArrowDown") {
    event.preventDefault();
    historyIndex = Math.min(commandHistory.length, historyIndex + 1);
    terminalInput.value = commandHistory[historyIndex] || "";
  }
});

document.querySelectorAll("[data-command]").forEach((button) => button.addEventListener("click", () => executeCommand(button.dataset.command, { echo: false })));

const commandPalette = document.querySelector("#command-palette");
const paletteInput = document.querySelector("#palette-input");
const commandList = document.querySelector("#command-list");
let paletteIndex = 0;
let paletteResults = [];

const commands = [
  { label: "Apri il tavolo", detail: "Workspace 01", keys: "01", search: "desk tavolo", action: () => switchWorkspace("desk") },
  { label: "Esplora la sfera", detail: "Workspace 02", keys: "02", search: "sphere sfera mappa", action: () => switchWorkspace("sphere") },
  { label: "Apri il portfolio", detail: "Workspace 03", keys: "03", search: "portfolio architettura", action: () => switchWorkspace("portfolio") },
  { label: "Apri media", detail: "Workspace 04", keys: "04", search: "media audio video", action: () => switchWorkspace("media") },
  { label: "Avvia Atlante storico", detail: "Applicazione online", keys: "↗", search: "atlante lab", action: () => openExternal("atlas") },
  { label: "Avvia Quiz di storia dell’arte", detail: "73 opere", keys: "↗", search: "quiz arte lab", action: () => openExternal("quiz") },
  { label: "Avvia Pixel Sheet Converter", detail: "Applicazione online", keys: "↗", search: "pixel converter immagini lab", action: () => openExternal("pixel") },
  { label: "Mostra profilo", detail: "Biografia, CV e contatti", keys: "", search: "profilo curriculum contatti", action: () => renderPreview("profile") },
  { label: "Guida ai comandi", detail: "Istruzioni essenziali", keys: "?", search: "help aiuto guida", action: () => { switchWorkspace("desk"); executeCommand("help", { echo: false }); terminalInput.focus(); } },
];

function renderCommands(filter = "") {
  const needle = filter.trim().toLowerCase();
  paletteResults = commands.filter((command) => `${command.label} ${command.detail} ${command.search}`.toLowerCase().includes(needle));
  paletteIndex = Math.min(paletteIndex, Math.max(0, paletteResults.length - 1));
  commandList.innerHTML = paletteResults.length
    ? paletteResults.map((command, index) => `<button class="command-option ${index === paletteIndex ? "is-active" : ""}" type="button" role="option" aria-selected="${index === paletteIndex}" data-command-index="${index}"><span>›</span><span><strong>${escapeHtml(command.label)}</strong><small>${escapeHtml(command.detail)}</small></span><kbd>${escapeHtml(command.keys)}</kbd></button>`).join("")
    : `<p class="terminal-line"><span class="warn">nessun comando trovato</span></p>`;
  commandList.querySelectorAll("[data-command-index]").forEach((button) => {
    button.addEventListener("pointermove", () => { paletteIndex = Number(button.dataset.commandIndex); highlightCommand(); });
    button.addEventListener("click", () => runPaletteCommand(Number(button.dataset.commandIndex)));
  });
}

function highlightCommand() {
  commandList.querySelectorAll("[data-command-index]").forEach((button, index) => {
    const active = index === paletteIndex;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-selected", String(active));
    if (active) button.scrollIntoView({ block: "nearest" });
  });
}

function openPalette() {
  if (commandPalette.open) return;
  paletteInput.value = "";
  paletteIndex = 0;
  renderCommands();
  commandPalette.showModal();
  window.requestAnimationFrame(() => paletteInput.focus());
}

function runPaletteCommand(index) {
  const command = paletteResults[index];
  if (!command) return;
  commandPalette.close();
  command.action();
}

paletteInput.addEventListener("input", () => { paletteIndex = 0; renderCommands(paletteInput.value); });
paletteInput.addEventListener("keydown", (event) => {
  if (event.key === "ArrowDown") { event.preventDefault(); paletteIndex = (paletteIndex + 1) % Math.max(1, paletteResults.length); highlightCommand(); }
  if (event.key === "ArrowUp") { event.preventDefault(); paletteIndex = (paletteIndex - 1 + Math.max(1, paletteResults.length)) % Math.max(1, paletteResults.length); highlightCommand(); }
  if (event.key === "Enter") { event.preventDefault(); runPaletteCommand(paletteIndex); }
});

document.querySelector("#command-button").addEventListener("click", openPalette);
document.querySelector("#status-command").addEventListener("click", openPalette);

document.addEventListener("keydown", (event) => {
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") { event.preventDefault(); openPalette(); return; }
  if (commandPalette.open) return;
  if (event.altKey && /^[1-4]$/.test(event.key)) {
    event.preventDefault();
    switchWorkspace(["desk", "sphere", "portfolio", "media"][Number(event.key) - 1]);
  }
  if (event.key === "Escape" && currentWorkspace !== "desk") switchWorkspace("desk");
});

const sphereNodes = [
  { id: "architecture", title: "Architettura", lat: .5, lon: -.74, color: "#6fa9bc" },
  { id: "laboratory", title: "Laboratorio", lat: -.08, lon: .1, color: "#9ed0ae" },
  { id: "atlas", title: "Atlante", lat: .15, lon: 1.42, color: "#9ed0ae" },
  { id: "quiz", title: "Quiz", lat: -.54, lon: 2.28, color: "#9ed0ae" },
  { id: "pixel", title: "Pixel", lat: .78, lon: 2.73, color: "#9ed0ae" },
  { id: "media", title: "Media", lat: -.35, lon: -2.14, color: "#d4a14d" },
  { id: "profile", title: "Profilo", lat: .12, lon: -2.9, color: "#e8e1d3" },
  { id: "documents", title: "Documenti", lat: -.82, lon: -.7, color: "#6fa9bc" },
];

const sphereAssets = [];

function showSphereNode(id) {
  const item = contentItems[id] || contentItems.readme;
  document.querySelector("#sphere-node-path").textContent = item.path;
  const inspector = document.querySelector("#sphere-inspector-content");
  inspector.innerHTML = `<div class="inspector-orbit" aria-hidden="true"><i></i></div><span class="preview-code">${escapeHtml(item.code)}</span><h2>${escapeHtml(item.title)}</h2><p>${escapeHtml(item.description)}</p><div class="preview-actions"><button type="button" data-node-preview="${escapeHtml(id)}">Apri scheda</button>${item.href ? `<a class="secondary" href="${item.href}" target="_blank" rel="noopener noreferrer">Avvia ↗</a>` : ""}</div>`;
  inspector.querySelector("[data-node-preview]").addEventListener("click", () => renderPreview(id));
  document.querySelectorAll("[data-node]").forEach((button) => button.classList.toggle("is-selected", button.dataset.node === id));
  announce(`${item.title} · nodo selezionato`);
}

document.querySelectorAll("[data-node]").forEach((button) => button.addEventListener("click", () => {
  showSphereNode(button.dataset.node);
  spaceSphere.select(button.dataset.node);
}));

function createSphere(canvas, options = {}) {
  const ctx = canvas.getContext("2d");
  const interactive = Boolean(options.interactive);
  const showcase = Boolean(options.showcase);
  const state = { rx: interactive ? -.12 : -.2, ry: interactive ? -.45 : .2, vx: 0, vy: 0, zoom: 1, dragging: false, moved: false, lastX: 0, lastY: 0, width: 0, height: 0, points: [], selected: null, showcaseIndex:0 };
  let active = false;
  let frameId = 0;

  function resize() {
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    state.width = rect.width;
    state.height = rect.height;
    canvas.width = Math.max(1, Math.round(rect.width * dpr));
    canvas.height = Math.max(1, Math.round(rect.height * dpr));
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    draw();
  }

  function rotatePoint(x, y, z) {
    const cy = Math.cos(state.ry), sy = Math.sin(state.ry);
    const cx = Math.cos(state.rx), sx = Math.sin(state.rx);
    const x1 = x * cy + z * sy;
    const z1 = -x * sy + z * cy;
    return { x: x1, y: y * cx - z1 * sx, z: y * sx + z1 * cx };
  }

  function pointAt(lat, lon) {
    const cl = Math.cos(lat);
    return rotatePoint(cl * Math.sin(lon), Math.sin(lat), cl * Math.cos(lon));
  }

  function strokeCurve(points, cx, cy, radius) {
    let drawing = false;
    ctx.beginPath();
    points.forEach((point) => {
      if (point.z < -.13) { drawing = false; return; }
      const x = cx + point.x * radius;
      const y = cy - point.y * radius;
      if (!drawing) { ctx.moveTo(x, y); drawing = true; }
      else ctx.lineTo(x, y);
    });
    ctx.stroke();
  }

  function drawVoxel(x, y, size, color, alpha) {
    const top = shadeColor(color, 26);
    const left = shadeColor(color, -18);
    const right = shadeColor(color, -34);
    const half = size * .58;
    const rise = size * .34;
    ctx.globalAlpha = alpha;
    ctx.fillStyle = top;
    ctx.beginPath();
    ctx.moveTo(x, y - rise); ctx.lineTo(x + half, y); ctx.lineTo(x, y + rise); ctx.lineTo(x - half, y); ctx.closePath(); ctx.fill();
    ctx.fillStyle = left;
    ctx.beginPath();
    ctx.moveTo(x - half, y); ctx.lineTo(x, y + rise); ctx.lineTo(x, y + rise + size * .55); ctx.lineTo(x - half, y + size * .55); ctx.closePath(); ctx.fill();
    ctx.fillStyle = right;
    ctx.beginPath();
    ctx.moveTo(x + half, y); ctx.lineTo(x, y + rise); ctx.lineTo(x, y + rise + size * .55); ctx.lineTo(x + half, y + size * .55); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = "rgba(9,15,11,.55)";
    ctx.lineWidth = Math.max(.45, size * .055);
    ctx.stroke();
    ctx.globalAlpha = 1;
  }

  function shadeColor(hex, amount) {
    const value = Number.parseInt(hex.slice(1), 16);
    const channel = (shift) => Math.max(0, Math.min(255, (value >> shift & 255) + amount));
    return `rgb(${channel(16)},${channel(8)},${channel(0)})`;
  }

  function drawSphereAssets(cx, cy, radius) {
    sphereAssets.forEach((asset) => {
      const cl = Math.cos(asset.lat), sl = Math.sin(asset.lat);
      const so = Math.sin(asset.lon), co = Math.cos(asset.lon);
      const outward = { x: cl * so, y: sl, z: cl * co };
      const east = { x: co, y: 0, z: -so };
      const north = { x: -sl * so, y: cl, z: -sl * co };
      const unit = .042;
      const blocks = asset.voxels.map((voxel) => {
        const altitude = 1.015 + voxel.z * unit;
        const point = rotatePoint(
          outward.x * altitude + east.x * voxel.x * unit + north.x * voxel.y * unit,
          outward.y * altitude + east.y * voxel.x * unit + north.y * voxel.y * unit,
          outward.z * altitude + east.z * voxel.x * unit + north.z * voxel.y * unit,
        );
        const perspective = 1 + point.z * .12;
        return { ...voxel, point, perspective };
      }).sort((a, b) => a.point.z - b.point.z || a.z - b.z);
      blocks.forEach((block) => {
        if (block.point.z < -.16) return;
        const alpha = Math.max(.18, Math.min(1, (block.point.z + .25) / .85));
        drawVoxel(
          cx + block.point.x * radius * block.perspective,
          cy - block.point.y * radius * block.perspective,
          radius * unit * block.perspective * (interactive ? 1.2 : 1.05),
          block.color,
          alpha,
        );
      });
    });
  }

  function drawShowcaseObject(cx, cy, radius) {
    const index = state.showcaseIndex;
    ctx.lineWidth = 1.15;
    ctx.strokeStyle = "rgba(158,208,174,.68)";
    ctx.fillStyle = "rgba(62,96,77,.14)";
    if (index === 1) {
      const vertices = [[-1,-1,-1],[1,-1,-1],[1,1,-1],[-1,1,-1],[-1,-1,1],[1,-1,1],[1,1,1],[-1,1,1]].map(([x,y,z]) => rotatePoint(x*.58,y*.58,z*.58));
      const edges = [[0,1],[1,2],[2,3],[3,0],[4,5],[5,6],[6,7],[7,4],[0,4],[1,5],[2,6],[3,7]];
      edges.sort((a,b)=>(vertices[a[0]].z+vertices[a[1]].z)-(vertices[b[0]].z+vertices[b[1]].z)).forEach(([a,b])=>{ctx.beginPath();ctx.moveTo(cx+vertices[a].x*radius,cy-vertices[a].y*radius);ctx.lineTo(cx+vertices[b].x*radius,cy-vertices[b].y*radius);ctx.stroke();});
    } else if (index === 2) {
      for (let ring=0;ring<12;ring++) {
        ctx.beginPath();
        for (let step=0;step<=64;step++) {
          const u=step/64*Math.PI*2,v=ring/12*Math.PI*2;
          const x=(.68+.24*Math.cos(v))*Math.cos(u),y=.24*Math.sin(v),z=(.68+.24*Math.cos(v))*Math.sin(u);
          const p=rotatePoint(x,y,z),px=cx+p.x*radius,py=cy-p.y*radius;
          if(step===0)ctx.moveTo(px,py);else ctx.lineTo(px,py);
        }
        ctx.stroke();
      }
    } else if (index === 3) {
      const rings=[];
      for(let row=0;row<=10;row++){
        const lat=-Math.PI/2+row/10*Math.PI, ring=[];
        for(let column=0;column<20;column++){
          const lon=column/20*Math.PI*2, pulse=1+.14*Math.sin(lon*3+lat*4)+.08*Math.cos(lon*5-lat*2);
          const cl=Math.cos(lat),p=rotatePoint(cl*Math.sin(lon)*pulse,Math.sin(lat)*pulse,cl*Math.cos(lon)*pulse);ring.push(p);
        }rings.push(ring);
      }
      rings.forEach(ring=>{ctx.beginPath();ring.forEach((p,i)=>{const x=cx+p.x*radius*.72,y=cy-p.y*radius*.72;i?ctx.lineTo(x,y):ctx.moveTo(x,y);});ctx.closePath();ctx.stroke();});
      for(let column=0;column<20;column++){ctx.beginPath();rings.forEach((ring,row)=>{const p=ring[column],x=cx+p.x*radius*.72,y=cy-p.y*radius*.72;row?ctx.lineTo(x,y):ctx.moveTo(x,y);});ctx.stroke();}
    }
  }

  function draw() {
    const { width, height } = state;
    if (!width || !height) return;
    ctx.clearRect(0, 0, width, height);
    const cx = width / 2;
    const cy = height / 2;
    const radius = Math.min(width, height) * (interactive ? .33 : .37) * state.zoom;
    if (showcase && state.showcaseIndex > 0) {
      const glow=ctx.createRadialGradient(cx,cy,radius*.1,cx,cy,radius*1.2);glow.addColorStop(0,"rgba(158,208,174,.18)");glow.addColorStop(1,"rgba(12,18,14,0)");ctx.fillStyle=glow;ctx.beginPath();ctx.arc(cx,cy,radius*1.2,0,Math.PI*2);ctx.fill();
      drawShowcaseObject(cx,cy,radius);
      return;
    }
    const glow = ctx.createRadialGradient(cx - radius * .28, cy - radius * .34, radius * .05, cx, cy, radius * 1.3);
    glow.addColorStop(0, "rgba(158,208,174,.3)");
    glow.addColorStop(.5, "rgba(80,122,104,.14)");
    glow.addColorStop(1, "rgba(12,18,14,0)");
    ctx.fillStyle = glow;
    ctx.beginPath(); ctx.arc(cx, cy, radius * 1.3, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = interactive ? "rgba(20,32,25,.5)" : "rgba(15,27,21,.68)";
    ctx.strokeStyle = interactive ? "rgba(158,208,174,.32)" : "rgba(158,208,174,.26)";
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.arc(cx, cy, radius, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.strokeStyle = interactive ? "rgba(177,205,187,.13)" : "rgba(177,205,187,.16)";
    for (let lat = -Math.PI / 3; lat <= Math.PI / 3; lat += Math.PI / 6) {
      const curve = [];
      for (let lon = -Math.PI; lon <= Math.PI + .05; lon += .07) curve.push(pointAt(lat, lon));
      strokeCurve(curve, cx, cy, radius);
    }
    for (let lon = -Math.PI; lon < Math.PI; lon += Math.PI / 6) {
      const curve = [];
      for (let lat = -Math.PI / 2; lat <= Math.PI / 2 + .05; lat += .06) curve.push(pointAt(lat, lon));
      strokeCurve(curve, cx, cy, radius);
    }
    drawSphereAssets(cx, cy, radius);
    state.points = sphereNodes.map((node) => {
      const point = pointAt(node.lat, node.lon);
      const perspective = 1 + point.z * .16;
      return { node, z: point.z, x: cx + point.x * radius * perspective, y: cy - point.y * radius * perspective };
    }).sort((a, b) => a.z - b.z);
    state.points.forEach((point) => {
      if (point.z < -.2) return;
      const alpha = Math.max(.2, (point.z + .25) / 1.25);
      const selected = point.node.id === state.selected;
      const size = (interactive ? 5 : 3) + Math.max(0, point.z) * (interactive ? 8 : 4) + (selected ? 3 : 0);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = point.node.color;
      ctx.shadowColor = point.node.color;
      ctx.shadowBlur = selected ? 24 : 13;
      ctx.beginPath(); ctx.arc(point.x, point.y, size, 0, Math.PI * 2); ctx.fill();
      ctx.shadowBlur = 0;
      if (interactive && point.z > .05) {
        ctx.font = `${selected ? 700 : 500} ${point.z > .58 ? 14 : 12}px ui-monospace, monospace`;
        ctx.fillStyle = "#ece8df";
        ctx.textAlign = "center";
        ctx.fillText(point.node.title, point.x, point.y - size - 11);
      }
      ctx.globalAlpha = 1;
    });
  }

  function loop() {
    frameId = 0;
    if (!active) return;
    if (!state.dragging) {
      if (!interactive && !reducedMotion.matches) state.ry += .002;
      if (interactive) {
        state.rx += state.vx;
        state.ry += state.vy;
        state.vx *= .94;
        state.vy *= .94;
      }
    }
    draw();
    const inertia = Math.abs(state.vx) + Math.abs(state.vy) > .0001;
    if ((!interactive && !reducedMotion.matches) || state.dragging || inertia) frameId = requestAnimationFrame(loop);
  }

  function schedule() { if (active && !frameId) frameId = requestAnimationFrame(loop); }
  function start() { active = true; resize(); schedule(); }
  function stop() { active = false; if (frameId) cancelAnimationFrame(frameId); frameId = 0; }
  function select(id) { state.selected = id; draw(); }
  function setShowcase(index) { state.showcaseIndex=(index+4)%4; draw(); }

  if (interactive) {
    canvas.addEventListener("pointerdown", (event) => {
      state.dragging = true; state.moved = false; state.lastX = event.clientX; state.lastY = event.clientY; state.vx = 0; state.vy = 0;
      canvas.setPointerCapture(event.pointerId); schedule();
    });
    canvas.addEventListener("pointermove", (event) => {
      if (!state.dragging) return;
      const dx = event.clientX - state.lastX;
      const dy = event.clientY - state.lastY;
      if (Math.abs(dx) + Math.abs(dy) > 3) state.moved = true;
      state.ry += dx * .006;
      state.rx = Math.max(-1.25, Math.min(1.25, state.rx + dy * .005));
      state.vy = reducedMotion.matches ? 0 : dx * .0003;
      state.vx = reducedMotion.matches ? 0 : dy * .00024;
      state.lastX = event.clientX; state.lastY = event.clientY;
      draw();
    });
    function endPointer(event) {
      if (!state.dragging) return;
      state.dragging = false;
      if (!state.moved && event.type === "pointerup") {
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        const candidate = state.points.filter((point) => point.z > -.15).map((point) => ({ ...point, distance: Math.hypot(point.x - x, point.y - y) })).sort((a, b) => a.distance - b.distance)[0];
        if (candidate && candidate.distance < 38) { select(candidate.node.id); showSphereNode(candidate.node.id); }
      }
      schedule();
    }
    canvas.addEventListener("pointerup", endPointer);
    canvas.addEventListener("pointercancel", endPointer);
    canvas.addEventListener("wheel", (event) => {
      event.preventDefault();
      state.zoom = Math.max(.72, Math.min(1.38, state.zoom - event.deltaY * .0007));
      draw();
    }, { passive: false });
    canvas.addEventListener("keydown", (event) => {
      if (event.key === "ArrowLeft") state.ry -= .13;
      if (event.key === "ArrowRight") state.ry += .13;
      if (event.key === "ArrowUp") state.rx = Math.max(-1.25, state.rx - .1);
      if (event.key === "ArrowDown") state.rx = Math.min(1.25, state.rx + .1);
      if (event.key === "Enter") {
        const front = [...state.points].sort((a, b) => b.z - a.z)[0];
        if (front) { select(front.node.id); showSphereNode(front.node.id); }
      }
      if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)) event.preventDefault();
      draw();
    });
  }
  return { resize, start, stop, select, setShowcase };
}

const deskSphere = createSphere(document.querySelector("#desk-sphere"), { showcase:true });
const spaceSphere = createSphere(document.querySelector("#space-canvas"), { interactive: true });
const showcaseItems=["Sfera relazionale","Cubo reticolare","Toro parametrico","Forma organica"];
let showcaseIndex=0;
function changeShowcase(direction){showcaseIndex=(showcaseIndex+direction+showcaseItems.length)%showcaseItems.length;deskSphere.setShowcase(showcaseIndex);document.querySelector("#showcase-counter").textContent=`${String(showcaseIndex+1).padStart(2,"0")} / ${String(showcaseItems.length).padStart(2,"0")}`;document.querySelector("#showcase-title").textContent=showcaseItems[showcaseIndex];}
document.querySelector("#showcase-previous").addEventListener("click",()=>changeShowcase(-1));
document.querySelector("#showcase-next").addEventListener("click",()=>changeShowcase(1));
setInterval(()=>{if(currentWorkspace==="desk"&&!document.hidden)changeShowcase(1);},8000);

window.addEventListener("resize", () => {
  if (currentWorkspace === "desk") deskSphere.resize();
  if (currentWorkspace === "sphere") spaceSphere.resize();
});
document.addEventListener("visibilitychange", () => {
  if (document.hidden) { deskSphere.stop(); spaceSphere.stop(); }
  else if (currentWorkspace === "desk") deskSphere.start();
  else if (currentWorkspace === "sphere") spaceSphere.start();
});
reducedMotion.addEventListener?.("change", () => {
  if (currentWorkspace === "desk") deskSphere.start();
  if (currentWorkspace === "sphere") spaceSphere.start();
});

function updateClock() {
  const now = new Date();
  const clock = document.querySelector("#system-clock");
  clock.textContent = now.toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" });
  clock.dateTime = now.toISOString();
}

updateClock();
setInterval(updateClock, 30000);
renderPreview("readme", { switchToDesk: false });
terminalLine("Cour de Miracles shell 0.2", "info");
terminalLine("digita help oppure premi Ctrl+K");
showSphereNode("architecture");
switchWorkspace("desk", { announce: false });
announce("sistema pronto · scegli un oggetto o un comando");
