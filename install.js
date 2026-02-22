/**
 * Agent Teams Monitor Skill - 安装脚本
 * 从 GitHub 克隆项目并自动配置
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import readline from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// GitHub 仓库地址
const GITHUB_REPO = 'https://github.com/37chengshan/agent-teams-monitor.git';
const DEFAULT_INSTALL_PATH = path.join(process.env.HOME || process.env.USERPROFILE, '.claude', 'plugins', 'agentteams-monitor-skills');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

function validatePort(port) {
  const num = parseInt(port, 10);
  return !isNaN(num) && num > 0 && num < 65536;
}

function log(msg, type = 'info') {
  const symbols = { info: 'ℹ', success: '✅', error: '❌', warn: '⚠️' };
  console.log(`  ${symbols[type] || '•'} ${msg}`);
}

async function main() {
  console.log('\n🎯 Agent Teams Monitor 安装向导\n');
  console.log('='.repeat(50));

  // 1. 选择安装路径
  const installPath = await question(`安装路径 (默认: ${DEFAULT_INSTALL_PATH}): `);
  const finalPath = installPath || DEFAULT_INSTALL_PATH;

  // 2. 配置Server端口
  let serverPort = await question('Server端口 (默认 3002): ');
  while (serverPort && !validatePort(serverPort)) {
    log('端口无效，请输入 1-65535 之间的数字', 'error');
    serverPort = await question('Server端口 (默认 3002): ');
  }
  const finalServerPort = serverPort || '3002';

  // 3. 配置Client端口
  let clientPort = await question('Client端口 (默认 3000): ');
  while (clientPort && !validatePort(clientPort)) {
    log('端口无效，请输入 1-65535 之间的数字', 'error');
    clientPort = await question('Client端口 (默认 3000): ');
  }
  const finalClientPort = clientPort || '3000';

  console.log('\n');
  log(`安装路径: ${finalPath}`, 'info');
  log(`Server端口: ${finalServerPort}`, 'info');
  log(`Client端口: ${finalClientPort}`, 'info');
  console.log('\n开始安装...\n');

  // 检查路径是否已存在
  if (fs.existsSync(finalPath)) {
    log('目录已存在，询问是否覆盖...', 'warn');
    const overwrite = await question('目录已存在，是否覆盖? (y/N): ');
    if (overwrite.toLowerCase() !== 'y') {
      log('安装取消', 'info');
      rl.close();
      return;
    }
    log('删除旧目录...', 'info');
    fs.rmSync(finalPath, { recursive: true, force: true });
  }

  // 克隆项目
  log('从 GitHub 克隆项目...', 'info');
  try {
    execSync(`git clone ${GITHUB_REPO} "${finalPath}"`, { stdio: 'inherit' });
  } catch (error) {
    log(`克隆失败: ${error.message}`, 'error');
    rl.close();
    return;
  }

  // 安装依赖
  log('安装依赖 (这可能需要几分钟)...', 'info');
  try {
    execSync('npm install', { cwd: finalPath, stdio: 'inherit' });
  } catch (error) {
    log(`依赖安装失败: ${error.message}`, 'error');
    rl.close();
    return;
  }

  // 配置环境变量
  log('配置环境变量...', 'info');

  // Server 配置
  const serverEnvPath = path.join(finalPath, 'server', '.env');
  const serverEnvContent = `PORT=${finalServerPort}
SERVER_PORT=${finalServerPort}
LOG_LEVEL=info
`;
  fs.writeFileSync(serverEnvPath, serverEnvContent);
  log(`Server端口: ${finalServerPort}`, 'success');

  // Client 配置
  const clientEnvPath = path.join(finalPath, 'client', '.env.local');
  const socketUrl = `http://localhost:${finalServerPort}`;
  const clientEnvContent = `# Client Configuration
NEXT_PUBLIC_DEMO_MODE=false
NEXT_PUBLIC_SOCKET_URL=${socketUrl}
`;
  fs.writeFileSync(clientEnvPath, clientEnvContent);
  log(`Client端口: ${finalClientPort}`, 'success');
  log(`Socket URL: ${socketUrl}`, 'success');

  console.log('\n' + '='.repeat(50));
  console.log('🎉 安装完成！\n');
  console.log('启动命令:');
  console.log(`  cd "${finalPath}"`);
  console.log('  npm run dev\n');
  console.log('访问地址:');
  console.log(`  前端: http://localhost:${finalClientPort}`);
  console.log(`  后端: http://localhost:${finalServerPort}`);
  console.log(`  Socket: ws://localhost:${finalServerPort}\n`);

  // 询问是否立即启动
  const startNow = await question('是否立即启动? (y/N): ');
  if (startNow.toLowerCase() === 'y') {
    log('启动服务...', 'info');
    try {
      execSync('npm run dev', { cwd: finalPath, stdio: 'inherit' });
    } catch {
      log('服务已停止', 'info');
    }
  }

  rl.close();
}

main().catch(console.error);
