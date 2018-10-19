var boleto_sender = require('./boleto_sender');
var cron = require('node-cron');

console.log("Agendando CRON para 2:00");

cron.schedule('0 2 * * *', function(){
    console.log("Enviando boleto..." + new Date());
    boleto_sender.enviarBoleto();
 });

 console.log("CRON Agendado");
