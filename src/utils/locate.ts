import { isWeiXin } from './utils';

async function locateWechat() {
    return wx.getLocation({});
}

async function locateWeb(): Promise<{ latitude: number, longitude: number }> {
    if ('geolocation' in navigator) {
        return new Promise(
            (resolve, reject) => {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        resolve(position.coords as { latitude: number, longitude: number });
                    },
                    (err) => {
                        console.error(err);
                        reject(err);
                    }
                );
            }
        )
    } else {
        throw new Error('浏览器不支持定位');
    }
}

export async function locate(): Promise<{ latitude: number, longitude: number }> {
    if (isWeiXin) {
        // 先尝试微信定位
        try {
            const result = await locateWechat();
            return result;
        }
        catch(err) {
            console.warn(err);
            const result2 = await locateWeb();
            return result2;
        }
    }
    else {
        const result2 = await locateWeb();
        return result2;
    }
}