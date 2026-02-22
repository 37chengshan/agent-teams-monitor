/**
 * Agent Teams Monitor Skill - 安装脚本
 * 交互式配置端口
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const PROJECT_PATH = 'E:/task/agent-teams-monitor';

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

async function main() {
  console.log('\n🎯 Agent Teams Monitor 安装向导\n');
  console.log('='.repeat(50));

  // 检查项目是否存在
  if (!fs.existsSync(PROJECT_PATH)) {
    console.log('\n❌ 错误: 项目目录不存在');
    console.log(`   路径: ${PROJECT_PATH}`);
    console.log('\n请确保 agent-teams-monitor 项目存在于指定路径');
    rl.close();
    return;
  }

  // 1. 配置Server端口
  let serverPort = await question('Server端口 (默认 3002): ');
  while (serverPort && !validatePort(serverPort)) {
    console.log('   ❌ 端口无效，请输入 1-65535 之间的数字');
    serverPort = await question('Server端口 (默认 3002): ');
  }
  const finalServerPort = serverPort || '3002';

  // 2. 配置Client端口
  let clientPort = await question('Client端口 (默认 3000): ');
  while (clientPort && !validatePort(clientPort)) {
    console.log('   ❌ 端口无效，请输入 1-65535 之间的数字');
    clientPort = await question('Client端口 (默认 3000): ');
  }
  const finalClientPort = clientPort || '3000';

  console.log('\n📝 正在配置...');

  // 3. 配置Server端口环境变量
  const serverEnvPath = path.join(PROJECT_PATH, 'server', '.env');
  let serverEnvContent = '';
  if (fs.existsSync(serverEnvPath)) {
    serverEnvContent = fs.readFileSync(serverEnvPath, 'utf-8');
    // 移除旧配置
    serverEnvContent = serverEnvContent.replace(/PORT=\d+/g, '').replace(/SERVER_PORT=\d+/g, '');
  }
  serverEnvContent += `\nPORT=${finalServerPort}\nSERVER_PORT=${finalServerPort}\n`;
  fs.writeFileSync(serverEnvPath, serverEnvContent.trim());
  console.log(`  ✅ Server端口设置为: ${finalServerPort}`);

  // 4. 配置Client环境变量
  const clientEnvPath = path.join(PROJECT_PATH, 'client', '.env.local');
  const socketUrl = `http://localhost:${finalServerPort}`;
  const clientEnvContent = `# Client Configuration
NEXT_PUBLIC_DEMO_MODE=false
NEXT_PUBLIC_SOCKET_URL=${socketUrl}
`;
  fs.writeFileSync(clientEnvPath, clientEnvContent);
  console.log(`  ✅ Client端口设置为: ${finalClientPort}`);
  console.log(`  ✅ Socket URL设置为: ${socketUrl}`);

  console.log('\n' + '='.repeat(50));
  console.log('🎉 安装完成！\n');
  console.log('启动命令:');
  console.log(`  cd ${PROJECT_PATH}`);
  console.log('  npm run dev\n');
  console.log('访问地址:');
  console.log(`  前端: http://localhost:${finalClientPort}`);
  console.log(`  后端: http://localhost:${finalServerPort}\n`);

  rl.close();
}

main().catch(console.error);
