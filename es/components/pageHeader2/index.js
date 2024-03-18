export default OakComponent({
    isList: false,
    methods: {
        goBack(delta) {
            this.navigateBack(delta);
        },
    },
    formData({ features }) {
        const menus = features.contextMenuFactory.menus;
        const namespace = features.navigator.getNamespace();
        const location = features.navigator.getLocation();
        const pathname = location.pathname; //当前路由path
        // const pathname2 = pathname.endsWith('/') ? pathname.substring(0, pathname.length - 1) : pathname
        const allowBack = !menus?.find((ele) => features.navigator
            .getPathname(ele.url || '', namespace)
            ?.toLocaleLowerCase() === pathname?.toLocaleLowerCase());
        return {
            allowBack,
        };
    },
});
