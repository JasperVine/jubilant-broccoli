import pkg from 'lodash';

const { merge } = pkg;

export default function (array: any[], key: string) {
  const result: Record<string, any> = {};
  array.forEach(item => {
    let target = item;
    if (result[item[key]]) {
      target = merge(result[item[key]], item);
      // Override defaultValue
      if (Object.prototype.hasOwnProperty.call(item, 'defaultValue')) {
        target.defaultValue = item.defaultValue;
      }
    }
    result[item[key]] = target;
  });
  return Object.keys(result).map(item => result[item]);
}
