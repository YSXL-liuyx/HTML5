#!/usr/bin/env node
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const projectRoot = process.cwd();

function run(cmd, options = {}) {
  console.log(`\n> ${cmd}`);
  execSync(cmd, { stdio: 'inherit', ...options });
}

async function main() {
  try {
    console.log('📦 1. 构建 Vue 项目...');
    run('npm run build');

    console.log('📁 2. 拷贝构建产物到 Capacitor...');
    run('npx cap copy');

    console.log('🔄 3. 同步 Capacitor Android 平台...');
    run('npx cap sync android');

    // -------------------------
    // Android APK
    // -------------------------
    console.log('🤖 4. 自动打包 Android APK...');
    const androidDir = path.join(projectRoot, 'android');
    if (!fs.existsSync(androidDir)) throw new Error('Android 项目不存在，请先 npx cap add android');

    // 使用 Gradle 构建 APK
    const gradlew = process.platform === 'win32' ? 'gradlew.bat' : './gradlew';
    run(`${gradlew} assembleDebug`, { cwd: androidDir });

    const apkPath = path.join(androidDir, 'app/build/outputs/apk/debug/app-debug.apk');
    console.log('✅ Android APK 已生成：', apkPath);

    console.log('\n🎉 完成！APK 文件可直接安装到真机演示');
  } catch (err) {
    console.error('\n❌ 打包失败:', err.message);
    process.exit(1);
  }
}

main();
