"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
//react
const React = __importStar(require("react"));
const react_router_dom_1 = require("react-router-dom");
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
    const parseUrl = url_1.default.parse(url, true, false);
    if (parseUrl.query) {
        query = parseUrl.query;
    }
    return query;
}
<<<<<<< HEAD:lib/platforms/web/Wrapper.jsx
function Wrapper(props) {
    const { PageWrapper } = props;
    return <PageWrapper />;
}
exports.default = Wrapper;
=======
const withRouter = (Component) => {
    const ComponentWithRouterProp = (props) => {
        const navigate = (0, react_router_dom_1.useNavigate)();
        const location = (0, react_router_dom_1.useLocation)();
        const params = getParams(location);
        return (<Component {...props} navigate={navigate} location={location} {...params}/>);
    };
    return ComponentWithRouterProp;
};
exports.default = withRouter;
>>>>>>> eb2a6cc02286238e9e23ed5a6a119550f983314b:lib/platforms/web/router.jsx
