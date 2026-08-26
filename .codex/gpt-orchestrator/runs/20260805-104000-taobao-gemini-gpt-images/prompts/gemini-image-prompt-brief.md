# Gemini task: write six prompts for ChatGPT Web image generation

You are the prompt director for a Taobao software-service product image campaign. Your job is to write the six final image-generation prompts that will be sent to ChatGPT Web. Do not generate images yourself.

## Why this revision exists

Earlier visuals looked polished but were too empty: generic stages, light trails, and atmosphere did not show what the software actually does. The new prompts must make the product mechanism visible at thumbnail scale. Use the attached public/product-owned references to understand the real functions and the information density of the current listing. Improve their hierarchy and finish; do not copy logos, trademarks, fake QR codes, prices, sales claims, or competitor-specific assets.

## Public product facts

1. **QR-code draw / 扫码抽奖**: participants use a phone to enter an activity; the event screen presents the draw, prize round, and result. The visual story is phone participation -> large-screen draw -> visible result.
2. **Imported-list draw / 导入名单抽奖**: the organizer imports an Excel-style participant list with fields such as name, department, number, or group; configures award/round/draw quantity; then performs the draw on the large screen. The visual story is list import -> settings -> large-screen extraction.
3. **Large-screen interactive games / 大屏互动游戏**: event participants interact through modes publicly shown by the product, including shake-to-race, horse race, red-packet rain, and large-screen lottery. The visual story is many participants -> identifiable game mode -> live ranking/result.

These are software/activity services, not physical hardware, source-code downloads, lotteries, gambling, or free templates. Never invent capacity, performance, customer, certification, price, sales-volume, or conversion claims.

## Image-production method

- Final canvas: square 1:1 Taobao main image, planned for 1440x1440 delivery.
- ChatGPT generates the visual base. Accurate Chinese copy and real interface evidence will be composited afterward by Codex.
- Therefore every prompt must reserve a clean high-contrast copy zone in the upper-left or upper third, but must ask the image model to render **no readable text at all**.
- Device screens or software panels may appear, but any UI labels must be abstract, tiny, blurred, or blank placeholders. The final real product UI will be inserted locally.
- Each image needs an obvious product-action anchor, not a decorative event poster.
- Use premium commercial e-commerce art direction: crisp, high-contrast, believable lighting, controlled detail, and a clear reading path at 360x360.

## Six required directions

Write exactly one prompt for each direction:

1. **QR-A / phone-to-screen proof**: one phone in the foreground, one large event screen, and a visible directional relationship showing participation flowing into a live draw result.
2. **QR-B / three-step participation flow**: a clean three-stage composition with phone entry, participation state, and large-screen result; more product-diagram-like than cinematic.
3. **LIST-A / import-and-control proof**: an Excel-like participant table flowing into an organizer control panel and then into a large-screen winner display.
4. **LIST-B / enterprise ceremony workflow**: a refined enterprise-event scene with an operator console, structured list cards, award/round controls, and the stage screen; trustworthy and operational rather than festive-only.
5. **GAME-A / multi-mode matrix**: four visibly distinct modules for shake race, horse race, red-packet rain, and lottery, presented as a software capability matrix with one central event screen.
6. **GAME-B / live crowd interaction**: a real event crowd using phones while a large screen clearly shows a race/ranking/result interface; the interaction loop must be obvious.

## Mandatory negative constraints for every prompt

No readable words or letters, no logos, no brand marks, no QR code pattern, no price, no discount badge, no watermark, no fake certification, no fake customer logo, no unsupported claim, no money/gambling cues, no physical product packaging, no generic empty stage, no illegible pseudo-Chinese, no dominant hand covering the phone, no excessive particles that obscure the interface, no collage border, no duplicated people, no distorted fingers.

## Output format

Return exactly six sections in this order: QR-A, QR-B, LIST-A, LIST-B, GAME-A, GAME-B.

For each section provide:

1. `Purpose` — one sentence in Chinese.
2. `ChatGPT prompt` — one complete English prompt, 180-320 words, ready to paste into ChatGPT Web image generation. It must describe subject, product evidence, composition, perspective, lighting, palette, reserved copy zone, and the mandatory negative constraints.
3. `Local composite slots` — name the exact rectangular zones that should remain suitable for later insertion of real UI screenshots or deterministic Chinese copy.

Do not add recommendations, tables, or extra directions outside those six sections.
