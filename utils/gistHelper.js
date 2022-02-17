import fs from 'fs';
import sharp from 'sharp';
import simpleGit from 'simple-git';

const git = simpleGit(),
	profileDir = '.profile',
	preProcess = () => {
		if (!fs.existsSync(profileDir)) {
			fs.mkdirSync(profileDir);
		}
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
			catch (e) {
				return reject(e);
			}
		});
	},
	updateLocalFileContent = async (gistID, fileName, fileContent) => {
		return new Promise(async (resolve, reject) => {
			try {
				fs.writeFileSync(`${profileDir}/${gistID}/${fileName}`, JSON.stringify(fileContent, null, 4), 'utf8');
				return resolve();
			}
			catch (e) {
				return reject(e);
			}
		});
	},
	commitChanges = async (field) => {
		return new Promise(async (resolve, reject) => {
			try {
				await git.add('./*');
				await git.commit(`Updated ${field}`);
				return resolve(await git.push());
			}
			catch (e) {
				return reject(e);
			}
		});
	};

preProcess();
export { gistInit, removeLocalFile, updateLocalFile, updateLocalFileContent, commitChanges };
