export default OakComponent({
    entity() {
        return this.props.entity;
    },
    properties: {
        entity: '',
    },
    isList: true,
    lifetimes: {
        ready() {
            const { oakPagination } = this.state;
            const { total } = oakPagination || {};
            if (total) {
                this.setState({ total1: total });
            }
        }
    },
    listeners: {
        oakPagination(prev, next) {
            const { oakPagination } = this.state;
            const { total } = oakPagination || {};
            if (!prev.oakPagination && prev.oakPagination !== next.oakPagination) {
                if (total) {
                    this.setState({ total1: total });
                }
            }
        },
    },
    methods: {
        async setTotal() {
            const { oakPagination, total1 } = this.state;
            const { pageSize, total, currentPage, more } = oakPagination || {};
            if (total && pageSize) {
                if (Math.ceil(total1 / pageSize) === currentPage) {
                    this.setState({ total1: total1 + pageSize });
                    // return
                }
            }
        }
    }
});
