import deepmerge from 'deepmerge';

import uniqueArray from './util/unique-array';
import shuffleArray from './util/shuffle-array';

import { processArguments, sortRegionsByLocation } from './regions';

const defaultOptions = {
	continent: null, // The Users Continent
	city: null, // The Users City
	region: null, // The Users Region

	suffix: '',
	strategies: ['arguments', 'timezone' /* , 'geo-api' */, 'random'], // In order of importance
	strategyOptions: {},
	ping: {
		enabled: false,
		routines: [
			{ count: 3, spread: 'even' },
			{ count: 3, spread: 'left' },
		],
	},
	regions: [
		{
			name: 'us-west',
			continent: 'America',
			city: '',
		},
		{
			name: 'eu-center',
			continent: 'America',
			cities: ['Berlin', 'Amsterdam'], // Cities from https://en.wikipedia.org/wiki/List_of_tz_database_time_zones or supplied manualy throug the city option
		},
	],
	servers: [
		{ base: 'de-12312333.canx.io', region: 'eu-central' },
		{ base: 'fr-23452345.canx.io', region: 'eu-central' },
	],
};

const sortRegions = options => {
	const regions = options.strategies.reduceRight((regions, strategy) => {
		switch (strategy) {
			case 'timezone':
				return sortRegionsByLocation(regions, options);
			case 'arguments':
				return processArguments(regions, options);
			case 'random':
				return shuffleArray(regions);
			default:
				return regions;
		}
	}, options.regions);

	return regions;
};

const sortServers = (regions, options) => {
	const servers = uniqueArray([
		...regions.map(region =>
			options.servers.filter(server => server.region === region.name),
		),
		options.servers,
	]);

	if (options.ping.enabled) {
		// TODO run ping routines to sort more
		throw new Error('Ping testing is not implemented yet');
	}

	return servers;
};

const create = (options = {}) => {
	options = deepmerge(defaultOptions, options);

	// We reverse the strategies since the most important ones are suppoest to run last
	const regions = sortRegions(options);
	const servers = sortServers(regions, options);

	let currentServerIndex = 0;
	let reportedServers = [];

	const reportServer = (server, reason = 'unreachable') => {
		const alreadyReported = reportedServers.find(s => s.base === server.base);
		const reportedIndex = reportedServers.indexOf(alreadyReported);

		if (alreadyReported) {
			reportedServers[reportedIndex] = {
				count: alreadyReported.count + 1,
				reports: [...alreadyReported.reports, { time: Date.now(), reason }],
				...alreadyReported,
				...server,
			};
		} else {
			reportedServers.push({
				count: 1,
				reports: [{ time: Date.now(), reason }],
				...server,
			});
		}

		return reportedServers;
	};

	const switchServer = () => {
		// Don't switch to a reacently reported server if possible
	};

	return {
		servers,
		get currentServer() {
			return this.servers[this.__internal.currentServerIndex];
		},
		__internal: { currentServerIndex },
		report: reportServer,
		switch: switchServer,
	};
};

export default create;
