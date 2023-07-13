/// <reference types="react" />
declare type Props = {
    items: Array<{
        title: string;
        href?: string;
    }>;
    title: string;
};
export default function Render(props: Props): JSX.Element;
export {};
