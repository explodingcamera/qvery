import deepmerge from 'deepmerge';

// Unique AND Sorted array, removes the last duplicate first and keeps the order
const uniqueArray = array =>
	[...new Set(array.map(n => JSON.stringify(n)))].map(JSON.parse);

const sortRegionsByLocation = (regions, { continent, city }) => {
	try {
		if (!continent && !city) {
			[
				continent,
				city,
			] = new Intl.DateTimeFormat().resolvedOptions().timeZone.split('/');
		}

		const sameContinent = regions.find(
			region => region.continent === continent,
		);

		const sameCity = regions.find(region => region.cities.includes(continent));

		const results = [...sameCity, ...sameContinent, ...regions];

		return uniqueArray(results);
	} catch (_) {}

	// Return regions if we have no clue
	return regions;
};

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

const processArguments = (regions, options) => {
	const region = regions.find(region => region.name === options.region);
	if (options.regions.find(region => region.name === options.region)) {
		regions = uniqueArray([region, ...regions]);
	}

	if (options.city || options.continent) {
		return sortRegionsByLocation(regions, {
			city: options.city,
			continent: options.continent,
		});
	}

	return regions;
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

function shuffleArray(array) {
	for (let i = array.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[array[i], array[j]] = [array[j], array[i]];
	}
}

const sortServers = (regions, options) => {
	const servers = uniqueArray([
		...regions.map(region =>
			options.servers.filter(server => server.region === region.name),
		),
		options.servers,
	]);

	if (options.ping.enabled) {
		throw new Error('Ping testing is not implemented yet');
		// TODO run ping routines to sort more
	}

	return servers;
};

const create = (options = {}) => {
	options = deepmerge(defaultOptions, options);

	// We reverse the strategies since the most important ones are suppoest to run last
	const regions = sortRegions(options);
	const servers = sortServers(regions, options);

	return { servers };
};

export default create;
