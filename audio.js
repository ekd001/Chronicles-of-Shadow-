// ===== MOTEUR AUDIO — Dark Fantasy Ambiance (style BotW) =====
// Tout est synthétisé en temps réel avec la Web Audio API.
// Aucun fichier audio externe nécessaire.

class DarkFantasyAudio {
    constructor() {
        this.ctx = null;           // AudioContext (créé au premier clic)
        this.masterGain = null;    // Volume global
        this.droneGain = null;     // Volume du drone
        this.windGain = null;      // Volume du vent
        this.pianoGain = null;     // Volume des notes de piano
        this.reverbNode = null;    // Convolver pour la réverb
        this.isPlaying = false;
        this.isMuted = false;
        this.pianoInterval = null; // Timer pour les notes aléatoires
        this.windSource = null;
    }

    // ===== INITIALISATION =====
    // Doit être appelé depuis un geste utilisateur (clic) à cause des
    // restrictions des navigateurs sur l'autoplay audio.
    init() {
        if (this.ctx) return;

        this.ctx = new (window.AudioContext || window.webkitAudioContext)();

        // Chaîne audio : source → gain individuel → masterGain → réverb → destination
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.value = 0.6;
        this.masterGain.connect(this.ctx.destination);

        // Créer la réverb (delay-based pour simuler une grande salle)
        this.reverbNode = this._createReverb();
        this.reverbNode.connect(this.masterGain);

        // Bus de gain par couche
        this.droneGain = this.ctx.createGain();
        this.droneGain.gain.value = 0.25;
        this.droneGain.connect(this.masterGain);

        this.windGain = this.ctx.createGain();
        this.windGain.gain.value = 0.12;
        this.windGain.connect(this.masterGain);

        this.pianoGain = this.ctx.createGain();
        this.pianoGain.gain.value = 0.35;
        this.pianoGain.connect(this.reverbNode);  // Piano → réverb pour la résonance
        this.pianoGain.connect(this.masterGain);   // + signal direct (mix wet/dry)
    }

    // ===== RÉVERB =====
    // Simule une réverb de cathédrale avec un buffer d'impulsion généré.
    // Durée longue (4s) pour que chaque note flotte dans l'espace.
    _createReverb() {
        const duration = 4;
        const sampleRate = this.ctx.sampleRate;
        const length = sampleRate * duration;
        const impulse = this.ctx.createBuffer(2, length, sampleRate);

        for (let channel = 0; channel < 2; channel++) {
            const data = impulse.getChannelData(channel);
            for (let i = 0; i < length; i++) {
                // Décroissance exponentielle + bruit aléatoire = réverb naturelle
                data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 2.5);
            }
        }

        const convolver = this.ctx.createConvolver();
        convolver.buffer = impulse;

        // Baisser le volume de la réverb pour un mix subtil
        const reverbGain = this.ctx.createGain();
        reverbGain.gain.value = 0.3;
        convolver.connect(reverbGain);

