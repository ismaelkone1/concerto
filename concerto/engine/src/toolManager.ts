import { exec } from "child_process";
import * as fs from "fs";
import * as path from "path";
import * as util from "util";

const execAsync = util.promisify(exec);
const WORKSPACE_PATH = process.env.GIT_REPO_PATH || process.cwd();

export class ToolManager {
  async execute(name: string, args: any): Promise<string> {
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

  private async shell(command: string): Promise<string> {
    try {
      if (!command) return "Error: No command provided";
      // Auto-correct common path errors from AI
      const sanitizedCommand = command.replace(/\/home\/user/g, WORKSPACE_PATH);
      console.log(`[toolManager] Running shell: ${sanitizedCommand}`);
      const { stdout, stderr } = await execAsync(sanitizedCommand, { 
        cwd: WORKSPACE_PATH,
        timeout: 30000 // 30s timeout
      });
      return (stdout || "") + (stderr ? "\nStderr: " + stderr : "");
    } catch (error: any) {
      return `Error executing shell: ${error.message}\nStdout: ${error.stdout || ""}\nStderr: ${error.stderr || ""}`;
    }
  }

  private readFile(filePath: string): string {
    try {
      if (!filePath) return "Error: No path provided";
      const sanitizedPath = filePath.replace(/\/home\/user/g, WORKSPACE_PATH);
      const fullPath = path.isAbsolute(sanitizedPath) ? sanitizedPath : path.resolve(WORKSPACE_PATH, sanitizedPath);
      
      if (!fs.existsSync(fullPath)) return `Error: File ${filePath} not found`;
      if (fs.lstatSync(fullPath).isDirectory()) {
        return `Error: ${filePath} is a directory. Use list_files or read_dir to see content.`;
      }
      
      return fs.readFileSync(fullPath, "utf8");
    } catch (error: any) {
      return `Error reading file: ${error.message}`;
    }
  }

  private listFiles(dirPath: string): string {
    try {
      const sanitizedPath = dirPath.replace(/\/home\/user/g, WORKSPACE_PATH);
      const fullPath = path.isAbsolute(sanitizedPath) ? sanitizedPath : path.resolve(WORKSPACE_PATH, sanitizedPath);
      
      if (!fs.existsSync(fullPath)) return `Error: Directory ${dirPath} not found`;
      if (!fs.lstatSync(fullPath).isDirectory()) return `Error: ${dirPath} is a file. Use read_file.`;
      
      // Return a recursive tree up to depth 3 for richer context in a single call
      const lines: string[] = [];
      this.buildTree(fullPath, "", 0, 3, lines);
      return lines.join("\n");
    } catch (error: any) {
      return `Error listing files: ${error.message}`;
    }
  }

  private buildTree(dir: string, prefix: string, depth: number, maxDepth: number, lines: string[]): void {
    if (depth >= maxDepth) return;
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

  private writeFile(filePath: string, content: string): string {
    try {
      if (!filePath) return "Error: No path provided";
      const sanitizedPath = filePath.replace(/\/home\/user/g, WORKSPACE_PATH);
      const fullPath = path.isAbsolute(sanitizedPath) ? sanitizedPath : path.resolve(WORKSPACE_PATH, sanitizedPath);
      
      // Ensure directory exists
      const dir = path.dirname(fullPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      fs.writeFileSync(fullPath, content, "utf8");
      // Add chmod 666 to ensure file is readable/writable by host and docker users
      try {
        fs.chmodSync(fullPath, 0o666);
      } catch (chmodError) {
        // Silently ignore if chmod fails, but log it
        console.warn(`[toolManager] Failed to chmod ${fullPath}:`, chmodError);
      }
      return `File ${filePath} written successfully to ${fullPath}`;
    } catch (error: any) {
      return `Error writing file: ${error.message}`;
    }
  }
}
