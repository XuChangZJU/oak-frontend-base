export interface Pagination {
    currentPage: number;
    pageSize: number;
    more?: boolean;
    total?: number;
    randomRange?: number;
}
