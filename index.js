const express = require('express'),
	app = express(),
	multer = require('multer'),
	upload = multer({
		storage: multer.diskStorage({
			destination: 'public',
			filename: (req, file, cb) => cb(null, file.originalname)
		})
	}),

	updateProfile = require('./utils/updateProfile');

require('dotenv').config();

app.post('/updateProfile', upload.single('file'), updateProfile);

app.get('*', (req, res) => {
	res.send('Server is running');
});

app.listen(process.env.PORT || 8080, () => {
	console.log('Server is listening');
});
