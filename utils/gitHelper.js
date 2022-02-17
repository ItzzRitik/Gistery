import _ from 'lodash';
import fetch from 'node-fetch';

const gitFetch = async (route = '', gitToken, options = {}) => {
		return new Promise(async (resolve, reject) => {
			try {
				options = _.merge({ headers: { Authorization: `token ${gitToken}` } }, options);
				const request = await fetch(`https://api.github.com${route}`, options),
					response = await request.json();
				return resolve(response);
			}
			catch (e) {
				return reject(e);
			}
		});
	},
	gistFetch = async (gistID, gitToken, options = {}) => {
		return new Promise(async (resolve, reject) => {
			try {
				options = _.merge({ headers: { Accept: 'application/vnd.github.v3.json' } }, options);
				const gist = await gitFetch(`/gists/${gistID}`, gitToken, options);

				return resolve(gist);
			}
			catch (e) {
				return reject(e);
			}
		});
	},
	checkSession = async (gitToken, gistID) => {
		return new Promise(async (resolve, reject) => {
			try {
				const [user, gist] = await Promise.all([
					gitFetch('/user', gitToken),
					gistFetch(gistID, gitToken)
				]);
				console.log('user', gist);
				console.log('gist', gist);
				return resolve(gist);
			}
			catch (e) {
				return reject(e);
			}
		});
	};

export { gitFetch, gistFetch, checkSession };
