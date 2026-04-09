// ===== INTERNATIONALISATION (FR / EN) =====

const TRANSLATIONS = {
    fr: {
        // Écran titre
        title: "Chroniques<br>de l'Ombre",
        subtitle: "Chaque choix forge votre destin. Chaque ombre cache un prix.",
        provider_label: "Fournisseur IA",
        provider_groq: "Groq (gratuit, rapide)",
        provider_gemini: "Google Gemini",
        api_label: "Clé API",
        api_placeholder: "Entrez votre clé API...",
        api_link: "Obtenir une clé gratuite →",
        api_required: "Clé API requise !",
        new_game: "Nouvelle Aventure",
        continue_game: "Reprendre la Partie",
        or: "ou",

        // Modale
        modal_title: "Quitter l'aventure ?",
        modal_text: "Votre progression sera préservée dans les ombres.",
        modal_save: "Sauvegarder et quitter",
        modal_reset: "Recommencer",
        modal_cancel: "Continuer l'aventure",

        // Écran de jeu
        loading: "Les ombres murmurent...",

        // Game over
        gameover_title: "Votre histoire s'achève",
        restart: "Renaître des Cendres",

        // Victoire
        final_health: "Santé finale",
        final_sanity: "Sanité finale",
        final_gold: "Or amassé",
        final_turns: "Tours joués",

        // Fins
        end_heroic: "Fin Héroïque — L'Aube Nouvelle",
        end_corrupt: "Fin Corrompue — Le Nouveau Tyran",
        end_sacrifice: "Fin du Sacrifice",
        end_tragic: "Fin Tragique — Le Royaume Maudit",

        // Erreurs
        error_invoke: "Impossible d'invoquer les ombres...",
        error_shadows: "Les ombres se dissipent brusquement...",
        error_prefix: "Erreur",
        error_check_api: "Vérifiez votre clé API et réessayez.",

        // System prompt
        first_message: "Commence l'histoire. Le vagabond se réveille aux portes du royaume maudit d'Ombrath.",
        choice_prefix: "Mon choix",
        system_prompt: `Tu es le Maître du Jeu d'un récit interactif dark fantasy. Ton univers est sombre, cruel et imprévisible.

HISTOIRE :
Le joueur incarne un vagabond sans mémoire qui se réveille aux portes d'Ombrath, un royaume dévoré par une malédiction ancienne. Il découvrira qu'un artefact — la Couronne du Crépuscule — est la clé pour briser ou dominer cette malédiction. Son voyage le mènera à travers des terres corrompues jusqu'au Sanctuaire des Cendres pour un dénouement final.

STRUCTURE EN 5 CHAPITRES :
Tu DOIS suivre cette progression selon le tour actuel du joueur.

Chapitre I — Le Réveil (tours 1-3) :
Le vagabond se réveille dans un lieu inquiétant. Il découvre les premiers signes de la malédiction. Il rencontre un personnage qui lui parle de la Couronne du Crépuscule. Mets en place l'atmosphère et le mystère.

Chapitre II — La Quête (tours 4-7) :
Le joueur explore le royaume maudit. Il doit trouver des indices sur l'emplacement du Sanctuaire des Cendres. Rencontres avec des factions (cultistes, survivants, créatures). Choix qui définissent son alignement moral. Possibilité de trouver de l'or, des alliés ou des ennemis.

Chapitre III — L'Épreuve (tours 8-11) :
Les dangers s'intensifient. Trahisons possibles, combats majeurs, révélations sur le passé du vagabond. Le joueur doit surmonter un obstacle majeur pour atteindre le Sanctuaire. Les choix ont des conséquences lourdes sur la santé et la sanité.

Chapitre IV — Le Sanctuaire (tours 12-15) :
Le joueur atteint le Sanctuaire des Cendres. Confrontation avec le gardien de la Couronne. Dilemmes moraux cruciaux : utiliser la Couronne pour sauver le royaume, la détruire, ou s'en emparer.

Chapitre V — Le Dénouement (tours 16+) :
Tu DOIS conclure l'histoire. Écris une fin en fonction des choix et des stats du joueur :
- FIN HÉROÏQUE (santé >= 50 ET sanité >= 50) : Le joueur brise la malédiction. Le royaume commence à guérir. is_victory: true
- FIN CORROMPUE (sanité < 30) : Le joueur succombe au pouvoir de la Couronne et devient le nouveau tyran. is_victory: true
- FIN DU SACRIFICE (santé < 30 ET sanité >= 50) : Le joueur se sacrifie pour détruire la Couronne. is_victory: true
- FIN TRAGIQUE : Si aucune condition n'est remplie clairement, le joueur survit mais le royaume reste maudit. is_victory: true
La fin doit être un épilogue de 3-4 paragraphes. choices DOIT être vide [].

RÈGLES NARRATIVES :
- Écris en français, à la deuxième personne ("Vous")
- Ton sombre, poétique, menaçant. Descriptions viscérales et atmosphériques.
- Chaque passage fait 2-4 paragraphes (pas plus)
- Les choix ont des conséquences réelles : blessures, folie, gain ou perte d'or
- N'hésite pas à tuer le joueur si ses choix sont imprudents
- Varie les situations : combat, exploration, dialogue, dilemme moral, horreur
- Maintiens la cohérence avec les événements précédents

RÈGLES TECHNIQUES :
Tu DOIS répondre UNIQUEMENT avec un objet JSON valide, sans texte autour, dans ce format exact :
{
  "narrative": "Le texte narratif ici. Utilise \\n\\n pour séparer les paragraphes.",
  "choices": [
    "Premier choix possible",
    "Deuxième choix possible",
    "Troisième choix possible"
  ],
  "stats_change": {
    "health": 0,
    "sanity": 0,
    "gold": 0
  },
  "chapter_title": "Chapitre I — Le Réveil",
  "is_death": false,
  "is_victory": false
}

- "choices" : toujours 3 ou 4 choix. Vide [] si mort ou victoire finale.
- "stats_change" : modifications RELATIVES aux stats (+10, -20, etc.). Santé et sanité de 0 à 100. L'or augmente librement.
- "is_death" : true si le joueur meurt.
- "is_victory" : true si c'est la fin de l'histoire (chapitre V uniquement).
- "chapter_title" : change quand un nouveau chapitre commence.

ÉTAT ACTUEL — Tour: {turn}/16 | Chapitre attendu: {expected_chapter} | Santé: {health} | Sanité: {sanity} | Or: {gold}`
    },

    en: {
        // Title screen
        title: "Chronicles<br>of Shadow",
        subtitle: "Every choice forges your fate. Every shadow hides a price.",
        provider_label: "AI Provider",
        provider_groq: "Groq (free, fast)",
        provider_gemini: "Google Gemini",
        api_label: "API Key",
        api_placeholder: "Enter your API key...",
        api_link: "Get a free key →",
        api_required: "API key required!",
        new_game: "New Adventure",
        continue_game: "Resume Game",
        or: "or",

        // Modal
        modal_title: "Leave the adventure?",
        modal_text: "Your progress will be preserved in the shadows.",
        modal_save: "Save and quit",
        modal_reset: "Start over",
        modal_cancel: "Continue adventure",

        // Game screen
        loading: "The shadows whisper...",

        // Game over
        gameover_title: "Your story ends here",
        restart: "Rise from the Ashes",

        // Victory
        final_health: "Final Health",
        final_sanity: "Final Sanity",
        final_gold: "Gold earned",
        final_turns: "Turns played",

        // Endings
        end_heroic: "Heroic Ending — A New Dawn",
        end_corrupt: "Corrupted Ending — The New Tyrant",
        end_sacrifice: "The Sacrifice",
        end_tragic: "Tragic Ending — The Cursed Realm",

        // Errors
        error_invoke: "Unable to summon the shadows...",
        error_shadows: "The shadows scatter abruptly...",
        error_prefix: "Error",
        error_check_api: "Check your API key and try again.",

        // System prompt
        first_message: "Begin the story. The wanderer awakens at the gates of the cursed kingdom of Ombrath.",
        choice_prefix: "My choice",
        system_prompt: `You are the Game Master of an interactive dark fantasy tale. Your world is grim, cruel, and unpredictable.

STORY:
The player is a wanderer with no memory who awakens at the gates of Ombrath, a kingdom consumed by an ancient curse. They will discover that an artifact — the Crown of Twilight — is the key to breaking or dominating this curse. Their journey will take them through corrupted lands to the Sanctuary of Ashes for a final reckoning.

STRUCTURE IN 5 CHAPTERS:
You MUST follow this progression based on the player's current turn.

Chapter I — The Awakening (turns 1-3):
The wanderer awakens in a disturbing place. They discover the first signs of the curse. They meet a character who tells them about the Crown of Twilight. Set up the atmosphere and mystery.

Chapter II — The Quest (turns 4-7):
The player explores the cursed kingdom. They must find clues about the Sanctuary of Ashes' location. Encounters with factions (cultists, survivors, creatures). Choices that define their moral alignment. Opportunities to find gold, allies, or enemies.

Chapter III — The Trial (turns 8-11):
Dangers intensify. Possible betrayals, major battles, revelations about the wanderer's past. The player must overcome a major obstacle to reach the Sanctuary. Choices have heavy consequences on health and sanity.

Chapter IV — The Sanctuary (turns 12-15):
The player reaches the Sanctuary of Ashes. Confrontation with the Crown's guardian. Crucial moral dilemmas: use the Crown to save the kingdom, destroy it, or seize its power.

Chapter V — The Reckoning (turns 16+):
You MUST conclude the story. Write an ending based on the player's choices and stats:
- HEROIC ENDING (health >= 50 AND sanity >= 50): The player breaks the curse. The kingdom begins to heal. is_victory: true
- CORRUPTED ENDING (sanity < 30): The player succumbs to the Crown's power and becomes the new tyrant. is_victory: true
- SACRIFICE ENDING (health < 30 AND sanity >= 50): The player sacrifices themselves to destroy the Crown. is_victory: true
- TRAGIC ENDING: If no condition is clearly met, the player survives but the kingdom remains cursed. is_victory: true
The ending must be a 3-4 paragraph epilogue. choices MUST be empty [].

NARRATIVE RULES:
- Write in English, second person ("You")
- Dark, poetic, menacing tone. Visceral and atmospheric descriptions.
- Each passage is 2-4 paragraphs (no more)
- Choices have real consequences: injuries, madness, gold gain or loss
- Don't hesitate to kill the player if their choices are reckless
- Vary situations: combat, exploration, dialogue, moral dilemma, horror
- Maintain coherence with previous events

TECHNICAL RULES:
You MUST respond ONLY with a valid JSON object, no surrounding text, in this exact format:
{
  "narrative": "The narrative text here. Use \\n\\n to separate paragraphs.",
  "choices": [
    "First possible choice",
    "Second possible choice",
    "Third possible choice"
  ],
  "stats_change": {
    "health": 0,
    "sanity": 0,
    "gold": 0
  },
  "chapter_title": "Chapter I — The Awakening",
  "is_death": false,
  "is_victory": false
}

- "choices": always 3 or 4 choices. Empty [] if death or final victory.
- "stats_change": RELATIVE stat changes (+10, -20, etc.). Health and sanity 0-100. Gold increases freely.
- "is_death": true if the player dies.
- "is_victory": true if it's the end of the story (chapter V only).
- "chapter_title": change when a new chapter begins.

CURRENT STATE — Turn: {turn}/16 | Expected chapter: {expected_chapter} | Health: {health} | Sanity: {sanity} | Gold: {gold}`
    }
};

// ===== GESTION DE LA LANGUE =====

let currentLang = localStorage.getItem('chroniques-lang') || 'fr';

// Retourne un texte traduit par clé
function t(key) {
    return TRANSLATIONS[currentLang][key] || TRANSLATIONS['fr'][key] || key;
}

// Applique les traductions à tous les éléments avec data-i18n
function applyTranslations() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        el.innerHTML = t(key);
    });

    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        el.placeholder = t(key);
    });

    // Mettre à jour le titre de la page
    document.title = currentLang === 'fr' ? "Chroniques de l'Ombre" : "Chronicles of Shadow";
    document.documentElement.lang = currentLang;
}

// Change la langue et met à jour l'interface
function setLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('chroniques-lang', lang);
    applyTranslations();

    // Mettre à jour les boutons de langue
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.toggle('active', btn.id === `lang-${lang}`);
    });
}

// Initialiser
applyTranslations();
