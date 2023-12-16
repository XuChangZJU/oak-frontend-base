/// <reference types="node" />
import { Feature } from '../types/Feature';
export declare class Navigator extends Feature {
    namespace: string;
    private base;
    constructor();
    setNamespace(namespace: string): void;
    getNamespace(): string;
    urlParse(path: string): import("url").URL;
    urlFormat(url: URL): string;
    constructState(pathname: string, state?: Record<string, any>, search?: string): {
        pathname: string;
        oakFrom: string | undefined;
    };
    constructSearch(search?: string | null, state?: Record<string, any>): string;
    constructUrl(url: string, state?: Record<string, any>, disableNamespace?: boolean): string;
    constructNamespace(url: string, namespace?: string): string;
    getPathname(pathname: string, namespace?: string): string;
}
