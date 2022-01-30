import { promises as fs } from "fs";
import { systemLogger } from "./logger.js";
import { WORKSPACE_BASE } from "./constants.js";

export async function cleanUp(directory) {
    const dir = WORKSPACE_BASE + directory;
    try {
        await fs.rm(dir, { recursive: true, force: true });
    } catch (err) {
        systemLogger.error(err);
    }
}
