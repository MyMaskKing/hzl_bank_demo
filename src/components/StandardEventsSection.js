import React, { useState } from 'react';
import styles from '../styles/Bank.module.css';
import ActionButton from './ActionButton';

const StandardEventsSection = () => {
  const [searchText, setSearchText] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  
  const standardEvents = [
    '既存信息查询',
    '既存信息变更',
    'BL检证-等式检证',
    'BL检证-范围检证',
    'OTP设备认证',
    '用户信息验证',
    '系统权限判断',
    '数据输出格式化'
  ];

  const filteredEvents = standardEvents.filter(event => 
    event.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleSearch = (e) => {
    setSearchText(e.target.value);
  };
  
  const toggleSearch = () => {
    setShowSearch(!showSearch);
    if (showSearch) {
      setSearchText(''); // 关闭搜索时清空搜索内容
    }
  };

  return (
    <div className={styles.section} id="standardEventsSection">
      <div className={styles.sectionTitle}>
        <div className={styles.sectionTitleText}>标准事件库</div>
        <div className={styles.titleActions}>
          <button className={styles.actionIcon} onClick={toggleSearch} title="搜索">
            🔍
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
          <div key={`standard-${index}`} className={styles.eventWithActions}>
            <ActionButton 
              key={`standard-${index}`} 
              text={event} 
              title="基础标准事件（不可直接使用）"
              type="standard"
            />
          </div>
        ))}
      </div>
      
      {filteredEvents.length === 0 && searchText && (
        <div className={styles.noEvents}>
          没有找到匹配"{searchText}"的标准事件
        </div>
      )}
    </div>
  );
};

export default StandardEventsSection; 