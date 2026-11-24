function saveJournalEntry() {
    playSfx('shop');
    const text = document.getElementById('journalInput').value.trim();
    if (!text) return;
    const now = new Date();
    const newEntry = {
        id: Date.now(),
        timestamp: now.toLocaleString(),
        text: text,
        mood: selectedMood,
        tag: selectedTag
    };
    appState.journals.unshift(newEntry);
    document.getElementById('journalInput').value = '';
    saveState();
}

function deleteJournalEntry(id) {
    if (confirm('Delete this specific journal entry?')) {
        playSfx('click');
        appState.journals = appState.journals.filter(entry => entry.id !== id);
        saveState();
    }
}

function toggleSOSInstructions() {
    playSfx('click');
    const el = document.getElementById('sosInstructions');
    const btn = document.getElementById('sosToggleBtn');
    el.classList.toggle('hidden');
    if (el.classList.contains('hidden')) {
        btn.textContent = 'Deploy Grounding Protocol';
    } else {
        btn.textContent = 'Hide Protocol';
    }
}

function rotateProverb() {
    playSfx('click');
    const current = document.getElementById('proverbText').textContent;
    let next = current;
    while (next === current && PROVERBS.length > 1) {
        next = PROVERBS[Math.floor(Math.random() * PROVERBS.length)];
    }
    document.getElementById('proverbText').textContent = next;
}

function exportData() {
    playSfx('click');
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(appState, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `vortechs_wave_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
}

function importData(event) {
    playSfx('click');
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const parsed = JSON.parse(e.target.result);
            if (parsed.startDate && typeof parsed.shells === 'number') {
                appState = parsed;
                if (!Array.isArray(appState.journals)) appState.journals = [];
                if (!Array.isArray(appState.unlockedTrophies)) appState.unlockedTrophies = [];
                if (!Array.isArray(appState.ceilingNotes)) appState.ceilingNotes = [];
                if (!Array.isArray(appState.tackleInventory)) appState.tackleInventory = ['worm'];
                if (!appState.equippedLure) appState.equippedLure = 'worm';
                if (!appState.userName) appState.userName = 'Surfer';
                if (appState.boardMode !== 'shuffle') appState.boardMode = 'collage';
                if (!['standard', 'typewriter', 'stencil', 'serif'].includes(appState.noteFontStyle)) {
                    appState.noteFontStyle = 'standard';
                }
                saveState();
            } else {
                alert('Invalid backup file structure.');
            }
        } catch (err) {
            alert('Failed to parse JSON backup file.');
        }
    };
    reader.readAsText(file);
    event.target.value = '';
}

function updateStartDate() {
    const val = document.getElementById('startDateInput').value;
    if (!val) return;
    appState.startDate = val;
    saveState();
}

function calculateDays() {
    const start = new Date(appState.startDate);
    const now = new Date();
    const diffTime = now - start;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return Math.max(1, diffDays);
}

function updateCeilingEnvironment() {
    const hour = new Date().getHours();
    const root = document.documentElement;
    const phaseLabel = document.getElementById('timePhaseLabel');

    if (hour >= 5 && hour < 11) {
        root.style.setProperty('--ceiling-bg', 'linear-gradient(135deg, #d97706, #0d9488)');
        if (phaseLabel) phaseLabel.textContent = '🌅 Dawn Tide';
    } else if (hour >= 11 && hour < 17) {
        root.style.setProperty('--ceiling-bg', 'linear-gradient(135deg, #0077b6, #00b4d8)');
        if (phaseLabel) phaseLabel.textContent = '☀️ High Noon Surge';
    } else if (hour >= 17 && hour < 21) {
        root.style.setProperty('--ceiling-bg', 'linear-gradient(135deg, #3a0ca3, #4361ee)');
        if (phaseLabel) phaseLabel.textContent = '🌆 Twilight Current';
    } else {
        root.style.setProperty('--ceiling-bg', 'linear-gradient(135deg, #10002b, #3c096c)');
        if (phaseLabel) phaseLabel.textContent = '🌑 Midnight Abyss';
    }

    const now = new Date();
    const knownNewMoon = new Date(2000, 0, 6);
    const diffDays = (now - knownNewMoon) / (1000 * 60 * 60 * 24);
    const cycle = 29.5305877057;
    const daysIntoCycle = diffDays % cycle;
    const phasePercent = (daysIntoCycle / cycle) * 100;

    const lunarLabel = document.getElementById('lunarPhaseLabel');
    if (lunarLabel) {
        if (phasePercent < 3 || phasePercent > 97) lunarLabel.textContent = '🌑 New Moon (Spring Tide)';
        else if (phasePercent < 22) lunarLabel.textContent = '🌒 Waxing Crescent';
        else if (phasePercent < 28) lunarLabel.textContent = '🌓 First Quarter (Neap Tide)';
        else if (phasePercent < 47) lunarLabel.textContent = '🌔 Waxing Gibbous';
        else if (phasePercent < 53) lunarLabel.textContent = '🌕 Full Moon (Spring Tide)';
        else if (phasePercent < 72) lunarLabel.textContent = '🌖 Waning Gibbous';
        else if (phasePercent < 78) lunarLabel.textContent = '🌗 Last Quarter (Neap Tide)';
        else lunarLabel.textContent = '🌘 Waning Crescent';
    }
}

function updateClocks() {
    const now = new Date();
    const clockEl = document.getElementById('liveDigitalClock');
    if (clockEl) clockEl.textContent = now.toLocaleTimeString();

    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0);
    const diff = midnight - now;

    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    const pad = (n) => String(n).padStart(2, '0');
    const countdownEl = document.getElementById('midnightCountdownTimer');
    if (countdownEl) countdownEl.textContent = `${pad(hours)}h ${pad(minutes)}m ${pad(seconds)}s`;
}

function claimDailyLogin() {
    playSfx('checkin');
    const today = new Date().toDateString();
    if (appState.lastLoginDate === today) return;

    const oldHundreds = Math.floor(appState.shells / 100);
    appState.shells += 3;
    appState.lastLoginDate = today;
    const newHundreds = Math.floor(appState.shells / 100);

    if (newHundreds > oldHundreds) {
        appState.extraLives += 1;
    }

    saveState();
}

function buySurfboard(boardId) {
    playSfx('shop');
    const board = SURFBOARDS.find(b => b.id === boardId);
    if (!board) return;

    if (appState.shells < board.cost) return;

    appState.shells -= board.cost;
    appState.inventory.push(boardId);
    appState.equippedBoard = boardId;
    saveState();
}

function equipBoard(boardId) {
    playSfx('click');
    if (!appState.inventory.includes(boardId)) return;
    appState.equippedBoard = boardId;
    saveState();
}

function buyTackle(lureId) {
    playSfx('shop');
    const lure = TACKLE_LURES.find(l => l.id === lureId);
    if (!lure) return;

    if (appState.shells < lure.cost) return;

    appState.shells -= lure.cost;
    appState.tackleInventory.push(lureId);
    appState.equippedLure = lureId;
    saveState();
}

function equipLure(lureId) {
    playSfx('click');
    if (!appState.tackleInventory.includes(lureId)) return;
    appState.equippedLure = lureId;
    saveState();
}

function getMarineReefStatus(days) {
    if (days < 7) {
        return { zone: 'Sunlight Zone (0–200m)', creatures: '🐠', caption: `Day ${days}: Clownfish active.`, min: 1, max: 7 };
    } else if (days < 14) {
        return { zone: 'Sunlight Reef (Week 1)', creatures: '🐠 🐢', caption: `Day ${days}: Green Sea Turtle unlocked.`, min: 7, max: 14 };
    } else if (days < 30) {
        return { zone: 'Outer Reef (Week 2+)', creatures: '🐠 🐢 🐬', caption: `Day ${days}: Bottlenose Dolphin joined.`, min: 14, max: 30 };
    } else if (days < 90) {
        return { zone: 'Twilight Zone (Month 1+)', creatures: '🐠 🐢 🐬 🪼 🦑', caption: `Day ${days}: Jellyfish & Giant Squid unlocked.`, min: 30, max: 90 };
    } else {
        return { zone: 'Midnight Abyss (90+ Days)', creatures: '🐋 🦑 🪼 🐡', caption: `Day ${days}: Bioluminescent Abyssal Tier achieved.`, min: 90, max: 90 };
    }
}

function triggerResetPenalty() {
    playSfx('click');
    const confirmed = confirm('Confirm Relapse Reset?');
    if (!confirmed) return;

    appState.extraLives = Math.max(0, appState.extraLives - 1);
    appState.shells = 0;
    appState.startDate = new Date().toISOString().split('T')[0];
    appState.lastLoginDate = null;
    appState.inventory = ['classic'];
    appState.equippedBoard = 'classic';
    appState.tackleInventory = ['worm'];
    appState.equippedLure = 'worm';
    appState.unlockedTrophies = [];
    appState.ceilingNotes = [];

    saveState();
}

function toggleICE() {
    playSfx('click');
    document.getElementById('iceDrawer').classList.toggle('hidden');
}

function toggleVisitorMode() {
    playSfx('click');
    isVisitorMode = !isVisitorMode;
    const btn = document.getElementById('visitorToggleBtn');
    const clock = document.getElementById('clockSection');
    const sticky = document.getElementById('stickyNotesSection');
    const sos = document.getElementById('sosSection');
    const aiCoach = document.getElementById('aiCoachSection');
    const proverb = document.getElementById('proverbSection');
    const trophy = document.getElementById('trophySection');
    const breath = document.getElementById('breathSection');
    const shop = document.getElementById('shopSection');
    const journal = document.getElementById('journalSection');
    const dataVault = document.getElementById('dataSection');
    const controls = document.getElementById('controlsSection');
    const danger = document.getElementById('dangerSection');
    const title = document.getElementById('headerTitle');

    if (isVisitorMode) {
        btn.textContent = '🔓 Exit Swimming';
        clock.style.display = 'none';
        sticky.style.display = 'block';
        sos.style.display = 'none';
        aiCoach.style.display = 'none';
        proverb.style.display = 'none';
        trophy.style.display = 'none';
        breath.style.display = 'none';
        shop.style.display = 'block';
        switchLockerTab('baitshop');
        journal.style.display = 'none';
        dataVault.style.display = 'none';
        controls.style.display = 'none';
        danger.style.display = 'none';
        title.textContent = `🔍 ${appState.userName || 'Surfer'}'s Swimming Locker & Bait Shop`;
    } else {
        btn.textContent = '🏖️ Swimming';
        clock.style.display = 'block';
        sticky.style.display = 'block';
        sos.style.display = 'block';
        aiCoach.style.display = 'block';
        proverb.style.display = 'block';
        trophy.style.display = 'block';
        breath.style.display = 'block';
        shop.style.display = 'block';
        switchLockerTab('hub');
        journal.style.display = 'block';
        dataVault.style.display = 'block';
        controls.style.display = 'block';
        danger.style.display = 'block';
        title.textContent = '🌊 vorTechS WAVE';
    }
}

