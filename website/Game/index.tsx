import React, { useState, useEffect, useCallback, useRef, useContext } from 'react';
import Bubble from './Bubble';
import Keyboard from '../../src';
import { List, Button, Toast } from 'react-customize-ui'; // Thanks to the components I wrote a few years ago...
import { uniqueId, cloneDeep, clamp } from 'lodash-es';
import { observable, autorun } from '@formily/reactive'
import countDownWorker from './countDownWorker';
import styles from './index.module.scss';
import { useI18n, LocaleContext } from '../App';
import FailedToast from './EndToast';

const specialPools1 = [
    'up->up->down->down->left->right->left->right->b->a',
    'c->u->s->t->o->m->k->e->y->b->o->a->r->d',
];

const specialPools2 = [
    '1+2+3+4+5+6+7+8+9+0+-+equal',
    'a+s+d+f+g+h+j+k'
];

const randomPool1 = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'];
randomPool1.push(...Array.from({ length: 26 }, (_, index) => String.fromCharCode(index + 97)));
const randomPool2 = ['enter'];

function getRandomIntInclusive(min: number, max: number) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function createRandomBindKeys(SpecialCharacter = false, NkeyRollover = false) {
    const randomInt = getRandomIntInclusive(0, 5);
    if (randomInt <= 4) {
        const randomPool = SpecialCharacter ? [...randomPool1, ...randomPool2] : randomPool1;
        const isCombine = getRandomIntInclusive(0, 1) === 0;
        const tempArr: Array<string> = [];
        let temp = 0;
        while (temp < randomInt + 1) {
            const randomPick = randomPool[getRandomIntInclusive(0, randomPool.length - 1)];
            if (!tempArr.includes(randomPick)) {
                tempArr.push(randomPick);
                temp++;
            }
        }
        return tempArr.join(isCombine ? '+' : '->');
    } else {
        const pools = NkeyRollover ? [...specialPools1, ...specialPools2] : specialPools1;
        return pools[getRandomIntInclusive(0, pools.length - 1)];
    }
}

const transitions = {
    en: {
        title: 'Hold on for 60 seconds',
        description: 'Enter the key combination corresponding to the square to eliminate it, and the game will fail if you exceed the specified number.',
        failureConditions: 'Fails beyond this number',
        addedInterval: 'Interval of new squares (ms)',
        judgeInterval: 'sequence judgment interval (ms)',
        combinationStrictOrder: 'Combination keys enabled strict order detection(For Example: "a + b + c", only a、b、c are allowed to be pressed in sequence, not a、c、b)',
        enableSpecialCharacters: 'Enable special characters',
        supportNKeyRollover: 'Does your keyboard support N-key rollover? (Press more than 7 keys at the same time)',
        randomAdd: 'Random position added',
        eliminationOnlyBottom: 'Allow elimination from the bottom only',
        currentCombination: 'Current input key combination: ',
        currentSequence: 'Current input key sequence: ',
    },
    zh: {
        title: '是男人就坚持 60 秒',
        description: '输入方块对应的按键组合来消除它，超过指定数量则游戏失败。',
        failureConditions: '超过此数量失败',
        addedInterval: '方块新增的间隔(毫秒)',
        judgeInterval: '顺序点击判定间隔(毫秒)',
        combinationStrictOrder: '组合输入启用严格顺序检测(如 a + b + c，只允许依次按下a、b、c，不允许a、c、b)',
        enableSpecialCharacters: '启用特殊字符',
        supportNKeyRollover: '你的键盘支持全键无冲吗？(同时按下7个以上键位)',
        randomAdd: '随机位置新增',
        eliminationOnlyBottom: '只允许消除底部',
        currentCombination: '当前输入的组合按键：',
        currentSequence: '当前输入的顺序按键：',
    },
} as const;

