import mqtt from "mqtt";
import { mqttBroker, reqWrite, respWrite, main } from '../config.js';
import { msgParser, respParser } from './parser.js';
import { uuidRemove } from '../tools/uuidPool.js';
import { updateDB } from './updataDB.js';
import { syncData } from './syncData.js';

let client = null;

// ---- 子逻辑：处理 respWrite 消息 ----
const handleRespWrite = (msgString) => {
    const status = respParser(msgString);
    try {
        const { uuid } = JSON.parse(msgString);
        uuidRemove(uuid);
        console.log(status === true ? '设置成功' : '设置失败', uuid);
    } catch (e) {
        console.error('解析响应消息失败:', e);
    }
};

// ---- 子逻辑：处理 main 消息 ----
const handleMain = (msgString) => {
    const data = msgParser(msgString);
    try {
        updateDB(data);
        syncData(data);
    } catch (e) {
        console.error('更新数据库失败:', e);
    }
    console.log('main', data);
};

// ---- 子逻辑：处理 reqWrite 消息 ----
const handleReqWrite = (msgString) => {
    console.log('reqWrite', msgString);
};

// ---- 子逻辑：消息路由 ----
const routeMessage = (topic, message) => {
    const msgString = message.toString();
    switch (topic) {
        case respWrite:
            handleRespWrite(msgString);
            break;
        case main:
            handleMain(msgString);
            break;
        case reqWrite:
            handleReqWrite(msgString);
            break;
        default:
            console.warn(`未匹配的 topic: ${topic}`);
    }
};

// ---- 子逻辑：绑定事件监听 ----
const bindEvents = () => {
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

    client.on('message', routeMessage);
};

// ---- 初始化函数 ----
const initMqtt = () => {
    if (client) return client;

    client = mqtt.connect(mqttBroker, {
        clientId: 'control',
        connectTimeout: 4000,
    });

    bindEvents();

    return client;
};

// ---- 消息发布函数 ----
const mqttPublish = (topic, message) => {
    if (!client) {
        throw new Error("MQTT Client not initialized. Please call initMqtt() first.");
    }
    client.publish(topic, message);
};

// ---- 获取底层 client 实例 ----
const getMqttClient = () => client;

export {
    initMqtt,
    mqttPublish,
    getMqttClient,
    reqWrite
};