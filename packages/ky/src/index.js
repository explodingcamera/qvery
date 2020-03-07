import ky from 'ky-universal';
import deepmerge from 'deepmerge';
import createQvery from '@qvery/core';

const defaultOptions = {};

const create = options => {
	options = deepmerge(defaultOptions, options);
	let qvery = options.qvery ? options.qvery : createQvery(options);

	const api = ky.create({
		prefixUrl: qvery.currentServer,
		beforeRetry: [
			//
			// TODO:
			// Cache error responses per server
			// export function that will return an endpoint (e.g for video cdn)
			//
			/* async ({ request, response, options, errors, retryCount }) => {
				const shouldStopRetry = await ky('https://example.com/api');
				if (shouldStopRetry) {
					return ky.stop;
				}

      },
      */
		],
	});

	return api;
};

export default create;
