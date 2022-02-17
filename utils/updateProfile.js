import { checkSession } from './gitHelper.js';
import { gistInit } from './gistHelper.js';

const updateViaCommit = async () => {

	},
	updateViaApi = async () => {

	},

	updateProfile = async (req, res) => {
		try {
			const { gistid: gistID, githubtoken: githubToken } = req.headers,
				field = req?.body?.field,
				content = JSON.parse(req?.body?.content),
				isImageModified = content?.image?.isModified;

			await checkSession(gistID, githubToken);

			// oldProfile = await gistInit(gistID);
			res.status(403).json({ errorMessage: 'Authentication Required' });
			if (req.file) {
				const response = await updateViaCommit(req?.file?.path, req?.body?.profile);
			}

			const response = updateViaApi();
		}
		catch ({ code, message }) {
			res.status(code).json({ errorMessage: message });
		}
	};

export default updateProfile;
