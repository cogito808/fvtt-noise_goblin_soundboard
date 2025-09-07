// scripts/soundboard.js

export const SoundBoard = {
  sounds: {},
  playingSounds: {},
  targetedPlayerID: null,
  cacheMode: false,
  macroMode: false,
  volumeMode: 'default',

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
  },

  getSoundFromIdentifyingPath(path) {
    for (const files of Object.values(this.sounds)) {
      const found = files.find(f => f.path === path);
      if (found) return found;
    }
    return null;
  }
};