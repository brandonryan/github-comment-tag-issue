import {  } from '@actions/core'
import { context } from '@actions/github'
import { gitChangedFiles } from './git'
import { CommentResolver } from './CommentResolver'

//these are not typed unfortunately
const {before, after} = context.payload
const {default_branch} = context.payload.repository!

const branch = context.ref.replace('refs/heads/', '')
console.log('branch:', branch)
console.log('base is default branch:', default_branch === branch)

const files = await gitChangedFiles(before, after)
console.log("files", files)

const beforeResolver = new CommentResolver(before, files, ['todo'])
const beforeTags = await beforeResolver.resolve()

const afterResolver = new CommentResolver(before, files, ['todo'])
const afterTags = await afterResolver.resolve()

console.log(beforeTags)
console.log(afterTags)
