// scripts/fvtt-noise_goblin_soundboard.js

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
    await super.render(force, options);
    Hooks.once('renderSoundBoardApplication', async (app, html) => {
      const opacity = game.settings.get('fvtt-noise_goblin_soundboard', 'opacity');
      html.css('opacity', opacity);
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
      loopClass: sound.isLoop ? 'loop-active' : '',
      loopFn: sound.isLoop ? 'stopLoop' : 'startLoop',
      star: sound.isFavorite ? 'fas fa-star' : 'far fa-star',
      favoriteFn: sound.isFavorite ? 'unfavoriteSound' : 'favoriteSound',
      delayValue: sound.loopDelay || 0,
      delayClass: (sound.loopDelay || 0) === 0 ? 'hidden' : '',
      removeFavFn: favTab ? "$(this).closest('.sb-sound-container').remove();" : ''
    };

    const html = await renderTemplate('modules/fvtt-noise_goblin_soundboard/templates/extendedoptions.html', context);
    container.append(html);
  }
}

Hooks.once('init', () => { game.soundboardApp = new SoundBoardApplication(); });

Hooks.once('ready', () => { game.soundboardApp.render(true); });