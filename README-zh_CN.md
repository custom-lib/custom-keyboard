custom-keyboard
=========================

中文 | [English](https://github.com/custom-lib/custom-keyboard/blob/main/READM.md)

**[Demo游戏 -- 是男人就坚持60秒](https://custom-lib.github.io/custom-keyboard/)**

* 支持任意数量的组合按键及其宽松、严格的按下顺序检测（首先键盘得支持n键无冲突）。
* 支持任意数量的顺序按键。
* 支持绑定到 'key' | 'keyCode' | 'code' 三种不同类型的键盘事件。
* 支持绑定到按下事件以及松开事件（顺序按键无松开事件）。
* 支持在不同的上下文间切换事件响应。
* 很轻量，压缩后4kb(gzip)。

## 引入

```bash
npm install --save custom-keyboard
```

## 用法

custom-keyboard 对大部分的键位做了个符合直觉的[预设命名 (点击查看详情)](https://github.com/custom-lib/custom-keyboard/blob/main/src/MapEventKeyCode.ts)，以此实现一套规则绑定到三种不同的键盘事件类型 ('key' | 'keyCode' | 'code')。
开始使用custom-keyboard之前需要mount()一次，当不再需要使用的时候可以unmount()卸载掉事件监听。
符号 '+' 代表组合, '->' 代表顺序，符号与键位之间有无空格都是合法的。

```javascript
import Keyboard from 'custom-keyboard';

Keyboard.mount();

// 组合
Keyboard.bind('a + b', () => {
    console.log('press a + b')
}, () => {
    console.log('release a + b')
});
Keyboard.bind(['q + w+e', 'a+s+d'], () => {
    console.log('q + w + e | a + s + d')
});

// 顺序
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
bindKeys 如果不符合规则，如 有无效的键名、同时出现 '+' 和 '->' 符号等情况，这次bind不生效并且返回值为 false。
成功的bind会返回一个 Listeners 数组，可以用于 unbind(Listeners) 解绑事件;
顺序类型的 bindKeys 写了 pressUpExecutor 也会被忽略。

**eventType** _`:'key' | 'keyCode' | 'code'`_ = 'key'
可选绑定到三种不同标准的键盘事件，[可以参考这里了解区别](https://zh.javascript.info/keyboard-events)。

**preventRepeat (仅 组合类型 有效)** _`:boolean`_ = true
如果一直按着按键不松手，是否重复响应。

**strictOrder (仅 组合类型 有效)** _`:boolean | 'equal'`_ = false

```javascript
Keyboard.bind({
    bindKeys: '2 + 3 + 4',
    strictOrder: false,
}, () => {
    console.log('press 2 + 3 + 4');
});
```

strictOrder 默认为 false。上面的例子中，不管以什么顺序按下2、3、4，只要都按住了，就可以生效。

strictOrder 为 true 时，只在以2、3、4的顺序依次按住时才生效。

strictOrder 为 'equal' 时，如果依次按住1、2、3、4，也不生效，而 strictOrder 为 true 时可以生效。

**caseSensitive (仅 eventType === 'key' 有效)** _`:boolean`_ = false
event.key是大小写敏感的。对于26个字母，如果用户无意间按下了capslock，绑定的监听就不生效了。大部分情境下这是不被期望发生的，所以默认做了大小写脱敏处理。如果不需要这种行为，显式设置这个选项为 true 即可。

**context** _`:string`_ = undefined
可以绑定监听到不同的上下文，如果为 undefined 或者 null，则在所有上下文中生效。

### unbind

```javascript
function unbind(listener: Listener | Array<Listener>): boolean;

const listeners1 = Keyboard.bind('a + b');
Keyboard.unbind(listeners1);
const listeners2 = Keyboard.bind(['a + b', 'b + c']);
Keyboard.unbind(listeners2);
const listeners3 = Keyboard.bind(['q + w', 'e + r']);
Keyboard.unbind(listeners3[0]); // 只解除'e + r'事件， 'q + w'继续运行。
```

### setSequenceInterval
设置顺序按键的检测判定间隔(ms)，默认是 666。

```javascript
function setSequenceInterval(iInterval: number): void;

Keyboard.setSequenceInterval(600);
```

### setSequenceMustReleaseLastPress
设置下一次顺序按键生效需不需要松开上一个已经按下的键，默认是 false 不需要。

```javascript
function setSequenceMustReleaseLastPress(bool: boolean): void;

Keyboard.setSequenceMustReleaseLastPress(true);
```

### 关于 context 上下文

```javascript
function setContext(context: string): void;
function getCurrentContext(): string | null;
function getAllContext(): Array<string>;

Keyboard.setContext('some context');
```

bind 事件的时候可以设置其生效的 context，没填的话会在任何上下文中生效。
getAllContext 可以获取所有bind生效的事件绑定过的context集合。

### reset && getAllListener

```javascript
function reset(): void;
function getAllListener(): Array<Listener>;

// 下面两者是等效的
Keyboard.unbind(Keyboard.getAllListener());
Keyboard.reset();
```

getAllListener 可以获取所有bind生效的事件监听。
reset 可以清空所有已绑定的事件监听。
custom-keyboard 是事件委托形式的，unmount是解绑根监听。

### 注意事项

MacOS下 基于 command 的组合键有个系统级的问题。

当按住command时候再按其他任意键触发组合键，这时候接着按住command,松开其他键，松开的键的 keyup 事件不会被浏览器触发。

所以组合键的 keyup 事件响应松开 command 后才会触发。

## 运行 Demo游戏

Run the demos:

```bash
npm install
npm run start
```

## 打包库

```bash
npm install
npm run build:lib
```

## License

MIT

## custom-lib相关QQ群

![image](https://github.com/custom-lib/custom-keyboard/blob/main/website/assets/qrCode.jpg)
