import { exec as execCb } from "child_process"
import { promisify } from "util"
import { splitLines } from "./util"

const exec = promisify(execCb)

export async function gitChangedFiles(before: string, after: string): Promise<string[]> {
    const {stdout} = await exec(`git diff --name-only ${before}...${after}`)
    return splitLines(stdout.trim())
}

export async function readFileAtCommit(commitSHA: string, filePath: string): Promise<string|undefined> {
    try {
        const {stdout} = await exec(`git show ${commitSHA}:${filePath}`)
        return stdout
    } catch (err) {
        return undefined
    }
}

// export async function commitAllChanges() {
//     await exec(`git commit -a --author="Github Action Bot <>" -m "Assign tagged comment issue numbers"`)
// }