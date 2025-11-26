// Macro 2: Open Soundboard to All Sounds Tab
// Copy this into a macro and set it as a script macro
// It will open the soundboard app and navigate to the all sounds tab

const app = new SoundBoardApplication();
await app.render(true);

// Set to main tab (all sounds)
app.activeTab = 'main';
