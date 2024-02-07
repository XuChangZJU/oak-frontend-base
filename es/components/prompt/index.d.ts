import React from 'react';
type Props = {
    when: boolean;
    message?: string | (() => boolean) | (() => Promise<boolean>);
};
declare const Prompt: React.FC<Props>;
export default Prompt;
