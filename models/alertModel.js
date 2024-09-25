// models/alertModel.js
function generateAlert(combinedIndicators) {
    const latestDate = Object.keys(combinedIndicators.sma)[0];  // Última fecha
    const latestSMA = combinedIndicators.sma[latestDate]['SMA'];
    const latestRSI = combinedIndicators.rsi[latestDate]['RSI'];
    const latestMACD = combinedIndicators.macd[latestDate]['MACD_Hist'];

    let alertMessage = '';

    if (latestRSI < 30 && latestMACD > 0) {
        alertMessage = 'Posible compra: El RSI está en sobreventa y el MACD es positivo.';
    } else if (latestRSI > 70 && latestMACD < 0) {
        alertMessage = 'Posible venta: El RSI está en sobrecompra y el MACD es negativo.';
    } else {
        alertMessage = 'No hay señales claras de compra o venta.';
    }

    return { alert: alertMessage, indicators: { latestSMA, latestRSI, latestMACD } };
}

module.exports = {
    generateAlert
};
