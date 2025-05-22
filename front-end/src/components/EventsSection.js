import React, { useState, useEffect } from 'react';
import styles from '../styles/Bank.module.css';
import ActionButton from './ActionButton';
import CanvasModal from './CanvasModal';
import DeleteConfirmModal from './DeleteConfirmModal';

const EventsSection = () => {
  const [searchPersonalText, setSearchPersonalText] = useState('');
  const [searchBankText, setSearchBankText] = useState('');
  const [showPersonalSearch, setShowPersonalSearch] = useState(false);
  const [showBankSearch, setShowBankSearch] = useState(false);
  const [isPersonalModalOpen, setIsPersonalModalOpen] = useState(false);
  const [isBankModalOpen, setIsBankModalOpen] = useState(false);
  const [isPersonalEditModalOpen, setIsPersonalEditModalOpen] = useState(false);
  const [isBankEditModalOpen, setIsBankEditModalOpen] = useState(false);
  const [isPersonalDeleteModalOpen, setIsPersonalDeleteModalOpen] = useState(false);
  const [isBankDeleteModalOpen, setIsBankDeleteModalOpen] = useState(false);
  const [currentEditEvent, setCurrentEditEvent] = useState(null);
  const [currentDeleteEvent, setCurrentDeleteEvent] = useState(null);
  const [personalEvents, setPersonalEvents] = useState([
    'OTP启用设定变更_后将发生紧急处理',
    '0411msg更新一括处理'
  ]);
  const [bankEvents, setBankEvents] = useState([
    'OTP启用设定变更',
    'OTP停止设定变更',
    '设信master数据导出',
    '设定值变更',
    'Msg文言变更'
  ]);
  // 定义标准事件，但不提供修改方法，因为标准事件是基础组件
  const standardEvents = [
    '既存信息查询',
    '既存信息变更',
    'BL检证-等式检证',
    'BL检证-范围检证'
  ];
  
  // 保存事件组合信息（事件名称到组成它的事件的映射）
  const [eventCompositions, setEventCompositions] = useState({
    // 初始示例数据
    'OTP启用设定变更_后将发生紧急处理': ['OTP启用设定变更', 'Msg文言变更'],
    '0411msg更新一括处理': ['Msg文言变更'],
    'OTP启用设定变更': ['既存信息查询', 'BL检证-等式检证'],
    'OTP停止设定变更': ['既存信息变更'],
    '设信master数据导出': ['既存信息查询'],
    'Msg文言变更': ['既存信息变更', 'BL检证-范围检证']
  });
  
  // 保存事件流程数据（节点和边）
  const [eventFlowData, setEventFlowData] = useState({});
  
  // 从本地存储加载事件列表和组合信息
  useEffect(() => {
    const savedPersonalEvents = localStorage.getItem('personalEvents');
    const savedBankEvents = localStorage.getItem('bankEvents');
    const savedEventCompositions = localStorage.getItem('eventCompositions');
    const savedEventFlowData = localStorage.getItem('eventFlowData');
    
    if (savedPersonalEvents) {
      setPersonalEvents(JSON.parse(savedPersonalEvents));
    }
    if (savedBankEvents) {
      setBankEvents(JSON.parse(savedBankEvents));
    }
    if (savedEventCompositions) {
      setEventCompositions(JSON.parse(savedEventCompositions));
    }
    if (savedEventFlowData) {
      setEventFlowData(JSON.parse(savedEventFlowData));
    }
  }, []);
  
  // 保存事件到本地存储
  const saveToLocalStorage = (key, data) => {
    localStorage.setItem(key, JSON.stringify(data));
  };
  
  // 搜索过滤逻辑
  const filteredPersonalEvents = personalEvents.filter(event => 
    event.toLowerCase().includes(searchPersonalText.toLowerCase())
  );
  
  const filteredBankEvents = bankEvents.filter(event => 
    event.toLowerCase().includes(searchBankText.toLowerCase())
  );
  
  // 搜索相关处理函数
  const handlePersonalSearch = (e) => {
    setSearchPersonalText(e.target.value);
  };
  
  const handleBankSearch = (e) => {
    setSearchBankText(e.target.value);
  };
  
  const togglePersonalSearch = () => {
    setShowPersonalSearch(!showPersonalSearch);
    if (showPersonalSearch) {
      setSearchPersonalText('');
    }
  };
  
  const toggleBankSearch = () => {
    setShowBankSearch(!showBankSearch);
    if (showBankSearch) {
      setSearchBankText('');
    }
  };
  
  // Modal相关处理函数
  const openPersonalModal = () => {
    setIsPersonalModalOpen(true);
  };
  
  const closePersonalModal = () => {
    setIsPersonalModalOpen(false);
  };
  
  const openBankModal = () => {
    setIsBankModalOpen(true);
  };
  
  const closeBankModal = () => {
    setIsBankModalOpen(false);
  };

  // 编辑功能相关处理函数
  const openPersonalEditModal = (eventName) => {
    setCurrentEditEvent({
      name: eventName,
      events: eventCompositions[eventName] || [],
      ...eventFlowData[eventName] // 添加流程数据
    });
    setIsPersonalEditModalOpen(true);
  };
  
  const closePersonalEditModal = () => {
    setCurrentEditEvent(null);
    setIsPersonalEditModalOpen(false);
  };
  
  const openBankEditModal = (eventName) => {
    setCurrentEditEvent({
      name: eventName,
      events: eventCompositions[eventName] || [],
      ...eventFlowData[eventName] // 添加流程数据
    });
    setIsBankEditModalOpen(true);
  };
  
  const closeBankEditModal = () => {
    setCurrentEditEvent(null);
    setIsBankEditModalOpen(false);
  };
  
  // 删除功能相关处理函数
  const openPersonalDeleteModal = (eventName) => {
    setCurrentDeleteEvent({
      name: eventName,
      events: eventCompositions[eventName] || []
    });
    setIsPersonalDeleteModalOpen(true);
  };
  
  const closePersonalDeleteModal = () => {
    setCurrentDeleteEvent(null);
    setIsPersonalDeleteModalOpen(false);
  };
  
  const openBankDeleteModal = (eventName) => {
    setCurrentDeleteEvent({
      name: eventName,
      events: eventCompositions[eventName] || []
    });
    setIsBankDeleteModalOpen(true);
  };
  
  const closeBankDeleteModal = () => {
    setCurrentDeleteEvent(null);
    setIsBankDeleteModalOpen(false);
  };
  
  // 删除事件处理函数
  const handleDeletePersonalEvent = (eventName) => {
    const newEvents = personalEvents.filter(event => event !== eventName);
    setPersonalEvents(newEvents);
    saveToLocalStorage('personalEvents', newEvents);
    
    // 删除组合信息
    const newCompositions = {...eventCompositions};
    delete newCompositions[eventName];
    setEventCompositions(newCompositions);
    saveToLocalStorage('eventCompositions', newCompositions);
    
    // 删除流程数据
    const newFlowData = {...eventFlowData};
    delete newFlowData[eventName];
    setEventFlowData(newFlowData);
    saveToLocalStorage('eventFlowData', newFlowData);
  };
  
  const handleDeleteBankEvent = (eventName) => {
    // 检查是否有个人事件使用了这个银行事件
    const dependentEvents = Object.entries(eventCompositions)
      .filter(([key, events]) => 
        personalEvents.includes(key) && events.includes(eventName)
      )
      .map(([key]) => key);
    
    if (dependentEvents.length > 0) {
      alert(`不能删除此银行事件，因为以下个人事件依赖它：\n${dependentEvents.join('\n')}`);
      return;
    }
    
    const newEvents = bankEvents.filter(event => event !== eventName);
    setBankEvents(newEvents);
    saveToLocalStorage('bankEvents', newEvents);
    
    // 删除组合信息
    const newCompositions = {...eventCompositions};
    delete newCompositions[eventName];
    setEventCompositions(newCompositions);
    saveToLocalStorage('eventCompositions', newCompositions);
    
    // 删除流程数据
    const newFlowData = {...eventFlowData};
    delete newFlowData[eventName];
    setEventFlowData(newFlowData);
    saveToLocalStorage('eventFlowData', newFlowData);
  };
  
  // 保存新事件
  const handleSavePersonalEvent = (eventData) => {
    // 如果事件名已存在，不添加新事件
    if (personalEvents.includes(eventData.name)) {
      alert(`个人事件 "${eventData.name}" 已存在`);
      return;
    }
    
    const newEvents = [...personalEvents, eventData.name];
    setPersonalEvents(newEvents);
    saveToLocalStorage('personalEvents', newEvents);
    
    // 保存事件组合信息
    const newCompositions = {
      ...eventCompositions,
      [eventData.name]: eventData.events
    };
    setEventCompositions(newCompositions);
    saveToLocalStorage('eventCompositions', newCompositions);
    
    // 保存流程数据
    const newFlowData = {
      ...eventFlowData,
      [eventData.name]: {
        nodes: eventData.nodes || [],
        edges: eventData.edges || []
      }
    };
    setEventFlowData(newFlowData);
    saveToLocalStorage('eventFlowData', newFlowData);
    
    closePersonalModal();
  };
  
  const handleSaveBankEvent = (eventData) => {
    // 如果事件名已存在，不添加新事件
    if (bankEvents.includes(eventData.name)) {
      alert(`银行事件 "${eventData.name}" 已存在`);
      return;
    }
    
    const newEvents = [...bankEvents, eventData.name];
    setBankEvents(newEvents);
    saveToLocalStorage('bankEvents', newEvents);
    
    // 保存事件组合信息
    const newCompositions = {
      ...eventCompositions,
      [eventData.name]: eventData.events
    };
    setEventCompositions(newCompositions);
    saveToLocalStorage('eventCompositions', newCompositions);
    
    // 保存流程数据
    const newFlowData = {
      ...eventFlowData,
      [eventData.name]: {
        nodes: eventData.nodes || [],
        edges: eventData.edges || []
      }
    };
    setEventFlowData(newFlowData);
    saveToLocalStorage('eventFlowData', newFlowData);
    
    closeBankModal();
  };
  
  // 更新事件
  const handleUpdatePersonalEvent = (eventData) => {
    // 更新事件名称（如果有变化）
    if (eventData.name !== currentEditEvent.name) {
      const newEvents = personalEvents.map(event => 
        event === currentEditEvent.name ? eventData.name : event
      );
      setPersonalEvents(newEvents);
      saveToLocalStorage('personalEvents', newEvents);
      
      // 复制原有事件的组合信息到新名称，并删除旧名称的信息
      const newCompositions = {
        ...eventCompositions,
        [eventData.name]: eventData.events
      };
      if (eventData.name !== currentEditEvent.name) {
        delete newCompositions[currentEditEvent.name];
      }
      setEventCompositions(newCompositions);
      saveToLocalStorage('eventCompositions', newCompositions);
      
      // 复制原有事件的流程数据到新名称，并删除旧名称的数据
      const newFlowData = {
        ...eventFlowData,
        [eventData.name]: {
          nodes: eventData.nodes || [],
          edges: eventData.edges || []
        }
      };
      if (eventData.name !== currentEditEvent.name) {
        delete newFlowData[currentEditEvent.name];
      }
      setEventFlowData(newFlowData);
      saveToLocalStorage('eventFlowData', newFlowData);
    } else {
      // 仅更新事件组合信息
      const newCompositions = {
        ...eventCompositions,
        [eventData.name]: eventData.events
      };
      setEventCompositions(newCompositions);
      saveToLocalStorage('eventCompositions', newCompositions);
      
      // 更新流程数据
      const newFlowData = {
        ...eventFlowData,
        [eventData.name]: {
          nodes: eventData.nodes || [],
          edges: eventData.edges || []
        }
      };
      setEventFlowData(newFlowData);
      saveToLocalStorage('eventFlowData', newFlowData);
    }
    
    closePersonalEditModal();
  };
  
  const handleUpdateBankEvent = (eventData) => {
    // 检查是否有个人事件依赖于此银行事件
    let dependentEvents = [];
    if (eventData.name !== currentEditEvent.name) {
      dependentEvents = Object.entries(eventCompositions)
        .filter(([key, events]) => 
          personalEvents.includes(key) && events.includes(currentEditEvent.name)
        )
        .map(([key]) => key);
      
      if (dependentEvents.length > 0) {
        const shouldContinue = window.confirm(
          `以下个人事件依赖于此银行事件：\n${dependentEvents.join('\n')}\n\n` +
          `更改名称可能会导致这些个人事件出现问题。是否继续？`
        );
        
        if (!shouldContinue) {
          return;
        }
      }
    }
    
    // 更新事件名称（如果有变化）
    if (eventData.name !== currentEditEvent.name) {
      const newEvents = bankEvents.map(event => 
        event === currentEditEvent.name ? eventData.name : event
      );
      setBankEvents(newEvents);
      saveToLocalStorage('bankEvents', newEvents);
      
      // 复制原有事件的组合信息到新名称，并删除旧名称的信息
      const newCompositions = {
        ...eventCompositions,
        [eventData.name]: eventData.events
      };
      if (eventData.name !== currentEditEvent.name) {
        delete newCompositions[currentEditEvent.name];
      }
      setEventCompositions(newCompositions);
      saveToLocalStorage('eventCompositions', newCompositions);
      
      // 复制原有事件的流程数据到新名称，并删除旧名称的数据
      const newFlowData = {
        ...eventFlowData,
        [eventData.name]: {
          nodes: eventData.nodes || [],
          edges: eventData.edges || []
        }
      };
      if (eventData.name !== currentEditEvent.name) {
        delete newFlowData[currentEditEvent.name];
      }
      setEventFlowData(newFlowData);
      saveToLocalStorage('eventFlowData', newFlowData);
      
      // 更新依赖于此银行事件的个人事件的组合信息
      if (dependentEvents.length > 0) {
        const updatedCompositions = {...eventCompositions};
        
        for (const dependentEvent of dependentEvents) {
          updatedCompositions[dependentEvent] = updatedCompositions[dependentEvent].map(
            event => event === currentEditEvent.name ? eventData.name : event
          );
        }
        
        setEventCompositions(updatedCompositions);
        saveToLocalStorage('eventCompositions', updatedCompositions);
      }
    } else {
      // 仅更新事件组合信息
      const newCompositions = {
        ...eventCompositions,
        [eventData.name]: eventData.events
      };
      setEventCompositions(newCompositions);
      saveToLocalStorage('eventCompositions', newCompositions);
      
      // 更新流程数据
      const newFlowData = {
        ...eventFlowData,
        [eventData.name]: {
          nodes: eventData.nodes || [],
          edges: eventData.edges || []
        }
      };
      setEventFlowData(newFlowData);
      saveToLocalStorage('eventFlowData', newFlowData);
    }
    
    closeBankEditModal();
  };

  // 获取事件描述（用于显示组合内容）
  // 此函数暂不使用，但保留供后续扩展功能使用
  // eslint-disable-next-line no-unused-vars
  const getEventDescription = (eventName) => {
    const events = eventCompositions[eventName] || [];
    return events.length > 0 
      ? events.join(' → ') 
      : '无组合事件';
  };
  
  return (
    <div className={styles.eventsContainer}>
      {/* 个人事件库 */}
      <div className={styles.section}>
        <div className={styles.sectionTitle}>
          <div className={styles.sectionTitleText}>个人事件库</div>
          <div className={styles.titleActions}>
            {showPersonalSearch ? (
              <input 
                type="text" 
                className={styles.searchBox} 
                value={searchPersonalText}
                onChange={handlePersonalSearch}
                placeholder="搜索个人事件..."
                autoFocus
              />
            ) : null}
            <button className={styles.actionIcon} onClick={togglePersonalSearch} title="搜索">
              🔍
            </button>
            <button className={styles.actionIcon} onClick={openPersonalModal} title="添加个人事件">
              ➕
            </button>
          </div>
        </div>
        <div className={styles.eventList}>
          {filteredPersonalEvents.map((event, index) => (
            <div key={`personal-${index}`} className={styles.eventWithActions}>
              <ActionButton text={event} eventType="personal" />
              <div className={styles.eventActions}>
                <button 
                  className={styles.editButton} 
                  onClick={() => openPersonalEditModal(event)}
                  title="编辑"
                >
                  ✏️
                </button>
                <button 
                  className={styles.deleteButton} 
                  onClick={() => openPersonalDeleteModal(event)}
                  title="删除"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
          {filteredPersonalEvents.length === 0 && (
            <div className={styles.noEvents}>
              {searchPersonalText ? `没有匹配"${searchPersonalText}"的个人事件` : '没有个人事件'}
            </div>
          )}
        </div>
      </div>
      
      {/* 银行事件库 */}
      <div className={styles.section}>
        <div className={styles.sectionTitle}>
          <div className={styles.sectionTitleText}>银行事件库</div>
          <div className={styles.titleActions}>
            {showBankSearch ? (
              <input 
                type="text" 
                className={styles.searchBox} 
                value={searchBankText}
                onChange={handleBankSearch}
                placeholder="搜索银行事件..."
                autoFocus
              />
            ) : null}
            <button className={styles.actionIcon} onClick={toggleBankSearch} title="搜索">
              🔍
            </button>
            <button className={styles.actionIcon} onClick={openBankModal} title="添加银行事件">
              ➕
            </button>
          </div>
        </div>
        <div className={styles.eventList}>
          {filteredBankEvents.map((event, index) => (
            <div key={`bank-${index}`} className={styles.eventWithActions}>
              <ActionButton text={event} eventType="bank" />
              <div className={styles.eventActions}>
                <button 
                  className={styles.editButton} 
                  onClick={() => openBankEditModal(event)}
                  title="编辑"
                >
                  ✏️
                </button>
                <button 
                  className={styles.deleteButton} 
                  onClick={() => openBankDeleteModal(event)}
                  title="删除"
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
          {filteredBankEvents.length === 0 && (
            <div className={styles.noEvents}>
              {searchBankText ? `没有匹配"${searchBankText}"的银行事件` : '没有银行事件'}
            </div>
          )}
        </div>
      </div>
      
      {/* 个人事件模态窗口 - 使用CanvasModal */}
      <CanvasModal
        isOpen={isPersonalModalOpen}
        onClose={closePersonalModal}
        title="创建个人事件"
        nameLabel="个人事件名"
        eventType="银行事件"
        availableEvents={bankEvents}
        onSave={handleSavePersonalEvent}
      />
      
      {/* 银行事件模态窗口 - 使用CanvasModal */}
      <CanvasModal
        isOpen={isBankModalOpen}
        onClose={closeBankModal}
        title="创建银行事件"
        nameLabel="银行事件名"
        eventType="标准事件"
        availableEvents={standardEvents}
        onSave={handleSaveBankEvent}
      />
      
      {/* 个人事件编辑模态窗口 - 使用CanvasModal */}
      <CanvasModal
        isOpen={isPersonalEditModalOpen}
        onClose={closePersonalEditModal}
        title="编辑个人事件"
        nameLabel="个人事件名"
        eventType="银行事件"
        availableEvents={bankEvents}
        initialEvent={currentEditEvent}
        onSave={handleUpdatePersonalEvent}
      />
      
      {/* 银行事件编辑模态窗口 - 使用CanvasModal */}
      <CanvasModal
        isOpen={isBankEditModalOpen}
        onClose={closeBankEditModal}
        title="编辑银行事件"
        nameLabel="银行事件名"
        eventType="标准事件"
        availableEvents={standardEvents}
        initialEvent={currentEditEvent}
        onSave={handleUpdateBankEvent}
      />
      
      {/* 删除确认模态窗口 */}
      <DeleteConfirmModal
        isOpen={isPersonalDeleteModalOpen}
        onClose={closePersonalDeleteModal}
        title="删除个人事件"
        eventName={currentDeleteEvent?.name}
        composition={currentDeleteEvent?.events}
        onConfirm={() => {
          handleDeletePersonalEvent(currentDeleteEvent.name);
          closePersonalDeleteModal();
        }}
      />
      
      <DeleteConfirmModal
        isOpen={isBankDeleteModalOpen}
        onClose={closeBankDeleteModal}
        title="删除银行事件"
        eventName={currentDeleteEvent?.name}
        composition={currentDeleteEvent?.events}
        onConfirm={() => {
          handleDeleteBankEvent(currentDeleteEvent.name);
          closeBankDeleteModal();
        }}
      />
    </div>
  );
};

export default EventsSection;