import { Feature } from '../types/Feature';
export declare class Navigator extends Feature {
    private constructUrl;
    navigateTo(url: string, state?: Record<string, any>): Promise<unknown>;
    redirectTo(url: string, state?: Record<string, any>): Promise<unknown>;
    navigateBack(delta?: number): Promise<unknown>;
}
