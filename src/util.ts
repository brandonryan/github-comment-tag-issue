export function splitLines(input: string): string[] {
    return input.split(/(\r\n|\r|\n)/)
}

export function last<T>(arr: T[]): T|undefined {
    if(arr.length > 0) return arr[arr.length-1]
    return undefined
}