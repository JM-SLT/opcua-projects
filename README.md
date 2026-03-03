# 🚀 OPC UA Tools

[![npm version](https://img.shields.io/npm/v/@jm-slt/opcua-tools)](https://www.npmjs.com/package/@jm-slt/opcua-tools)
[![Node.js](https://img.shields.io/node/v/@jm-slt/opcua-tools)](https://nodejs.org/)
[![License: MIT](https://img.shields.io/npm/l/@jm-slt/opcua-tools)](LICENSE)
[![GitHub stars](https://img.shields.io/github/stars/JM-SLT/opcua-projects)](https://github.com/JM-SLT/opcua-projects/stargazers)

> Comprehensive OPC UA toolkit for Node.js - Client, Server, and Utilities

## 📦 安装

```bash
npm install @jm-slt/opcua-tools
```

## ✨ 特性

- 🔌 **OPC UA 客户端** - 连接、读取、写入、订阅服务器
- 🖥️ **OPC UA 服务器** - 快速创建自己的 OPC UA 服务器
- 🛠️ **工具函数** - 批量读取、节点浏览、端点发现
- 🐳 **Docker 支持** - 一键启动服务器和客户端
- 📡 **实时监控** - 订阅数据变化，实时响应

## 🚀 快速开始

### 1. 连接到 OPC UA 服务器

```javascript
const { quickConnect, readMultipleNodes } = require('@jm-slt/opcua-tools');

async function main() {
  // 快速连接
  const { client, session } = await quickConnect('opc.tcp://localhost:4840');
  
  // 读取多个节点
  const results = await readMultipleNodes(session, [
    'ns=0;i=2258',  // ServerStatus
    'ns=0;i=2261'   // ServerName
  ]);
  
  console.log(results);
  
  await session.close();
  await client.disconnect();
}

main();
```

### 2. 创建 OPC UA 服务器

```javascript
const { createServer } = require('@jm-slt/opcua-tools/server');

createServer().then(server => {
  console.log('Server running on opc.tcp://localhost:4840');
});
```

### 3. 使用 Docker

```bash
# 启动服务器和客户端
docker-compose up

# 仅启动服务器
npm run docker:server

# 仅启动客户端
npm run docker:client
```

## 📖 API 文档

### 客户端函数

| 函数 | 说明 |
|------|------|
| `quickConnect(endpoint, options)` | 快速连接到 OPC UA 服务器 |
| `readMultipleNodes(session, nodeIds)` | 批量读取多个节点 |
| `discoverEndpoints(endpoint)` | 发现服务器端点 |
| `browseTree(session, rootNodeId, depth)` | 浏览节点树 |

### 服务器函数

| 函数 | 说明 |
|------|------|
| `createServer(options)` | 创建 OPC UA 服务器 |
| `addVariable(addressSpace, name, nodeId, value, dataType)` | 添加变量节点 |
| `addSensor(addressSpace, name, nodeId, config)` | 添加模拟传感器 |

## 🔗 相关资源

- [node-opcua 官方文档](https://node-opcua.github.io/)
- [OPC Foundation](https://opcfoundation.org/)
- [OPC UA 规范](https://opcfoundation.org/developer-tools/specifications-opc-ua-information-model)

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE)

---

<div align="center">

⭐ Star 此项目以表示支持！

</div>