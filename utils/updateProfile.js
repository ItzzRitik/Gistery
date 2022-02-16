const { gistInit } = require('./gistHelper'),

	updateViaCommit = async () => {

	},
	updateViaApi = async () => {

	};

module.exports = async (req, res) => {
	try {
		const { gistid: gistID, githubtoken: githubToken } = req.headers,
			field = req?.body?.field,
			content = JSON.parse(req?.body?.content),
			isImageModified = content?.image?.isModified;

		console.log(gistID, githubToken, field, content, isImageModified, req.file);

		// oldProfile = await gistInit(gistID);

		if (req.file) {
			const response = await updateViaCommit(req?.file?.path, req?.body?.profile);
		}

		const response = updateViaApi();
	}
	catch {

	}
};
