const userAgent = window?.navigator?.userAgent || '';
const platform  = window?.navigator?.platform  || '';

/**
 * Mapping custom bound key names to key, keyCode, code of keyboard events
 */
const keyNames = {
    cancel: {
        key: 'Cancel',
        keyCode: 3,
        code: 'Cancel'
    },
    backspace: {
        key: 'Backspace',
        keyCode: 8,
        code: 'Backspace'
    },
    tab: {
        key: 'Tab',
        keyCode: 9,
        code: 'Tab'
    },
    clear: {
        key: 'Clear',
        keyCode: 12,
        code: 'Clear'
    },
    enter: {
        key: 'Enter',
        keyCode: 13,
        code: 'Enter'
    },
    shift: {
        key: 'Shift',
        keyCode: 16,
        code: 'ShiftLeft'
    },
    shiftLeft: {
        key: 'Shift',
        keyCode: 16,
        code: 'ShiftLeft'
    },
    shiftRight: {
        key: 'Shift',
        keyCode: 16,
        code: 'ShiftRight'
    },
    ctrl: {
        key: 'Control',
        keyCode: 17,
        code: 'ControlLeft'
    },
    ctrlLeft: {
        key: 'Control',
        keyCode: 17,
        code: 'ControlLeft'
    },
    ctrlRight: {
        key: 'Control',
        keyCode: 17,
        code: 'ControlRight'
    },
    alt: {
        key: 'Alt',
        keyCode: 18,
        code: 'AltLeft'
    },
    altLeft: {
        key: 'Alt',
        keyCode: 18,
        code: 'AltLeft'
    },
    altRight: {
        key: 'Alt',
        keyCode: 18,
        code: 'AltRight'
    },
    menu: {
        key: 'ContextMenu',
        keyCode: 18,
        code: 'ContextMenu'
    },
    pause: {
        key: 'Pause',
        keyCode: 19,
        code: 'Pause'
    },
    break: {
        key: 'Pause',
        keyCode: 19,
        code: 'Pause'
    },
    capslock: {
        key: 'CapsLock',
        keyCode: 20,
        code: 'CapsLock'
    },
    escape: {
        key: 'Escape',
        keyCode: 27,
        code: 'Escape'
    },
    esc: {
        key: 'Escape',
        keyCode: 27,
        code: 'Escape'
    },
    space: {
        key: ' ',
        keyCode: 32,
        code: 'Space'
    },
    spacebar: {
        key: ' ',
        keyCode: 32,
        code: 'Space'
    },
    pageUp: {
        key: 'PageUp',
        keyCode: 33,
        code: 'PageUp'
    },
    pageDown: {
        key: 'PageDown',
        keyCode: 34,
        code: 'PageDown'
    },
    end: {
        key: 'End',
        keyCode: 35,
        code: 'End'
    },
    home: {
        key: 'Home',
        keyCode: 36,
        code: 'Home'
    },
    left: {
        key: 'ArrowLeft',
        keyCode: 37,
        code: 'ArrowLeft'
    },
    up: {
        key: 'ArrowUp',
        keyCode: 38,
        code: 'ArrowUp'
    },
    right: {
        key: 'ArrowRight',
        keyCode: 39,
        code: 'ArrowRight'
    },
    down: {
        key: 'ArrowDown',
        keyCode: 40,
        code: 'ArrowDown'
    },
    select: {
        key: 'Select',
        keyCode: 41,
        code: 'Select'
    },
    printScreen: {
        key: 'PrintScreen',
        keyCode: 42,
        code: 'PrintScreen'
    },
    execute: {
        key: 'Execute',
        keyCode: 43,
        code: 'Execute'
    },
    snapshot: {
        key: 'SnapShot',
        keyCode: 44,
        code: 'SnapShot'
    },
    insert: {
        key: 'Insert',
        keyCode: 45,
        code: 'Insert'
    },
    ins: {
        key: 'Insert',
        keyCode: 45,
        code: 'Insert'
    },
    delete: {
        key: 'Delete',
        keyCode: 46,
        code: 'Delete'
    },
    del: {
        key: 'Delete',
        keyCode: 46,
        code: 'Delete'
    },
    help: {
        key: 'Help',
        keyCode: 47,
        code: 'Help'
    },
    scrollLock: {
        key: 'ScrollLock',
        keyCode: 145,
        code: 'ScrollLock'
    },
    ',': {
        key: ',',
        keyCode: 188,
        code: 'Comma'
    },
    '<': {
        key: '<',
        keyCode: 188,
        code: 'Comma'
    },
    '.': {
        key: '.',
        keyCode: 190,
        code: 'Period'
    },
    '>': {
        key: '>',
        keyCode: 190,
        code: 'Period'
    },
    '/': {
        key: '/',
        keyCode: 191,
        code: 'Slash'
    },
    '?': {
        key: '?',
        keyCode: 191,
        code: 'Slash'
    },
    '`': {
        key: '`',
        keyCode: 192,
        code: 'Backquote'
    },
    '~': {
        key: '~',
        keyCode: 192,
        code: 'Backquote'
    },
    '[': {
        key: '[',
        keyCode: 219,
        code: 'BracketLeft'
    },
    '{': {
        key: '{',
        keyCode: 219,
        code: 'BracketLeft'
    },
    '\\': {
        key: '\\',
        keyCode: 220,
        code: ''
    },
    '|': {
        key: '|',
        keyCode: 220,
        code: ''
    },
    ']': {
        key: ']',
        keyCode: 221,
        code: 'BracketRight'
    },
    '}': {
        key: ']',
        keyCode: 221,
        code: 'BracketRight'
    },
    "'": {
        key: "'",
        keyCode: 222,
        code: 'Quote'
    },
    '"': {
        key: '"',
        keyCode: 222,
        code: 'Quote'
    },
    ';': {
        key: ';',
        keyCode: 186,
        code: 'Semicolon'
    },
    ':': {
        key: ';',
        keyCode: 186,
        code: 'Semicolon'
    },
    '-': {
        key: '-',
        keyCode: 189,
        code: 'Minus'
    },
    '_': {
        key: '_',
        keyCode: 189,
        code: 'Minus'
    },
    '=': {
        key: '=',
        keyCode: 187,
        code: 'Equal'
    },
    'equal': {
        key: '+',
        keyCode: 187,
        code: 'Equal'
    },

    // 0-9
    '0': {
        key: '0',
        keyCode: 48,
        code: 'Digit0'
    },
    ')': {
        key: ')',
        keyCode: 48,
        code: 'Digit0'
    },
    '1': {
        key: '1',
        keyCode: 49,
        code: 'Digit1'
    },
    '!': {
        key: '!',
        keyCode: 49,
        code: 'Digit1'
    },
    '2': {
        key: '2',
        keyCode: 50,
        code: 'Digit2'
    },
    '@': {
        key: '@',
        keyCode: 50,
        code: 'Digit2'
    },
    '3': {
        key: '3',
        keyCode: 51,
        code: 'Digit3'
    },
    '#': {
        key: '#',
        keyCode: 51,
        code: 'Digit3'
    },
    '4': {
        key: '4',
        keyCode: 52,
        code: 'Digit4'
    },
    '$': {
        key: '$',
        keyCode: 52,
        code: 'Digit4'
    },
    '5': {
        key: '5',
        keyCode: 53,
        code: 'Digit5'
    },
    '%': {
        key: '%',
        keyCode: 53,
        code: 'Digit5'
    },
    '6': {
        key: '6',
        keyCode: 54,
        code: 'Digit6'
    },
    '^': {
        key: '^',
        keyCode: 54,
        code: 'Digit6'
    },
    '7': {
        key: '7',
        keyCode: 55,
        code: 'Digit7'
    },
    '&': {
        key: '&',
        keyCode: 55,
        code: 'Digit7'
    },
    '8': {
        key: '8',
        keyCode: 56,
        code: 'Digit8'
    },
    '*': {
        key: '*',
        keyCode: 56,
        code: 'Digit8'
    },
    '9': {
        key: '9',
        keyCode: 57,
        code: 'Digit9'
    },
    '(': {
        key: '(',
        keyCode: 57,
        code: 'Digit9'
    },

    // numpad
    numpad0: {
        key: '0',
        keyCode: 96,
        code: 'Numpad0'
    },
    numpad1: {
        key: '1',
        keyCode: 97,
        code: 'Numpad1'
    },
    numpad2: {
        key: '2',
        keyCode: 98,
        code: 'Numpad2'
    },
    numpad3: {
        key: '3',
        keyCode: 99,
        code: 'Numpad3'
    },
    numpad4: {
        key: '4',
        keyCode: 100,
        code: 'Numpad4'
    },
    numpad5: {
        key: '5',
        keyCode: 101,
        code: 'Numpad5'
    },
    numpad6: {
        key: '6',
        keyCode: 102,
        code: 'Numpad6'
    },
    numpad7: {
        key: '7',
        keyCode: 103,
        code: 'Numpad7'
    },
    numpad8: {
        key: '8',
        keyCode: 104,
        code: 'Numpad8'
    },
    numpad9: {
        key: '9',
        keyCode: 105,
        code: 'Numpad9'
    },
    numpadDivide: {
        key: '/',
        keyCode: 111,
        code: 'NumpadDivide'
    },
    numpadMultiply: {
        key: '*',
        keyCode: 106,
        code: 'NumpadMultiply'
    },
    numpadSubtract: {
        key: '-',
        keyCode: 109,
        code: 'NumpadSubtract'
    },
    numpadAdd: {
        key: '+',
        keyCode: 107,
        code: 'NumpadAdd'
    },
    numpadEnter: {
        key: '+',
        keyCode: 109,
        code: 'NumpadEnter'
    },

    // a-z
    a: {
        key: 'a',
        keyCode: 65,
        code: 'KeyA'
    },
    A: {
        key: 'A',
        keyCode: 65,
        code: 'KeyA'
    },
    b: {
        key: 'b',
        keyCode: 66,
        code: 'KeyB'
    },
    B: {
        key: 'B',
        keyCode: 66,
        code: 'KeyB'
    },
    c: {
        key: 'c',
        keyCode: 67,
        code: 'KeyC'
    },
    C: {
        key: 'C',
        keyCode: 67,
        code: 'KeyC'
    },
    d: {
        key: 'd',
        keyCode: 68,
        code: 'KeyD'
    },
    D: {
        key: 'D',
        keyCode: 68,
        code: 'KeyD'
    },
    e: {
        key: 'e',
        keyCode: 69,
        code: 'KeyE'
    },
    E: {
        key: 'E',
        keyCode: 69,
        code: 'KeyE'
    },
    f: {
        key: 'f',
        keyCode: 70,
        code: 'KeyF'
    },
    F: {
        key: 'F',
        keyCode: 70,
        code: 'KeyF'
    },
    g: {
        key: 'g',
        keyCode: 71,
        code: 'KeyG'
    },
    G: {
        key: 'G',
        keyCode: 71,
        code: 'KeyG'
    },
    h: {
        key: 'h',
        keyCode: 72,
        code: 'KeyH'
    },
    H: {
        key: 'H',
        keyCode: 72,
        code: 'KeyH'
    },
    i: {
        key: 'i',
        keyCode: 73,
        code: 'KeyI'
    },
    I: {
        key: 'I',
        keyCode: 73,
        code: 'KeyI'
    },
    j: {
        key: 'j',
        keyCode: 74,
        code: 'KeyJ'
    },
    J: {
        key: 'J',
        keyCode: 74,
        code: 'KeyJ'
    },
    k: {
        key: 'k',
        keyCode: 75,
        code: 'KeyK'
    },
    K: {
        key: 'K',
        keyCode: 75,
        code: 'KeyK'
    },
    l: {
        key: 'l',
        keyCode: 76,
        code: 'KeyL'
    },
    L: {
        key: 'L',
        keyCode: 76,
        code: 'KeyL'
    },
    m: {
        key: 'm',
        keyCode: 77,
        code: 'KeyM'
    },
    M: {
        key: 'M',
        keyCode: 77,
        code: 'KeyM'
    },
    n: {
        key: 'n',
        keyCode: 78,
        code: 'KeyN'
    },
    N: {
        key: 'N',
        keyCode: 78,
        code: 'KeyN'
    },
    o: {
        key: 'o',
        keyCode: 79,
        code: 'KeyO'
    },
    O: {
        key: 'O',
        keyCode: 79,
        code: 'KeyO'
    },
    p: {
        key: 'p',
        keyCode: 80,
        code: 'KeyP'
    },
    P: {
        key: 'P',
        keyCode: 80,
        code: 'KeyP'
    },
    q: {
        key: 'q',
        keyCode: 81,
        code: 'KeyQ'
    },
    Q: {
        key: 'Q',
        keyCode: 81,
        code: 'KeyQ'
    },
    r: {
        key: 'r',
        keyCode: 82,
        code: 'KeyR'
    },
    R: {
        key: 'R',
        keyCode: 82,
        code: 'KeyR'
    },
    s: {
        key: 's',
        keyCode: 83,
        code: 'KeyS'
    },
    S: {
        key: 'S',
        keyCode: 83,
        code: 'KeyS'
    },
    t: {
        key: 't',
        keyCode: 84,
        code: 'KeyT'
    },
    T: {
        key: 'T',
        keyCode: 84,
        code: 'KeyT'
    },
    u: {
        key: 'u',
        keyCode: 85,
        code: 'KeyU'
    },
    U: {
        key: 'U',
        keyCode: 85,
        code: 'KeyU'
    },
    v: {
        key: 'v',
        keyCode: 86,
        code: 'KeyV'
    },
    V: {
        key: 'V',
        keyCode: 86,
        code: 'KeyV'
    },
    w: {
        key: 'w',
        keyCode: 87,
        code: 'KeyW'
    },
    W: {
        key: 'W',
        keyCode: 87,
        code: 'KeyW'
    },
    x: {
        key: 'x',
        keyCode: 88,
        code: 'KeyX'
    },
    X: {
        key: 'X',
        keyCode: 88,
        code: 'KeyX'
    },
    y: {
        key: 'y',
        keyCode: 89,
        code: 'KeyY'
    },
    Y: {
        key: 'Y',
        keyCode: 89,
        code: 'KeyY'
    },
    z: {
        key: 'z',
        keyCode: 90,
        code: 'KeyZ'
    },
    Z: {
        key: 'Z',
        keyCode: 90,
        code: 'KeyZ'
    },

    // macos
    command: {
        key: 'Meta',
        keyCode: 91,
        code: 'MetaLeft'
    },
    commandLeft: {
        key: 'Meta',
        keyCode: 91,
        code: 'MetaLeft'
    },
    commandRight: {
        key: 'Meta',
        keyCode: 93,
        code: 'MetaRight'
    },
}

if (userAgent.match('Firefox')) {
    keyNames[";"].keyCode = 59;
    keyNames["-"].keyCode = 173;
    keyNames["="].keyCode = 61;
}
if (platform.match('Mac') && (userAgent.match('Safari') || userAgent.match('Chrome'))) {
    keyNames.commandLeft.keyCode  = 91;
    keyNames.commandRight.keyCode = 93;
} else if(platform.match('Mac') && userAgent.match('Opera')) {
    keyNames.commandLeft.keyCode  = 17;
    keyNames.commandRight.keyCode = 17;
} else if(platform.match('Mac') && userAgent.match('Firefox')) {
    keyNames.commandLeft.keyCode  = 224;
    keyNames.commandRight.keyCode = 224;
}

export const isMac = Boolean(platform.match('Mac'));
export type EventType = 'key' | 'keyCode' | 'code';
export type ValidKeys = keyof typeof keyNames;
export default keyNames as Readonly<typeof keyNames>;