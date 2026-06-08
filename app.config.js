const createJiti = require('jiti');
const jiti = createJiti(__filename);
const { withXcodeProject } = require('@expo/config-plugins');

// Synchronously require the ESM module using jiti
const qvacModule = jiti('@qvac/sdk/expo-plugin');
const withQvacSDK = qvacModule.withQvacSDK || qvacModule.default;

// Custom plugin to quote the react-native-xcode.sh backtick expression
// so directory paths containing spaces don't cause word-splitting failures
// during the "Bundle React Native code and images" build phase.
const withEscapeBundleShellScript = (config) => {
    return withXcodeProject(config, (config) => {
        const xcodeProject = config.modResults;
        const buildPhases = xcodeProject.hash.project.objects.PBXShellScriptBuildPhase;
        for (const key in buildPhases) {
            const buildPhase = buildPhases[key];
            if (buildPhase && buildPhase.shellScript && buildPhase.shellScript.includes('react-native-xcode.sh')) {
                let s = buildPhase.shellScript;
                // The xcode parser keeps the pbxproj escaping in the JS string.
                // The problematic line in the raw string looks like:
                //   `\"$NODE_BINARY\" --print \"require(...)...\"`
                // (where \" is the literal two-char sequence backslash-quote)
                // We need to wrap the whole backtick expression in escaped quotes:
                //   \"`\"$NODE_BINARY\" --print \"require(...)...\"`\"
                //
                // We search for the backtick that starts the expression, and the
                // backtick that ends it, then wrap with \".
                const marker = "react-native-xcode.sh";
                const markerIdx = s.indexOf(marker);
                if (markerIdx === -1) continue;

                // Find the opening backtick before the marker
                let openBacktick = s.lastIndexOf('`', markerIdx);
                if (openBacktick === -1) continue;

                // Find the closing backtick after the marker
                let closeBacktick = s.indexOf('`', markerIdx);
                if (closeBacktick === -1) continue;

                // Check if already quoted: look for \" immediately before the opening backtick
                const escQuote = '\\"';
                const alreadyQuoted = (openBacktick >= 2 && s.substring(openBacktick - 2, openBacktick) === escQuote);
                if (alreadyQuoted) continue;

                // Wrap: insert \" before the opening backtick and \" after the closing backtick
                s = s.substring(0, openBacktick) + escQuote + s.substring(openBacktick, closeBacktick + 1) + escQuote + s.substring(closeBacktick + 1);
                buildPhase.shellScript = s;
            }
        }
        return config;
    });
};

module.exports = ({ config }) => {
    config.plugins = [
        [
            "expo-build-properties",
            {
                "android": { "minSdkVersion": 29 }
            }
        ],
        withQvacSDK,
        [
            "expo-audio",
            {
                "microphonePermission": "Allow $(PRODUCT_NAME) to access your microphone."
            }
        ],
        "expo-router",
        [
            "expo-splash-screen",
            {
                "backgroundColor": "#208AEF",
                "android": {
                    "image": "./assets/images/splash-icon.png",
                    "imageWidth": 76
                }
            }
        ],
        withEscapeBundleShellScript
    ];

    return config;
};