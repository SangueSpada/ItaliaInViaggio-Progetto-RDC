var amqp=require('amqplib/callback_api');
var codaa;
var exchange='segnalazioni';


amqp.connect('amqp://root:root@localhost:5672',function(err,conn){
  if(err){
    console.log(err);
    return;
  }

  conn.createChannel(function(err1,channel){
    if(err1){
      console.log(err1);
      return;
    }
    let ex=exchange;

    channel.assertExchange(ex,'direct',{durable: true});
    codaa=channel;

    channel.assertQueue('segnalazioni_utenti',{durable:true},function(err2,q){
      if(err2){
        console.log(err2);
        return;
      }

      channel.bindQueue(q.queue,exchange,'servizio');
      channel.bindQueue(q.queue,exchange,'esistenza');


      channel.consume(q.queue,function(msg){
        console.log('messaggio con topic: '+ msg.fields.routingKey+' contenuto: '+msg.content.toString());
      },{noAck:true});


    });


  });
});