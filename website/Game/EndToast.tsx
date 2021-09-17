import React from 'react';
import { useI18n } from '../App';
import styles from './EndToast.module.scss';

const transitions = {
    en: {
        success: 'Success!',
        failed: 'You failed!',
        tip: 'Automatically turns off after 5 seconds...',
    },
    zh: {
        success: '哥们儿牛逼🐮!',
        failed: '哥们儿没顶住啊！',
        tip: '5秒后自动关闭...',
    },
} as const;

const EndToast: React.FC<{ type: 'success' | 'failed'; }> = ({ type }) => {
    const i18n = useI18n(transitions);

    return (
        <div className={styles.wrapper}>
            {i18n[type]}
            <div>{i18n.tip}</div>
        </div>
    );
}

export default EndToast;