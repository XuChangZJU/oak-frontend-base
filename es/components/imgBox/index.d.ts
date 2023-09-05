declare type Props = {
    mode?: 'select';
    selected?: boolean;
    src: string | undefined;
    alt?: string;
    width?: number | string;
    height?: number;
    bordered?: boolean;
    onClick?: () => void;
    type?: 'fill' | 'contain' | 'cover' | 'none' | 'scale-down' | 'initial' | 'inherit';
};
declare function ImgBox(props: Props): import("react/jsx-runtime").JSX.Element;
export default ImgBox;
