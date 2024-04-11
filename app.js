const express = require('express');
const multer = require('multer');
const { spawn } = require('child_process');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000; // Use the port specified by Render or default to 3000

app.use(cors());

// Multer storage configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, 'ESRGAN_trial', 'LR'));
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname); // Get file extension
        cb(null, file.fieldname + '-' + Date.now() + ext); // Generate unique filename with timestamp
    }
});

const upload = multer({ 
    storage: storage,
    fileFilter: function (req, file, cb) {
        const filetypes = /jpeg|jpg|png/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);
        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb('Error: Only jpeg, jpg, and png files are allowed');
        }
    }
}).single('image'); // 'image' is the field name in the form

// POST route for processing images
app.post('/process_image', (req, res) => {
    upload(req, res, (err) => {
        if (err) {
            return res.status(400).json({ message: err });
        }

        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const imagePath = req.file.path;
        const pythonProcess = spawn('python', ['ESRGAN_trial/test.py', imagePath]);

        pythonProcess.stdout.on('data', (data) => {
            const processedImagePath = data.toString().trim(); // Assuming data is the path to the processed image
            const processedImageName = path.basename(processedImagePath); // Get processed image filename
            const resultsPath = path.join(__dirname, 'ESRGAN_trial', 'results', processedImageName);
            res.json({ resultsPath });
        });

        pythonProcess.stderr.on('data', (data) => {
            console.error(`Error: ${data}`);
            res.status(500).json({ message: 'Internal server error' });
        });
    });
});

// GET route to serve processed images
app.get('/processed_images/:imageName', (req, res) => {
    const imageName = req.params.imageName;
    const imagePath = path.join(__dirname, 'ESRGAN_trial', 'results', imageName);
    res.sendFile(imagePath);
});

// Serve index.html from the public folder
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Serve static files from the public folder
app.use(express.static('public'));

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
