// ===== ÉLÉMENTS DU DOM =====
const $ = (id) => document.getElementById(id);

const screens = {
    title: $('title-screen'),
    game: $('game-screen'),
    gameover: $('gameover-screen'),
    victory: $('victory-screen')
};

const elements = {
    apiKey: $('api-key'),
    startBtn: $('start-btn'),
    restartBtn: $('restart-btn'),
    narrativeText: $('narrative-text'),
    choicesContainer: $('choices-container'),
    loading: $('loading-indicator'),
    chapterTitle: $('chapter-title'),
    gameoverText: $('gameover-text'),
    particles: $('particles'),
    statHealth: $('stat-health').querySelector('span'),
    statSanity: $('stat-sanity').querySelector('span'),
    statGold: $('stat-gold').querySelector('span'),
    muteBtn: $('mute-btn'),
    provider: $('provider'),
    apiLink: $('api-link'),
    backBtn: $('back-btn'),
    continueBtn: $('continue-btn'),
    titleSeparator: $('title-separator'),
    modalOverlay: $('modal-overlay'),
    modalSaveQuit: $('modal-save-quit'),
    modalReset: $('modal-reset'),
    modalCancel: $('modal-cancel'),
    victoryTitle: $('victory-title'),
    victoryText: $('victory-text'),
    finalHealth: $('final-health'),
    finalSanity: $('final-sanity'),
    finalGold: $('final-gold'),
    finalTurns: $('final-turns'),
    newgameBtn: $('newgame-btn')
};

// ===== ÉTAT DU JEU =====
const state = {
    apiKey: '',
    provider: 'groq', // 'groq' ou 'gemini'
    history: [],       // Historique de conversation (format unifié)
    chapter: 1,
    turn: 0,           // Compteur de tours (choix faits par le joueur)
    stats: { health: 100, sanity: 100, gold: 0 }
};

// URLs des providers
const PROVIDERS = {
    groq: {
        url: 'https://api.groq.com/openai/v1/chat/completions',
        model: 'llama-3.3-70b-versatile',
        link: 'https://console.groq.com/keys'
    },
    gemini: {
        url: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
        model: 'gemini-2.0-flash',
        link: 'https://aistudio.google.com/apikey'
    }
};

// ===== SYSTEM PROMPT =====
// Le prompt est maintenant dans i18n.js (clé "system_prompt")
// pour supporter le français et l'anglais.

// ===== PARTICULES DE L'ÉCRAN TITRE =====
// Crée 30 petits points dorés qui flottent vers le haut avec des positions
// et délais aléatoires pour un effet mystique.
function createParticles() {
    for (let i = 0; i < 50; i++) {
        const particle = document.createElement('div');
        particle.classList.add('particle');
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = 40 + Math.random() * 60 + '%';
        particle.style.animationDelay = Math.random() * 8 + 's';
        particle.style.animationDuration = 6 + Math.random() * 6 + 's';
        elements.particles.appendChild(particle);
    }
}

// ===== AFFICHER/CACHER LE BOUTON CONTINUER =====
function showContinueBtn(visible) {
    elements.continueBtn.classList.toggle('hidden', !visible);
    elements.titleSeparator.classList.toggle('hidden', !visible);
}

// ===== NAVIGATION ENTRE ÉCRANS =====
// Cache tous les écrans, puis affiche celui demandé avec la classe "active".
function showScreen(name) {
    Object.values(screens).forEach(s => s.classList.remove('active'));
    screens[name].classList.add('active');
}

// ===== MISE À JOUR DES STATS =====
// Applique les changements de stats, clamp entre 0 et 100 (sauf l'or),
// et ajoute la classe "danger" si une stat est basse.
function updateStats(changes) {
    if (!changes) return;

    state.stats.health = Math.max(0, Math.min(100, state.stats.health + (changes.health || 0)));
    state.stats.sanity = Math.max(0, Math.min(100, state.stats.sanity + (changes.sanity || 0)));
    state.stats.gold = Math.max(0, state.stats.gold + (changes.gold || 0));

    elements.statHealth.textContent = state.stats.health;
    elements.statSanity.textContent = state.stats.sanity;
    elements.statGold.textContent = state.stats.gold;

    // Ajouter la classe "danger" si une stat est critique (< 30)
    $('stat-health').classList.toggle('danger', state.stats.health < 30);
    $('stat-sanity').classList.toggle('danger', state.stats.sanity < 30);
}

