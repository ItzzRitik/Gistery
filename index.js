import 'dotenv/config';
import express from 'express';
import fetch from 'node-fetch';
import multer from 'multer';
import updateProfile from './utils/updateProfile.js';

const app = express(),
	upload = multer({
		storage: multer.diskStorage({
			destination: 'public',
			filename: (req, file, cb) => cb(null, file.originalname)
		})
	});

app.post('/updateProfile', upload.single('file'), updateProfile);

app.get('*', async (req, res) => {
	res.send('Server is running');
});

app.listen(process.env.PORT || 8080, () => {
	console.log('Server is listening');
});
