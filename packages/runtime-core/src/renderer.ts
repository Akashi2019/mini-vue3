import { effect } from '@vue/reactivity';
import { ShapeFlags } from '@vue/shared';
import { createAppAPI } from './apiCreateApp';
import { createComponentInstance, setupComponent } from './component';
import { queueJob } from './scheduler';
import { normalizeVNode, Text } from './vnode';

export function createRenderer(renderOptions) {
  const {
    insert: hostInsert,
    remove: hostRemove,
    patchProp: hostPatchProp,
    createElement: hostCreateElement,
    createText: hostCreateText,
    createComment: hostCreateComment,
    setText: hostSetText,
    setElementText: hostSetElementText
  } = renderOptions;

  const setupRenderEffect = (instance, container) => {
    instance.update = effect(
      function componentEffect() {
        if (!instance.isMounted) {
          let proxyToUse = instance.proxy;
          let subTree = (instance.subTree = instance.render.call(
            proxyToUse,
            proxyToUse
          ));
          patch(null, subTree, container);
          instance.isMounted = true;
        } else {
          console.log('update');
        }
      },
      {
        scheduler: queueJob
      }
    );
  };

  const mountComponent = (initialVNode, container) => {
    const instance = (initialVNode.component = createComponentInstance(
      initialVNode
    ));
    setupComponent(instance);
    setupRenderEffect(instance, container);
  };

  const processComponent = (n1, n2, container) => {
    if (n1 == null) {
      mountComponent(n2, container);
    } else {
    }
  };

  const mountChildren = (children, container) => {
    for (let i = 0; i < children.length; i++) {
      const child = normalizeVNode(children[i]);
      patch(null, child, container);
    }
  };

  const mountElement = (vnode, container) => {
    const { props, shapeFlag, type, children } = vnode;
    let el = (vnode.el = hostCreateElement(type));

    if (props) {
      for (const key in props) {
        hostPatchProp(el, key, null, props[key]);
      }
    }

    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      hostSetElementText(el, children);
    } else if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
      mountChildren(children, el);
    }

    hostInsert(el, container);
  };

  const processElement = (n1, n2, container) => {
    if (n1 == null) {
      mountElement(n2, container);
    } else {
    }
  };

  const processText = (n1, n2, container) => {
    if (n1 == null) {
      hostInsert(hostCreateText(n2.children), container);
    }
  };

  const patch = (n1, n2, container) => {
    const { shapeFlag, type } = n2;

    switch (type) {
      case Text:
        processText(n1, n2, container);
        break;

      default:
        break;
    }
    if (shapeFlag & ShapeFlags.ELEMENT) {
      processElement(n1, n2, container);
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
