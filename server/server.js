const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
//const PORT = 3000;
const PORT = process.env.PORT || 3000;

// 1. Сервиране на статичните файлове от папка "public"
app.use(express.static(path.join(__dirname, '..', 'public')));
// Това ще направи съдържанието на /public достъпно по HTTP,
// например dashboard.html ще е достъпен на http://localhost:3000/dashboard.html
// (името на статичната папка не влиза в URL-то)&#8203;:contentReference[oaicite:4]{index=4}.

// 2. API маршрут за връщане на съдържанието на data.json
app.get('/api/data', (req, res) => {
    // Четем файла data.json
    const dataFilePath = path.join(__dirname, 'data.json');
    fs.readFile(dataFilePath, 'utf8', (err, jsonString) => {
        if (err) {
            console.error('Грешка при четене на файла:', err);
            return res.status(500).send('Грешка при зареждане на данните.');
        }
        try {
            const data = JSON.parse(jsonString);   // парсваме JSON стринга към обект
            res.json(data);  // връщаме JSON отговора към клиента
        } catch(parseErr) {
            console.error('Грешка при парсване на JSON:', parseErr);
            res.status(500).send('Невалидни данни.');
        }
    });
});

// 3. Стартиране на сървъра
app.listen(PORT, () => {
    console.log(`Express сървърът е стартиран на порт ${PORT}`);
});