// ===== AFFICHAGE DU TEXTE NARRATIF =====
// Convertit le texte brut en paragraphes HTML et relance l'animation CSS.
function displayNarrative(text) {
    const paragraphs = text.split('\n\n').filter(p => p.trim());
    elements.narrativeText.innerHTML = paragraphs
        .map(p => `<p>${p.trim()}</p>`)
        .join('');

    // Relancer l'animation fadeIn en retirant/rajoutant l'élément du DOM
    elements.narrativeText.style.animation = 'none';
    elements.narrativeText.offsetHeight; // Force reflow
    elements.narrativeText.style.animation = '';
}

// ===== AFFICHAGE DES CHOIX =====
// Crée dynamiquement les boutons de choix avec un numéro et le texte.
// Chaque bouton envoie le choix à Gemini quand on clique.
function displayChoices(choices) {
    elements.choicesContainer.innerHTML = '';

    choices.forEach((choice, index) => {
        const btn = document.createElement('button');
        btn.classList.add('choice-btn');
        btn.innerHTML = `<span class="choice-number">${index + 1}.</span>${choice}`;
        btn.addEventListener('click', () => makeChoice(choice));
        elements.choicesContainer.appendChild(btn);
    });

    elements.choicesContainer.classList.remove('hidden');
}

// ===== APPEL API (Groq ou Gemini) =====
// Envoie l'historique de conversation au provider choisi et récupère la réponse.
// On injecte les stats actuelles dans le system prompt à chaque appel.
// Calcule le chapitre attendu en fonction du tour
function getExpectedChapter(turn) {
    if (currentLang === 'en') {
        if (turn <= 3) return 'I — The Awakening';
        if (turn <= 7) return 'II — The Quest';
        if (turn <= 11) return 'III — The Trial';
        if (turn <= 15) return 'IV — The Sanctuary';
        return 'V — The Reckoning (CONCLUDE THE STORY)';
    }
    if (turn <= 3) return 'I — Le Réveil';
    if (turn <= 7) return 'II — La Quête';
    if (turn <= 11) return 'III — L\'Épreuve';
    if (turn <= 15) return 'IV — Le Sanctuaire';
    return 'V — Le Dénouement (CONCLUS L\'HISTOIRE)';
}

async function callAI(userMessage) {
    // Incrémenter le tour à chaque choix du joueur
    if (userMessage) {
        state.turn++;
    }

    const systemPrompt = t('system_prompt')
        .replace('{turn}', state.turn)
        .replace('{expected_chapter}', getExpectedChapter(state.turn))
        .replace('{health}', state.stats.health)
        .replace('{sanity}', state.stats.sanity)
        .replace('{gold}', state.stats.gold);

    // Message initial si c'est le début de la partie
    if (userMessage) {
        state.history.push({ role: 'user', content: userMessage });
    } else if (state.history.length === 0) {
        state.history.push({ role: 'user', content: t('first_message') });
    }

    if (state.provider === 'groq') {
        return await _callGroq(systemPrompt);
    } else {
        return await _callGemini(systemPrompt);
    }
}

// ===== NETTOYAGE JSON =====
// Les LLM renvoient souvent du JSON avec des caractères de contrôle
// (retours à la ligne bruts, tabulations) à l'intérieur des strings,
// ce qui fait planter JSON.parse(). On les remplace par des séquences
// d'échappement valides avant de parser.
function cleanAndParseJSON(raw) {
    // Retirer les backticks markdown
    let text = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    // Nettoyer les caractères de contrôle à l'intérieur des strings JSON :
    // On parcourt caractère par caractère pour ne remplacer que ceux
    // qui sont dans des valeurs de string (entre guillemets).
    let result = '';
    let inString = false;
    let escaped = false;

    for (let i = 0; i < text.length; i++) {
        const ch = text[i];

        if (escaped) {
            result += ch;
            escaped = false;
            continue;
        }

        if (ch === '\\' && inString) {
            result += ch;
            escaped = true;
            continue;
        }

        if (ch === '"') {
            inString = !inString;
            result += ch;
            continue;
        }

        if (inString) {
            // Remplacer les caractères de contrôle problématiques
            if (ch === '\n') { result += '\\n'; continue; }
            if (ch === '\r') { result += ''; continue; }
            if (ch === '\t') { result += '\\t'; continue; }
            // Autres caractères de contrôle (0x00-0x1F)
            if (ch.charCodeAt(0) < 32) { result += ' '; continue; }
        }

        result += ch;
    }

    return JSON.parse(result);
}

