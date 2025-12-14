// Agu-Son - Movement Sonification Interactive
// Version: v1.02

console.log('🎵 Agu-Son v1.02 - Movement Sonification Interactive');
console.log('v1.02 Enhancement: Increased brightness response and added glow effects for better visual feedback');
console.log('Initialize application');

    // Configuration
    const CONFIG = {
        gridSize: 4,
        baseNote: 'C3',
        scaleMode: 'major',
        instrument: 'windChime',
        canvasSize: 640,
        motionCanvasSize: 160,  // Smaller motion canvas for faster getImageData (1/4 resolution)
        motionThreshold: 20,
        cellDecayRate: 0.95,
        minCellIntensity: 0.1,
        videoOpacity: 0.3,
        warmupDuration: 500,
        noteRepeatRate: 100,
        triggerMode: 'single',
        stereoWidth: 0.5,  // 0 = mono, 1 = full stereo
        attackTime: 0.015,  // Attack time in seconds (0.001 to 0.5)
        audioLatency: 'interactive',  // Audio context latency hint
        compressionEnabled: true,  // Compressor on/off
        reverbDecay: 4,  // Reverb tail length in seconds (0.1 to 5)
        reverbWet: 0.4,  // Reverb dry/wet mix (0 to 1)
        noteRelease: 0.3,  // Note release time in seconds (0.01 to 1)
        highNoteAttenuation: 0.3  // How much softer high notes are: 0.3 = 30% quieter at top (0 = no change, 1 = silent at top)
    };

// Scale patterns (in semitones from root)
const SCALE_PATTERNS = {
    major: [0, 2, 4, 5, 7, 9, 11],
    minor: [0, 2, 3, 5, 7, 8, 10],
    dorian: [0, 2, 3, 5, 7, 9, 10],
    phrygian: [0, 1, 3, 5, 7, 8, 10],
    lydian: [0, 2, 4, 6, 7, 9, 11],
    mixolydian: [0, 2, 4, 5, 7, 9, 10],
    locrian: [0, 1, 3, 5, 6, 8, 10],
    harmonicMinor: [0, 2, 3, 5, 7, 8, 11],
    melodicMinor: [0, 2, 3, 5, 7, 9, 11],
    pentatonic: [0, 2, 4, 7, 9],
    pentatonicMinor: [0, 3, 5, 7, 10],
    blues: [0, 3, 5, 6, 7, 10],
    chromatic: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
};

// All chromatic notes
const ALL_NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

// Dynamic notes and colors (will be generated)
let NOTES = [];
let COLORS = [];

// Instrument presets
const INSTRUMENTS = {
    windChime: {
        synth: Tone.Synth,  // Using basic Synth instead of FMSynth for better CPU performance
        options: {
            oscillator: { type: "sine" },
            envelope: { attack: 0.001, decay: 0.4, sustain: 0.1, release: 0.3 }  // release will be overridden by CONFIG
        }
    },
    marimba: {
        synth: Tone.FMSynth,
        options: {
            harmonicity: 3.01,
            modulationIndex: 14,
            oscillator: { type: "sine" },
            envelope: { attack: 0.001, decay: 1.2, sustain: 0, release: 1.2 },
            modulation: { type: "square" },
            modulationEnvelope: { attack: 0.001, decay: 0.2, sustain: 0, release: 0.2 }
        }
    },
    musicBox: {
        synth: Tone.FMSynth,
        options: {
            harmonicity: 5,
            modulationIndex: 1.5,
            oscillator: { type: "sine" },
            envelope: { attack: 0.002, decay: 0.4, sustain: 0.1, release: 1.5 },
            modulation: { type: "sine" },
            modulationEnvelope: { attack: 0.006, decay: 0.1, sustain: 0, release: 0.1 }
        }
    },
    piano: {
        synth: Tone.Synth,
        options: {
            oscillator: { type: "triangle" },
            envelope: { attack: 0.005, decay: 0.3, sustain: 0.1, release: 1.0 }
        }
    },
    xylophone: {
        synth: Tone.FMSynth,
        options: {
            harmonicity: 4,
            modulationIndex: 12,
            oscillator: { type: "sine" },
            envelope: { attack: 0.001, decay: 0.3, sustain: 0, release: 0.3 },
            modulation: { type: "square" },
            modulationEnvelope: { attack: 0.001, decay: 0.1, sustain: 0, release: 0.1 }
        }
    },
    handBell: {
        synth: Tone.FMSynth,
        options: {
            harmonicity: 2.5,
            modulationIndex: 4,
            oscillator: { type: "sine" },
            envelope: { attack: 0.001, decay: 2.0, sustain: 0.2, release: 2.5 },
            modulation: { type: "sine" },
            modulationEnvelope: { attack: 0.002, decay: 0.3, sustain: 0.1, release: 0.3 }
        }
    },
    celeste: {
        synth: Tone.FMSynth,
        options: {
            harmonicity: 8,
            modulationIndex: 2,
            oscillator: { type: "sine" },
            envelope: { attack: 0.004, decay: 0.6, sustain: 0.3, release: 1.2 },
            modulation: { type: "sine" },
            modulationEnvelope: { attack: 0.006, decay: 0.2, sustain: 0.2, release: 0.4 }
        }
    },
    glockenspiel: {
        synth: Tone.FMSynth,
        options: {
            harmonicity: 6,
            modulationIndex: 10,
            oscillator: { type: "sine" },
            envelope: { attack: 0.001, decay: 0.2, sustain: 0, release: 0.3 },
            modulation: { type: "square" },
            modulationEnvelope: { attack: 0.001, decay: 0.05, sustain: 0, release: 0.05 }
        }
    },
    kalimba: {
        synth: Tone.FMSynth,
        options: {
            harmonicity: 8,
            modulationIndex: 3,
            oscillator: { type: "sine" },
            envelope: { attack: 0.002, decay: 0.7, sustain: 0.1, release: 0.8 },
            modulation: { type: "triangle" },
            modulationEnvelope: { attack: 0.003, decay: 0.3, sustain: 0.05, release: 0.3 }
        }
    },
    steelDrum: {
        synth: Tone.FMSynth,
        options: {
            harmonicity: 11,
            modulationIndex: 5,
            oscillator: { type: "sine" },
            envelope: { attack: 0.001, decay: 0.5, sustain: 0.1, release: 0.8 },
            modulation: { type: "square" },
            modulationEnvelope: { attack: 0.001, decay: 0.2, sustain: 0, release: 0.2 }
        }
    }
};

