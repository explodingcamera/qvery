// Unique AND Sorted array, removes the last duplicate first and keeps the order
const uniqueArray = array =>
	[...new Set(array.map(n => JSON.stringify(n)))].map(JSON.parse);

export default uniqueArray;
