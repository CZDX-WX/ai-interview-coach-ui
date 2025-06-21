import type { Directive, DirectiveBinding } from 'vue';

interface HTMLElementWithClickOutsideEvent extends HTMLElement {
    _clickOutside?: (event: MouseEvent) => void;
}

export const vOnClickOutside: Directive = {
    mounted(el: HTMLElementWithClickOutsideEvent, binding: DirectiveBinding) {
        el._clickOutside = (event: MouseEvent) => {
            // 检查点击事件的目标是否在元素el内部
            if (!(el === event.target || el.contains(event.target as Node))) {
                // 如果不在内部，则调用指令绑定的函数
                binding.value(event);
            }
        };
        // 在 document 上添加事件监听器
        document.addEventListener('click', el._clickOutside);
    },
    unmounted(el: HTMLElementWithClickOutsideEvent) {
        // 组件卸载时，移除事件监听器
        if (el._clickOutside) {
            document.removeEventListener('click', el._clickOutside);
            delete el._clickOutside;
        }
    }
};