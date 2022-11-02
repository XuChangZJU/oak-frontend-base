import assert from 'assert';
import { Feature } from '../types/Feature';
import URL from 'url';


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
        let search2 = search || '?';
        if (state) {
            for (const param in state) {
                if (state[param] !== undefined) {
                    search2 += `&${param}=${typeof state[param] === 'string'
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

    navigateTo(url: string, state?: Record<string, any>) {
        const url2 = this.constructUrl(url, state);
        return new Promise(
            (resolve, reject) => {
                wx.navigateTo({
                    url,
                    success: () => resolve(undefined),
                    fail: (err) => reject(err)
                })
            }
        );
    }

    redirectTo(url: string, state?: Record<string, any>) {
        const url2 = this.constructUrl(url, state);
        return new Promise(
            (resolve, reject) => {
                wx.redirectTo({
                    url,
                    success: () => resolve(undefined),
                    fail: (err) => reject(err)
                })
            }
        );
    }

    navigateBack(delta: number = 1) {
        return new Promise(
            (resolve, reject) => {
                wx.navigateBack({
                    delta,
                    success: () => resolve(undefined),
                    fail: (err) => reject(err)
                })
            }
        );
    }
}