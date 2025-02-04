async function FireStarter() {

    /******************************
     * Basic info
     ******************************/

    // Paths
    const themePath = PathUtils.join(ZenThemesCommon.themesRootPath, id);
    const stylePath = PathUtils.join(themePath, 'chrome.css');
    const prefPath = PathUtils.join(themePath, 'preferences.json');
    const readmePath = PathUtils.join(themePath, 'readme.md');
    const styleURI = Services.io.newFileURI(new FileUtils.File(stylePath)).spec;
    const prefURI = Services.io.newFileURI(new FileUtils.File(prefPath)).spec;
    const readmeURI = Services.io.newFileURI(new FileUtils.File(readmePath)).spec;

    const theme = {
        "id": crypto.randomUUID(),
        "name": prompt("Enter the name of the theme", "Sandbox"),
        "description": "WIP Zen Mod",
        "homepage": "https://github.com/different55/FireStarter",
        "style": styleURI,
        "readme": prefURI,
        "author": "you",
        "version": "0.0.1a",
        "tags": [],
        "createdAt": "2025-01-01",
        "updatedAt": "2025-01-01",
        "preferences": readmeURI,
        "enabled": true
    };

    /******************************
     * Function definitions
     ******************************/

    // Adapted from downloadUrlToFile in ZenThemeMarketplaceParent.sys.mjs
    async function writeStringToFile(content, path, isStyleSheet = false) {
        content = isStyleSheet ? getFullStyleSheetContent(content) : content;
        const buffer = new TextEncoder().encode(content);
        await IOUtils.write(path, buffer);
    }

    // Trigger observer to let Zen know that themes have been updated.
    function reloadThemes() {
        const pref = 'zen.themes.updated-value-observer';
        Services.prefs.setBoolPref(pref, !Services.prefs.getBoolPref(pref));
    }

    /******************************
     * Hardcoded files
     ******************************/

    const starterStyle =
`@-moz-document url-prefix("chrome:") {
    @media (-moz-bool-pref: "theme.firestarter.under_construction") {
        #urlbar-background:before {
          content: ''; position: absolute; inset: 0;
          background: fixed repeating-linear-gradient(45deg, #0002, #0002 10px, #fff2 10px, #fff2 20px);
          border-radius: var(--border-radius-medium);
        }
    }
}`;

    const starterPrefs =
`[
  {
    "property": "theme.firestarter.under_construction",
    "label": "Under Construction",
    "type": "checkbox",
    "defaultValue": true
  }
]`;

    const starterReadme = `# ${theme.name}\n${theme.description}`;

    /******************************
     * Write mod files and update zen-themes.json
     ******************************/

    // Write Firestarter files.
    try {
        await IOUtils.makeDirectory(themePath, { ignoreExisting: true });
        writeStringToFile(starterStyle, stylePath, true);
        writeStringToFile(starterPrefs, prefPath);
        writeStringToFile(starterReadme, readmePath);
    } catch (e) {
        return console.error("FireStarter: Error writing starter files", themePath, e);
    }

    // Add theme to themes object and write to zen-themes.json
    let themes = await ZenThemesCommon.getThemes();
    themes[id] = theme;
    try {
        await IOUtils.writeJSON(ZenThemesCommon.themesDataFile, themes);
    } catch (e) {
        return console.error("FireStarter: Error writing themes data file", e);
    }

    reloadThemes();
}
FireStarter();