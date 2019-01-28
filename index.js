require('dotenv').config() //configurando variaveis de ambiente
var express = require('express') 
var cors = require('cors')

const bodyParser = require('body-parser') //para formatar arquivos JSON de http requests
let rotas = require('./routes/routes');


var app = express()

app.use(cors())
app.use(bodyParser.json())
app.options('*', cors());
app.set('port', (process.env.PORT || 3000));
// app.use(formidable());
app.use(express.static(__dirname + '/public'));

//Subindo Rotas
app.use(rotas);

app.all('/*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    next();
  });

app.listen(app.get('port'), () => {
    console.log(`Servidor rodando em http://localhost:${app.get('port')}`)
    console.log('Para derrubar o servidor: ctrl + c');
})