function renderUI() {
    const days = calculateDays();
    checkTrophies(days);
    syncBoardModeButtons();
    syncNoteFontStyle();

    document.getElementById('streakCount').textContent = days;
    document.getElementById('shellCount').textContent = appState.shells;
    document.getElementById('lifeCount').textContent = appState.extraLives;
    document.getElementById('startDateInput').value = appState.startDate;

    const userNameInput = document.getElementById('userNameInput');
    if (userNameInput && document.activeElement !== userNameInput) {
        userNameInput.value = appState.userName || 'C0DA';
    }

    const today = new Date().toDateString();
    const claimBtn = document.getElementById('dailyClaimBtn');
    if (appState.lastLoginDate === today) {
        claimBtn.disabled = true;
        claimBtn.textContent = 'Daily Check-In Claimed ✓';
    } else {
        claimBtn.disabled = false;
        claimBtn.textContent = 'Claim Daily Check-In (+3 🐚)';
    }

    const reef = getMarineReefStatus(days);
    document.getElementById('oceanZoneBadge').textContent = reef.zone;
    document.getElementById('creatureDisplay').textContent = reef.creatures;
    document.getElementById('creatureStatus').textContent = reef.caption;

    let progressPercent = 100;
    if (reef.min !== reef.max) {
        const currentSpan = days - reef.min;
        const totalSpan = reef.max - reef.min;
        progressPercent = Math.min(100, Math.max(0, Math.floor((currentSpan / totalSpan) * 100)));
    }
    document.getElementById('progressBar').style.width = progressPercent + '%';
    document.getElementById('progressPercent').textContent = progressPercent + '%';
    document.getElementById('progressTitle').textContent = reef.max === 90 ? 'Abyssal Max Tier' : `Progress to Day ${reef.max}`;

    const banner = document.getElementById('remoteCeilingBanner');
    const bannerTitle = document.getElementById('remoteCeilingTitle');
    const sectionTitle = document.getElementById('stickySectionTitle');
    if (activeRemoteProfile) {
        if (banner) banner.classList.remove('hidden');
        if (bannerTitle) bannerTitle.textContent = `${activeRemoteProfile.username} (${activeRemoteProfile.swimming})`;
        if (sectionTitle) sectionTitle.textContent = `📌 ${activeRemoteProfile.username}'s Ceiling Sticky Notes`;
    } else {
        if (banner) banner.classList.add('hidden');
        if (sectionTitle) sectionTitle.textContent = '📌 Ceiling Sticky Notes & Encouragement';
    }

    const stickyBoard = document.getElementById('stickyBoard');
    stickyBoard.innerHTML = '';
    const baseNotes = activeRemoteProfile
        ? (Array.isArray(activeRemoteProfile.ceilingNotes) ? activeRemoteProfile.ceilingNotes : [])
        : (Array.isArray(appState.ceilingNotes) ? appState.ceilingNotes : []);

    let notes = [...baseNotes];
    if (appState.boardMode === 'shuffle' && shuffleOrderIds.length > 0) {
        const rankMap = new Map(shuffleOrderIds.map((id, idx) => [id, idx]));
        notes.sort((a, b) => (rankMap.get(a.id) ?? 999999) - (rankMap.get(b.id) ?? 999999));
    }

    const searchQuery = (document.getElementById('stickySearchInput')?.value || '').toLowerCase();
    const filteredNotes = notes.filter(note => (note.text || '').toLowerCase().includes(searchQuery));

    if (filteredNotes.length === 0) {
        stickyBoard.innerHTML = `<div style="font-size: 0.8rem; color: var(--text-muted); text-align: center; position: absolute; width: 100%; top: 50%; transform: translateY(-50%);">${baseNotes.length === 0 ? 'No ceiling notes pinned yet.' : 'No matching notes found.'}</div>`;
    } else {
        filteredNotes.forEach((note, index) => {
            const noteDiv = document.createElement('div');
            noteDiv.className = 'sticky-note';

            if (appState.boardMode !== 'shuffle') {
                if (typeof note.x !== 'number') note.x = 10 + (index * 20) % 200;
                if (typeof note.y !== 'number') note.y = 10 + (index * 30) % 150;
                noteDiv.style.left = note.x + 'px';
                noteDiv.style.top = note.y + 'px';
            }

            const bgColor = note.color || '#ffd166';
            noteDiv.style.backgroundColor = bgColor;
            noteDiv.style.color = '#0b132b';

            let mediaHtml = note.media ? `<img src="${note.media}" class="sticky-img" alt="Attached photo">` : '';
            let authorHtml = note.author ? `<div style="font-size: 0.7rem; font-weight: bold; margin-top: 4px; opacity: 0.85;">— ${note.author}</div>` : '';
            noteDiv.innerHTML = `
                <div>
                    <div class="sticky-header">
                        <span>${note.emoji || '🌟'}</span>
                        <button class="sticky-delete" onclick="event.stopPropagation(); deleteStickyNote(${note.id})" title="Remove Note">🗑️</button>
                    </div>
                    <div style="font-size: 0.82rem; margin-top: 4px; white-space: pre-line;">${note.text}</div>
                    ${mediaHtml}
                    ${authorHtml}
                </div>
                <div style="font-size: 0.65rem; opacity: 0.6; margin-top: 6px; text-align: right;">${note.timestamp}</div>
            `;

            initDraggableNote(noteDiv, note);
            stickyBoard.appendChild(noteDiv);
        });
    }

    const renderTrophyListInto = (containerId) => {
        const grid = document.getElementById(containerId);
        if (!grid) return;
        grid.innerHTML = '';
        TROPHIES.forEach(t => {
            let unlocked = appState.unlockedTrophies.includes(t.id);
            if (!unlocked) {
                if (t.req && days >= t.req) unlocked = true;
                if (t.reqShells && appState.shells >= t.reqShells) unlocked = true;
            }

            const div = document.createElement('div');
            div.className = `trophy-item ${unlocked ? 'unlocked' : ''}`;
            div.innerHTML = `
                <div class="trophy-icon">${t.icon}</div>
                <div class="trophy-info">
                    <div class="trophy-title">${t.name}</div>
                    <div class="trophy-desc">${t.desc}</div>
                </div>
            `;
            grid.appendChild(div);
        });
    };
    renderTrophyListInto('trophyGrid');
    renderTrophyListInto('lockerTrophyGrid');

    const aquariumContainer = document.getElementById('aquariumCreaturesList');
    if (aquariumContainer) {
        aquariumContainer.innerHTML = '';
        ALL_CREATURES_MILESTONES.forEach(c => {
            const unlocked = days >= c.day;
            const div = document.createElement('div');
            div.style.cssText = `padding: 10px; background: rgba(0,0,0,0.25); border-radius: 8px; text-align: center; border: 1px solid ${unlocked ? 'var(--accent, #00f5d4)' : 'rgba(255,255,255,0.1)'}; opacity: ${unlocked ? '1' : '0.5'};`;
            div.innerHTML = `
                <div style="font-size: 1.8rem; margin-bottom: 4px;">${unlocked ? c.icon : '🔒'}</div>
                <div style="font-size: 0.8rem; font-weight: bold;">${c.name}</div>
                <div style="font-size: 0.7rem; opacity: 0.7;">Day ${c.day}+ (${c.zone})</div>
            `;
            aquariumContainer.appendChild(div);
        });
    }

    const equipped = SURFBOARDS.find(b => b.id === appState.equippedBoard) || SURFBOARDS[0];
    const equippedDisplay = document.getElementById('equippedBoardDisplay');
    if (equippedDisplay) equippedDisplay.textContent = equipped.icon;

    const equippedLure = TACKLE_LURES.find(l => l.id === appState.equippedLure) || TACKLE_LURES[0];
    const equippedLureDisplay = document.getElementById('equippedLureDisplay');
    if (equippedLureDisplay) {
        equippedLureDisplay.textContent = equippedLure.icon;
        equippedLureDisplay.title = `Equipped Lure: ${equippedLure.name}`;
    }

    const shopGrid = document.getElementById('shopGrid');
    if (shopGrid) {
        shopGrid.innerHTML = '';
        SURFBOARDS.forEach(board => {
            const owned = appState.inventory.includes(board.id);
            const div = document.createElement('div');
            div.className = 'shop-item';
            div.innerHTML = `
                <div class="shop-item-icon">${board.icon}</div>
         
}

function switchLockerTab(tabName) {
    playSfx('click');
    currentLockerTab = tabName;

    ['lockerHubView', 'lockerBaitshopView', 'lockerAquariumView', 'lockerBoxView', 'lockerTrophiesView', 'lockerBoredBreakersView'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.add('hidden');
    });
    ['tabHubBtn', 'tabBaitshopBtn', 'tabAquariumBtn', 'tabLockerBtn', 'tabTrophiesBtn', 'tabBoredBreakersBtn'].forEach(id => {
        const btn = document.getElementById(id);
        if (btn) {
            btn.classList.remove('primary');
            btn.classList.add('secondary');
        }
    });

    const viewMap = {
        hub: { view: 'lockerHubView', btn: 'tabHubBtn' },
        baitshop: { view: 'lockerBaitshopView', btn: 'tabBaitshopBtn' },
        aquarium: { view: 'lockerAquariumView', btn: 'tabAquariumBtn' },
        locker: { view: 'lockerBoxView', btn: 'tabLockerBtn' },
        trophies: { view: 'lockerTrophiesView', btn: 'tabTrophiesBtn' },
        boredbreakers: { view: 'lockerBoredBreakersView', btn: 'tabBoredBreakersBtn' }
    };

    const target = viewMap[tabName];
    if (target) {
        const viewEl = document.getElementById(target.view);
        const btnEl = document.getElementById(target.btn);
        if (viewEl) viewEl.classList.remove('hidden');
        if (btnEl) {
            btnEl.classList.remove('secondary');
            btnEl.classList.add('primary');
        }
    }
}

function askQueryCorner() {
    playSfx('click');
    const qInput = document.getElementById('queryCornerInput');
    const out = document.getElementById('queryCornerAnswer');
    const question = (qInput?.value || '').trim();
    const pick = QUERY_CORNER_RESPONSES[Math.floor(Math.random() * QUERY_CORNER_RESPONSES.length)];
    out.textContent = question ? `"${question}" → ${pick}` : `Oracle says: ${pick}`;
}

function startSimonGame() {
    playSfx('click');
    simonSequence = [];
    simonUserIndex = 0;
    simonAcceptingInput = false;
    nextSimonRound();
}

function nextSimonRound() {
    simonSequence.push(Math.floor(Math.random() * 4));
    simonUserIndex = 0;
    simonAcceptingInput = false;
    const statusEl = document.getElementById('simonStatus');
    statusEl.textContent = `Watch closely — Round ${simonSequence.length}...`;

    const names = ['Red', 'Blue', 'Green', 'Yellow'];
    let i = 0;
    const timer = setInterval(() => {
        if (i >= simonSequence.length) {
            clearInterval(timer);
            simonAcceptingInput = true;
            statusEl.textContent = `Your turn! Repeat ${simonSequence.length} step(s).`;
            return;
        }
        const padId = `simonPad${simonSequence[i]}`;
        const pad = document.getElementById(padId);
        if (pad) {
            pad.style.transform = 'scale(1.05)';
            playSfx('click');
            setTimeout(() => { pad.style.transform = 'scale(1)'; }, 260);
        }
        statusEl.textContent = `Pattern: ${names[simonSequence[i]]} (${i + 1}/${simonSequence.length})`;
        i++;
    }, 650);
}

function pressSimonPad(padIndex) {
    if (!simonAcceptingInput) return;
    playSfx('click');
    const statusEl = document.getElementById('simonStatus');
    if (simonSequence[simonUserIndex] === padIndex) {
        simonUserIndex++;
        if (simonUserIndex === simonSequence.length) {
            simonAcceptingInput = false;
            statusEl.textContent = `Nice! Cleared Round ${simonSequence.length}. Next round coming...`;
            setTimeout(nextSimonRound, 900);
        }
    } else {
        simonAcceptingInput = false;
        const reached = simonSequence.length;
        simonSequence = [];
        statusEl.textContent = `Missed that step! You reached Round ${reached}. Press Start Simon Round to try again.`;
    }
}

function resetGuessTen() {
    playSfx('click');
    secretTenNumber = Math.floor(Math.random() * 10) + 1;
    guessTenAttempts = 0;
    document.getElementById('guessTenInput').value = '';
    document.getElementById('guessTenResult').textContent = 'New number chosen between 1 and 10.';
}

function submitGuessTen() {
    playSfx('click');
    const val = parseInt(document.getElementById('guessTenInput').value, 10);
    const out = document.getElementById('guessTenResult');
    if (isNaN(val) || val < 1 || val > 10) {
        out.textContent = 'Enter a number from 1 to 10.';
        return;
    }
    guessTenAttempts++;
    if (val === secretTenNumber) {
        out.textContent = `Got it! The number was ${secretTenNumber} (${guessTenAttempts} guess${guessTenAttempts === 1 ? '' : 'es'}).`;
    } else if (val < secretTenNumber) {
        out.textContent = `Higher than ${val} (Guess #${guessTenAttempts}).`;
    } else {
        out.textContent = `Lower than ${val} (Guess #${guessTenAttempts}).`;
    }
}

function flashEightDigitNumber() {
    playSfx('click');
    if (eightDigitTimeout) clearTimeout(eightDigitTimeout);
    let num = '';
    for (let i = 0; i < 8; i++) {
        num += Math.floor(Math.random() * 10);
    }
    currentEightDigitSecret = num;
    const display = document.getElementById('eightDigitFlashDisplay');
    document.getElementById('eightDigitRecallInput').value = '';
    document.getElementById('eightDigitResult').textContent = '';
    display.textContent = num;

    eightDigitTimeout = setTimeout(() => {
        display.textContent = '••••••••';
    }, 2500);
}

function checkEightDigitRecall() {
    playSfx('click');
    const attempt = (document.getElementById('eightDigitRecallInput').value || '').trim();
    const out = document.getElementById('eightDigitResult');
    if (!currentEightDigitSecret) {
        out.textContent = 'Click "Flash 8-Digit Number" first.';
        return;
    }
    if (attempt === currentEightDigitSecret) {
        out.textContent = `Exact match! (${currentEightDigitSecret})`;
    } else {
        out.textContent = `Not quite — it was ${currentEightDigitSecret}.`;
    }
}

function pickMysteryBox(boxNum) {
    playSfx('shop');
    const prizes = [
        'Empty box—just a cool smooth pebble.',
        'Found a hidden message: "Take it one wave at a time."',
        'A surprise decoy—no extra shells inside!',
        'A tiny rubber ducky staring back at you.'
    ];
    const outcome = prizes[Math.floor(Math.random() * prizes.length)];
    document.getElementById('pickBoxResult').textContent = `Box ${boxNum}: ${outcome}`;
}

function stepTwentyOneQuestion() {
    playSfx('click');
    const label = document.getElementById('twentyOneCountLabel');
    const promptBox = document.getElementById('twentyOnePromptText');
    if (twentyOneRemaining <= 0) {
        promptBox.textContent = 'All 21 questions used! Make your final guess or reset.';
        return;
    }
    twentyOneRemaining--;
    const used = 21 - twentyOneRemaining;
    label.textContent = `Questions Left: ${twentyOneRemaining} / 21`;
    const nextPrompt = TWENTY_ONE_PROMPTS[used % TWENTY_ONE_PROMPTS.length];
    promptBox.textContent = `Question #${used} asked — Next idea: ${nextPrompt}`;
}

function resetTwentyOneGame() {
    playSfx('click');
    twentyOneRemaining = 21;
    document.getElementById('twentyOneCountLabel').textContent = 'Questions Left: 21 / 21';
    document.getElementById('twentyOnePromptText').textContent = `Starter prompt: ${TWENTY_ONE_PROMPTS[0]}`;
}

function playSfx(type) {
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const now = ctx.currentTime;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);

        if (type === 'checkin') {
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(440, now);
            osc.frequency.exponentialRampToValueAtTime(880, now + 0.15);
            gain.gain.setValueAtTime(0.1, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
            osc.start(now);
            osc.stop(now + 0.25);
        } else if (type === 'shop') {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(600, now);
            osc.frequency.setValueAtTime(900, now + 0.1);
            gain.gain.setValueAtTime(0.12, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
            osc.start(now);
            osc.stop(now + 0.3);
        } else {
            osc.type = 'sine';
            osc.frequency.setValueAtTime(300, now);
            gain.gain.setValueAtTime(0.05, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
            osc.start(now);
            osc.stop(now + 0.05);
        }
    } catch (e) {
        console.log('Sfx audio error:', e);
    }
}

function requestDailyNotifications() {
    playSfx('click');
    if (!("Notification" in window)) {
        alert("Browser does not support desktop notifications.");
        return;
    }
    Notification.requestPermission().then(permission => {
        if (permission === "granted") {
            new Notification("🌊 vorTechS WAVE", { body: "Notifications active! Time to check your daily tide." });
        }
    });
}

function handleFileSelect(event) {
    playSfx('click');
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
        uploadedImageBase64 = e.target.result;
        document.getElementById('fileLabelText').textContent = 'Photo Attached ✓';
    };
    reader.readAsDataURL(file);
}

function playMilestoneChime() {
    try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const now = ctx.currentTime;
        const frequencies = [523.25, 659.25, 783.99, 1046.50];
        frequencies.forEach((freq, index) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();

            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now + index * 0.08);

            gain.gain.setValueAtTime(0, now + index * 0.08);
            gain.gain.linearRampToValueAtTime(0.12, now + index * 0.08 + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.001, now + index * 0.08 + 0.5);

            osc.connect(gain);
            gain.connect(ctx.destination);

            osc.start(now + index * 0.08);
            osc.stop(now + index * 0.08 + 0.6);
        });
    } catch (e) {
        console.log('Audio chime error:', e);
    }
}

