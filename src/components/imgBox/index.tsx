import React, { useState, useEffect } from 'react';
import styles from './index.module.less';

type Props = {
    src: string;
    alt?: string;
    width?: number;
    height?: number;
    bordered?: boolean;
    type?: 'fill' | 'contain' | 'cover' | 'none' | 'scale-down' | 'initial' | 'inherit'
}

function ImgBox(props: Props) {
    const { width, height, bordered = false, type = 'contain', src, alt } = props;
    if (bordered) {
        return (
            <div className={styles.imgBox}>
                <img
                    width={72 || width}
                    height={72 || height}
                    src={src}
                    style={{
                        objectFit: type,
                        borderRadius: 8,
                    }}
                    alt={'img' || alt}
                />
            </div>
        )
    }
    return (
        <img
            width={72 || width}
            height={72 || height}
            src={src}
            style={{
                objectFit: type,
            }}
            alt={'img' || alt}
        />
    )
}

export default ImgBox;