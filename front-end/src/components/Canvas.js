import React, { useState, useCallback, useRef, useEffect } from 'react';
import ReactFlow, {
  ReactFlowProvider,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  Panel,
  Handle,
  Position
} from 'reactflow';
import 'reactflow/dist/style.css';
import styles from '../styles/Bank.module.css';

// 自定义节点类型 - 带参数输入的节点
const CustomNode = ({ data, isConnectable, selected }) => {
  // 格式化参数显示
  const formatParamValue = (param) => {
    if (!param) return '';
    
    // 处理引用类型
    if (typeof param === 'object' && param.type === 'reference') {
      return `引用节点: ${param.nodeName}`;
    }
    
    if (typeof param.value === 'object' && param.value?.type === 'reference') {
      return `引用节点: ${param.value.nodeName}`;
    }
    
    if (param.value === undefined) return '';
    
    // 根据参数类型格式化显示
    switch (param.type) {
      case 'action':
        return `${param.value}`;
      case 'tableName':
        return `表: ${param.value}`;
      case 'description':
        return param.value;
      case 'number':
        return param.value.toString();
      case 'boolean':
        return param.value ? '是' : '否';
      default:
        return typeof param.value === 'string' ? 
          param.value : 
          JSON.stringify(param.value);
    }
  };
  
  return (
    <div className={`${styles.customNode} ${selected ? styles.selected : ''}`}>
      {/* 输入连接点 */}
      <Handle
        type="target"
        position={Position.Left}
        isConnectable={isConnectable}
        className={styles.handle}
      />
      
      <div className={styles.customNodeHeader}>
        <strong>{data.label}</strong>
        {data.canRun && (
          <button 
            className={styles.runNodeButton} 
            onClick={(e) => {
              e.stopPropagation();
              data.onRunNode(data.id);
            }}
            title="运行此节点"
          >
            ▶
          </button>
        )}
      </div>
      <div className={styles.customNodeContent}>
        {data.params && Object.keys(data.params).length > 0 ? (
          <div className={styles.nodeParams}>
            <small>参数：</small>
            {Object.entries(data.params).map(([key, value], idx) => (
              <div key={`param-${idx}`} className={styles.paramItem}>
                <span>{key}: </span>
                <span className={`${styles.paramValue} ${value.type ? styles[value.type] : ''}`}>
                  {formatParamValue(value)}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.noParams}>无参数</div>
        )}
      </div>
      
      {/* 输出连接点 */}
      <Handle
        type="source"
        position={Position.Right}
        isConnectable={isConnectable}
        className={styles.handle}
      />
    </div>
  );
};

// 注册自定义节点类型
const nodeTypes = {
  custom: CustomNode,
};

const Canvas = ({ 
  initialNodes = [], 
  initialEdges = [], 
  availableEvents = [], 
  eventType = '事件',
  onSave,
  onCancel
}) => {
  // ReactFlow 状态
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes.map(node => ({
    ...node,
    type: 'custom',
    data: {
      ...node.data,
      canRun: true,
      onRunNode: handleRunNode
    }
  })));
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState(null);
  const [nodeParams, setNodeParams] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [showAvailableEvents, setShowAvailableEvents] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [runningNode, setRunningNode] = useState(null);
  const [consoleOutput, setConsoleOutput] = useState([]);
  const reactFlowWrapper = useRef(null);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const [nodeName, setNodeName] = useState('');
  
  // 过滤可用事件
  const filteredAvailableEvents = availableEvents.filter(event => 
    event.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // 连接事件处理
  const onConnect = useCallback((params) => {
    setEdges((eds) => addEdge({ 
      ...params, 
      type: 'smoothstep', 
      animated: true,
      style: { stroke: '#0d6efd' }
    }, eds));
  }, [setEdges]);
  
  // 拖拽事件完成
  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);
  
  // 放置拖拽的事件
  const onDrop = useCallback(
    (event) => {
      event.preventDefault();
      
      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      const eventName = event.dataTransfer.getData('application/reactflow');
      
      // 检查是否从侧边栏拖入的事件
      if (!eventName || typeof eventName !== 'string') {
        return;
      }
      
      const position = reactFlowInstance.project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      });
      
      // 为节点生成唯一ID
      const id = `node_${eventName}_${Date.now()}`;
      
      // 创建新节点
      const newNode = {
        id,
        type: 'custom',
        position,
        data: { 
          id,
          label: eventName,
          event: eventName,
          params: {},
          canRun: true,
          onRunNode: handleRunNode
        },
        style: {
          width: 180,
        },
        sourcePosition: 'right',
        targetPosition: 'left',
      };
      
      // 添加节点参数记录
      setNodeParams(prev => ({
        ...prev,
        [id]: {}
      }));
      
      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance, setNodes]
  );
  
  // 节点点击事件
  const onNodeClick = useCallback((event, node) => {
    setSelectedNode(node);
    setNodeName(node.data.label);
  }, []);
  
  // 更新节点名称
  const updateNodeName = (e) => {
    const newName = e.target.value;
    setNodeName(newName);
    
    if (selectedNode) {
      setNodes((nds) => 
        nds.map((node) => {
          if (node.id === selectedNode.id) {
            return {
              ...node,
              data: {
                ...node.data,
                label: newName,
              },
            };
          }
          return node;
        })
      );
    }
  };
  
  // 修改添加参数的函数
  const addNodeParam = () => {
    if (!selectedNode) return;
    
    // 获取参数信息
    const paramNameElement = document.getElementById('paramName');
    const paramValueElement = document.getElementById('paramValue');
    
    if (!paramNameElement || !paramValueElement) return;
    
    let paramName = paramNameElement.value;
    let paramValue = paramValueElement.value;
    let paramType = 'string';
    
    // 当前事件类型
    const currentEventType = getEventType();
    
    // 标准事件的参数处理
    if (currentEventType === 'standard') {
      const paramTypeElement = document.getElementById('paramType');
      if (!paramTypeElement) return;
      
      paramType = paramTypeElement.value || 'string';
      
      // 如果是引用类型，使用下拉列表选择的节点
      if (paramType === 'reference') {
        const nodeReferenceSelect = document.getElementById('nodeReferenceSelect');
        if (nodeReferenceSelect && nodeReferenceSelect.value) {
          const selectedNodeName = nodeReferenceSelect.value;
          const referencedNodeId = nodes.find(n => n.data.label === selectedNodeName)?.id;
          
          if (referencedNodeId) {
            // 标记为引用类型，存储引用的节点ID
            paramValue = {
              type: 'reference',
              nodeId: referencedNodeId,
              nodeName: selectedNodeName
            };
          } else {
            alert(`找不到名为 "${selectedNodeName}" 的节点`);
            return;
          }
        } else {
          alert('请选择要引用的节点');
          return;
        }
      } else if (paramType === 'number') {
        paramValue = Number(paramValue);
      } else if (paramType === 'boolean') {
        paramValue = paramValue.toLowerCase() === 'true';
      }
    } 
    // 个人事件的参数处理
    else if (currentEventType === 'personal') {
      // 如果是预定义的参数类型
      if (paramName === 'description' || paramName === 'tableName' || paramName === 'returnContent') {
        paramType = paramName;
      } 
      // 如果是动作参数
      else if (paramName === 'action') {
        paramType = 'action';
        if (!paramValue) {
          paramValue = document.getElementById('actionTypeSelect')?.value || '查询';
        }
      }
      // 自定义参数需要输入参数名
      else if (paramName === 'customParam') {
        // 自定义参数需要用户输入名称
        const customParamName = prompt('请输入自定义参数名称:');
        if (!customParamName) return;
        paramName = customParamName;
      }
    }
    // 银行事件的参数处理
    else if (currentEventType === 'bank') {
      if (paramName === 'description') {
        paramType = 'description';
      }
      // 自定义参数需要输入参数名
      else if (paramName === 'customParam') {
        const customParamName = prompt('请输入自定义参数名称:');
        if (!customParamName) return;
        paramName = customParamName;
      }
    }
    
    if (!paramName) return;
    
    console.log("添加参数:", {
      eventType: currentEventType,
      node: selectedNode.id,
      paramName,
      paramType,
      paramValue
    });
    
    // 更新节点参数
    setNodeParams(prev => {
      const updatedParams = {
        ...prev,
        [selectedNode.id]: {
          ...(prev[selectedNode.id] || {}),
          [paramName]: {
            type: paramType,
            value: paramValue
          }
        }
      };
      
      // 更新节点显示
      setNodes(nds => nds.map(node => {
        if (node.id === selectedNode.id) {
          return {
            ...node,
            data: {
              ...node.data,
              params: updatedParams[selectedNode.id]
            }
          };
        }
        return node;
      }));
      
      return updatedParams;
    });
    
    // 清空输入框
    paramNameElement.value = '';
    paramValueElement.value = '';
    
    // 隐藏动作类型选择
    const actionTypeGroup = document.getElementById('actionTypeGroup');
    if (actionTypeGroup) {
      actionTypeGroup.style.display = 'none';
    }
  };
  
  // 删除节点参数
  const deleteNodeParam = (paramName) => {
    if (!selectedNode || !nodeParams[selectedNode.id]) return;
    
    setNodeParams(prev => {
      const params = {...prev[selectedNode.id]};
      delete params[paramName];
      
      const updatedParams = {
        ...prev,
        [selectedNode.id]: params
      };
      
      // 更新节点显示
      setNodes(nds => nds.map(node => {
        if (node.id === selectedNode.id) {
          return {
            ...node,
            data: {
              ...node.data,
              params
            }
          };
        }
        return node;
      }));
      
      return updatedParams;
    });
  };
  
  // 删除选中的节点
  const deleteSelectedNode = () => {
    if (selectedNode) {
      // 删除节点参数记录
      setNodeParams(prev => {
        const updated = {...prev};
        delete updated[selectedNode.id];
        return updated;
      });
      
      setNodes((nds) => nds.filter((node) => node.id !== selectedNode.id));
      setEdges((eds) => eds.filter(
        (edge) => edge.source !== selectedNode.id && edge.target !== selectedNode.id
      ));
      setSelectedNode(null);
      setNodeName('');
    }
  };
  
  // 清空画布
  const clearCanvas = () => {
    setNodes([]);
    setEdges([]);
    setSelectedNode(null);
    setNodeName('');
    setNodeParams({});
    setConsoleOutput([]);
  };
  
  // 保存画布内容
  const handleSave = () => {
    // 构建事件组合数据，包含节点参数
    const eventData = {
      nodes: nodes.map(node => ({
        ...node,
        data: {
          ...node.data,
          params: nodeParams[node.id] || {}
        }
      })),
      edges: edges,
      events: nodes.map(node => node.data.event)
    };
    
    onSave(eventData);
  };
  
  // 处理事件拖动开始
  const onDragStart = (event, eventName) => {
    event.dataTransfer.setData('application/reactflow', eventName);
    event.dataTransfer.effectAllowed = 'move';
  };
  
  // 切换全屏模式
  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
    
    setTimeout(() => {
      if (reactFlowInstance) {
        reactFlowInstance.fitView({ padding: 0.2 });
      }
    }, 100);
  };
  
  // 运行单个节点
  const handleRunNode = (nodeId) => {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;
    
    setRunningNode(nodeId);
    setIsRunning(true);
    
    // 添加控制台输出
    setConsoleOutput(prev => [
      ...prev, 
      { type: 'info', message: `开始运行节点: ${node.data.label}` }
    ]);
    
    // 模拟运行节点
    simulateNodeExecution(node).then(result => {
      setConsoleOutput(prev => [
        ...prev,
        { type: 'success', message: `节点 ${node.data.label} 运行完成: ${result}` }
      ]);
      
      setRunningNode(null);
      setIsRunning(false);
    }).catch(error => {
      setConsoleOutput(prev => [
        ...prev,
        { type: 'error', message: `节点 ${node.data.label} 运行失败: ${error.message}` }
      ]);
      
      setRunningNode(null);
      setIsRunning(false);
    });
  };
  
  // 模拟节点执行
  const simulateNodeExecution = (node) => {
    return new Promise((resolve, reject) => {
      // 模拟执行延迟
      setTimeout(() => {
        try {
          // 获取节点参数
          const params = nodeParams[node.id] || {};
          
          // 处理参数引用 - 解析引用的节点结果
          const processedParams = {};
          const nodeResults = {}; // 存储节点执行结果
          
          // 创建执行结果
          let result = '';
          
          // 根据不同事件类型生成执行结果
          switch (node.data.event) {
            case '既存信息查询':
              {
                const table = params.table?.value || '未知表';
                const condition = params.condition?.value || '';
                
                result = `查询${table}表数据\n`;
                result += `条件: ${condition}\n`;
                result += `返回记录: 1条\n`;
                
                // 模拟查询结果
                if (table === 'ACCOUNT_INFO') {
                  nodeResults.record = {
                    ACCOUNT_ID: params.accountId?.value || '6225880137519290',
                    CUSTOMER_ID: 'C12345678',
                    STATUS: 'ACTIVE',
                    BALANCE: 10000,
                    LAST_ACCESS_DATE: '2023-04-01'
                  };
                  result += `结果: ${JSON.stringify(nodeResults.record, null, 2)}`;
                } else if (table === 'CUSTOMER_INFO') {
                  nodeResults.record = {
                    CUSTOMER_ID: params.customerId?.value || 'C12345678',
                    NAME: '张三',
                    ID_TYPE: '身份证',
                    ID_NUMBER: '110101199001011234',
                    PHONE: '13812345678',
                    KYC_STATUS: 'VERIFIED',
                    RISK_LEVEL: 'MEDIUM'
                  };
                  result += `结果: ${JSON.stringify(nodeResults.record, null, 2)}`;
                } else {
                  nodeResults.record = {
                    ID: '12345',
                    NAME: '测试数据',
                    CREATE_TIME: new Date().toISOString()
                  };
                  result += `结果: ${JSON.stringify(nodeResults.record, null, 2)}`;
                }
              }
              break;
            
            case 'BL检证-等式检证':
              {
                const field = params.field?.value || '';
                const expectedValue = params.expectedValue?.value || '';
                
                result = `检查字段 ${field} 是否等于 ${expectedValue}\n`;
                
                // 模拟检查结果
                const checkResult = Math.random() > 0.3; // 70%概率检查通过
                nodeResults.passed = checkResult;
                nodeResults.field = field;
                nodeResults.expectedValue = expectedValue;
                
                result += checkResult ? '检查通过' : '检查失败';
              }
              break;
            
            case 'BL检证-范围检证':
              {
                const field = params.field?.value || '';
                const minValue = params.minValue?.value || 0;
                
                // 如果有amount参数，使用它
                let amount = 0;
                if (params.amount) {
                  amount = params.amount.value;
                } else if (params.creditScore) {
                  amount = params.creditScore.value;
                }
                
                result = `检查字段 ${field} 是否在有效范围内\n`;
                result += `最小值: ${minValue}\n`;
                result += `当前值: ${amount}\n`;
                
                // 模拟检查结果
                const checkResult = parseInt(amount) >= parseInt(minValue);
                nodeResults.passed = checkResult;
                nodeResults.field = field;
                nodeResults.amount = amount;
                
                result += checkResult ? '检查通过' : '检查失败';
              }
              break;
            
            case '既存信息变更':
              {
                const table = params.table?.value || '未知表';
                const action = params.action?.value || '更新';
                const fields = params.fields?.value || '';
                const condition = params.condition?.value || '';
                
                result = `${action}${table}表数据\n`;
                result += `字段: ${fields}\n`;
                
                if (condition) {
                  result += `条件: ${condition}\n`;
                }
                
                if (action === '新增' && params.values) {
                  result += `值: ${params.values.value}\n`;
                }
                
                // 模拟执行结果
                nodeResults.success = true;
                nodeResults.affectedRows = Math.floor(Math.random() * 3) + 1;
                
                result += `影响行数: ${nodeResults.affectedRows}`;
              }
              break;
            
            default:
              result = `执行${node.data.event}事件\n参数: ${JSON.stringify(params, null, 2)}`;
              nodeResults.success = true;
          }
          
          // 存储节点执行结果，以便其他节点引用
          node.data.executionResult = nodeResults;
          
          resolve(result);
        } catch (error) {
          reject(error);
        }
      }, 1000);
    });
  };
  
  // 运行整个流程
  const runFlow = async () => {
    if (nodes.length === 0) {
      setConsoleOutput(prev => [
        ...prev,
        { type: 'warning', message: '没有节点可以运行' }
      ]);
      return;
    }
    
    setIsRunning(true);
    setConsoleOutput(prev => [
      ...prev,
      { type: 'info', message: '开始运行整个事件流' }
    ]);
    
    try {
      // 构建节点执行顺序（简化版 - 仅基于边的连接关系）
      const graph = buildExecutionGraph();
      const executionOrder = topologicalSort(graph);
      
      // 重置所有节点的执行结果
      nodes.forEach(node => {
        if (node.data) {
          node.data.executionResult = null;
        }
      });
      
      // 按顺序执行节点
      for (const nodeId of executionOrder) {
        const node = nodes.find(n => n.id === nodeId);
        if (!node) continue;
        
        setRunningNode(nodeId);
        
        setConsoleOutput(prev => [
          ...prev,
          { type: 'info', message: `执行节点: ${node.data.label}` }
        ]);
        
        // 处理节点参数中的引用
        // 这里实现简单的参数传递，实际应用可能更复杂
        if (nodeParams[nodeId]) {
          const params = nodeParams[nodeId];
          for (const paramKey in params) {
            const param = params[paramKey];
            if (param && param.type === 'reference' && param.nodeId) {
              // 查找引用的节点
              const refNode = nodes.find(n => n.id === param.nodeId);
              if (refNode && refNode.data && refNode.data.executionResult) {
                // 在控制台显示参数引用信息
                setConsoleOutput(prev => [
                  ...prev,
                  { 
                    type: 'info', 
                    message: `参数 ${paramKey} 引用节点 ${param.nodeName} 的执行结果` 
                  }
                ]);
                
                // 这里可以根据实际需求来处理具体的参数传递逻辑
                // 例如根据不同类型的返回结果选择不同的字段
              }
            }
          }
        }
        
        // 等待节点执行完成
        try {
          const result = await simulateNodeExecution(node);
          setConsoleOutput(prev => [
            ...prev,
            { type: 'success', message: `节点 ${node.data.label} 执行完成:` },
            { type: 'info', message: result }
          ]);
        } catch (error) {
          setConsoleOutput(prev => [
            ...prev,
            { type: 'error', message: `节点 ${node.data.label} 执行出错: ${error.message}` }
          ]);
          // 可以选择在这里中断整个流程，或者继续执行后续节点
          throw new Error(`节点 ${node.data.label} 执行失败，流程中断`);
        }
      }
      
      setConsoleOutput(prev => [
        ...prev,
        { type: 'success', message: '整个事件流执行完成' }
      ]);
    } catch (error) {
      setConsoleOutput(prev => [
        ...prev,
        { type: 'error', message: `事件流执行失败: ${error.message}` }
      ]);
    } finally {
      setRunningNode(null);
      setIsRunning(false);
    }
  };
  
  // 构建执行图
  const buildExecutionGraph = () => {
    const graph = {};
    
    // 初始化图
    nodes.forEach(node => {
      graph[node.id] = [];
    });
    
    // 添加边
    edges.forEach(edge => {
      if (graph[edge.source]) {
        graph[edge.source].push(edge.target);
      }
    });
    
    return graph;
  };
  
  // 拓扑排序 - 确定节点执行顺序
  const topologicalSort = (graph) => {
    const visited = {};
    const temp = {};
    const order = [];
    
    // 检查是否有环
    const isCyclic = (node) => {
      temp[node] = true;
      
      for (const neighbor of graph[node]) {
        if (temp[neighbor]) return true;
        if (!visited[neighbor] && isCyclic(neighbor)) return true;
      }
      
      temp[node] = false;
      visited[node] = true;
      order.push(node);
      return false;
    };
    
    // 对每个节点进行遍历
    for (const node in graph) {
      if (!visited[node] && isCyclic(node)) {
        throw new Error('事件流中存在循环依赖，无法确定执行顺序');
      }
    }
    
    return order.reverse();
  };
  
  const toggleAvailableEvents = () => {
    setShowAvailableEvents(!showAvailableEvents);
    if (!showAvailableEvents) {
      setSearchQuery('');
    }
  };
  
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setShowAvailableEvents(true);
  };
  
  const clearConsole = () => {
    setConsoleOutput([]);
  };
  
  // 测试数据集
  const testDataSets = {
    account: {
      nodes: [
        {
          id: 'account_query',
          position: { x: 100, y: 100 },
          data: {
            label: '查询账户信息',
            event: '既存信息查询',
            params: {
              table: { type: 'table', value: 'ACCOUNT_INFO' },
              condition: { type: 'string', value: 'ACCOUNT_ID = :accountId' },
              accountId: { type: 'string', value: '6225880137519290' }
            }
          }
        },
        {
          id: 'account_validate',
          position: { x: 400, y: 100 },
          data: {
            label: '验证账户状态',
            event: 'BL检证-等式检证',
            params: {
              field: { type: 'string', value: 'STATUS' },
              expectedValue: { type: 'string', value: 'ACTIVE' }
            }
          }
        },
        {
          id: 'account_update',
          position: { x: 700, y: 100 },
          data: {
            label: '更新账户信息',
            event: '既存信息变更',
            params: {
              table: { type: 'table', value: 'ACCOUNT_INFO' },
              action: { type: 'action', value: '更新' },
              fields: { type: 'string', value: 'LAST_ACCESS_DATE = SYSDATE' },
              condition: { type: 'string', value: 'ACCOUNT_ID = :accountId' },
              accountId: { type: 'reference', nodeId: 'account_query', nodeName: '查询账户信息' }
            }
          }
        }
      ],
      edges: [
        { id: 'e1-2', source: 'account_query', target: 'account_validate', type: 'smoothstep', animated: true },
        { id: 'e2-3', source: 'account_validate', target: 'account_update', type: 'smoothstep', animated: true }
      ]
    },
    transaction: {
      nodes: [
        {
          id: 'transaction_init',
          position: { x: 100, y: 100 },
          data: {
            label: '交易初始化',
            event: '既存信息查询',
            params: {
              table: { type: 'table', value: 'TRANSACTION_CONFIG' },
              condition: { type: 'string', value: 'TRANS_TYPE = :transType' },
              transType: { type: 'string', value: 'TRANSFER' }
            }
          }
        },
        {
          id: 'balance_check',
          position: { x: 400, y: 100 },
          data: {
            label: '余额检查',
            event: 'BL检证-范围检证',
            params: {
              field: { type: 'string', value: 'BALANCE' },
              minValue: { type: 'number', value: '0' },
              amount: { type: 'number', value: '5000' }
            }
          }
        },
        {
          id: 'transaction_execute',
          position: { x: 700, y: 100 },
          data: {
            label: '执行交易',
            event: '既存信息变更',
            params: {
              table: { type: 'table', value: 'ACCOUNT_BALANCE' },
              action: { type: 'action', value: '更新' },
              fields: { type: 'string', value: 'BALANCE = BALANCE - :amount' },
              condition: { type: 'string', value: 'ACCOUNT_ID = :accountId' },
              amount: { type: 'reference', nodeId: 'balance_check', nodeName: '余额检查' },
              accountId: { type: 'string', value: '6225880137519290' }
            }
          }
        }
      ],
      edges: [
        { id: 'e1-2', source: 'transaction_init', target: 'balance_check', type: 'smoothstep', animated: true },
        { id: 'e2-3', source: 'balance_check', target: 'transaction_execute', type: 'smoothstep', animated: true }
      ]
    },
    customer: {
      nodes: [
        {
          id: 'customer_query',
          position: { x: 100, y: 100 },
          data: {
            label: '查询客户信息',
            event: '既存信息查询',
            params: {
              table: { type: 'table', value: 'CUSTOMER_INFO' },
              condition: { type: 'string', value: 'CUSTOMER_ID = :customerId' },
              customerId: { type: 'string', value: 'C12345678' }
            }
          }
        },
        {
          id: 'kyc_check',
          position: { x: 400, y: 100 },
          data: {
            label: 'KYC检查',
            event: 'BL检证-等式检证',
            params: {
              field: { type: 'string', value: 'KYC_STATUS' },
              expectedValue: { type: 'string', value: 'VERIFIED' }
            }
          }
        },
        {
          id: 'risk_level_update',
          position: { x: 700, y: 100 },
          data: {
            label: '更新风险等级',
            event: '既存信息变更',
            params: {
              table: { type: 'table', value: 'CUSTOMER_INFO' },
              action: { type: 'action', value: '更新' },
              fields: { type: 'string', value: 'RISK_LEVEL = :riskLevel' },
              condition: { type: 'string', value: 'CUSTOMER_ID = :customerId' },
              riskLevel: { type: 'string', value: 'LOW' },
              customerId: { type: 'reference', nodeId: 'customer_query', nodeName: '查询客户信息' }
            }
          }
        }
      ],
      edges: [
        { id: 'e1-2', source: 'customer_query', target: 'kyc_check', type: 'smoothstep', animated: true },
        { id: 'e2-3', source: 'kyc_check', target: 'risk_level_update', type: 'smoothstep', animated: true }
      ]
    },
    loan: {
      nodes: [
        {
          id: 'loan_application',
          position: { x: 100, y: 100 },
          data: {
            label: '贷款申请初始化',
            event: '既存信息查询',
            params: {
              table: { type: 'table', value: 'LOAN_CONFIG' },
              condition: { type: 'string', value: 'LOAN_TYPE = :loanType' },
              loanType: { type: 'string', value: 'PERSONAL' }
            }
          }
        },
        {
          id: 'credit_check',
          position: { x: 400, y: 100 },
          data: {
            label: '信用评分检查',
            event: 'BL检证-范围检证',
            params: {
              field: { type: 'string', value: 'CREDIT_SCORE' },
              minValue: { type: 'number', value: '700' },
              creditScore: { type: 'number', value: '750' }
            }
          }
        },
        {
          id: 'loan_approval',
          position: { x: 700, y: 100 },
          data: {
            label: '贷款审批',
            event: '既存信息变更',
            params: {
              table: { type: 'table', value: 'LOAN_APPLICATION' },
              action: { type: 'action', value: '新增' },
              fields: { type: 'string', value: 'CUSTOMER_ID, LOAN_AMOUNT, INTEREST_RATE, STATUS' },
              values: { type: 'string', value: ':customerId, :amount, :rate, \'APPROVED\'' },
              customerId: { type: 'string', value: 'C12345678' },
              amount: { type: 'number', value: '100000' },
              rate: { type: 'number', value: '4.5' }
            }
          }
        }
      ],
      edges: [
        { id: 'e1-2', source: 'loan_application', target: 'credit_check', type: 'smoothstep', animated: true },
        { id: 'e2-3', source: 'credit_check', target: 'loan_approval', type: 'smoothstep', animated: true }
      ]
    }
  };
  
  // 加载测试数据
  const loadTestData = (dataSetName) => {
    const dataSet = testDataSets[dataSetName];
    if (!dataSet) {
      alert('找不到指定的测试数据集');
      return;
    }
    
    // 确认是否加载
    const confirmLoad = window.confirm(`确定要加载${dataSetName}测试数据吗？这将清空当前画布。`);
    if (!confirmLoad) return;
    
    // 清空当前画布
    clearCanvas();
    
    // 转换节点数据为ReactFlow格式
    const newNodes = dataSet.nodes.map(node => ({
      ...node,
      type: 'custom',
      data: {
        ...node.data,
        canRun: true,
        onRunNode: handleRunNode
      }
    }));
    
    // 设置节点和边
    setNodes(newNodes);
    setEdges(dataSet.edges);
    
    // 设置节点参数
    const newParams = {};
    newNodes.forEach(node => {
      newParams[node.id] = node.data.params || {};
    });
    setNodeParams(newParams);
    
    // 通知用户
    setConsoleOutput(prev => [
      ...prev,
      { type: 'success', message: `成功加载${dataSetName}测试数据` }
    ]);
    
    // 调整视图
    setTimeout(() => {
      if (reactFlowInstance) {
        reactFlowInstance.fitView({ padding: 0.2 });
      }
    }, 100);
  };
  
  // 在Canvas组件中添加一个函数来确定事件类型
  const getEventType = () => {
    if (!selectedNode) return null;
    
    // 直接根据传入的eventType属性来判断当前画布编辑的事件类型
    // 这样更加明确，不依赖于事件是否存在于availableEvents中
    if (eventType === '标准事件') return 'standard';
    if (eventType === '银行事件') return 'bank';
    if (eventType === '个人事件') return 'personal';
    
    // 如果以上都不匹配，尝试通过事件内容推断
    const eventName = selectedNode.data.event;
    if (eventName) {
      // 根据事件名称的特征判断
      if (eventName.includes('BL检证') || eventName.includes('既存信息')) {
        return 'standard';
      }
    }
    
    // 默认为标准事件
    return 'standard';
  };
  
  // 使用 useEffect 监听参数名称选择的变化
  useEffect(() => {
    const paramNameSelect = document.getElementById('paramName');
    const actionTypeGroup = document.getElementById('actionTypeGroup');
    const actionTypeSelect = document.getElementById('actionTypeSelect');
    
    if (paramNameSelect && actionTypeGroup && actionTypeSelect) {
      // 监听参数名称的变化
      const handleParamNameChange = () => {
        // 如果选择了"动作"参数类型，显示动作选择下拉框
        if (paramNameSelect.value === 'action') {
          actionTypeGroup.style.display = 'block';
        } else {
          actionTypeGroup.style.display = 'none';
        }
      };
      
      paramNameSelect.addEventListener('change', handleParamNameChange);
      
      // 添加动作类型选择的处理
      const handleActionTypeChange = () => {
        if (paramNameSelect.value === 'action') {
          document.getElementById('paramValue').value = actionTypeSelect.value;
        }
      };
      
      actionTypeSelect.addEventListener('change', handleActionTypeChange);
      
      // 清理函数
      return () => {
        paramNameSelect.removeEventListener('change', handleParamNameChange);
        actionTypeSelect.removeEventListener('change', handleActionTypeChange);
      };
    }
  }, [selectedNode]);

  // 监听参数类型变化，显示或隐藏节点选择下拉列表
  useEffect(() => {
    const paramTypeSelect = document.getElementById('paramType');
    const paramValueInput = document.getElementById('paramValue');
    const nodeReferenceSelect = document.getElementById('nodeReferenceSelect');
    
    if (paramTypeSelect && paramValueInput && nodeReferenceSelect) {
      const handleTypeChange = () => {
        // 如果选择了"引用"类型，显示节点选择下拉列表，隐藏值输入框
        if (paramTypeSelect.value === 'reference') {
          paramValueInput.style.display = 'none';
          nodeReferenceSelect.style.display = 'block';
        } else {
          paramValueInput.style.display = 'block';
          nodeReferenceSelect.style.display = 'none';
        }
      };
      
      paramTypeSelect.addEventListener('change', handleTypeChange);
      
      // 初始化时根据当前选择设置显示状态
      handleTypeChange();
      
      // 监听节点选择的变化
      const handleNodeSelect = () => {
        if (paramTypeSelect.value === 'reference') {
          paramValueInput.value = nodeReferenceSelect.value;
        }
      };
      
      nodeReferenceSelect.addEventListener('change', handleNodeSelect);
      
      return () => {
        paramTypeSelect.removeEventListener('change', handleTypeChange);
        nodeReferenceSelect.removeEventListener('change', handleNodeSelect);
      };
    }
  }, [selectedNode, nodes]);
  
  return (
    <div className={`${styles.canvasContainer} ${isFullScreen ? styles.fullScreen : ''}`}>
      {/* 顶部工具栏 */}
      <div className={styles.canvasHeader}>
        <h3>创建/编辑{eventType}</h3>
        <div className={styles.canvasActions}>
          <button 
            className={styles.canvasButton} 
            onClick={runFlow}
            disabled={isRunning}
            title="运行整个事件流"
          >
            {isRunning ? '运行中...' : '运行流程'}
          </button>
          <button 
            className={styles.canvasButton} 
            onClick={clearCanvas}
            title="清空画布"
          >
            清空画布
          </button>
          <button 
            className={styles.canvasButton} 
            onClick={toggleFullScreen}
            title={isFullScreen ? "退出全屏" : "全屏模式"}
          >
            {isFullScreen ? '退出全屏' : '全屏模式'}
          </button>
          <button 
            className={styles.canvasButton} 
            onClick={handleSave}
            title="保存事件"
          >
            保存
          </button>
          <button 
            className={styles.cancelButton} 
            onClick={onCancel}
            title="取消"
          >
            取消
          </button>
        </div>
      </div>
      
      <div className={styles.canvasContent}>
        {/* 左侧可用事件面板 */}
        <div className={`${styles.canvasSidebar} ${isFullScreen ? styles.collapsible : ''}`}>
          <h4>{eventType}库</h4>
          
          <div className={styles.searchContainer}>
            <input 
              type="text" 
              className={styles.searchInput} 
              value={searchQuery}
              onChange={handleSearchChange}
              onFocus={() => setShowAvailableEvents(true)}
              placeholder={`搜索${eventType}`}
            />
            <button 
              className={styles.searchToggle} 
              onClick={toggleAvailableEvents}
              title={showAvailableEvents ? "隐藏候选事件" : "显示候选事件"}
            >
              {showAvailableEvents ? "▲" : "▼"}
            </button>
          </div>
          
          <div className={styles.availableEvents}>
            {filteredAvailableEvents.map((event, index) => (
              <div 
                key={`event-${index}`}
                className={styles.dragEvent}
                draggable
                onDragStart={(e) => onDragStart(e, event)}
              >
                {event}
              </div>
            ))}
            {filteredAvailableEvents.length === 0 && (
              <div className={styles.noEvents}>
                {searchQuery ? `没有匹配"${searchQuery}"的${eventType}` : `没有可用的${eventType}`}
              </div>
            )}
          </div>
          
          {/* 控制台输出 */}
          <div className={styles.consoleContainer}>
            <div className={styles.consoleHeader}>
              <h4>控制台</h4>
              <button 
                className={styles.clearConsoleButton} 
                onClick={clearConsole}
                title="清空控制台"
              >
                清空
              </button>
            </div>
            <div className={styles.consoleOutput}>
              {consoleOutput.length === 0 ? (
                <div className={styles.noConsoleOutput}>暂无输出</div>
              ) : (
                consoleOutput.map((log, index) => (
                  <div 
                    key={`log-${index}`} 
                    className={`${styles.consoleMessage} ${styles[log.type]}`}
                  >
                    {log.message}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
        
        {/* 主画布区域 */}
        <div className={styles.canvasMain} ref={reactFlowWrapper}>
          <ReactFlowProvider>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onInit={setReactFlowInstance}
              onDrop={onDrop}
              onDragOver={onDragOver}
              onNodeClick={onNodeClick}
              nodeTypes={nodeTypes}
              fitView
            >
              {/* 添加网格背景 */}
              <Background 
                variant="dots" 
                gap={16} 
                size={1} 
                color="#aaa" 
              />
              
              {/* 添加控制按钮 */}
              <Controls />
              
              {/* 工具面板 */}
              <Panel position="top-left">
                <div className={styles.canvasToolbar}>
                  <button 
                    className={styles.canvasToolButton}
                    onClick={() => {
                      if (reactFlowInstance) {
                        reactFlowInstance.fitView({ padding: 0.2 });
                      }
                    }}
                    title="适应视图"
                  >
                    <span role="img" aria-label="fit-view">🔍</span>
                  </button>
                </div>
              </Panel>
            </ReactFlow>
          </ReactFlowProvider>
        </div>
        
        {/* 右侧属性面板 */}
        <div className={`${styles.canvasSidebar} ${isFullScreen ? styles.collapsible : ''}`}>
          <h4>属性面板 <small>({eventType})</small></h4>
          
          {/* 开发调试信息 */}
          <div className={styles.debugInfo} style={{fontSize: '10px', color: '#999', marginBottom: '10px'}}>
            事件类型: {eventType}, 识别类型: {selectedNode ? getEventType() : '无选中节点'}
          </div>
          
          {selectedNode ? (
            <div className={styles.nodeProperties}>
              <div className={styles.formGroup}>
                <label>节点名称</label>
                <input 
                  type="text" 
                  value={nodeName} 
                  onChange={updateNodeName} 
                  className={styles.formInput}
                />
              </div>
              
              <div className={styles.formGroup}>
                <label>事件类型</label>
                <div className={styles.propertyValue}>
                  {selectedNode.data.event}
                </div>
              </div>
              
              {/* 参数设置 - 根据事件类型显示不同的参数界面 */}
              <div className={styles.formGroup}>
                <label>节点参数</label>
                <div className={styles.paramsList}>
                  {nodeParams[selectedNode.id] && Object.keys(nodeParams[selectedNode.id]).length > 0 ? (
                    Object.entries(nodeParams[selectedNode.id]).map(([key, value], idx) => {
                      // 格式化参数值显示
                      let displayValue = '';
                      if (value && typeof value.value !== 'undefined') {
                        if (typeof value.value === 'object') {
                          if (value.value && value.value.type === 'reference') {
                            displayValue = `引用节点: ${value.value.nodeName}`;
                          } else {
                            displayValue = JSON.stringify(value.value);
                          }
                        } else {
                          displayValue = value.value.toString();
                        }
                      }
                      
                      return (
                        <div key={`param-list-${idx}`} className={styles.paramListItem}>
                          <span>{key}: </span>
                          <span className={`${styles.paramValue} ${value.type ? styles[value.type] : ''}`}>
                            {displayValue}
                          </span>
                          <button 
                            className={styles.deleteParamButton} 
                            onClick={() => deleteNodeParam(key)}
                            title="删除参数"
                          >
                            ×
                          </button>
                        </div>
                      );
                    })
                  ) : (
                    <div className={styles.noParams}>暂无参数</div>
                  )}
                </div>
                
                <div className={styles.addParamForm}>
                  {getEventType() === 'personal' ? (
                    // 个人事件参数设置
                    <div className={styles.paramSection}>
                      <h5>个人事件参数</h5>
                      <div className={styles.paramHelp}>
                        个人事件支持描述、数据表名、动作、自定义参数和返回内容
                      </div>
                      <div className={styles.paramInputGroup}>
                        <select id="paramName" className={styles.paramSelect}>
                          <option value="">选择参数类型</option>
                          <option value="description">描述</option>
                          <option value="tableName">数据表名</option>
                          <option value="action">动作</option>
                          <option value="customParam">自定义参数</option>
                          <option value="returnContent">返回内容</option>
                        </select>
                        
                        <input 
                          type="text" 
                          id="paramValue" 
                          placeholder="参数值" 
                          className={styles.paramInput}
                        />
                      </div>
                      
                      <div className={styles.paramInputGroup} id="actionTypeGroup" style={{display: 'none'}}>
                        <select id="actionTypeSelect" className={styles.paramSelect}>
                          <option value="查询">查询</option>
                          <option value="新增">新增</option>
                          <option value="更新">更新</option>
                          <option value="删除">删除</option>
                        </select>
                      </div>
                      
                      <button 
                        onClick={addNodeParam} 
                        className={styles.addParamButton}
                        title="添加参数"
                      >
                        添加参数
                      </button>
                    </div>
                  ) : getEventType() === 'bank' ? (
                    // 银行事件参数设置
                    <div className={styles.paramSection}>
                      <h5>银行事件参数</h5>
                      <div className={styles.paramHelp}>
                        银行事件支持描述和自定义参数
                      </div>
                      <div className={styles.paramInputGroup}>
                        <select id="paramName" className={styles.paramSelect}>
                          <option value="">选择参数类型</option>
                          <option value="description">描述</option>
                          <option value="customParam">自定义参数</option>
                        </select>
                        
                        <input 
                          type="text" 
                          id="paramValue" 
                          placeholder="参数值" 
                          className={styles.paramInput}
                        />
                      </div>
                      <button 
                        onClick={addNodeParam} 
                        className={styles.addParamButton}
                        title="添加参数"
                      >
                        添加参数
                      </button>
                    </div>
                  ) : (
                    // 标准事件参数设置
                    <div className={styles.paramSection}>
                      <h5>标准事件参数</h5>
                      <div className={styles.paramHelp}>
                        标准事件支持多种类型的参数设置
                      </div>
                      
                      <div className={styles.paramRow}>
                        <div className={styles.paramLabel}>参数名称:</div>
                        <input 
                          type="text" 
                          id="paramName" 
                          placeholder="参数名" 
                          className={styles.paramInput}
                        />
                      </div>
                      
                      <div className={styles.paramRow}>
                        <div className={styles.paramLabel}>参数类型:</div>
                        <select 
                          id="paramType" 
                          className={styles.paramSelect}
                        >
                          <option value="string">文本</option>
                          <option value="number">数字</option>
                          <option value="boolean">布尔值</option>
                          <option value="reference">节点引用</option>
                          <option value="sql">SQL查询</option>
                          <option value="table">数据表名</option>
                          <option value="action">动作类型</option>
                        </select>
                      </div>
                      
                      <div className={styles.paramRow}>
                        <div className={styles.paramLabel}>参数值:</div>
                        <input 
                          type="text" 
                          id="paramValue" 
                          placeholder="参数值" 
                          className={styles.paramInput}
                        />
                        
                        {/* 节点引用选择下拉框 */}
                        <select
                          id="nodeReferenceSelect"
                          className={styles.paramSelect}
                          style={{ display: 'none' }}
                        >
                          <option value="">-- 选择引用节点 --</option>
                          {nodes.filter(n => n.id !== selectedNode?.id).map(node => (
                            <option key={node.id} value={node.data.label}>
                              {node.data.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      <button 
                        onClick={addNodeParam} 
                        className={styles.addParamButton}
                        title="添加参数"
                      >
                        添加参数
                      </button>
                      
                      <div className={styles.paramTypeHelp}>
                        <small>参数类型说明:</small>
                        <ul className={styles.paramTypeList}>
                          <li><span className={styles.string}>文本</span>: 普通文本字符串</li>
                          <li><span className={styles.number}>数字</span>: 数值类型</li>
                          <li><span className={styles.boolean}>布尔值</span>: true/false</li>
                          <li><span className={styles.reference}>节点引用</span>: 引用其他节点的执行结果</li>
                          <li><span className={styles.sql}>SQL查询</span>: SQL查询语句</li>
                          <li><span className={styles.table}>数据表名</span>: 数据库表名</li>
                          <li><span className={styles.action}>动作类型</span>: 如"新增"、"更新"等</li>
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <div className={styles.formActions}>
                <button 
                  className={styles.runButton} 
                  onClick={() => handleRunNode(selectedNode.id)}
                  disabled={isRunning}
                  title="运行此节点"
                >
                  运行节点
                </button>
                <button 
                  className={styles.deleteButton} 
                  onClick={deleteSelectedNode}
                  title="删除节点"
                >
                  删除节点
                </button>
              </div>
              
              {/* 测试数据集 */}
              <div className={styles.formGroup}>
                <div className={styles.testDataSection}>
                  <h5>测试数据集</h5>
                  <div className={styles.testDataList}>
                    <div className={styles.testDataItem} onClick={() => loadTestData('account')}>
                      账户管理数据
                    </div>
                    <div className={styles.testDataItem} onClick={() => loadTestData('transaction')}>
                      交易处理数据
                    </div>
                    <div className={styles.testDataItem} onClick={() => loadTestData('customer')}>
                      客户信息数据
                    </div>
                    <div className={styles.testDataItem} onClick={() => loadTestData('loan')}>
                      贷款申请数据
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className={styles.noNodeSelected}>
              请选择节点以查看和编辑属性
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Canvas; 