function saveState() {
    localStorage.setItem('vortechs_wave_clean_v3', JSON.stringify(appState));
    renderUI();
}

function updateUserName(val) {
    playSfx('click');
    appState.userName = val.trim() || 'C0DA';
    saveState();
}

function checkTrophies(days) {
    let newlyUnlocked = false;
    TROPHIES.forEach(t => {
        let unlocked = false;
        if (t.req && days >= t.req) unlocked = true;
        if (t.reqShells && appState.shells >= t.reqShells) unlocked = true;

        if (unlocked && !appState.unlockedTrophies.includes(t.id)) {
            appState.unlockedTrophies.push(t.id);
            newlyUnlocked = true;
            playMilestoneChime();
        }
    });
    if (newlyUnlocked) {
        localStorage.setItem('vortechs_wave_clean_v3', JSON.stringify(appState));
    }
}

function handleStickyKey(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        addStickyNote();
    }
}

function handleSearchKey(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        event.target.blur();
        playSfx('click');
    }
}

function handleJournalKey(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        saveJournalEntry();
    }
}

function handleAiKey(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        runAiQuery();
    }
}

async function runAiQuery() {
    playSfx('click');
    const promptInput = document.getElementById('aiPromptInput');
    const responseBox = document.getElementById('aiResponseBox');
    const promptText = promptInput.value.trim();

    if (!promptText) return;

    responseBox.style.display = 'block';
    responseBox.innerHTML = '<em>Lifeguard Finn (🛟) is analyzing the tide... Please wait...</em>';

    try {
        const currentStreak = calculateDays();
        const userName = appState.userName || 'C0DA';
        const recentJournals = Array.isArray(appState.journals) ? appState.journals.slice(0, 3).map(j => `[${j.mood}] ${j.text}`).join("; ") : "None";

        const systemPrompt = `You are Lifeguard Finn (🛟), the dedicated deep-sea mindfulness coach for vorTechS WAVE. The surfer's name is ${userName}, and they are currently on Day ${currentStreak} of their journey. Recent journal context: ${recentJournals}. Keep your response concise, grounding, encouraging, and always address ${userName} directly by name.`;

        const response = await fetch('http://localhost:11434/api/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'custom_llama',
                prompt: `${systemPrompt}\n\nUser request: ${promptText}`,
                stream: false
            })
        });

        if (!response.ok) {
            throw new Error(`Ollama server error: ${response.statusText}`);
        }

        const data = await response.json();
        responseBox.innerHTML = `<strong>Lifeguard Finn (🛟):</strong><br>${data.response}`;
        playSfx('shop');

    } catch (error) {
        console.error("Ollama connection failed:", error);
        responseBox.innerHTML = `<strong>Error:</strong> Could not reach local Ollama instance on port 11434. Make sure Ollama is running with CORS enabled.`;
    }
}

