const express = require('express');
const { engine } = require('express-handlebars');
const cors = require('cors'); // Importa el paquete cors
const { getStockData, getCombinedIndicators } = require('./services/alphaVantageService');
const { generateAlert } = require('./models/alertModel');
const { predictStock } = require('./models/predictionModel');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

// Habilitar CORS para todas las rutas
app.use(cors()); // Permitir CORS para todas las solicitudes

// Configuración de Handlebars
app.engine('handlebars', engine({
    helpers: {
        json: function(context) {
            return JSON.stringify(context);
        }
    }
}));
app.set('view engine', 'handlebars');
app.set('views', './views');

// Define tu API key aquí
const API_KEY = 'ATBVV90LV6WDZKI8'; // Reemplaza esto con tu clave de API real

// Función para obtener datos históricos
async function getHistoricalData(symbol) {
    try {
        const response = await axios.get(`https://www.alphavantage.co/query`, {
            params: {
                function: 'TIME_SERIES_DAILY',
                symbol: symbol,
                apikey: API_KEY
            }
        });

        console.log('Response from Alpha Vantage:', response.data); // Imprimir la respuesta completa para depuración

        const timeSeries = response.data['Time Series (Daily)'];
        if (!timeSeries) {
            throw new Error('No data returned for this symbol.');
        }

        const historicalData = Object.keys(timeSeries).map(date => ({
            date: date,
            open: parseFloat(timeSeries[date]['1. open']),
            close: parseFloat(timeSeries[date]['4. close']),
            high: parseFloat(timeSeries[date]['2. high']),
            low: parseFloat(timeSeries[date]['3. low']),
            volume: parseInt(timeSeries[date]['5. volume'])
        }));

        return historicalData;
    } catch (error) {
        console.error('Error fetching historical data:', error.message); // Muestra el mensaje de error
        throw error; // Maneja el error según sea necesario
    }
}

// Ruta para obtener y mostrar el gráfico
app.get('/chart/:symbol', async (req, res) => {
    const symbol = req.params.symbol;
    try {
        const historicalData = await getHistoricalData(symbol);

        // Verifica el formato del JSON
        console.log('Historical Data:', JSON.stringify(historicalData)); // Imprimir el formato del JSON

        res.render('chart', {
            symbol: symbol,
            data: historicalData // Pasa los datos directamente, ya que se procesará en la plantilla
        });
    } catch (error) {
        console.error('Error retrieving historical data:', error);
        res.status(500).send('Error retrieving historical data.');
    }
});

// Endpoint para obtener análisis avanzado
app.get('/analysis/:symbol', async (req, res) => {
    const symbol = req.params.symbol;
    try {
        const combinedIndicators = await getCombinedIndicators(symbol);
        const analysis = generateAlert(combinedIndicators);
        res.json(analysis);
    } catch (error) {
        console.error('Error retrieving analysis:', error);
        res.status(500).send('Error retrieving analysis.');
    }
});

// Endpoint para predecir el stock
app.get('/predict/:symbol', async (req, res) => {
    const symbol = req.params.symbol;
    try {
        const prediction = await predictStock(symbol);
        res.json(prediction);
    } catch (error) {
        console.error('Error predicting stock:', error);
        res.status(500).send('Error predicting stock.');
    }
});

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en el puerto ${PORT}`);
});
