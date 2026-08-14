/* 
{ 
    "node": "开关", 
    "group": "switch1", 
    "timestamp": 1786618610441, 
    "values": { "k1": 1, "k2": 2, "k3": 3, "k4": 4, "k5": 5 }, 
    "errors": { }, 
    "metas": { } 
} 
*/

function msgParser(msg){
    let parse = JSON.parse(msg);
    let data = {
        node: parse.node,
        group: parse.group,
        values: parse.values
    }
    return data;
}

/* 
{"uuid": "123", "error": 3002} 
*/

function respParser(msg){
    let parse = JSON.parse(msg);

    if(parse.error === 0 ){
        return true;
    }

    return false;
}

export { msgParser, respParser }