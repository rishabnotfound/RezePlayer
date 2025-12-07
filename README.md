<p align="center">
      <img
        src="./public/logo.png"
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

## Quick Start

### 1. Include CSS and JS

```html
<!-- Include CSS -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/rezeplayer@1.1.9/dist/assets/style.css">

<!-- Include JS -->
<script src="https://cdn.jsdelivr.net/npm/rezeplayer@1.1.9/dist/rezeplayer.iife.js"></script>
```

### 2. Add Container

```html
<div id="player"></div>
```

### 3. Initialize Player

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
  enableWatchParty: true //default is true
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
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/rezeplayer@1.1.9/dist/assets/style.css">
</head>
<body>
  <div id="root"></div>

  <!-- Include RezePlayer JS -->
  <script src="https://cdn.jsdelivr.net/npm/rezeplayer@1.1.9/dist/rezeplayer.iife.js"></script>

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
      autoPlay: true, //depends on browser 
      volume: 1, //range is from 0 to 1 it can be float too
      startTime: 0, //time is in seconds
      enableWatchParty: true //default is true
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
  language: string;    // Language code (e.g., "en", "ja", "zh")
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

// Cleanup
player.destroy();        // Remove player
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

## NPM Usage

```bash
npm install rezeplayer
```

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

MIT

## Credits

Built by [rishabnotfound](https://github.com/rishabnotfound)

Based on [sudo-flix](https://github.com/sussy-code/smov)