// Generate scale notes
function generateNotes(baseNote, scaleMode, gridSize) {
    const scale = SCALE_PATTERNS[scaleMode];
    const totalNotes = gridSize * gridSize;
    const notes = [];
    
    // Parse base note
    const noteMatch = baseNote.match(/([A-G]#?)(\d+)/);
    const noteName = noteMatch[1];
    const baseOctave = parseInt(noteMatch[2]);
    const baseNoteIndex = ALL_NOTES.indexOf(noteName);
    
    for (let i = 0; i < totalNotes; i++) {
        // Get the scale degree for this note (cycles through scale)
        const scaleIndex = i % scale.length;
        // How many complete octaves have we gone through?
        const octaveShift = Math.floor(i / scale.length);
        
        // Calculate total semitones from base note
        const totalSemitones = (octaveShift * 12) + scale[scaleIndex];
        
        // Calculate final note and octave
        const finalNoteIndex = (baseNoteIndex + totalSemitones) % 12;
        const finalOctave = baseOctave + Math.floor((baseNoteIndex + totalSemitones) / 12);
        
        notes.push(ALL_NOTES[finalNoteIndex] + finalOctave);
    }
    
    // Reshape into grid
    const grid = [];
    for (let row = 0; row < gridSize; row++) {
        grid.push(notes.slice(row * gridSize, (row + 1) * gridSize));
    }
    
    // Debug: Log generated notes
    console.log(`🎼 Generated notes (${gridSize}x${gridSize}):`, notes.join(', '));
    
    return grid;
}

// Generate colors for grid
function generateColors(gridSize) {
    const baseColors = [
        ['#FF6B6B', '#FFA07A', '#FFD93D', '#A8E6CF', '#7FDBDA', '#95E1D3'],
        ['#B8E0D2', '#95E1D3', '#6BCF9D', '#4ECDC4', '#5EAAA8', '#92B4EC'],
        ['#45B7D1', '#5F9DF7', '#8E7CC3', '#A78BFA', '#B794F6', '#C8B6FF'],
        ['#C084FC', '#E879F9', '#F472B6', '#FB7185', '#FF9AA2', '#FFB6C1'],
        ['#FFD1DC', '#FFC0D9', '#F8B4D9', '#E7C6E7', '#D5AAFF', '#C5A3FF'],
        ['#B5A6FF', '#A594F9', '#9381FF', '#8B7FD1', '#836BA6', '#7B68AA']
    ];
    
    const colors = [];
    for (let row = 0; row < gridSize; row++) {
        colors.push(baseColors[row].slice(0, gridSize));
    }
    
    return colors;
}

    // Application State
    const state = {
        isRunning: false,
        video: null,
        gridCanvas: null,
        gridCtx: null,
        motionCanvas: null,
        motionCtx: null,
        previousFrame: null,
        cellIntensities: [],
        cellTriggered: [],
        cellFlashIntensity: [],
        lastNoteTime: [],
        columnSynths: [],  // One PolySynth per column with fixed panner
        limiter: null,
        compressor: null,
        reverb: null,
        initialized: false,
        warmupEndTime: null,
        lastMotionCheck: 0,
        lastDrawTime: 0,
        frameCount: 0,
        lastVideoTime: -1,  // Track video's current time to detect new frames
        lastQuantizeTick: 0   // Master quantization clock for continuous mode (all cells sync to this)
    };

// Initialize state arrays based on grid size
function initStateArrays() {
    state.cellIntensities = Array(CONFIG.gridSize).fill(0).map(() => Array(CONFIG.gridSize).fill(0));
    state.cellTriggered = Array(CONFIG.gridSize).fill(0).map(() => Array(CONFIG.gridSize).fill(false));
    state.cellFlashIntensity = Array(CONFIG.gridSize).fill(0).map(() => Array(CONFIG.gridSize).fill(0));
    state.lastNoteTime = Array(CONFIG.gridSize).fill(0).map(() => Array(CONFIG.gridSize).fill(0));
}

// Initialize the application
function init() {
    // Load audio latency from localStorage, default to interactive
    const savedLatency = localStorage.getItem('audioLatency');
    CONFIG.audioLatency = savedLatency || 'interactive';
    
    // Set Tone.js latency hint from config
    Tone.context.latencyHint = CONFIG.audioLatency;
    
    // Generate initial notes and colors
    NOTES = generateNotes(CONFIG.baseNote, CONFIG.scaleMode, CONFIG.gridSize);
    COLORS = generateColors(CONFIG.gridSize);
    initStateArrays();
    
    state.video = document.getElementById('video');
    state.gridCanvas = document.getElementById('grid-canvas');
    state.gridCtx = state.gridCanvas.getContext('2d');
    state.motionCanvas = document.getElementById('motion-canvas');
    state.motionCtx = state.motionCanvas.getContext('2d', { willReadFrequently: true });
    
    // Set initial canvas sizes
    state.gridCanvas.width = CONFIG.canvasSize;
    state.gridCanvas.height = CONFIG.canvasSize;
    state.motionCanvas.width = CONFIG.motionCanvasSize;
    state.motionCanvas.height = CONFIG.motionCanvasSize;
    
    // Setup controls
    setupControls();
    
    // Setup audio
    setupAudio();
    
    // Handle window resize
    window.addEventListener('resize', updateCanvasSize);
    
    // Set initial canvas size based on container
    updateCanvasSize();
    
    // Draw initial grid
    drawGrid();
    
    state.initialized = true;
    console.log('✓ Application initialized');
    console.log(`✓ Grid: ${CONFIG.gridSize}x${CONFIG.gridSize} | Scale: ${CONFIG.scaleMode} | Base: ${CONFIG.baseNote} | Instrument: ${CONFIG.instrument}`);
}

// Update canvas size to match container dimensions
function updateCanvasSize() {
    const container = document.getElementById('canvas-container');
    const size = Math.min(container.clientWidth, container.clientHeight);
    
    CONFIG.canvasSize = size;
    state.gridCanvas.width = size;
    state.gridCanvas.height = size;
    // Motion canvas stays at lower resolution for performance
    state.motionCanvas.width = CONFIG.motionCanvasSize;
    state.motionCanvas.height = CONFIG.motionCanvasSize;
    
    // Also update the video to match
    if (state.video) {
        state.video.style.width = size + 'px';
        state.video.style.height = size + 'px';
    }
    
    // Clear previous frame to prevent false motion detection after resize
    state.previousFrame = null;
}

    // Setup audio with selected instrument
    function setupAudio() {
        // Dispose of existing column synths if they exist
        if (state.columnSynths.length > 0) {
            state.columnSynths.forEach(cs => {
                cs.synth.dispose();
                cs.panner.dispose();
            });
            state.columnSynths = [];
        }
        
        // Create a limiter at the end of the chain
        if (!state.limiter) {
            state.limiter = new Tone.Limiter(-1).toDestination();
        }
        
        // Create compressor for automatic volume reduction when signal gets hot
        if (!state.compressor) {
            state.compressor = new Tone.Compressor({
                threshold: -20,  // Start compressing at -20dB
                ratio: 8,        // Heavy compression ratio
                attack: 0.003,   // Fast attack to catch transients
                release: 0.1,    // Quick release
                knee: 10         // Smooth knee
            }).connect(state.limiter);
        }
        
        // Create reverb - connect to compressor or limiter based on compression setting
        if (!state.reverb) {
            const reverbDestination = CONFIG.compressionEnabled ? state.compressor : state.limiter;
            state.reverb = new Tone.Reverb({
                decay: CONFIG.reverbDecay,
                preDelay: 0.01,
                wet: CONFIG.reverbWet
            }).connect(reverbDestination);
        }
        
        // Get instrument preset
        const instrument = INSTRUMENTS[CONFIG.instrument];
        
        // Create one PolySynth + Panner per COLUMN
        // This prevents stereo jumping clicks when panning changes mid-note
        // Keep polyphony low - FMSynth is VERY CPU intensive
        const totalPolyphonyBudget = 64;  // Lower for FMSynth performance
        const polyphonyPerColumn = Math.ceil(totalPolyphonyBudget / CONFIG.gridSize);
        
        for (let col = 0; col < CONFIG.gridSize; col++) {
            // Calculate fixed pan position for this column
            const panPosition = ((col / (CONFIG.gridSize - 1)) * 2 - 1) * CONFIG.stereoWidth;
            
            // Create panner for this column
            const panner = new Tone.Panner(panPosition).connect(state.reverb);
            
            // Create PolySynth for this column with custom attack and release times
            const options = JSON.parse(JSON.stringify(instrument.options)); // Deep clone
            if (options.envelope) {
                options.envelope.attack = CONFIG.attackTime;
                options.envelope.release = CONFIG.noteRelease;
            }
            if (options.modulationEnvelope) {
                options.modulationEnvelope.release = CONFIG.noteRelease * 0.33;
            }
            
            const synth = new Tone.PolySynth({
                voice: instrument.synth,
                maxPolyphony: polyphonyPerColumn,
                options: options
            }).connect(panner);
            
            state.columnSynths.push({ synth, panner });
        }
        
        const totalPolyphony = polyphonyPerColumn * CONFIG.gridSize;
        console.log(`✓ Audio: ${CONFIG.instrument} | ${CONFIG.gridSize} columns × ${polyphonyPerColumn} voices = ${totalPolyphony} total polyphony`);
    }

// Setup UI controls
function setupControls() {
    const startBtn = document.getElementById('start-btn');
    const noteRepeatRateSlider = document.getElementById('note-repeat-rate');
    const noteRepeatRateValue = document.getElementById('note-repeat-rate-value');

    const triggerModeBtn = document.getElementById('trigger-mode-btn');

    const stereoWidthSlider = document.getElementById('stereo-width');
    const stereoWidthValue = document.getElementById('stereo-width-value');

    const attackTimeSlider = document.getElementById('attack-time');
    const attackTimeValue = document.getElementById('attack-time-value');

    const noteReleaseSlider = document.getElementById('note-release');
    const noteReleaseValue = document.getElementById('note-release-value');

    const audioLatencySelect = document.getElementById('audio-latency');

    const compressionToggle = document.getElementById('compression-toggle');

    const releaseAllBtn = document.getElementById('release-all-btn');

    const reverbDecaySlider = document.getElementById('reverb-decay');
    const reverbDecayValue = document.getElementById('reverb-decay-value');

    const reverbWetSlider = document.getElementById('reverb-wet');
    const reverbWetValue = document.getElementById('reverb-wet-value');

    // Video Settings elements
    const sensitivitySlider = document.getElementById('sensitivity');
    const sensitivityValue = document.getElementById('sensitivity-value');
    const gridOpacitySlider = document.getElementById('grid-opacity');
    const gridOpacityValue = document.getElementById('grid-opacity-value');
    const videoOpacitySlider = document.getElementById('video-opacity');
    const videoOpacityValue = document.getElementById('video-opacity-value');

    const advancedToggle = document.getElementById('advanced-toggle');
    const sidebar = document.getElementById('sidebar');
    
    // Advanced menu toggle
    advancedToggle.addEventListener('click', () => {
        sidebar.classList.toggle('show');
        const canvasContainer = document.getElementById('canvas-container');
        canvasContainer.classList.toggle('fullwidth');
        // Wait for transition to complete, then resize canvas
        setTimeout(() => {
            updateCanvasSize();
        }, 300);
    });
    
    startBtn.addEventListener('click', toggleRunning);
    
    sensitivitySlider.addEventListener('input', (e) => {
        CONFIG.motionThreshold = e.target.value;
        sensitivityValue.textContent = e.target.value;
    });
    
    noteRepeatRateSlider.addEventListener('input', (e) => {
        CONFIG.noteRepeatRate = parseInt(e.target.value);
        noteRepeatRateValue.textContent = e.target.value + 'ms';
    });
    
    triggerModeBtn.addEventListener('click', () => {
        if (CONFIG.triggerMode === 'continuous') {
            CONFIG.triggerMode = 'single';
            triggerModeBtn.textContent = 'Individual Trigger Active';
            triggerModeBtn.classList.add('single-mode');
            // Disable note repeat rate in individual trigger mode
            noteRepeatRateSlider.disabled = true;
        } else {
            CONFIG.triggerMode = 'continuous';
            triggerModeBtn.textContent = 'Continuous Trigger Active';
            triggerModeBtn.classList.remove('single-mode');
            // Enable note repeat rate in continuous mode
            noteRepeatRateSlider.disabled = false;
        }
        // Reset all trigger states when switching modes
        state.cellTriggered = Array(CONFIG.gridSize).fill(0).map(() => Array(CONFIG.gridSize).fill(false));
    });
    
    gridOpacitySlider.addEventListener('input', (e) => {
        const opacity = e.target.value / 100;
        state.gridCanvas.style.opacity = opacity;
        gridOpacityValue.textContent = e.target.value + '%';
    });
    
    videoOpacitySlider.addEventListener('input', (e) => {
        const opacity = e.target.value / 100;
        state.video.style.opacity = opacity;
        videoOpacityValue.textContent = e.target.value + '%';
    });
    
    stereoWidthSlider.addEventListener('input', (e) => {
        CONFIG.stereoWidth = e.target.value / 100;
        stereoWidthValue.textContent = e.target.value + '%';
        
        // Update all column panners with new stereo width
        state.columnSynths.forEach((cs, col) => {
            const panPosition = ((col / (CONFIG.gridSize - 1)) * 2 - 1) * CONFIG.stereoWidth;
            cs.panner.pan.value = panPosition;
        });
    });
    
    // Musical settings controls
    const gridSizeSelect = document.getElementById('grid-size');
    const baseNoteSelect = document.getElementById('base-note');
    const scaleModeSelect = document.getElementById('scale-mode');
    const instrumentSelect = document.getElementById('instrument');
    
    gridSizeSelect.addEventListener('change', (e) => {
        CONFIG.gridSize = parseInt(e.target.value);
        rebuildMusicalGrid();
    });
    
    baseNoteSelect.addEventListener('change', (e) => {
        CONFIG.baseNote = e.target.value;
        NOTES = generateNotes(CONFIG.baseNote, CONFIG.scaleMode, CONFIG.gridSize);
        console.log(`✓ Base note: ${CONFIG.baseNote}`);
    });
    
    scaleModeSelect.addEventListener('change', (e) => {
        CONFIG.scaleMode = e.target.value;
        NOTES = generateNotes(CONFIG.baseNote, CONFIG.scaleMode, CONFIG.gridSize);
        console.log(`✓ Scale mode: ${CONFIG.scaleMode}`);
    });
    
    instrumentSelect.addEventListener('change', (e) => {
        CONFIG.instrument = e.target.value;
        setupAudio();
    });
    
    attackTimeSlider.addEventListener('input', (e) => {
        // Logarithmic scale: 0-100 slider maps to 1-500ms exponentially
        // More precision in lower values (1-50ms), less in higher values (50-500ms)
        const sliderValue = parseInt(e.target.value);
        const attackTimeMs = Math.round(Math.pow(500, sliderValue / 100));
        CONFIG.attackTime = attackTimeMs / 1000;  // Convert ms to seconds
        attackTimeValue.textContent = attackTimeMs + 'ms';
        
        // Update existing synth parameters instead of recreating
        state.columnSynths.forEach(cs => {
            cs.synth.set({ envelope: { attack: CONFIG.attackTime } });
        });
        
        console.log(`✓ Attack time: ${attackTimeMs}ms`);
    });
    
    // Set dropdown to saved value on load, or default to interactive
    const savedLatency = localStorage.getItem('audioLatency');
    audioLatencySelect.value = savedLatency || 'interactive';
    
    audioLatencySelect.addEventListener('change', (e) => {
        CONFIG.audioLatency = e.target.value;
        localStorage.setItem('audioLatency', e.target.value);
        alert('Audio latency will take effect on next page reload. Refresh the page to apply the change.');
        console.log(`✓ Audio latency: ${CONFIG.audioLatency} (requires reload)`);
    });
    
    compressionToggle.addEventListener('click', () => {
        CONFIG.compressionEnabled = !CONFIG.compressionEnabled;
        
        // Update button text and style
        if (CONFIG.compressionEnabled) {
            compressionToggle.textContent = 'Compression: ON';
            compressionToggle.classList.remove('compression-off');
            compressionToggle.classList.add('compression-on');
            // Reconnect reverb to compressor
            state.reverb.disconnect();
            state.reverb.connect(state.compressor);
        } else {
            compressionToggle.textContent = 'Compression: OFF';
            compressionToggle.classList.remove('compression-on');
            compressionToggle.classList.add('compression-off');
            // Bypass compressor, connect reverb directly to limiter
            state.reverb.disconnect();
            state.reverb.connect(state.limiter);
        }
        
        console.log(`✓ Compression: ${CONFIG.compressionEnabled ? 'ON' : 'OFF'}`);
    });
    
    reverbDecaySlider.addEventListener('input', (e) => {
        // Map slider value (1-50) to decay time (0.1-5.0 seconds)
        const decay = parseInt(e.target.value) / 10;
        CONFIG.reverbDecay = decay;
        reverbDecayValue.textContent = decay.toFixed(1) + 's';
        
        // Update existing reverb parameter
        if (state.reverb) {
            state.reverb.decay = CONFIG.reverbDecay;
        }
        
        console.log(`✓ Reverb decay: ${decay.toFixed(1)}s`);
    });
    
    reverbWetSlider.addEventListener('input', (e) => {
        // Map slider value (0-100) to wet value (0.0-1.0)
        const wet = parseInt(e.target.value) / 100;
        CONFIG.reverbWet = wet;
        reverbWetValue.textContent = Math.round(wet * 100) + '%';
        
        // Update existing reverb parameter
        if (state.reverb) {
            state.reverb.wet.value = CONFIG.reverbWet;
        }
        
        console.log(`✓ Reverb wet: ${Math.round(wet * 100)}%`);
    });
    
    noteReleaseSlider.addEventListener('input', (e) => {
        // Map slider value (10-1000) to release time in seconds (0.01-1.0)
        const releaseMs = parseInt(e.target.value);
        CONFIG.noteRelease = releaseMs / 1000;
        noteReleaseValue.textContent = releaseMs + 'ms';
        
        // Update existing synth envelope release
        state.columnSynths.forEach(cs => {
            const updateOptions = { envelope: { release: CONFIG.noteRelease } };
            // Only set modulationEnvelope if synth has it (FMSynth)
            if (cs.synth.get().modulationEnvelope !== undefined) {
                updateOptions.modulationEnvelope = { release: CONFIG.noteRelease * 0.33 };
            }
            cs.synth.set(updateOptions);
        });
        
        console.log(`✓ Note release: ${releaseMs}ms`);
    });
    
    releaseAllBtn.addEventListener('click', () => {
        // Emergency: release all active notes on all synths
        state.columnSynths.forEach(cs => {
            cs.synth.releaseAll();
        });
        console.log('🚨 Emergency: Released all notes!');
    });
}

    // Rebuild the musical grid when size changes
    function rebuildMusicalGrid() {
        NOTES = generateNotes(CONFIG.baseNote, CONFIG.scaleMode, CONFIG.gridSize);
        COLORS = generateColors(CONFIG.gridSize);
        initStateArrays();
        // MUST recreate audio when grid size changes (need correct number of column synths)
        setupAudio();
        console.log(`✓ Grid resized: ${CONFIG.gridSize}x${CONFIG.gridSize}`);
    }

// Start/stop the application
async function toggleRunning() {
    const startBtn = document.getElementById('start-btn');
    const status = document.getElementById('status');
    
    if (!state.isRunning) {
        // Trigger shrink animation immediately
        startBtn.classList.add('shrinking');
        
        // After shrink completes, show the starting message and move button
        setTimeout(() => {
            // Show starting message after button disappears
            const startingMessage = document.getElementById('starting-message');
            startingMessage.classList.add('show');
            
            // Remove the message after fadeout completes (2s show + 0.5s fade = 2.5s total)
            setTimeout(() => {
                startingMessage.classList.remove('show');
            }, 2500);
            
            startBtn.classList.remove('shrinking');
            startBtn.classList.add('moved', 'expanding');
            
            // After expand animation, add settled state for hover effects
            setTimeout(() => {
                startBtn.classList.remove('expanding');
                startBtn.classList.add('settled');
            }, 400);
        }, 500);
        
        try {
            // Request camera access
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { width: 640, height: 640 }
            });
            
            state.video.srcObject = stream;
            state.isRunning = true;
            startBtn.textContent = 'Stop';
            startBtn.classList.add('active');
            status.textContent = 'Running - Move to create music!';

            // Show record button
            document.getElementById('record-btn').style.display = 'flex';
            
                // Start Tone.js audio context
                await Tone.start();
            
            // Set warmup end time to prevent initial "big bang"
            state.warmupEndTime = Date.now() + CONFIG.warmupDuration;
            
            // Wait for video to be ready, then update canvas size
            state.video.addEventListener('loadedmetadata', () => {
                updateCanvasSize();
            });
            
            // Start the animation loop
            requestAnimationFrame(update);
            
            console.log('✓ Camera started');
        } catch (error) {
            console.error('Error accessing camera:', error);
            status.textContent = 'Error: Could not access camera';
        }
    } else {
        // Stop the camera
        const stream = state.video.srcObject;
        const tracks = stream.getTracks();
        tracks.forEach(track => track.stop());
        
        state.isRunning = false;
        startBtn.textContent = 'Start';
        startBtn.classList.remove('active');
        // Keep 'moved' class so button stays in lower right
        status.textContent = 'Stopped';

        // Hide record button
        document.getElementById('record-btn').style.display = 'none';

        console.log('✓ Camera stopped');
    }
}

    // Main update loop
    function update() {
        if (!state.isRunning) return;
        
        state.frameCount++;
        
        // Only warn if approaching polyphony limit
        if (state.frameCount % 60 === 0 && state.columnSynths.length > 0) {
            const totalActive = state.columnSynths.reduce((sum, cs) => sum + cs.synth.activeVoices, 0);
            const totalMax = state.columnSynths.reduce((sum, cs) => sum + cs.synth.maxPolyphony, 0);
            
            // Only log warning when voice usage is high
            if (totalActive > totalMax * 0.8) {
                const perColumn = state.columnSynths.map((cs, i) => `Col${i}:${cs.synth.activeVoices}`).join(' | ');
                console.warn(`⚠️ High voice usage: ${totalActive} / ${totalMax} (${Math.round(totalActive/totalMax*100)}%) | ${perColumn}`);
            }
        }
        
        // Motion detection synced to ACTUAL camera frame updates
        // Only detect when we have a genuinely NEW frame from the camera
        // Video.currentTime changes when a new frame is available
        if (state.video && state.video.currentTime !== state.lastVideoTime) {
            state.lastVideoTime = state.video.currentTime;
            detectMotion();
        }
        
        // Always update cell intensities for smooth decay
        updateCellIntensities();
        
        // Draw grid every frame for maximum responsiveness
        drawGrid();
        
        // Continue the loop
        requestAnimationFrame(update);
    }

