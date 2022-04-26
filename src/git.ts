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

//c3220faa3c60d91a966ecefe8ea05b7a638a0766
//1bfc8b533b7b7c63d8011e04cf9207c118714633