function Game() {
    const i18n = useI18n(transitions);
    const { locale } = useContext(LocaleContext);
    const countDown = useRef<HTMLDivElement>(null!);

    const [gameStatus, setGameStatus] = useState<'pending' | 'ongoing'>('pending');

    const [failNum, setFailNum] = useState(10);
    const handleFailNumChange = useCallback<React.ChangeEventHandler<HTMLInputElement>>((evt) => setFailNum(clamp(5, +evt.target.value, 14)), []);
    const [intervalNum, setIntervalNum] = useState(2000);
    const handleIntervalNumChange = useCallback<React.ChangeEventHandler<HTMLInputElement>>((evt) => setIntervalNum(clamp(2000, +evt.target.value, 8000)), []);
    const [combinationStrictOrder, setCombinationStrictOrder] = useState(false);
    const handleCombinationStrictOrderChange = useCallback<React.ChangeEventHandler<HTMLInputElement>>((evt) => setCombinationStrictOrder(evt.target.checked), []);
    const [NkeyRollover, setNkeyRollover] = useState(false);
    const handleNkeyRolloverChange = useCallback<React.ChangeEventHandler<HTMLInputElement>>((evt) => setNkeyRollover(evt.target.checked), []);
    const [eliminationOnlyBottom, setEliminationOnlyBottom] = useState(false);
    const handleEliminationOnlyBottomChange = useCallback<React.ChangeEventHandler<HTMLInputElement>>((evt) => setEliminationOnlyBottom(evt.target.checked), []);
    const [randomAdd, setRandomAdd] = useState(false);
    const handleRandomAddChange = useCallback<React.ChangeEventHandler<HTMLInputElement>>((evt) => setRandomAdd(evt.target.checked), []);
    const [SpecialCharacter, setSpecialCharacter] = useState(false);
    const handleSpecialCharacterChange = useCallback<React.ChangeEventHandler<HTMLInputElement>>((evt) => setSpecialCharacter(evt.target.checked), []);
    const [sequenceInterval, setSequenceInterval] = useState(666);
    const handleSequenceIntervalChange = useCallback<React.ChangeEventHandler<HTMLInputElement>>((evt) => {
        const res = clamp(300, +evt.target.value, 1000);
        setSequenceInterval(res);
        Keyboard.setSequenceInterval(res);
    }, []);

    const [pressedRecord, setPressedRecord] = useState('');
    const [sequenceRecord, setSequenceRecords] = useState('');
    const clearSequenceTimer = useRef<number | undefined>(undefined);
    useEffect(() => {
        Keyboard.pressedRecords['key'] = observable(Keyboard.pressedRecords['key']);
        autorun(() => {
            setPressedRecord(Array.from(Keyboard.pressedRecords['key']).join('+'));
        });
        Keyboard.sequenceRecords['key'] = observable(Keyboard.sequenceRecords['key']);
        autorun(() => {
            setSequenceRecords(Keyboard.sequenceRecords['key'].triggerKey);
        });
    }, []);
    useEffect(() => {
        if (clearSequenceTimer.current) clearTimeout(clearSequenceTimer.current);
        clearSequenceTimer.current = setTimeout(() => setSequenceRecords(''), +sequenceInterval);

        return () => clearTimeout(clearSequenceTimer.current);
    }, [sequenceRecord, sequenceInterval]);

    const [bubbles, setBubbles] = useState<Array<{ bindKeys: string; id: string; key: string; }>>([]);
    const bubblesRef = useRef(bubbles);
    useEffect(() => {
        bubblesRef.current = cloneDeep(bubbles);
    }, [bubbles]);

    const timer = useRef<number | null>(null);

    const onComplete = useCallback((id: string) => {
        setBubbles(pre => {
            if (!eliminationOnlyBottom) return pre.filter(bubble => bubble.id !== id);
            if (id === pre[pre.length - 1].id) return pre.filter(bubble => bubble.id !== id);
            return pre;
        });
    }, [eliminationOnlyBottom]);

    const addBubble = useCallback((randomAdd: boolean, SpecialCharacter: boolean, NkeyRollover: boolean) => {
        setBubbles(pre => {
            const newList = pre.slice();
            const id = uniqueId();
            let randomBindKeys = createRandomBindKeys(SpecialCharacter, NkeyRollover);
            while (pre.find(bubble => bubble.bindKeys === randomBindKeys)) randomBindKeys = createRandomBindKeys(SpecialCharacter, NkeyRollover);
            newList.splice(randomAdd ? Math.floor(Math.random() * pre.length) : 0, 0, {
                id,
                key: id,
                bindKeys: randomBindKeys,
            })
            return newList;
        });
    }, []);
    
    const startGame = useCallback(() => {
        setGameStatus('ongoing');
        if (typeof timer.current === 'number') clearInterval(timer.current);
        setBubbles([]);
        addBubble(randomAdd, SpecialCharacter, NkeyRollover);
        countDown.current.dataset.endTime = Date.now() + 60000 + '';

        const endCallback = (type: 'success' | 'failed') => {
            if (typeof timer.current === 'number') clearInterval(timer.current);
            Keyboard.unmount();
            countDownWorker.endGame(countDown.current, type);
            Toast.show({
                Content: <FailedToast type={type} />,
                duration: 5000,
                showMask: true,
                onClose: () => {
                    setGameStatus('pending');
                    Keyboard.mount();
                    countDown.current.dataset.title = i18n.title;
                    countDown.current.style.width = locale === 'zh' ? '188px' : '242px';
                }
            });
        }
        
        countDownWorker.startCountDown(countDown.current, 'milliseconds', () => endCallback('success'));
        
        timer.current = setInterval(() => {
            if (bubblesRef.current.length >= failNum) return endCallback('failed');
            addBubble(randomAdd, SpecialCharacter, NkeyRollover);
        }, intervalNum);
    }, [failNum, intervalNum, NkeyRollover, SpecialCharacter, randomAdd]);

    return (
        <>
            <header className={styles.header}>
                <div ref={countDown} className={styles.textMagic} data-title={i18n.title} data-locale={locale} style={{ width: locale === 'zh' ? '188px' : '242px' }}><div/></div>
            </header>
            {gameStatus !== 'ongoing' &&
                <div className={styles.operation}>
                    <div className={styles.description}>{i18n.description}</div>
                    <div className={styles.condition}>
                        {i18n.failureConditions}
                        <input type="number" min="5" max="14" value={failNum} onChange={handleFailNumChange} tabIndex={-1}/>(5 - 14)
                    </div>
                    <div className={styles.condition}>
                        {i18n.addedInterval}
                        <input type="number" min="2000" max="8000" value={intervalNum} onChange={handleIntervalNumChange} tabIndex={-1}/>(2000 - 8000)
                    </div>
                    <div className={styles.condition}>
                        {i18n.judgeInterval}
                        <input type="number" min="300" max="1000" value={sequenceInterval} onChange={handleSequenceIntervalChange} tabIndex={-1}/>(300 - 1000)
                    </div>
                    <div className={styles.condition}>
                        {i18n.supportNKeyRollover}
                        <input type="checkbox" checked={NkeyRollover} onChange={handleNkeyRolloverChange} tabIndex={-1}/>
                    </div>
                    <div className={styles.condition}>
                        {i18n.combinationStrictOrder}
                        <input type="checkbox" checked={combinationStrictOrder} onChange={handleCombinationStrictOrderChange} tabIndex={-1}/>
                    </div>
                    <div className={styles.condition}>
                        {i18n.enableSpecialCharacters}
                        <input type="checkbox" checked={SpecialCharacter} onChange={handleSpecialCharacterChange} tabIndex={-1}/>
                    </div>
                    <div className={styles.condition}>
                        {i18n.randomAdd}
                        <input type="checkbox" checked={randomAdd} onChange={handleRandomAddChange} tabIndex={-1}/>
                    </div>
                    <div className={styles.condition}>
                        {i18n.eliminationOnlyBottom}
                        <input type="checkbox" checked={eliminationOnlyBottom} onChange={handleEliminationOnlyBottomChange} tabIndex={-1}/>
                    </div>
                    <Button className={styles.startGame} onClick={startGame} tabIndex={-1} >Start Game</Button>
                </div>
            }

            {gameStatus === 'ongoing' &&
                <>
                    <div className={styles.record}>
                        <div>{i18n.currentCombination} {pressedRecord.replaceAll('+', ' + ')}</div>
                        <div>{i18n.currentSequence} {sequenceRecord.replaceAll('->', ' ➜ ')}</div>
                    </div>
                    <List className={styles.list} list={bubbles} animatedHeight>
                        {(bubble, index) =>
                            <Bubble
                                id={bubble.id}
                                index={index}
                                bindKeys={bubble.bindKeys}
                                onComplete={onComplete}
                                failNum={failNum}
                                isBottom={index === bubbles.length - 1}
                                eliminationOnlyBottom={eliminationOnlyBottom}
                                combinationStrictOrder={combinationStrictOrder}
                                pressedRecord={pressedRecord}
                                sequenceRecord={sequenceRecord}
                            />
                        }
                    </List>
                </>
            }
        </>
    );
}

export default Game;
