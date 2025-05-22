import React from 'react';
import styles from '../styles/Bank.module.css';

const TagLabels = () => {
  // 标签数据，只包含颜色
  const tagColors = [
    '#FF6B6B', // 红色
    '#4ECDC4', // 青色
    '#FFD166', // 黄色
    '#6A0572', // 紫色
    '#1A936F', // 绿色
    '#3D5A80'  // 蓝色
  ];

  // 标签点击处理
  const handleTagClick = (index) => {
    console.log('标签点击:', index);
    // 可以根据标签索引执行不同的操作，如筛选事件
  };

  return (
    <div className={styles.tagLabelsContainer}>
      {tagColors.map((color, index) => (
        <div 
          key={index}
          className={styles.tagLabel}
          style={{ backgroundColor: color }}
          onClick={() => handleTagClick(index)}
          title={`标签 ${index + 1}`}
        />
      ))}
    </div>
  );
};

export default TagLabels; 