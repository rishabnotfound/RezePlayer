<p align="center">
      <img
        src="./logo.png"
        width="200"
        height="200"
      />
    </p>

# <p align="center">RezePlayer</p>

A standalone HLS/MP4 video player with subtitle support, watch party, and Chromecast. Built with React.

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
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/rezeplayer@1.1.4/dist/assets/style.css">

<!-- Include JS -->
<script src="https://cdn.jsdelivr.net/npm/rezeplayer@1.1.4/dist/rezeplayer.iife.js"></script>
```

### 2. Add Container

```html
<div id="player"></div>
```

### 3. Initialize Player

```javascript
RezePlayer.make('#player', {
  title: 'My Video',
  servers: [
    {
      name: 'Server 1',
      url: 'https://example.com/video.m3u8',
      type: 'hls'
    },
    {
      name: 'Server 2',
      url: 'https://example.com/video.mp4',
      type: 'mp4'
    }
  ],
  subtitles: [
    {
      name: 'English',
      language: 'en',
      src: 'https://example.com/subtitles-en.srt',
      default: true
    }
  ],
  autoPlay: true,
  volume: 1,
  startTime: 0,
  enableWatchParty: true
});
```

## Full Example

```html
<!DOCTYPE html>
<html lang="en" dir="ltr" data-full> <!--VERY IMPORTANT -->
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover, maximum-scale=1.0, user-scalable=no" />
  <title>RezePlayer Example</title>

  <!-- Include RezePlayer CSS -->
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/rezeplayer@1.1.4/dist/assets/style.css">
</head>
<body>
  <div id="root"></div>

  <!-- Include RezePlayer JS -->
  <script src="https://cdn.jsdelivr.net/npm/rezeplayer@1.1.4/dist/rezeplayer.iife.js"></script>

  <script>
    RezePlayer.make('#root', {
      title: 'Reze Player',
      servers: [
        {
          name: 'Comet',
          url: 'https://artplayer.org/assets/sample/video.mp4',
          type: 'mp4'
        },
        {
          name: 'Star',
          url: 'https://content.jwplatform.com/manifests/yp34SRmf.m3u8',
          type: 'hls'
        }
      ],
      subtitles: [
        {
          name: 'Japanese',
          language: 'ja',
          src: 'https://artplayer.org/assets/sample/subtitle.jp.srt',
          default: true
        },
        {
          name: 'Chinese',
          language: 'zh',
          src: 'https://artplayer.org/assets/sample/subtitle.cn.srt'
        }
      ],
      autoPlay: true,
      volume: 1,
      startTime: 0,
      enableWatchParty: true
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