function addStickyNote() {
    playSfx('shop');
    const text = document.getElementById('stickyInput').value.trim();
    const author = document.getElementById('stickyAuthorInput').value.trim();
    const emoji = document.getElementById('stickyEmojiSelect').value;
    const color = document.getElementById('stickyColorSelect').value;

    if (!text && !uploadedImageBase64) return;

    const board = document.getElementById('stickyBoard');
    const startX = Math.max(10, Math.floor(Math.random() * Math.max(20, board.clientWidth - 160)));
    const startY = Math.max(10, Math.floor(Math.random() * Math.max(20, board.clientHeight - 130)));

    const newNote = {
        id: Date.now(),
        text: text,
        author: author || appState.userName || 'Surfer',
        media: uploadedImageBase64,
        emoji: emoji,
        color: color,
        x: startX,
        y: startY,
        timestamp: new Date().toLocaleDateString()
    };

    if (activeRemoteProfile) {
        if (!Array.isArray(activeRemoteProfile.ceilingNotes)) activeRemoteProfile.ceilingNotes = [];
        activeRemoteProfile.ceilingNotes.push(newNote);
    } else {
        appState.ceilingNotes.push(newNote);
    }

    document.getElementById('stickyInput').value = '';
    document.getElementById('stickyAuthorInput').value = '';
    document.getElementById('stickyFileInput').value = '';
    uploadedImageBase64 = null;
    document.getElementById('fileLabelText').textContent = 'Attach Photo from Device';

    if (activeRemoteProfile) {
        renderUI();
    } else {
        saveState();
    }
}

