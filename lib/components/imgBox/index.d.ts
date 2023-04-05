/// <reference types="react" />
declare type Props = {
    src: string;
    alt?: string;
    width?: number;
    height?: number;
    bordered?: boolean;
    type?: 'fill' | 'contain' | 'cover' | 'none' | 'scale-down' | 'initial' | 'inherit';
};
declare function ImgBox(props: Props): JSX.Element;
export default ImgBox;
