import React, { useRef, useEffect } from 'react';
import styles from '../styles/Bank.module.css';

const ActionButton = ({ text, eventType = "personal", onClick }) => {
  const buttonRef = useRef(null);
  
  useEffect(() => {
    const button = buttonRef.current;
    if (!button) return;
    
    let isDragging = false;
    let originalX, originalY;
    let buttonClone = null;
    
    // 按钮的拖拽开始事件
    const handleDragStart = (e) => {
      isDragging = true;
      
      // 记录原始位置
      const rect = button.getBoundingClientRect();
      originalX = rect.left;
      originalY = rect.top;
      
      // 创建克隆元素用于拖拽显示
      buttonClone = button.cloneNode(true);
      buttonClone.style.position = 'absolute';
      buttonClone.style.left = originalX + 'px';
      buttonClone.style.top = originalY + 'px';
      buttonClone.style.width = rect.width + 'px';
      buttonClone.style.pointerEvents = 'none';
      buttonClone.style.zIndex = '1000';
      buttonClone.classList.add(styles.dragging);
      document.body.appendChild(buttonClone);
      
      // 设置拖拽数据
      e.dataTransfer.setData('text/plain', text);
      e.dataTransfer.setData('application/eventType', eventType);
      
      // 设置拖拽效果和图像
      e.dataTransfer.effectAllowed = 'copy';
      
      // 隐藏默认拖拽图像
      const img = new Image();
      img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'; // 透明图像
      e.dataTransfer.setDragImage(img, 0, 0);
      
      // 添加全局 class 用于 CSS 样式
      document.body.classList.add('dragging-active');
      
      button.classList.add(styles.chosen);
    };
    
    // 按钮的拖拽进行中事件
    const handleDrag = (e) => {
      if (!isDragging || !buttonClone) return;
      
      // 更新克隆元素位置
      if (e.clientX > 0 && e.clientY > 0) { // 有效的坐标
        buttonClone.style.left = (e.clientX - buttonClone.offsetWidth / 2) + 'px';
        buttonClone.style.top = (e.clientY - buttonClone.offsetHeight / 2) + 'px';
      }
    };
    
    // 按钮的拖拽结束事件
    const handleDragEnd = () => {
      isDragging = false;
      
      // 移除克隆元素
      if (buttonClone) {
        document.body.removeChild(buttonClone);
        buttonClone = null;
      }
      
      // 移除全局 class
      document.body.classList.remove('dragging-active');
      
      button.classList.remove(styles.chosen);
    };
    
    // 点击事件（用于非拖拽情况）
    const handleClick = () => {
      if (typeof onClick === 'function') {
        onClick(text, eventType);
      } else {
        // 默认行为：将事件信息发送到 chat 区域
        const chatEvent = new CustomEvent('addToChatEvent', {
          detail: { text, eventType }
        });
        document.dispatchEvent(chatEvent);
      }
    };
    
    // 添加事件监听器
    button.addEventListener('dragstart', handleDragStart);
    button.addEventListener('drag', handleDrag);
    button.addEventListener('dragend', handleDragEnd);
    button.addEventListener('click', handleClick);
    
    // 清理函数
    return () => {
      button.removeEventListener('dragstart', handleDragStart);
      button.removeEventListener('drag', handleDrag);
      button.removeEventListener('dragend', handleDragEnd);
      button.removeEventListener('click', handleClick);
      
      if (buttonClone && document.body.contains(buttonClone)) {
        document.body.removeChild(buttonClone);
      }
    };
  }, [text, eventType, onClick]);
  
  return (
    <div 
      ref={buttonRef}
      className={styles.actionButton}
      draggable="true"
      data-event-type={eventType}
      data-event-text={text}
    >
      {text}
    </div>
  );
};

export default ActionButton; 