# Soundboard Macro Guide

## Quick Start: How to Import Macros into Foundry

### Method 1: Copy from Files (Easiest)

1. **Open the macro files from this module:**
   - `soundboard-favorites-macro.js` - Opens to Favorites tab
   - `soundboard-all-sounds-macro.js` - Opens to All Sounds tab

2. **Copy the entire code** (highlight all and Ctrl+C)

3. **In Foundry VTT:**
   - Click the **Macro Hotbar** at the bottom of the screen
   - Click **Create Macro** (or right-click an empty slot)
   - Select **Script** as the macro type
   - Paste the code into the **Script** field
   - Name it (e.g., "⭐ Soundboard Favorites" or "🔊 Soundboard All Sounds")
   - Click **Save Macro**

4. **Click the macro button to use it!**

---

## Macro Codes

### Opening to Favorites Tab

Copy this entire code block:

```javascript
// Open Soundboard to Favorites Tab
const app = new SoundBoardApplication();
await app.render(true);
app.activeTab = 'favorites';
```

### Opening to All Sounds Tab

Copy this entire code block:

```javascript
// Open Soundboard to All Sounds Tab
const app = new SoundBoardApplication();
await app.render(true);
app.activeTab = 'main';
```

---

## Tips & Tricks

- **Add Emoji:** Use 🎵, 🔊, ⭐, 🎶 in your macro names for visual identification
- **Window Memory:** The soundboard remembers its last size and position
- **Tab Switching:** If the soundboard is already open, the macro will switch tabs instantly
- **Create Both:** Make one macro for each tab for easy switching
- **Hotbar Placement:** Drag macros to different hotbar slots for quick access
- **GM Only:** You can set macros to GM-only if needed via the macro settings

---

## Troubleshooting

**Macro doesn't work?**
- Make sure the soundboard module is installed and enabled
- Verify you're using **Script** macro type, not Chat Command
- Check that you copied the entire code block
- Reload the page (F5) and try again

**Wrong tab opens?**
- Make sure `activeTab` is set to either `'favorites'` or `'main'`
- Macros are case-sensitive!


