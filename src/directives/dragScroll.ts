import type { Directive } from 'vue';

interface DragScrollState {
    isDown: boolean;
    startX: number;
    scrollLeft: number;
}

export const vDragScroll: Directive<HTMLElement, any> = {
    mounted(el: HTMLElement) {
        const state: DragScrollState = {
            isDown: false,
            startX: 0,
            scrollLeft: 0,
        };

        el.addEventListener('mousedown', (e: MouseEvent) => {
            // 确保点击的不是按钮等可交互元素
            if (e.target instanceof HTMLButtonElement || e.target instanceof HTMLAnchorElement) {
                return;
            }
            state.isDown = true;
            el.classList.add('is-grabbing');
            state.startX = e.pageX - el.offsetLeft;
            state.scrollLeft = el.scrollLeft;
        });

        const stopDrag = () => {
            state.isDown = false;
            el.classList.remove('is-grabbing');
        };

        el.addEventListener('mouseleave', stopDrag);
        el.addEventListener('mouseup', stopDrag);

        el.addEventListener('mousemove', (e: MouseEvent) => {
            if (!state.isDown) return;
            e.preventDefault();
            const x = e.pageX - el.offsetLeft;
            const walk = (x - state.startX) * 2; // *2 可以增加拖动速度
            el.scrollLeft = state.scrollLeft - walk;
        });
    },
    // 如果需要，可以在 unmounted 时移除监听器，但通常组件销毁时会自动处理
};