// OPC UA 客户端示例 (优化版)
// 支持连接、读取、监控 OPC UA 服务器

const { OPCUAClient, AttributeIds, DataType, MonitoredItem, TimestampsToReturn } = require("node-opcua");

// 配置
const CONFIG = {
  // 公共测试服务器列表
  testServers: [
    "opc.tcp://opcuademo.sterfive.com:26543",
    "opc.tcp://localhost:4840",
  ],
  defaultEndpoint: "opc.tcp://opcuademo.sterfive.com:26543"
};

// 创建客户端实例
function createClient(endpointUrl = CONFIG.defaultEndpoint) {
  return OPCUAClient.create({
    endpointMustExist: false,
    securityMode: "None",
    connectionStrategy: {
      maxRetry: 2,
      initialDelay: 1000,
      maxDelay: 5000
    },
    timeout: 10000
  });
}

// 连接并获取会话
async function connect(endpointUrl = CONFIG.defaultEndpoint) {
  const client = createClient(endpointUrl);
  
  console.log(`🔌 正在连接 ${endpointUrl}...`);
  await client.connect();
  console.log("✅ 连接成功!");
  
  const session = await client.createSession();
  console.log("✅ 会话已创建!");
  
  return { client, session };
}

// 读取节点值
async function readNode(session, nodeId) {
  const dataValue = await session.read({
    nodeId: nodeId,
    attributeId: AttributeIds.Value
  });
  
  if (dataValue.statusCode.isGood()) {
    return dataValue.value.value;
  }
  return null;
}

// 读取服务器状态
async function getServerStatus(session) {
  const statusNode = "ns=0;i=2258"; // ServerStatus
  const nameNode = "ns=0;i=2261";   // ServerName
  
  const status = await readNode(session, statusNode);
  const name = await readNode(session, nameNode);
  
  return { status, name };
}

// 浏览节点树
async function browseNodes(session, nodeId = "ns=0;i=84") { // ObjectsFolder
  const result = await session.browse({
    nodeId: nodeId,
    browseDirection: "Forward",
    includeSubtypes: true,
    nodeClassMask: 0, // 所有类型
    resultMask: 63
  });
  
  return result.references || [];
}

// 写入节点值
async function writeNode(session, nodeId, value, dataType = DataType.Double) {
  const statusCode = await session.write({
    nodeId: nodeId,
    attributeId: AttributeIds.Value,
    value: {
      value: {
        dataType: dataType,
        value: value
      }
    }
  });
  
  return statusCode.isGood();
}

// 订阅监控节点
async function subscribeNodes(session, nodeIds, callback) {
  const subscription = await session.createSubscription2({
    requestedPublishingInterval: 1000,
    requestedLifetimeCount: 100,
    requestedMaxKeepAliveCount: 10,
    maxNotificationsPerPublish: 100,
    publishingEnabled: true,
    priority: 10
  });
  
  const monitoredItems = nodeIds.map(nodeId => ({
    nodeId: nodeId,
    attributeId: AttributeIds.Value,
    samplingInterval: 1000,
    discardOldest: true,
    queueSize: 10
  }));
  
  const item = await subscription.monitorItems(monitoredItems, TimestampsToReturn.Both);
  
  item.on("changed", ( monitoredValue ) => {
    callback(monitoredValue);
  });
  
  return subscription;
}

// 断开连接
async function disconnect(client, session) {
  if (session) await session.close();
  if (client) await client.disconnect();
  console.log("🔌 已断开连接");
}

// 测试入口
async function test() {
  try {
    const { client, session } = await connect();
    
    console.log("\n📊 获取服务器状态...");
    const serverStatus = await getServerStatus(session);
    console.log("服务器名称:", serverStatus.name?.text || serverStatus.name);
    console.log("服务器状态:", JSON.stringify(serverStatus.status).substring(0, 200));
    
    console.log("\n📁 浏览节点...");
    const nodes = await browseNodes(session);
    console.log(`找到 ${nodes.length} 个节点`);
    nodes.slice(0, 5).forEach(n => {
      console.log(`  - ${n.browseName.name} (${n.nodeId.value})`);
    });
    
    await disconnect(client, session);
  } catch (error) {
    console.error("❌ 错误:", error.message);
  }
}

// 运行测试
test();

module.exports = {
  connect,
  disconnect,
  readNode,
  writeNode,
  browseNodes,
  subscribeNodes,
  getServerStatus,
  CONFIG
};