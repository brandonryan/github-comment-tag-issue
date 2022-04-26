import { exec as execCb } from "child_process"
import { promisify } from "util"
import { splitLines } from "./util"

const exec = promisify(execCb)

export async function gitChangedFiles(before: string, after: string): Promise<string[]> {
    const {stdout} = await exec(`git diff --name-only ${before}...${after}`)
    return splitLines(stdout)
}

export async function readFileAtCommit(commitSHA: string, filePath: string): Promise<string|undefined> {
    try {
        const {stdout} = await exec(`git show ${commitSHA}:${filePath}`)
        return stdout
    } catch (err) {
        return undefined
    }
}