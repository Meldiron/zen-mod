# QA checklist

Run through this after every release. Get the new version first: Zen settings → **Sine Mods** → check for updates, then restart Zen.

## Setup

1. In Sine settings, make sure **Enable installing JS from unofficial sources** is on.
2. In zen-mod's settings in Sine (or `about:config`), set:
   - `tabdone.daily-goal` to `3`
   - `tabdone.aging-speed` to `fast`
3. To have a streak to test, set `tabdone.state` in `about:config` to the JSON below. Replace the dates with yesterday's and the day before yesterday's date:

   ```json
   {"days":{"2026-10-08":{"count":3,"goal":3},"2026-10-07":{"count":3,"goal":3}},"total":6,"best":2}
   ```

4. Restart Zen.

## Checks

| # | Feature | Steps | Expected |
| --- | --- | --- | --- |
| 1 | Script loaded | Look at the bottom of the sidebar | A ring with `0 / 3 today` and `🔥 2` sits above the footer buttons |
| 2 | Checkbox | Hover over a tab | The × is a green rounded box, and hovering over it shows a faint check |
| 3 | Check off | Click the checkbox | The box fills green with a white check, the tab flashes green and the title gets crossed out. The tab closes about 0.25s later |
| 4 | Confetti | Same as 3 | Confetti bursts from the checkbox with a `+1` label. The ring moves to `1 / 3` |
| 5 | Combo | Close 3 tabs within a few seconds of each other | The labels read `×2 combo!` then `×3 combo!`, and the bursts get bigger |
| 6 | Daily goal | Close the 3rd tab of the day | Confetti rains over the whole window with "Daily goal hit!" and "🔥 3 day streak". The ring turns gold and the streak shows `🔥 3` |
| 7 | Milestone | Set the goal back to `10`, then close your 5th tab of the day | Confetti rain with "5 done today!" |
| 8 | Cmd+W | Press Cmd+W on a tab | Confetti fires from that tab's spot in the sidebar and the count goes up |
| 9 | Cmd+W setting | Turn off `tabdone.count-shortcut`, then press Cmd+W | The tab closes with no confetti and no count. The checkbox still counts |
| 10 | Blank tabs | Open a new tab and check it off | No count, because empty new tabs aren't tasks |
| 11 | Tab aging | Leave tabs open, or set the aging speed to `fast` and wait | A yellow edge after 2h, orange and faded after 8h, red and grey after 1 day. Hovering or selecting a tab brings it back to full color |
| 12 | Aging off | Set the aging speed to `off` | All the colored edges disappear right away |
| 13 | Inbox zero | In a space, close every tab that isn't pinned | The sidebar glows green once and fades. A green check draws itself in the vertical middle of the sidebar with "All clear" and today's count. No popup |
| 14 | All clear fades | After 13, wait | "All clear" fades out after 3 seconds. An already-empty space shows nothing until you check off a tab there |
| 15 | Inbox zero off | Turn off `tabdone.inbox-zero` and repeat 13 | No glow and no "All clear" |
| 16 | Ring tooltip | Hover over the ring | Shows today's count, your current and best streak, and the all-time total |
| 17 | Collapsed sidebar | Collapse the sidebar | Only the ring is shown, centered |
| 18 | Persistence | Restart Zen | The count, streak and tab ages are all kept |
| 19 | Reload | In **Sine Mods**, turn zen-mod off and back on twice without restarting | Still exactly one ring, and one close adds exactly 1 |
| 20 | Unloaded tabs | Restart Zen, then check off a restored tab you haven't opened yet | It counts and fires confetti |
| 21 | Cancelled close | Open a page that warns before leaving (for example start an upload on Google Drive), check it off and pick **Stay on page** | The check and strikethrough clear right away and the count doesn't change. Checking it off again shows the warning again, and picking **Leave page** closes the tab and counts it once |
| 22 | Library hover | With a recent download, hover the Library button at the bottom of the sidebar | The ring and count fade out under the downloads list, and fade back in once you move away. Neither shows through the list |

## Clean up

Reset `tabdone.daily-goal`, `tabdone.aging-speed` and `tabdone.state` in `about:config`.
