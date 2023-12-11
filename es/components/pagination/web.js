import React from 'react';
import { Pagination } from 'antd';
import { LeftOutlined, RightOutlined } from '@ant-design/icons';
import Style from './index.module.less';
export default function Render(props) {
    const { style, className, oakPagination, oakFullpath, total1, showQuickJumper, size, responsive, role, totalBoundaryShowSizeChanger, rootClassName, showTotal, } = props.data;
    const { t, setPageSize, setCurrentPage, setTotal } = props.methods;
    const { pageSize, total, currentPage, more } = oakPagination || {};
    const itemRender = (_, type, originalElement) => {
        if (type === 'prev') {
            return <a><LeftOutlined /></a>;
        }
        if (type === 'next') {
            return <a style={{ cursor: more ? 'pointer' : 'not-allowed', color: more ? '#006cb7' : 'rgba(0, 0, 0, 0.25)' }} onClick={() => {
                    if (more && currentPage) {
                        setTotal();
                        setCurrentPage(currentPage + 1);
                    }
                }}><RightOutlined /></a>;
        }
        return originalElement;
    };
    return (oakFullpath && oakPagination && (<div style={style} className={className ? className : Style.default}>
                <Pagination className={more ? Style.pagination : Style.paginationNoMore} itemRender={itemRender} pageSize={pageSize} total={total1 || total} current={currentPage} showQuickJumper={showQuickJumper} size={size} responsive={responsive} role={role} totalBoundaryShowSizeChanger={totalBoundaryShowSizeChanger} rootClassName={rootClassName} showTotal={showTotal} onShowSizeChange={(current, pageSize) => {
            setPageSize(pageSize);
        }} onChange={(page, pageSize) => {
            setCurrentPage(page);
        }}/>
            </div>));
}
