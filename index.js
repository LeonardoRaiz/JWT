const http = require('http');
const express = require('express');
const app = express();

const bodyParser = require('body-parser');
app.use(bodyParser.json());

require("dotenv-safe").config();
const jwt = require('jsonwebtoken');

app.get('/', (req, res, next) => {
    res.json({ message: "Home ok!" });
})

app.get('/clientes', verifyJWT, (req, res, next) => {
    console.log("Retornou todos clientes!");
    res.json([{ id: 1, nome: 'Léo' }]);
})

app.post('/login', (req, res, next) => {
    const { user, password } = req.body;
    console.log(user + " " + password);
    if (user === 'Léo' && password === '123') {
        const id = 1; //esse id viria do banco de dados UUID
        const token = jwt.sign({ id }, process.env.SECRET, {
            expiresIn: 300 // expires in 5min
        });
        return res.json({ auth: true, token: token });
    }
    res.status(500).json({ message: 'Login inválido!' });
})

app.post('/logout', function (req, res) {
    res.json({ auth: false, token: null });
})



const server = http.createServer(app);

server.listen(3000);
console.log("Servidor escutando na porta 3000...")


function verifyJWT(req, res, next) {
    const token = req.headers['x-access-token'];

    if (!token) return res.status(401).json({ auth: false, message: 'No token provided.' });

    jwt.verify(token, process.env.SECRET, function (err, decoded) {
        if (err) return res.status(500).json({ auth: false, message: 'Failed to authenticate token.' });

        // se tudo estiver ok, salva no request para uso posterior
        req.userId = decoded.id;
        next();
    });
}
