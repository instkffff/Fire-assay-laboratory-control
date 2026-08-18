const mqttBroker = 'mqtt://192.168.50.100:1883';

const reqWrite = '/neuron/system/write/req';

const respWrite = '/neuron/system/write/resp';

const main = '/neuron/system';

const System1 = {
    valve1: ['windSet', 'windNeed', 'windReal', 'windL', 'windH'],
    valve2: ['windSet', 'windNeed', 'windReal', 'windL', 'windH'],
    valve3: ['windSet', 'windNeed', 'windReal', 'windL', 'windH'],
    valve4: ['windSet', 'windNeed', 'windReal', 'windL', 'windH'],
    valve5: ['windSet', 'windNeed', 'windReal', 'windL', 'windH'],
    valve6: ['windSet', 'windNeed', 'windReal', 'windL', 'windH'],
    valve7: ['windSet', 'windNeed', 'windReal', 'windL', 'windH'],
    heater: ['tempPV', 'tempSV', 'on_off']
}

const System2 = {
    valve1: ['windSet', 'windNeed', 'windReal', 'windL', 'windH'],
    valve2: ['windSet', 'windNeed', 'windReal', 'windL', 'windH'],
    valve3: ['windSet', 'windNeed', 'windReal', 'windL', 'windH'],
    valve4: ['windSet', 'windNeed', 'windReal', 'windL', 'windH'],
    valve5: ['windSet', 'windNeed', 'windReal', 'windL', 'windH'],
    valve6: ['windSet', 'windNeed', 'windReal', 'windL', 'windH'],
    valve7: ['windSet', 'windNeed', 'windReal', 'windL', 'windH'],
    heater: ['tempPV', 'tempSV', 'on_off']
}

const Switch = {
    kset: ['K1', 'K2', 'K3', 'K4', 'K5', 'K6', 'K7', 'K8'],
    vfd: ['vfdIn1', 'vfdOut1', 'vfdIn2', 'vfdOut2']
}

const Scada1 = {
    valve1: ['windNeed', 'windReal', 'windL', 'windH'],
    valve2: ['windNeed', 'windReal', 'windL', 'windH'],
    valve3: ['windNeed', 'windReal', 'windL', 'windH'],
    valve4: ['windNeed', 'windReal', 'windL', 'windH'],
    valve5: ['windNeed', 'windReal', 'windL', 'windH'],
    valve6: ['windNeed', 'windReal', 'windL', 'windH'],
    valve7: ['windNeed', 'windReal', 'windL', 'windH'],
    kset: ['K1', 'K2', 'K3', 'K4'],
    system: ['windNeed', 'windReal', 'windInNeed', 'tempPV', 'tempSV', 'on_off', 'vfdInPower', 'vfdOutPower'],
    vfd: ['f1', 'f2']
}

const Scada2 = {
    valve1: ['windNeed', 'windReal', 'windL', 'windH'],
    valve2: ['windNeed', 'windReal', 'windL', 'windH'],
    valve3: ['windNeed', 'windReal', 'windL', 'windH'],
    valve4: ['windNeed', 'windReal', 'windL', 'windH'],
    valve5: ['windNeed', 'windReal', 'windL', 'windH'],
    valve6: ['windNeed', 'windReal', 'windL', 'windH'],
    valve7: ['windNeed', 'windReal', 'windL', 'windH'],
    kset: ['K1', 'K2', 'K3', 'K4'],
    system: ['windNeed', 'windReal', 'windInNeed', 'tempPV', 'tempSV', 'on_off', 'vfdInPower', 'vfdOutPower'],
    vfd: ['f1', 'f2']
}

export { System1, System2, Switch, Scada1, Scada2, mqttBroker, reqWrite, respWrite, main }