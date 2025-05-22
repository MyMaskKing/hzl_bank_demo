import React, { useState } from 'react';
import styles from '../styles/Bank.module.css';
import ActionButton from './ActionButton';

const StandardEventsSection = () => {
  const [searchText, setSearchText] = useState('');
  const [isMinimized, setIsMinimized] = useState(true); // 默认最小化
  const [showSearch, setShowSearch] = useState(false);
  
  // 标准事件列表
  const standardEvents = [
    '既存信息查询',
    '既存信息变更',
    'BL检证-等式检证',
    'BL检证-范围检证'
  ];
  
  // 搜索过滤逻辑
  const filteredEvents = standardEvents.filter(event => 
    event.toLowerCase().includes(searchText.toLowerCase())
  );
  
  const handleSearch = (e) => {
    setSearchText(e.target.value);
  };
  
  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
    // 当最小化时，隐藏搜索框
    if (!isMinimized) {
      setShowSearch(false);
      setSearchText('');
    }
  };
  
  const toggleSearch = () => {
    setShowSearch(!showSearch);
    if (showSearch) {
      setSearchText('');
    }
  };
  
  // 当最小化时，只显示一个小按钮
  if (isMinimized) {
    return (
      <div className={styles.minimizedSection} onClick={toggleMinimize}>
        <div className={styles.minimizedButton} title="展开标准事件库">
          <span>标准事件库</span>
          <span className={styles.expandIcon}>➕</span>
        </div>
      </div>
    );
  }
  
  // 展开状态下显示完整内容
  return (
    <div className={styles.section} id="standardEventsSection">
      <div className={styles.sectionTitle}>
        <div className={styles.sectionTitleText}>标准事件库</div>
        <div className={styles.titleActions}>
          <button 
            className={styles.actionIcon} 
            onClick={toggleSearch} 
            title={showSearch ? "关闭搜索" : "搜索"}
          >
            🔍
          </button>
          <button 
            className={styles.actionIcon} 
            onClick={toggleMinimize} 
            title="收起"
          >
            ➖
          </button>
        </div>
      </div>
      
      {showSearch && (
        <input 
          type="text" 
          className={styles.searchBox} 
          placeholder="🔍 搜索标准事件"
          value={searchText}
          onChange={handleSearch}
          autoFocus
        />
      )}
      
      <div className={styles.buttonContainer} id="standardEvents">
        {filteredEvents.map((event, index) => (
          <div key={`standard-${index}`}>
            <ActionButton 
              text={event} 
              title={`标准事件: ${event}`}
              type="standard"
            />
          </div>
        ))}
        
        {filteredEvents.length === 0 && (
          <div className={styles.noEvents}>
            {searchText ? `未找到匹配"${searchText}"的标准事件` : '无标准事件'}
          </div>
        )}
      </div>
    </div>
  );
};

export default StandardEventsSection; 