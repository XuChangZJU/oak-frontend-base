
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';
import { ED } from '../../types/AbstractComponent';
import { EntityDict } from 'oak-domain/lib/types/Entity';
import { resolvePath } from '../../utils/usefulFn';
import { StorageSchema } from 'oak-domain/lib/types/Storage';
import { ActionDef } from '../../types/Page';
import { NamedFilterItem } from '../../types/NamedCondition';

type Filter = NamedFilterItem<EntityDict & BaseEntityDict, string | number>;

export default OakComponent({
    entity() {
        const { entity } = this.props;
        return entity!;
    },
    isList: true,
    properties: {
        entity: '' as keyof ED,
        attributes: [] as string[],
        placeholder: '',
    },
    data: {
        searchValue: '',
    },
    lifetimes: {
    },
    listeners: {
    },
    methods: {
        searchChange(value: string) {
            const searchValue = value.trim();
            this.setState({
                searchValue: value,
            })
            if (!searchValue) {
                this.removeNamedFilterByName('search', true);
                return;
            }
            this.addFilterFn(value);
        },
        addFilterFn(searchValue: string) {
            const { attrbutes } = this.props as { attrbutes: string[] };
            if (!attrbutes || !attrbutes.length) {
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
                const filters: Filter[] = attrbutes?.map((ele) => {
                    let filter;
                    if (!ele.includes('.')) {
                        return {
                            filter: {
                                $text: {
                                    $search: searchValue,
                                }
                            },
                            '#name': ele,
                        }
                    }
                    const attrArr = ele.split('.');
                    let obj = {} as any;
                    Object.assign(obj, { [attrArr[0]]: {} })
                    for (let i = 0; i < attrArr.length - 1; i++) {
                        obj[attrArr[i]] = { [attrArr[i + 1]]: {} };
                        if (i === attrArr.length - 2) {
                            obj[attrArr[i + 1]] = {
                                $text: {
                                    $search: searchValue
                                }
                            }
                        }
                    }
                    return {
                        filter: {
                            obj,
                        }
                    }
                }) || [];
                this.addNamedFilter({
                    filter: {
                        $or: filters,
                    },
                    '#name': 'search'
                })
                
            }
        },
        searchChangeMp(event: WechatMiniprogram.Input) {
            const { value } = event.detail;
            const searchValue = value.trim();
            if (!searchValue) {
                this.removeNamedFilterByName('search', true);
                return;
            }
            this.addFilterFn(value);
            this.setState({
                searchValue: value,
            })
        },
        searchClear() {
            this.removeNamedFilterByName('search', true);
            this.setState({
                searchValue: '',
            })
        },
        searchConfirm(value: string) {
            const { searchValue } = this.state;
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
                })
                this.removeNamedFilterByName('search', true);
                return;
            }
            this.refresh();
        },
    },
});
