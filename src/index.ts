// import { getInput } from '@actions/core'
import { context, getOctokit } from '@actions/github'
import { gitChangedFiles } from './git'
import { CommentResolver } from './CommentResolver'
import type { TaggedComment } from './types'
import { readFile, writeFile } from 'fs/promises'

const octokit = getOctokit(process.env['GITHUB_TOKEN']!)

//TO [14]DO: better logging
//with a body!
//more and more...

//these are not typed unfortunately
const {before, after} = context.payload
const {default_branch} = context.payload.repository!

const branch = context.ref.replace('refs/heads/', '')
console.log('branch:', branch)
console.log('base is default branch:', default_branch === branch)

let files = await gitChangedFiles(before, after)
files = files.filter(file => file.startsWith('src/'))
console.log("files", files)

const beforeResolver = new CommentResolver(before, files, ['todo'])
const beforeTags = await beforeResolver.resolve()

const afterResolver = new CommentResolver(after, files, ['todo'])
const afterTags = await afterResolver.resolve()

const beforeByIssue = new Map<number, TaggedComment>()
for(const tag of beforeTags) {
    if(!tag.issueNumber) continue
    beforeByIssue.set(tag.issueNumber, tag)
}

//sort our tags into groups of what needs to be done with them
const deletedComments: TaggedComment[] = []
const updatedComments: TaggedComment[] = []
const unassignedComments: TaggedComment[] = []
for(const tag of afterTags) {
    if(!tag.issueNumber) {
        unassignedComments.push(tag)
    } else {
        const beforeTag = beforeTags.find(bt => bt.issueNumber === tag.issueNumber)
        if(!beforeTag) {
            //update it just to be safe
            updatedComments.push(tag)
        } else if(!taggedCommentsEqual(tag, beforeTag)) {
            updatedComments.push(tag)
        }
    }
}
for(const tag of beforeTags) {
    if(!tag.issueNumber) continue
    const match = afterTags.find(at => at.issueNumber === tag.issueNumber)
    if(!match) deletedComments.push(tag)
}

for(const tag of unassignedComments) {
    const created = await octokit.rest.issues.create(githubIssueFromTaggedComment(tag))
    tag.issueNumber = created.data.number
}
for(const tag of updatedComments) {
    await octokit.rest.issues.update({
        issue_number: tag.issueNumber!,
        ...githubIssueFromTaggedComment(tag)
    })
}
for(const tag of deletedComments) {
    await octokit.rest.issues.update({
        ...context.repo,
        issue_number: tag.issueNumber!,
        state: 'closed'
    })
}

//do this in reverse order so we dont have to worry about index offset while inserting.
unassignedComments.reverse()
for(const tag of unassignedComments) {
    console.dir(tag, {depth: null})

    const insertIndex = tag.tag.length + tag.commentSrc.index
    const contents = await readFile(tag.fileName, 'utf-8')
    const contentsBefore = contents.slice(0, insertIndex)
    const contentsAfter = contents.slice(insertIndex)
    await writeFile(tag.fileName, `${contentsBefore} [${tag.issueNumber}]${contentsAfter}`)
}

function taggedCommentsEqual(tag1: TaggedComment, tag2: TaggedComment) {
    return tag1.body === tag2.body &&
        tag1.tag === tag2.tag &&
        tag1.title === tag2.title
}

function githubIssueFromTaggedComment(tag: TaggedComment) {
    return {
        ...context.repo,
        title: tag.title,
        body: tag.body
    }
}