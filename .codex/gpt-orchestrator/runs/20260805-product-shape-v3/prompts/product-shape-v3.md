# Product Shape V3 Prompt

Goal: generate Taobao main-image base artwork that keeps the visual polish of the best GPT result but is much closer to the real product shape.

The user feedback:

- Gemini image generation was more realistic and closer to product form.
- GPT image quality was good, but the product shape was too different.
- The next result should combine Gemini's realistic product/display feeling with GPT's commercial visual finish.

Use references this way:

1. `product-shape-guide.png`: primary composition reference. Follow its product shape: a square Taobao main image containing a real 16:9 event big-screen software UI, with left prize/control panel, central winner/result card, right avatar wall, bottom status/control strip, and top-left empty title area for later copy.
2. `gemini-product-shape-reference.png`: use only for realism and "large display/software product" feeling. Do not copy its generated Chinese text or real face style.
3. `gpt-quality-reference.png`: use only for lighting quality, polish, depth, and e-commerce visual finish. Do not copy its fantasy/game UI shape or over-decorated modules.

Generate 3 square ecommerce main-image base images:

## Direction A: Lottery Main Screen

A realistic, polished event lottery big-screen software interface. It should look like the actual front-end screen projected at an event. Main layout: left prize/current round panel, center winner card or spinning avatar result area, right participant avatar wall, bottom abstract control/status bar. Blue/cyan/gold style. Clear top-left area for later Chinese overlay.

## Direction B: Imported Name List Lottery

A realistic front-end imported-name-list lottery screen. The product shape should show many participant cards or name/photo placeholders as a rolling wall, a central selected result panel, and prize/result modules. More red-gold ceremony style, but still software UI, not stage photo, not abstract poster.

## Direction C: Interactive Game Screen

A realistic front-end large-screen interactive game UI, not a 4-panel concept collage. One dominant 16:9 screen showing game menu/race/ranking state: left participant/ranking list, center racing lanes or game stage, right real-time ranking/result panel, bottom status strip. It can include small modules for red packet rain or horse racing, but must still feel like one software screen.

Hard constraints:

- Do not generate readable Chinese, English, numbers, labels, brand names, QR codes, watermarks, prices, sales claims, or UI copy. Use blank bars and icons instead.
- Do not show backend/admin dashboards or setup forms.
- Do not show operation process steps.
- Do not show real event crowd, presenter, audience, or people holding phones.
- Do not use realistic human headshots. Use generic avatar icons or abstract silhouettes only.
- Do not make an empty abstract neon poster.
- Do not make a fantasy game collage that no longer resembles the product.
- The large 16:9 software screen must be the hero, occupying the lower/middle area of the square Taobao main image.

Output expectations:

- Square image.
- Product-related front-end big-screen UI.
- Enough realistic UI density that buyers understand the product shape before copy is added.
- Leave top-left or top band empty/darker for deterministic Chinese title overlay after generation.

