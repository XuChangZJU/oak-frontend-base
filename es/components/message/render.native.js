import { useEffect } from 'react';
import { useToast } from '../../platforms/native/toast';
export default function Render(props) {
    const toast = useToast();
    const { data } = props.data;
    useEffect(() => {
        if (data) {
            let type = 'normal';
            switch (data.type) {
                case 'error': {
                    type = 'danger';
                    break;
                }
                case 'info': {
                    type = 'normal';
                    break;
                }
                default: {
                    type = data.type;
                    break;
                }
            }
            let placement = 'top';
            switch (data.placement) {
                case 'top':
                case 'top-left':
                case 'top-right': {
                    placement = 'top';
                    break;
                }
                case 'bottom':
                case 'bottom-left':
                case 'bottom-right': {
                    placement = 'bottom';
                    break;
                }
                case 'center': {
                    placement = 'center';
                    break;
                }
                default: {
                    // placement 其他不支持的类型都默认top
                    placement = 'top';
                    break;
                }
            }
            toast.show(data.content, {
                type: type,
                placement: placement,
                duration: data.duration || 4000,
                animationType: 'zoom-in',
            });
        }
    }, [data]);
    return null;
}
