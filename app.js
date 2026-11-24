(() => {
  const STORAGE_KEY = "vortechs_wave_notes_v5";
  const CEILING_KEY = "vortechs_wave_ceiling_v5";

  const FONT_CLASSES = {
    typewriter: "font-typewriter",
    stencil: "font-stencil",
    serif: "font-serif"
  };

  let selectedFont = "typewriter";
  let swimmableCeiling = true;
  let notes = loadNotes();

  const searchInput = document.getElementById("searchInput");
  const clearSearchBtn = document.getElementById("clearSearchBtn");
  const noteAuthor = document.getElementById("noteAuthor");
  const noteText = document.getElementById("noteText");
  const pinNoteBtn = document.getElementById("pinNoteBtn");
  const toggleCeilingBtn = document.getElementById("toggleCeilingBtn");
  const ceilingZone = document.querySelector(".ceiling-zone");
  const notesGrid = document.getElementById("notesGrid");
  const noteCount = document.getElementById("noteCount");
  const fontButtons = Array.from(document.querySelectorAll(".font-btn"));

  function loadNotes() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (_) {}

    return [
      {
        id: "seed-1",
        author: "beta_surfer1",
        text: "Swimmable ceiling active on vorTechS WAVE. Test Typewriter, Stencil, and Serif.",
        font: "typewriter",
        createdAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      }
    ];
  }

  function saveNotes() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
    } catch (_) {}
  }

  function loadCeilingState() {
    try {
      const saved = localStorage.getItem(CEILING_KEY);
      if (saved !== null) swimmableCeiling = saved === "true";
    } catch (_) {}
    syncCeilingUI();
  }

  function syncCeilingUI() {
    ceilingZone.classList.toggle("swimmable-active", swimmableCeiling);
    toggleCeilingBtn.textContent = swimmableCeiling
      ? "Ceiling: Swimmable"
      : "Ceiling: Locked";
    try {
      localStorage.setItem(CEILING_KEY, String(swimmableCeiling));
    } catch (_) {}
  }

  function setFontStyle(fontKey) {
    selectedFont = FONT_CLASSES[fontKey] ? fontKey : "typewriter";
    fontButtons.forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.font === selectedFont);
    });
    const activeClass = FONT_CLASSES[selectedFont];
    Object.values(FONT_CLASSES).forEach((cls) => noteText.classList.remove(cls));
    noteText.classList.add(activeClass);
  }

  function addNote() {
    const text = noteText.value.trim();
    if (!text) return;
    const author = (noteAuthor.value || "beta_surfer1").trim();

    notes.unshift({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      author,
      text,
      font: selectedFont,
      createdAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    });

    noteText.value = "";
    saveNotes();
    renderNotes();
  }

  function deleteNote(id) {
    notes = notes.filter((item) => item.id !== id);
    saveNotes();
    renderNotes();
  }

  function renderNotes() {
    const query = searchInput.value.trim().toLowerCase();
    const filtered = query
      ? notes.filter(
          (n) =>
            n.text.toLowerCase().includes(query) ||
            n.author.toLowerCase().includes(query) ||
            n.font.toLowerCase().includes(query)
        )
      : notes;

    noteCount.textContent = `${filtered.length} ${filtered.length === 1 ? "note" : "notes"}`;
    notesGrid.innerHTML = "";

    if (filtered.length === 0) {
      const empty = document.createElement("p");
      empty.className = "note-body";
      empty.textContent = "No matching notes found.";
      notesGrid.appendChild(empty);
      return;
    }

    filtered.forEach((note) => {
      const card = document.createElement("article");
      card.className = "note-card";

      const meta = document.createElement("div");
      meta.className = "note-meta";

      const metaLabel = document.createElement("span");
      metaLabel.textContent = `${note.author} • ${note.font} • ${note.createdAt}`;

      const delBtn = document.createElement("button");
      delBtn.type = "button";
      delBtn.className = "delete-btn";
      delBtn.textContent = "Remove";
      delBtn.addEventListener("click", () => deleteNote(note.id));

      meta.appendChild(metaLabel);
      meta.appendChild(delBtn);

      const body = document.createElement("p");
      body.className = `note-body ${FONT_CLASSES[note.font] || FONT_CLASSES.typewriter}`;
      body.textContent = note.text;

      card.appendChild(meta);
      card.appendChild(body);
      notesGrid.appendChild(card);
    });
  }

  fontButtons.forEach((btn) => {
    btn.addEventListener("click", () => setFontStyle(btn.dataset.font));
  });

  pinNoteBtn.addEventListener("click", addNote);

  toggleCeilingBtn.addEventListener("click", () => {
    swimmableCeiling = !swimmableCeiling;
    syncCeilingUI();
  });

  searchInput.addEventListener("input", renderNotes);

  clearSearchBtn.addEventListener("click", () => {
    searchInput.value = "";
    renderNotes();
  });

  loadCeilingState();
  setFontStyle("typewriter");
  renderNotes();
})();
