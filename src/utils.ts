export function sleep(ms: number) {
    return new Promise<void>(resolve => setTimeout(resolve, ms));
}

export async function allFulfilled<T>(promises: Promise<T>[]): Promise<T[]> {
    const mappedEntries = await Promise.allSettled(promises);

    return mappedEntries.filter(result => result.status === "fulfilled")
        .map(result => {
            const filteredResult = result as PromiseFulfilledResult<T>;
            return filteredResult.value;
        });
}

export function cleanDuplicates<T, K extends string | number>(items: T[], keyGetter: (t: T) => K): T[] {

    const seenKeys = new Set()
    const result: T[] = []
    for (let item of items) {
        const key = keyGetter(item);
        if (!seenKeys.has(key)) {
            result.push(item);
            seenKeys.add(key)
        }
    }
    return result

}