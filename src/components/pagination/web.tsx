import React, { memo } from 'react';
import { Row, Col, Button, Pagination } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import classNames from 'classnames';
import { WebComponentProps } from '../../types/Page';
import { EntityDict } from 'oak-domain/lib/types/Entity';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';
import Style from './index.module.less';
import type { PaginationLocale, PaginationProps as RcPaginationProps } from 'rc-pagination';

export interface PaginationProps extends RcPaginationProps {
    showQuickJumper?: boolean | {
        goButton?: React.ReactNode;
    };
    size?: 'default' | 'small';
    responsive?: boolean;
    role?: string;
    totalBoundaryShowSizeChanger?: number;
    rootClassName?: string;
    onChange?: (page: number, pageSize: number) => void;
    onShowSizeChange?: (current: number, size: number) => void;
    itemRender?: (
        page: number,
        type: 'page' | 'prev' | 'next' | 'jump-prev' | 'jump-next',
        element: React.ReactNode,
    ) => React.ReactNode;
    showTotal?: (total: number, range: [number, number]) => React.ReactNode;
    total1: number
}

type ED = EntityDict & BaseEntityDict;

export default function Render(
    props: WebComponentProps<
        ED,
        keyof ED,
        true,
        PaginationProps,
        {
            onChange?: (page: number, pageSize: number) => void;
            onShowSizeChange?: (current: number, size: number) => void;
            itemRender?: (
                page: number,
                type: 'page' | 'prev' | 'next' | 'jump-prev' | 'jump-next',
                element: React.ReactNode,
            ) => React.ReactNode;
            // showTotal?: (total: number, range: [number, number]) => React.ReactNode;
            setTotal: () => void;
        }
    >
) {
    const {
        style,
        className,
        oakPagination,
        oakFullpath,
        total1,
        showQuickJumper,
        size,
        responsive,
        role,
        totalBoundaryShowSizeChanger,
        rootClassName,
        showTotal,
    } = props.data;
    const { t, setPageSize, setCurrentPage, setTotal } = props.methods;
    const { pageSize, total, currentPage, more } = oakPagination || {};
    const itemRender: PaginationProps['itemRender'] = (_, type, originalElement) => {
        if (type === 'prev') {
            return <a><LeftOutlined /></a>;
        }
        if (type === 'next') {
            return <a
                style={{ cursor: more ? 'pointer' : 'not-allowed', color: more ? '#006cb7' : 'rgba(0, 0, 0, 0.25)' }}
                onClick={() => {
                    if (more && currentPage) {
                        setTotal()
                        setCurrentPage(currentPage + 1);
                    }
                }}><RightOutlined /></a>;
        }
        return originalElement;
    };

    return (
        oakFullpath && oakPagination && (
            <div
                style={style}
                className={className ? className : Style.default}
            >
                <Pagination
                    className={more ? Style.pagination : Style.paginationNoMore}
                    itemRender={itemRender}
                    pageSize={pageSize}
                    total={total1 || total}
                    current={currentPage}
                    showQuickJumper={showQuickJumper}
                    size={size}
                    responsive={responsive}
                    role={role}
                    totalBoundaryShowSizeChanger={totalBoundaryShowSizeChanger}
                    rootClassName={rootClassName}
                    showTotal={showTotal}
                    onShowSizeChange={(current: number, pageSize: number) => {
                        setPageSize(pageSize);
                    }}
                    onChange={(page: number, pageSize: number) => {
                        setCurrentPage(page);
                    }}
                />
            </div>
        )
    );
}
