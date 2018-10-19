var request = require('request').defaults({jar: true});

module.exports = {

  enviarBoleto : function() {

    var headers = {
        'Origin': 'http://www.thaisimobiliariadf.com.br',
        'Accept-Encoding': 'gzip, deflate',
        'Accept-Language': 'pt-BR,pt;q=0.8,en-US;q=0.6,en;q=0.4',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Cache-Control': 'max-age=0',
        'Connection': 'keep-alive'
    };

    var login = '23125';
    var senha = '5321';
    var dataString = `we=1&LOGIN=${login}&SENHA=${senha}&submit1=+++++Entrar+++++`;

    var options = {
        url: 'http://www.thaisimobiliariadf.com.br/imobiliar/prg/crLogin.php',
        method: 'POST',
        headers: headers,
        body: dataString,
        gzip: true
    };

    function callback(error, response, body) {
        if (!error && response.statusCode == 200) {
            // console.log(body);
            var boleto = body.substring(body.indexOf('return AbreDOC')+ 'return AbreDOC'.length+2, body.indexOf('return AbreDOC')+ 100);
            boleto = boleto.substring(0,boleto.indexOf('.txt')+'.txt'.length);
            var vencimento = body.substring(body.indexOf('Vencimento:') + 'Vencimento:'.length, body.indexOf('Vencimento:') + 'Vencimento:'.length + 11).trim();
            var servico =  body.substring(body.indexOf('DOC:') + 'DOC:'.length + 1, body.indexOf('Vencimento:') -14).trim();
            var aux = body.substring(body.indexOf('Vencimento:') + 'Vencimento:'.length + 15).trim();
            var endereco =  aux.substring(0, aux.indexOf("</font>")).trim();
            endereco = accentsTidy(endereco).toUpperCase();
            // boleto = 'dados/bloquetos1/23125/L5724N201607.txt';
            var boletoURL = `http://www.thaisimobiliariadf.com.br/imobiliar/prg/exibeBoleto.php?fboleto=${boleto}`
            console.log(boletoURL);

            var headers = {
                'Accept-Encoding': 'gzip, deflate, sdch',
                'Accept-Language': 'pt-BR,pt;q=0.8,en-US;q=0.6,en;q=0.4',
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/52.0.2743.116 Safari/537.36',
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Cache-Control': 'max-age=0',
                'Connection': 'keep-alive',
            };

            var options = {
                url: boletoURL,
                headers: headers,
                gzip: true
            };

            function callback(error, response, body) {
                if (!error && response.statusCode == 200) {
                    // console.log('callback received');
                }
            }

            var boleto_file = `boleto_${login}_${vencimento}.pdf`.replace(new RegExp(/\//g), '');
            var fs = require('fs');
            var pdf = fs.createWriteStream(boleto_file);

            pdf.on('finish', function() {
              // console.log("Enviar arquivo");
              var helper = require('sendgrid').mail;
              var sendgrid  = require('sendgrid')('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');

              var mail = new helper.Mail();
              var email = new helper.Email('atendimento.consultoria@thaisimobiliaria.com.br', 'Thaís Imobiliária');
              mail.setFrom(email);
              mail.setSubject(`Boleto Aluguel - ${vencimento} - ${endereco}`);

              var personalization = new helper.Personalization();
              email = new helper.Email('tiago@stutzsolucoes.com.br', 'Tiago Stutz');
              personalization.addTo(email);
              mail.addPersonalization(personalization);

              var content = new helper.Content('text/html',  `<html><body>Segue em anexo o boleto com vencimento em <strong>${vencimento}</strong>. <p><p>Referente ao serviço de <strong>${servico}</strong> do imóvel <strong>${endereco}</strong></p></p></body></html>`)
              mail.addContent(content);
              var attachment = new helper.Attachment();
              var file = fs.readFileSync(boleto_file);
              var base64File = new Buffer(file).toString('base64');
              attachment.setContent(base64File);
              attachment.setType('application/pdf');
              attachment.setFilename('boleto_aluguel.pdf');
              attachment.setDisposition('attachment');
              console.log("Add attachment");
              mail.addAttachment(attachment);

              var rqs = sendgrid.emptyRequest({
                method: 'POST',
                path: '/v3/mail/send',
                body: mail.toJSON(),
              });

              sendgrid.API(rqs, function(err, response) {
                // console.log(response.statusCode);
                // console.log(response.body);
                // console.log(response.headers);
                console.log("Boleto enviado com sucesso!");
                fs.unlink(boleto_file);
              });
            });

            request(options, callback).pipe(pdf);
        }
    }

    request(options, callback);

    var accentsTidy = function(s){
            var r=s.toLowerCase();

            r = r.replace(new RegExp("[àáâãäå]", 'g'),"a");
            r = r.replace(new RegExp("æ", 'g'),"ae");
            r = r.replace(new RegExp("ç", 'g'),"c");
            r = r.replace(new RegExp("[èéêë]", 'g'),"e");
            r = r.replace(new RegExp("[ìíîï]", 'g'),"i");
            r = r.replace(new RegExp("ñ", 'g'),"n");
            r = r.replace(new RegExp("[òóôõö]", 'g'),"o");
            r = r.replace(new RegExp("œ", 'g'),"oe");
            r = r.replace(new RegExp("[ùúûü]", 'g'),"u");
            r = r.replace(new RegExp("[ýÿ]", 'g'),"y");

            r = r.replace(new RegExp('&aacute;'),'a');
            r = r.replace(new RegExp('&agrave;'),'a');
            r = r.replace(new RegExp('&acirc;'),'a');
            r = r.replace(new RegExp('&atilde;'),'a');

            r = r.replace(new RegExp('&eacute;'),'e');
            r = r.replace(new RegExp('&egrave;'),'e');
            r = r.replace(new RegExp('&ecirc;'),'e');

            r = r.replace(new RegExp('&iacute;'),'i');
            r = r.replace(new RegExp('&igrave;'),'i');
            r = r.replace(new RegExp('&icirc;'),'i');
            r = r.replace(new RegExp('&itilde;'),'i');

            r = r.replace(new RegExp('&oacute;'),'o');
            r = r.replace(new RegExp('&ograve;'),'o');
            r = r.replace(new RegExp('&ocirc;'),'o');
            r = r.replace(new RegExp('&otilde;'),'o');

            r = r.replace(new RegExp('&uacute;'),'u');
            r = r.replace(new RegExp('&ugrave;'),'u');
            r = r.replace(new RegExp('&ucirc;'),'u');
            r = r.replace(new RegExp('&utilde;'),'u');

            return r;
    };
  }

}
