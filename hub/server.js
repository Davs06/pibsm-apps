const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.set('view engine', 'ejs');
// Pasta para colocarmos o global.css e o logo no futuro
app.use(express.static('public'));

app.get('/', (req, res) => {
    res.render('index');
});

app.listen(port, () => {
    console.log(`Hub Central da PIB rodando na porta ${port}`);
});