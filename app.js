const express = require('express');
const multer = require('multer');
const { spawn } = require('child_process');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(cors());

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'ESRGAN_trial/LR/');
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
});

const upload = multer({ storage: storage });

app.post('/process_image', upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }

    const imagePath = req.file.path;
    const pythonProcess = spawn('python', ['ESRGAN_trial/test.py', imagePath]);

    pythonProcess.stdout.on('data', (data) => {
        const imagePath = data.toString().trim(); // Assuming data is the path to the processed image
        const resultsFileName = `${path.basename(imagePath)}_rlt.png`; // Append '_rlt.png' to the filename
        const resultsPath = path.join('ESRGAN_trial', 'results', resultsFileName); // Construct the full path to the processed image
        // console.log(`Results path: ${resultsPath}`);
        res.json({ resultsPath });
    });

    pythonProcess.stderr.on('data', (data) => {
        console.error(`Error: ${data}`);
        res.status(500).json({ message: 'Internal server error' });
    });
});

app.get('/processed_images/:imageName', (req, res) => {
    const imageName = req.params.imageName;
    const imagePath = path.join(__dirname, 'ESRGAN_trial', 'results', imageName);
    res.sendFile(imagePath);
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname,'public', 'index.html'));
});

app.use(express.static('public'));

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
