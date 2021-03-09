import { ShapeFlags } from '@vue/shared';
import { createAppAPI } from './apiCreateApp';
import { createComponentInstance, setupComponent } from './component';

export function createRenderer(renderOptions) {
  const setupRenderEffect = () => {
    
  };

  const mountComponent = (initialVNode, container) => {
    const instance = (initialVNode.component = createComponentInstance(
      initialVNode
    ));
    setupComponent(instance);
    setupRenderEffect();
  };

  const processComponent = (n1, n2, container) => {
    if (n1 == null) {
      mountComponent(n2, container);
    } else {
    }
  };

  const patch = (n1, n2, container) => {
    const { shapeFlag } = n2;
    if (shapeFlag & ShapeFlags.ELEMENT) {
      console.log('元素');
    } else if (shapeFlag & ShapeFlags.STATEFUL_COMPONMENT) {
      processComponent(n1, n2, container);
    }
  };

  const render = (vnode, container) => {
    patch(null, vnode, container);
  };

  return {
    createApp: createAppAPI(render)
  };
}
