// services/alphaVantageService.js
const axios = require('axios');
require('dotenv').config();

const API_KEY = process.env.ALPHA_VANTAGE_API_KEY;

async function getStockData(symbol) {
    const url = `https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${API_KEY}`;
    try {
        const response = await axios.get(url);
        if (response.data['Time Series (Daily)']) {
            const data = response.data['Time Series (Daily)'];
            return Object.keys(data).map(date => ({
                date,
                open: parseFloat(data[date]['1. open']),
                close: parseFloat(data[date]['4. close']),
                high: parseFloat(data[date]['2. high']),
                low: parseFloat(data[date]['3. low']),
                volume: parseInt(data[date]['5. volume'], 10)
            }));
        } else {
            throw new Error('Error al obtener los datos.');
        }
    } catch (error) {
        console.error(`Error al obtener datos de Alpha Vantage: ${error}`);
        return null;
    }
}

async function getTechnicalIndicator(symbol, indicator) {
    const url = `https://www.alphavantage.co/query?function=${indicator}&symbol=${symbol}&interval=daily&time_period=14&series_type=close&apikey=${API_KEY}`;
    try {
        const response = await axios.get(url);
        if (response.data['Technical Analysis: ' + indicator.toUpperCase()]) {
            return response.data['Technical Analysis: ' + indicator.toUpperCase()];
        } else {
            throw new Error('Error al obtener el indicador técnico.');
        }
    } catch (error) {
        console.error(`Error al obtener indicador técnico de Alpha Vantage: ${error}`);
        return null;
    }
}

async function getCombinedIndicators(symbol) {
    const sma = await getTechnicalIndicator(symbol, 'SMA');
    const rsi = await getTechnicalIndicator(symbol, 'RSI');
    const macd = await getTechnicalIndicator(symbol, 'MACD');

    return { sma, rsi, macd };
}

module.exports = {
    getStockData,
    getTechnicalIndicator,
    getCombinedIndicators
};
