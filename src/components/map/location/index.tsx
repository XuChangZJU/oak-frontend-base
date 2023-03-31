import React, { useState, useRef, useEffect } from "react";
import {
    Modal,
    Row,
    Col,
    ModalProps,
    Button,
    Input,
    List,
    Empty,
    Spin,
} from 'antd';
import { SearchOutlined, CheckCircleFilled } from '@ant-design/icons';
import Map from '../map';
import Styles from './web.module.less';

// todo
import useFeatures from '../../../hooks/useFeatures';

type LocationProps = {
    poiName?: string;
    coordinate?: [number, number];
    areaId?: string;
    onLocated: (selected: {
        poiName: string,
        coordinate: [number, number],
        areaId: string
    }) => void;
};

type Mode = 'dragMap' | 'searchPoi';

export type Poi = {
    id: string;
    areaId: string;
    poiName: string;
    detail: string;
    coordinate: [number, number];
};

export default function Location(props: LocationProps) {
    const [mode, setMode] = useState<Mode>('dragMap');
    const [searchValue, setSearchValue] = useState<string>('');
    const [searchLoading, setSearchLoading] = useState(false);
    const [pois, setPois] = useState<Poi[]>();
    const [currentPoi, setCurrentPoi] = useState<Poi>();
    const searchRef = useRef<any>();
    const featureGeo = useFeatures().geo;

    useEffect(() => {
        if (searchValue?.length > 1) {
            setSearchLoading(true);
            featureGeo.searchPoi(searchValue).then(
                ({ result }) => {
                    setSearchLoading(false);
                    setPois(result);
                    // setCurrentPoi(pois[0]);
                },
                (error) => {
                    console.warn(error);
                    setPois(undefined);
                    setSearchLoading(false);
                }
            );
        }
        else {
            setPois(undefined);
        }

    }, [searchValue])

    if (window.innerWidth < 500) {
        // 窄屏
        return null;
    }

    const center = currentPoi?.coordinate || props.coordinate;
    return (
        <Row gutter={[16, 16]} style={{
            width: '100%',
            minHeight: 600,
        }}>
            <Col xs={24} sm={14}>
                <Map
                    style={{ height: '100%' }}
                    id="location-map"
                    center={center}
                    markers={center? [center] : undefined}
                />
            </Col>
            <Col xs={24} sm={10}>
                <List
                    className={Styles["location-list"]}
                    header={
                        <Input
                            ref={searchRef}
                            placeholder="请输入完整名称（如“浙江大学”）而非简称（如“浙大”）"
                            value={searchValue}
                            allowClear
                            onChange={(e) => {
                                setSearchValue(e.target.value);
                            }}
                            prefix={<SearchOutlined />}
                            onFocus={() => {
                                setMode('searchPoi');
                            }}
                            onBlur={() => {
                            }}
                        />
                    }
                >
                    {/* {mode === 'dragMap' &&
                        pois?.map((poi, index) => {
                            return (
                                <div
                                    key={poi.id}
                                    onClick={() => {
                                        setRefresh(false);
                                        setCurrentPoi(poi);
                                    }}
                                >
                                    <List.Item
                                        actions={[
                                            <div
                                                style={{
                                                    width: 24,
                                                }}
                                            >
                                                {currentPoi?.id ===
                                                    poi.id && (
                                                        <CheckCircleFilled
                                                            className={`${prefixCls}-location-list-checked`}
                                                        />
                                                    )}
                                            </div>,
                                        ]}
                                    >
                                        <List.Item.Meta
                                            title={poi.name}
                                            description={`${poi.distance
                                                    ? `${poi.distance}m内 | `
                                                    : ''
                                                }${poi.address}`}
                                        />
                                    </List.Item>
                                </div>
                            );
                        })} */}
                    {mode === 'searchPoi' && (
                        <React.Fragment>
                            {searchLoading ? (
                                <div
                                    className={Styles['location-list-meta']}
                                >
                                    <Spin
                                        delay={0}
                                        spinning
                                        size="default"
                                    />
                                </div>
                            ) : (
                                pois?.length
                                    ? pois.map((poi, index) => {
                                        return (
                                            <div
                                                key={poi.id}
                                                onClick={() => {
                                                    console.log(poi);
                                                    setCurrentPoi(
                                                        poi
                                                    );
                                                    props.onLocated({
                                                        poiName: poi.detail,
                                                        coordinate: poi.coordinate,
                                                        areaId: poi.areaId,
                                                    });
                                                }}
                                            >
                                                <List.Item
                                                    actions={[
                                                        <div
                                                            style={{
                                                                width: 24,
                                                            }}
                                                        >
                                                            {currentPoi?.id ===
                                                                poi.id && (
                                                                    <CheckCircleFilled
                                                                        className={Styles['location-list-checked']}
                                                                    />
                                                                )}
                                                        </div>,
                                                    ]}
                                                >
                                                    <List.Item.Meta
                                                        title={
                                                            poi.detail
                                                        }
                                                    />
                                                </List.Item>
                                            </div>
                                        );
                                    })
                                    : (
                                        <div
                                            className={Styles['location-list-meta']}
                                        >
                                            <Empty
                                                description={`没有${searchValue}相关的地名搜索结果`}
                                                image={
                                                    Empty.PRESENTED_IMAGE_SIMPLE
                                                }
                                            />
                                        </div>
                                    )
                            )}
                        </React.Fragment>
                    )}
                </List>
            </Col>
        </Row>
    );
}