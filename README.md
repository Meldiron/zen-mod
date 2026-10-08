# zen-mod

My personal collection of [Zen Browser](https://zen-browser.app) tweaks, packaged as one mod.

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

## Install

zen-mod uses JavaScript, so it is installed with [Sine](https://github.com/CosmoCreeper/Sine), the mod manager for Zen.

1. Install Sine by following [its instructions](https://github.com/CosmoCreeper/Sine#%EF%B8%8F-installation) and restart Zen.
2. Open Zen settings → **Sine Mods**.
3. Paste `https://github.com/Meldiron/zen-mod` into the install field and click **Install**.
4. Restart Zen.

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
