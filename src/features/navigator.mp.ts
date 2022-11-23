import assert from 'assert';
import URL from 'url';
import { Feature } from '../types/Feature';
import { OakNavigateToParameters } from '../types/Page';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';
import { EntityDict } from 'oak-domain/lib/types';

export class Navigator extends Feature {
    private constructUrl(url: string, state?: Record<string, any>) {
        const urlParse = URL.parse(url, true);
        const { pathname, search } = urlParse as {
            pathname: string;
            search: string;
        };
        if (!/^\/{1}/.test(pathname)) {
            assert(false, 'url前面必须以/开头');
        }
        // 格式:/house/list 前面加上/pages 后面加上/index
        if (
            pathname?.indexOf('pages') !== -1 ||
            pathname?.lastIndexOf('index') !== -1
        ) {
            assert(false, 'url两边不需要加上/pages和/index');
        }
        const pathname2 = `/pages${pathname}/index`;
        let search2 = search;
        if (state) {
            for (const param in state) {
                if (!search2) {
                    search2 = '?';
                }
                if (state[param] !== undefined) {
                    search2 += `&${param}=${
                        typeof state[param] === 'string'
                            ? state[param]
                            : JSON.stringify(state[param])
                    }`;
                }
            }
        }
        const url2 = URL.format({
            pathname: pathname2,
            search: search2,
        });

        return url2;
    }

    navigateTo<ED extends EntityDict & BaseEntityDict, T2 extends keyof ED>(
        options: { url: string } & OakNavigateToParameters<ED, T2>,
        state?: Record<string, any>
    ) {
        const { url, ...rest } = options;

        const url2 = this.constructUrl(url, Object.assign({}, rest, state));
        return new Promise((resolve, reject) => {
            wx.navigateTo({
                url: url2,
                success: () => resolve(undefined),
                fail: (err) => reject(err),
            });
        });
    }

    redirectTo<ED extends EntityDict & BaseEntityDict, T2 extends keyof ED>(
        options: { url: string } & OakNavigateToParameters<ED, T2>,
        state?: Record<string, any>
    ) {
        const { url, ...rest } = options;
        const url2 = this.constructUrl(url, Object.assign({}, rest, state));
        return new Promise((resolve, reject) => {
            wx.redirectTo({
                url: url2,
                success: () => resolve(undefined),
                fail: (err) => reject(err),
            });
        });
    }

    navigateBack(delta?: number) {
        return new Promise((resolve, reject) => {
            wx.navigateBack({
                delta: delta || 1,
                success: () => resolve(undefined),
                fail: (err) => reject(err),
            });
        });
    }
}