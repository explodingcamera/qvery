import uniqueArray from './util/unique-array';

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

	// Return regions unchanged if we have no clue
	return regions;
};

export { sortRegionsByLocation, processArguments };
