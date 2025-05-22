import React, { useEffect } from 'react';
import Sortable from 'sortablejs';
import styles from '../styles/Bank.module.css';
import Header from './Header';
import ChatSection from './ChatSection';
import EventsSection from './EventsSection';
import StandardEventsSection from './StandardEventsSection';

const BankManagementSystem = () => {
  // 初始化拖拽功能
  useEffect(() => {
    // 直接使用DOM ID来选择按钮容器，而不是CSS类名
    const buttonContainers = [
      document.getElementById('personalEvents'),
      document.getElementById('bankEvents'),
      document.getElementById('standardEvents')
    ].filter(container => container !== null);
    
    const sortableInstances = [];

    buttonContainers.forEach(container => {
      const sortableInstance = new Sortable(container, {
        group: {
          name: 'shared',
          pull: 'clone',
          put: true
        },
        animation: 150,
        ghostClass: styles.dragging,
        chosenClass: styles.chosen,
        dragClass: styles.dragging,
        onStart: function(evt) {
          evt.item.classList.add(styles.dragging);
          
          // 添加拖拽开始的视觉反馈
          document.body.classList.add('dragging-active');
          
          // 让聊天区域高亮显示，表示可以拖放
          const chatContainer = document.getElementById('chatContainer');
          if (chatContainer) {
            chatContainer.classList.add(styles.dragOver);
          }
        },
        onEnd: function(evt) {
          evt.item.classList.remove(styles.dragging);
          
          // 移除拖拽结束的视觉反馈
          document.body.classList.remove('dragging-active');
          
          // 移除聊天区域高亮
          const chatContainer = document.getElementById('chatContainer');
          if (chatContainer) {
            chatContainer.classList.remove(styles.dragOver);
          }
          
          // 保存新的按钮位置到本地存储
          saveButtonPositions();
        }
      });
      sortableInstances.push(sortableInstance);
    });

    // 从本地存储恢复按钮位置
    restoreButtonPositions();

    return () => {
      // 组件卸载时清理
      sortableInstances.forEach(instance => {
        instance.destroy();
      });
    };
  }, []);

  // 保存按钮位置到本地存储
  const saveButtonPositions = () => {
    try {
      const positions = {
        personalEvents: Array.from(document.getElementById('personalEvents')?.children || [])
          .map(item => item.querySelector(`.${styles.actionButton}`)?.textContent || ''),
        bankEvents: Array.from(document.getElementById('bankEvents')?.children || [])
          .map(item => item.querySelector(`.${styles.actionButton}`)?.textContent || ''),
        standardEvents: Array.from(document.getElementById('standardEvents')?.children || [])
          .map(item => item.querySelector(`.${styles.actionButton}`)?.textContent || '')
      };
      
      // 过滤掉空字符串
      Object.keys(positions).forEach(key => {
        positions[key] = positions[key].filter(text => text.trim() !== '');
      });
      
      localStorage.setItem('buttonPositions', JSON.stringify(positions));
    } catch (error) {
      console.error('保存按钮位置失败:', error);
    }
  };

  // 从本地存储恢复按钮位置
  const restoreButtonPositions = () => {
    try {
      const savedPositions = localStorage.getItem('buttonPositions');
      if (savedPositions) {
        const positions = JSON.parse(savedPositions);
        Object.keys(positions).forEach(containerId => {
          const container = document.getElementById(containerId);
          if (container) {
            const buttons = positions[containerId];
            buttons.forEach(buttonText => {
              const existingItem = Array.from(container.children)
                .find(item => {
                  const button = item.querySelector(`.${styles.actionButton}`);
                  return button && button.textContent === buttonText;
                });
                
              if (existingItem) {
                container.appendChild(existingItem);
              }
            });
          }
        });
      }
    } catch (error) {
      console.error('恢复按钮位置失败:', error);
    }
  };

  return (
    <div className={styles.bankApp}>
      <Header />
      <div className={styles.container}>
        <div className={styles.mainContent}>
          <ChatSection />
          <EventsSection />
          <StandardEventsSection />
        </div>
      </div>
    </div>
  );
};

export default BankManagementSystem; 