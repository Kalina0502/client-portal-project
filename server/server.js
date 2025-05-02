const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// 1. Сервиране на статичните файлове от папка "public"
app.use(express.static(path.join(__dirname, '..', 'public')));

// 2. API маршрут за връщане на съдържанието на data.json
app.get('/api/data', (req, res) => {
    // Четем файла data.json
    const dataFilePath = path.join(__dirname, 'data.json');
    fs.readFile(dataFilePath, 'utf8', (err, jsonString) => {
        if (err) {
            console.error('Error reading the file:', err);
            return res.status(500).send('Error loading the data.');
        }
        try {
            const data = JSON.parse(jsonString);   // парсваме JSON стринга към обект
            res.json(data);  // връщаме JSON отговора към клиента
        } catch(parseErr) {
            console.error('Error parsing JSON:', parseErr);
            res.status(500).send('Invalid data format.');
        }
    });
});

// 3. Стартиране на сървъра
app.listen(PORT, () => {
    console.log(`Express server is running on port ${PORT}`);
});
