export function getBrowserWidth() {
    if (window.innerWidth < 576) {
        return 'xs';
    } else if (window.innerWidth < 768) {
        return 'sm';
    } else if (window.innerWidth < 992) {
        return 'md';
    } else if (window.innerWidth < 1200) {
        return 'lg';
    } else if (window.innerWidth < 1600) {
        return 'xl';
    } else {
        return 'xxl';
    }
};
