"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ToolManager = void 0;
const child_process_1 = require("child_process");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const util = __importStar(require("util"));
const execAsync = util.promisify(child_process_1.exec);
const MONOREPO_PATH = process.env.MONOREPO_PATH || "/monorepo";
class ToolManager {
    async execute(name, args) {
        console.log(`[toolManager] Executing ${name}:`, args);
        switch (name) {
            case "shell":
            case "execute_command":
                return await this.shell(args.command);
            case "read_file":
                return this.readFile(args.path);
            case "write_file":
                return this.writeFile(args.path, args.content);
            case "list_files":
            case "ls":
            case "read_dir":
                return this.listFiles(args.path || ".");
            default:
                return `Error: Tool ${name} not found. Available tools: shell, execute_command, read_file, write_file, list_files, read_dir.`;
        }
    }
    async shell(command) {
        try {
            if (!command)
                return "Error: No command provided";
            // Auto-correct common path errors from AI
            const sanitizedCommand = command.replace(/\/home\/user/g, MONOREPO_PATH);
            console.log(`[toolManager] Running shell: ${sanitizedCommand}`);
            const { stdout, stderr } = await execAsync(sanitizedCommand, {
                cwd: MONOREPO_PATH,
                timeout: 30000 // 30s timeout
            });
            return (stdout || "") + (stderr ? "\nStderr: " + stderr : "");
        }
        catch (error) {
            return `Error executing shell: ${error.message}\nStdout: ${error.stdout || ""}\nStderr: ${error.stderr || ""}`;
        }
    }
    readFile(filePath) {
        try {
            if (!filePath)
                return "Error: No path provided";
            const sanitizedPath = filePath.replace(/\/home\/user/g, MONOREPO_PATH);
            const fullPath = path.isAbsolute(sanitizedPath) ? sanitizedPath : path.resolve(MONOREPO_PATH, sanitizedPath);
            if (!fs.existsSync(fullPath))
                return `Error: File ${filePath} not found`;
            if (fs.lstatSync(fullPath).isDirectory()) {
                return `Error: ${filePath} is a directory. Use list_files or read_dir to see content.`;
            }
            return fs.readFileSync(fullPath, "utf8");
        }
        catch (error) {
            return `Error reading file: ${error.message}`;
        }
    }
    listFiles(dirPath) {
        try {
            const sanitizedPath = dirPath.replace(/\/home\/user/g, MONOREPO_PATH);
            const fullPath = path.isAbsolute(sanitizedPath) ? sanitizedPath : path.resolve(MONOREPO_PATH, sanitizedPath);
            if (!fs.existsSync(fullPath))
                return `Error: Directory ${dirPath} not found`;
            if (!fs.lstatSync(fullPath).isDirectory())
                return `Error: ${dirPath} is a file. Use read_file.`;
            // Return a recursive tree up to depth 3 for richer context in a single call
            const lines = [];
            this.buildTree(fullPath, "", 0, 3, lines);
            return lines.join("\n");
        }
        catch (error) {
            return `Error listing files: ${error.message}`;
        }
    }
    buildTree(dir, prefix, depth, maxDepth, lines) {
        if (depth >= maxDepth)
            return;
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        entries.forEach((entry, idx) => {
            const isLast = idx === entries.length - 1;
            const connector = isLast ? "└── " : "├── ";
            const suffix = entry.isDirectory() ? "/" : "";
            lines.push(`${prefix}${connector}${entry.name}${suffix}`);
            if (entry.isDirectory()) {
                const childPrefix = prefix + (isLast ? "    " : "│   ");
                this.buildTree(path.join(dir, entry.name), childPrefix, depth + 1, maxDepth, lines);
            }
        });
    }
    writeFile(filePath, content) {
        try {
            if (!filePath)
                return "Error: No path provided";
            const sanitizedPath = filePath.replace(/\/home\/user/g, MONOREPO_PATH);
            const fullPath = path.isAbsolute(sanitizedPath) ? sanitizedPath : path.resolve(MONOREPO_PATH, sanitizedPath);
            // Ensure directory exists
            const dir = path.dirname(fullPath);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }
            fs.writeFileSync(fullPath, content, "utf8");
            // Add chmod 666 to ensure file is readable/writable by host and docker users
            try {
                fs.chmodSync(fullPath, 0o666);
            }
            catch (chmodError) {
                // Silently ignore if chmod fails, but log it
                console.warn(`[toolManager] Failed to chmod ${fullPath}:`, chmodError);
            }
            return `File ${filePath} written successfully to ${fullPath}`;
        }
        catch (error) {
            return `Error writing file: ${error.message}`;
        }
    }
}
exports.ToolManager = ToolManager;
