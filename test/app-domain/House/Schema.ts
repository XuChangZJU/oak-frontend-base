import { String, Int, Float, Double, Boolean, Text, Datetime, File, Image, PrimaryKey, ForeignKey } from "oak-domain/lib/types/DataType";
import { Q_DateValue, Q_BooleanValue, Q_NumberValue, Q_StringValue, Q_EnumValue, NodeId, MakeFilter, FulltextFilter, ExprOp, ExpressionKey } from "oak-domain/lib/types/Demand";
import { OneOf, ValueOf } from "oak-domain/lib/types/Polyfill";
import * as SubQuery from "../_SubQuery";
import { FormCreateData, FormUpdateData, Operation as OakOperation } from "oak-domain/lib/types/Entity";
import { GenericAction } from "oak-domain/lib/actions/action";
import * as Area from "../Area/Schema";
import * as User from "../User/Schema";
import * as ExtraFile from "../ExtraFile/Schema";
export type OpSchema = {
    id: PrimaryKey;
    $$createAt$$: Datetime;
    $$updateAt$$: Datetime;
    $$removeAt$$?: Datetime;
    district: String<16>;
    areaId: ForeignKey<"area">;
    ownerId: ForeignKey<"user">;
};
export type OpAttr = keyof OpSchema;
export type Schema = {
    id: PrimaryKey;
    $$createAt$$: Datetime;
    $$updateAt$$: Datetime;
    $$removeAt$$?: Datetime;
    district: String<16>;
    areaId: ForeignKey<"area">;
    ownerId: ForeignKey<"user">;
    area: Area.Schema;
    owner: User.Schema;
    extraFile$entity?: Array<ExtraFile.Schema>;
} & {
    [A in ExpressionKey]?: any;
};
type AttrFilter = {
    id: Q_StringValue | SubQuery.HouseIdSubQuery;
    $$createAt$$: Q_DateValue;
    $$updateAt$$: Q_DateValue;
    district: Q_StringValue;
    areaId: Q_StringValue | SubQuery.AreaIdSubQuery;
    area: Area.Filter;
    ownerId: Q_StringValue | SubQuery.UserIdSubQuery;
    owner: User.Filter;
};
export type Filter = MakeFilter<AttrFilter & ExprOp<OpAttr>>;
export type Projection = {
    "#id"?: NodeId;
    id: 1;
    $$createAt$$?: 1;
    $$updateAt$$?: 1;
    district?: 1;
    areaId?: 1;
    area?: Area.Projection;
    ownerId?: 1;
    owner?: User.Projection;
    extraFile$entity?: ExtraFile.Selection;
} & Partial<ExprOp<OpAttr>>;
export type ExportProjection = {
    "#id"?: NodeId;
    id?: string;
    $$createAt$$?: string;
    $$updateAt$$?: string;
    district?: string;
    areaId?: string;
    area?: Area.ExportProjection;
    ownerId?: string;
    owner?: User.ExportProjection;
    extraFile$entity?: ExtraFile.Exportation;
} & Partial<ExprOp<OpAttr>>;
type HouseIdProjection = OneOf<{
    id: 1;
}>;
type AreaIdProjection = OneOf<{
    areaId: 1;
}>;
type UserIdProjection = OneOf<{
    ownerId: 1;
}>;
export type SortAttr = OneOf<{
    id: 1;
    $$createAt$$: 1;
    $$updateAt$$: 1;
    district: 1;
    areaId: 1;
    area: Area.SortAttr;
    ownerId: 1;
    owner: User.SortAttr;
} & ExprOp<OpAttr>>;
export type SortNode = {
    $attr: SortAttr;
    $direction?: "asc" | "desc";
};
export type Sorter = SortNode[];
export type SelectOperation<P = Projection> = OakOperation<"select", P, Filter, Sorter>;
export type Selection<P = Projection> = Omit<SelectOperation<P>, "action">;
export type Exportation = OakOperation<"export", ExportProjection, Filter, Sorter>;
type CreateOperationData = FormCreateData<Omit<OpSchema, "areaId" | "ownerId" | "area" | "owner"> & ({
    area?: Area.CreateSingleOperation | (Area.UpdateOperation & {
        id: String<64>;
    });
    areaId?: undefined;
} | {
    area?: undefined;
    areaId?: String<64>;
}) & ({
    owner?: User.CreateSingleOperation | (User.UpdateOperation & {
        id: String<64>;
    });
    ownerId?: undefined;
} | {
    owner?: undefined;
    ownerId?: String<64>;
}) & {
    extraFile$entity?: ExtraFile.CreateOperation | ExtraFile.UpdateOperation;
}>;
export type CreateSingleOperation = OakOperation<"create", CreateOperationData>;
export type CreateMultipleOperation = OakOperation<"create", Array<CreateOperationData>>;
export type CreateOperation = CreateSingleOperation | CreateMultipleOperation;
type UpdateOperationData = FormUpdateData<Omit<OpSchema, "areaId" | "ownerId" | "area" | "owner">> & ({
    area?: Area.CreateSingleOperation | Omit<Area.UpdateOperation, "id" | "ids" | "filter">;
    areaId?: undefined;
} | {
    area?: undefined;
    areaId?: String<64>;
}) & ({
    owner?: User.CreateSingleOperation | Omit<User.UpdateOperation, "id" | "ids" | "filter">;
    ownerId?: undefined;
} | {
    owner?: undefined;
    ownerId?: String<64>;
}) & {
    extraFiles$entity?: ExtraFile.CreateOperation | Omit<ExtraFile.UpdateOperation, "id" | "ids" | "filter">;
};
export type UpdateOperation = OakOperation<"update", UpdateOperationData, Filter>;
type RemoveOperationData = {} & {
    area?: Omit<Area.UpdateOperation | Area.RemoveOperation, "id" | "ids" | "filter">;
    owner?: Omit<User.UpdateOperation | User.RemoveOperation, "id" | "ids" | "filter">;
} & {
    extraFiles$entity?: Omit<ExtraFile.UpdateOperation | ExtraFile.RemoveOperation, "id" | "ids" | "filter">;
};
export type RemoveOperation = OakOperation<"remove", RemoveOperationData, Filter>;
export type Operation = CreateOperation | UpdateOperation | RemoveOperation | SelectOperation;
export type AreaIdSubQuery = Selection<AreaIdProjection>;
export type UserIdSubQuery = Selection<UserIdProjection>;
export type HouseIdSubQuery = Selection<HouseIdProjection>;
export type NativeAttr = OpAttr | `area.${Area.NativeAttr}` | `owner.${User.NativeAttr}`;
export type FullAttr = NativeAttr | `extraFiles$${number}.${ExtraFile.NativeAttr}`;
export type EntityDef = {
    Schema: Schema;
    OpSchema: OpSchema;
    Action: GenericAction;
    Selection: Selection;
    Operation: Operation;
};