function deleteStickyNote(id) {
    playSfx('click');
    if (activeRemoteProfile) {
        activeRemoteProfile.ceilingNotes = (activeRemoteProfile.ceilingNotes || []).filter(note => note.id !== id);
        renderUI();
        return;
    }
    appState.ceilingNotes = appState.ceilingNotes.filter(note => note.id !== id);
    saveState();
}

function openNoteModal(note) {
    playSfx('click');
    document.getElementById('expandedEmoji').textContent = note.emoji || '🌟';
    const expandedTextEl = document.getElementById('expandedText');
    expandedTextEl.style.whiteSpace = 'pre-line';
    expandedTextEl.textContent = note.text || '';
    document.getElementById('expandedTimestamp').textContent = (note.author ? 'By ' + note.author + ' • ' : '') + (note.timestamp || '');

    const mediaContainer = document.getElementById('expandedMediaContainer');
    mediaContainer.innerHTML = '';
    if (note.media) {
        const img = document.createElement('img');
        img.src = note.media;
        img.className = 'expanded-img';
        mediaContainer.appendChild(img);
    }

    const card = document.getElementById('expandedNoteCard');
    card.style.backgroundColor = note.color || '#ffd166';
    card.style.color = '#0b132b';
    ['font-typewriter', 'font-stencil', 'font-serif'].forEach(cls => card.classList.remove(cls));
    if (appState.noteFontStyle && appState.noteFontStyle !== 'standard') {
        card.classList.add(`font-${appState.noteFontStyle}`);
    }

    document.getElementById('noteModalOverlay').classList.remove('hidden');
}

function closeNoteModal() {
    playSfx('click');
    document.getElementById('noteModalOverlay').classList.add('hidden');
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeNoteModal();
    }
});

function initDraggableNote(element, noteObj) {
    let startX = 0, startY = 0, initialX = 0, initialY = 0;
    let hasMoved = false;

    const dragStart = (e) => {
        if (e.target.tagName === 'BUTTON' || e.target.closest('button')) return;
        hasMoved = false;
        if (appState.boardMode === 'shuffle') {
            element.addEventListener('click', function handleShuffleClick() {
                element.removeEventListener('click', handleShuffleClick);
                openNoteModal(noteObj);
            }, { once: true });
            return;
        }

        const clientX = e.clientX || (e.touches && e.touches[0].clientX);
        const clientY = e.clientY || (e.touches && e.touches[0].clientY);

        startX = clientX;
        startY = clientY;

        initialX = noteObj.x || 10;
        initialY = noteObj.y || 10;

        document.addEventListener('mousemove', dragMove);
        document.addEventListener('mouseup', dragEnd);
        document.addEventListener('touchmove', dragMove, { passive: false });
        document.addEventListener('touchend', dragEnd);
    };

    const dragMove = (e) => {
        const clientX = e.clientX || (e.touches && e.touches[0].clientX);
        const clientY = e.clientY || (e.touches && e.touches[0].clientY);

        const dx = clientX - startX;
        const dy = clientY - startY;

        if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
            hasMoved = true;
            element.style.zIndex = 1000;
        }

        if (hasMoved) {
            e.preventDefault();
            let newX = initialX + dx;
            let newY = initialY + dy;

            const board = document.getElementById('stickyBoard');
            const maxX = board.clientWidth - element.offsetWidth;
            const maxY = board.clientHeight - element.offsetHeight;

            newX = Math.max(0, Math.min(newX, maxX));
            newY = Math.max(0, Math.min(newY, maxY));

            element.style.left = newX + 'px';
            element.style.top = newY + 'px';

            noteObj.x = newX;
            noteObj.y = newY;
        }
    };

    const dragEnd = () => {
        element.style.zIndex = '';
        document.removeEventListener('mousemove', dragMove);
        document.removeEventListener('mouseup', dragEnd);
        document.removeEventListener('touchmove', dragMove);
        document.removeEventListener('touchend', dragEnd);
        if (!activeRemoteProfile) {
            localStorage.setItem('vortechs_wave_clean_v3', JSON.stringify(appState));
        }

        if (!hasMoved) {
            openNoteModal(noteObj);
        }
    };

    element.addEventListener('mousedown', dragStart);
    element.addEventListener('touchstart', dragStart, { passive: false });
}

function selectMood(mood) {
    playSfx('click');
    selectedMood = mood;
    ['moodCalm', 'moodChoppy', 'moodRadiant', 'moodDeep'].forEach(id => {
        document.getElementById(id).classList.remove('selected');
    });
    if (mood === '🌊 Calm') document.getElementById('moodCalm').classList.add('selected');
    if (mood === '⛈️ Choppy') document.getElementById('moodChoppy').classList.add('selected');
    if (mood === '☀️ Radiant') document.getElementById('moodRadiant').classList.add('selected');
    if (mood === '🌑 Deep') document.getElementById('moodDeep').classList.add('selected');
}

function selectTag(tag) {
    playSfx('click');
    selectedTag = tag;
    ['tagReflect', 'tagWin', 'tagUrge', 'tagGratitude'].forEach(id => {
        document.getElementById(id).classList.remove('selected');
    });
    if (tag === '✨ Reflect') document.getElementById('tagReflect').classList.add('selected');
    if (tag === '🏆 Win') document.getElementById('tagWin').classList.add('selected');
    if (tag === '⚡ Urge') document.getElementById('tagUrge').classList.add('selected');
    if (tag === '🙏 Gratitude') document.getElementById('tagGratitude').classList.add('selected');
}

function setJournalFilter(filter) {
    playSfx('click');
    activeJournalFilter = filter;
    ['filterAll', 'filterReflect', 'filterWin', 'filterUrge', 'filterGratitude'].forEach(id => {
        document.getElementById(id).classList.remove('active');
    });
    if (filter === 'all') document.getElementById('filterAll').classList.add('active');
    if (filter === '✨ Reflect') document.getElementById('filterReflect').classList.add('active');
    if (filter === '🏆 Win') document.getElementById('filterWin').classList.add('active');
    if (filter === '⚡ Urge') document.getElementById('filterUrge').classList.add('active');
    if (filter === '🙏 Gratitude') document.getElementById('filterGratitude').classList.add('active');
    renderUI();
}

function saveJournalEntry() {
    playSfx('shop');
    const text = document.getElementById('journalInput').value.trim();
    if (!text) return;
    const now = new Date();
    const newEntry = {
        id: Date.now(),
        timestamp: now.toLocaleString(),
        text: text,
        mood: selectedMood,
        tag: selectedTag
    };
    appState.journals.unshift(newEntry);
    document.getElementById('journalInput').value = '';
    saveState();
}

function deleteJournalEntry(id) {
    if (confirm('Delete this specific journal entry?')) {
        playSfx('click');
        appState.journals = appState.journals.filter(entry => entry.id !== id);
        saveState();
    }
}

function toggleSOSInstructions() {
    playSfx('click');
    const el = document.getElementById('sosInstructions');
    const btn = document.getElementById('sosToggleBtn');
    el.classList.toggle('hidden');
    if (el.classList.contains('hidden')) {
        btn.textContent = 'Deploy Grounding Protocol';
    } else {
        btn.textContent = 'Hide Protocol';
    }
}

function rotateProverb() {
    playSfx('click');
    const current = document.getElementById('proverbText').textContent;
    let next = current;
    while (next === current && PROVERBS.length > 1) {
        next = PROVERBS[Math.floor(Math.random() * PROVERBS.length)];
    }
    document.getElementById('proverbText').textContent = next;
}

