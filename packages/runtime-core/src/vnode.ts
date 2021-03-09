import { isArray } from './../../shared/src/index';
import { isString, ShapeFlags, isObject } from '@vue/shared';

export function isVnode(vnode) {
  return vnode.__v_isVnode;
}

export const createVNode = (type, props, children = null) => {
  const shapeFlag = isString(type)
    ? ShapeFlags.ELEMENT
    : isObject(type)
    ? ShapeFlags.STATEFUL_COMPONMENT
    : 0;

  const vnode = {
    __v_isVnode: true,
    type,
    props,
    children,
    component: null,
    el: null,
    key: props && props.key,
    shapeFlag
  };

  normalizeChildren(vnode, children);
  return vnode;
};

function normalizeChildren(vnode, children) {
  let type = 0;
  if (children == null) {
  } else if (isArray(children)) {
    type = ShapeFlags.ARRAY_CHILDREN;
  } else {
    type = ShapeFlags.TEXT_CHILDREN;
  }

  vnode.shapeFlag |= type;
}

export const Text = Symbol('Text');
export function normalizeVNode(child) {
  if (isObject(child)) return child;
  return createVNode(Text, null, String(child));
}
