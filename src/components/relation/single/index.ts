
import { AuthCascadePath, EntityDict } from 'oak-domain/lib/types/Entity';
import { EntityDict as BaseEntityDict } from 'oak-domain/lib/base-app-domain';

type ED = EntityDict & BaseEntityDict;

export default OakComponent({
    isList: false,
    properties: {
        entity: '' as keyof ED,
    },
    formData({ data: rows }) {
        // 查看path为actionAuthList-cpn 是否有未提交的操作，如果有提示先提交
        const operations = this.features.runningTree.getOperations('$actionAuthList-cpn');
        let showExecuteTip = false;
        if (operations && operations.length) {
            showExecuteTip = true;
        }
        return {
            showExecuteTip,
        };
    },
    data: {
        links: [] as {
            source: string;
            target: string;
            value: number;
        }[],
        entityDNode: [] as string[],
        entitySNode: [] as string[],
    },
    lifetimes: {
        async ready() {
            const { entity } = this.props;
            const { links } = this.features.relationAuth.getEntityGraph();
            this.setState({
                links,
            }, () => {
                this.getNodes(entity);
            })
        }
    },
    methods: {
        getNodes(entity: keyof ED) {
            const { links } = this.state;
            // 以entity为source 查找entity所指向的实体
            const entityDNode = links.filter((ele) => ele.source === entity).map((ele) => ele.target);
            // 以entity为target 查找指向entity的实体
            const entitySNode = links.filter((ele) => ele.target === entity).map((ele) => ele.source);
            this.setState({
                entityDNode,
                entitySNode,
            })
        }
    }
});