export interface TaggedComment {
    tag: string
    issueNumber?: number
    title: string
    body?: string
    fileName: string
    commentSrc: Comment
}

export interface Comment {
    block: boolean
    value: string
    index: number
    start: {line: number, column: number}
    end: {line: number, column: number}
}