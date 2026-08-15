import { mqttPublish, reqWrite } from '../mqtt/mqtt.js';
import { msgMaker } from '../mqtt/msgMaker.js';

const settingPair = {
    'k1': ['System1', 'valve1', 'windSet'],
    'k2': ['System1', 'valve2', 'windSet'],
    'k3': ['System1', 'valve3', 'windSet'],
    'k4': ['System1', 'valve4', 'windSet'],
    'k5': ['System2', 'valve1', 'windSet'],
    'k6': ['System2', 'valve2', 'windSet'],
    'k7': ['System2', 'valve3', 'windSet'],
    'k8': ['System2', 'valve4', 'windSet'],
}

/**
 * 处理阀门设置逻辑并发送数据
 * 参考 syncData.js 的流程：转换 -> 遍历 -> 发送
 * @param {Object} data 输入的原始数据
 */
const setValve = (data) => {
    // 1. 数据校验与转换
    if (data?.node !== 'Switch' || data?.group !== 'kset') {
        return;
    }

    const convertedData = [];
    const values = data.values || {};

    for (const [key, config] of Object.entries(settingPair)) {
        const val = values[key.toUpperCase()];
        if (val === undefined) continue;

        // 逻辑转换：1 -> 2, 0 -> 1
        const targetValue = val === 1 ? 2 : (val === 0 ? 1 : null);

        if (targetValue !== null) {
            const [node, group, tag] = config;
            convertedData.push({
                node: node,
                group: group,
                tag: tag,
                value: targetValue
            });
        }
    }

    // 2. 如果转换后没有有效数据，直接返回
    if (convertedData.length === 0) {
        return;
    }

    // 3. 遍历转换后的数组，生成消息并发送 (参考 syncData.js)
    convertedData.forEach(item => {
        const message = msgMaker(item);
        const json = JSON.stringify(message);
        mqttPublish(reqWrite, json);
    });
};

export { setValve };