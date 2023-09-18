export default OakComponent({
    isList: false,
    properties: {
        entity: '',
    },
    formData({ data: rows }) {
        return {};
    },
    data: {
        links: [],
        entityDNode: [],
        entitySNode: [],
    },
    lifetimes: {
        async ready() {
            const { entity } = this.props;
            const { links } = this.features.relationAuth.getEntityGraph();
            this.setState({
                links,
            }, () => {
                this.getNodes(entity);
            });
        }
    },
    methods: {
        getNodes(entity) {
            const { links } = this.state;
            // 以entity为source 查找entity所指向的实体
            const entityDNode = links.filter((ele) => ele.source === entity).map((ele) => ele.target);
            // 以entity为target 查找指向entity的实体
            const entitySNode = links.filter((ele) => {
                // extraFile
                const ref = this.entityToRef(ele.source, entity);
                return ele.target === ref;
            }).map((ele) => ele.source);
            this.setState({
                entityDNode,
                entitySNode,
            });
        },
        // 检查在当前路径下，是否有授权操作，如果有需要先保存
        checkSelectRelation() {
            const operations = this.features.runningTree.getOperations('$actionAuthList-cpn');
            let showExecuteTip = false;
            if (operations && operations.length) {
                showExecuteTip = true;
                this.setMessage({
                    content: '请先保存当前授权',
                    type: 'warning',
                });
            }
            return showExecuteTip;
        },
        entityToRef(source, target) {
            const schema = this.features.cache.getSchema();
            const { attributes } = schema[source];
            if (Object.hasOwn(attributes, 'entityId')) {
                return target;
            }
            const attr = Object.keys(attributes).find((key) => attributes[key].ref && attributes[key].ref === target);
            return attr ? attr.replace('Id', '') : '';
        },
        resolveP(path) {
            const destEntity = this.props.entity;
            const schema = this.features.cache.getSchema();
            if (path === '') {
                return destEntity;
            }
            const splitArr = path.split('.');
            splitArr.unshift(destEntity);
            for (let i = 1; i < splitArr.length; i++) {
                if (splitArr[i].includes('$')) {
                    splitArr[i] = splitArr[i].split('$')[0];
                    continue;
                }
                // 用已解析的前项来解析后项
                const { attributes } = schema[splitArr[i - 1]];
                const { ref } = attributes[`${splitArr[i]}Id`];
                splitArr[i] = ref;
            }
            return splitArr[splitArr.length - 1];
        }
    }
});
