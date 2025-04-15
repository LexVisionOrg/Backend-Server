const express = require('express');
const fileUpload = require('express-fileupload');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

const app = express();

// Middleware for handling file uploads
app.use(fileUpload());

// Serve the upload form
app.get('/', (req, res) => {
    res.send(`
        <!doctype html>
        <title>Upload PDF</title>
        <h1>Upload a PDF file to extract text</h1>
        <form method="POST" enctype="multipart/form-data" action="/upload">
            <input type="file" name="file" accept=".pdf" required>
            <button type="submit">Upload</button>
        </form>
    `);
});

// Handle file upload and invoke Python script
app.post('/upload', (req, res) => {
    if (!req.files || !req.files.file) {
        return res.status(400).send('No file uploaded.');
    }

    const pdfFile = req.files.file;
    const uploadPath = path.join(__dirname, 'uploads', pdfFile.name);

    // Ensure the uploads directory exists
    fs.mkdirSync(path.join(__dirname, 'uploads'), { recursive: true });

    // Save the uploaded file
    pdfFile.mv(uploadPath, (err) => {
        if (err) {
            return res.status(500).send('Error saving file.');
        }

        // Calling the Python script to extract text
        const pythonScript = path.join(__dirname, 'extract_pdf_text.py');
        const command = `python "${pythonScript}" "${uploadPath}"`;

        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error('Error executing Python script:', error);
                return res.status(500).send('Error extracting text from PDF.');
            }

            // Extracting the output file path from the Python script's stdout
            const outputFilePath = stdout.trim().split('\n').pop();
            if (!fs.existsSync(outputFilePath)) {
                console.error('Output file not found:', outputFilePath);
                return res.status(500).send('Error: Output file not generated.');
            }

            res.download(outputFilePath, (err) => {
                if (err) {
                    console.error('Error sending file:', err);
                }

                // uploaded and generated files clean up
                fs.unlinkSync(uploadPath);
                fs.unlinkSync(outputFilePath);
            });
        });
    });
});

// Start the server
const PORT = 5000; // Fixed port for Render deployment
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
