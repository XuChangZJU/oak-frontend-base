import React from "react";
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
import Map from '../map';

type LocationProps = {
    poiName?: string;
    coordinate?: [number, number];
    areaId?: string;
};

export default function Location(props: LocationProps) {
    if (window.innerWidth < 500) {
        // 窄屏

    }

    return (
        <Row gutter={[16, 16]}>
            <Col xs={24} sm={14}>
                <Map
                    center={props.coordinate}
                    undragable={true}
                    unzoomable={true}
                />
            </Col>
        </Row>
    );
}