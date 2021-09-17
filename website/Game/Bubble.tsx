import React, { useEffect } from 'react';
import styles from './Bubble.module.scss';
import { clamp } from 'lodash-es';
import Keyboard from '../../src';

interface Props {
    bindKeys: string;
    id: string;
    index: number;
    failNum: number;
    isBottom: boolean;
    eliminationOnlyBottom: boolean;
    combinationStrictOrder: boolean;
    pressedRecord: string;
    sequenceRecord: string;
    onComplete: (id: string) => void;
}

const keyMap = {
    up: 'ArrowUp',
    down: 'ArrowDown',
    left: 'ArrowLeft',
    right: 'ArrowRight',
    equal: '+',
} as const;

function specialKeyReplace(bindKeys: string) {
    let res = bindKeys;
    for (let key in keyMap) {
        res = res.replaceAll(key, keyMap[key as keyof typeof keyMap]);
    }
    return res;
}

function getLongestCommonSubsequence(_str1: string, _str2: string, sign: '+' | '->') {
    let str1 = _str1;
    let str2 = _str2;
    if (str1.length > str2.length) {
        str1 = _str2;
        str2 = _str1;
    }

    const m = str1.length, n = str2.length;
    const dp = new Array(m + 1).fill(0).map(() => new Array(n + 1).fill(0));
    let res = '';
    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            if (str1[i - 1] === str2[j - 1]) {
                dp[i][j] = dp[i - 1][j - 1] + 1;
                if (dp[i][j] > res.length)
                    res = str1.slice(i - dp[i][j], i);
            }
        }
    }

    const pureRes = res.split(sign).filter(key => !!key);
    if (pureRes.length === 1 && pureRes[0] && (!str1.split(sign).includes(pureRes[0]) || !str2.split(sign).includes(pureRes[0]))) return '';
    return res;
};

const Bubble: React.FC<Props> = ({ bindKeys: _bindKeys, id, index, failNum, pressedRecord, sequenceRecord, isBottom, eliminationOnlyBottom, combinationStrictOrder, onComplete }) => {
    const bindKeys = specialKeyReplace(_bindKeys);
    const type = bindKeys.includes('->') ? 'sequence' : 'combination';
    const sign = type === 'combination' ? '+' : '->';
    const record = type === 'combination' ? pressedRecord : sequenceRecord;
    const recordSplit = type === 'combination' && !combinationStrictOrder ? pressedRecord.split(sign).filter(key => !!key) : null;
    const longestCommonSubsequence = (type === 'combination' && combinationStrictOrder || type === 'sequence') ? getLongestCommonSubsequence(record + sign, bindKeys, sign) : '';
    const equalIndex = (type === 'combination' && combinationStrictOrder || type === 'sequence') && bindKeys.startsWith(longestCommonSubsequence) ? longestCommonSubsequence.split(sign).filter(key => !!key).length : -1;

    useEffect(() => {
        const listener = Keyboard.bind({ bindKeys: _bindKeys, preventSame: false, strictOrder: combinationStrictOrder }, () => onComplete(id));

        return () => {
            if (!listener) return;
            Keyboard.unbind(listener);
        }
    }, []);

    return (
        <div
            className={styles.wrapper}
            style={{
                backgroundColor: `rgba(255, 0, 0, ${clamp(Math.round(failNum / 5), (index + 1), failNum) / failNum})`
            }}
        >
            {_bindKeys.split(type === 'combination' ? '+' : '->').map((key, index) =>
                <React.Fragment key={index}>
                    <span
                        className={styles.key}
                        style={{
                            color: type === 'combination' && !combinationStrictOrder ?
                                ((eliminationOnlyBottom ? (isBottom && recordSplit!.includes(key)) : recordSplit!.includes(key)) ? '#000' : '#fff')
                                : ((eliminationOnlyBottom ? (isBottom && index < equalIndex) : index < equalIndex) ? '#000' : '#fff')
                        }}
                    >
                        {key}
                    </span>
                    <span className={styles.split}>{type === 'combination' ? '+' : `➜`}</span>
                </React.Fragment>

            )}
        </div>
    );
}

export default Bubble;
