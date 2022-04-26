import {} from '@actions/core'
import { context } from '@actions/github'
import { parseJavascriptCommentTags } from './comments'
import { gitChangedFiles, readFileAtCommit } from './git'

//TODO: test todo
console.dir(context, {depth: null, colors: false})

//these are not typed unfortunately
const {before, after} = context.payload
const {default_branch} = context.payload.repository!

const branch = context.ref.replace('refs/heads/', '')
console.log('branch:', branch)
console.log('base is default branch:', default_branch === branch)

const files = await gitChangedFiles(before, after)
//TODO: paralellize this
for(const file of files) {
    if(!file.endsWith('.ts')) continue
    const content = await readFileAtCommit(after, file)
    const tagged = parseJavascriptCommentTags(content, ['todo'])
    console.log(file, tagged)
}