// Detect motion in the video feed
function detectMotion() {
    if (!state.video || state.video.paused || state.video.ended) return;
    
    // Draw current frame to motion canvas (mirrored) at reduced resolution
    state.motionCtx.save();
    state.motionCtx.scale(-1, 1);
    state.motionCtx.drawImage(state.video, -CONFIG.motionCanvasSize, 0, CONFIG.motionCanvasSize, CONFIG.motionCanvasSize);
    state.motionCtx.restore();
    
    const currentFrame = state.motionCtx.getImageData(0, 0, CONFIG.motionCanvasSize, CONFIG.motionCanvasSize);
    
    if (state.previousFrame) {
        // Check if master clock has ticked (for continuous mode)
        const now = Date.now();
        const timeSinceLastTick = now - state.lastQuantizeTick;
        const masterClockTicked = timeSinceLastTick >= CONFIG.noteRepeatRate;
        
        if (masterClockTicked && CONFIG.triggerMode === 'continuous') {
            state.lastQuantizeTick = now;
        }
        
        // Pre-calculate cell size for motion canvas (scaled down)
        const cellSize = CONFIG.motionCanvasSize / CONFIG.gridSize;
        
        for (let row = 0; row < CONFIG.gridSize; row++) {
            for (let col = 0; col < CONFIG.gridSize; col++) {
                const motion = calculateCellMotion(
                    currentFrame,
                    state.previousFrame,
                    col * cellSize,
                    row * cellSize,
                    cellSize
                );
                
                const aboveThreshold = motion > CONFIG.motionThreshold;
                // Use hysteresis for single mode to prevent re-triggering on noise
                // Reset threshold is 70% of trigger threshold to avoid bouncing
                const resetThreshold = CONFIG.motionThreshold * 0.7;
                const belowResetThreshold = motion < resetThreshold;
                
                // Handle trigger modes
                if (CONFIG.triggerMode === 'continuous') {
                    // Continuous mode: ALL cells trigger together on master clock tick if above threshold
                    if (aboveThreshold && masterClockTicked) {
                        triggerCell(row, col, motion);
                    }
                } else if (CONFIG.triggerMode === 'single') {
                    // Single mode: only trigger on rising edge (crossing threshold)
                    if (aboveThreshold && !state.cellTriggered[row][col]) {
                        triggerCell(row, col, motion);
                        state.cellTriggered[row][col] = true;
                    } else if (belowResetThreshold && state.cellTriggered[row][col]) {
                        // Reset trigger state when motion falls well below threshold (hysteresis)
                        state.cellTriggered[row][col] = false;
                    }
                }
            }
        }
    }
    
    state.previousFrame = currentFrame;
}