function exportData() {
    playSfx('click');
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(appState, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `vortechs_wave_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
}

function importData(event) {
    playSfx('click');
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const parsed = JSON.parse(e.target.result);
            if (parsed.startDate && typeof parsed.shells === 'number') {
                appState = parsed;
                if (!Array.isArray(appState.journals)) appState.journals = [];
                if (!Array.isArray(appState.unlockedTrophies)) appState.unlockedTrophies = [];
                if (!Array.isArray(appState.ceilingNotes)) appState.ceilingNotes = [];
                if (!Array.isArray(appState.tackleInventory)) appState.tackleInventory = ['worm'];
                if (!appState.equippedLure) appState.equippedLure = 'worm';
                if (!appState.userName) appState.userName = 'C0DA';
                if (appState.boardMode !== 'shuffle') appState.boardMode = 'collage';
                if (!['standard', 'typewriter', 'stencil', 'serif'].includes(appState.noteFontStyle)) {
                    appState.noteFontStyle = 'standard';
                }
                saveState();
            } else {
                alert('Invalid backup file structure.');
            }
        } catch (err) {
            alert('Failed to parse JSON backup file.');
        }
    };
    reader.readAsText(file);
    event.target.value = '';
}

function updateStartDate() {
    const val = document.getElementById('startDateInput').value;
    if (!val) return;
    appState.startDate = val;
    saveState();
}

function calculateDays() {
    const start = new Date(appState.startDate);
    const now = new Date();
    const diffTime = now - start;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return Math.max(1, diffDays);
}

function updateCeilingEnvironment() {
    const hour = new Date().getHours();
    const root = document.documentElement;
    const phaseLabel = document.getElementById('timePhaseLabel');

    if (hour >= 5 && hour < 11) {
        root.style.setProperty('--ceiling-bg', 'linear-gradient(135deg, #d97706, #0d9488)');
        if (phaseLabel) phaseLabel.textContent = '🌅 Dawn Tide';
    } else if (hour >= 11 && hour < 17) {
        root.style.setProperty('--ceiling-bg', 'linear-gradient(135deg, #0077b6, #00b4d8)');
        if (phaseLabel) phaseLabel.textContent = '☀️ High Noon Surge';
    } else if (hour >= 17 && hour < 21) {
        root.style.setProperty('--ceiling-bg', 'linear-gradient(135deg, #3a0ca3, #4361ee)');
        if (phaseLabel) phaseLabel.textContent = '🌆 Twilight Current';
    } else {
        root.style.setProperty('--ceiling-bg', 'linear-gradient(135deg, #10002b, #3c096c)');
        if (phaseLabel) phaseLabel.textContent = '🌑 Midnight Abyss';
    }

    const now = new Date();
    const knownNewMoon = new Date(2000, 0, 6);
    const diffDays = (now - knownNewMoon) / (1000 * 60 * 60 * 24);
    const cycle = 29.5305877057;
    const daysIntoCycle = diffDays % cycle;
    const phasePercent = (daysIntoCycle / cycle) * 100;

    const lunarLabel = document.getElementById('lunarPhaseLabel');
    if (lunarLabel) {
        if (phasePercent < 3 || phasePercent > 97) lunarLabel.textContent = '🌑 New Moon (Spring Tide)';
        else if (phasePercent < 22) lunarLabel.textContent = '🌒 Waxing Crescent';
        else if (phasePercent < 28) lunarLabel.textContent = '🌓 First Quarter (Neap Tide)';
        else if (phasePercent < 47) lunarLabel.textContent = '🌔 Waxing Gibbous';
        else if (phasePercent < 53) lunarLabel.textContent = '🌕 Full Moon (Spring Tide)';
        else if (phasePercent < 72) lunarLabel.textContent = '🌖 Waning Gibbous';
        else if (phasePercent < 78) lunarLabel.textContent = '🌗 Last Quarter (Neap Tide)';
        else lunarLabel.textContent = '🌘 Waning Crescent';
    }
}

function updateClocks() {
    const now = new Date();
    const clockEl = document.getElementById('liveDigitalClock');
    if (clockEl) clockEl.textContent = now.toLocaleTimeString();

    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0);
    const diff = midnight - now;

    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    const pad = (n) => String(n).padStart(2, '0');
    const countdownEl = document.getElementById('midnightCountdownTimer');
    if (countdownEl) countdownEl.textContent = `${pad(hours)}h ${pad(minutes)}m ${pad(seconds)}s`;
}

function claimDailyLogin() {
    playSfx('checkin');
    const today = new Date().toDateString();
    if (appState.lastLoginDate === today) return;

    const oldHundreds = Math.floor(appState.shells / 100);
    appState.shells += 3;
    appState.lastLoginDate = today;
    const newHundreds = Math.floor(appState.shells / 100);

    if (newHundreds > oldHundreds) {
        appState.extraLives += 1;
    }

    saveState();
}

function buySurfboard(boardId) {
    playSfx('shop');
    const board = SURFBOARDS.find(b => b.id === boardId);
    if (!board) return;

    if (appState.shells < board.cost) return;

    appState.shells -= board.cost;
    appState.inventory.push(boardId);
    appState.equippedBoard = boardId;
    saveState();
}

function equipBoard(boardId) {
    playSfx('click');
    if (!appState.inventory.includes(boardId)) return;
    appState.equippedBoard = boardId;
    saveState();
}

function buyTackle(lureId) {
    playSfx('shop');
    const lure = TACKLE_LURES.find(l => l.id === lureId);
    if (!lure) return;

    if (appState.shells < lure.cost) return;

    appState.shells -= lure.cost;
    appState.tackleInventory.push(lureId);
    appState.equippedLure = lureId;
    saveState();
}

function equipLure(lureId) {
    playSfx('click');
    if (!appState.tackleInventory.includes(lureId)) return;
    appState.equippedLure = lureId;
    saveState();
}

function getMarineReefStatus(days) {
    if (days < 7) {
        return { zone: 'Sunlight Zone (0–200m)', creatures: '🐠', caption: `Day ${days}: Clownfish active.`, min: 1, max: 7 };
    } else if (days < 14) {
        return { zone: 'Sunlight Reef (Week 1)', creatures: '🐠 🐢', caption: `Day ${days}: Green Sea Turtle unlocked.`, min: 7, max: 14 };
    } else if (days < 30) {
        return { zone: 'Outer Reef (Week 2+)', creatures: '🐠 🐢 🐬', caption: `Day ${days}: Bottlenose Dolphin joined.`, min: 14, max: 30 };
    } else if (days < 90) {
        return { zone: 'Twilight Zone (Month 1+)', creatures: '🐠 🐢 🐬 🪼 🦑', caption: `Day ${days}: Jellyfish & Giant Squid unlocked.`, min: 30, max: 90 };
    } else {
        return { zone: 'Midnight Abyss (90+ Days)', creatures: '🐋 🦑 🪼 🐡', caption: `Day ${days}: Bioluminescent Abyssal Tier achieved.`, min: 90, max: 90 };
    }
}

function triggerResetPenalty() {
    playSfx('click');
    const confirmed = confirm('Confirm Relapse Reset?');
    if (!confirmed) return;

    appState.extraLives = Math.max(0, appState.extraLives - 1);
    appState.shells = 0;
    appState.startDate = new Date().toISOString().split('T')[0];
    appState.lastLoginDate = null;
    appState.inventory = ['classic'];
    appState.equippedBoard = 'classic';
    appState.tackleInventory = ['worm'];
    appState.equippedLure = 'worm';
    appState.unlockedTrophies = [];
    appState.ceilingNotes = [];

    saveState();
}

function toggleICE() {
    playSfx('click');
    document.getElementById('iceDrawer').classList.toggle('hidden');
}

function toggleVisitorMode() {
    playSfx('click');
    isVisitorMode = !isVisitorMode;
    const btn = document.getElementById('visitorToggleBtn');
    const clock = document.getElementById('clockSection');
    const sticky = document.getElementById('stickyNotesSection');
    const sos = document.getElementById('sosSection');
    const aiCoach = document.getElementById('aiCoachSection');
    const proverb = document.getElementById('proverbSection');
    const trophy = document.getElementById('trophySection');
    const breath = document.getElementById('breathSection');
    const shop = document.getElementById('shopSection');
    const journal = document.getElementById('journalSection');
    const dataVault = document.getElementById('dataSection');
    const controls = document.getElementById('controlsSection');
    const danger = document.getElementById('dangerSection');
    const title = document.getElementById('headerTitle');

    if (isVisitorMode) {
        btn.textContent = '🔓 Exit Swimming';
        clock.style.display = 'none';
        sticky.style.display = 'block';
        sos.style.display = 'none';
        aiCoach.style.display = 'none';
        proverb.style.display = 'none';
        trophy.style.display = 'none';
        breath.style.display = 'none';
        shop.style.display = 'block';
        switchLockerTab('baitshop');
        journal.style.display = 'none';
        dataVault.style.display = 'none';
        controls.style.display = 'none';
        danger.style.display = 'none';
        title.textContent = `🔍 ${appState.userName || 'C0DA'}'s Swimming Locker & Bait Shop`;
    } else {
        btn.textContent = '🏖️ Swimming';
        clock.style.display = 'block';
        sticky.style.display = 'block';
        sos.style.display = 'block';
        aiCoach.style.display = 'block';
        proverb.style.display = 'block';
        trophy.style.display = 'block';
        breath.style.display = 'block';
        shop.style.display = 'block';
        switchLockerTab('hub');
        journal.style.display = 'block';
        dataVault.style.display = 'block';
        controls.style.display = 'block';
        danger.style.display = 'block';
        title.textContent = '🌊 vorTechS WAVE';
    }
}

