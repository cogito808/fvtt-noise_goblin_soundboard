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

  game.settings.register('fvtt-noise_goblin_soundboard', 'collapsedFolders', {
    name: 'Collapsed Folders',
    hint: 'Tracks which folders are collapsed.',
    scope: 'client',
    config: false,
    type: Object,
    default: {}
  });

  game.settings.register('fvtt-noise_goblin_soundboard', 'favorites', {
    name: 'Soundboard Favorites',
    hint: 'Persisted list of favorite sound paths for this client.',
    scope: 'client',
    config: false,
    type: Object,
    default: []
  });

  game.settings.register('fvtt-noise_goblin_soundboard', 'windowPosition', {
    name: 'Soundboard Window Position',
    hint: 'Remembers the last window size and position.',
    scope: 'client',
    config: false,
    type: Object,
    default: { left: 100, top: 100, width: 1000, height: 740 }
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
  collapsedFolders: {},

  loadFavorites() {
    try {
      this.favorites = game.settings.get('fvtt-noise_goblin_soundboard', 'favorites') || [];
    } catch (err) {
      this.favorites = [];
    }
  },

  saveFavorites() {
    try {
      game.settings.set('fvtt-noise_goblin_soundboard', 'favorites', this.favorites || []);
    } catch (err) {
      console.warn('Failed to save favorites', err);
    }
  },

  isFavorite(path) {
    return (this.favorites || []).includes(path);
  },

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
    if (!path) return;
    if (this.favorites.includes(path)) {
      this.favorites = this.favorites.filter(p => p !== path);
    } else {
      this.favorites.push(path);
    }
    this.saveFavorites();
  },

  toggleFolderCollapse(folderName) {
    this.collapsedFolders[folderName] = !this.collapsedFolders[folderName];
    game.settings.set('fvtt-noise_goblin_soundboard', 'collapsedFolders', this.collapsedFolders);
  },

  isFolderCollapsed(folderName) {
    return this.collapsedFolders[folderName];
  },

  loadCollapseState() {
    this.collapsedFolders = game.settings.get('fvtt-noise_goblin_soundboard', 'collapsedFolders') || {};
  },

  collapseAllFolders() {
    for (const folder of Object.keys(this.sounds)) {
      this.collapsedFolders[folder] = true;
    }
    game.settings.set('fvtt-noise_goblin_soundboard', 'collapsedFolders', this.collapsedFolders);
  },

  expandAllFolders() {
    for (const folder of Object.keys(this.sounds)) {
      this.collapsedFolders[folder] = false;
    }
    game.settings.set('fvtt-noise_goblin_soundboard', 'collapsedFolders', this.collapsedFolders);
  }
};