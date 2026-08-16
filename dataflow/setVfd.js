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

// 延迟工具函数
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const setVfd = async (data) => {

    let S1vfdInPower = getValue('Scada1', 'system', 'vfdInPower')
    let S2vfdInPower = getValue('Scada2', 'system', 'vfdInPower')

    let S1vfdOutPower = getValue('Scada1', 'system', 'vfdOutPower')
    let S2vfdOutPower = getValue('Scada2', 'system', 'vfdOutPower')

    // 1. 数据校验与转换 - 允许 Switch/kset、vfdInPower、f1、f2、Scada1-2/valve1-7 触发
    const isKsetTrigger = data?.node === 'Switch' && data?.group === 'kset'
    const isVfdInPowerTrigger = data?.values?.vfdInPower !== undefined
    const isVfdOutPowerTrigger = data?.values?.vfdOutPower !== undefined
    const isF1Trigger = data?.values?.f1 !== undefined
    const isF2Trigger = data?.values?.f2 !== undefined
    const isScadaValveTrigger =
        (data?.node === 'System1' || data?.node === 'System2') &&
        data?.group &&
        ['valve1', 'valve2', 'valve3', 'valve4', 'valve5', 'valve6', 'valve7'].includes(data.group) &&
        (data?.values?.windH !== undefined || data?.values?.windL !== undefined)

    if (!isKsetTrigger && !isVfdInPowerTrigger && !isVfdOutPowerTrigger && !isF1Trigger && !isF2Trigger && !isScadaValveTrigger) {
        return
    }

    // 2. 获取 k 值
    const kValues = Array.from({ length: 8 }, (_, i) =>
        getValue('Switch', 'kset', `K${i + 1}`)
    )

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
            const key = kValues[kIdx - 1] === 1 ? 'windH' : 'windL'
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

    // 6. 根据 vfdInPower 条件控制 vfdIn 输出，根据 vfdOutPower 条件控制 vfdOut 输出
    const vfdIn1Value = S1vfdInPower === 1 ? vfdInResults[0].value : 0
    const vfdIn2Value = S2vfdInPower === 1 ? vfdInResults[1].value : 0
    const vfdOut1Value = S1vfdOutPower === 1 ? vfdOutResults[0].value : 0
    const vfdOut2Value = S2vfdOutPower === 1 ? vfdOutResults[1].value : 0

    // 7. 发送 MQTT 消息
    const messages = [
        { node: 'Switch', group: 'vfd', tag: vfdInResults[0].tag, value: vfdIn1Value },
        { node: 'Switch', group: 'vfd', tag: vfdOutResults[0].tag, value: vfdOut1Value },
        { node: 'Switch', group: 'vfd', tag: vfdInResults[1].tag, value: vfdIn2Value },
        { node: 'Switch', group: 'vfd', tag: vfdOutResults[1].tag, value: vfdOut2Value },
        { node: 'Scada1', group: 'system', tag: 'windNeed', value: windSums[0] },
        { node: 'Scada2', group: 'system', tag: 'windNeed', value: windSums[1] },
        { node: 'Scada1', group: 'system', tag: 'windInNeed', value: S1vfdInPower === 1 ? windSums[0] : 0 },
        { node: 'Scada2', group: 'system', tag: 'windInNeed', value: S2vfdInPower === 1 ? windSums[1] : 0 },
    ]

    messages.forEach((item) => {
        const message = msgMaker(item)
        mqttPublish(reqWrite, JSON.stringify(message))
    })

    return { windSum1: windSums[0], windSum2: windSums[1] }
}

export { setVfd }
