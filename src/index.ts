import keyNames, { EventType, ValidKeys } from './MapEventKeyCode';
export { isMac } from './MapEventKeyCode';
export type { ValidKeys } from './MapEventKeyCode';

export interface BindOption {
    bindKeys: string | Array<string>;
    eventType?: EventType;
    context?: string | null;
    preventRepeat?: boolean;
    preventSame?: boolean;
    strictOrder?: boolean | 'equal';
    caseSensitive?: boolean;
}

interface SequenceRecordValue {
    triggerKey: string;
    time: number | null;
}

const defaultBindOption: Required<Omit<BindOption, 'bindKeys'>> = {
    eventType: 'key',
    context: null,
    preventRepeat: true,
    strictOrder: false,
    caseSensitive: false,
    preventSame: false,
}

const eventTypes = ['key', 'keyCode', 'code'] as const;

class KeyboardClass {
    private mounted: boolean = false;
    private context: string | null = null;
    private listeners: Listener[] = [];
    private currentListeners: Listener[] = [];
    public pressedRecords = Object.fromEntries(eventTypes.map(eventType => [eventType, new Set()])) as Record<EventType, Set<string | number>>;
    public readonly triggeredRecord = new Map<string, boolean>();
    public readonly sequenceRecords = Object.fromEntries(eventTypes.map(eventType => [eventType, { time: null, triggerKey: '' }])) as Record<EventType, SequenceRecordValue>;
    private sequenceInterval = 666;
    private sequenceMustReleaseLastPress = false;

    static parseBindKeys(bindKeys: BindOption['bindKeys']) {
        if (!Array.isArray(bindKeys) && typeof bindKeys !== 'string') return false;
        if (Array.isArray(bindKeys) && !bindKeys.every(bindKey => typeof bindKey === 'string')) return false;
        if (typeof bindKeys === 'string') bindKeys = [bindKeys];
    
        // omit invalid listenerKey
        bindKeys = bindKeys.filter(bindKey => !(bindKey.includes('->') && bindKey.includes('+')));
        
        let splitKeys: Array<{ type: Listener['type']; keys: Listener['keys'] }> = bindKeys.map(bindKey => ({
            type: bindKey.includes('->') ? 'sequence' : 'combination',
            keys: bindKey.split(/->|\+/).map((listenerKey) => listenerKey.trim() as ValidKeys)
        }));
    
        // omit invalid keyName
        splitKeys = splitKeys.filter(splitKey => splitKey.keys.every(key => keyNames[key]));
    
        if (!splitKeys.length) false;
        return splitKeys;
    }

    public bind = (bindOption: BindOption['bindKeys'] | BindOption, pressDownExecutor?: (() => void) | null, pressUpExecutor?: () => void) => {
        if (!pressDownExecutor && !pressUpExecutor) return false;

        const bindKeys = (
            typeof bindOption === 'string'
            || (Array.isArray(bindOption) && bindOption.every(bindKey => typeof bindKey === 'string'))
        ) ? bindOption : (bindOption as BindOption)?.bindKeys;
        const parseResult = KeyboardClass.parseBindKeys(bindKeys);
        if (!parseResult) return false;

        const newListeners: Listener[] = parseResult
            .map(
                (validListener) => {
                    const eventType = (typeof bindOption === 'string' || Array.isArray(bindOption)) ? defaultBindOption.eventType : (bindOption?.eventType ?? defaultBindOption.eventType);
                    return new Listener({
                        ...validListener,
                        ...defaultBindOption,
                        ...(typeof bindOption === 'string' ? undefined : bindOption),
                        pressUpExecutor: validListener.type === 'sequence' ? undefined : pressUpExecutor, // Sequential click event without KeyUp handle.
                        pressDownExecutor,
                        triggeredRecord: this.triggeredRecord,
                        pressedRecord: this.pressedRecords[eventType],
                        sequenceRecord: this.sequenceRecords[eventType]
                    });
                }
            )
            .filter((listener) => !(listener.type === 'sequence' && !listener.pressDownExecutor)); // Sequential click events must have KeyDown handle

        this.listeners.push(...newListeners);
        this.updateCurrentListener();
        return newListeners;
    };

