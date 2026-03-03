// OPC UA 服务器示例
// 创建一个简单的 OPC UA 服务器

const { OPCUAServer, AttributeIds, DataType, StatusCodes } = require("node-opcua");

async function createServer() {
  const server = new OPCUAServer({
    port: 4840,
    resourcePath: "opcua/server",
    hostname: "localhost",
    buildInfo: {
      productName: "My OPC UA Server",
      manufacturerName: "JM-SLT",
      softwareVersion: "1.0.0"
    }
  });

  await server.initialize();
  console.log("✅ OPC UA 服务器已启动: opc.tcp://localhost:4840");

  // 获取地址空间
  const addressSpace = server.engine.addressSpace;
  
  // 创建自定义节点
  const namespace = addressSpace.getNamespaceIndex("http://myopcua/server/");
  
  // 创建变量节点
  const temperatureSensor = addressSpace.addAnalogDataItem({
    browseName: "TemperatureSensor",
    nodeId: "ns=2;s=TemperatureSensor",
    dataType: "Double",
    value: 25.0,
    engineeringUnitsRange: { low: -50, high: 150 },
    engineeringUnit: "degree_celsius",
    instrumentRange: { low: -40, high: 85 }
  });

  const pressureSensor = addressSpace.addAnalogDataItem({
    browseName: "PressureSensor",
    nodeId: "ns=2;s=PressureSensor",
    dataType: "Double",
    value: 101.325,
    engineeringUnitsRange: { low: 0, high: 200 },
    engineeringUnit: "kilopascal"
  });

  const counter = addressSpace.addVariable({
    browseName: "Counter",
    nodeId: "ns=2;s=Counter",
    dataType: "Int32",
    value: 0
  });

  // 模拟数据变化
  setInterval(() => {
    const now = Date.now();
    temperatureSensor.setValueFromSource({
      dataType: DataType.Double,
      value: 20 + Math.sin(now / 10000) * 10 + Math.random() * 2
    });
    
    pressureSensor.setValueFromSource({
      dataType: DataType.Double,
      value: 101.325 + Math.sin(now / 20000) * 5 + Math.random() * 0.5
    });
    
    counter.setValueFromSource({
      dataType: DataType.Int32,
      value: Math.floor(now / 1000) % 1000
    });
  }, 1000);

  console.log("📡 节点已创建: TemperatureSensor, PressureSensor, Counter");
  console.log("🔄 数据每秒更新");
  
  return server;
}

createServer().catch(console.error);

module.exports = { createServer };