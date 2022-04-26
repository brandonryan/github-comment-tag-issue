export function splitLines(input: string): string[] {
    return input.split(/\r\n|\n|\r/)
}

export function last<T>(arr: T[]): T|undefined {
    if(arr.length > 0) return arr[arr.length-1]
    return undefined
}

export function flatten<T>(arr: T[][]): T[] {
    const flattened = []
    for(const item of arr) {
        flattened.push(...item)
    }
    return flattened
}