// scripts/soundboard-app.js

import { SoundBoard } from './soundboard.js';

class SoundBoardApplication extends Application {
  static get defaultOptions() {
    const options = super.defaultOptions;
    options.title = `🔊${game.i18n.localize('SOUNDBOARD.app.title')}`;
    options.id = 'soundboard-app';
    options.template = 'modules/fvtt-noise_goblin_soundboard/templates/soundboard.html';
    options.resizable = true;
    return options;
  }

  async render(force = false, options = {}) {
    await SoundBoard.loadSoundsFromDirectory(game.settings.get('fvtt-noise_goblin_soundboard', 'soundboardDirectory'));
    await super.render(force, options);
    Hooks.once('renderSoundBoardApplication', async (app, html) => {
      const opacity = game.settings.get('fvtt-noise_goblin_soundboard', 'opacity');
      html.css('opacity', opacity);

      html.find('.sb-stop-button').on('click', function () {
        const path = $(this).data('path');
        const sound = SoundBoard.playingSounds?.[path];
        if (sound && typeof sound.stop === 'function') {
          sound.stop();
          delete SoundBoard.playingSounds[path];
        } else {
          console.warn(`No valid sound instance found for path: ${path}`);
        }
      });

      html.find('.sb-play-button').on('click', async function () {
        const path = $(this).data('path');
        const loop = SoundBoard.loopingSounds?.[path] ?? false;
        const sound = await foundry.audio.AudioHelper.play({src: path, volume: 1.0, autoplay: true, loop}, true);
        SoundBoard.playingSounds[path] = sound;
      });

      html.find('.sb-loop-toggle').each(function () {
        const button = $(this);
        const path = button.data('path');

        button.on('click', async function () {
          console.log('Loop toggle clicked for path:', path);

          if (!path) {
            ui.notifications.warn("No valid sound path found for loop toggle.");
            return;
          }

          const current = SoundBoard.loopingSounds?.[path] ?? false;
          const newLoopState = !current;
          SoundBoard.loopingSounds[path] = newLoopState;

          // Update button UI
          button.toggleClass('active', newLoopState);

          // Stop current sound if playing
          const currentSound = SoundBoard.playingSounds?.[path];
          if (currentSound && typeof currentSound.stop === 'function') {
            currentSound.stop();
            delete SoundBoard.playingSounds[path];
          }

          // Replay with new loop state
          const newSound = await foundry.audio.AudioHelper.play({
            src: path,
            volume: 1.0,
            autoplay: true,
            loop: newLoopState
          }, true);

          SoundBoard.playingSounds[path] = newSound;
        });
      });
    });
  }

  getData() {
    const sounds = [];
    let totalCount = 0;
    for (const [key, files] of Object.entries(SoundBoard.sounds)) {
      totalCount += files.length;
      if (files.length > 0) {
        sounds.push({
          categoryName: key,
          length: files.length,
          files
        });
      }
    }

    const volume = game.settings.get('fvtt-noise_goblin_soundboard', 'soundboardServerVolume');
    const collapse = totalCount > 2000;
    const players = game.users.filter(u => u.active && !u.isGM).map(u => ({
      name: u.name,
      id: u.id,
      isTarget: u.id === SoundBoard.targetedPlayerID
    }));

    const isExampleAudio = game.settings.get('fvtt-noise_goblin_soundboard', 'soundboardDirectory') === game.settings.settings.get('fvtt-noise_goblin_soundboard.soundboardDirectory').default;

    return {
      tab: { main: true },
      sounds,
      volume,
      totalCount,
      collapse,
      players,
      targetedPlayer: SoundBoard.targetedPlayerID,
      cacheMode: SoundBoard.cacheMode,
      macroMode: SoundBoard.macroMode,
      volumeMode: SoundBoard.volumeMode,
      isExampleAudio
    };
  }
} 

window.SoundBoardApplication = SoundBoardApplication;

Hooks.once('init', () => {
  game.settings.register('fvtt-noise_goblin_soundboard', 'soundboardServerVolume', {
    name: 'Server Volume',
    hint: 'Default volume level for sounds played from the server.',
    scope: 'world',
    config: false,
    type: Number,
    default: 0.8
  });

  game.settings.register('fvtt-noise_goblin_soundboard', 'soundboardDirectory', {
    name: 'Soundboard Directory',
    hint: 'Path to the folder containing sound files.',
    scope: 'world',
    config: true,
    type: String,
    default: 'modules/fvtt-noise_goblin_soundboard/assets/sounds'
  });

  game.settings.register('fvtt-noise_goblin_soundboard', 'opacity', {
    name: 'Soundboard Opacity',
    hint: 'Opacity level for the soundboard UI.',
    scope: 'world',
    config: true,
    type: Number,
    default: 1.0
  });

  game.soundboardApp = new SoundBoardApplication();
});

Hooks.once('ready', () => {
  // Remove auto-render on ready
  // game.soundboardApp.render(true);
});

// Macro to open the soundboard manually
// You can paste this into a macro and run it to open the soundboard
if (!game.soundboardApp) {
  game.soundboardApp = new SoundBoardApplication();
}
game.soundboardApp.render(true);