// // deploy.js (增强版，带进度提示)
// const { exec } = require('child_process');
// const client = require('scp2');

// // ========== 请修改以下配置 ==========
// const serverConfig = {
//     host: '81.71.163.202',
//     port: 22,
//     username: 'root',
//     password: "TSQsf`-z/9?}2",
//     // privateKey: require('fs').readFileSync('/path/to/your/private/key.pem'),
//     // passphrase: 'your-key-passphrase-if-any'
// };
// const localDir = './public';
// const remoteDir = '/usr/local/nginx/html';
// // ========== 配置结束 ==========

// console.log('🚀 开始部署...');

// exec('hexo clean && hexo g', (error, stdout, stderr) => {
//     if (error) {
//         console.error(`❌ Hexo 生成失败: ${error}`);
//         return;
//     }
//     console.log('✅ Hexo 生成完成');
//     console.log(stdout);
//     if (stderr) console.error('STDERR:', stderr);

//     console.log('📤 正在上传文件到服务器...');

//     // 使用 scp2 的 Client 类，可以监听进度事件
//     const ScpClient = client.Client;
//     const scpClient = new ScpClient(serverConfig);

//     let lastPercent = 0;

//     scpClient.on('transfer', (buffer, uploaded, total) => {
//         const percent = Math.floor((uploaded / total) * 100);
//         if (percent > lastPercent && percent % 10 === 0) { // 每10%打印一次
//             console.log(`📤 上传进度: ${percent}% (${uploaded}/${total} bytes)`);
//             lastPercent = percent;
//         }
//     });

//     scpClient.upload(localDir, remoteDir, (err) => {
//         if (err) {
//             console.error(`❌ 上传失败: ${err}`);
//         } else {
//             console.log('🎉 部署成功！您的网站已更新。');
//             console.log(`👉 访问地址: http://${serverConfig.host}`);
//         }
//         scpClient.close();
//     });
// });

// deploy-ssh.js (使用 node-ssh)
const { exec } = require('child_process');
const { NodeSSH } = require('node-ssh');

// 安装: npm install node-ssh
const ssh = new NodeSSH();
const config = {
    host: '81.71.163.202',
    username: 'root',
    password: 'TSQsf`-z/9?}2',
};

console.log('🚀 开始部署...');

exec('hexo clean && hexo g', async (error) => {
    if (error) {
        console.error(`❌ Hexo 生成失败: ${error}`);
        return;
    }

    console.log('✅ Hexo 生成完成');

    try {
        // 连接服务器
        console.log('🔗 连接服务器...');
        await ssh.connect(config);

        // 清空远程目录
        console.log('🧹 清理远程目录...');
        await ssh.execCommand(`rm -rf /usr/local/nginx/html/*`);

        // 上传整个目录
        console.log('📤 上传文件中...');
        const result = await ssh.putDirectory('./public', '/usr/local/nginx/html', {
            recursive: true,
            concurrency: 10,
            tick: (localPath, remotePath, error) => {
                if (error) {
                    console.error(`❌ 上传失败 ${localPath}: ${error}`);
                } else {
                    console.log(`✅ 上传完成: ${localPath}`);
                }
            }
        });

        if (result) {
            console.log('🎉 部署成功！');
            console.log(`👉 访问地址: http://${config.host}`);
        } else {
            console.error('❌ 部署失败');
        }

        ssh.dispose();
    } catch (err) {
        console.error(`❌ 部署失败: ${err}`);
    }
});