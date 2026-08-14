import mqtt from "mqtt";
import { mqttBroker, reqWrite, respWrite, main } from '../config.js';
import { msgParser, respParser } from './parser.js';
import { uuidRemove } from '../tools/uuidPool.js';
import { updateDB } from './updataDB.js';
import { syncData } from './syncData.js';

// 使用闭包存储私有变量
let client = null;

// 内部处理函数
const handleMessage = (topic, message) => {
    const msgString = message.toString();
    // console.log(`Received message from ${topic}: ${msgString}`);

    if (topic === respWrite) {
        const status = respParser(msgString);
        try {
            const { uuid } = JSON.parse(msgString);
            uuidRemove(uuid);
            console.log(status === true ? '设置成功' : '设置失败', uuid);
        } catch (e) {
            console.error('解析响应消息失败:', e);
        }
    } else if (topic === main) {
        const data = msgParser(msgString);
        try {
            updateDB(data);
            syncData(data);
        } catch (e) {
            console.error('更新数据库失败:', e);
        }
        console.log('main', data);
    } else if (topic === reqWrite) {
        console.log('reqWrite', msgString);
    }
};

// 初始化函数
const initMqtt = () => {
    if (client) return client; // 避免重复初始化

    client = mqtt.connect(mqttBroker, {
        clientId: 'control',
        connectTimeout: 4000, // 设置超时时间，防止无限挂起
    });

    // 添加错误监听
    client.on('error', (err) => {
        console.error('MQTT Connection Error:', err);
    });

    client.on('reconnect', () => {
        console.log('Attempting to reconnect...');
    });

    client.on('connect', () => {
        console.log('Connected to MQTT broker');
        const topics = [reqWrite, respWrite, main]; 
        client.subscribe(topics, (err) => {
            if (!err) {
                console.log(`Successfully subscribed to topics: ${topics.join(', ')}`);
            } else {
                console.error('Subscription error:', err);
            }
        });
    });

    client.on('message', handleMessage);

    return client;
};

// 消息发布函数
const mqttPublish = (topic, message) => {
    if (!client) {
        throw new Error("MQTT Client not initialized. Please call initMqtt() first.");
    }
    client.publish(topic, message);
};

// 如果需要获取底层的 client 实例
const getMqttClient = () => client;

export {
    initMqtt,
    mqttPublish,
    getMqttClient,
    reqWrite
}