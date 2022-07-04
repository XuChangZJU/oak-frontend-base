import { PureComponent, ReactNode } from 'react';

function create<TData extends Record<string, any> = {}> () {
    class BB extends PureComponent<{}, {
        a: string;
        b: number
    } & TData> {
        render(): ReactNode {
            this.setState({
                a: 'ccc',
            });
            return null;
        }
    }
}