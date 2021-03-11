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
    setElementText: hostSetElementText,
    nextSibling: hostNextSibling
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
          const prevTree = instance.subTree;
          let proxyToUse = instance.proxy;
          const nextTree = instance.render.call(proxyToUse, proxyToUse);

          patch(prevTree, nextTree, container);
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

  const mountElement = (vnode, container, anchor) => {
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

    hostInsert(el, container, anchor);
  };

  const patchProps = (oldProps, newProps, el) => {
    if (oldProps !== newProps) {
      for (const key in newProps) {
        const prev = oldProps[key];
        const next = newProps[key];
        if (prev !== next) {
          hostPatchProp(el, key, prev, next);
        }
      }

      for (const key in oldProps) {
        if (!(key in newProps)) {
          hostPatchProp(el, key, oldProps[key], null);
        }
      }
    }
  };

  const unmountChildren = (children) => {
    for (let i = 0; i < children.length; i++) {
      unmount(children[i]);
    }
  };

  const patchKeyedChildren = (c1, c2, el) => {
    let i = 0;
    let e1 = c1.length - 1;
    let e2 = c2.length - 1;
    while (i <= e1 && i <= e2) {
      const n1 = c1[i];
      const n2 = c2[i];
      if (isSameVNodeType(n1, n2)) {
        patch(n1, n2, el);
      } else {
        break;
      }
      i++;
    }

    while (i <= e1 && i <= e2) {
      const n1 = c1[e1];
      const n2 = c2[e2];
      if (isSameVNodeType(n1, n2)) {
        patch(n1, n2, el);
      } else {
        break;
      }
      e1--;
      e2--;
    }

    if (i > e1) {
      if (i <= e2) {
        while (i <= e2) {
          const nextPos = e2 + 1;
          const anchor = nextPos < c2.length ? c2[nextPos].el : null;
          patch(null, c2[i], el, anchor);
          i++;
        }
      }
    } else if (i > e2) {
      while (i <= e1) {
        unmount(c1[i]);
        i++;
      }
    } else {
      let s1 = i;
      let s2 = i;

      const keyToNewIndexMap = new Map();

      for (let i = s2; i <= e2; i++) {
        const childVNode = c2[i];
        keyToNewIndexMap.set(childVNode.key, i);
      }

      const toBePatched = e2 - s2 + 1;
      const newIndexToOldIndexMap = new Array(toBePatched).fill(0);

      for (let i = s1; i <= e1; i++) {
        const oldVnode = c1[i];
        let newIndex = keyToNewIndexMap.get(oldVnode.key);
        if (newIndex === undefined) {
          unmount(oldVnode);
        } else {
          newIndexToOldIndexMap[newIndex - s2] = i + 1;
          patch(oldVnode, c2[newIndex], el);
        }
      }

      for (let i = toBePatched - 1; i >= 0; i--) {
        let currentIndex = i + s2;
        const child = c2[currentIndex];
        let anchor =
          currentIndex + 1 < c2.length ? c2[currentIndex + 1].el : null;
        if (newIndexToOldIndexMap[i] === 0) {
          patch(null, child, el, anchor);
        } else {
          hostInsert(child.el, el, anchor);
        }
      }
    }
  };

  const patchChildren = (n1, n2, el) => {
    const c1 = n1.children;
    const c2 = n2.children;

    const prevShapeFlag = n1.shapeFlag;
    const shapeFlag = n2.shapeFlag;
    if (shapeFlag & ShapeFlags.TEXT_CHILDREN) {
      if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        unmountChildren(c1);
      }

      if (c2 !== c1) {
        hostSetElementText(el, c2);
      }
    } else {
      if (prevShapeFlag & ShapeFlags.ARRAY_CHILDREN) {
        if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
          patchKeyedChildren(c1, c2, el);
        } else {
          unmountChildren(c1);
        }
      } else {
        if (prevShapeFlag & ShapeFlags.TEXT_CHILDREN) {
          hostSetElementText(el, '');
        }

        if (shapeFlag & ShapeFlags.ARRAY_CHILDREN) {
          mountChildren(c2, el);
        }
      }
    }
  };

  const patchElement = (n1, n2, container) => {
    let el = (n2.el = n1.el);
    const oldProps = n1.props || {};
    const newProps = n2.props || {};

    patchProps(oldProps, newProps, el);

    patchChildren(n1, n2, el);
  };

  const processElement = (n1, n2, container, anchor) => {
    if (n1 == null) {
      mountElement(n2, container, anchor);
    } else {
      patchElement(n1, n2, container);
    }
  };

  const processText = (n1, n2, container) => {
    if (n1 == null) {
      hostInsert(hostCreateText(n2.children), container);
    }
  };

  const isSameVNodeType = (n1, n2) => {
    return n1.type === n2.type && n1.key === n2.key;
  };

  const unmount = (n1) => {
    hostRemove(n1.el);
  };

  const patch = (n1, n2, container, anchor = null) => {
    const { shapeFlag, type } = n2;

    if (n1 && !isSameVNodeType(n1, n2)) {
      anchor = hostNextSibling(n1.el);
      unmount(n1);
      n1 = null;
    }

    switch (type) {
      case Text:
        processText(n1, n2, container);
        break;

      default:
        break;
    }
    if (shapeFlag & ShapeFlags.ELEMENT) {
      processElement(n1, n2, container, anchor);
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
