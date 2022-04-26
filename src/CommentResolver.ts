import { readFileAtCommit } from "./git"
import { extname } from "path"
import { parse as parseJavascript } from "./resolvers/javascript"
import type { Comment, TaggedComment } from "./types"
import { flatten, last } from "./util"

export class CommentResolver {
    #commitSHA: string
    #fileNames: string[]
    #tags: string[]

    constructor(commitSHA: string, fileNames: string[], tags: string[]) {
        this.#commitSHA = commitSHA
        this.#fileNames = fileNames
        this.#tags = tags
    }

    async resolve() {
        const commentsPerFile = await Promise.all(this.#fileNames.map(async fileName => {
            const fileContent = await readFileAtCommit(this.#commitSHA, fileName)
            if(!fileContent) return []
            const comments = parseComments(fileName, fileContent)
            console.log(comments.length + "comments in file ", fileName)
            return parseTagged(fileName, comments, this.#tags)
        }))

        return flatten(commentsPerFile)
    }

    async writeIssueNumber(tagged: TaggedComment) {
        if(!tagged.issueNumber) throw new Error("TaggedComment missing issue number")
        //TODO: write to file, the issue number
    }
}

function regexForTagParse(tags: string[]): RegExp {
    //REGEX: ^(?<name>todo|fixme)(?<issue> \[#\d+\])?:
    return new RegExp(`^(?<name>${tags.join('|')})(?<issue> \\[#\\d+\\])?:`)
}

interface Tag {
    name: string
    issue?: number
    value: string
}
function parseTag(value: string, tags: string[]): Tag|undefined {
    const reg = regexForTagParse(tags)
    const m = value.toLocaleLowerCase().match(reg)
    if(m === null || !m.groups) return
    const {name, issue} = m.groups
    if(!name || !tags.includes(name)) return

    //remove our match from value
    const len = m.reduce((t, s) => {
        console.log(s)
        return t + s.length
    }, 0)
    value = value.slice(len)
    //return bare tagged
    if(!issue) {
        return {name, value}
    }
    //return tagged with issue number
    const issueNum = parseInt(issue.slice(3, -1), 10)
    if(Number.isNaN(issueNum)) {
        //TODO: issue a warning or error stating that we could not parse the issue number.
        return
    }

    console.log(name, value, issueNum)

    return {name, value, issue: issueNum}
}

function shouldAppend(base: Comment, current: Comment) {
    if(base.block) return false
    if(base.start.line !== current.start.line+1) return false
    if(base.start.column !== current.start.column) return false
    return true
}

//@ts-ignore
function parseBlockTags(blockComment: Comment, tags: string[]): TaggedComment[] {
    // console.log(blockComment, tags)
    
    return []
}

function parseTagged(fileName: string, comments: Comment[], tags: string[]): TaggedComment[] {
    const tagged: TaggedComment[] = []

    for(const comm of comments) {
        if(comm.block) {
            tagged.push(...parseBlockTags(comm, tags))
        } else {
            const parsed = parseTag(comm.value.trim(), tags)
            if(parsed) {
                console.log("parsed tag")
                console.log(parsed)
                tagged.push({
                    tag: parsed.name,
                    title: parsed.value,
                    issueNumber: parsed.issue,
                    fileName: fileName,
                    commentSrc: comm,
                })
            } else {
                const lastTagged = last(tagged)
                if(lastTagged && shouldAppend(lastTagged.commentSrc, comm)) {
                    //update tag
                    if(!lastTagged.body) {
                        lastTagged.body = comm.value
                    } else {
                        lastTagged.body = '\n' + comm.value
                    }
                    //update src
                    lastTagged.commentSrc.end = comm.end
                    lastTagged.commentSrc.value += '\n' + comm.value
                }
            }
        }
    }

    return tagged
}

function parseComments(fileName: string, content: string): Comment[] {
    switch(extname(fileName)) {
        case '.js': return parseJavascript(content)
        case '.ts': return parseJavascript(content, ['typescript'])
        case '.jsx': return parseJavascript(content, ['jsx'])
        case '.tsx': return parseJavascript(content, ['typescript', 'jsx'])
        default: {
            console.warn(`No parser found for ${fileName}`)
            return []
        }
    }
}