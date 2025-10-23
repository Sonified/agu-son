# Agu-Son 🎵

**Movement Sonification Interactive**

An interactive web-based audio-visual installation that transforms your movements into music. Using your camera as input, Agu-Son detects motion and maps it to a musical grid where each cell plays a different note from the C-major scale with wind chime-like sounds.

## Features

- 🎥 **Camera-based motion detection** - Your movements trigger the music
- 🎹 **4x4 Musical grid** - Each cell plays a unique note from the C-major scale
- 🎨 **Beautiful visual feedback** - Colorful grid that lights up with motion
- 🔔 **Wind chime sounds** - Ethereal, bell-like tones created with FM synthesis
- ⚙️ **Customizable settings** - Adjust motion sensitivity and visual opacity
- 🪞 **Mirrored video** - Intuitive left-right correspondence

## How It Works

The grid layout maps notes as follows (from bottom-left to top-right):

```
[A4] [B4] [C5] [D5]
[D4] [E4] [F4] [G4]
[G3] [A3] [B3] [C4]
[C3] [D3] [E3] [F3]  <- Bottom row starts here
```

When motion is detected in a grid cell, it:
1. Lights up with a vibrant color
2. Plays the corresponding note with a wind chime-like sound
3. Gradually fades out over time

## Installation & Usage

1. **Clone the repository:**
   ```bash
   git clone https://github.com/robertalexander/agu-son.git
   cd agu-son
   ```

2. **Run a local server:**
   ```bash
   # Using Python 3
   python -m http.server 8000
   
   # Or using Node.js
   npx http-server
   ```

3. **Open in browser:**
   Navigate to `http://localhost:8000` in a modern web browser (Chrome, Firefox, Safari, or Edge)

4. **Grant camera permissions** when prompted

5. **Click "Start"** and start moving!

## Controls

- **Start/Stop Button** - Begin or pause the experience
- **Motion Sensitivity** - Adjust how much movement is needed to trigger sounds
- **Grid Opacity** - Control the visibility of the colored grid overlay
- **Video Opacity** - Adjust the transparency of the camera feed (default 30%)

## Technologies Used

- **HTML5 Canvas** - For rendering the grid and visual feedback
- **Web Audio API** via [Tone.js](https://tonejs.github.io/) - For wind chime-like sounds
- **getUserMedia API** - For camera access
- **Pure JavaScript** - No build tools required

## Browser Requirements

- Modern browser with WebRTC support (Chrome 53+, Firefox 38+, Safari 11+, Edge 79+)
- Camera/webcam access
- JavaScript enabled

## Project Structure

```
agu-son/
├── index.html      # Main HTML structure
├── styles.css      # Styling and layout
├── app.js          # Core application logic
└── README.md       # This file
```

## Future Enhancements

- [ ] Variable grid sizes (8x8, 16x16)
- [ ] Different musical scales (minor, pentatonic, etc.)
- [ ] Recording and playback functionality
- [ ] Multiple sound profiles (piano, strings, percussion)
- [ ] Mobile device support with touch input
- [ ] Save/load preset configurations

## License

MIT License - Feel free to use and modify for your own projects!

## Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.

---

**Created with ❤️ for the joy of interactive music-making**

