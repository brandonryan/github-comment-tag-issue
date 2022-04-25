import {} from '@actions/core'
import {context} from '@actions/github'

//TODO: figure out a way to get here v2
console.dir(context, {depth: null, colors: false})

//these are not typed unfortunately
const {base, head} = context.payload.pull_request!
const {default_branch} = context.payload.repository!

console.log('base ref:', base.ref)
console.log('base sha:', base.sha)
console.log('head ref:', head.ref)
console.log('base sha:', head.sha)

console.log('base is default branch:', default_branch === base.ref)

// const output = await exec('git', ['diff', '--name-only', `${base.sha}...${head.sha}`])
// console.log('changed files: ', output)

// const file = await exec('git', ['show', `${sha}:${filePath}`])

//head: 71e64a63c027ecdd796d0e5238ce3f48cca91b4d
//base: e6919f0d3b11d7f379498929ee69b940ff7dc81e