// ===== GROQ (format OpenAI) =====
async function _callGroq(systemPrompt) {
    const provider = PROVIDERS.groq;

    const messages = [
        { role: 'system', content: systemPrompt },
        ...state.history
    ];

    const response = await fetch(provider.url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${state.apiKey}`
        },
        body: JSON.stringify({
            model: provider.model,
            messages,
            temperature: 0.9,
            max_tokens: 1024
        })
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Erreur API Groq');
    }

    const data = await response.json();
    const rawText = data.choices[0].message.content;
    const parsed = cleanAndParseJSON(rawText);

    state.history.push({ role: 'assistant', content: rawText });
    return parsed;
}

// ===== GEMINI (format Google) =====
async function _callGemini(systemPrompt) {
    const provider = PROVIDERS.gemini;

    // Convertir l'historique unifié au format Gemini
    const geminiHistory = state.history.map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
    }));

    const requestBody = {
        system_instruction: { parts: [{ text: systemPrompt }] },
        contents: geminiHistory,
        generationConfig: { temperature: 0.9, maxOutputTokens: 1024 }
    };

    const response = await fetch(`${provider.url}?key=${state.apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Erreur API Gemini');
    }

    const data = await response.json();
    const rawText = data.candidates[0].content.parts[0].text;
    const parsed = cleanAndParseJSON(rawText);

    state.history.push({ role: 'assistant', content: rawText });
    return parsed;
}

// ===== TRAITEMENT D'UNE RÉPONSE DE L'IA =====
// Fonction centrale qui prend la réponse JSON de Gemini et met à jour
// l'interface : narration, stats, chapitre, choix ou game over.
function handleResponse(response) {
    // Mettre à jour le titre du chapitre
    if (response.chapter_title) {
        elements.chapterTitle.textContent = response.chapter_title;
    }

    // Appliquer les changements de stats
    updateStats(response.stats_change);

    // Afficher la narration
    displayNarrative(response.narrative);

    // Vérifier si le joueur est mort
    if (response.is_death || state.stats.health <= 0 || state.stats.sanity <= 0) {
        window.audioEngine.playDeathSound();
        setTimeout(() => {
            elements.gameoverText.textContent = response.narrative.split('\n\n').pop();
            showScreen('gameover');
            pushState('gameover');
            clearSave();
        }, 2000);
        return;
    }

    // Vérifier si c'est la victoire (fin de l'histoire)
    if (response.is_victory) {
        setTimeout(() => {
            // Déterminer le titre de la fin selon les stats
            let endTitle = 'Fin de l\'Aventure';
            if (state.stats.sanity < 30) {
                endTitle = t('end_corrupt');
            } else if (state.stats.health < 30 && state.stats.sanity >= 50) {
                endTitle = t('end_sacrifice');
            } else if (state.stats.health >= 50 && state.stats.sanity >= 50) {
                endTitle = t('end_heroic');
            } else {
                endTitle = t('end_tragic');
            }

            elements.victoryTitle.textContent = endTitle;
            elements.victoryText.textContent = response.narrative.split('\n\n').pop();
            elements.finalHealth.textContent = state.stats.health;
            elements.finalSanity.textContent = state.stats.sanity;
            elements.finalGold.textContent = state.stats.gold;
            elements.finalTurns.textContent = state.turn;

            showScreen('victory');
            pushState('victory');
            clearSave();
        }, 3000);
        return;
    }

    // Afficher les choix
    if (response.choices && response.choices.length > 0) {
        displayChoices(response.choices);
    }

    // Sauvegarder après chaque réponse de l'IA
    saveGame();
}

// ===== FAIRE UN CHOIX =====
// Quand le joueur clique sur un choix, on cache les boutons,
// on affiche le loading, on envoie le choix à Gemini,
// et on traite la réponse.
async function makeChoice(choice) {
    window.audioEngine.playChoiceSound();
    elements.choicesContainer.classList.add('hidden');
    elements.loading.classList.remove('hidden');

    try {
        const response = await callAI(`${t('choice_prefix')} : "${choice}"`);
        elements.loading.classList.add('hidden');
        handleResponse(response);
    } catch (error) {
        elements.loading.classList.add('hidden');
        elements.narrativeText.innerHTML = `
            <p style="color: #8b1a1a;">${t('error_shadows')}</p>
            <p style="color: #7a7568;">${t('error_prefix')} : ${error.message}</p>
            <p style="color: #7a7568;">${t('error_check_api')}</p>
        `;
    }
}

// ===== DÉMARRER UNE NOUVELLE PARTIE =====
async function startGame() {
    const apiKey = elements.apiKey.value.trim();
    if (!apiKey) {
        elements.apiKey.style.borderColor = '#8b1a1a';
        elements.apiKey.placeholder = t('api_required');
        return;
    }

    state.apiKey = apiKey;
    state.provider = elements.provider.value;
    state.history = [];
    state.chapter = 1;
    state.turn = 0;
    state.stats = { health: 100, sanity: 100, gold: 0 };
    updateStats({ health: 0, sanity: 0, gold: 0 });

    showScreen('game');
    pushState('game'); // Ajoute un état pour intercepter le bouton retour
    window.audioEngine.start();
    elements.choicesContainer.classList.add('hidden');
    elements.loading.classList.remove('hidden');
    elements.narrativeText.innerHTML = '';

    try {
        const response = await callAI(null);
        elements.loading.classList.add('hidden');
        handleResponse(response);
    } catch (error) {
        elements.loading.classList.add('hidden');
        elements.narrativeText.innerHTML = `
            <p style="color: #8b1a1a;">${t('error_invoke')}</p>
            <p style="color: #7a7568;">${t('error_prefix')} : ${error.message}</p>
        `;
    }
}

// ===== MODALE DE CONFIRMATION =====

function showModal() {
    elements.modalOverlay.classList.remove('hidden');
}

function hideModal() {
    elements.modalOverlay.classList.add('hidden');
}

// "Sauvegarder et quitter" → sauvegarde, retour au titre, bouton Continuer visible
elements.modalSaveQuit.addEventListener('click', () => {
    saveGame();
    hideModal();
    showScreen('title');
    pushState('title');
    showContinueBtn(true);
});

// "Recommencer" → efface la sauvegarde, retour au titre
elements.modalReset.addEventListener('click', () => {
    clearSave();
    state.history = [];
    hideModal();
    showScreen('title');
    pushState('title');
    showContinueBtn(false);
});

// "Continuer l'aventure" → ferme la modale, le joueur reste en jeu
elements.modalCancel.addEventListener('click', () => {
    hideModal();
});

// Fermer la modale en cliquant en dehors
elements.modalOverlay.addEventListener('click', (e) => {
    if (e.target === elements.modalOverlay) hideModal();
});

// ===== EVENT LISTENERS =====
elements.startBtn.addEventListener('click', startGame);

// Bouton "Reprendre la Partie" sur l'écran titre
elements.continueBtn.addEventListener('click', () => {
    const loaded = loadGame();
    if (loaded) {
        window.audioEngine.start();
    }
});

// Bouton retour (←) dans le header du jeu → ouvre la modale
elements.backBtn.addEventListener('click', showModal);

// Bouton "Nouvelle Aventure" sur l'écran victoire
elements.newgameBtn.addEventListener('click', () => {
    clearSave();
    state.history = [];
    showScreen('title');
    pushState('title');
    showContinueBtn(false);
});

// Game over : "Renaître des Cendres" → efface et retour au titre
elements.restartBtn.addEventListener('click', () => {
    clearSave();
    state.history = [];
    showScreen('title');
    pushState('title');
    showContinueBtn(false);
});

// Bouton mute/unmute
elements.muteBtn.addEventListener('click', () => {
    const muted = window.audioEngine.toggleMute();
    elements.muteBtn.textContent = muted ? '♪' : '♫';
    elements.muteBtn.classList.toggle('muted', muted);
});

// Permettre de lancer le jeu avec Entrée dans le champ API
elements.apiKey.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') startGame();
});

