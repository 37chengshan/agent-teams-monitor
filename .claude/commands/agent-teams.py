#!/usr/bin/env python3
"""
Agent Teams Monitor - Claude Code Slash Command Script
Usage: python agent-teams.py [start|server|client|stop]
"""

import os
import sys
import subprocess
import signal

PROJECT_DIR = os.path.dirname(os.path.abspath(__file__))
PROCESSES = []

COMMANDS = {
    'start': 'npm run dev',
    'server': 'npm run dev:server',
    'client': 'npm run dev:client',
    'stop': 'stop',
    'help': 'help',
}


def run_command(cmd):
    """Run npm command"""
    process = subprocess.Popen(
        cmd,
        shell=True,
        cwd=PROJECT_DIR,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True,
        bufsize=1
    )
    PROCESSES.append(process)

    # Print output in real-time
    for line in process.stdout:
        print(line, end='')

    process.wait()
    return process.returncode


def stop_all():
    """Stop all running processes"""
    for proc in PROCESSES:
        try:
            proc.terminate()
            proc.wait(timeout=5)
        except:
            try:
                proc.kill()
            except:
                pass

    # Also kill any npm processes related to this project
    try:
        subprocess.run('taskkill /F /IM node.exe /T', shell=True, capture_output=True)
    except:
        pass

    print("✅ All services stopped")


def main():
    cmd = sys.argv[1] if len(sys.argv) > 1 else 'start'
    cmd = cmd.lower()

    if cmd not in COMMANDS:
        print(f"Unknown command: {cmd}")
        cmd = 'help'

    if cmd == 'help':
        print("""
🤖 Agent Teams Monitor CLI

用法: /agent-teams [命令]

命令:
  start       启动监控面板 (前端 + 后端)
  server      仅启动后端
  client      仅启动前端
  stop        停止所有服务

示例:
  /agent-teams start
  /agent-teams server
  /agent-teams stop
""")
        return

    if cmd == 'stop':
        stop_all()
        return

    # Check if dependencies are installed
    node_modules = os.path.join(PROJECT_DIR, 'node_modules')
    if not os.path.exists(node_modules):
        print("📦 安装依赖中...")
        subprocess.run('npm install', shell=True, cwd=PROJECT_DIR)

    print(f"🚀 启动 Agent Teams Monitor: {cmd}")
    print(f"📁 项目目录: {PROJECT_DIR}\n")

    run_command(COMMANDS[cmd])


if __name__ == '__main__':
    try:
        main()
    except KeyboardInterrupt:
        print("\n👋 停止服务...")
        stop_all()
