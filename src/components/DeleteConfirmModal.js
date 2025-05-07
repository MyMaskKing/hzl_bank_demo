import React from 'react';
import ReactDOM from 'react-dom';
import styles from '../styles/Bank.module.css';

const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, title, eventName, composition = [] }) => {
  if (!isOpen) return null;
  
  return ReactDOM.createPortal(
    <div className={styles.modal}>
      <div className={styles.deleteConfirmModal}>
        <div className={styles.deleteConfirmHeader}>
          <div className={styles.deleteConfirmTitle}>{title || '确认删除'}</div>
          <button className={styles.closeButton} onClick={onClose}>&times;</button>
        </div>
        
        <div className={styles.deleteConfirmContent}>
          <p>您确定要删除以下事件吗？</p>
          <div className={styles.eventToDelete}>
            <strong>{eventName}</strong>
          </div>
          
          {composition && composition.length > 0 && (
            <>
              <p>该事件由以下组件组成：</p>
              <ul className={styles.compositionList}>
                {composition.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
              <p className={styles.warningText}>注意：删除此事件不会删除其组成部分，只会删除该事件本身。</p>
            </>
          )}
        </div>
        
        <div className={styles.deleteConfirmButtons}>
          <button className={styles.cancelDeleteButton} onClick={onClose}>
            取消
          </button>
          <button 
            className={styles.confirmDeleteButton} 
            onClick={() => {
              onConfirm(eventName);
              onClose();
            }}
          >
            确认删除
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default DeleteConfirmModal; 