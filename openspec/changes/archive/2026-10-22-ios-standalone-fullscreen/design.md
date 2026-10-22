# Design

## Context

Findings from the device (iPhone, iOS 18.5, installed to the home screen, diagnostics panel): `inner 393x793`, `outer 393x852`, `screen 393x852`, `visualViewport 393x793`, safe-area insets top 59 and bottom 34. A fixed layer 867 points tall still stopped at 793; a test that painted the root canvas red filled the whole screen, including the bottom strip; and the status-bar meta (`default` versus `black-translucent`) did not change the viewport height.

## Decisions

- **Photo on the root element's background**, not a fixed layer, because the canvas paints the full screen where fixed layers do not.
- **`--canvas-h`** (set in `src/theme/canvas.ts`) makes the root element as tall as the screen when standalone and the viewport is short by 0 to 120 points. Screen height is taken orientation-aware (iOS reports portrait terms) and combined with `outerHeight`.
- **Decision rule `extra >= 0`** (not `> 0`): once the root is tall, iOS reports the full height as the viewport; the first version used `> 0`, flipped to "no gap" and removed the height, the viewport shrank again, and the page flickered between the two states.
- **Re-evaluation** after load timers (0, 50, 150, 400, 1000, 2500 ms) and on resize, orientationchange, pageshow, focus, load, visibilitychange, visualViewport resize and pointerdown, because the viewport shrinks after launch without an event (the first version, which only checked at startup, never applied).
- **Layout stays at the layout viewport height**: `#app` still uses the short viewport; only the photo extends, since touches in the strip may not register.
- **`black-translucent`** status bar, kept because it is the documented edge-to-edge setting; it did not change the viewport but the clock stays readable on the photo.
- **Diagnostics** (a build label and an info panel in the menu, plus a "red canvas" test button) were added temporarily to measure all this on the device and are removed.

## Risks / Trade-offs

- [Other iOS versions or devices behave differently] -> the rule is keyed on the measured gap (0 to 120 points) rather than a device list, and is inert outside standalone mode.
- [The strip below the layout viewport may not receive touches] -> no interactive content is placed there.
