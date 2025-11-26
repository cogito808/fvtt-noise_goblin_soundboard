// Macro 1: Open Soundboard to Favorites Tab
// Copy this into a macro and set it as a script macro
// It will open the soundboard app and navigate to the favorites tab

const app = new SoundBoardApplication();
await app.render(true);

// Set to favorites tab
app.activeTab = 'favorites';
