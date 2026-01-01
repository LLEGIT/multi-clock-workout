# Multi-Clock: Minimalist Interval Timer

A "sober," mobile-first web application designed for HIIT, boxing, or series-based workouts. It provides a clean interface for managing Work, Rest, and Cooldown periods with high-contrast visuals and audio cues.

## Features
- **Mobile-First Design**: Large touch targets and high-visibility typography.
- **Custom Series Logic**: Set your repetitions, work duration, rest time, and an optional final cooldown.
- **Web Audio API Integration**: Uses browser-generated tones (no MP3 files required) for zero-latency feedback.
- **Smart Audio Cues**:
  - **Warning**: High-pitched beeps during the last 3 seconds of any phase.
  - **Transition**: A distinct tone when a phase reaches zero.
  - **Completion**: A multi-tone sequence when the entire workout is finished.
- **Native Implementation**: Built with Vanilla JS, HTML5, and CSS3. No frameworks, no bloat.

## How to Use
1. Open the app in any modern mobile or desktop browser.
2. Use the **+** and **-** buttons to configure your session.
3. Tap **START**. 
4. The screen will display the current phase (Work/Rest) and the time remaining.
5. Follow the audio cues to switch between exercises and rest.

## 🛠 Technical Details
- **Hide Native Controls**: Uses CSS `appearance: textfield` to remove default browser number input spinners for a cleaner UI.
- **Audio Engine**: Utilizes an `OscillatorNode` with a `GainNode` (envelope) to prevent clicking sounds and ensure the beeps are crisp.

## License
MIT - Use it, modify it, make it yours.
