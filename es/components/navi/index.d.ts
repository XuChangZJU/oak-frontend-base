import React from 'react';
type Props = {
    items: Array<{
        title: string;
        href?: string;
    }>;
    title: string;
};
export default function Render(props: Props): React.JSX.Element;
export {};
