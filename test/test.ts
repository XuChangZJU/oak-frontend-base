import { t } from '../src/platforms/wechatMp/i18n/wxs';

const r = t('test', { word: 'ddd'}, {
    'zh-CN': {
        ns: {
            test: '我是一个测试{{word}}',
        }
    },
}, 'zh-CN', 'zh-CN', 'ns', 'ns');

console.log(r);