// Changer le lien selon le provider sélectionné
elements.provider.addEventListener('change', () => {
    const provider = PROVIDERS[elements.provider.value];
    elements.apiLink.href = provider.link;
});

// ===== SAUVEGARDE AUTOMATIQUE (localStorage) =====
// Sauvegarde l'état complet du jeu à chaque action.
// Au rechargement ou retour sur la page, la partie reprend exactement
// là où le joueur s'était arrêté.

const SAVE_KEY = 'chroniques-save';

function saveGame() {
    // Ne sauvegarde que si une partie est en cours
    if (state.history.length === 0) return;

    const saveData = {
        apiKey: state.apiKey,
        provider: state.provider,
        history: state.history,
        chapter: state.chapter,
        turn: state.turn,
        lang: currentLang,
        stats: { ...state.stats },
        chapterTitle: elements.chapterTitle.textContent,
        narrativeHTML: elements.narrativeText.innerHTML,
        // Sauvegarder les textes des choix pour les recréer
        choices: Array.from(elements.choicesContainer.querySelectorAll('.choice-btn'))
            .map(btn => btn.textContent.replace(/^\d+\./, '').trim()),
        currentScreen: screens.game.classList.contains('active') ? 'game'
            : screens.gameover.classList.contains('active') ? 'gameover'
            : 'title',
        timestamp: Date.now()
    };

    localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
}

