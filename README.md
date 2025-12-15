<p align="center">
      <img
        src="https://rezeplayer.vercel.app/logo.png"
        width="200"
        height="200"
      />
    </p>

# <p align="center">RezePlayer</p>

A standalone HLS/MP4 video player with subtitle support, watch party, Chromecast and Automatic Thumbnails generation. Built with React.

## Features

- 🎥 **Multiple Sources** - Support for HLS and MP4 with server switching
- 📝 **Subtitles** - Multi-language subtitle support (SRT/VTT)
- 🎨 **Beautiful UI** - Modern, responsive player interface
- 👥 **Watch Party** - Synchronized viewing with friends
- 📺 **Chromecast** - Cast to any Chromecast device
- ⚡ **Fast & Lightweight** - Optimized for performance
- 📱 **Mobile Friendly** - Touch controls and responsive design

## Preview

<p align="center">
    <img src="https://rezeplayer.vercel.app/preview.png" width="900" height="400" />
</p>

## Quick Start

### 1. Full Page Mode IMPORTANT
For a clean, full-page player experience, add the data-full attribute to your root html tag, or else player styling will be broken cuz of tailwind limitation of preflight lmao
```html
<html lang="en" data-full>
```

### 2. Include CSS and JS

```html
<!-- Include CSS -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/rezeplayer@1.1.14/dist/assets/style.css">

<!-- Include JS -->
<script src="https://cdn.jsdelivr.net/npm/rezeplayer@1.1.14/dist/rezeplayer.iife.js"></script>
```

### 3. Add Container

```html
<div id="player"></div>
```

### 4. Initialize Player

```javascript
RezePlayer.make('#player', {
  title: 'Testing',
  servers: [
    {
      name: 'Server 1',
      url: 'https://rezeplayer.vercel.app/reze/hls/master.m3u8',
      type: 'hls'
    },
    {
      name: 'Server 2',
      url: 'https://rezeplayer.vercel.app/reze/mp4/trailer.mp4',
      type: 'mp4'
    }
  ],
  subtitles: [
    {
      name: 'English',
      flagsapi: 'https://flagsapi.com/US/flat/64.png', //optional
      src: 'https://rezeplayer.vercel.app/reze/subs/eng.vtt',
      default: true //optional
    }
  ],
  autoPlay: true, //depends on browser policies
  volume: 1, //range is 0 to 1
  startTime: 0, //start position in seconds
  enableWatchParty: true, //default is true
  themeSettings: true, //default is true
  themeColor: '8652bb', //default is 8652bb
  thumbsGenerate: true, //default is true
  thumbsInterval: 10000 //thumbnail generation interval in ms (default: 10000 = 10s)
});
```

# NPM USAGE

### INSTALLATION
```bash
npm install rezeplayer
```

### IMPORT AND INITIALIZE
```javascript
import { make } from 'rezeplayer';
import 'rezeplayer/dist/assets/style.css';

const player = make('#player', {
  servers: [
    {
      name: 'Server 1',
      url: 'https://example.com/video.m3u8',
      type: 'hls'
    }
  ]
});
```
## Full Example

```html
<!DOCTYPE html>
<html lang="en" dir="ltr" data-full> <!--VERY IMPORTANT TO INCLUDE 
                                    OR ELSE STYLING WILL BE BROKEN-->
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover, maximum-scale=1.0, user-scalable=no" />
  <title>RezePlayer Example</title>

  <!-- Include RezePlayer CSS -->
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/rezeplayer@1.1.14/dist/assets/style.css">
</head>
<body>
  <div id="root"></div>

  <!-- Include RezePlayer JS -->
  <script src="https://cdn.jsdelivr.net/npm/rezeplayer@1.1.14/dist/rezeplayer.iife.js"></script>

  <script>
    RezePlayer.make('#root', {
      title: 'Reze Player',
      servers: [
        {
          name: 'HLS Sample',
          url: 'https://rezeplayer.vercel.app/reze/hls/master.m3u8',
          type: 'hls'
        },
        {
          name: 'MP4 Sample',
          url: 'https://rezeplayer.vercel.app/reze/mp4/trailer.mp4',
          type: 'mp4'
        }
      ],
      subtitles: [
        {
          name: 'Japanese',
          flagsapi: 'https://flagsapi.com/JP/flat/64.png', //optional prop
          src: 'https://rezeplayer.vercel.app/reze/subs/ja.vtt',
          default: true
        },
        {
          name: 'English',
          flagsapi: 'https://flagsapi.com/US/flat/64.png', 
          src: 'https://rezeplayer.vercel.app/reze/subs/eng.vtt',
        },
        {
          name: 'French',
          flagsapi: 'https://flagsapi.com/FR/flat/64.png',
          src: 'https://rezeplayer.vercel.app/reze/subs/french.vtt',
        },
        {
          name: 'Russian',
          flagsapi: 'https://flagsapi.com/RU/flat/64.png',
          src: 'https://rezeplayer.vercel.app/reze/subs/russian.vtt',
        },
        {
          name: 'Korean',
          flagsapi: 'https://flagsapi.com/KP/flat/64.png',
          src: 'https://rezeplayer.vercel.app/reze/subs/koreon.vtt',
        },
        {
          name: 'Chinese',
          flagsapi: 'https://flagsapi.com/CN/flat/64.png',
          src: 'https://rezeplayer.vercel.app/reze/subs/chinese.vtt',
        },
        {
          name: 'Arabic',
          flagsapi: 'https://flagsapi.com/SA/flat/64.png',
          src: 'https://rezeplayer.vercel.app/reze/subs/arabic.vtt',
        }
      ],
      posterUrl: 'https://rezeplayer.vercel.app/reze/poster.png', //optional
      autoPlay: true, //depends on browser
      volume: 1, //range is from 0 to 1 it can be float too
      startTime: 0, //time is in seconds
      enableWatchParty: true, //default is true
      enableCast: true, //default is true
      thumbsGenerate: true, //default is true
      themeSettings: true, //default is true
      themeColor: '8652bb', //default is 8652bb
      thumbsInterval: 10000 //thumbnail generation interval in ms (default: 10000 = 10s)
    });
  </script>
</body>
</html>
```

