// Agu-Son - Movement Sonification Interactive
// Version: v1.02

console.log('🎵 Agu-Son v1.02 - Movement Sonification Interactive');
console.log('v1.02 Enhancement: Increased brightness response and added glow effects for better visual feedback');
console.log('Initialize application');

// Configuration
const CONFIG = {
    gridSize: 4,
    canvasSize: 640,
    motionThreshold: 20,
    cellDecayRate: 0.95,
    minCellIntensity: 0.1,
    videoOpacity: 0.3,
    warmupDuration: 500 // milliseconds to ignore sounds on startup
};

// C Major Scale notes (4 octaves to fill 4x4 grid)
// Starting from C3, going up
const NOTES = [
    ['C3', 'D3', 'E3', 'F3'],
    ['G3', 'A3', 'B3', 'C4'],
    ['D4', 'E4', 'F4', 'G4'],
    ['A4', 'B4', 'C5', 'D5']
];

// Color palette for the grid (using complementary colors)
const COLORS = [
    ['#FF6B6B', '#FFA07A', '#FFD93D', '#A8E6CF'],
    ['#B8E0D2', '#95E1D3', '#6BCF9D', '#4ECDC4'],
    ['#45B7D1', '#5F9DF7', '#8E7CC3', '#A78BFA'],
    ['#C084FC', '#E879F9', '#F472B6', '#FB7185']
];

// Application State
const state = {
    isRunning: false,
    video: null,
    gridCanvas: null,
    gridCtx: null,
    motionCanvas: null,
    motionCtx: null,
    previousFrame: null,
    cellIntensities: Array(CONFIG.gridSize).fill(0).map(() => Array(CONFIG.gridSize).fill(0)),
    synth: null,
    initialized: false,
    warmupEndTime: null
};

// Initialize the application
function init() {
    state.video = document.getElementById('video');
    state.gridCanvas = document.getElementById('grid-canvas');
    state.gridCtx = state.gridCanvas.getContext('2d');
    state.motionCanvas = document.getElementById('motion-canvas');
    state.motionCtx = state.motionCanvas.getContext('2d');
    
    // Set canvas sizes
    state.gridCanvas.width = CONFIG.canvasSize;
    state.gridCanvas.height = CONFIG.canvasSize;
    state.motionCanvas.width = CONFIG.canvasSize;
    state.motionCanvas.height = CONFIG.canvasSize;
    
    // Setup controls
    setupControls();
    
    // Setup audio
    setupAudio();
    
    // Draw initial grid
    drawGrid();
    
    state.initialized = true;
    console.log('✓ Application initialized');
}

// Setup audio using Tone.js for wind chime-like sounds
function setupAudio() {
    // Create a synth with a bell-like, wind chime quality
    state.synth = new Tone.PolySynth(Tone.FMSynth, {
        harmonicity: 8,
        modulationIndex: 2,
        oscillator: {
            type: "sine"
        },
        envelope: {
            attack: 0.001,
            decay: 2,
            sustain: 0.1,
            release: 3
        },
        modulation: {
            type: "square"
        },
        modulationEnvelope: {
            attack: 0.002,
            decay: 0.2,
            sustain: 0,
            release: 0.2
        }
    }).toDestination();
    
    // Add reverb for that spacious wind chime feel
    const reverb = new Tone.Reverb({
        decay: 4,
        preDelay: 0.01
    }).toDestination();
    
    state.synth.connect(reverb);
    
    console.log('✓ Audio system initialized');
}

