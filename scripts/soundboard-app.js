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

      html.find('.sb-options-toggle').on('click', function () {
        SoundBoardApplication.toggleExtendedOptions(this, $(this).data('path'));
      });

      html.find('.sb-play-button').on('click', function () {
        const path = $(this).data('path');
        foundry.audio.AudioHelper.play({src: path, volume: 1.0, autoplay: true, loop: false}, true);
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

  static async toggleExtendedOptions(element, identifyingPath, favTab) {
    if (!identifyingPath) return;
    const container = $(element).closest('.sb-sound-container');
    const existing = container.find('.sb-extended-option-container');

    if (existing.length > 0) {
      existing.fadeOut(300, function () {
        $(this).remove();
      });
      return;
    }

    const sound = SoundBoard.getSoundFromIdentifyingPath(identifyingPath);
    const context = {
      identifyingPath,
      loopClass: '',
      loopFn: '',
      star: 'far fa-star',
      favoriteFn: '',
      delayValue: 0,
      delayClass: 'hidden',
      removeFavFn: ''
    };

    const html = await foundry.applications.handlebars.renderTemplate('modules/fvtt-noise_goblin_soundboard/templates/extendedoptions.html', context);
    container.append(html);
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
  game.soundboardApp.render(true);
});