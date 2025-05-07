import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import Sortable from 'sortablejs';
import styles from '../styles/Bank.module.css';
import ActionButton from './ActionButton';

const EventModal = ({ isOpen, onClose, title, nameLabel, eventType, availableEvents, onSave, initialEvent = null }) => {
  const [eventName, setEventName] = useState('');
  const [selectedEvents, setSelectedEvents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAvailableEvents, setShowAvailableEvents] = useState(false);
  
  // 初始化编辑状态
  useEffect(() => {
    if (initialEvent) {
      setEventName(initialEvent.name || '');
      setSelectedEvents(initialEvent.events || []);
    } else {
      setEventName('');
      setSelectedEvents([]);
    }
  }, [initialEvent, isOpen]);
  
  // 过滤可用事件，排除已选择的事件
  const filteredAvailableEvents = availableEvents.filter(event => 
    event.toLowerCase().includes(searchQuery.toLowerCase()) &&
    !selectedEvents.includes(event)
  );
  
  // 当Modal打开时，初始化拖拽功能
  useEffect(() => {
    if (isOpen) {
      // 已选事件列表
      const selectedEventsEl = document.getElementById('selectedEvents');
      
      if (selectedEventsEl) {
        // 初始化已选事件列表的拖拽
        new Sortable(selectedEventsEl, {
          animation: 150,
          onSort: (evt) => {
            // 更新已选事件列表
            const newSelectedEvents = Array.from(selectedEventsEl.children).map(
              node => node.textContent
            );
            setSelectedEvents(newSelectedEvents);
          }
        });
      }
    }
  }, [isOpen]);
  
  const handleNameChange = (e) => {
    setEventName(e.target.value);
  };
  
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setShowAvailableEvents(true);
  };
  
  const handleEventSelect = (event) => {
    if (!selectedEvents.includes(event)) {
      setSelectedEvents([...selectedEvents, event]);
      setSearchQuery('');
      setShowAvailableEvents(false);
    }
  };
  
  const handleRemoveEvent = (index) => {
    const newEvents = [...selectedEvents];
    newEvents.splice(index, 1);
    setSelectedEvents(newEvents);
  };
  
  const handleSave = () => {
    if (eventName.trim() && selectedEvents.length > 0) {
      onSave({
        name: eventName,
        events: selectedEvents
      });
      resetForm();
    }
  };
  
  const resetForm = () => {
    setEventName('');
    setSelectedEvents([]);
    setSearchQuery('');
    setShowAvailableEvents(false);
    onClose();
  };
  
  const toggleAvailableEvents = () => {
    setShowAvailableEvents(!showAvailableEvents);
    if (!showAvailableEvents) {
      setSearchQuery('');
    }
  };
  
  // 如果Modal没有打开，不渲染任何内容
  if (!isOpen) return null;
  
  // 使用Portal将Modal渲染到body最后
  return ReactDOM.createPortal(
    <div className={styles.modal}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
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
        
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>{eventType}选择</label>
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
          
          {showAvailableEvents && (
            <div className={styles.eventsDropdown}>
              {filteredAvailableEvents.length > 0 ? (
                filteredAvailableEvents.map((event, index) => (
                  <div 
                    key={`available-${index}`} 
                    className={styles.eventItem}
                    onClick={() => handleEventSelect(event)}
                  >
                    {event}
                  </div>
                ))
              ) : (
                <div className={styles.noEvents}>
                  {searchQuery ? `没有匹配"${searchQuery}"的${eventType}` : `没有可用的${eventType}`}
                </div>
              )}
            </div>
          )}
        </div>
        
        <div className={styles.formGroup}>
          <label className={styles.formLabel}>已选{eventType}</label>
          <div className={styles.selectedEvents} id="selectedEvents">
            {selectedEvents.map((event, index) => (
              <div key={`selected-${index}`} className={styles.selectedEventItem}>
                <span className={styles.eventText}>{event}</span>
                <button 
                  className={styles.removeEventBtn} 
                  onClick={() => handleRemoveEvent(index)}
                  title="移除"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          {selectedEvents.length === 0 && (
            <div className={styles.noSelectedEvents}>
              请从上方搜索并选择{eventType}
            </div>
          )}
          <small className="text-muted">提示：可自由拖动已选{eventType}来调整执行顺序</small>
        </div>
        
        <div className={styles.modalFooter}>
          <button className={styles.cancelButton} onClick={onClose}>取消</button>
          <button 
            className={styles.saveButton} 
            onClick={handleSave}
            disabled={!eventName.trim() || selectedEvents.length === 0}
          >
            保存
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default EventModal; 