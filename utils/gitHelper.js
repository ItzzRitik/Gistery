import _ from 'lodash';
import fetch from 'node-fetch';

const gitFetch = async (githubToken, query) => {
		return new Promise(async (resolve, reject) => {
			try {
				const options = {
						method: 'POST',
						headers: { Authorization: `token ${githubToken}` },
						body: JSON.stringify({ query })
					},
					request = await fetch('https://api.github.com/graphql', options),
					response = await request.json();

				return resolve(response.data.viewer);
			}
			catch (e) {
				return reject(e);
			}
		});
	},
	checkSession = async (gistID, githubToken) => {
		return new Promise(async (resolve, reject) => {
			try {
				const gitLoginQuery = `
						{ 
							viewer {
								login
							}
						}
					`,
					gistLoginQuery = `
						{ 
							viewer { 
								gist(name:"${gistID}") {
									owner {
										login
									}
								}
							}
						}
					`,
					[{ login }, { gist }] = await Promise.all([
						gitFetch(githubToken, gitLoginQuery),
						gitFetch(githubToken, gistLoginQuery)
					]);

				if (login.toLowerCase() === gist?.owner?.login.toLowerCase()) return resolve();

				return reject({ code: 403, message: 'Gist owner is not the same as the user' });
			}
			catch (err) {
				return reject(err);
			}
		});
	};

export { gitFetch, checkSession };