// Calculate motion in a specific cell
function calculateCellMotion(currentFrame, previousFrame, x, y, size) {
    let totalMotion = 0;
    let pixelCount = 0;
    
    // Sample every 8th pixel for much better performance
    const step = 8;
    const intX = Math.floor(x);
    const intY = Math.floor(y);
    const intSize = Math.floor(size);
    const width = CONFIG.motionCanvasSize;
    
    for (let py = intY; py < intY + intSize; py += step) {
        for (let px = intX; px < intX + intSize; px += step) {
            const index = (py * width + px) * 4;
            
            // Only sample red channel for even better performance
            const diff = Math.abs(currentFrame.data[index] - previousFrame.data[index]);
            
            totalMotion += diff;
            pixelCount++;
        }
    }
    
    return pixelCount > 0 ? totalMotion / pixelCount : 0;
}

// Trigger a cell (light up and play sound)
function triggerCell(row, col, intensity) {
    // Update cell intensity (normalized 0-1, using lower divisor for brighter response)
    const normalizedIntensity = Math.min(intensity / 40, 1);
    state.cellIntensities[row][col] = Math.max(state.cellIntensities[row][col], normalizedIntensity);

    // Skip playing sound during warmup period to prevent initial "big bang"
    if (Date.now() < state.warmupEndTime) {
        return;
    }
    
    // Play the corresponding note
    // Grid coordinates: bottom-left is (0,0), so we need to flip row
    const noteRow = CONFIG.gridSize - 1 - row;
    const note = NOTES[noteRow][col];
    
    // Play with velocity based on intensity
    // Compressor handles dynamic volume reduction automatically
    let velocity = 0.1 + (normalizedIntensity * 0.2);  // Range: 0.1 to 0.3
    
    // Apply progressive attenuation for higher notes
    // Higher rows = higher notes = softer
    const attenuationFactor = 1 - (row / (CONFIG.gridSize - 1)) * CONFIG.highNoteAttenuation;
    velocity *= attenuationFactor;
    
    // Calculate note duration - fixed base duration
    const duration = 0.0625; // 32nd note in seconds at 120 BPM
    
    // Debug: Log note trigger details occasionally
    if (Math.random() < 0.01) {  // Log ~1% of notes
        console.log(`🎵 Trigger: ${note} | Duration: ${(duration * 1000).toFixed(0)}ms | Release: ${(CONFIG.noteRelease * 1000).toFixed(0)}ms | Total: ${((duration + CONFIG.noteRelease) * 1000).toFixed(0)}ms`);
    }
    
    // Route to the correct column's synth (each column has its own fixed panner)
    const columnSynth = state.columnSynths[col];
    if (columnSynth) {
        columnSynth.synth.triggerAttackRelease(note, duration, Tone.now(), velocity);
    }
    
    // Trigger flash effect when note plays
    state.cellFlashIntensity[row][col] = 1.0;
}

