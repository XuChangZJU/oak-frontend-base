declare type Props = {
    items: Array<{
        title: string;
        href?: string;
    }>;
    title: string;
};
export default function Render(props: Props): import("react/jsx-runtime").JSX.Element;
export {};
