/* {
    "uuid": "cd32be1b-c8b1-3257-94af-77f847b1ed3e",
    "node": "modbus",
    "group": "grp",
    "tag": "tag0",
    "value": 1234
} */

import { getUUID } from './uuid.js'

import { uuidAdd, uuidList, uuidRemove } from './uuidPool.js'

function msgMaker(data){
    let uuid = getUUID();
    uuidAdd(uuid);
    let msg = {
        "uuid": uuid,
        "node": data.node,
        "group": data.group,
        "tags": data.tags,
        "value": data.value
    }
    return msg;
}

export { msgMaker }