// Update cell intensities (decay over time)
function updateCellIntensities() {
    for (let row = 0; row < CONFIG.gridSize; row++) {
        for (let col = 0; col < CONFIG.gridSize; col++) {
            // Smooth exponential decay
            state.cellIntensities[row][col] *= CONFIG.cellDecayRate;
            
            // Accelerate decay at low intensities to avoid "sticking" at faint levels
            if (state.cellIntensities[row][col] < 0.05) {
                state.cellIntensities[row][col] *= 0.9;  // Extra decay when faint
            }
            
            // Hard-zero when negligible
            if (state.cellIntensities[row][col] < 0.001) {
                state.cellIntensities[row][col] = 0;
            }

            // Decay flash intensity quickly for snappy flash effect
            state.cellFlashIntensity[row][col] *= 0.85;
            if (state.cellFlashIntensity[row][col] < 0.01) {
                state.cellFlashIntensity[row][col] = 0;
            }
        }
    }
}

// Draw the grid
function drawGrid() {
    const ctx = state.gridCtx;
    const cellSize = CONFIG.canvasSize / CONFIG.gridSize;
    const canvasSize = CONFIG.canvasSize;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvasSize, canvasSize);
    
    // Batch drawing operations for better performance
    const gridSize = CONFIG.gridSize;
    
    for (let row = 0; row < gridSize; row++) {
        for (let col = 0; col < gridSize; col++) {
            const x = col * cellSize;
            const y = row * cellSize;
            const intensity = state.cellIntensities[row][col];
            
            // Skip completely inactive cells to save draw calls
            if (intensity < 0.01 && state.cellFlashIntensity[row][col] < 0.01) {
                // Just draw border for inactive cells
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
                ctx.lineWidth = 2;
                ctx.strokeRect(x, y, cellSize, cellSize);
                
                // Draw note label
                const noteRow = gridSize - 1 - row;
                const note = NOTES[noteRow][col];
                ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
                ctx.font = 'bold 18px sans-serif';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(note, x + cellSize / 2, y + cellSize / 2);
                continue;
            }
            
            // Get color for this cell (flip row for bottom-up layout)
            const colorRow = gridSize - 1 - row;
            const color = COLORS[colorRow][col];
            
            // Add glow effect when cells are active
            if (intensity > 0.1) {
                ctx.shadowBlur = 30 * intensity;
                ctx.shadowColor = color;
            } else {
                ctx.shadowBlur = 0;
            }
            
            // Draw cell background
            ctx.fillStyle = hexToRgba(color, intensity);
            ctx.fillRect(x, y, cellSize, cellSize);
            
            // Reset shadow for border
            ctx.shadowBlur = 0;
            
            // Draw cell border
            const borderOpacity = 0.3 + (intensity * 0.5);
            ctx.strokeStyle = `rgba(255, 255, 255, ${borderOpacity})`;
            ctx.lineWidth = 2;
            ctx.strokeRect(x, y, cellSize, cellSize);
            
            // Draw flash border when note fires
            const flashIntensity = state.cellFlashIntensity[row][col];
            if (flashIntensity > 0.05) {
                ctx.strokeStyle = `rgba(255, 255, 255, ${flashIntensity})`;
                ctx.lineWidth = 6;
                ctx.strokeRect(x + 3, y + 3, cellSize - 6, cellSize - 6);
            }
            
            // Draw note label
            const noteRow = gridSize - 1 - row;
            const note = NOTES[noteRow][col];
            const textOpacity = 0.6 + (intensity * 0.4);
            ctx.fillStyle = `rgba(255, 255, 255, ${textOpacity})`;
            ctx.font = 'bold 18px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(note, x + cellSize / 2, y + cellSize / 2);
        }
    }
}

