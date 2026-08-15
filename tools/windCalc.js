/**
 * 计算风量输出值
 * 
 * @param {number} baseWind - 基础风量（基准值） 对应 4~20ma 乘 1000
 * @param {number} windNeed - 需求风量
 * @returns {number} 计算后的输出风量，结果向下取整，且最高限制为 20000
 */
function windOutCalc(baseWind, windNeed) {
    // 计算基准风量与最小值(4000)之间的差值（步进范围）

    if (baseWind < 4000) {
        console.error('基础风量不能小于 4000');
    }

    let step = baseWind - 4000;
    
    // 根据需求风量与基准风量的比例，在 4000 的基础上线性计算输出值
    let windCalc = 4000 + step * (windNeed / 100);
    
    // 向下取整
    let windOut = Math.floor(windCalc);

    // 封顶限制：输出值不能超过 20000
    if (windOut > 20000) {
        return 20000;
    }

    return windOut;
}

export { windOutCalc }