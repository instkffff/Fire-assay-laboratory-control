import { dataConvert } from '../dataflow/dataConvert.js';
import { msgMaker } from './msgMaker.js';

import { mqttPublish, reqWrite } from './mqtt.js';

/**
 * 同步数据函数
 * @param {any} data 输入原始数据
 */
const syncData = (data) => {
  // 1. 转换数据
  const convertedData = dataConvert(data);

  // 如果 dataConvert 输出空数组，就不继续下一步，直接返回
  if (!convertedData || convertedData.length === 0) {
    return;
  }

  // 2. 遍历转换后的数组，生成消息并发送
  convertedData.forEach(item => {
    const message = msgMaker(item);
    const json = JSON.stringify(message);
    mqttPublish(reqWrite, json);
  });
};

export { syncData }