// Helper function to convert hex color to rgba
function hexToRgba(hex, alpha) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// ============================================================================
// VIDEO RECORDING MODULE
// ============================================================================

// Cloudflare Worker Configuration
const UPLOAD_CONFIG = {
    workerUrl: 'https://geosonnet-video-upload.robertalexander-music.workers.dev'
};

// Recording state
const recordingState = {
    isRecording: false,
    mediaRecorder: null,
    recordedChunks: [],
    recordingCanvas: null,
    recordingCtx: null,
    animationFrameId: null,
    startTime: null,
    fadeInDuration: 200, // ms
    fadeOutDuration: 200, // ms
    aguLogo: null,
    geosonnetLogo: null
};

// Preload logos
function preloadLogos() {
    // Load AGU 2025 logo
    recordingState.aguLogo = new Image();
    recordingState.aguLogo.src = 'AGU25_Full_Event_Logo_WHITE.png';

    // Load Geo SonNet logo (WebP works great with canvas!)
    recordingState.geosonnetLogo = new Image();
    recordingState.geosonnetLogo.src = 'GeoSonNetLogocolor-2-e1731008087286.webp';
}

// No initialization needed for Cloudflare Worker upload! 🎉

// Create social media ready canvas with overlay
function createSocialMediaCanvas(sourceCanvas) {
    const finalCanvas = document.createElement('canvas');
    const finalCtx = finalCanvas.getContext('2d');

    // Social media friendly dimensions (1080x1920 for Reels/TikTok/Stories - 9:16 aspect ratio)
    finalCanvas.width = 1080;
    finalCanvas.height = 1920;

    // Layout dimensions
    const topBannerHeight = 420;
    const bottomBannerHeight = 420;
    const videoSize = 1080; // Square video (full width)
    const videoY = topBannerHeight;

    // Fill background with gradient
    const gradient = finalCtx.createLinearGradient(0, 0, 0, finalCanvas.height);
    gradient.addColorStop(0, '#667eea');
    gradient.addColorStop(1, '#764ba2');
    finalCtx.fillStyle = gradient;
    finalCtx.fillRect(0, 0, finalCanvas.width, finalCanvas.height);

    // Draw the webcam video first (with opacity, flipped horizontally to mirror)
    const videoOpacity = parseInt(document.getElementById('video-opacity').value) / 100;
    finalCtx.globalAlpha = videoOpacity;
    finalCtx.save();
    finalCtx.translate(videoSize, videoY); // Move to top-right of video area
    finalCtx.scale(-1, 1); // Flip horizontally (mirror)
    finalCtx.drawImage(state.video, 0, 0, videoSize, videoSize);
    finalCtx.restore();
    finalCtx.globalAlpha = 1;

    // Draw the grid canvas on top (the visualizations)
    finalCtx.drawImage(sourceCanvas, 0, videoY, videoSize, videoSize);

    // === TOP BANNER ===
    finalCtx.fillStyle = 'white';
    finalCtx.textAlign = 'center';
    finalCtx.textBaseline = 'middle';
    finalCtx.shadowColor = 'rgba(0, 0, 0, 0.8)';
    finalCtx.shadowBlur = 15;

    // Top banner text (split into two lines) - positioned higher
    finalCtx.font = 'bold 56px sans-serif';
    finalCtx.fillText('I was sonified by', finalCanvas.width / 2, 80);
    finalCtx.fillText('Geo SonNet at AGU2025', finalCanvas.width / 2, 160);

    // === BOTTOM BANNER ===
    const bottomBannerY = videoY + videoSize;

    // Bottom banner text
    finalCtx.font = 'bold 48px sans-serif';
    finalCtx.fillText('Check out geosonnet.org', finalCanvas.width / 2, bottomBannerY + bottomBannerHeight / 2);

    // Add Geo SonNet logo to top banner (centered below text) if loaded
    if (recordingState.geosonnetLogo && recordingState.geosonnetLogo.complete) {
        finalCtx.shadowBlur = 0; // Remove shadow for logo
        const logoHeight = 140;
        const logoWidth = (recordingState.geosonnetLogo.width / recordingState.geosonnetLogo.height) * logoHeight;
        const logoX = (finalCanvas.width - logoWidth) / 2; // Centered
        const logoY = 240; // Below the text, nicely positioned in remaining space
        finalCtx.drawImage(recordingState.geosonnetLogo, logoX, logoY, logoWidth, logoHeight);
    }

    // Add AGU 2025 logo to bottom banner if loaded
    if (recordingState.aguLogo && recordingState.aguLogo.complete) {
        finalCtx.shadowBlur = 0; // Remove shadow for logo
        const logoHeight = 120;
        const logoWidth = (recordingState.aguLogo.width / recordingState.aguLogo.height) * logoHeight;
        const logoX = (finalCanvas.width - logoWidth) / 2;
        const logoY = bottomBannerY + bottomBannerHeight - logoHeight - 40; // 40px padding from bottom
        finalCtx.drawImage(recordingState.aguLogo, logoX, logoY, logoWidth, logoHeight);
    }

    return finalCanvas;
}