## API Reference

### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `servers` | `Array` | **required** | List of video sources |
| `title` | `String` | `'Reze Player'` | Video title |
| `subtitles` | `Array` | `[]` | Subtitle tracks |
| `autoPlay` | `Boolean` | `true` | Auto-play on load |
| `volume` | `Number` | `1` | Initial volume (0-1) |
| `startTime` | `Number` | `0` | Start position in seconds |
| `enableWatchParty` | `Boolean` | `true` | Enable watch party feature |
| `enableCast` | `Boolean` | `true` | Enable Chromecast feature |
| `posterUrl` | `String` | `undefined` | Poster image URL to display before video plays |
| `themeSettings` | `Boolean` | `true` | Toggle Appearance Settings to adjust look of the player |
| `themeColor` | `String` | `undefined` | Custom theme color (hex without #, e.g., "e01621") for progress bars, switches, and checkmarks |
| `thumbsGenerate` | `Boolean` | `true` | Switch to toggle auto generation of thumbnails |
| `thumbsInterval` | `Number` | `10000` | Thumbnail generation interval in milliseconds (e.g., 10000 = 10 seconds) (WILL ADVICE U TO KEEP THE THUMB INTERVAL 10s OR HIGHER TO AVOID PERFORMANCE ISSUES) |

### Server Object

```typescript
{
  name: string;        // Display name (e.g., "Server 1")
  url: string;         // Video URL
  type?: 'hls' | 'mp4' // Stream type (auto-detected if not specified)
}
```

### Subtitle Object

```typescript
{
  name: string;        // Display name (e.g., "English")
  flagsapi: string;    // flagsapi url to display the flag icon of the subtitle (TOTALLY OPTIONAL)
  src: string;         // Subtitle file URL (SRT or VTT)
  default?: boolean    // Set as default subtitle
}
```

### Player Methods

```javascript
const player = RezePlayer.make('#player', options);

// Playback control
player.play();           // Play video
player.pause();          // Pause video

// Seek
player.seek(120);        // Seek to 2 minutes

// Volume
player.setVolume(0.5);   // Set 50% volume

// Time tracking
const currentTime = player.getCurrentTime();  // Get current playback time in seconds
const duration = player.getDuration();        // Get total video duration in seconds

// Event listeners
player.on('timeupdate', (data) => {
  console.log('Current time:', data.currentTime);
  console.log('Duration:', data.duration);
});

player.on('durationchange', (data) => {
  console.log('Duration changed:', data.duration);
});

// Remove event listener
const timeHandler = (data) => console.log(data.currentTime);
player.on('timeupdate', timeHandler);
player.off('timeupdate', timeHandler);  // Remove specific listener

// Cleanup
player.destroy();        // Remove player and all event listeners
```

### Event Listeners

| Event | Description | Data |
|-------|-------------|------|
| `timeupdate` | Fired when playback time changes | `{ currentTime: number, duration: number }` |
| `durationchange` | Fired when video duration is determined | `{ currentTime: number, duration: number }` |

### Complete Example with Time Tracking

```javascript
const player = RezePlayer.make('#player', {
  title: 'My Video',
  servers: [
    {
      name: 'Server 1',
      url: 'https://rezeplayer.vercel.app/reze/hls/master.m3u8',
      type: 'hls'
    }
  ],
  posterUrl: 'https://rezeplayer.vercel.app/reze/poster.png'  // Optional poster image
});

// Time tracking - Log every 1 second to avoid spam
let lastLogTime = 0;
player.on('timeupdate', ({ currentTime, duration }) => {
  // Only log once per second
  if (Math.floor(currentTime) !== lastLogTime) {
    lastLogTime = Math.floor(currentTime);
    const progress = (currentTime / duration) * 100;
    console.log(`[RezePlayer Time Tracking]`);
    console.log(`  Current Time: ${formatTime(currentTime)}`);
    console.log(`  Duration: ${formatTime(duration)}`);
    console.log(`  Progress: ${progress.toFixed(2)}%`);
  }
});

// Log when duration changes (video loaded)
player.on('durationchange', ({ currentTime, duration }) => {
  console.log(`[RezePlayer Duration Change]`);
  console.log(`  Video Duration: ${formatTime(duration)}`);
  console.log(`  Current Time: ${formatTime(currentTime)}`);
});

// Helper function to format time
function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}
```

## Full Page Mode

For a full-page player, add `data-full` attribute to your HTML tag:

```html
<html lang="en" dir="ltr" data-full> 
```

This applies full-page styling (no scrolling, full viewport height).

## Embedded Mode

For embedded use on existing pages, just use a regular container:

```html
<div id="player" style="width: 100%; height: 500px;"></div>
<script>
  RezePlayer.make('#player', { /* options */ });
</script>
```

The player uses scoped CSS to avoid conflicts with your page styles.

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Development

```bash
# Install dependencies
npm install

# Dev server
npm run dev

# Build
npm run build

# Preview build
npm run preview
```

## License

[MIT](LICENSE)

## Credits

Built by [rishabnotfound](https://github.com/rishabnotfound)

Based on [sudo-flix](https://github.com/sussy-code/smov)
