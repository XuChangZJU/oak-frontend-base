import React, { useState } from 'react';

import { RowWithActions, WebComponentProps } from '../../../types/Page';
import { ED } from '../../../types/AbstractComponent';

import { Row, Switch, Col, Input, Form } from 'antd';
import ReactEcharts from 'echarts-for-react';
import { uniq } from 'oak-domain/lib/utils/lodash';
import Styles from './web.pc.module.less';


export default function render(
    props: WebComponentProps<
        ED,
        keyof ED,
        true,
        {
            data: Array<{ name: string; x?: number; y?: number }>;
            links: Array<{ source: string; target: string }>;
        },
        {
            onEntityClicked: (entity: string) => void;
        }
    >
) {
    const { data, links } = props.data;
    const { onEntityClicked } = props.methods;
    const [search, setSearch] = useState('');
    const [strict, setStrict] = useState(false);

    const keywords = search && search.split(',');
    let data2 = data;
    let links2 = links;

    if (keywords) {
        if (!strict) {
            links2 = links.filter((ele) => {
                if (
                    keywords.find(
                        (k) => ele.source.includes(k) || ele.target.includes(k)
                    )
                ) {
                    return true;
                }
                return false;
            });
            data2 = uniq(
                links2
                    .map((ele) => ele.source)
                    .concat(links2.map((ele) => ele.target))
            ).map((ele) => ({ name: ele }));
        } else {
            links2 = links.filter((ele) => {
                if (
                    keywords.find(
                        (k) => ele.source.includes(k) && ele.target.includes(k)
                    )
                ) {
                    return true;
                }
                return false;
            });
            data2 = data.filter((ele) => {
                if (keywords.find((k) => ele.name.includes(k))) {
                    return true;
                }
                return false;
            });
        }
    }

    return (
        <div className={Styles.container}>
            <Form
                style={{
                    margin: 20,
                }}
            >
                <Form.Item label="filter">
                    <>
                        <Input
                            onChange={({ currentTarget }) =>
                                setSearch(currentTarget.value)
                            }
                            allowClear
                        />
                    </>
                </Form.Item>
                <Form.Item label="strict mode">
                    <>
                        <Switch
                            checked={strict}
                            onChange={(checked) => setStrict(checked)}
                        />
                    </>
                </Form.Item>
            </Form>
            <ReactEcharts
                style={{ width: '100%', height: '100%', minHeight: 750 }}
                option={{
                    tooltip: {},
                    series: [
                        {
                            type: 'graph',
                            layout: 'force',
                            force: {
                                initLayout: 'circular',
                                gravity: 0,
                                repulsion: [10, 80],
                                edgeLength: [10, 50],
                            },
                            data: data2,
                            links: links2,
                            lineStyle: {
                                opacity: 0.9,
                                width: 2,
                                curveness: 0,
                            },
                            label: {
                                show: true,
                            },
                            autoCurveness: true,
                            roam: true,
                            draggable: true,
                            edgeSymbol: ['none', 'arrow'],
                            edgeSymbolSize: 7,
                            emphasis: {
                                scale: true,
                                label: {
                                    show: true,
                                },
                                focus: 'adjacency',
                                lineStyle: {
                                    width: 10,
                                },
                            },
                        },
                    ],
                }}
                notMerge={true}
                lazyUpdate={false}
                onEvents={{
                    click: (info: any) => {
                        const { data, dataType } = info;
                        if (dataType === 'node') {
                            const { name } = data;
                            onEntityClicked(name);
                        }
                    },
                }}
            />
        </div>
    );
}
