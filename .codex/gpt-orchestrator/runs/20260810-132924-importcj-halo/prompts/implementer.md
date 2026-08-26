# Engineering assignment

## Role

You are an external senior frontend engineer working through Gemini. Codex is the accountable repository owner and will independently inspect, apply, test, and accept or reject your delivery.

## Goal

Add a new selectable “星环名单抽奖” running-state effect to the existing imported-list lottery module. The center circle must display the complete value of the first configured field, while the pre-draw and result states remain the existing import-lottery UI.

## Baseline

- Repository: `hd.ufunet.cn`
- Framework: Think template + RequireJS/AMD + jQuery, served by Webman/PHP 7.2+
- Base commit: `aaa80d3e2d0f88bb1b80aba6f2ab51b67095855f`
- Working tree: dirty; target importcj files were clean before this run. The uploaded lottery halo files and demo are unpublished user changes and are visual references only.
- Context transport: `targeted_context`
- Context reference: exact uploaded file hashes are recorded in `context.json`
- Provider workspace: none; this is a one-off Gemini conversation
- Production route: `/screen/frame/index?...&module=importcj` through the existing screen container

## Architecture and protected boundaries

- `/screen/importcj/savelucker` remains the sole authority for winners. Do not alter endpoints, payloads, response shapes, business rules or backend controller code.
- Preserve prizes, groups, round mode, `onceout`, stop types, keyboard control, delete winner, show all winners, auto-scroll, music and pre/post video behavior.
- Preserve field masking by displaying candidate values only after the existing `initonedata(value, fieldconfig)` transformation.
- Imported data exposes up to four text fields and has no standard avatar field. Do not invent an avatar dependency.
- Do not edit or bypass the encrypted `configimportcj` or `importcj` controllers.
- Do not change the existing QR/scan lottery files. They are references only.
- Do not overwrite or touch unrelated dirty files.
- Do not commit, push, deploy or modify production.

## Required behavior

1. Add a fifth independently selectable import-lottery effect named `星环名单抽奖`. Prefer `flytype = 5` if the existing generic styleconfig round trip supports it. Implement the style card in the existing template without modifying encrypted code. Keep the existing four options intact. If there is unavoidable uncertainty about server-side filtering, make the frontend change safely testable and call out the uncertainty.
2. Only the `.isdrawing` state receives the halo presentation. Idle/pre-draw and `.isdrawed` result UI must retain the current import-lottery presentation and logic.
3. The halo stage is transparent and scoped. It must not add a black root overlay, replace background/static theme assets or leak styles into other themes.
4. Create a modular implementation rather than adding a large visual engine directly to `screenimportcj.js`. Preferred new files:
   - `public/static/js/screenjs/screenimportcj-halo.js`
   - `public/static/css/screencss/screenimportcj-halo.css`
5. The halo is a presentation layer only:
   - one center node plus approximately 60 peripheral nodes, independent of `onceout`;
   - center shows the complete first configured field value, not only its first character;
   - no duplicate full name under the center circle;
   - center type scales or wraps safely for 2, 4, 8 and 12+ characters without truncating the value;
   - peripheral nodes show the first meaningful Chinese character or 1–2 Latin initials;
   - blank values fall back to `嘉宾`;
   - random size, orbit radius, duration, negative delay, opacity/depth and glow;
   - center changes rapidly while running;
   - several peripheral nodes replace their display values roughly every 900 ms so the visual pool is not perceived as fixed;
   - stable visual node count across the draw.
6. Lifecycle must provide clean start/stop/destroy/resize behavior. Repeated rounds must not accumulate intervals, delayed timers, DOM nodes or resize listeners.
7. Preserve pre-roll video gating: the halo should start at the same moment the existing roll/fly animation would start, after `savelucker` succeeds and after any configured intro video ends.
8. Preserve stop semantics, including incremental stop modes. If an existing hidden roll list is required to maintain stop counters/timers, keep it behaviorally active while the halo is visible, and reveal results only when the existing stop flow is complete.
9. The CSS must scale cleanly at 1024, 1366 and 1920 widths and must follow the visual geometry/depth of the uploaded Gemini demo and existing QR halo implementation without assuming image avatars.

## Acceptance criteria

| ID | Requirement | Verification |
|---|---|---|
| AC-01 | New selectable `星环名单抽奖`; existing effects intact | Template and config branch review |
| AC-02 | Only drawing state changes | Idle/drawing/result browser checks |
| AC-03 | Center contains full first-field value with safe fit | 2/4/8/12+ character cases |
| AC-04 | ~60 dynamic peripheral nodes independent of onceout | DOM/timer observation |
| AC-05 | Existing winner and state business flow preserved | Diff and mocked lifecycle checks |
| AC-06 | Existing masking applied before display | Data adapter review/test |
| AC-07 | No black overlay or asset/background replacement | Scoped CSS and screenshots |
| AC-08 | Responsive and leak-free across repeated rounds | 1024/1366/1920 plus lifecycle checks |

## Required deliverables

1. State assumptions and uncertainties.
2. Explain the selected approach and affected boundaries.
3. Provide a complete changed-file manifest.
4. Provide a complete unified diff against the uploaded baseline files, including complete contents for new files. Do not use placeholders or ellipses.
5. Add a small testable surface or deterministic helper where practical; do not introduce a new build system.
6. List checks actually performed and results.
7. List checks not performed.
8. Identify remaining risks, especially persistence of the new style value through encrypted backend code.

## Restrictions

- Do not claim access to any local repository path beyond the uploaded files.
- Do not claim tests ran unless they actually ran in your environment.
- Do not return a disconnected standalone mock as the implementation.
- Keep the patch minimal and do not refactor unrelated existing code.
- Do not propose commit, push, deployment, database migration or production changes as completed actions.
