import { useEffect, useRef } from 'react';

/**
 * 自定义 Hook，用于在组件中设置一个可动态调整间隔时间的定时器。
 * 该 Hook 确保回调函数始终引用最新的版本，避免闭包陷阱，
 * 并支持通过将 delay 设置为 null 来暂停定时器。
 *
 * @param callback - 每次间隔时间到达时需要执行的回调函数
 * @param delay - 定时器触发的间隔时间（毫秒）。如果为 null，则定时器会被清除（暂停）
 */
export function useInterval(callback: () => void, delay: number | null) {
  const savedCallback = useRef<() => void>(null);

  // 每次 callback 更新时，将其保存到 ref 中，以确保 tick 函数总是调用最新的 callback
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    function tick() {
      if (savedCallback.current) {
        savedCallback.current();
      }
    }
    // 根据 delay 的值设置或清除定时器
    // 当 delay 不为 null 时，创建一个新的 interval
    // 返回清理函数以在组件卸载或 delay 变化时清除之前的 interval
    if (delay !== null) {
      const id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
}