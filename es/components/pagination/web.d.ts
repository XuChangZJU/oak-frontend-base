import React from 'react';
import type { PaginationProps as RcPaginationProps } from 'rc-pagination';
import { WebComponentProps } from '../../types/Page';
import { ED } from '../../types/AbstractComponent';
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
    itemRender?: (page: number, type: 'page' | 'prev' | 'next' | 'jump-prev' | 'jump-next', element: React.ReactNode) => React.ReactNode;
    showTotal?: (total: number, range: [number, number]) => React.ReactNode;
    total1: number;
}
export default function Render(props: WebComponentProps<ED, keyof ED, true, PaginationProps, {
    onChange?: (page: number, pageSize: number) => void;
    onShowSizeChange?: (current: number, size: number) => void;
    itemRender?: (page: number, type: 'page' | 'prev' | 'next' | 'jump-prev' | 'jump-next', element: React.ReactNode) => React.ReactNode;
    setTotal: () => void;
    setPage: (value: number) => void;
}>): "" | React.JSX.Element | undefined;
