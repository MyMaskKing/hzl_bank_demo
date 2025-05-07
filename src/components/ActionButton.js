import React, { useRef, useState, useEffect } from 'react';
import styles from '../styles/Bank.module.css';

const ActionButton = ({ text, title, type = '' }) => {
  const buttonRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isClicked, setIsClicked] = useState(false);
  
  // 点击动画效果
  useEffect(() => {
    if (isClicked) {
      const timer = setTimeout(() => {
        setIsClicked(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isClicked]);
  
  // 标准事件不可拖拽到聊天窗口及点击显示
  const isStandardEvent = type === 'standard';
  
  const handleClick = (e) => {
    // 阻止事件冒泡，避免与父元素的点击事件冲突
    e.stopPropagation();
    
    // 如果是标准事件，则不执行点击操作
    if (isStandardEvent) {
      return;
    }
    
    // 设置点击状态，触发动画
    setIsClicked(true);
    
    // 在Chat中显示事件
    console.log('Action按钮点击:', text);
    showEventInChat(text);
  };
  
  const handleDragStart = (e) => {
    // 如果是标准事件，则不允许拖拽到聊天窗口
    if (isStandardEvent) {
      e.dataTransfer.effectAllowed = 'move'; // 只允许排序移动
      // 对于标准事件，不设置数据，以此来防止其被拖放到聊天窗口
    } else {
      e.dataTransfer.setData('text/plain', text);
      e.dataTransfer.effectAllowed = 'copy';
    }
    
    // 设置拖拽图像（可选）
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      e.dataTransfer.setDragImage(buttonRef.current, rect.width / 2, rect.height / 2);
      setIsDragging(true);
      buttonRef.current.classList.add(styles.dragging);
    }
  };
  
  const handleDragEnd = () => {
    if (buttonRef.current) {
      setIsDragging(false);
      buttonRef.current.classList.remove(styles.dragging);
    }
  };
  
  // 显示事件在聊天窗口的辅助函数
  const showEventInChat = (eventName) => {
    console.log('触发显示事件:', eventName);
    // 创建自定义事件
    const event = new CustomEvent('showEventInChat', { 
      detail: { eventName },
      bubbles: true, // 允许事件冒泡
      cancelable: true // 允许事件被取消
    });
    document.dispatchEvent(event);
    
    // 触发视觉效果
    // 可以在这里添加额外的动画或反馈
    if (buttonRef.current) {
      buttonRef.current.classList.add(styles.clicked);
      setTimeout(() => {
        buttonRef.current.classList.remove(styles.clicked);
      }, 300);
    }
  };
  
  return (
    <button 
      ref={buttonRef}
      className={`${styles.actionButton} ${isDragging ? styles.dragging : ''} ${isClicked ? styles.clicked : ''} ${isStandardEvent ? styles.standardEvent : ''}`}
      draggable="true"
      title={title || text}
      onClick={handleClick}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      {text}
    </button>
  );
};

export default ActionButton; 