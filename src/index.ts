import {  } from '@actions/core'
import { context } from '@actions/github'
import { gitChangedFiles } from './git'
import { CommentResolver } from './CommentResolver'

//TODO: test todo
console.dir(context, {depth: null, colors: false})

//these are not typed unfortunately
const {before, after} = context.payload
const {default_branch} = context.payload.repository!

const branch = context.ref.replace('refs/heads/', '')
console.log('branch:', branch)
console.log('base is default branch:', default_branch === branch)

const beforeFiles = await gitChangedFiles(before, after)
const beforeResolver = new CommentResolver(before, beforeFiles, ['todo'])
const beforeTags = await beforeResolver.resolve()

const afterFiles = await gitChangedFiles(before, after)
const afterResolver = new CommentResolver(before, afterFiles, ['todo'])
const afterTags = await afterResolver.resolve()

console.log(beforeTags)
console.log(afterTags)
