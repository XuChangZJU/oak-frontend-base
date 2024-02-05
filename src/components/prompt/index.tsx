import React, { useEffect } from 'react';
import { Blocker, Location } from 'history';
// @ts-ignore
import { useLocation, useNavigate } from 'react-router-dom';
import { useFeatures } from '../../platforms/web';
import { Navigator } from '../../features/navigator';

type Props = {
    when: boolean;
    message?: string | (() => boolean) | (() => Promise<boolean>);
}

const Prompt: React.FC<Props> = (props) => {
    const location = useLocation();
    const navigate = useNavigate();
    const features = useFeatures<{
        navigator: Navigator;
    }>();

    // 存储关闭阻止页面切换的方法（调用此方法将关闭阻止页面切换）
    let unblock: any = null;

    // 阻止页面卸载
    const beforeUnload = (event: any) => {
        event.preventDefault();
        event.returnValue = '';
    }

    // 页面切换时的回调
    const handlePageChange: Blocker = async ({location: nextLocation}) => {
        // 是否关闭切换限制并跳转
        let toNext: boolean = false;

        if (props.message) {
            if (typeof props.message === "string") {
                toNext = confirm(props.message);
            } else {
                toNext = await props.message();
            }
        } else {
            toNext = confirm("Are you sure to leave the page?");
        }

        toNext && closeBlockAndNavigate(nextLocation);
    }

    // 关闭阻止页面切换
    const closeBlockPageSwitching = () => {
        if (unblock) {
            unblock();
            unblock = null;
            window.removeEventListener("beforeunload", beforeUnload);
        }
    }

    // 关闭阻止页面切换，并跳转
    const closeBlockAndNavigate = (nextLocation: Location) => {
        closeBlockPageSwitching();
        navigate(nextLocation);
    }

    // 监听when 和 pathname 变化，当发生变化时判断是否需要开启block navigate.
    useEffect(() => {
        if (props.when) {
            // 阻塞页面跳转（history行为）
            unblock = features.navigator.history.block(handlePageChange);
            window.addEventListener('beforeunload', beforeUnload);
        }
        return () => {
            props.when && closeBlockPageSwitching();
        }
    }, [props.when, location.pathname]);

    return (
        <></>
    );
}

export default Prompt;