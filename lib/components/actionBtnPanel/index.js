"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = OakComponent({
    isList: false,
    properties: {
        entity: '',
        items: [],
        mode: 'cell',
        column: 3,
    },
    data: {
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
            const { item, type } = e.currentTarget.dataset;
            if (type === 'popover') {
                const popover = this.selectComponent('#popover');
                popover.onHide();
            }
            if (item.alerted) {
                const dialog = this.selectComponent('#my-action-btn-dialog');
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
        getItemsByMp() {
            const { oakLegalActions, items, column } = this.state;
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
            let newItems = items2;
            let moreItems = [];
            if (column && items2.length > column) {
                newItems = [...items2].splice(0, column);
                moreItems = [...items2].splice(column, items2.length);
            }
            this.setState({
                newItems,
                moreItems,
            });
        },
        handleMoreClick(e) {
            // 获取按钮元素的坐标信息
            var id = e.currentTarget.id;
            // let scrollTop = 0;
            // wx.createSelectorQuery()
            //     .selectViewport()
            //     .scrollOffset(function (res) {
            //         scrollTop = res.scrollTop;
            //     })
            //     .exec();
            const popover = this.selectComponent('#popover');
            wx.createSelectorQuery()
                .in(this)
                .select('#' + id)
                .boundingClientRect((res) => {
                popover.onDisplay(res);
            })
                .exec();
        },
    },
});
