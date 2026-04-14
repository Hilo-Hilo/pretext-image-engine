# Expanded validation notes

This log records the additional checks requested after the initial debugging pass, focusing on previously untested areas: responsive behavior, accessibility, package/build integration, export behavior, and performance.

## Completed checks so far

I added and ran new automated coverage for responsive stage sizes and decorative-image accessibility. The responsive sweep verified that representative stage sizes from 320×240 through 1024×576 continue to expose either masked text or explicit fallback content rather than silently emptying the stage. The accessibility sweep reproduced a real issue: the base and overlay images were decorative but were not marked `aria-hidden`. I fixed that in `src/lib/engine.ts`, re-ran the tests, and the suite now passes with 17 tests.

I then ran the full production build, which exercises typechecking, the test suite, library packaging via `tsup`, stylesheet copying, and the Vite demo build. The first build attempt surfaced a TypeScript gap in the newly added test metadata; I corrected the test fixture and re-ran the build successfully. Current status: test suite passing, library build passing, demo build passing.

## Live browser performance check

I measured the running demo in Chromium on the local Bay Bridge scene. The live stage was 693×520, the status badge reported `V2 auto layout active · 4 slots planned`, and 9 visible masked lines were present in the inspected state. Repeated `render()` calls from the browser console averaged about 67.8 ms over 20 samples, with a maximum sample of about 74.3 ms in that environment. Repeated `setProgress()` calls across 0, 0.25, 0.5, 0.75, and 1 completed effectively instantaneously at browser-console precision in this scene and did not drop visible lines in the inspected state.

## Live accessibility audit

I ran an axe-core audit against the live demo in Chromium. The audit returned one concrete WCAG A/AA violation: the `#scene-editor` textarea lacked an accessible label. Axe also reported `color-contrast` as incomplete rather than a confirmed failure in this run. I am treating the missing textarea label as a real bug to fix in the demo UI.

I reloaded the live demo after patching `src/main.ts` and re-ran the axe-core audit. The prior textarea-label violation is resolved: the audit now reports zero WCAG A/AA violations in this run, with only `color-contrast` left in the incomplete bucket rather than as a confirmed failure.

## Denser-content stress check

I inspected the live engine API and confirmed the demo exposes update and render methods that can be exercised directly in the browser. Using that runtime, I temporarily replaced the active scene with a synthetic 16-block variant derived from the live Bay Bridge scene, forced an update and render, and then restored the original scene. In that stress case, `update()` took about 0.7 ms and the follow-up `render()` took about 33.3 ms in the browser, with the engine still reporting `V2 auto layout active · 4 slots planned`. Only 2 visible lines survived in that denser-content case, which is not a crash but does show that this art-directed mask/slot configuration degrades into a highly reduced composition under much heavier copy density.

## Fresh-consumer integration smoke test

I packed the library with `pnpm pack`, created a separate temporary Vite app, installed the tarball as a file dependency, imported both `pretext-image-engine` and `pretext-image-engine/styles.css`, and built the consumer successfully. That validates the packaged ESM/CSS surface in a fresh app rather than only inside the repository itself.

## Final re-verification after fixes

After the decorative-image accessibility fix in `src/lib/engine.ts` and the demo textarea-label fix in `src/main.ts`, I re-ran the full repository build. The final pass succeeded end to end: typecheck passed, automated tests passed (17/17), library packaging passed, and the Vite demo production build passed.
