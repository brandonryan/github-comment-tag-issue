import {parse} from "@babel/parser"
import type {CommentBlock, CommentLine, File} from "@babel/types"
import { last } from "./util"

interface TaggedComment {
    tag: string
    title: string
    body: string
    start: {line: number, column: number}
    end: {line: number, column: number}
}

function shouldAppendLast(last: CommentLine, current: CommentLine) {
    //if its on the next line and the same column
    return last.loc.start.line === current.loc.start.line+1 &&
        last.loc.start.column === current.loc.start.column
}

//tags are assumed to be lower case
function findTag(value: string, tags: string[]): string | undefined {
    for(const tag of tags) {
        if (value.toLocaleLowerCase().startsWith(tag + ':')) {
            return tag
        }
    }
    return undefined
}

function parseBlockTags(blockComment: CommentBlock, tags: string[]): TaggedComment[] {
    console.log(blockComment, tags)
    return []
}

export function parseJavascriptCommentTags(input: string, tags: string[]) {
    const {comments}: File = parse(input, {
        sourceType: 'unambiguous',
        errorRecovery: true,
        plugins: ['typescript'],
    })

    if (!comments) return []
    
    const {tagged} = comments.reduce((accum, comm, i) => {
        const {tagged, canAppend} = accum
        switch(comm.type) {
            case "CommentBlock": {
                tagged.push(...parseBlockTags(comm, tags))
                accum.canAppend = false
                return accum
            }
            case "CommentLine": {
                const value = comm.value.trim()
                const tag = findTag(value, tags)
                if (tag !== undefined) {
                    tagged.push({
                        tag,
                        title: value.substring(tag.length+1),
                        body: '',
                        end: comm.loc.end,
                        start: comm.loc.start
                    })
                } else if(canAppend) { //for line comments, we need to see if we should add on to the last one before we throw it away
                    const lastComment = comments[i-1]
                    if (lastComment?.type === 'CommentLine' && shouldAppendLast(lastComment, comm)) {
                        const lastTagged = last(tagged)
                        if(!lastTagged) throw new Error("No last tagged. Should never happen.")
                        if(lastTagged.body === '') {
                            lastTagged.body = value
                        } else {
                            lastTagged.body = '\n' + value
                        }
                        lastTagged.end = comm.loc.end
                    }
                }

                accum.canAppend = true
                return accum
            }
            default: {
                throw new Error("Unknown comment type")
            }
        }
    }, {
        tagged: [] as TaggedComment[],
        canAppend: false
    })

    return tagged
}