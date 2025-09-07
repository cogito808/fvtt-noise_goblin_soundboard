// scripts/soundboard.js

Hooks.once('init', () => {
  game.settings.register('fvtt-noise_goblin_soundboard', 'soundboardDirectory', {
    name: 'Soundboard Directory',
    hint: 'Path to the folder containing sound files.',
    scope: 'world',
    config: true,
    type: String,
    default: 'assets/sounds'
  });

  game.settings.register('fvtt-noise_goblin_soundboard', 'opacity', {
    name: 'Soundboard Opacity',
    hint: 'Set the opacity of the soundboard window.',
    scope: 'client',
    config: true,
    type: Number,
    default: 1.0
  });

  game.settings.register('fvtt-noise_goblin_soundboard', 'soundboardServerVolume', {
    name: 'Server Volume',
    hint: 'Default volume level for sounds.',
    scope: 'world',
    config: true,
    type: Number,
    default: 1.0
  });
});

export const SoundBoard = {
  sounds: {},
  playingSounds: {},
  targetedPlayerID: null,
  cacheMode: false,
  macroMode: false,
  volumeMode: 'default',
  loopingSounds: {},
  favorites: [],

  async loadSoundsFromDirectory(directoryPath) {
    const filePicker = await foundry.applications.apps.FilePicker.implementation.browse('data', directoryPath);
    const folders = filePicker.dirs;
    const sounds = {};

    for (const folder of folders) {
      const folderPicker = await foundry.applications.apps.FilePicker.implementation.browse('data', folder);
      const files = folderPicker.files.filter(f => f.endsWith('.mp3') || f.endsWith('.ogg') || f.endsWith('.wav'));
      const fileObjects = files.map(f => ({
        name: decodeURIComponent(f.split('/').pop()),
        path: f
      }));
      sounds[folder.split('/').pop()] = fileObjects;
    }

    this.sounds = sounds;
    console.log('Loaded sounds:', this.sounds);
  },

  getSoundFromIdentifyingPath(path) {
    for (const files of Object.values(this.sounds)) {
      const found = files.find(f => f.path === path);
      if (found) return found;
    }
    return null;
  },

  toggleFavorite(path) {
    if (this.favorites.includes(path)) {
      this.favorites = this.favorites.filter(p => p !== path);
    } else {
      this.favorites.push(path);
    }
  }
};