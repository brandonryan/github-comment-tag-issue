import {} from "@actions/core"
import {context} from "@actions/github"

//TODO: figure out a way to get here v2

//these are not typed unfortunately
const {base, head} = context.payload.pull_request!
const {default_branch} = context.payload.repository!

console.log("base ref:", base.ref)
console.log("base sha:", base.sha)
console.log("head ref:", head.ref)
console.log("base sha:", head.sha)

console.log("base is default branch:", default_branch === base.ref)