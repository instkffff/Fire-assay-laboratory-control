import { getValue } from '../sqlite/read.js'
import { windOutCalc } from '../tools/windCalc.js'
import { mqttPublish, reqWrite } from '../mqtt/mqtt.js'
import { msgMaker } from '../mqtt/msgMaker.js'

// 系统映射：k1-k4 -> System1, k5-k8 -> System2
const SYSTEM_CONFIG = [
    { kIndices: [1, 2, 3, 4], system: 'System1' },
    { kIndices: [5, 6, 7, 8], system: 'System2' },
]

// f1 对应 vfdOut（频率输出），f2 对应 vfdIn（频率输入）
const VFD_OUT_PAIRS = [
    { scada: 'Scada1', fTag: 'f1', tag: 'vfdOut1' },
    { scada: 'Scada2', fTag: 'f1', tag: 'vfdOut2' },
]

const VFD_IN_PAIRS = [
    { scada: 'Scada1', fTag: 'f2', tag: 'vfdIn1' },
    { scada: 'Scada2', fTag: 'f2', tag: 'vfdIn2' },
]

const setVfd = async (data) => {

    // 1. 数据校验与转换 - 允许 Switch/kset、f1、f2、Scada1-2/valve1-7 触发
    const isWindSetTrigger = data?.values?.windSet !== undefined
    const isKsetTrigger = data?.node === 'Switch' && data?.group === 'kset'
    const isF1Trigger = data?.values?.f1 !== undefined
    const isF2Trigger = data?.values?.f2 !== undefined
    const isScadaValveTrigger =
        (data?.node === 'System1' || data?.node === 'System2') &&
        data?.group &&
        ['valve1', 'valve2', 'valve3', 'valve4', 'valve5', 'valve6', 'valve7'].includes(data.group) &&
        (data?.values?.windH !== undefined || data?.values?.windL !== undefined)

    if (!isWindSetTrigger && !isF1Trigger && !isF2Trigger && !isScadaValveTrigger && !isKsetTrigger) {
        return
    }

    // 2. 获取 k 值
    const kValues = Array.from({ length: 8 }, (_, i) =>
        getValue('Switch', 'kset', `K${i + 1}`)
    )

    function WindSetValue() {
        let Valve1WindSet = getValue('System1', 'valve1', 'windSet')
        let Valve2WindSet = getValue('System1', 'valve2', 'windSet')
        let Valve3WindSet = getValue('System1', 'valve3', 'windSet')
        let Valve4WindSet = getValue('System1', 'valve4', 'windSet')
        let Valve5WindSet = getValue('System2', 'valve1', 'windSet')
        let Valve6WindSet = getValue('System2', 'valve2', 'windSet')
        let Valve7WindSet = getValue('System2', 'valve3', 'windSet')
        let Valve8WindSet = getValue('System2', 'valve4', 'windSet')
        let WindSetValues = [Valve1WindSet, Valve2WindSet, Valve3WindSet, Valve4WindSet, Valve5WindSet, Valve6WindSet, Valve7WindSet, Valve8WindSet]
        return WindSetValues
    }

    const WindSetValues = WindSetValue()

    // 3. 分别获取 VFD 输出频率(f1)和输入频率(f2)设定值
    const fOutValues = VFD_OUT_PAIRS.map(({ scada, fTag }) =>
        getValue(scada, 'vfd', fTag)
    )
    const fInValues = VFD_IN_PAIRS.map(({ scada, fTag }) =>
        getValue(scada, 'vfd', fTag)
    )

    // 4. 计算每个系统的总风量
    const windSums = SYSTEM_CONFIG.map(({ kIndices, system }) => {
        const sum = kIndices.reduce((sum, kIdx, arrIdx) => {
            const valveId = `valve${arrIdx + 1}`
            let key;

            if (kValues[kIdx - 1] === 1) {
                key = kValues[kIdx - 1] === 1 ? 'windH' : 'windL'
            } else {
                key = WindSetValues[kIdx - 1] === 2 ? 'windH' : 'windL'
            }

            return sum + (getValue(system, valveId, key) || 0)
        }, 0)
        // 加上 valve5, valve6, valve7 的 windL
        return sum + [5, 6, 7].reduce((s, v) => s + (getValue(system, `valve${v}`, 'windL') || 0), 0)
    })

    console.log('WindSum1:', windSums[0], 'WindSum2:', windSums[1])

    // 5. 计算 VFD 输出（out 使用 f1，in 使用 f2）
    const vfdOutResults = VFD_OUT_PAIRS.map(({ tag }, i) => ({
        tag,
        value: windOutCalc(fOutValues[i], windSums[i]),
    }))

    const vfdInResults = VFD_IN_PAIRS.map(({ tag }, i) => ({
        tag,
        value: windOutCalc(fInValues[i], windSums[i]),
    }))

    // 6. 直接使用计算结果，不再受 vfdInPower/vfdOutPower 条件控制
    const vfdIn1Value = vfdInResults[0].value
    const vfdIn2Value = vfdInResults[1].value
    const vfdOut1Value = vfdOutResults[0].value
    const vfdOut2Value = vfdOutResults[1].value

    // 7. 发送 MQTT 消息
    const messages = [
        { node: 'Switch', group: 'vfd', tag: vfdInResults[0].tag, value: vfdIn1Value },
        { node: 'Switch', group: 'vfd', tag: vfdOutResults[0].tag, value: vfdOut1Value },
        { node: 'Switch', group: 'vfd', tag: vfdInResults[1].tag, value: vfdIn2Value },
        { node: 'Switch', group: 'vfd', tag: vfdOutResults[1].tag, value: vfdOut2Value },
        { node: 'Scada1', group: 'system', tag: 'windNeed', value: windSums[0] },
        { node: 'Scada2', group: 'system', tag: 'windNeed', value: windSums[1] },
    ]

    messages.forEach((item) => {
        const message = msgMaker(item)
        mqttPublish(reqWrite, JSON.stringify(message))
    })

    return { windSum1: windSums[0], windSum2: windSums[1] }
}

export { setVfd }
