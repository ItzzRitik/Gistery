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
	const query = `
		query { 
			viewer { 
		  		gist(name:"79e507c36db4438d530e4f1b03ead8f3") {
					owner {
			  			login
					}
		  		}
			}
	  	}
	`,
		options = {
			method: 'POST',
			headers: { Authorization: 'token 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' },
			body: JSON.stringify({ query })
		};
	const request = await fetch('https://api.github.com/graphql', options),
		response = await request.json();

	console.log(JSON.stringify(response, null, 4));
	res.send('Server is running');
});

app.listen(process.env.PORT || 8080, () => {
	console.log('Server is listening');
});
