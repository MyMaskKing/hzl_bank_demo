import React, { useState, useEffect, useRef, useCallback } from 'react';
import styles from '../styles/Bank.module.css';
import TagLabels from './TagLabels';

const ChatSection = () => {
  const [message, setMessage] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [eventCompositions, setEventCompositions] = useState({});
  const [eventFlowData, setEventFlowData] = useState({});
  const [processedEvents, setProcessedEvents] = useState(new Set()); // 跟踪已处理的事件
  const chatContainerRef = useRef(null);
  
  // 用ref保存eventCompositions和eventFlowData，避免useCallback依赖
  const eventCompositionsRef = useRef(eventCompositions);
  const eventFlowDataRef = useRef(eventFlowData);
  useEffect(() => { 
    eventCompositionsRef.current = eventCompositions; 
  }, [eventCompositions]);
  useEffect(() => { 
    eventFlowDataRef.current = eventFlowData; 
  }, [eventFlowData]);

  const showEventInChat = useCallback((eventName) => {
    const compositions = eventCompositionsRef.current;
    const flowData = eventFlowDataRef.current;
    console.log('显示事件:', eventName, '组合信息:', compositions);
    
    // 添加事件到聊天
    addChatMessage('event', eventName);
    
    // 如果有流程数据，显示流程结构
    const flow = flowData[eventName];
    if (flow && flow.nodes && flow.nodes.length > 0) {
      setTimeout(() => {
        addChatMessage('assistant', `事件 "${eventName}" 的执行流程开始：`);
      }, 300);
      
      // 按照流程图的执行顺序依次显示节点
      // 这里简化处理，按照节点创建的顺序显示
      flow.nodes.forEach((node, index) => {
        const eventName = node.data.event;
        setTimeout(() => {
          addChatMessage('event-component', eventName);
          
          // 如果这个组件也是复合事件，显示其子组件
          const subComposition = compositions[eventName];
          if (subComposition && subComposition.length > 0) {
            setTimeout(() => {
              addChatMessage('assistant', `组件 "${eventName}" 由以下事件构成：`);
              subComposition.forEach((subEvent, idx) => {
                setTimeout(() => {
                  addChatMessage('standard-event', subEvent);
                }, idx * 200);
              });
            }, 300);
          }
        }, (index + 1) * 500);
      });
      
      setTimeout(() => {
        addChatMessage('assistant', `事件 "${eventName}" 的流程执行完成。`);
      }, (flow.nodes.length + 1) * 600);
    } 
    // 如果没有流程数据但有组合信息，显示线性结构
    else {
      const composition = compositions[eventName];
      if (composition && composition.length > 0) {
        console.log('事件组合:', composition);
        setTimeout(() => {
          addChatMessage('assistant', `事件 "${eventName}" 由以下组件构成：`);
        }, 300);
        composition.forEach((subEvent, index) => {
          setTimeout(() => {
            addChatMessage('event-component', subEvent);
            const subComposition = compositions[subEvent];
            if (subComposition && subComposition.length > 0) {
              setTimeout(() => {
                addChatMessage('assistant', `组件 "${subEvent}" 由以下标准事件构成：`);
                subComposition.forEach((standardEvent, idx) => {
                  setTimeout(() => {
                    addChatMessage('standard-event', standardEvent);
                  }, idx * 200);
                });
              }, 300);
            }
          }, (index + 1) * 400);
        });
        setTimeout(() => {
          addChatMessage('assistant', `事件 "${eventName}" 已执行完成。`);
        }, (composition.length + 1) * 500);
      } else {
        setTimeout(() => {
          addChatMessage('assistant', `事件 "${eventName}" 是基础事件，已直接执行。`);
        }, 300);
      }
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    const chatContainer = document.getElementById('chatContainer');
    if (chatContainer) {
      chatContainer.classList.remove(styles.dragOver);
    }
    
    const eventName = e.dataTransfer.getData('text/plain');
    const eventType = e.dataTransfer.getData('application/eventType');
    
    if (eventName) {
      // 如果是标准事件且不允许直接使用，则显示提示
      if (eventType === 'standard') {
        addChatMessage('assistant', '标准事件不允许直接使用，请将其添加到银行事件中再使用。');
        return;
      }
      
      const eventKey = `${eventName}-${Date.now()}`;
      if (!processedEvents.has(eventKey)) {
        const updatedProcessedEvents = new Set(processedEvents);
        updatedProcessedEvents.add(eventKey);
        setProcessedEvents(updatedProcessedEvents);
        setTimeout(() => {
          setProcessedEvents(prev => {
            const updated = new Set(prev);
            updated.delete(eventKey);
            return updated;
          });
        }, 1000);
        showEventInChat(eventName);
      }
    }
  }, [processedEvents, showEventInChat]);
  
  // 从本地存储加载事件组合信息和流程数据
  useEffect(() => {
    const loadEventData = () => {
      const savedEventCompositions = localStorage.getItem('eventCompositions');
      const savedEventFlowData = localStorage.getItem('eventFlowData');
      
      if (savedEventCompositions) {
        setEventCompositions(JSON.parse(savedEventCompositions));
      }
      
      if (savedEventFlowData) {
        setEventFlowData(JSON.parse(savedEventFlowData));
      }
    };
    
    // 从本地存储恢复聊天记录
    const loadChatMessages = () => {
      const savedMessages = localStorage.getItem('chatMessages');
      if (savedMessages) {
        setChatMessages(JSON.parse(savedMessages));
      }
    };
    
    // 初始加载
    loadEventData();
    loadChatMessages();
    
    // 监听自定义事件 - 当点击ActionButton时触发
    const handleAddToChatEvent = (e) => {
      const { text, eventType } = e.detail;
      console.log('接收到addToChatEvent事件:', text, eventType);
      
      // 如果是标准事件且不允许直接使用，则显示提示
      if (eventType === 'standard') {
        addChatMessage('assistant', '标准事件不允许直接使用，请将其添加到银行事件中再使用。');
        return;
      }
      
      // 防止短时间内重复处理相同事件
      const eventKey = `${text}-${Date.now()}`;
      if (!processedEvents.has(eventKey)) {
        const updatedProcessedEvents = new Set(processedEvents);
        updatedProcessedEvents.add(eventKey);
        setProcessedEvents(updatedProcessedEvents);
        
        // 在短暂延迟后允许再次处理相同事件
        setTimeout(() => {
          setProcessedEvents(prev => {
            const updated = new Set(prev);
            updated.delete(eventKey);
            return updated;
          });
        }, 1000);
        
        showEventInChat(text);
      }
    };
    
    // 监听storage变化，以便在其他组件修改事件时更新
    const handleStorageChange = (e) => {
      if (e.key === 'eventCompositions' || e.key === 'eventFlowData') {
        loadEventData();
      }
    };
    
    document.addEventListener('addToChatEvent', handleAddToChatEvent);
    window.addEventListener('storage', handleStorageChange);
    
    // 设置拖拽相关事件监听
    const chatContainer = document.getElementById('chatContainer');
    if (chatContainer) {
      chatContainer.addEventListener('dragover', handleDragOver);
      chatContainer.addEventListener('drop', handleDrop);
      chatContainer.addEventListener('dragleave', handleDragLeave);
    }
    
    return () => {
      // 组件卸载时移除事件监听
      document.removeEventListener('addToChatEvent', handleAddToChatEvent);
      window.removeEventListener('storage', handleStorageChange);
      
      if (chatContainer) {
        chatContainer.removeEventListener('dragover', handleDragOver);
        chatContainer.removeEventListener('drop', handleDrop);
        chatContainer.removeEventListener('dragleave', handleDragLeave);
      }
    };
  }, [processedEvents, handleDrop, showEventInChat]);
  
  // 保存聊天记录到本地存储
  useEffect(() => {
    if (chatMessages.length > 0) {
      localStorage.setItem('chatMessages', JSON.stringify(chatMessages));
    }
  }, [chatMessages]);
  
  // 聊天容器自动滚动到底部
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);
  
  const handleDragOver = (e) => {
    e.preventDefault();
    
    // 检查拖拽的数据类型
    const dataTypes = e.dataTransfer.types;
    if (dataTypes && dataTypes.includes('text/plain')) {
      e.dataTransfer.dropEffect = 'copy';
      
      // 添加拖拽目标高亮
      const chatContainer = document.getElementById('chatContainer');
      if (chatContainer) {
        chatContainer.classList.add(styles.dragOver);
      }
    }
  };
  
  const handleDragLeave = (e) => {
    // 移除拖拽目标高亮
    const chatContainer = document.getElementById('chatContainer');
    if (chatContainer) {
      chatContainer.classList.remove(styles.dragOver);
    }
  };
  
  const handleMessageChange = (e) => {
    setMessage(e.target.value);
  };
  
  const handleSendMessage = async () => {
    if (message.trim()) {
      addChatMessage('user', message);
      const userMsg = message;
      setMessage('');
      
      try {
        // 使用fetch流式消费后端AI聊天流接口
        const response = await fetch('http://localhost:8080/api/chat/stream', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ message: userMsg }),
        });
        if (!response.ok || !response.body) {
          throw new Error('AI服务请求失败');
        }
        // 逐步拼接AI回复
        const reader = response.body.getReader();
        let aiContent = '';
        let done = false;
        addChatMessage('assistant', '');
        while (!done) {
          const { value, done: streamDone } = await reader.read();
          done = streamDone;
          if (value) {
            const chunk = new TextDecoder('utf-8').decode(value);
            // 先收集所有内容再统一更新
            let newContent = aiContent;
            let updated = false;
            
            // 处理每一行数据
            const lines = chunk.split('\n');
            for (let i = 0; i < lines.length; i++) {
              const line = lines[i];
              if (line.trim()) {
                try {
                  const data = JSON.parse(line);
                  if (data && data.content) {
                    newContent += data.content;
                    updated = true;
                  } else if (data && data.data && data.data.content) {
                    newContent += data.data.content;
                    updated = true;
                  }
                } catch (e) {
                  // 忽略解析异常
                }
              }
            }
            
            if (updated) {
              // 使用不依赖循环变量的方式更新状态
              const currentContent = newContent; // 创建一个临时变量
              aiContent = currentContent;
              
              // 使用函数式更新，避免闭包问题
              setChatMessages(prev => {
                const lastMessage = prev[prev.length - 1];
                if (lastMessage && lastMessage.type === 'assistant') {
                  return [
                    ...prev.slice(0, -1),
                    { ...lastMessage, content: currentContent }
                  ];
                }
                return prev;
              });
            }
          }
        }
      } catch (error) {
        addChatMessage('assistant', 'AI服务异常: ' + error.message);
      }
    }
  };
  
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  const handleUpload = () => {
    console.log('上传文件');
    // 这里可以添加上传文件的逻辑
    addChatMessage('assistant', '文件上传功能尚未实现，请稍后再试。');
  };
  
  const handleClearChat = () => {
    setChatMessages([]);
    localStorage.removeItem('chatMessages');
    // 添加欢迎消息
    addChatMessage('assistant', '聊天记录已清空。有什么可以帮助您的吗？');
  };
  
  // 添加消息到聊天窗口
  const addChatMessage = (type, content) => {
    const newMessage = {
      id: Date.now(),
      type,
      content,
      timestamp: new Date().toLocaleTimeString()
    };
    
    setChatMessages(prevMessages => [...prevMessages, newMessage]);
  };
  
  // 渲染不同类型的消息
  const renderMessage = (message) => {
    // 过滤AI助手消息中的<think>标签内容
    const filterThinkTag = (text) => {
      if (!text) return '';
      // 去除所有<think>...</think>内容
      return text.replace(/<think>[\s\S]*?<\/think>/gi, '').replace(/\n{2,}/g, '\n').trim();
    };
    switch (message.type) {
      case 'user':
        return (
          <div className={styles.userMessage}>
            <div className={styles.messageContent}>{message.content}</div>
            <div className={styles.messageTime}>{message.timestamp}</div>
          </div>
        );
      case 'assistant':
        return (
          <div className={styles.assistantMessage}>
            <div className={styles.messageContent}>{filterThinkTag(message.content)}</div>
            <div className={styles.messageTime}>{message.timestamp}</div>
          </div>
        );
      case 'event':
        return (
          <div className={styles.eventMessage}>
            <div className={styles.eventIcon}>📋</div>
            <div className={styles.messageContent}>
              <div className={styles.eventTitle}>执行事件: {message.content}</div>
              <div className={styles.messageTime}>{message.timestamp}</div>
            </div>
          </div>
        );
      case 'event-component':
        return (
          <div className={styles.eventComponentMessage}>
            <div className={styles.eventIcon}>➤</div>
            <div className={styles.messageContent}>
              <div className={styles.eventComponentTitle}>{message.content}</div>
              <div className={styles.messageTime}>{message.timestamp}</div>
            </div>
          </div>
        );
      case 'standard-event':
        return (
          <div className={styles.standardEventMessage}>
            <div className={styles.eventIcon}>•</div>
            <div className={styles.messageContent}>
              <div className={styles.standardEventTitle}>{message.content}</div>
              <div className={styles.messageTime}>{message.timestamp}</div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className={styles.section} id="chatSection">
      <div className={styles.sectionTitle}>
        <div className={styles.sectionTitleText}>事件管理&执行窗口（AI Chat）</div>
        <div className={styles.titleActions}>
          <button className={styles.actionIcon} onClick={handleClearChat} title="清空聊天">
            🗑️
          </button>
        </div>
      </div>

      {/* 添加标签组件 */}
      <div className={styles.chatSectionWrapper}>
        <TagLabels />
        <div 
          className={styles.chatContainer} 
          id="chatContainer" 
          ref={chatContainerRef}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {chatMessages.length === 0 && (
            <div className={styles.chatAssistant}>
              <span role="img" aria-label="robot" style={{ marginRight: '10px', fontSize: '20px' }}>🤖</span>
              <span>智能银行助手 - 您好！请问有什么可以帮您？</span>
            </div>
          )}
          
          {chatMessages.map(message => (
            <div key={message.id} className={styles.message}>
              {renderMessage(message)}
            </div>
          ))}
        </div>
      </div>
      
      <div className={styles.chatInput}>
        <input 
          type="text" 
          className={styles.formInput}
          placeholder="您好！我是智能银行助手，请问有什么可以帮您？"
          value={message}
          onChange={handleMessageChange}
          onKeyDown={handleKeyDown}
        />
        <div className={styles.inputActions}>
          <button className={styles.sendButton} onClick={handleSendMessage} disabled={!message.trim()}>
            发送
          </button>
          <button className={styles.uploadButton} onClick={handleUpload}>
            上传
          </button>
        </div>
      </div>
      
      <div className={styles.dropHint}>将<strong>个人事件</strong>或<strong>银行事件</strong>拖拽到此处或点击事件可以查看详情和执行事件（标准事件不可直接使用）</div>
    </div>
  );
};

export default ChatSection;