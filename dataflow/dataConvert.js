import { dataLink } from './dataflow.js';
import { nodeConvert } from './nodeConvert.js';

/**
 * 将接收到的原始数据转换为扁平化的标签数组
 * @param {Object} data 接收到的原始数据对象
 * @returns {Array} 转换后的数据数组
 */
function dataConvert(data) {
  const { node, group, values } = data;
  const result = [];

  // 遍历 values 对象中的所有 tag
  for (const tag in values) {
    if (Object.prototype.hasOwnProperty.call(values, tag)) {
      // 使用 nodeConvert 获取映射后的 node 和 group
      const converted = nodeConvert(dataLink, node, group, tag);
      
      // 如果 nodeConvert 返回 null，则忽略该 tag
      if (!converted) {
        continue;
      }
      
      result.push({
        node: converted.node,
        group: converted.group,
        tag: converted.tag,
        value: values[tag]
      });
    }
  }

  return result;
}


/* const data = {
  "node": "System2",
  "group": "valve6",
  "timestamp": 1786719373309,
  "values": {
    "windSet": 6,
    "windNeed": 600,
    "windReal": 600,
    "windH": 600,
    "windL": 600
  },
  "errors": {},
  "metas": {}
}

console.log(dataConvert(data));
 */

export { dataConvert }