// Draw recording frame
function drawRecordingFrame() {
    if (!recordingState.isRecording) return;

    const ctx = recordingState.recordingCtx;
    const canvas = recordingState.recordingCanvas;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Create social media overlay canvas
    const socialCanvas = createSocialMediaCanvas(state.gridCanvas);

    // Draw it
    ctx.drawImage(socialCanvas, 0, 0);

    // Continue animation
    recordingState.animationFrameId = requestAnimationFrame(drawRecordingFrame);
}

// Start recording
async function startRecording() {
    try {
        // Setup recording canvas (9:16 aspect ratio for Reels)
        recordingState.recordingCanvas = document.getElementById('recording-canvas');
        recordingState.recordingCtx = recordingState.recordingCanvas.getContext('2d');
        recordingState.recordingCanvas.width = 1080;
        recordingState.recordingCanvas.height = 1920;

        // Draw first frame to canvas before capturing stream (prevents 0 byte issue)
        const socialCanvas = createSocialMediaCanvas(state.gridCanvas);
        recordingState.recordingCtx.drawImage(socialCanvas, 0, 0);

        // Start draw loop
        recordingState.isRecording = true;
        recordingState.startTime = Date.now();
        drawRecordingFrame();

        // Wait 50ms for streams to initialize and sync
        await new Promise(resolve => setTimeout(resolve, 50));

        // Get canvas stream after sync buffer
        const canvasStream = recordingState.recordingCanvas.captureStream(30); // 30 fps

        // Get audio from Tone.js destination with fade in
        const audioContext = Tone.context;
        const destination = audioContext.createMediaStreamDestination();

        // Create gain node for fade in/out
        const fadeGain = audioContext.createGain();
        fadeGain.gain.setValueAtTime(0, audioContext.currentTime); // Start at 0
        fadeGain.gain.linearRampToValueAtTime(1, audioContext.currentTime + 0.05); // Fade in over 50ms

        // Connect: Tone.Destination -> fadeGain -> destination
        Tone.Destination.connect(fadeGain);
        fadeGain.connect(destination);

        // Store for fade out later
        recordingState.fadeGain = fadeGain;
        recordingState.audioDestination = destination;

        // Combine video and audio streams
        const combinedStream = new MediaStream([
            ...canvasStream.getVideoTracks(),
            ...destination.stream.getAudioTracks()
        ]);

        // Create MediaRecorder - try MP4 first for iPhone support, fallback to WebM
        let options;
        let format = 'webm';

        if (MediaRecorder.isTypeSupported('video/mp4')) {
            options = { mimeType: 'video/mp4', videoBitsPerSecond: 5000000 };
            format = 'mp4';
            console.log('✓ Recording as MP4 (iPhone compatible)');
        } else if (MediaRecorder.isTypeSupported('video/webm;codecs=vp9')) {
            options = { mimeType: 'video/webm;codecs=vp9', videoBitsPerSecond: 5000000 };
            format = 'webm';
            console.log('✓ Recording as WebM VP9 (Android/Desktop only)');
        } else {
            options = { videoBitsPerSecond: 5000000 };
            console.log('✓ Recording with default codec');
        }

        recordingState.mediaRecorder = new MediaRecorder(combinedStream, options);
        recordingState.format = format;
        recordingState.recordedChunks = [];

        recordingState.mediaRecorder.ondataavailable = (event) => {
            if (event.data.size > 0) {
                recordingState.recordedChunks.push(event.data);
            }
        };

        recordingState.mediaRecorder.onstop = handleRecordingStop;

        // Start recording
        recordingState.mediaRecorder.start(100); // Collect data every 100ms

        // Update UI
        const recordBtn = document.getElementById('record-btn');
        recordBtn.classList.add('recording');
        recordBtn.querySelector('.record-text').textContent = 'Stop Recording';

        console.log('✓ Recording started');
    } catch (error) {
        console.error('Error starting recording:', error);
        alert('Failed to start recording. Please try again.');
    }
}

