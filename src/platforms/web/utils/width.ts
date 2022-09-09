import { values as responsiveValues, Width } from '../responsive/context';

export function getBrowserWidth(): Width {
    let width = 'xxl';
    for (let i in responsiveValues) {
        if (window.innerWidth < responsiveValues[i as keyof typeof responsiveValues]) {
            width = i;
            break;
        }
    }
    return width as Width;
};
