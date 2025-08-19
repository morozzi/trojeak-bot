import adapter from '@sveltejs/adapter-static';

export default {
	kit: {
		adapter: adapter({
			pages: 'dist',
			assets: 'dist',
			fallback: 'index.html',
			precompress: false,
			strict: false
		}),
		appDir: 'app',
		prerender: {
			entries: ['/'],
			handleHttpError: ({ path, referrer, message }) => {
				// Ignore 404s for .php paths
				if (path.includes('.php')) {
					return;
				}
				throw new Error(message);
			}
		}
	}
};