"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
//react
const react_1 = __importDefault(require("react"));
const url_1 = __importDefault(require("url"));
function getParams(location) {
    const { search, state } = location;
    const query = getQuery(search);
    return Object.assign({}, query, state);
}
function getQuery(url) {
    let query = {};
    if (!url) {
        return query;
    }
    const parseUrl = url_1.default.parse(url, true);
    if (parseUrl.query) {
        query = parseUrl.query;
    }
    return query;
}
function Wrapper(props) {
    const { PageWrapper } = props;
    // const navigate = useNavigate();
    // const location = useLocation();
    // const params = getParams(location);
    const navigate = {};
    const location = {};
    const params = {};
    return <PageWrapper navigate={navigate} location={location} {...params}/>;
}
exports.default = Wrapper;
