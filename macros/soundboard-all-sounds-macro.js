// 🔊 Soundboard All Sounds
// Copy this entire code and paste into a Script Macro in Foundry
// It will open the soundboard and navigate to the All Sounds tab

const app = new SoundBoardApplication();
await app.render(true);
app.activeTab = 'main';