function renderUI() {
    const days = calculateDays();
    checkTrophies(days);
    syncBoardModeButtons();
    syncNoteFontStyle();

    document.getElementById('streakCount').textContent = days;
    document.getElementById('shellCount').textContent = appState.shells;
    document.getElementById('lifeCount').textContent = appState.extraLives;
    document.getElementById('startDateInput').value = appState.startDate;

    const userNameInput = document.getElementById('userNameInput');
    if (userNameInput && document.activeElement !== userNameInput) {
        userNameInput.value = appState.userName || 'C0DA';
    }

    const today = new Date().toDateString();
    const claimBtn = document.getElementById('dailyClaimBtn');
    if (appState.lastLoginDate === today) {
        claimBtn.disabled = true;
        claimBtn.textContent = 'Daily Check-In Claimed ✓';
    } else {
        claimBtn.disabled = false;
        claimBtn.textContent = 'Claim Daily Check-In (+3 🐚)';
    }

    const reef = getMarineReefStatus(days);
    document.getElementById('oceanZoneBadge').textContent = reef.zone;
    document.getElementById('creatureDisplay').textContent = reef.creatures;
    document.getElementById('creatureStatus').textContent = reef.caption;

    let progressPercent = 100;
    if (reef.min !== reef.max) {
        const currentSpan = days - reef.min;
        const totalSpan = reef.max - reef.min;
        progressPercent = Math.min(100, Math.max(0, Math.floor((currentSpan / totalSpan) * 100)));
    }
    document.getElementById('progressBar').style.width = progressPercent + '%';
    document.getElementById('progressPercent').textContent = progressPercent + '%';
    document.getElementById('progressTitle').textContent = reef.max === 90 ? 'Abyssal Max Tier' : `Progress to Day ${reef.max}`;

    const banner = document.getElementById('remoteCeilingBanner');
    const bannerTitle = document.getElementById('remoteCeilingTitle');
    const sectionTitle = document.getElementById('stickySectionTitle');
    if (activeRemoteProfile) {
        if (banner) banner.classList.remove('hidden');
        if (bannerTitle) bannerTitle.textContent = `${activeRemoteProfile.username} (${activeRemoteProfile.swimming})`;
        if (sectionTitle) sectionTitle.textContent = `📌 ${activeRemoteProfile.username}'s Ceiling Sticky Notes`;
    } else {
        if (banner) banner.classList.add('hidden');
        if (sectionTitle) sectionTitle.textContent = '📌 Ceiling Sticky Notes & Encouragement';
    }

    const stickyBoard = document.getElementById('stickyBoard');
    stickyBoard.innerHTML = '';
    const baseNotes = activeRemoteProfile
        ? (Array.isArray(activeRemoteProfile.ceilingNotes) ? activeRemoteProfile.ceilingNotes : [])
        : (Array.isArray(appState.ceilingNotes) ? appState.ceilingNotes : []);

    let notes = [...baseNotes];
    if (appState.boardMode === 'shuffle' && shuffleOrderIds.length > 0) {
        const rankMap = new Map(shuffleOrderIds.map((id, idx) => [id, idx]));
        notes.sort((a, b) => (rankMap.get(a.id) ?? 999999) - (rankMap.get(b.id) ?? 999999));
    }

    const searchQuery = (document.getElementById('stickySearchInput')?.value || '').toLowerCase();
    const filteredNotes = notes.filter(note => (note.text || '').toLowerCase().includes(searchQuery));

    if (filteredNotes.length === 0) {
        stickyBoard.innerHTML = `<div style="font-size: 0.8rem; color: var(--text-muted); text-align: center; position: absolute; width: 100%; top: 50%; transform: translateY(-50%);">${baseNotes.length === 0 ? 'No ceiling notes pinned yet.' : 'No matching notes found.'}</div>`;
    } else {
        filteredNotes.forEach((note, index) => {
            const noteDiv = document.createElement('div');
            noteDiv.className = 'sticky-note';

            if (appState.boardMode !== 'shuffle') {
                if (typeof note.x !== 'number') note.x = 10 + (index * 20) % 200;
                if (typeof note.y !== 'number') note.y = 10 + (index * 30) % 150;
                noteDiv.style.left = note.x + 'px';
                noteDiv.style.top = note.y + 'px';
            }

            const bgColor = note.color || '#ffd166';
            noteDiv.style.backgroundColor = bgColor;
            noteDiv.style.color = '#0b132b';

            let mediaHtml = note.media ? `<img src="${note.media}" class="sticky-img" alt="Attached photo">` : '';
            let authorHtml = note.author ? `<div style="font-size: 0.7rem; font-weight: bold; margin-top: 4px; opacity: 0.85;">— ${note.author}</div>` : '';
            noteDiv.innerHTML = `
                <div>
                    <div class="sticky-header">
                        <span>${note.emoji || '🌟'}</span>
                        <button class="sticky-delete" onclick="event.stopPropagation(); deleteStickyNote(${note.id})" title="Remove Note">🗑️</button>
                    </div>
                    <div style="font-size: 0.82rem; margin-top: 4px; white-space: pre-line;">${note.text}</div>
                    ${mediaHtml}
                    ${authorHtml}
                </div>
                <div style="font-size: 0.65rem; opacity: 0.6; margin-top: 6px; text-align: right;">${note.timestamp}</div>
            `;

            initDraggableNote(noteDiv, note);
            stickyBoard.appendChild(noteDiv);
        });
    }

    const renderTrophyListInto = (containerId) => {
        const grid = document.getElementById(containerId);
        if (!grid) return;
        grid.innerHTML = '';
        TROPHIES.forEach(t => {
            let unlocked = appState.unlockedTrophies.includes(t.id);
            if (!unlocked) {
                if (t.req && days >= t.req) unlocked = true;
                if (t.reqShells && appState.shells >= t.reqShells) unlocked = true;
            }

            const div = document.createElement('div');
            div.className = `trophy-item ${unlocked ? 'unlocked' : ''}`;
            div.innerHTML = `
                <div class="trophy-icon">${t.icon}</div>
                <div class="trophy-info">
                    <div class="trophy-title">${t.name}</div>
                    <div class="trophy-desc">${t.desc}</div>
                </div>
            `;
            grid.appendChild(div);
        });
    };
    renderTrophyListInto('trophyGrid');
    renderTrophyListInto('lockerTrophyGrid');

    const aquariumContainer = document.getElementById('aquariumCreaturesList');
    if (aquariumContainer) {
        aquariumContainer.innerHTML = '';
        ALL_CREATURES_MILESTONES.forEach(c => {
            const unlocked = days >= c.day;
            const div = document.createElement('div');
            div.style.cssText = `padding: 10px; background: rgba(0,0,0,0.25); border-radius: 8px; text-align: center; border: 1px solid ${unlocked ? 'var(--accent, #00f5d4)' : 'rgba(255,255,255,0.1)'}; opacity: ${unlocked ? '1' : '0.5'};`;
            div.innerHTML = `
                <div style="font-size: 1.8rem; margin-bottom: 4px;">${unlocked ? c.icon : '🔒'}</div>
                <div style="font-size: 0.8rem; font-weight: bold;">${c.name}</div>
                <div style="font-size: 0.7rem; opacity: 0.7;">Day ${c.day}+ (${c.zone})</div>
            `;
            aquariumContainer.appendChild(div);
        });
    }

    const equipped = SURFBOARDS.find(b => b.id === appState.equippedBoard) || SURFBOARDS[0];
    const equippedDisplay = document.getElementById('equippedBoardDisplay');
    if (equippedDisplay) equippedDisplay.textContent = equipped.icon;

    const equippedLure = TACKLE_LURES.find(l => l.id === appState.equippedLure) || TACKLE_LURES[0];
    const equippedLureDisplay = document.getElementById('equippedLureDisplay');
    if (equippedLureDisplay) {
        equippedLureDisplay.textContent = equippedLure.icon;
        equippedLureDisplay.title = `Equipped Lure: ${equippedLure.name}`;
    }

    const shopGrid = document.getElementById('shopGrid');
    if (shopGrid) {
        shopGrid.innerHTML = '';
        SURFBOARDS.forEach(board => {
            const owned = appState.inventory.includes(board.id);
            const div = document.createElement('div');
            div.className = 'shop-item';
            div.innerHTML = `
                <div class="shop-item-icon">${board.icon}</div>
                <div class="shop-item-title">${board.name}</div>
                <div class="shop-item-cost">${board.cost === 0 ? 'Free' : board.cost + ' 🐚'}</div>
                <button ${owned ? 'disabled' : ''} onclick="buySurfboard('${board.id}')">
                    ${owned ? 'Owned ✓' : 'Buy & Equip'}
                </button>
            `;
            shopGrid.appendChild(div);
        });
    }

    const tackleShopGrid = document.getElementById('tackleShopGrid');
    if (tackleShopGrid) {
        tackleShopGrid.innerHTML = '';
        TACKLE_LURES.forEach(lure => {
            const owned = appState.tackleInventory.includes(lure.id);
            const div = document.createElement('div');
            div.className = 'shop-item';
            div.innerHTML = `
                <div class="shop-item-icon">${lure.icon}</div>
                <div class="shop-item-title">${lure.name}</div>
                <div class="shop-item-cost">${lure.cost === 0 ? 'Free' : lure.cost + ' 🐚'}</div>
                <button ${owned ? 'disabled' : ''} onclick="buyTackle('${lure.id}')">
                    ${owned ? 'Owned ✓' : 'Buy & Equip'}
                </button>
            `;
            tackleShopGrid.appendChild(div);
        });
    }

    const tackleShowcaseBox = document.getElementById('tackleShowcaseBox');
    if (tackleShowcaseBox) {
        tackleShowcaseBox.innerHTML = '';
        appState.tackleInventory.forEach(id => {
            const lure = TACKLE_LURES.find(l => l.id === id);
            if (!lure) return;
            const isEquipped = appState.equippedLure === id;
            const token = document.createElement('div');
            token.className = `locker-token ${isEquipped ? 'equipped' : ''}`;
            token.innerHTML = `${lure.icon} ${lure.name} ${isEquipped ? '★ (Displayed)' : ''}`;
            token.onclick = () => equipLure(id);
            tackleShowcaseBox.appendChild(token);
        });
    }

    const lockerBox = document.getElementById('lockerInventory');
    if (lockerBox) {
        lockerBox.innerHTML = '';
        appState.inventory.forEach(id => {
            const board = SURFBOARDS.find(b => b.id === id);
            const isEquipped = appState.equippedBoard === id;
            const token = document.createElement('div');
            token.className = `locker-token ${isEquipped ? 'equipped' : ''}`;
            token.innerHTML = `${board.icon} ${board.name} ${isEquipped ? '(Active)' : ''}`;
            token.onclick = () => equipBoard(id);
            lockerBox.appendChild(token);
        });
    }

    const historyBox = document.getElementById('journalHistory');
    if (historyBox) {
        historyBox.innerHTML = '';
        const entries = Array.isArray(appState.journals) ? appState.journals : [];

        let cCalm = 0, cChoppy = 0, cRadiant = 0, cDeep = 0;

        entries.forEach(entry => {
            const mood = entry.mood || '🌊 Calm';
            if (mood.includes('Calm')) cCalm++;
            else if (mood.includes('Choppy')) cChoppy++;
            else if (mood.includes('Radiant')) cRadiant++;
            else if (mood.includes('Deep')) cDeep++;
        });

        document.getElementById('countCalm').textContent = cCalm;
        document.getElementById('countChoppy').textContent = cChoppy;
        document.getElementById('countRadiant').textContent = cRadiant;
        document.getElementById('countDeep').textContent = cDeep;

        const displayedEntries = activeJournalFilter === 'all'
            ? entries
            : entries.filter(e => (e.tag || '✨ Reflect') === activeJournalFilter);

        if (displayedEntries.length === 0) {
            historyBox.innerHTML = '<div class="journal-entry">No journal entries found for this view.</div>';
        } else {
            displayedEntries.forEach(entry => {
                const mood = entry.mood || '🌊 Calm';
                const tag = entry.tag || '✨ Reflect';

                const entryDiv = document.createElement('div');
                entryDiv.className = 'journal-entry';
                entryDiv.innerHTML = `
                    <div class="journal-content">
                        <div class="journal-meta">
                            <span class="journal-time">${entry.timestamp}</span>
                            <span>[${mood}]</span>
                            <span class="journal-tag-badge">${tag}</span>
                        </div>
                        <div>${entry.text}</div>
                    </div>
                    <button class="journal-delete-btn" onclick="deleteJournalEntry(${entry.id})" title="Delete Entry">🗑️</button>
                `;
                historyBox.appendChild(entryDiv);
            });
        }
    }
}

