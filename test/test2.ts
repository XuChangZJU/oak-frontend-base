import { generateNewIdAsync } from 'oak-domain/src/utils/uuid';

async function main() {
    let iter = 0; 
    while (iter ++ < 10) {
        console.log(await generateNewIdAsync());
    }
}

main();
