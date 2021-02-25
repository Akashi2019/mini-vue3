import { isArray, isIntegerKey, hasOwn, hasChanged } from './../../shared/src/index';
import { extend, isObject } from '@vue/shared';
import { track, trigger } from './effect';
import { TrackOpTypes, TriggerOrTypes } from './operators';
import { reactive, readonly } from './reactive';

function createGetter(isReadonly = false, shallow = false) {
  return function get(target, key, receiver) {
    const res = Reflect.get(target, key, receiver);
    if (!isReadonly) {
      //依赖收集
      track(target, TrackOpTypes.GET, key);
    }
    if (shallow) {
      return res;
    }
    if (isObject(res)) {
      return isReadonly ? readonly(res) : reactive(res);
    }
    return res;
  };
}
function createSetter(shallow = false) {
  return function set(target, key, value, receiver) {
    const oldValue = target[key];

    let hadKey = isArray(target) && isIntegerKey(key)
      ? Number(key) < target.length
      : hasOwn(target, key);
    const res = Reflect.set(target, key, value, receiver);

    if(!hadKey){
      trigger(target, TriggerOrTypes.ADD, key, value);
    }else if(hasChanged(oldValue, value)){
      trigger(target, TriggerOrTypes.SET, key, value, oldValue);
    }

    return res;
  };
}

const get = createGetter();
const shallowGet = createGetter(false, true);
const readonlyGet = createGetter(true);
const shallowReadonlyGet = createGetter(true, true);

const set = createSetter();
const shallowSet = createSetter(true);

export const mutableHandlers = {
  get,
  set
};

export const shallowReactiveHandlers = {
  get: shallowGet,
  set: shallowSet
};

let readonlyObj = {
  set: (target, key) => {
    console.log(`set object on key ${key} failed`);
  }
};

export const readonlyHandlers = extend(
  {
    get: readonlyGet
  },
  readonlyObj
);

export const shallowReadonlyHandlers = extend(
  {
    get: shallowReadonlyGet
  },
  readonlyObj
);