// Setup UI controls
function setupControls() {
    const startBtn = document.getElementById('start-btn');
    const sensitivitySlider = document.getElementById('sensitivity');
    const sensitivityValue = document.getElementById('sensitivity-value');
    const gridOpacitySlider = document.getElementById('grid-opacity');
    const gridOpacityValue = document.getElementById('grid-opacity-value');
    const videoOpacitySlider = document.getElementById('video-opacity');
    const videoOpacityValue = document.getElementById('video-opacity-value');
    
    startBtn.addEventListener('click', toggleRunning);
    
    sensitivitySlider.addEventListener('input', (e) => {
        CONFIG.motionThreshold = e.target.value;
        sensitivityValue.textContent = e.target.value;
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
}

// Start/stop the application
async function toggleRunning() {
    const startBtn = document.getElementById('start-btn');
    const status = document.getElementById('status');
    
    if (!state.isRunning) {
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
            
            // Start Tone.js audio context
            await Tone.start();
            
            // Set warmup end time to prevent initial "big bang"
            state.warmupEndTime = Date.now() + CONFIG.warmupDuration;
            
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
        status.textContent = 'Stopped';
        
        console.log('✓ Camera stopped');
    }
}

// Main update loop
function update() {
    if (!state.isRunning) return;
    
    // Detect motion
    detectMotion();
    
    // Update cell intensities (decay over time)
    updateCellIntensities();
    
    // Draw the grid
    drawGrid();
    
    // Continue the loop
    requestAnimationFrame(update);
}

// Detect motion in the video feed
function detectMotion() {
    // Draw current frame to motion canvas (mirrored)
    state.motionCtx.save();
    state.motionCtx.scale(-1, 1);
    state.motionCtx.drawImage(state.video, -CONFIG.canvasSize, 0, CONFIG.canvasSize, CONFIG.canvasSize);
    state.motionCtx.restore();
    
    const currentFrame = state.motionCtx.getImageData(0, 0, CONFIG.canvasSize, CONFIG.canvasSize);
    
    if (state.previousFrame) {
        // Calculate motion for each grid cell
        const cellSize = CONFIG.canvasSize / CONFIG.gridSize;
        
        for (let row = 0; row < CONFIG.gridSize; row++) {
            for (let col = 0; col < CONFIG.gridSize; col++) {
                const motion = calculateCellMotion(
                    currentFrame,
                    state.previousFrame,
                    col * cellSize,
                    row * cellSize,
                    cellSize
                );
                
                // If motion exceeds threshold, trigger the cell
                if (motion > CONFIG.motionThreshold) {
                    triggerCell(row, col, motion);
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
    
    for (let py = y; py < y + size; py++) {
        for (let px = x; px < x + size; px++) {
            const index = (py * CONFIG.canvasSize + px) * 4;
            
            const rDiff = Math.abs(currentFrame.data[index] - previousFrame.data[index]);
            const gDiff = Math.abs(currentFrame.data[index + 1] - previousFrame.data[index + 1]);
            const bDiff = Math.abs(currentFrame.data[index + 2] - previousFrame.data[index + 2]);
            
            totalMotion += (rDiff + gDiff + bDiff) / 3;
            pixelCount++;
        }
    }
    
    return totalMotion / pixelCount;
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
    const velocity = 0.3 + (normalizedIntensity * 0.7);
    state.synth.triggerAttackRelease(note, "2n", undefined, velocity);
}

// Update cell intensities (decay over time)
function updateCellIntensities() {
    for (let row = 0; row < CONFIG.gridSize; row++) {
        for (let col = 0; col < CONFIG.gridSize; col++) {
            state.cellIntensities[row][col] *= CONFIG.cellDecayRate;
            
            // Reset to 0 if below minimum
            if (state.cellIntensities[row][col] < CONFIG.minCellIntensity) {
                state.cellIntensities[row][col] = 0;
            }
        }
    }
}

// Draw the grid
function drawGrid() {
    const ctx = state.gridCtx;
    const cellSize = CONFIG.canvasSize / CONFIG.gridSize;
    
    // Clear canvas
    ctx.clearRect(0, 0, CONFIG.canvasSize, CONFIG.canvasSize);
    
    // Draw cells
    for (let row = 0; row < CONFIG.gridSize; row++) {
        for (let col = 0; col < CONFIG.gridSize; col++) {
            const x = col * cellSize;
            const y = row * cellSize;
            const intensity = state.cellIntensities[row][col];
            
            // Get color for this cell (flip row for bottom-up layout)
            const colorRow = CONFIG.gridSize - 1 - row;
            const color = COLORS[colorRow][col];
            
            // Add glow effect when cells are active
            if (intensity > 0.1) {
                ctx.shadowBlur = 30 * intensity;
                ctx.shadowColor = color;
            } else {
                ctx.shadowBlur = 0;
            }
            
            // Draw cell background with intensity-based alpha (increased from 0.8 to full opacity)
            ctx.fillStyle = hexToRgba(color, intensity);
            ctx.fillRect(x, y, cellSize, cellSize);
            
            // Reset shadow for border
            ctx.shadowBlur = 0;
            
            // Draw cell border (brighter when active)
            const borderOpacity = 0.3 + (intensity * 0.5);
            ctx.strokeStyle = `rgba(255, 255, 255, ${borderOpacity})`;
            ctx.lineWidth = 2;
            ctx.strokeRect(x, y, cellSize, cellSize);
            
            // Draw note label (brighter when active)
            const noteRow = CONFIG.gridSize - 1 - row;
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

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

