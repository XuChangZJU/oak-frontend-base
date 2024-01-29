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
        const currentPath = location.pathname; //当前路由path
        const allowBack = !menus?.find((ele) => features.navigator
            .getPathname(ele.url || '', namespace)
            ?.toLocaleLowerCase() === currentPath?.toLocaleLowerCase());
        return {
            allowBack,
        };
    }
});
