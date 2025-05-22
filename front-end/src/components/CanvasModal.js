import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import styles from '../styles/Bank.module.css';
import Canvas from './Canvas';

const CanvasModal = ({ 
  isOpen, 
  onClose, 
  title, 
  nameLabel, 
  eventType, 
  availableEvents, 
  onSave, 
  initialEvent = null 
}) => {
  const [eventName, setEventName] = useState('');
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  
  // 初始化编辑状态
  useEffect(() => {
    if (initialEvent) {
      setEventName(initialEvent.name || '');
      
      if (initialEvent.nodes && initialEvent.edges) {
        // 如果已经有画布数据
        setNodes(initialEvent.nodes);
        setEdges(initialEvent.edges);
      } else if (initialEvent.events) {
        // 如果只有事件列表，创建简单的线性流程节点
        const newNodes = initialEvent.events.map((event, index) => ({
          id: `node_${event}_${Date.now() + index}`,
          type: 'custom',
          position: { x: 100, y: 100 + index * 100 },
          data: { 
            label: event,
            event: event,
            params: initialEvent.params?.[event] || {} 
          },
          style: {
            width: 180,
          },
          sourcePosition: 'right',
          targetPosition: 'left',
        }));
        
        // 创建连接这些节点的边
        const newEdges = [];
        for (let i = 0; i < newNodes.length - 1; i++) {
          newEdges.push({
            id: `edge_${i}_${i+1}`,
            source: newNodes[i].id,
            target: newNodes[i+1].id,
            type: 'smoothstep',
            animated: true,
            style: { stroke: '#0d6efd' }
          });
        }
        
        setNodes(newNodes);
        setEdges(newEdges);
      }
    } else {
      setEventName('');
      setNodes([]);
      setEdges([]);
    }
  }, [initialEvent, isOpen]);
  
  const handleNameChange = (e) => {
    setEventName(e.target.value);
  };
  
  const handleCanvasSave = (canvasData) => {
    if (eventName.trim()) {
      // 合并事件名和画布数据
      onSave({
        name: eventName,
        events: canvasData.events,
        nodes: canvasData.nodes,
        edges: canvasData.edges
      });
    } else {
      alert(`请输入${nameLabel}`);
    }
  };
  
  // 如果Modal没有打开，不渲染任何内容
  if (!isOpen) return null;
  
  // 使用Portal将Modal渲染到body最后
  return ReactDOM.createPortal(
    <div className={styles.canvasModal}>
      <div className={styles.canvasModalContent}>
        <div className={styles.canvasModalHeader}>
          <div className={styles.modalTitle}>{title}</div>
          <button className={styles.closeButton} onClick={onClose}>&times;</button>
        </div>
        
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>{nameLabel}</label>
          <input 
            type="text" 
            className={styles.formInput} 
            value={eventName}
            onChange={handleNameChange}
            placeholder={`请输入${nameLabel}`}
          />
        </div>
        
        <div className={styles.canvasModalBody}>
          <Canvas 
            initialNodes={nodes}
            initialEdges={edges}
            availableEvents={availableEvents}
            eventType={eventType}
            onSave={handleCanvasSave}
            onCancel={onClose}
          />
        </div>
      </div>
    </div>,
    document.body
  );
};

export default CanvasModal; 