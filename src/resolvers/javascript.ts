import { parse as babelParse, ParserPlugin } from "@babel/parser"
import type { File } from "@babel/types"
import type { Comment } from "../types"

export function parse(input: string, babelPlugins: ParserPlugin[]=[]): Comment[] {
    const {comments}: File = babelParse(input, {
        sourceType: 'unambiguous',
        errorRecovery: true,
        plugins: babelPlugins,
    })

    if (!comments) return []

    return comments.map((comm): Comment => ({
        block: comm.type === "CommentBlock",
        value: comm.value,
        index: comm.start,
        start: comm.loc.start,
        end: comm.loc.end,
    }))
}