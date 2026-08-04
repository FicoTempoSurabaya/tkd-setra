# TODO - Frontend Game & Question Fixes

## 1. Word Search - Mobile drag fix (SearchWordGame.vue)
- [x] Rework pointer handling: `@pointerdown.prevent` on grid, `setPointerCapture`, resolve cell via `closest`.
- [x] Ensure `touch-none`/`select-none` retained.

## 2. Word Search - Stable board on refresh (SearchWordGame.vue / TestView.vue)
- [x] Confirm `:seed="publicToken"` passed (stable per participant) — already done.
- [x] Confirm preview omits seed (fresh board per preview) — already done.

## 3. Sliding Puzzle - Smooth animation (SlidingPuzzleGame.vue)
- [x] Replace `TransitionGroup` with absolute-positioned tiles animated via `transform` transitions.

## 4. Sliding Puzzle - Lightbox overlay (SlidingPuzzleGame.vue)
- [x] Harden lightbox: body scroll lock + ESC-to-close.

## 5. Semantic Differential Scale - Horizontal scroll (TestView.vue + PreviewModal.vue)
- [x] Rework layout to `overflow-x-auto` + `w-max` inner with `flex-shrink-0` labels/buttons (TestView.vue).
- [x] Apply same fix to PreviewModal.vue.

## 6. Image Based Answer - 2x2 grid (TestView.vue + PreviewModal.vue)
- [x] Confirm `grid-cols-2` layout — already correct.

## Follow-up
- [ ] Type-check / build frontend.
- [ ] Manual QA on mobile.
