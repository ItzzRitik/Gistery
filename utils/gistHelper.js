import 'dotenv/config';
import fs from 'fs';
import sharp from 'sharp';
import simpleGit from 'simple-git';
import path from 'path';

const git = simpleGit(),
	profileDir = path.join(process.cwd(), '.profile'),
	preProcess = async () => {
		const userName = await git.getConfig('user.name', 'global'),
			userEmail = await git.getConfig('user.email', 'global');

		!fs.existsSync(profileDir) && fs.mkdirSync(profileDir);
		!userName.value && await git.addConfig('user.name', process.env.USER_NAME, false, 'global');
		!userEmail.value && await git.addConfig('user.email', process.env.USER_EMAIL, false, 'global');
	},

	switchToGist = async (gistID, githubToken) => {
		return new Promise(async (resolve, reject) => {
			try {
				await git.cwd(profileDir);
				if (!fs.existsSync(`${profileDir}/${gistID}`)) {
					await git.clone(`https://${githubToken}@gist.github.com/${gistID}`);
				}
				resolve(await git.cwd(`${profileDir}/${gistID}`));
			}
			catch (err) {
				return reject(err);
			}
		});
	},
	gistInit = async (gistID, githubToken) => {
		return new Promise(async (resolve, reject) => {
			try {
				await switchToGist(gistID, githubToken);
				await git.fetch();
				await git.reset('--hard', 'origin/master');
				await git.clean('df');
				return resolve(await git.pull());

				// return resolve(JSON.parse(fs.readFileSync(`${profileDir}/${gistID}/profile.json`, 'utf8')));
			}
			catch (err) {
				return reject(err);
			}
		});
	},
	removeLocalFile = (gistID, fileName) => {
		return fs.rmSync(`${profileDir}/${gistID}/${fileName}`, { force: true });
	},
	updateLocalFile = async (gistID, filePath, fileName) => {
		return new Promise(async (resolve, reject) => {
			try {
				if (!fileName || !filePath) return resolve();

				resolve(await sharp(filePath).resize(400, 400).jpeg({ mozjpeg: true }).toFile(`${profileDir}/${gistID}/${fileName}`));
				return fs.rmSync(filePath, { force: true });
			}
			catch (err) {
				return reject(err);
			}
		});
	},
	updateLocalFileContent = async (gistID, fileName, fileContent) => {
		return new Promise(async (resolve, reject) => {
			try {
				fs.writeFileSync(`${profileDir}/${gistID}/${fileName}`, JSON.stringify(fileContent, null, 4), 'utf8');
				return resolve();
			}
			catch (err) {
				return reject(err);
			}
		});
	},
	commitChanges = async (field) => {
		return new Promise(async (resolve, reject) => {
			try {
				await git.add('.');
				await git.commit(`Updated ${field}`);
				return resolve(await git.push());
			}
			catch (err) {
				return reject(err);
			}
		});
	};

preProcess();
export { gistInit, removeLocalFile, updateLocalFile, updateLocalFileContent, commitChanges };
