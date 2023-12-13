import React from 'react';
import { WebComponentProps } from '../../types/Page';
import { EntityDict } from 'oak-domain/lib/types/Entity';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';
import type { PaginationProps as RcPaginationProps } from 'rc-pagination';
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
type ED = EntityDict & BaseEntityDict;
export default function Render(props: WebComponentProps<ED, keyof ED, true, PaginationProps, {
    onChange?: (page: number, pageSize: number) => void;
    onShowSizeChange?: (current: number, size: number) => void;
    itemRender?: (page: number, type: 'page' | 'prev' | 'next' | 'jump-prev' | 'jump-next', element: React.ReactNode) => React.ReactNode;
    setTotal: () => void;
}>): "" | React.JSX.Element | undefined;
export {};