    public unbind = (listener: Listener | Listener[]) => {
        const lengthBefore = this.listeners.length;
        const unbindListeners = [];
        if (!(listener instanceof Array)) unbindListeners.push(listener);
        else unbindListeners.push(...listener);

        unbindListeners.forEach((unbindListener) => (this.listeners = this.listeners.filter((listener) => listener !== unbindListener)));
        this.updateCurrentListener();
        if (this.listeners.length === lengthBefore) return false;
        return true;
    };

    private keydownHandler = (event: KeyboardEvent) => {
        if (!event.repeat) {
            eventTypes.forEach(eventType => {
                const eventKey = event[eventType] === '+' ? 'equal' : event[eventType];
                // record pressedKey for combination
                const pressedRecord = this.pressedRecords[eventType];
                pressedRecord.add(eventKey);

                if (this.sequenceMustReleaseLastPress && pressedRecord.size > 1) return;
                // record pressedKey for sequence
                const sequenceRecord = this.sequenceRecords[eventType];
                if (!sequenceRecord.time || ((Date.now() - sequenceRecord.time) > this.sequenceInterval)) {
                    Object.assign(sequenceRecord, {
                        triggerKey: eventKey,
                        time: Date.now(),
                    });
                } else {
                    Object.assign(sequenceRecord, {
                        triggerKey: `${sequenceRecord.triggerKey}->${eventKey}`,
                        time: Date.now(),
                    });
                }
            });
        }

        this.currentListeners
            .forEach((listener) => listener.handlePressDown(event, this.sequenceMustReleaseLastPress));
    };

    private keyupHandler = (event: KeyboardEvent) => {
        this.currentListeners
            .forEach((listener) => listener.handlePressUp(event));

        eventTypes.forEach(eventType => {
            if (event.key === 'Meta') this.pressedRecords[eventType].clear();
            else if (eventType === 'key' && /\b[a-zA-Z]\b/.test(event.key)) {
                this.pressedRecords[eventType].delete(event[eventType].toLowerCase());
                this.pressedRecords[eventType ].delete(event[eventType].toUpperCase());
            } else this.pressedRecords[eventType].delete(event[eventType]);
        });
    };

    private updateCurrentListener = () => {
        this.currentListeners = this.listeners.filter((listener) => listener.context === undefined || listener.context === null || listener.context === this.context);
    };

    public setSequenceInterval = (interval: number) => (this.sequenceInterval = interval);

    public setSequenceMustReleaseLastPress = (bool: boolean) => this.sequenceMustReleaseLastPress = bool;

    public setContext = (context?: string | null) => {
        if (typeof context !== 'string' || context === '') this.context = null;
        else this.context = context;
        this.updateCurrentListener();
    };

    public getCurrentContext = () => this.context;

    public getAllContext = () =>
        Array.from(new Set(this.listeners.filter((listener) => listener.context).map((listener) => listener.context)));

    public getAllListener = () => this.listeners;

    public reset = () => {
        this.context = null;
        this.listeners = [];
        this.currentListeners = [];
    };

    private handleWindowBlur = () => {
        eventTypes.forEach(eventType => {
            this.pressedRecords[eventType].clear();
            this.sequenceRecords[eventType].triggerKey = '';
            this.sequenceRecords[eventType].time = null;
        });
    }

    public mount = () => {
        if (this.mounted) return;
        document.addEventListener('keydown', this.keydownHandler);
        document.addEventListener('keyup', this.keyupHandler);
        window.addEventListener('blur', this.handleWindowBlur);
        this.mounted = true;
    };

