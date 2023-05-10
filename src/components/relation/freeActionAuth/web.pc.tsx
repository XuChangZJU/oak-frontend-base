import { Table, Checkbox, Button, Row, Radio, Col } from 'antd';
import { RowWithActions, WebComponentProps } from '../../../types/Page';
import { AuthCascadePath, EntityDict } from 'oak-domain/lib/types/Entity';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';

type ED = EntityDict & BaseEntityDict;

export default function render(
    props: WebComponentProps<
        ED,
        'freeActionAuth',
        true,
        {
            entity: keyof ED;
            actions: string[];
            freeActionAuths?: ED['freeActionAuth']['OpSchema'][];
        },
        {
            onChange: (checked: boolean, action: string, freeActionAuth?: ED['freeActionAuth']['OpSchema']) => void;
            confirm: () => void;
        }
    >
) {
    const { entity, freeActionAuths, actions, oakDirty } = props.data;
    const { onChange, confirm, t, clean } = props.methods;

    return (
        <>
            <Row wrap={true} justify="start" style={{ paddingLeft: 40 }}>
                {actions?.map(
                    (action) => {
                        const checked = !!freeActionAuths?.find(
                            (ele) => ele.deActions.includes(action) && !ele.$$deleteAt$$
                        );
                        return (
                            <Row style={{ padding: 10 }}>
                                <Checkbox
                                    checked={checked}
                                    onChange={({ target }) => {
                                        const { checked } = target;
                                        const freeActionAuth = freeActionAuths?.find(
                                            (ele) => ele.deActions.includes(action)
                                        );
                                        onChange(checked, action, freeActionAuth);
                                    }}
                                >
                                    {action}
                                </Checkbox>
                            </Row>
                        );
                    }
                )}
            </Row>
            <Row justify="end" style={{ marginTop: 20, padding: 5 }}>
                <Button
                    style={{ marginRight: 10 }}
                    type='primary'
                    disabled={!oakDirty}
                    onClick={() => confirm()}
                >
                    {t("confirm")}
                </Button>
                <Button
                    disabled={!oakDirty}
                    onClick={() => clean()}
                >
                    {t("reset")}
                </Button>
            </Row>
        </>
    )
}