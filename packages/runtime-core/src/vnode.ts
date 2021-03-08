import { isString } from '@vue/shared';

export const createVNode = (type, props, children = null) => {
  const shapeFlag = isString(type);

  const vnode = {
    __v_isVnode: true,
    type,
    props,
    children,
    el: null,
    key: props && props.key,
    shapeFlag
  };

  return vnode;
};
