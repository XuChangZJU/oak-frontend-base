/// <reference types="node" />
/// <reference types="react" />
/// <reference types="react-dom" />

declare namespace NodeJS {
	interface ProcessEnv {
        readonly NODE_ENV: 'development' | 'production' | 'test' | 'staging';
        readonly PUBLIC_URL: string;
        readonly OAK_PLATFORM: 'web' | 'wechatMp' | 'server';
    }
}

declare module '*.avif' {
	const src: string;
	export default src;
}

declare module '*.bmp' {
	const src: string;
	export default src;
}

declare module '*.gif' {
	const src: string;
	export default src;
}

declare module '*.jpg' {
	const src: string;
	export default src;
}

declare module '*.jpeg' {
	const src: string;
	export default src;
}

declare module '*.png' {
	const src: string;
	export default src;
}

declare module '*.webp' {
	const src: string;
	export default src;
}

declare module '*.svg' {
	import * as React from 'react';

	export const ReactComponent: React.FunctionComponent<React.SVGProps<
		SVGSVGElement
	> & { title?: string }>;

	const src: string;
	export default src;
}

declare module '*.module.css' {
	const classes: { readonly [key: string]: string };
	export default classes;
}

declare module '*.module.scss' {
	const classes: { readonly [key: string]: string };
	export default classes;
}

declare module '*.module.sass' {
	const classes: { readonly [key: string]: string };
	export default classes;
}


declare module '*.module.less' {
	const classes: {
		readonly [key: string]: string;
	};
	export default classes;
}

/**
 * 微信标签申明
 */
declare namespace JSX {
    interface IntrinsicElements extends JSX.IntrinsicElements {
        'wx-open-launch-weapp': React.DetailedHTMLProps<
            React.HTMLAttributes<HTMLElement>,
            HTMLElement,
            { appid: string }
        >;
    }
}