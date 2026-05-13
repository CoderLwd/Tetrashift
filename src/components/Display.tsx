import React from 'react';
import { BLOCK_SIZE, TETROMINOS } from '../constants';
import { Shape } from '../types';

/**
 * 属性接口，用于定义通用显示组件的输入参数
 */
interface DisplayProps {
  label: string;
  value: string | number;
}

/**
 * 通用数据显示组件
 * 用于以统一的样式展示标签和对应的数值或文本内容
 * 
 * @param props - 组件属性对象
 * @param props.label - 显示在数值上方的标签文本
 * @param props.value - 需要显示的具体值，支持字符串或数字类型
 * @returns React元素，包含格式化后的标签和数值显示
 */
export const Display: React.FC<DisplayProps> = ({ label, value }) => (
  <div className="flex flex-col mb-8">
    <span className="text-[10px] uppercase font-bold tracking-[0.3em] opacity-40 mb-2">
      {label}
    </span>
    <span className="text-5xl md:text-6xl font-black italic tracking-tighter">
      {typeof value === 'number' ? value.toString().padStart(5, '0') : value}
    </span>
  </div>
);

/**
 * 属性接口，用于定义下一个方块预览组件的输入参数
 */
interface NextPieceProps {
  piece: Shape;
  showLabel?: boolean;
}

/**
 * 下一个方块预览组件
 * 用于在游戏界面中展示即将出现的俄罗斯方块形状
 * 
 * @param props - 组件属性对象
 * @param props.piece - 下一个方块的形状数据，二维数组表示
 * @param props.showLabel - 是否显示"Coming Up"标签，默认为true
 * @returns React元素，包含可选标签和方块形状的可视化预览
 */
export const NextPiece: React.FC<NextPieceProps> = ({ piece, showLabel = true }) => {
  return (
    <div className={`flex flex-col ${showLabel ? 'mb-12' : ''}`}>
      {showLabel && (
        <span className="text-[10px] uppercase font-bold tracking-[0.3em] opacity-40 mb-6">
          Coming Up
        </span>
      )}
      {/* 方块预览容器，固定尺寸并居中显示 */}
      <div className="w-32 h-32 border-4 border-black bg-white flex items-center justify-center self-start">
        {/* 使用网格布局渲染4x4的方块矩阵 */}
        <div className="grid grid-cols-4 grid-rows-4 gap-0.5" style={{ width: BLOCK_SIZE * 2, height: BLOCK_SIZE * 2 }}>
          {piece.map((row, y) =>
            row.map((value, x) => {
              const type = value as keyof typeof TETROMINOS;
              return (
                <div
                  key={`${x}-${y}`}
                  className="w-full h-full"
                  style={{
                    backgroundColor: value !== 0 ? TETROMINOS[type].color : 'transparent',
                    border: value !== 0 ? '2px solid black' : 'none',
                  }}
                />
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};