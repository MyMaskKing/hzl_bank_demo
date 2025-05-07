import React, { useState, useEffect } from 'react';
import styles from '../styles/Bank.module.css';
import ActionButton from './ActionButton';
import EventModal from './EventModal';
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
  
  // 从本地存储加载事件列表和组合信息
  useEffect(() => {
    const savedPersonalEvents = localStorage.getItem('personalEvents');
    const savedBankEvents = localStorage.getItem('bankEvents');
    const savedEventCompositions = localStorage.getItem('eventCompositions');
    
    if (savedPersonalEvents) {
      setPersonalEvents(JSON.parse(savedPersonalEvents));
    }
    if (savedBankEvents) {
      setBankEvents(JSON.parse(savedBankEvents));
    }
    if (savedEventCompositions) {
      setEventCompositions(JSON.parse(savedEventCompositions));
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
      events: eventCompositions[eventName] || []
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
      events: eventCompositions[eventName] || []
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
  };

  // 保存编辑后的事件
  const handleUpdatePersonalEvent = (eventData) => {
    const oldName = currentEditEvent.name;
    const newName = eventData.name;
    
    // 更新事件名称（如果有变化）
    if (oldName !== newName) {
      // 删除旧事件，添加新事件
      const index = personalEvents.indexOf(oldName);
      if (index !== -1) {
        const newEvents = [...personalEvents];
        newEvents.splice(index, 1, newName);
        setPersonalEvents(newEvents);
        saveToLocalStorage('personalEvents', newEvents);
      }
    }
    
    // 更新事件组合信息
    const newCompositions = {...eventCompositions};
    // 删除旧事件的组合
    if (oldName !== newName) {
      delete newCompositions[oldName];
    }
    // 添加新事件的组合
    newCompositions[newName] = eventData.events;
    setEventCompositions(newCompositions);
    saveToLocalStorage('eventCompositions', newCompositions);
    
    closePersonalEditModal();
  };
  
  const handleUpdateBankEvent = (eventData) => {
    const oldName = currentEditEvent.name;
    const newName = eventData.name;
    
    // 更新事件名称（如果有变化）
    if (oldName !== newName) {
      // 删除旧事件，添加新事件
      const index = bankEvents.indexOf(oldName);
      if (index !== -1) {
        const newEvents = [...bankEvents];
        newEvents.splice(index, 1, newName);
        setBankEvents(newEvents);
        saveToLocalStorage('bankEvents', newEvents);
      }
      
      // 更新引用这个银行事件的个人事件
      const newCompositions = {...eventCompositions};
      Object.keys(newCompositions).forEach(eventName => {
        if (personalEvents.includes(eventName)) {
          const events = newCompositions[eventName];
          const eventIndex = events.indexOf(oldName);
          if (eventIndex !== -1) {
            events[eventIndex] = newName;
          }
        }
      });
      
      setEventCompositions(newCompositions);
      saveToLocalStorage('eventCompositions', newCompositions);
    }
    
    // 更新事件组合信息
    const newCompositions = {...eventCompositions};
    // 删除旧事件的组合
    if (oldName !== newName) {
      delete newCompositions[oldName];
    }
    // 添加新事件的组合
    newCompositions[newName] = eventData.events;
    setEventCompositions(newCompositions);
    saveToLocalStorage('eventCompositions', newCompositions);
    
    closeBankEditModal();
  };
  
  // 显示事件的详细信息（组成它的事件）
  const getEventDescription = (eventName) => {
    const composition = eventCompositions[eventName];
    if (composition && composition.length > 0) {
      return `由 ${composition.join('、')} 组成`;
    }
    return '';
  };

  return (
    <div className={styles.section} id="bankEventsSection">
      {/* 个人事件库 */}
      <div className={styles.sectionTitle}>
        <div className={styles.sectionTitleText}>个人事件库</div>
        <div className={styles.titleActions}>
          <button className={styles.actionIcon} onClick={togglePersonalSearch} title="搜索">
            🔍
          </button>
          <button className={styles.actionIcon} onClick={openPersonalModal} title="添加">
            ➕
          </button>
        </div>
      </div>
      
      {showPersonalSearch && (
        <input 
          type="text" 
          className={styles.searchBox} 
          placeholder="🔍 搜索个人事件"
          value={searchPersonalText}
          onChange={handlePersonalSearch}
          autoFocus
        />
      )}
      
      <div className={styles.buttonContainer} id="personalEvents">
        {filteredPersonalEvents.map((event, index) => (
          <div key={`personal-${index}`} className={styles.eventWithActions}>
            <ActionButton 
              text={event} 
              title={getEventDescription(event)}
            />
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
      </div>
      
      {/* 银行事件库 */}
      <div className={`${styles.sectionTitle} mt-4`}>
        <div className={styles.sectionTitleText}>银行事件库</div>
        <div className={styles.titleActions}>
          <button className={styles.actionIcon} onClick={toggleBankSearch} title="搜索">
            🔍
          </button>
          <button className={styles.actionIcon} onClick={openBankModal} title="添加">
            ➕
          </button>
        </div>
      </div>
      
      {showBankSearch && (
        <input 
          type="text" 
          className={styles.searchBox} 
          placeholder="🔍 搜索银行事件"
          value={searchBankText}
          onChange={handleBankSearch}
          autoFocus
        />
      )}
      
      <div className={styles.buttonContainer} id="bankEvents">
        {filteredBankEvents.map((event, index) => (
          <div key={`bank-${index}`} className={styles.eventWithActions}>
            <ActionButton 
              text={event} 
              title={getEventDescription(event)}
            />
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
      </div>
      
      {/* 个人事件创建Modal */}
      <EventModal 
        isOpen={isPersonalModalOpen}
        onClose={closePersonalModal}
        title="创建个人事件"
        nameLabel="个人事件名"
        eventType="银行事件"
        availableEvents={bankEvents}
        onSave={handleSavePersonalEvent}
      />
      
      {/* 银行事件创建Modal */}
      <EventModal 
        isOpen={isBankModalOpen}
        onClose={closeBankModal}
        title="创建银行事件"
        nameLabel="银行事件名"
        eventType="标准事件"
        availableEvents={standardEvents}
        onSave={handleSaveBankEvent}
      />
      
      {/* 个人事件编辑Modal */}
      <EventModal 
        isOpen={isPersonalEditModalOpen}
        onClose={closePersonalEditModal}
        title="编辑个人事件"
        nameLabel="个人事件名"
        eventType="银行事件"
        availableEvents={bankEvents}
        onSave={handleUpdatePersonalEvent}
        initialEvent={currentEditEvent}
      />
      
      {/* 银行事件编辑Modal */}
      <EventModal 
        isOpen={isBankEditModalOpen}
        onClose={closeBankEditModal}
        title="编辑银行事件"
        nameLabel="银行事件名"
        eventType="标准事件"
        availableEvents={standardEvents}
        onSave={handleUpdateBankEvent}
        initialEvent={currentEditEvent}
      />
      
      {/* 个人事件删除确认Modal */}
      <DeleteConfirmModal 
        isOpen={isPersonalDeleteModalOpen}
        onClose={closePersonalDeleteModal}
        onConfirm={handleDeletePersonalEvent}
        title="删除个人事件"
        eventName={currentDeleteEvent?.name}
        composition={currentDeleteEvent?.events}
      />
      
      {/* 银行事件删除确认Modal */}
      <DeleteConfirmModal 
        isOpen={isBankDeleteModalOpen}
        onClose={closeBankDeleteModal}
        onConfirm={handleDeleteBankEvent}
        title="删除银行事件"
        eventName={currentDeleteEvent?.name}
        composition={currentDeleteEvent?.events}
      />
    </div>
  );
};

export default EventsSection;