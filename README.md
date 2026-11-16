# Shinzen Young: Working with Difficult Emotions

A portable static training website built from the 12 supplied recordings. HTML, CSS, JavaScript and JSON; no backend, API keys, model calls, install step or build step.

## Open locally

Double-click **Start Local Preview.command**. It serves `docs/` at `http://127.0.0.1:4184/` and opens your browser. Keep the Terminal window open; Control-C stops it. Python 3 is required.

Or run from this folder:

```sh
python3 scripts/serve.py --open
```

If the port is busy, use `python3 scripts/serve.py --port 4186 --open`. Do not open `index.html` directly: browsers may block its JSON files on file URLs.

## Included

- Ten chapters, with source references, concept diagrams, source anecdotes, cheat sheets, activities and knowledge checks.
- Four self-paced practices: feeling body, thinking mind, combined five components, whole mind-body process with optional goodwill close.
- All 12 complete timestamped recording transcripts, searchable in the source library.
- A complete PDF in `docs/library/full-guide.pdf`, including every chapter, exercise, story and source transcript. Download it to your phone before airplane mode.
- Journal entries with pause/resume, reflection, practical next steps and a revisit date. Dates do not schedule notifications.
- Manual ChatGPT handoffs with the relevant source text, exercise context, current step and only the selected entry’s notes. Preview, copy or download the prompt; paste into ChatGPT yourself.
- Backup export/import for moving progress and notes between devices or addresses.

## GitHub Pages

The deployable website is **docs/**. All links and asset paths are relative, so a repository URL such as `https://YOUR-NAME.github.io/YOUR-REPOSITORY/` works.

1. Create a repository and push this folder’s contents to its `main` branch.
2. Open repository **Settings → Pages** and choose **GitHub Actions** as the source.
3. The included `.github/workflows/pages.yml` validates the files and uploads `docs/`. Run its workflow manually or push to `main`.
4. Use the URL shown by GitHub Pages on laptop or mobile.

Alternatively, use Pages **Deploy from a branch**, choose `main` and `/docs`, and disable the included Actions workflow to avoid two deployment methods. Other static hosts can serve the contents of `docs/` directly.

No repository was created, pushed or published by this task. Public hosting exposes the bundled transcripts and PDF to visitors. Keep the source’s author/publisher notices and choose hosting appropriate to material you can share. The app has no access control.

## Notes and privacy

The browser saves state under `shinzen-emotions-v1`. Nothing is sent to a model or automatically synchronized. Clearing browser storage removes that local copy. Use **Journal → Export backup**, transfer the JSON file, then **Import backup** on the other device. Import merges entries and keeps the more recently updated version. Different domains and ports have separate storage.

A ChatGPT handoff from an older journal entry always uses that entry, not the newest session. Quiet observations you never type cannot appear in a handoff. Source claims are presented as source claims; the app does not diagnose, certify attainment or promise results.

## Sources and accuracy

All 12 original files were processed locally using MLX Whisper large-v3-turbo. The initial VAD pass was compared with a full pass without VAD. Second-pass hallucinations in meditation pauses/music were removed; end credits omitted by the first pass were recovered. Timestamps remain approximate segment boundaries. Quiet words, proper names, the Japanese phrase and French expression may still be wrong. This is not a fully human listening-verified transcript or a measured word-error-rate result.

The original MP3 files remain in their original folder and are not bundled in this repository. The app includes the complete text, original filenames and source hashes. `docs/data/sources.json` retains original local paths as provenance; those paths are not playable audio links on a hosted site.

## Files

- `docs/`: deployable website and downloadable library.
- `docs/data/course.json`: chapters, quizzes, stories and practice graphs.
- `docs/data/sources.json`: all timestamps and source text.
- `docs/library/`: full PDF, individual Markdown/TXT transcripts, combined TXT and quality report.
- `provenance/transcription-review.json`: processing scope, corrections and limitations.
- `scripts/validate-training.mjs`: source coverage, transitions, handoffs, storage and backup checks.

With Node.js 18 or later, run `npm test`. No npm install is needed. The local launcher itself needs only Python 3.
