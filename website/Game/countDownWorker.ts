
const transitions = {
    en: {
        title: 'Hold on for 60 seconds',
        title1: 'Hold on for',
        title2: 'seconds',
        success: 'Success!',
        failed: "Failed!"
    },
    zh: {
        title: '是男人就坚持 60 秒',
        title1: '是男人再坚持',
        title2: '秒',
        success: '铁血纯爷们！',
        failed: '手残小菜比！',
    },
} as const;

function endGame(countDown: HTMLElement, type: 'success' | 'failed') {
    const i18n = transitions[countDown.dataset.locale as 'en' ?? 'en'];
    countDown.style.width = countDown.dataset.locale === 'en' ? '68px' : '126px';
    countDown.dataset.title = i18n[type];
}

function updateDOM(countDown: HTMLElement, type: 'seconds' | 'milliseconds', successCb?: Function) {
    const i18n = transitions[countDown.dataset.locale as 'en' ?? 'en'];

    const remainderTime = +countDown.dataset.endTime! - Date.now();
    if (remainderTime < 0) {
        successCb?.();
        countDown.dataset.hasEnd = 'true';
    } else {
        countDown.style.width = countDown.dataset.locale === 'en' ? '288px' : '242px';
        countDown.dataset.title = `${i18n.title1} ${type === 'seconds' ? Math.round(remainderTime / 1000) : (remainderTime / 1000).toFixed(3)} ${i18n.title2}`;
    }
}

function createCountDownWorker() {
    function codeFunction() {
        let timer: number | null = null;
        this.onmessage = (evt: MessageEvent) => {
            const { data: command } = evt;
            if (timer) clearInterval(timer);
            if (command === "stop") {
                timer = null;
            } else {
                this.postMessage?.('');
                timer = setInterval(() => this.postMessage?.(''), 1000);
            }
        }
    }

    const blob = new Blob([`(${codeFunction.toString()})()`], {
        type: 'application/javascript'
    });
    return new Worker(URL.createObjectURL(blob));
}


class UpdateSet {
    set: Set<HTMLElement>;
    state: 'run' | 'stop';
    type: 'seconds' | 'milliseconds';
    worker: Worker | ReturnType<typeof requestAnimationFrame> | null;
    successCb?: Function;

    constructor(type: 'seconds' | 'milliseconds') {
        this.type = type;
        this.set = new Set<HTMLElement>();
        this.state = 'stop';
        if (type === 'seconds') {
            this.worker = createCountDownWorker();
            this.worker.onmessage = () => this.update();
        } else this.worker = null;
    }

    public add = (CountDownDOM: HTMLElement) => {
        if (!CountDownDOM) return;
        CountDownDOM.dataset.hasEnd = 'false';
        this.set.add(CountDownDOM);
        this.checkSizeToRunOrStop();
    }

    public delete = (CountDownDOM: HTMLElement) => {
        this.set.delete(CountDownDOM);
        this.checkSizeToRunOrStop();
    }

    private checkSizeToRunOrStop = () => {
        if (this.state === 'stop') {
            if (this.set.size > 0) this.run();
        } else {
            if (this.set.size === 0) this.stop();
        }
    }

    private run = () => {
        this.state = 'run';
        if (this.type === 'milliseconds')
            this.worker = requestAnimationFrame(this.update);
        else
            (this.worker as Worker).postMessage('start');
    }

    public stop = () => {
        this.set.clear();
        this.state = 'stop';
        if (this.type === 'milliseconds') {
            cancelAnimationFrame(this.worker as number)
            this.worker = null;
        } else (this.worker as Worker).postMessage('stop');
    }

    private update = () => {
        this.set.forEach((countDown) => {
            if (countDown.parentNode && countDown.dataset.hasEnd === 'false') updateDOM(countDown, this.type, this.successCb);
            else this.delete(countDown);
        });
        if (this.type === 'milliseconds' && this.state !== 'stop') this.worker = requestAnimationFrame(this.update);
    }
}

class CountDownWorker {
    updateSet: {
        seconds: UpdateSet;
        milliseconds: UpdateSet;
    }
    constructor() {
        this.updateSet = {
            seconds: new UpdateSet('seconds'),
            milliseconds: new UpdateSet('milliseconds')
        };
    }

    public startCountDown = (countDown: HTMLElement, type: 'milliseconds' | 'seconds' = 'milliseconds', successCb: Function) => {
        countDown.style.width = type === 'seconds' ? '188px' : '232px';
        if (type === 'milliseconds') {
            this.updateSet.seconds.delete(countDown);
            this.updateSet.milliseconds.add(countDown);
            this.updateSet.milliseconds.successCb = successCb;
        }
        else {
            this.updateSet.milliseconds.delete(countDown);
            this.updateSet.seconds.add(countDown);
            this.updateSet.seconds.successCb = successCb;
        }
    }

    public endGame = (countDown: HTMLElement, type: 'success' | 'failed') => {
        this.updateSet.seconds.delete(countDown);
        this.updateSet.milliseconds.delete(countDown);
        endGame(countDown, type);
    }

    public clear = () => {
        this.updateSet.seconds.stop();
        this.updateSet.milliseconds.stop();
    }
}

const countDownWorker = new CountDownWorker();
export default countDownWorker;