function loadGame() {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return false;

    try {
        const saveData = JSON.parse(raw);

        // Vérifier que la sauvegarde n'est pas trop vieille (7 jours max)
        if (Date.now() - saveData.timestamp > 7 * 24 * 60 * 60 * 1000) {
            localStorage.removeItem(SAVE_KEY);
            return false;
        }

        // Restaurer l'état
        state.apiKey = saveData.apiKey;
        state.provider = saveData.provider;
        state.history = saveData.history;
        state.chapter = saveData.chapter;
        state.turn = saveData.turn || 0;
        state.stats = saveData.stats;

        // Restaurer l'interface
        elements.chapterTitle.textContent = saveData.chapterTitle;
        elements.narrativeText.innerHTML = saveData.narrativeHTML;
        updateStats({ health: 0, sanity: 0, gold: 0 }); // Rafraîchit l'affichage des stats

        // Restaurer le provider, la clé et la langue
        elements.provider.value = state.provider;
        elements.apiKey.value = state.apiKey;
        if (saveData.lang) setLanguage(saveData.lang);

        // Restaurer les choix
        if (saveData.choices && saveData.choices.length > 0 && saveData.currentScreen === 'game') {
            displayChoices(saveData.choices);
        }

        // Restaurer l'écran
        if (saveData.currentScreen === 'game' || saveData.currentScreen === 'gameover') {
            showScreen(saveData.currentScreen);
            pushState(saveData.currentScreen);

            if (saveData.currentScreen === 'gameover') {
                const lastParagraph = saveData.narrativeHTML.match(/<p>([^<]*)<\/p>\s*$/);
                if (lastParagraph) {
                    elements.gameoverText.textContent = lastParagraph[1];
                }
            }
        }

        return true;
    } catch (e) {
        localStorage.removeItem(SAVE_KEY);
        return false;
    }
}

function clearSave() {
    localStorage.removeItem(SAVE_KEY);
}

function pushState(screenName) {
    history.pushState({ screen: screenName }, '', '');
}

// ===== INTERCEPTION DU BOUTON RETOUR DU NAVIGATEUR =====
// Si le joueur appuie sur retour pendant le jeu → ouvre la modale au lieu de quitter
window.addEventListener('popstate', (e) => {
    if (screens.game.classList.contains('active')) {
        showModal();
        pushState('game'); // Re-push pour que le prochain retour ne quitte pas
    } else if (screens.gameover.classList.contains('active')) {
        showScreen('title');
    }
});

// ===== BOUTONS DE LANGUE =====
$('lang-fr').addEventListener('click', () => setLanguage('fr'));
$('lang-en').addEventListener('click', () => setLanguage('en'));

// ===== INITIALISATION =====
history.replaceState({ screen: 'title' }, '', '');
createParticles();

// S'il y a une sauvegarde, afficher le bouton "Reprendre"
if (localStorage.getItem(SAVE_KEY)) {
    showContinueBtn(true);
}
