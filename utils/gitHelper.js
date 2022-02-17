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
	gistApiUpdate = async (gistID, githubToken, fileName, fileContent) => {
		return new Promise(async (resolve, reject) => {
			try {
				const options = {
						method: 'PATCH',
						headers: {
							Accept: 'application/vnd.github.v3.json',
							Authorization: `token ${githubToken}`
						},
						body: JSON.stringify({
							files: {
								[fileName]: { content: JSON.stringify(fileContent, null, 4) }
							}
						})
					},
					request = await fetch(`https://api.github.com/gists/${gistID}`, options),
					response = await request.json();
				return resolve(response);
			}
			catch (e) {
				return reject(e);
			}
		});
	},
	checkSession = async (gistID, githubToken, fileName) => {
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
									owner { login }
									${fileName ? 'files { name text }' : ''}
								}
							}
						}
					`,
					[{ login }, { gist }] = await Promise.all([
						gitFetch(githubToken, gitLoginQuery),
						gitFetch(githubToken, gistLoginQuery)
					]),
					fileContent = gist?.files?.reduce((acc, file) => (file.name === fileName ? file.text : acc));

				if (login.toLowerCase() === gist?.owner?.login.toLowerCase()) {
					return resolve(fileContent ? JSON.parse(fileContent) : null);
				}

				return reject({ code: 403, message: 'Forbidden! Provided user isn\'t the owner of gist' });
			}
			catch (err) {
				return reject(err);
			}
		});
	};

export { gitFetch, checkSession, gistApiUpdate };
