const dataLink = {
    1 : 
    [
        [
            ['System1', 'System2'], 
            ['valve1', 'valve2', 'valve3', 'valve4', 'valve5', 'valve6', 'valve7'],
            ['windNeed', 'windReal']
        ],
        [
            ['Scada1', 'Scada2'], 
            ['valve1', 'valve2', 'valve3', 'valve4', 'valve5', 'valve6', 'valve7'],
            ['windNeed', 'windReal']
        ]
    ],
    2 : 
    [
        [
            ['Scada1', 'Scada2'], 
            ['valve1', 'valve2', 'valve3', 'valve4', 'valve5', 'valve6', 'valve7'],
            ['windL', 'windH']
        ],
        [
            ['System1', 'System2'], 
            ['valve1', 'valve2', 'valve3', 'valve4', 'valve5', 'valve6', 'valve7'],
            ['windL', 'windH']
        ]
    ],
    3 : 
    [
        [
            ['System1', 'System2'], 
            ['heater'],
            ['tempPV']
        ],
        [
            ['Scada1', 'Scada2'], 
            ['system'],
            ['tempPV']
        ]
    ],
    4 : 
    [
        [
            ['Scada1', 'Scada2'], 
            ['system'],
            ['tempSV', 'on_off']
        ],
        [
            ['System1', 'System2'], 
            ['heater'],
            ['tempSV', 'on_off']
        ]
    ],
    5 : 
    [
        [
            ['Switch'], 
            ['kset'],
            ['K1', 'K2', 'K3', 'K4']
        ],
        [
            ['Scada1'], 
            ['kset'],
            ['K1', 'K2', 'K3', 'K4']
        ]
    ],
    6 : 
    [
        [
            ['Switch'], 
            ['kset'],
            ['K5', 'K6', 'K7', 'K8']
        ],
        [
            ['Scada2'], 
            ['kset'],
            ['K1', 'K2', 'K3', 'K4']
        ]
    ]
}

export { dataLink }