import _ from 'lodash';
import { nanoid } from 'nanoid';
import { checkSession } from './gitHelper.js';
import { gistInit, removeLocalFile, updateLocalFile, updateLocalFileContent, commitChanges } from './gistHelper.js';

const updateViaCommit = async (gistID, file, profile) => {
		return new Promise(async (resolve, reject) => {
			try {
				await gistInit();
			}
			catch (err) {
				return reject(err);
			}
		});

	},
	updateViaApi = async (gistID, githubToken, profile) => {
		return new Promise(async (resolve, reject) => {
			try {
			}
			catch (err) {
				return reject(err);
			}
		});
	},
	preferredProfileOrder = ['personal', 'socialHandles', 'academics', 'experience', 'skills', 'awards'],
	missingFields = (mandatoryFields, provided) =>
		mandatoryFields.filter((item) => !provided.includes(item)).reduce((acc, item) => `${acc}\n${item}`, ''),

	validate = {
		trim: (obj) => Object.keys(obj).forEach((key) => (obj[key] = obj[key].trim())),
		experience: (experience) => {
			const preferredOrder = ['id', 'companyName', 'roleName', 'roleType', 'fromDate', 'toDate', 'location', 'url', 'picture', 'description'],
				mandatoryFields = ['companyName', 'roleName', 'fromDate', 'toDate', 'location', 'url'];

			experience = _.pick(experience, preferredOrder);

			const missing = missingFields(mandatoryFields, Object.keys(experience));
			if (missing.length) throw new Error(`Missing mandatory fields${missing}`);

			experience.fromDate = new Date(experience.fromDate).toUTCString();
			experience.toDate = new Date(experience.toDate).toUTCString();

			validate.trim(experience);
			return experience;
		},
		academics: (academics) => {
			const preferredOrder = ['id', 'school', 'degree', 'field', 'fromDate', 'toDate', 'location', 'url', 'picture', 'description'],
				mandatoryFields = ['school', 'fromDate', 'toDate', 'location', 'url'];

			academics = _.pick(academics, preferredOrder);

			const missing = missingFields(mandatoryFields, Object.keys(academics));
			if (missing.length) throw new Error(`Missing mandatory fields${missing}`);

			academics.fromDate = new Date(academics.fromDate).toUTCString();
			academics.toDate = new Date(academics.toDate).toUTCString();

			validate.trim(academics);
			return academics;
		}
	},
	generateNewProfile = (oldProfile, field, content) => {
		if (content.id) {
			oldProfile[field] = oldProfile[field].map((item) => {
				if (item.id === content.id) {
					content = validate[field](_.merge(item, content));
					return content;
				}
				return item;
			});
		}
		else {
			content.id = nanoid();
			content = validate[field](content);
			!oldProfile[field] && (oldProfile[field] = []);
			oldProfile[field].push(content);
		}

		oldProfile[field].sort((a, b) => (new Date(b.fromDate) === new Date(a.fromDate) ?
			new Date(b.toDate) - new Date(a.toDate) : new Date(b.fromDate) - new Date(a.fromDate)));
		return _.pick(oldProfile, preferredProfileOrder);
	},

	updateProfile = async (req, res) => {
		try {
			const profileFileName = 'profile.json',
				{ gistid: gistID, githubtoken: githubToken } = req.headers,
				field = req?.body?.field,
				content = JSON.parse(req?.body?.content),
				isImageModified = content?.image?.isModified,
				oldProfile = await checkSession(gistID, githubToken, profileFileName);

			((req?.file?.path && content.picture) || (!req?.file?.path && isImageModified)) && removeLocalFile(gistID, content.picture);
			isImageModified && (content.picture = req?.file?.path ? `Z${nanoid()}.jpg` : null);

			const newProfile = generateNewProfile(oldProfile, field, content);

			if (req.file || isImageModified) {
				await Promise.all([
					updateLocalFile(gistID, req?.file?.path, content.picture),
					updateLocalFileContent(gistID, profileFileName, newProfile)
				]);
				await commitChanges(field);
			}
			else {

			}
			return res.status(200).json(newProfile);

			// const response = updateViaApi(githubToken, newProfile);
		}
		catch ({ code = 503, message }) {
			console.err(message);
			res.status(code).json({ errorMessage: message });
		}
	};

export default updateProfile;
