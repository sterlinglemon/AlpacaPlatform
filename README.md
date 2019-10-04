# AlpacaPlatform

Slim trading platform that implements the alpaca api to visualize market data and trade securities. It enables visual interaction with the alpaca api via charts, order execution, and position monitoring.

### Installing

This application is coded in nodeJs. Once you have node installed, navigate to the project directory and run

```
npm install
```

After the packages are installed, edit the app.js file and set the session variables to match your alpaca API keys on lines 25-27;

```
req.session.Alpaca_Key_ID = 'YOUR KEY ID';
req.session.Alpaca_Secret_ID= 'YOUR SECRET ID';
req.session.IsSandboxMode= true; //Depending on if you are using a paper account or live.
```

Then run

```
node app
```

Finally, visit localhost:3000 in a web browser. You should see something like this:

![screenshot](https://raw.githubusercontent.com/sterlinglemon/AlpacaPlatform/master/platform.png)

## Built With

* [NodeJS](https://nodejs.org) - The web framework
* [Alpaca](https://alpaca.markets/) - The API for stock trading
* [TradingView](https://www.tradingview.com/) - The wonderful lightweight chart library

## Contributing

This project is no longer actively maintained, however feel free to submit a pull request if you'd like to contribute.

## License

Feel free to use this however you'd like. Just pay it forward.
