"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Port = void 0;
var tslib_1 = require("tslib");
var Feature_1 = require("../types/Feature");
var Port = /** @class */ (function (_super) {
    tslib_1.__extends(Port, _super);
    function Port(aspectWrapper) {
        var _this = _super.call(this) || this;
        _this.aspectWrapper = aspectWrapper;
        return _this;
    }
    Port.prototype.importEntity = function (entity, id, file, option) {
        var formData = new FormData();
        formData.set('entity', entity);
        formData.set('id', id);
        formData.set('file', file);
        formData.set('option', JSON.stringify(option));
        return this.aspectWrapper.exec('importEntity', formData);
    };
    Port.prototype.exportEntity = function (entity, id, filter, properties) {
        return this.aspectWrapper.exec('exportEntity', { entity: entity, id: id, filter: filter, properties: properties });
    };
    Port.prototype.getImportationTemplate = function (id) {
        return this.aspectWrapper.exec('getImportationTemplate', { id: id });
    };
    return Port;
}(Feature_1.Feature));
exports.Port = Port;
