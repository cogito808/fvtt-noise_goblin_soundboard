// ⭐ Soundboard Favorites
// Copy this entire code and paste into a Script Macro in Foundry
// It will open the soundboard and navigate to the Favorites tab

const app = new SoundBoardApplication();
app.activeTab = 'favorites';
await app.render(true);
