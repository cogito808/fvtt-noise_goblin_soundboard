// scripts/soundboard-app.js

import { SoundBoard } from './soundboard.js';

class SoundBoardApplication extends Application {
  static get defaultOptions() {
    const options = super.defaultOptions;
    options.title = `🔊Noise Goblin Soundboard`;
    options.id = 'soundboard-app';
    options.template = 'modules/fvtt-noise_goblin_soundboard/templates/soundboard.html';
    options.resizable = true;
    return options;
  }

  async render(force = false, options = {}) {
    SoundBoard.loadCollapseState();
    SoundBoard.loadFavorites();
    await SoundBoard.loadSoundsFromDirectory(game.settings.get('fvtt-noise_goblin_soundboard', 'soundboardDirectory'));
    await super.render(force, options);
    Hooks.once('renderSoundBoardApplication', async (app, html) => {
      const opacity = game.settings.get('fvtt-noise_goblin_soundboard', 'opacity');
      html.css('opacity', opacity);

      // Tab switching
      html.find('.sb-tab').on('click', async function () {
        const tab = $(this).data('tab');
        app.activeTab = tab;
        html.find('.sb-tab').removeClass('active');
        $(this).addClass('active');
        await app.render(true);
      });

      // Initialize favorite button states
      html.find('.sb-fav-toggle').each(function () {
        const path = $(this).data('path');
        if (SoundBoard.isFavorite(path)) {
          $(this).addClass('active');
          $(this).html('<i class="fas fa-star"></i>');
        } else {
          $(this).html('<i class="far fa-star"></i>');
        }
      });

      html.find('.sb-search-input').on('input', function () {
        const query = $(this).val().toLowerCase();
        html.find('.sb-sound-container').each(function () {
          const name = $(this).find('.sb-sound-name').text().toLowerCase();
          $(this).toggle(name.includes(query));
        });
      });

      html.find('.sb-collapse-all').on('click', function () {
        SoundBoard.collapseAllFolders();
        html.find('.sb-folder-toggle').addClass('collapsed');
        html.find('.sb-folder-content').hide();
      });

      html.find('.sb-expand-all').on('click', function () {
        SoundBoard.expandAllFolders();
        html.find('.sb-folder-toggle').removeClass('collapsed');
        html.find('.sb-folder-content').show();
      });

      html.find('.sb-fav-toggle').on('click', function () {
        const path = $(this).data('path');
        SoundBoard.toggleFavorite(path);
        $(this).toggleClass('active');
        if ($(this).hasClass('active')) {
          $(this).html('<i class="fas fa-star"></i>');
        } else {
          $(this).html('<i class="far fa-star"></i>');
        }
      });

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

          button.toggleClass('active', newLoopState);

          const currentSound = SoundBoard.playingSounds?.[path];
          if (currentSound && typeof currentSound.stop === 'function') {
            currentSound.stop();
            delete SoundBoard.playingSounds[path];
          }

          const newSound = await foundry.audio.AudioHelper.play({
            src: path,
            volume: 1.0,
            autoplay: true,
            loop: newLoopState
          }, true);

          SoundBoard.playingSounds[path] = newSound;
        });
      });

      html.find('.sb-folder-toggle').on('click', function () {
        const folderName = $(this).data('folder');
        SoundBoard.toggleFolderCollapse(folderName);
        $(this).toggleClass('collapsed');
        html.find(`.sb-folder-content[data-folder="${folderName}"]`).toggle();
      });
    });
  }

  getData() {
    SoundBoard.loadFavorites();
    
    // Determine which tab is active
    const activeTab = this.activeTab || 'main';
    
    let sounds = [];
    let totalCount = 0;

    if (activeTab === 'favorites') {
      // Favorites view: group favorited sounds by category
      const favoritesByCategory = {};
      
      for (const [category, files] of Object.entries(SoundBoard.sounds)) {
        const favoriteFiles = files.filter(f => SoundBoard.isFavorite(f.path));
        if (favoriteFiles.length > 0) {
          favoritesByCategory[category] = favoriteFiles;
          totalCount += favoriteFiles.length;
        }
      }
      
      // Convert to array format
      for (const [key, files] of Object.entries(favoritesByCategory)) {
        if (files.length > 0) {
          sounds.push({
            categoryName: key,
            length: files.length,
            files,
            collapsed: false
          });
        }
      }
    } else {
      // Main view: show all sounds
      for (const [key, files] of Object.entries(SoundBoard.sounds)) {
        totalCount += files.length;
        if (files.length > 0) {
          sounds.push({
            categoryName: key,
            length: files.length,
            files,
            collapsed: SoundBoard.isFolderCollapsed(key) ?? true
          });
        }
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
      tab: { main: activeTab === 'main', favorites: activeTab === 'favorites' },
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