# OPC UA Client Library

基于 node-opcua 的简单 OPC UA 客户端库，用于连接和操作 OPC UA 服务器。

## 安装

```bash
npm install @jm-slt/opcua-client
```

## 使用方法

```javascript
const { connect, readNode, browseNodes, disconnect } = require('@jm-slt/opcua-client');

async function main() {
  // 连接 OPC UA 服务器
  const { client, session } = await connect('opc.tcp://localhost:4840');
  
  // 读取节点值
  const value = await readNode(session, 'ns=0;i=2258');
  console.log('Value:', value);
  
  // 浏览节点树
  const nodes = await browseNodes(session);
  console.log('Nodes:', nodes);
  
  // 断开连接
  await disconnect(client, session);
}

main();
```

## API

### connect(endpointUrl)
连接到 OPC UA 服务器，返回 { client, session }

### readNode(session, nodeId)
读取指定节点的值

### writeNode(session, nodeId, value, dataType)
写入节点值

### browseNodes(session, nodeId)
浏览节点树

### subscribeNodes(session, nodeIds, callback)
订阅节点变化

### disconnect(client, session)
断开连接

## 示例

更多示例见 [examples](./examples) 目录。

## 许可证

MIT