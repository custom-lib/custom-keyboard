custom-keyboard
=========================

English | [中文](https://github.com/custom-lib/custom-keyboard/blob/main/README-zh_CN.md)

**[Demo Game -- Hold on for 60 seconds](https://custom-lib.github.io/custom-keyboard/)**

* Support for any number of key combinations. (First your keyboard has to support N-key rollover).
* Support for any number of key sequences.。
* Support binding to 'key' | 'keyCode' | 'code' three different types of keyboard events。
* Support binding to keydown event and keyup event (sequence keys without keyup events)。
* Support for switching event responses between contexts.
* It's lightweight. 4kb after compression (gzip).

## Install

```bash
npm install --save custom-keyboard
```

## Usage

custom-keyboard makes an intuitive [preset name (click for details)](https://github.com/custom-lib/custom-keyboard/blob/main/src/MapEventKeyCode.ts) for most of the keys, thus enabling a set of rules binding to three different keyboard event types ('key' | 'keyCode' | 'code').
You need to mount() once before you start using custom-keyboard, and unmount() to unload the event listener when you don't need it anymore.
The symbol '+' represents **Combination**, '->' represents **Sequence**, and the symbols are legal with or without spaces between the keys.

```javascript
import Keyboard from 'custom-keyboard';

Keyboard.mount();

// Combination
Keyboard.bind('a + b', () => {
    console.log('press a + b')
}, () => {
    console.log('release a + b')
});
Keyboard.bind(['q + w+e', 'a+s+d'], () => {
    console.log('q + w + e | a + s + d')
});

// Sequence
Keyboard.bind('enter -> 1', () => {
    console.log('enter -> 1')
});
Keyboard.bind('q -> q -> q', () => {
    console.log('q -> q -> q')
});
// Keyboard.unmount();
```

### bind

```javascript
type EventType = 'key' | 'keyCode' | 'code';

interface BindOption {
    bindKeys: string | Array<string>;
    eventType?: EventType;
    context?: string | null;
    preventRepeat?: boolean;
    strictOrder?: boolean | 'equal';
    caseSensitive?: boolean;
}

function bind(bindOption: BindOption['bindKeys'] | BindOption, pressDownExecutor?: (() => void) | null, pressUpExecutor?: () => void): Listener[];
```

**bindKeys** _`:string | Array<string>`_
If the bindKeys does not match the rules, such as invalid key names; The '+' and '->' symbols appear at the same time; etc., the bind does not take effect and return false.
A successful bind return an array of Listeners that can be used to unbind(Listeners) events;
The pressUpExecutor of Sequence type bindKey will be ignored.

**eventType** _`:'key' | 'keyCode' | 'code'`_ = 'key'
Optionally bind to three different standard keyboard events, [you can refer here for the differences](https://javascript.info/keyboard-events).

**preventRepeat (Valid only for combination type)** _`:boolean`_ = true
If keep pressed and not released, is the response repeated.

**strictOrder (Valid only for combination type)** _`:boolean | 'equal'`_ = false

```javascript
Keyboard.bind({
    bindKeys: '2 + 3 + 4',
    strictOrder: false,
}, () => {
    console.log('press 2 + 3 + 4');
});
```

strictOrder defaults to false. in the above example, press 2, 3, and 4 in whatever order they are pressed, they will all take effect.

When strictOrder is true, it only takes effect when pressed in order of 2, 3 and 4.

When strictOrder is 'equal', if you pressed in order of 1, 2, 3 and 4, it will not work, but when strictOrder is true, it will work.

**caseSensitive (Only eventType === 'key' is valid)** _`:boolean`_ = false
event.key is case-sensitive. For 26 letters, if the user unintentionally presses the capslock, the bound listener will not be effective. This is not expected to happen in most cases, so case desensitization is done by default. If this behavior is not desired, explicitly setting this option to true is sufficient.

**context** _`:string`_ = undefined
You can bind to different contexts, and if undefined or null, it will take effect in all contexts.

### unbind

```javascript
function unbind(listener: Listener | Array<Listener>): boolean;

const listeners1 = Keyboard.bind('s + d');
Keyboard.unbind(listeners1);
const listeners2 = Keyboard.bind(['a + b', 'b + c']);
Keyboard.unbind(listeners2);
const listeners3 = Keyboard.bind(['q + w', 'e + r']);
Keyboard.unbind(listeners3[0]); // Only the 'e + r' event is released, and 'q + w' continues to run.
```

### setSequenceInterval
Set the detection interval (ms) for Sequence type, the default is 666.

```javascript
function setSequenceInterval(iInterval: number): void;

Keyboard.setSequenceInterval(600);
```

### setSequenceMustReleaseLastPress
Set whether the next key press needs to release the last pressed key to take effect, the default is false.

```javascript
function setSequenceMustReleaseLastPress(bool: boolean): void;

Keyboard.setSequenceMustReleaseLastPress(true);
```

### About the context

```javascript
function setContext(context: string): void;
function getCurrentContext(): string | null;
function getAllContext(): Array<string>;

Keyboard.setContext('some context');
```

When you bind an event, you can set the context in which it will take effect; if you leave it blank, it will take effect in any context.
getAllContext gets the set of all the contexts bound by the events whose bind is in effect.

### reset && getAllListener

```javascript
function reset(): void;
function getAllListener(): Array<Listener>;

// The following two are equivalent
Keyboard.unbind(Keyboard.getAllListener());
Keyboard.reset();
```

getAllListener gets all the event listeners for which bind is in effect.
reset clears all bound event listeners.
custom-keyboard use Event Delegate, unmount() function will unbind root listener.

### Cautions

There is a system-level problem with command-based key Combination under MacOS.

When you press and hold command and then press any other key to trigger the key Combination, then press and hold command and release other keys, the keyup event of the released key will not be triggered by the browser.

So the keyup event of the key Combination will be triggered only after the command is released.

## Run Demo game

Run the demos:

```bash
npm install
npm run start
```

## Build Lib

```bash
npm install
npm run build:lib
```

## License

MIT
