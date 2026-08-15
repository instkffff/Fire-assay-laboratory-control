import { getValue } from '../sqlite/read.js'
import { windOutCalc } from '../tools/windCalc.js'
import { mqttPublish, reqWrite } from '../mqtt/mqtt.js'
import { msgMaker } from '../mqtt/msgMaker.js'

// 系统映射：k1-k4 -> System1, k5-k8 -> System2
const SYSTEM_CONFIG = [
    { kIndices: [1, 2, 3, 4], system: 'System1' },
    { kIndices: [5, 6, 7, 8], system: 'System2' },
]

const VFD_SCADA_PAIRS = [
    { scada: 'Scada1', fTag: 'f1', outTag: 'vfdOut1', inTag: 'vfdIn1' },
    { scada: 'Scada2', fTag: 'f1', outTag: 'vfdOut2', inTag: 'vfdIn2' },
]

// 延迟工具函数
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const setVfd = async (data) => {

    let S1vfdInPower = getValue('Scada1', 'system', 'vfdInPower')
    let S2vfdInPower = getValue('Scada2', 'system', 'vfdInPower')

    // 1. 数据校验与转换 - 允许 Switch/kset、vfdInPower、f1、f2、Scada1-2/valve1-7 触发
    const isKsetTrigger = data?.node === 'Switch' && data?.group === 'kset'
    const isVfdInPowerTrigger = data?.values?.vfdInPower !== undefined
    const isF1Trigger = data?.values?.f1 !== undefined
    const isF2Trigger = data?.values?.f2 !== undefined
    const isScadaValveTrigger =
        (data?.node === 'Scada1' || data?.node === 'Scada2') &&
        data?.group &&
        ['valve1', 'valve2', 'valve3', 'valve4', 'valve5', 'valve6', 'valve7'].includes(data.group)

    if (!isKsetTrigger && !isVfdInPowerTrigger && !isF1Trigger && !isF2Trigger && !isScadaValveTrigger) {
        return
    }

    // 非 kset 触发时延迟 2 秒执行
    if (!isKsetTrigger) {
        await delay(2000)
    }

    // 2. 获取 k 值
    const kValues = Array.from({ length: 8 }, (_, i) =>
        getValue('Switch', 'kset', `K${i + 1}`)
    )

    // 3. 获取 VFD 频率设定值
    const fValues = VFD_SCADA_PAIRS.map(({ scada, fTag }) =>
        getValue(scada, 'vfd', fTag)
    )

    // 4. 计算每个系统的总风量
    const windSums = SYSTEM_CONFIG.map(({ kIndices, system }) => {
        const sum = kIndices.reduce((sum, kIdx, arrIdx) => {
            const valveId = `valve${arrIdx + 1}`
            const key = kValues[kIdx - 1] === 1 ? 'windH' : 'windL'
            return sum + (parseFloat(getValue(system, valveId, key)) || 0)
        }, 0)
        // 加上 valve5, valve6, valve7 的 windL
        return sum + [5, 6, 7].reduce((s, v) => s + (parseFloat(getValue(system, `valve${v}`, 'windL')) || 0), 0)
    })

    console.log('WindSum1:', windSums[0], 'WindSum2:', windSums[1])

    // 5. 计算 VFD 输出
    const vfdResults = VFD_SCADA_PAIRS.map(({ outTag, inTag }, i) => {
        const f = fValues[i]
        const wind = windSums[i]
        return {
            out: { tag: outTag, value: windOutCalc(f, wind) },
            in: { tag: inTag, value: windOutCalc(f, wind) },
        }
    })

    // 6. 根据 vfdInPower 条件控制 vfdIn 输出
    // S1vfdInPower=0 -> vfdIn1=0; S1vfdInPower=1 -> vfdIn1=计算值
    // S2vfdInPower=0 -> vfdIn2=0; S2vfdInPower=1 -> vfdIn2=计算值
    const vfdIn1Value = S1vfdInPower === 1 ? vfdResults[0].in.value : 0
    const vfdIn2Value = S2vfdInPower === 1 ? vfdResults[1].in.value : 0

    // 7. 发送 MQTT 消息
    const messages = [
        { node: 'Switch', group: 'vfd', tag: vfdResults[0].in.tag, value: vfdIn1Value },
        { node: 'Switch', group: 'vfd', tag: vfdResults[0].out.tag, value: vfdResults[0].out.value },
        { node: 'Switch', group: 'vfd', tag: vfdResults[1].in.tag, value: vfdIn2Value },
        { node: 'Switch', group: 'vfd', tag: vfdResults[1].out.tag, value: vfdResults[1].out.value },
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
