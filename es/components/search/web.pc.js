import { jsx as _jsx } from "react/jsx-runtime";
import { Input, } from 'antd';
const { Search } = Input;
export default function Render(props) {
    const { methods, data } = props;
    const { t, searchChange, searchConfirm } = methods;
    const { searchValue, oakLoading, } = data;
    return (_jsx(Search, { loading: oakLoading, value: searchValue, onChange: ({ target: { value } }) => searchChange(value), onSearch: (value) => searchConfirm(value), placeholder: "", allowClear: true }));
}
