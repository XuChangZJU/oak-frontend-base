import { jsx as _jsx } from "react/jsx-runtime";
import { SearchBar } from 'antd-mobile';
export default function Render(props) {
    const { methods, data } = props;
    const { t, searchChange, searchConfirm, searchClear } = methods;
    const { searchValue, placeholder = '请输入' } = data;
    return (_jsx(SearchBar, { value: searchValue, placeholder: placeholder, showCancelButton: true, onChange: searchChange, onSearch: searchConfirm, onClear: () => searchClear() }));
}
