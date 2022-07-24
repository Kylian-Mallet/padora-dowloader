import {sync as commandExist} from "command-exists";

export async function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export function checkWgetExist(): boolean {
    return commandExist('wget');
}
