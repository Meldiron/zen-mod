# zen-mod

A collection of Zen Browser tweaks, packaged as one [Sine](https://github.com/CosmoCreeper/Sine) mod. Users install it from `https://github.com/Meldiron/zen-mod` through Sine. Sine detects new versions from repo pushes, so whatever is on `main` is live for everyone who has the mod installed.

## Layout

- `theme.json`: Sine metadata. Every script must be registered under `scripts`.
- `userChrome.css`: all chrome styles. Sine loads a single stylesheet, so each feature gets its own commented section.
- `preferences.json`: settings shown in Sine. Prefix each pref with the feature name (for example `tabdone.daily-goal`).
- `<feature>.uc.js`: one script per feature, loaded into `chrome://browser/content/browser.xhtml`.
- `README.md`: one section per feature under **Features**, plus that feature's settings in the Settings table.

## Versioning

Every prompt that changes the repo ends with a release. Do all of these steps; don't skip any:

1. Bump `version` in `theme.json` using semver:
   - **patch** (`1.2.3` → `1.2.4`): fixes, tweaks to existing behavior, docs.
   - **minor** (`1.2.3` → `1.3.0`): a new feature or a new setting.
   - **major** (`1.2.3` → `2.0.0`): breaking changes, such as renaming the mod `id`, renaming or removing prefs, or removing a feature.
2. Commit everything in one commit. Start the message with the version, like `v1.3.0: Add tab snooze`.
3. Tag the commit: `git tag v1.3.0`.
4. Push the commit and the tag: `git push && git push --tags`.

Never push without bumping the version, and never reuse a version.

## Testing

Don't test in the user's real Zen profile. Use a throwaway profile instead:

1. Create a temporary profile folder. Install Sine's bootloader (`program.zip` goes into `Zen.app/Contents/Resources/`, `profile.zip` and `engine.zip` go into `<profile>/chrome/`). Alternatively, symlink the mod's `.uc.js` files into `<profile>/chrome/JS/` and `userChrome.css` into `<profile>/chrome/`.
2. Add a `user.js` that sets `toolkit.legacyUserProfileCustomizations.stylesheets`, `zen.welcome-screen.seen`, `browser.dom.window.dump.enabled` and `devtools.console.stdout.chrome` to `true`.
3. Run `/Applications/Zen.app/Contents/MacOS/zen -no-remote -profile <dir>` and read stdout. A throwaway driver `.uc.js` can script tab actions and save snapshots with `CanvasRenderingContext2D.drawWindow` (`screencapture` has no permission here).
