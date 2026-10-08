# zen-mod

My personal collection of [Zen Browser](https://zen-browser.app) tweaks, packaged as one mod. See the [installation guide](#installation-guide) to set it up.

## Features

### Tab Done

Turns your tabs into a todo list.

- **Checkbox instead of ×**: closing a tab checks it off, with a pop, a green flash and confetti.
- **Combos**: close tabs in quick succession for bigger bursts and a `×N combo!` counter.
- **Escalating confetti**: extra celebrations at 5, 10, 25, 50 and 100 tabs done in a day.
- **Daily goal ring**: a progress ring above the sidebar footer, gold once you hit your goal.
- **Streaks**: consecutive days you hit your daily goal, shown as 🔥 next to the ring.
- **Tab aging**: tabs get a yellow, orange, then red edge and fade the longer they stay open.
- **Inbox zero**: a celebration when a workspace has no tabs left.

## Installation guide

zen-mod uses JavaScript, so it's installed with [Sine](https://github.com/CosmoCreeper/Sine), a community mod manager for Zen. Plain Zen Mods can't run JavaScript.

### 1. Install Sine

Download the installer for your system from the [latest Sine release](https://github.com/CosmoCreeper/Sine/releases/latest), then:

- **macOS**:
  1. Give your terminal Full Disk Access: System Settings → Privacy & Security → Full Disk Access.
  2. Run these commands in the folder you downloaded the installer to. Use `sine-osx-x64` instead on Intel Macs:
     ```sh
     xattr -d com.apple.quarantine ./sine-osx-arm64
     chmod +x ./sine-osx-arm64
     ./sine-osx-arm64
     ```
- **Windows**: run `sine-win-x64.exe`, or `sine-win-arm64.exe` on ARM.
- **Linux**: run these commands. Use `sine-linux-arm64` on ARM:
  ```sh
  chmod +x ./sine-linux-x64
  ./sine-linux-x64
  ```

Prefer to do it by hand? Follow Sine's [manual installation guide](https://github.com/sineorg/docs/blob/main/src/installation.md#manual).

Then open `about:support` in Zen and click **Clear startup cache…**. Zen restarts, and a **Sine Mods** section appears in Zen settings.

### 2. Allow JavaScript mods

In Zen settings → **Sine Mods**, turn on **Enable installing JS from unofficial sources**.

zen-mod isn't in Sine's store, so without this setting Sine loads only its styles. You'd get the checkbox but no confetti, streaks or anything else.

### 3. Install zen-mod

1. In **Sine Mods**, paste `https://github.com/Meldiron/zen-mod` into the install field and click **Install**.
2. Restart Zen.

### 4. Check it works

A ring with `0 / 10 today` should appear above the buttons at the bottom of the sidebar. If you see the green checkboxes but no ring, go back to step 2.

### Updating

Sine checks for updates to installed mods automatically. To update right away, use the update button in **Sine Mods**, then restart Zen.

### Uninstalling

Remove zen-mod in **Sine Mods** and restart Zen. To also clear your progress, reset every `tabdone.` preference in `about:config`.

## Settings

Change these in zen-mod's settings in Sine, or in `about:config`:

| Preference | Default | Description |
| --- | --- | --- |
| `tabdone.daily-goal` | `10` | Tabs to close per day to keep the streak |
| `tabdone.combo-seconds` | `6` | Max seconds between closes to keep a combo going |
| `tabdone.aging-speed` | `normal` | `off`, `fast` (2h/8h/1d), `normal` (1d/3d/7d), `slow` (3d/7d/14d) |
| `tabdone.inbox-zero` | `true` | Celebrate when a workspace is empty |
| `tabdone.count-shortcut` | `true` | Count Cmd/Ctrl+W closes as done, not just the checkbox |

Your progress is stored in the `tabdone.state` preference.
