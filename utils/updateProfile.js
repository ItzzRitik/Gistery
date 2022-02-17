import { checkSession } from './gitHelper.js';
import { gistInit } from './gistHelper.js';

const updateViaCommit = async () => {

	},
	updateViaApi = async () => {

	},

	updateProfile = async (req, res) => {
		try {
			const { gistid: gistID, githubtoken: gitToken } = req.headers,
				field = req?.body?.field,
				content = JSON.parse(req?.body?.content),
				isImageModified = content?.image?.isModified;

			checkSession(gistID, gitToken);

			// oldProfile = await gistInit(gistID);

			if (req.file) {
				const response = await updateViaCommit(req?.file?.path, req?.body?.profile);
			}

			const response = updateViaApi();
		}
		catch {

		}
	};

export default updateProfile;
