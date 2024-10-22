
const cron = require('node-cron');
var _ = require('lodash');
const moment = require('moment'); 
const Binance = require('node-binance-api');
const fetch = require('node-fetch');
const chalk = require('chalk');
const sound = require('sound-play')

//const TelegramBot = require('node-telegram-bot-api');
// replace the value below with the Telegram token you receive from @BotFather
//const token = '7627661768:AAHMN6xtVmhGB14mzq-VVPOFYW8G2G8et7w';
// Create a bot that uses 'polling' to fetch new updates
//const bot = new TelegramBot(token, {polling: true});

const notifier = require('node-notifier');

// bot.on('message', (msg) => {
//   const chatId = msg.chat.id;

//   // send a message to the chat acknowledging receipt of their message
//   bot.sendMessage(chatId, 'Hola Adonis');
// });

//const chatId = myidbot;

// send a message to the chat acknowledging receipt of their message
//bot.sendMessage(chatId, 'Received your message');



const binance = new Binance().options({
  APIKEY: 'kdcQmcOFWjbVS806eG1tNzwDJfZdzsGRnvNQ18AjdCsBEdbxaLwB0rpetrWzLtzO',
  APISECRET: 'pLbAEc0EI2ZDgdVAwA89DtYSwasTlDkNJnbF53wciXFyhkOp4VWkwDVMz0Crovd1'
});

var montoOperacionUsdt=100;
var cantidadBtc=0;
var arrOperaciones=[];
var indice=0;
var montoBsInicio=4771;

// async function consultar(){
//     let ticker = await binance.prices();
//     //console.info(`Price SPOT of BTC:`,parseFloat(ticker.BTCUSDT));
    
//     binance.bookTickers('BTCUSDT', (error, ticker) => {
//       //console.info("bookTickers ask price", ticker.askPrice);
//     });
// };


cron.schedule('0 * * * * * ', function(){

    binance.bookTickers('BTCUSDT', (error, ticker) => {
        cantidadBtc= montoOperacionUsdt/parseFloat(ticker.askPrice);
        //console.info("inform", ticker);
        arrOperaciones.push({'indice':indice,'montoBtc':cantidadBtc,'tasa':parseFloat(ticker.askPrice)});
        indice++;

        if(indice==2){
          mostrar_resumen(arrOperaciones, parseFloat(ticker.askPrice));
          indice=0;
        }

      });

    
});


async function mostrar_resumen (arrOperaciones, precioSpot){

    //console.log("arrOperaciones",arrOperaciones);

    let arrOrdenado=_.orderBy(arrOperaciones, ['montoBtc'],['asc']);

    let inicio=arrOrdenado[0].montoBtc;
    let fin= arrOrdenado[arrOrdenado.length-1].montoBtc;
    //console.log("fin",fin,"inicio",inicio);

    
    let tasaBtcVes= await consultarP2pBtc();
    let tasaUsdtVes=await consultarP2pUsdt();
    
    let bolivares=fin*tasaBtcVes;

    let dolares=bolivares/tasaUsdtVes;


    let porc=(fin*100/inicio)-100; 
    let porcFormat=new Intl.NumberFormat().format(porc);

    


    if(dolares > 100){

      console.log(chalk.green('---------------'));
      console.log("bolivares",bolivares);
      console.log("dolares",dolares);
      console.log("precio btc",precioSpot);
      console.log("tasaBtcVes",tasaBtcVes);
      console.log("tasaUsdtVes",tasaUsdtVes);

      // String
      notifier.notify('¡advertencia de operar!');
      // Object
      notifier.notify({
        'title': 'Imaginanet Blog',
        'subtitle': 'Verificacion '+ porc,
        'message': 'Mayor a 100 usdt',
        'icon': 'imaginanet-logo.png',
        'contentImage': 'blog.png',
        'sound': 'pito.mp3',
        'wait': true
      });

      if(porc>=0){
        console.log(chalk.red("Positivo (%) ",porcFormat, "fecha hora", moment(new Date()).format("DD/MM/YYYY HH:mm:ss")));
      }else{
          sound.play('pito.mp3')
          console.log(chalk.blue("Negativo (%) ",porcFormat, "fecha hora", moment(new Date()).format("DD/MM/YYYY HH:mm:ss")));
      }
    }


    // for(let i in arrOrdenado){
    //     const ele=arrOperaciones[i];
    //     console.log(ele);
    // }
}



  
const headers = {
    "Accept": "*/*",
    "Accept-Encoding": "gzip, deflate, br",
    "Accept-Language": "en-GB,en-US;q=0.9,en;q=0.8",
    "Cache-Control": "no-cache",
    "Connection": "keep-alive",
    "Content-Length": "123",
    "content-type": "application/json",
    "Host": "p2p.binance.com",
    "Origin": "https://p2p.binance.com",
    "Pragma": "no-cache",
    "TE": "Trailers",
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:88.0) Gecko/20100101 Firefox/88.0"
};

async function consultarP2pBtc(){
  
  const data = {
    asset: 'BTC',
    tradeType: 'SELL',
    fiat: 'VES',
    transAmount: montoBsInicio,
    order: '',
    page: 1,
    rows: 10,
    filterType: 'all'
  };

    const responseData = await fetch(
        'https://p2p.binance.com/bapi/c2c/v2/friendly/c2c/adv/search',
        {
            headers,
            method: 'POST',
            body: JSON.stringify(data),
        }
    );

    if (!responseData.ok)
        throw 'bad response';

    const jsonData = await responseData.json();

    for(let i in jsonData.data){

      if(i==0){
        //console.log("price venta BTC",parseFloat(jsonData.data[i].adv.price));

        return parseFloat(jsonData.data[i].adv.price);
        let precioBtcFormat=new Intl.NumberFormat().format(jsonData.data[i].adv.price);
      }

    }

}


async function consultarP2pUsdt(){
  const data1 = {
    asset: 'USDT',
    tradeType: 'BUY',
    fiat: 'VES',
    transAmount: montoBsInicio,
    order: '',
    page: 1,
    rows: 10,
    filterType: 'all'
  };

    const responseData = await fetch(
        'https://p2p.binance.com/bapi/c2c/v2/friendly/c2c/adv/search',
        {
            headers,
            method: 'POST',
            body: JSON.stringify(data1),
        }
    );

    if (!responseData.ok)
        throw 'bad response';

    const jsonData = await responseData.json();

    for(let i in jsonData.data){
      
      if(i==0){
        //console.log("price venta USDT",parseFloat(jsonData.data[i].adv.price));
        return parseFloat(jsonData.data[i].adv.price);
        let precioUsdtFormat=new Intl.NumberFormat().format(jsonData.data[i].adv.price);
      }


    }

}


