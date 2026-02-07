# 🔊 Noise Goblin Soundboard

A feature-rich (i.e. vibe coded) soundboard module for Foundry VTT v13. Organize and play sounds to please or annoy your players with favorites, looping, and an intuitive tabbed interface.

## Features

✨ **Favorites System** - Save your frequently used sounds to a dedicated favorites tab
🎵 **Sound Management** - Browse and organize sounds by category/folder
🔁 **Loop Control** - Toggle looping on any sound with visual feedback
⭐ **Favorite Toggle** - Mark/unmark sounds as favorites with instant
⚡ **Macro Support** - Included macros for quick access to Favorites or All Sounds tabs

**Installation-Path to json:** "https://raw.githubusercontent.com/cogito808/fvtt-noise_goblin_soundboard/main/module.json"

## Configuration

### Module Settings

**Soundboard Directory**
- Set the path to your sound files folder
- Default: `assets/sounds`
- Create subdirectories to organize sounds by category

**Soundboard Opacity**
- Adjust window transparency (0.0 - 1.0)
- Default: 1.0 (fully opaque)

**Server Volume**
- Default volume level for all sounds
- Default: 1.0 (100%)

### Opening the Soundboard

Two ready-to-use macros are included in the module folder:

#### 🔊 Soundboard All Sounds
Opens the soundboard to the All Sounds tab showing your complete sound library.
```javascript
const app = new SoundBoardApplication();
app.activeTab = 'main';
await app.render(true);
```

#### ⭐ Soundboard Favorites
Opens the soundboard directly to the Favorites tab showing only your favorited sounds.
```javascript
const app = new SoundBoardApplication();
app.activeTab = 'favorites';
await app.render(true);
```

## Credits
- Original Author: BlitzKraig - For the original [fvtt-SoundBoard](https://github.com/BlitzKraig/fvtt-SoundBoard) that inspired this module.
- License: Please refer to the module's license file for licensing information.
- Current Development: Probably not..
- Support & Feedback: Unlikely.
