export const manifest = (() => {
function __memo(fn) {
	let value;
	return () => value ??= (value = fn());
}

return {
	appDir: "app",
	appPath: "app",
	assets: new Set([]),
	mimeTypes: {},
	_: {
		client: {start:"app/immutable/entry/start.CEDHiqWl.js",app:"app/immutable/entry/app.00-SIblz.js",imports:["app/immutable/entry/start.CEDHiqWl.js","app/immutable/chunks/BfTNCZCY.js","app/immutable/chunks/DW4CAaEY.js","app/immutable/chunks/DSYlFEXo.js","app/immutable/entry/app.00-SIblz.js","app/immutable/chunks/BpQfkXpT.js","app/immutable/chunks/DSYlFEXo.js","app/immutable/chunks/DW4CAaEY.js","app/immutable/chunks/Bzak7iHL.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
		nodes: [
			__memo(() => import('./nodes/0.js')),
			__memo(() => import('./nodes/1.js')),
			__memo(() => import('./nodes/2.js'))
		],
		remotes: {
			
		},
		routes: [
			{
				id: "/",
				pattern: /^\/$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 2 },
				endpoint: null
			}
		],
		prerendered_routes: new Set([]),
		matchers: async () => {
			
			return {  };
		},
		server_assets: {}
	}
}
})();
