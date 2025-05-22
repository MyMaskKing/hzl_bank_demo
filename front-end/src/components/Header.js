import React from 'react';
import styles from '../styles/Bank.module.css';

const Header = () => {
  return (
    <header className={styles.header}>
      <div className={styles.headerContent}>
        <h1 className={styles.headerTitle}>
          <span className={styles.bankIcon}>🏦</span> 
          智能银行事件管理系统
        </h1>
        <div className={styles.headerSubtitle}>高效组合银行事件，实现业务流程自动化</div>
      </div>
    </header>
  );
};

export default Header; 