// Stop recording
async function stopRecording() {
    return new Promise((resolve) => {
        // Fade out audio over 50ms
        if (recordingState.fadeGain) {
            const audioContext = Tone.context;
            recordingState.fadeGain.gain.setValueAtTime(1, audioContext.currentTime);
            recordingState.fadeGain.gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.05);
        }

        // Wait 50ms for audio fade out, then stop
        setTimeout(() => {
            recordingState.isRecording = false;
            if (recordingState.animationFrameId) {
                cancelAnimationFrame(recordingState.animationFrameId);
            }
            if (recordingState.mediaRecorder && recordingState.mediaRecorder.state !== 'inactive') {
                recordingState.mediaRecorder.stop();
            }

            // Disconnect and cleanup audio nodes
            if (recordingState.fadeGain) {
                Tone.Destination.disconnect(recordingState.fadeGain);
                recordingState.fadeGain.disconnect();
                recordingState.fadeGain = null;
                recordingState.audioDestination = null;
            }

            resolve();
        }, 50); // Wait for 50ms fade out
    });
}

// Handle recording stop
async function handleRecordingStop() {
    console.log('✓ Recording stopped, processing video...');

    // Create blob from recorded chunks with correct type
    const format = recordingState.format || 'webm';
    const mimeType = format === 'mp4' ? 'video/mp4' : 'video/webm';
    const blob = new Blob(recordingState.recordedChunks, { type: mimeType });

    console.log(`✓ Created ${format.toUpperCase()} blob: ${blob.size} bytes`);

    // Update UI
    const recordBtn = document.getElementById('record-btn');
    recordBtn.classList.remove('recording');
    recordBtn.querySelector('.record-text').textContent = 'Record';

    // Upload to Cloudflare Worker
    await uploadToCloudflare(blob, format);
}

// Upload video to Cloudflare Worker (SO MUCH SIMPLER! 🎉)
async function uploadToCloudflare(videoBlob, format = 'webm') {
    try {
        // Show modal with upload status
        const modal = document.getElementById('qr-modal');
        modal.classList.add('show');
        document.getElementById('upload-status').textContent = 'Uploading video...';
        document.getElementById('qr-code').innerHTML = '';
        document.getElementById('direct-link').style.display = 'none';

        // Create form data with correct extension
        const formData = new FormData();
        formData.append('video', videoBlob, `geosonnet_${Date.now()}.${format}`);

        // Upload to Cloudflare Worker
        const response = await fetch(UPLOAD_CONFIG.workerUrl, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            throw new Error('Upload failed');
        }

        const result = await response.json();

        if (!result.success) {
            throw new Error(result.error || 'Upload failed');
        }

        console.log('✓ File uploaded:', result.filename);

        // Generate landing page URL for mobile sharing
        const workerUrl = new URL(result.url).origin;
        const landingPageUrl = `${workerUrl}/video/${result.filename}`;

        document.getElementById('upload-status').textContent = 'Your recording is ready to share 🎉';
        document.getElementById('qr-code').innerHTML = '';
        new QRCode(document.getElementById('qr-code'), {
            text: landingPageUrl,
            width: 256,
            height: 256
        });

        // Show direct link to landing page
        const directLink = document.getElementById('direct-link');
        directLink.href = landingPageUrl;
        directLink.style.display = 'block';

        // Setup desktop share buttons
        setupDesktopShareButtons(result.url, landingPageUrl);

        console.log('✓ QR code generated');
    } catch (error) {
        console.error('Error uploading video:', error);
        document.getElementById('upload-status').textContent = '❌ Upload failed. Please try again.';

        // Fallback: offer local download
        const url = URL.createObjectURL(videoBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `GeoSonNet_${Date.now()}.webm`;
        document.getElementById('upload-status').innerHTML = `
            Upload failed. <a href="#" id="download-local">Click here to download locally instead</a>
        `;
        document.getElementById('download-local').addEventListener('click', (e) => {
            e.preventDefault();
            a.click();
        });
    }
}

// Setup desktop share buttons
function setupDesktopShareButtons(videoUrl, landingPageUrl) {
    const shareButtons = document.getElementById('share-buttons');
    shareButtons.innerHTML = '';
    shareButtons.style.display = 'flex';

    const platforms = [
        { name: 'Facebook', icon: '📘', url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(landingPageUrl)}` },
        { name: 'X (Twitter)', icon: '✖️', url: `https://twitter.com/intent/tweet?url=${encodeURIComponent(landingPageUrl)}&text=Check%20out%20my%20movement%20sonification%20from%20AGU%202025!` },
        { name: 'LinkedIn', icon: '💼', url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(landingPageUrl)}` },
        { name: 'Download', icon: '⬇️', url: videoUrl, download: true }
    ];

    platforms.forEach(platform => {
        const btn = document.createElement('a');
        btn.href = platform.url;
        btn.target = '_blank';
        btn.className = 'share-platform-btn';
        if (platform.download) {
            btn.download = `GeoSonNet_${Date.now()}.webm`;
        }
        btn.innerHTML = `${platform.icon} ${platform.name}`;
        shareButtons.appendChild(btn);
    });
}

// Setup recording controls
function setupRecordingControls() {
    const recordBtn = document.getElementById('record-btn');
    const closeModal = document.getElementById('close-modal');

    recordBtn.addEventListener('click', async () => {
        if (!recordingState.isRecording) {
            await startRecording();
        } else {
            await stopRecording();
        }
    });

    closeModal.addEventListener('click', () => {
        const modal = document.getElementById('qr-modal');
        modal.classList.remove('show');
    });

    // Preload logos when page loads
    window.addEventListener('load', () => {
        preloadLogos();
    });
}

// ============================================================================
// END VIDEO RECORDING MODULE
// ============================================================================

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        init();
        setupRecordingControls();
    });
} else {
    init();
    setupRecordingControls();
}

