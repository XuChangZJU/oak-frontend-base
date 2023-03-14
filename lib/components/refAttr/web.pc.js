"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var antd_1 = require("antd");
var TextArea = antd_1.Input.TextArea;
function render(props) {
    var _a = props.data, pickerDef = _a.pickerDef, pickerEntity = _a.pickerEntity, pickerProjection = _a.pickerProjection, pickerFilter = _a.pickerFilter, pickerAttr = _a.pickerAttr, pickerDialogTitle = _a.pickerDialogTitle, pickerTitleFn = _a.pickerTitleFn, pickerTitleLabel = _a.pickerTitleLabel;
    var mode = pickerDef.mode;
    switch (mode) {
        case 'select': {
            break;
        }
    }
}
exports.default = render;
