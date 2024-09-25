// models/predictionModel.js
const { getStockData, getCombinedIndicators } = require('../services/alphaVantageService');
const mlRegression = require('ml-regression');
const { PolynomialRegression } = mlRegression;

async function predictStock(symbol) {
    const data = await getStockData(symbol);
    const indicators = await getCombinedIndicators(symbol);

    if (!data || !indicators) {
        return { message: 'No se pudo obtener datos para la predicción.' };
    }

    const prices = data.map(d => d.close);
    const dates = data.map(d => new Date(d.date).getTime());

    const firstDate = dates[0];
    const processedDates = dates.map(date => (date - firstDate) / (1000 * 60 * 60 * 24));

    const degree = 2;
    const regression = new PolynomialRegression(processedDates, prices, degree);

    const nextDay = (new Date().getTime() - firstDate) / (1000 * 60 * 60 * 24) + 1;
    const predictedPrice = regression.predict(nextDay);

    return { predictedPrice, indicators, historicalData: data };
}

module.exports = {
    predictStock
};
