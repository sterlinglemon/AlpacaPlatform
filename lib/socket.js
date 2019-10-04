const io = require('socket.io')(),
    moment = require('moment'),
    Alpaca = require('@alpacahq/alpaca-trade-api');

io.on('connection', function(client) {
    var alpaca = new Alpaca({
        keyId: client.handshake.session.Alpaca_Key_ID,
        secretKey: client.handshake.session.Alpaca_Secret_ID,
        paper: client.handshake.session.IsSandboxMode,
      });
    var alpacaClient = alpaca.websocket;

    alpacaClient.connect();
    alpacaClient.onStockQuotes(function(subject, data) {
        let quoteData = JSON.parse(data)[0];
        if (quoteData.sym == client.handshake.session.currentTicker){
            client.emit('updateLivePrice', {price:quoteData.bp, symbol:client.handshake.session.currentTicker});
        }
    })
    alpacaClient.onStockAggSec(function(subject, data) {
        let response = JSON.parse(data)[0];
        
        if (response.c > 0 && response.sym == client.handshake.session.currentTicker && response.v > 0) {
            client.emit('updateStockChart', {
                o:response.o, 
                h:response.h,
                l: response.l,
                c: response.c,
                v: response.v,
                t: response.e
            });
        }
    })

    client.on('placeOrder', function(order) {
        var newOrder = {
            symbol: order.symbol, // any valid ticker symbol
            qty: Number(order.qty),
            side: order.side,
            type: order.type,
            time_in_force: order.time_in_force
        };
        
        if (order.limit_price != '' && order.type != "market"){
            newOrder.limit_price = Number(order.limit_price);
        }
        if (order.stop_price != '' && order.type != "market"){
            newOrder.stop_price = Number(order.stop_price);
        }

        alpaca.createOrder(newOrder).then((orderResponse) => {
            alpaca.getOrders().then((orders) => {
                client.emit('updateOrders', orders);
            });
        });
    });

    client.on('cancelOrder', function(orderid) {
        alpaca.cancelOrder(orderid).then((orderResponse) => {
            console.log(orderResponse);
            alpaca.getOrders().then((orders) => {
                client.emit('updateOrders', orders);
            });
        });
    });

    client.on('setTicker', function(ticker) {
        if (client.handshake.session.currentTicker){
            alpacaClient.unsubscribe(['Q.'+client.handshake.session.currentTicker,'A.'+client.handshake.session.currentTicker]);
            client.handshake.session.currentTicker = ticker;
            client.handshake.session.save();
            alpacaClient.subscribe(['Q.'+client.handshake.session.currentTicker,'A.'+client.handshake.session.currentTicker]);
        }
        else {
            client.handshake.session.currentTicker = ticker;
            client.handshake.session.save();
        }
        alpaca.getLastTrade(ticker).then((result) => {
            let response = {
                symbol: ticker,
                price: result.last.price
            };
            client.emit('updateLivePrice', response);
        }); 
    });

    client.on('setGranularity', function(granularity) {
        client.handshake.session.granularity = granularity;
        client.handshake.session.save();
    });

    client.on('platform', function(data) {

        if (data == "getClock"){
            alpaca.getClock().then((clock) => {
                client.emit('updateClock', clock);
            });
        }
        if (data == "getPortfolioValue"){
            alpaca.getAccount().then((account) => {
                client.emit('updatePortfolioValue', account.portfolio_value);
            });
        }
        if (data == "getPositions"){
            alpaca.getPositions().then((positions) => {
                client.emit('updatePositions', positions);
            });
        }
        if (data == "getOrders"){
            alpaca.getOrders().then((orders) => {
                client.emit('updateOrders', orders);
            });
        }
        if (data == "getHistoricData"){
            let ticker = client.handshake.session.currentTicker;
            let multiplier = 1;
            let size = 'minute';
            let granularity = client.handshake.session.granularity;
            let endDate = moment(new Date()).add(1,"days").format("YYYY-MM-DD");
            let startDate = moment().subtract(10, "days").format("YYYY-MM-DD");

            if (granularity == "15m"){
                multiplier = 15;
                startDate = moment().subtract(1, "months").format("YYYY-MM-DD");
            }
            else if (granularity == "1h"){
                multiplier = 60;
                startDate = moment().subtract(2, "months").format("YYYY-MM-DD");
            }
            else if (granularity == "1d"){
                size = 'day';
                startDate = moment().subtract(5, "years").format("YYYY-MM-DD");
            }
            alpaca.getHistoricAggregatesV2(ticker, multiplier, size, startDate, endDate).then((result) => {
                client.emit('updateHistoricData', result.results);
            });
        }
    });
});

module.exports = io;