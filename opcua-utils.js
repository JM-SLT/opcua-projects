// 完整的 OPC UA 工具库
// 包含客户端、服务器、工具函数

const { OPCUAClient, OPCUAServer, AttributeIds, DataType, StatusCodes, Variant } = require("node-opcua");

// ==================== 客户端工具 ====================

/**
 * 快速连接 OPC UA 服务器
 * @param {string} endpoint - 服务器地址
 * @param {object} options - 连接选项
 */
async function quickConnect(endpoint, options = {}) {
  const client = OPCUAClient.create({
    endpointMustExist: false,
    securityMode: options.securityMode || "None",
    securityPolicy: options.securityPolicy || "None",
    connectionStrategy: {
      maxRetry: options.maxRetry || 2,
      initialDelay: 1000,
      maxDelay: 5000
    }
  });

  await client.connect(endpoint);
  const session = await client.createSession();
  
  return { client, session };
}

/**
 * 批量读取节点
 * @param {object} session - OPC UA 会话
 * @param {string[]} nodeIds - 节点 ID 数组
 */
async function readMultipleNodes(session, nodeIds) {
  const nodesToRead = nodeIds.map(nodeId => ({
    nodeId,
    attributeId: AttributeIds.Value
  }));
  
  const dataValues = await session.read(nodesToRead);
  
  return dataValues.map((dv, i) => ({
    nodeId: nodeIds[i],
    value: dv.value?.value,
    status: dv.statusCode.isGood()
  }));
}

/**
 * 发现服务器端点
 * @param {string} endpoint - 服务器地址
 */
async function discoverEndpoints(endpoint) {
  const client = OPCUAClient.create();
  const endpoints = await client.getEndpoints(endpoint);
  await client.disconnect();
  
  return endpoints.map(ep => ({
    endpointUrl: ep.endpointUrl,
    securityMode: ep.securityMode,
    securityPolicy: ep.securityPolicy,
    transportProfileUri: ep.transportProfileUri
  }));
}

/**
 * 浏览节点树
 * @param {object} session - OPC UA 会话
 * @param {string} rootNodeId - 根节点 ID
 * @param {number} depth - 深度
 */
async function browseTree(session, rootNodeId = "ns=0;i=84", depth = 2) {
  const results = [];
  
  async function browse(nodeId, currentDepth) {
    if (currentDepth > depth) return;
    
    try {
      const result = await session.browse({
        nodeId,
        browseDirection: "Forward",
        includeSubtypes: true,
        nodeClassMask: 0,
        resultMask: 63
      });
      
      for (const ref of result.references || []) {
        results.push({
          nodeId: ref.nodeId.value,
          browseName: ref.browseName.name,
          nodeClass: ref.nodeClass
        });
        
        await browse(ref.nodeId.value, currentDepth + 1);
      }
    } catch (e) {
      // 忽略错误
    }
  }
  
  await browse(rootNodeId, 0);
  return results;
}

// ==================== 服务器工具 ====================

/**
 * 创建自定义变量节点
 * @param {object} addressSpace - 地址空间
 * @param {string} name - 变量名
 * @param {string} nodeId - 节点 ID
 * @param {any} value - 初始值
 * @param {string} dataType - 数据类型
 */
function addVariable(addressSpace, name, nodeId, value, dataType = "Double") {
  return addressSpace.addVariable({
    browseName: name,
    nodeId: nodeId,
    dataType: dataType,
    value: {
      dataType: DataType[dataType],
      value: value
    }
  });
}

/**
 * 创建模拟传感器
 * @param {object} addressSpace - 地址空间
 * @param {string} name - 传感器名称
 * @param {string} nodeId - 节点 ID
 * @param {object} config - 配置 {min, max, delta, interval}
 */
function addSensor(addressSpace, name, nodeId, config = {}) {
  const { min = 0, max = 100, delta = 1, interval = 1000 } = config;
  
  let currentValue = min;
  
  const sensor = addressSpace.addAnalogDataItem({
    browseName: name,
    nodeId: nodeId,
    dataType: "Double",
    value: currentValue,
    instrumentRange: { low: min, high: max },
    engineeringUnitsRange: { low: min, high: max }
  });
  
  setInterval(() => {
    currentValue += (Math.random() - 0.5) * delta * 2;
    if (currentValue > max) currentValue = min;
    if (currentValue < min) currentValue = max;
    
    sensor.setValueFromSource({
      dataType: DataType.Double,
      value: currentValue
    });
  }, interval);
  
  return sensor;
}

// ==================== 常用节点 ID ====================

const Common NodeIds = {
  // 服务器信息
  ServerStatus: "ns=0;i=2258",
  ServerName: "ns=0;i=2261",
  ServerNamespaceArray: "ns=0;i=2006",
  ServerStartTime: "ns=0;i=2259",
  ServerCurrentTime: "ns=0;i=2258.CurrentTime",
  
  // 常用对象
  ObjectsFolder: "ns=0;i=84",
  RootFolder: "ns=0;i=0",
  TypesFolder: "ns=0;i=86",
  
  // 数据类型
  Boolean: "ns=0;i=1",
  Int16: "ns=0;i=4",
  Int32: "ns=0;i=6",
  Double: "ns=0;i=11",
  String: "ns=0;i=12"
};

module.exports = {
  // 客户端
  quickConnect,
  readMultipleNodes,
  discoverEndpoints,
  browseTree,
  
  // 服务器
  addVariable,
  addSensor,
  CommonNodeIds,
  
  // 导出核心类
  OPCUAClient,
  OPCUAServer,
  AttributeIds,
  DataType,
  StatusCodes,
  Variant
};