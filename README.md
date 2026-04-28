# Tiller.js

[![npm version](https://img.shields.io/npm/v/tiller-js)](https://www.npmjs.com/package/tiller-js)
[![license](https://img.shields.io/github/license/nikaocreatives/tiller-js)](LICENSE)
[![WebHID](https://img.shields.io/badge/WebHID-Chrome%20%7C%20Edge-blue)](https://caniuse.com/webhid)

A JavaScript library for the [Tiller](https://gettiller.com) time tracker — connect, respond to gestures, and control the LED from any web app.

## Requirements

- A browser with [WebHID](https://caniuse.com/webhid) support (Chrome, Edge)
- A Tiller device
  ![Photo of Tiller device](/public/tiller-device-silver.png)

## Installation

No build step required. Import directly as an ES module:

```js
import { Tiller } from './src/index.js';
```

## Demos

|     | Demo                                     | Description                                               |
| --- | ---------------------------------------- | --------------------------------------------------------- |
| ⏱   | [Stopwatch](demo/stopwatch.html)         | Tap to start/stop, double tap to lap, long press to reset |
| 🎨  | [Color Mixer](demo/color-mixer.html)     | Scroll through hues, LED matches live, tap to save colors |
| ⚡  | [Reaction Game](demo/reaction-game.html) | React to the LED color as fast as possible                |

## Quick Start

```js
const tiller = new Tiller();
await tiller.connect();

tiller.on('tap', () => tiller.toggleLed()).on('scroll', (delta) => window.scrollBy(0, delta));
```

`connect()` will use a previously paired device if one exists, or prompt the user to select one.

## Constructor Options

```js
const tiller = new Tiller({
	scrollSensitivity: 1, // multiplier applied to scroll delta (default: 1)
	doubleTapThreshold: 300, // ms between taps to count as double tap (default: 300)
	longPressThreshold: 500, // ms held down to trigger long press (default: 500)
});
```

## Events

All events are registered with `.on(event, handler)`, which returns the instance for chaining.

| Event        | Handler                   | Description                                    |
| ------------ | ------------------------- | ---------------------------------------------- |
| `tap`        | `() => void`              | Device tapped once                             |
| `doubletap`  | `() => void`              | Device tapped twice in quick succession        |
| `longpress`  | `() => void`              | Device held down past the long press threshold |
| `press`      | `() => void`              | Device pressed down (raw)                      |
| `release`    | `() => void`              | Device released (raw)                          |
| `scroll`     | `(delta: number) => void` | Device rotated — delta is positive or negative |
| `connect`    | `() => void`              | Device connected or reconnected                |
| `disconnect` | `() => void`              | Device disconnected                            |

**Notes:**

- `tap` and `doubletap` are mutually exclusive — a double tap suppresses the two individual tap events
- `longpress` suppresses `tap` — releasing after a long press only fires `release`
- `scroll` delta is the raw rotation value multiplied by `scrollSensitivity`

## LED Control

```js
// Set color (r, g, b — each 0–255) and turn LED on
await tiller.setLedColor(255, 0, 0); // red
await tiller.setLedColor(0, 255, 0); // green
await tiller.setLedColor(0, 0, 255); // blue

// Turn on with the last set color
await tiller.setLedOn();

// Turn off
await tiller.setLedOff();

// Toggle
await tiller.toggleLed();
```

## Getters

```js
tiller.isConnected; // boolean
tiller.ledOn; // boolean
tiller.ledColor; // { r, g, b }
```

## Example

```js
import { Tiller } from './src/index.js';

const tiller = new Tiller({ scrollSensitivity: 10 });
await tiller.connect();

tiller
	.on('connect', () => console.log('Tiller connected'))
	.on('disconnect', () => console.log('Tiller disconnected'))
	.on('tap', () => tiller.toggleLed())
	.on('doubletap', () => tiller.setLedColor(255, 0, 0))
	.on('longpress', () => tiller.setLedColor(0, 0, 255))
	.on('scroll', (delta) => window.scrollBy(0, delta));
```
