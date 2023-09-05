import { Feature } from '../types/Feature';
export class Location extends Feature {
    latitude;
    longitude;
    lastTimestamp;
    acceptableLatency;
    constructor(acceptableLatency) {
        super();
        this.acceptableLatency = acceptableLatency || 1000;
    }
    get() {
        return {
            latitude: this.latitude,
            longitude: this.longitude,
            lastTimestamp: this.lastTimestamp,
        };
    }
    async refresh() {
        if (process.env.OAK_PLATFORM === 'wechatMp') {
            // 小程序平台
            const result = await wx.getLocation({
                type: 'gcj02',
            });
            this.latitude = result.latitude;
            this.longitude = result.longitude;
            this.lastTimestamp = Date.now();
        }
        else {
            const getGeolocation = () => new Promise((resolve, reject) => {
                if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition((position) => {
                        // 1. coords.latitude：估计纬度
                        // 2. coords.longitude：估计经度
                        // 3. coords.altitude：估计高度
                        // 4. coords.accuracy：所提供的以米为单位的经度和纬度估计的精确度
                        // 5. coords.altitudeAccuracy：所提供的以米为单位的高度估计的精确度
                        // 6. coords.heading： 宿主设备当前移动的角度方向，相对于正北方向顺时针计算
                        // 7. coords.speed：以米每秒为单位的设备的当前对地速度
                        const coords = position.coords;
                        const location = {
                            accuracy: coords.accuracy,
                            altitude: coords.altitude,
                            altitudeAccuracy: coords.altitudeAccuracy,
                            heading: coords.heading,
                            latitude: coords.latitude,
                            longitude: coords.longitude,
                            speed: coords.speed,
                        };
                        resolve(location);
                    }, (error) => {
                        reject(error);
                    }, {
                        // 指示浏览器获取高精度的位置，默认为false
                        enableHighAccuracy: true,
                        // 指定获取地理位置的超时时间，默认不限时，单位为毫秒
                        timeout: 10000,
                        // 最长有效期，在重复获取地理位置时，此参数指定多久再次获取位置。
                        maximumAge: 3000,
                    });
                }
                else {
                    reject('Your browser does not support Geolocation!');
                }
            });
            const result = (await getGeolocation());
            this.lastTimestamp = Date.now();
            this.latitude = result.latitude;
            this.longitude = result.longitude;
        }
        this.publish();
    }
}
