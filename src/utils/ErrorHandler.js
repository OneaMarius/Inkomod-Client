// File: Client/src/utils/ErrorHandler.js

export const getStandardErrorMessage = (error) => {
	// Prioritize explicit messages provided by the backend payload
	if (error.response?.data?.message) {
		return error.response.data.message;
	}

	const status = error.response?.status;

	switch (status) {
		case 400:
			return 'Invalid data provided. Please check your inputs.';
		case 401:
			return 'Authentication failed. Incorrect username or password.';
		case 403:
			return 'Your session has expired. Please log in again.';
		case 404:
			return 'The requested service is currently unavailable. Please try again later.';
		case 409:
			return 'Account access is restricted.';
		case 429:
			return 'Too many requests. The connection to the realm is overloaded.';
		case 500:
		case 502:
		case 503:
		case 504:
			return "The realm's servers are experiencing disturbances. Please try again later.";
		default:
			if (error.code === 'ERR_NETWORK') {
				return 'Network error. Unable to reach the server. Check your connection.';
			}
			return 'An unexpected anomaly occurred. Please try again.';
	}
};
