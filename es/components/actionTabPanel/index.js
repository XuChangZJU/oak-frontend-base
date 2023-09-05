export default OakComponent({
    isList: false,
    data: {
        slideWidth: 0,
        slideLeft: 0,
        slideShow: false,
        commonAction: [
            'create',
            'update',
            'remove',
            'confirm',
            'cancel',
            'grant',
            'revoke',
        ],
    },
    properties: {
        entity: '',
        items: [],
        rows: 2,
        column: 5,
        mode: 'text',
    },
    lifetimes: {
        ready: function () {
            if (process.env.OAK_PLATFORM === 'wechatMp') {
                this.getItemsByMp();
            }
        },
    },
    listeners: {
        items(prev, next) {
            if (process.env.OAK_PLATFORM === 'wechatMp') {
                if (prev.items !== next.items ||
                    prev.items?.length !== next.items?.length) {
                    this.getItemsByMp();
                }
            }
        },
    },
    methods: {
        getActionName(action) {
            const { entity } = this.props;
            const { commonAction } = this.state;
            let text = '';
            if (action) {
                if (commonAction.includes(action)) {
                    text = this.t(`common::action.${action}`);
                }
                else if (entity) {
                    text = this.t(`${entity}:action.${action}`);
                }
            }
            return text;
        },
        getAlertOptions(item) {
            let alertContent = '';
            if (item.action) {
                const text = this.getActionName(item.action);
                alertContent = `确认${text}该数据`;
            }
            return {
                title: item.alertTitle || '温馨提示',
                content: item.alertContent || alertContent,
                okText: item.confirmText || '确定',
                cancelText: item.cancelText || '取消',
            };
        },
        async linconfirm() {
            const { selectItem } = this.state;
            const detail = {
                item: selectItem,
            };
            if (selectItem.click) {
                this.triggerEvent('click', detail);
                return;
            }
        },
        async lincancel() {
            this.setState({
                selectItem: '',
            });
        },
        async handleClick(e) {
            const { item } = e.currentTarget.dataset;
            if (item.alerted) {
                const dialog = this.selectComponent('#my-action-tab-dialog');
                const { title, content, okText, cancelText } = this.getAlertOptions(item);
                dialog.linShow({
                    type: 'confirm',
                    title,
                    content,
                    'confirm-text': okText,
                    'cancel-text': cancelText,
                });
                this.setState({
                    selectItem: item,
                });
                return;
            }
            const detail = {
                item,
            };
            if (item.click) {
                this.triggerEvent('click', detail);
                return;
            }
        },
        scroll(e) {
            this.setData({
                slideLeft: e.detail.scrollLeft * this.state.slideRatio,
            });
        },
        getItemsByMp() {
            const { items, rows, column } = this.state;
            const items2 = items
                .filter((ele) => {
                const { show } = ele;
                const showResult = ele.hasOwnProperty('show') ? show : true;
                return showResult;
            })
                .map((ele) => {
                const { label, action } = ele;
                let text;
                if (label) {
                    text = label;
                }
                else {
                    text = this.getActionName(action);
                }
                return Object.assign(ele, {
                    text: text,
                });
            });
            const count = rows * column;
            let num = 1;
            if (items2.length > 0) {
                num =
                    items2.length % count !== 0
                        ? parseInt((items2.length / count).toString(), 10) + 1
                        : items2.length / count;
            }
            const tabNums = [];
            for (let i = 1; i <= num; i++) {
                tabNums.push(i);
            }
            const res = wx.getSystemInfoSync();
            const _totalLength = tabNums.length * 750; //分类列表总长度
            const _ratio = (100 / _totalLength) * (750 / res.windowWidth); //滚动列表长度与滑条长度比例
            const _showLength = (750 / _totalLength) * 100; //当前显示红色滑条的长度(保留两位小数)
            this.setState({
                tabNums,
                slideWidth: _showLength,
                totalLength: _totalLength,
                slideShow: num > 1,
                slideRatio: _ratio,
                newItems: items2,
                count,
            });
        },
    },
});