        return reverbGain;
    }

    // ===== DRONE GRAVE =====
    // Deux oscillateurs désaccordés (55Hz ± léger détune) créent un
    // battement lent qui donne vie au son. Filtre passe-bas pour garder
    // uniquement les basses fréquences.
    _startDrone() {
        const freqs = [55, 55.3]; // Léger désaccord = battement

        freqs.forEach(freq => {
            const osc = this.ctx.createOscillator();
            osc.type = 'sine';
            osc.frequency.value = freq;

            // Filtre passe-bas : ne garde que le grave profond
            const filter = this.ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.value = 120;
            filter.Q.value = 1;

            osc.connect(filter);
            filter.connect(this.droneGain);
            osc.start();
        });

        // Ajouter une harmonique très faible une quinte au-dessus (82Hz)
        // pour donner de la profondeur
        const harmonic = this.ctx.createOscillator();
        harmonic.type = 'triangle';
        harmonic.frequency.value = 82;

        const harmGain = this.ctx.createGain();
        harmGain.gain.value = 0.08;

        harmonic.connect(harmGain);
        harmGain.connect(this.droneGain);
        harmonic.start();
    }

    // ===== VENT SPECTRAL =====
    // Bruit blanc filtré avec un filtre passe-bande dont la fréquence
    // varie lentement (LFO) pour simuler des rafales de vent.
    _startWind() {
        // Générer un buffer de bruit blanc (2 secondes en boucle)
        const bufferSize = this.ctx.sampleRate * 2;
        const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        this.windSource = this.ctx.createBufferSource();
        this.windSource.buffer = noiseBuffer;
        this.windSource.loop = true;

        // Filtre passe-bande : isole une bande de fréquences = son de vent
        const windFilter = this.ctx.createBiquadFilter();
        windFilter.type = 'bandpass';
        windFilter.frequency.value = 600;
        windFilter.Q.value = 0.5;

        // LFO (oscillateur très lent) pour faire varier la fréquence du filtre
        // = le vent qui monte et descend
        const lfo = this.ctx.createOscillator();
        lfo.type = 'sine';
        lfo.frequency.value = 0.15; // Très lent : un cycle toutes les ~7 secondes

        const lfoGain = this.ctx.createGain();
        lfoGain.gain.value = 400; // Amplitude de variation (200Hz à 1000Hz)

        lfo.connect(lfoGain);
        lfoGain.connect(windFilter.frequency);
        lfo.start();

        this.windSource.connect(windFilter);
        windFilter.connect(this.windGain);
        this.windSource.start();
    }

    // ===== NOTES DE PIANO ÉPARSES =====
    // Le cœur du style BotW : des notes solitaires jouées aléatoirement
    // avec de longs silences entre elles.
    //
    // Gamme utilisée : Do mineur naturel (C, D, Eb, F, G, Ab, Bb)
    // avec quelques notes étendues sur 2 octaves pour varier.
    _startPianoNotes() {
        // Fréquences en Hz — gamme de Do mineur sur 2 octaves
        // Notes choisies pour sonner mélancolique et sombre
        const scale = [
            130.81, // C3
            146.83, // D3
            155.56, // Eb3
            174.61, // F3
            196.00, // G3
            207.65, // Ab3
            233.08, // Bb3
            261.63, // C4
            293.66, // D4
            311.13, // Eb4
            349.23, // F4
            392.00, // G4
            415.30, // Ab4
        ];

        const playNote = () => {
            if (!this.isPlaying || this.isMuted) return;

            // Choisir 1 ou parfois 2 notes simultanées
            const noteCount = Math.random() < 0.25 ? 2 : 1;

            for (let n = 0; n < noteCount; n++) {
                const freq = scale[Math.floor(Math.random() * scale.length)];
                this._playPianoNote(freq);
            }

            // Prochain note dans 3-10 secondes (aléatoire, comme BotW)
            const nextDelay = 3000 + Math.random() * 7000;
            this.pianoInterval = setTimeout(playNote, nextDelay);
        };

        // Première note après un court délai
        this.pianoInterval = setTimeout(playNote, 2000);
    }

    // ===== SYNTHÈSE D'UNE NOTE DE PIANO =====
    // Simule un piano avec un oscillateur + enveloppe ADSR.
    // Attack rapide, decay moyen, sustain faible, release très long
    // = une note qui frappe puis s'éteint lentement.
    _playPianoNote(freq) {
        const now = this.ctx.currentTime;

        // Oscillateur principal (triangle = son doux, proche du piano)
        const osc = this.ctx.createOscillator();
        osc.type = 'triangle';
        osc.frequency.value = freq;

        // Deuxième oscillateur légèrement désaccordé pour la richesse
        const osc2 = this.ctx.createOscillator();
        osc2.type = 'sine';
        osc2.frequency.value = freq * 1.002; // Très léger chorus

        // Enveloppe ADSR via un GainNode
        const envelope = this.ctx.createGain();
        envelope.gain.setValueAtTime(0, now);
        envelope.gain.linearRampToValueAtTime(0.4, now + 0.02);  // Attack (20ms)
        envelope.gain.linearRampToValueAtTime(0.15, now + 0.3);  // Decay (300ms)
        envelope.gain.linearRampToValueAtTime(0.08, now + 1.5);  // Sustain
        envelope.gain.linearRampToValueAtTime(0, now + 4);       // Release (4s total)

        // Filtre pour adoucir le son (retirer les harmoniques aiguës)
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(2000, now);
        filter.frequency.linearRampToValueAtTime(400, now + 3); // Le son s'assombrit en mourant

        osc.connect(envelope);
        osc2.connect(envelope);
        envelope.connect(filter);
        filter.connect(this.pianoGain);

        osc.start(now);
        osc2.start(now);
        osc.stop(now + 4.5);
        osc2.stop(now + 4.5);
    }

    // ===== SON DE CHOIX (CLIC) =====
    // Court son métallique quand le joueur clique sur un choix.
    playChoiceSound() {
        if (!this.ctx || this.isMuted) return;

        const now = this.ctx.currentTime;

        const osc = this.ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(200, now + 0.3);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(now);
        osc.stop(now + 0.4);
    }

    // ===== SON DE GAME OVER =====
    // Accord dissonant grave qui s'éteint lentement.
    playDeathSound() {
        if (!this.ctx || this.isMuted) return;

        const now = this.ctx.currentTime;
        const deathFreqs = [65.41, 77.78, 98]; // C2, Eb2 approx, intervalle sombre

        deathFreqs.forEach(freq => {
            const osc = this.ctx.createOscillator();
            osc.type = 'sawtooth';
            osc.frequency.value = freq;

            const gain = this.ctx.createGain();
            gain.gain.setValueAtTime(0.2, now);
            gain.gain.linearRampToValueAtTime(0, now + 5);

            const filter = this.ctx.createBiquadFilter();
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(800, now);
            filter.frequency.linearRampToValueAtTime(50, now + 5);

            osc.connect(filter);
            filter.connect(gain);
            gain.connect(this.reverbNode);
            gain.connect(this.masterGain);

            osc.start(now);
            osc.stop(now + 5.5);
        });
    }

    // ===== CONTRÔLES =====
    start() {
        this.init();
        if (this.isPlaying) return;
        this.isPlaying = true;

        // Fade in du volume global
        this.masterGain.gain.setValueAtTime(0, this.ctx.currentTime);
        this.masterGain.gain.linearRampToValueAtTime(0.6, this.ctx.currentTime + 3);

        this._startDrone();
        this._startWind();
        this._startPianoNotes();
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        if (this.masterGain) {
            const now = this.ctx.currentTime;
            this.masterGain.gain.linearRampToValueAtTime(
                this.isMuted ? 0 : 0.6,
                now + 0.5
            );
        }
        return this.isMuted;
    }
}

// Export global
window.audioEngine = new DarkFantasyAudio();
