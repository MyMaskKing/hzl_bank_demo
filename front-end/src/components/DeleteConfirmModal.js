import React from 'react';
import ReactDOM from 'react-dom';
import styles from '../styles/Bank.module.css';

const DeleteConfirmModal = ({ isOpen, onClose, title, eventName, composition = [], onConfirm }) => {
  if (!isOpen) return null;
  
  const handleConfirm = () => {
    onConfirm(eventName);
    onClose();
  };
  
  return ReactDOM.createPortal(
    <div className={styles.deleteConfirmModal}>
      <div className={styles.deleteConfirmContent}>
        <div className={styles.deleteConfirmHeader}>
          <div className={styles.deleteConfirmTitle}>{title}</div>
          <button className={styles.closeButton} onClick={onClose}>&times;</button>
        </div>
        
        <div className={styles.deleteConfirmBody}>
          <div className={styles.warningText}>
            确定要删除以下事件吗？
          </div>
          
          <div className={styles.eventToDelete}>
            {eventName}
          </div>
          
          {composition && composition.length > 0 && (
            <>
              <div className={styles.compositionText}>
                该事件由以下组件构成：
              </div>
              <ul className={styles.compositionList}>
                {composition.map((event, index) => (
                  <li key={`comp-${index}`}>{event}</li>
                ))}
              </ul>
            </>
          )}
          
          <div className={styles.warningText}>
            删除后将无法恢复！
          </div>
        </div>
        
        <div className={styles.deleteConfirmButtons}>
          <button className={styles.cancelDeleteButton} onClick={onClose}>
            取消
          </button>
          <button className={styles.confirmDeleteButton} onClick={handleConfirm}>
            确认删除
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default DeleteConfirmModal; 