let breathActive = false;
let breathInterval = null;

function toggleBreathwork() {
    playSfx('click');
    const btn = document.getElementById('breathToggleBtn');
    const orb = document.getElementById('breathOrb');
    const label = document.getElementById('breathLabel');

    if (!breathActive) {
        breathActive = true;
        btn.textContent = 'Stop Tidal Pacer';
        if (breathInterval) clearInterval(breathInterval);

        let totalSeconds = 0;

        function tickBreath() {
            if (!breathActive) return;

            let phaseName = '';
            let rem = 0;

            if (totalSeconds < 4) {
                phaseName = 'Inhale';
                rem = 4 - totalSeconds;
                orb.style.transition = 'transform 1s linear';
                orb.style.transform = `scale(${1 + (totalSeconds + 1) * 0.1375})`;
            } else if (totalSeconds < 11) {
                phaseName = 'Hold';
                rem = 11 - totalSeconds;
                orb.style.transition = 'none';
                orb.style.transform = 'scale(1.55)';
            } else {
                phaseName = 'Exhale';
                rem = 19 - totalSeconds;
                orb.style.transition = 'transform 1s linear';
                orb.style.transform = `scale(${1.55 - (totalSeconds - 10) * 0.06875})`;
            }

            label.textContent = `${phaseName}: ${rem}s`;
            totalSeconds = (totalSeconds + 1) % 19;
        }

        tickBreath();
        breathInterval = setInterval(tickBreath, 1000);

    } else {
        breathActive = false;
        if (breathInterval) clearInterval(breathInterval);
        breathInterval = null;
        orb.style.transition = 'transform 0.5s ease';
        orb.style.transform = 'scale(1)';
        label.textContent = 'Ready';
        btn.textContent = 'Start Tidal Pacer';
    }
}

let audioCtx = null;
let noiseNode = null;
let filterNode = null;
let gainNode = null;
let isAudioPlaying = false;

function toggleAudio() {
    playSfx('click');
    const btn = document.getElementById('audioToggleBtn');
    const sliderVal = document.getElementById('audioVolumeSlider').value;
    if (!isAudioPlaying) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const bufferSize = audioCtx.sampleRate * 2;
        const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            output[i] = Math.random() * 2 - 1;
        }
        noiseNode = audioCtx.createBufferSource();
        noiseNode.buffer = noiseBuffer;
        noiseNode.loop = true;
        filterNode = audioCtx.createBiquadFilter();
        filterNode.type = 'lowpass';
        filterNode.frequency.setValueAtTime(300, audioCtx.currentTime);
        gainNode = audioCtx.createGain();
        gainNode.gain.setValueAtTime(parseFloat(sliderVal), audioCtx.currentTime);
        noiseNode.connect(filterNode);
        filterNode.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        noiseNode.start();
        isAudioPlaying = true;
        btn.textContent = '🔊 Audio: On';
    } else {
        if (audioCtx) audioCtx.close();
        isAudioPlaying = false;
        btn.textContent = '🔊 Audio: Off';
    }
}

function updateVolume(val) {
    if (gainNode && audioCtx) {
        gainNode.gain.setValueAtTime(parseFloat(val), audioCtx.currentTime);
    }
}

updateCeilingEnvironment();
updateClocks();
setInterval(updateCeilingEnvironment, 60000);
setInterval(updateClocks, 1000);
renderUI();
