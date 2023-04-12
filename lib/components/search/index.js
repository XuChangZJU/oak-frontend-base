"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = OakComponent({
    entity: function () {
        var entity = this.props.entity;
        return entity;
    },
    isList: true,
    properties: {
        entity: '',
        attrbutes: [],
        placeholder: '',
    },
    data: {
        searchValue: '',
    },
    lifetimes: {},
    listeners: {},
    methods: {
        searchChange: function (value) {
            var searchValue = value.trim();
            this.setState({
                searchValue: value,
            });
            if (!searchValue) {
                this.removeNamedFilterByName('search', true);
                return;
            }
            this.addFilterFn(value);
        },
        addFilterFn: function (searchValue) {
            var attrbutes = this.props.attrbutes;
            if (!attrbutes || !attrbutes.length) {
                console.log(searchValue);
                this.addNamedFilter({
                    filter: {
                        $text: {
                            $search: searchValue,
                        },
                    },
                    '#name': 'search'
                });
            }
            else {
                var filters = (attrbutes === null || attrbutes === void 0 ? void 0 : attrbutes.map(function (ele) {
                    var _a, _b;
                    var filter;
                    if (!ele.includes('.')) {
                        return {
                            filter: {
                                $text: {
                                    $search: searchValue,
                                }
                            },
                            '#name': ele,
                        };
                    }
                    var attrArr = ele.split('.');
                    var obj = {};
                    Object.assign(obj, (_a = {}, _a[attrArr[0]] = {}, _a));
                    for (var i = 0; i < attrArr.length - 1; i++) {
                        obj[attrArr[i]] = (_b = {}, _b[attrArr[i + 1]] = {}, _b);
                        if (i === attrArr.length - 2) {
                            obj[attrArr[i + 1]] = {
                                $text: {
                                    $search: searchValue
                                }
                            };
                        }
                    }
                    return {
                        filter: {
                            obj: obj,
                        }
                    };
                })) || [];
                this.addNamedFilter({
                    filter: {
                        $or: filters,
                    },
                    '#name': 'search'
                });
            }
        },
        searchChangeMp: function (event) {
            var value = event.detail.value;
            var searchValue = value.trim();
            if (!searchValue) {
                this.removeNamedFilterByName('search', true);
                return;
            }
            this.addFilterFn(value);
            this.setState({
                searchValue: value,
            });
        },
        searchClear: function () {
            this.removeNamedFilterByName('search', true);
            this.setState({
                searchValue: '',
            });
        },
        searchConfirm: function (value) {
            var searchValue = this.state.searchValue;
            if (!value) {
                this.setMessage({
                    content: '请输入要搜索的内容',
                    type: 'warning',
                });
                return;
            }
            else if (!value && searchValue) {
                this.setState({
                    searchValue: ''
                });
                this.removeNamedFilterByName('search', true);
                return;
            }
            this.refresh();
        },
    },
});
