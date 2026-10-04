import { getValue } from '../sqlite/read.js'
import { mqttPublish, reqWrite } from '../mqtt/mqtt.js'
import { msgMaker } from '../mqtt/msgMaker.js'
import { VfdType } from '../config.js'

// 触发后直接搬运
// f1 到 vfdIn1 vfdOut1
// f2 到 vfdIn2 vfdOut2


// const VfdType = 'MA'

const clamp = (val, min, max) => {
    if (val === undefined || val === null) return min
    return Math.min(Math.max(val, min), max)
}

// HZ 类型换算：0 → 4000，50 → 20000（线性映射）
// MA 或缺省：不换算
const scaleValue = (val) => {
    if (VfdType === 'HZ') {
        return 4000 + (val / 50) * 16000
    }
    return val
}

const setVfdDirect = async (data) => {
    // 1. 数据校验 - 允许 f1、f2 触发
    const isF1Trigger = data?.values?.f1 !== undefined
    const isF2Trigger = data?.values?.f2 !== undefined

    if (!isF1Trigger && !isF2Trigger) {
        return
    }

    // 2. 获取 f1 和 f2 的值，换算并限制范围 [4000, 20000]
    const S1f1Value = clamp(scaleValue(getValue('Scada1', 'vfd', 'f1')), 4000, 20000)
    const S1f2Value = clamp(scaleValue(getValue('Scada1', 'vfd', 'f2')), 4000, 20000)
    const S2f1Value = clamp(scaleValue(getValue('Scada2', 'vfd', 'f1')), 4000, 20000)
    const S2f2Value = clamp(scaleValue(getValue('Scada2', 'vfd', 'f2')), 4000, 20000)

    // 3. 构造 MQTT 消息并发送
    const messages = [
        { node: 'Switch', group: 'vfd', tag: 'vfdIn1', value: S1f1Value },
        { node: 'Switch', group: 'vfd', tag: 'vfdOut1', value: S1f2Value },
        { node: 'Switch', group: 'vfd', tag: 'vfdIn2', value: S2f1Value },
        { node: 'Switch', group: 'vfd', tag: 'vfdOut2', value: S2f2Value },
    ]

    messages.forEach((item) => {
        const message = msgMaker(item)
        mqttPublish(reqWrite, JSON.stringify(message))
    })
        
    return { S1f1Value, S1f2Value, S2f1Value, S2f2Value }
}

export { setVfdDirect }