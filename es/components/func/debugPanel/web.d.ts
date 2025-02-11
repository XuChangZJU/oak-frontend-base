import React from 'react';
import { WebComponentProps } from '../../../types/Page';
import { ED } from '../../../types/AbstractComponent';
export default function render(props: WebComponentProps<ED, keyof ED, true, {
    placement: 'top' | 'bottom' | 'left' | 'right';
    style: Record<string, any>;
}, {
    printDebugStore: () => void;
    printCachedStore: () => void;
    printRunningTree: () => void;
    resetInitialData: () => Promise<void>;
    downloadEnv: () => Promise<void>;
    resetEnv: (data: Record<string, any>) => Promise<void>;
}>): React.JSX.Element;