    public unmount = () => {
        if (!this.mounted) return;
        document.removeEventListener('keydown', this.keydownHandler);
        document.removeEventListener('keyup', this.keyupHandler);
        window.removeEventListener('blur', this.handleWindowBlur);
        this.mounted = false;
    };
}

export class Listener {
    eventType!: EventType;
    context!: string;
    preventRepeat!: boolean;
    preventSame!: boolean;
    strictOrder!: boolean | 'equal';
    caseSensitive!: boolean;
    type!: 'sequence' | 'combination';
    keys!: Array<ValidKeys>;
    pressUpExecutor?: () => void;
    pressDownExecutor?: (() => void) | null;

    shouldConvertCase!: boolean;
    pressedRecord!:  Set<string | number>;
    sequenceRecord!:  SequenceRecordValue;
    triggeredRecord!: Map<string, boolean>;
    triggerKey!: string;

    constructor(option: any) {
        Object.assign(this, option);
        this.shouldConvertCase = this.eventType === 'key' && !this.caseSensitive;
        this.triggerKey = this.keys.map(key => keyNames[key][this.eventType] === '+' ? 'equal' : keyNames[key][this.eventType]).join(this.type === 'combination' ? '+' : '->');
    }

    isAllKeysPressed = () => {
        for (let key of this.keys) {
            if (
                (this.shouldConvertCase && /\b[a-zA-Z]\b/.test(key))
                    ? (!this.pressedRecord.has(keyNames[key.toUpperCase() as ValidKeys][this.eventType]) &&
                        !this.pressedRecord.has(keyNames[key.toLowerCase() as ValidKeys][this.eventType]))
                    : !this.pressedRecord.has(keyNames[key][this.eventType] === '+' ? 'equal' : keyNames[key][this.eventType])
            ) return false;
        }
        return true;
    }

    handlePressDown = (event: KeyboardEvent, sequenceMustReleaseLastPress: boolean) => {
        switch (this.type) {
            case 'combination':
                this.handleCombinationPressDown(event.repeat);
                break;
            case 'sequence':
                this.handleSequencePressDown(event.repeat, sequenceMustReleaseLastPress);
                break;
        }
    }

    handleCombinationPressDown = (isRepeatEvent: boolean) => {
        if (this.preventRepeat && isRepeatEvent) return;
        if (!this.isAllKeysPressed()) return;

        const pressOrder = Array.from(this.pressedRecord).join('+');
        if (this.strictOrder) {
            if (this.strictOrder === true && pressOrder.indexOf(this.triggerKey) === -1) return;
            if (this.strictOrder === 'equal' && pressOrder !== this.triggerKey) return;
        }

        if (this.preventSame && this.triggeredRecord.get(this.triggerKey)) return;
        this.triggeredRecord.set(this.triggerKey, true);

        this.pressDownExecutor?.();
    }

    handleSequencePressDown = (isRepeatEvent: boolean, sequenceMustReleaseLastPress: boolean) => {
        // sequence listener will never trigger in repeat event.
        if (isRepeatEvent) return;
        if (sequenceMustReleaseLastPress && this.pressedRecord.size > 1) return;

        if (!new RegExp(`${this.triggerKey.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, this.shouldConvertCase ? 'i' : undefined).test(this.sequenceRecord.triggerKey)) return;
        
        if (!sequenceMustReleaseLastPress) this.pressDownExecutor?.();
        else {
            setTimeout(() => {
                if (this.pressedRecord.size > 1) return;
                this.pressDownExecutor?.();
            }, 100);
        }
    }

    /** only for Combination listener. */
    handlePressUp = (event: KeyboardEvent) => {
        if (!this.isAllKeysPressed()) return;
        if (!this.keys.find(key => keyNames[key][this.eventType] === event[this.eventType])) return;

        this.pressUpExecutor?.();
        this.triggeredRecord.delete(this.triggerKey);
    }
}

const Keyboard = new KeyboardClass();
export default Keyboard;
