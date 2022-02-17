import fs from 'fs';
import sharp from 'sharp';
import simpleGit from 'simple-git';

const git = simpleGit(),

	profileDir = '.profile',
	gistInit = async (gistID) => {
		console.log('gistInit', gistID);
		return new Promise(async (resolve, reject) => {
			try {
				// if (!fs.existsSync(`${profileDir}/${gistID}`)) {
				// 	await git.clone(`https://${process.env.GITHUB_TOKEN}@gist.github.com/${gistID}`);
				// }
				console.log('init');
				await git.cwd(`${profileDir}/${gistID}`);
				await git.fetch();
				await git.reset('--hard', 'origin/master');
				await git.clean('df');
				await git.pull();
				return resolve();
			}
			catch (err) {
				console.log(err);
				return reject(err);
			}
		});
	};

export { gistInit };
