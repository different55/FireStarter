async function FireStarter() {

    /******************************
     * Function definitions
     ******************************/

    // Adapted from downloadUrlToFile in ZenThemeMarketplaceParent.sys.mjs
    async function writeStringToFile(content, path, isStyleSheet = false) {
        try {
            content = isStyleSheet ? getFullStyleSheetContent(content) : content;
            let buffer = new TextEncoder().encode(content);
            await IOUtils.write(path, buffer);
        } catch (e) {
            console.error("FireStarter: Error writing file", path, e);
        }
    }

    /******************************
     * Basic info and hardcoded files
     ******************************/

    var name = prompt("Enter the name of the theme", "Sandbox");
    var id = "00000000-0000-4000-8000-000000000000";
    const themePath = PathUtils.join(ZenThemesCommon.themesRootPath, id);

    var stylePath = PathUtils.join(themePath, 'chrome.css');
    var starterStyle =
`@-moz-document url-prefix("chrome:") {
    @media (-moz-bool-pref: "theme.firestarter.under_construction") {
        #urlbar-background:before {
          content: ''; position: absolute; inset: 0;
          background: fixed repeating-linear-gradient(45deg, #0002, #0002 10px, #fff2 10px, #fff2 20px);
          border-radius: var(--border-radius-medium);
        }
    }
}`;

    var prefPath = PathUtils.join(themePath, 'preferences.json');
    var starterPrefs =
`[
  {
    "property": "theme.firestarter.under_construction",
    "label": "Under Construction",
    "type": "checkbox",
    "defaultValue": true
  }
]`;

    var readmePath = PathUtils.join(themePath, 'readme.md');
    var starterReadme =
`# ${name}
A WIP Zen Mod.`;


    /******************************
     * Write mod files and update zen-themes.json
     ******************************/


    // Write Firestarter files.
    try {
        await IOUtils.makeDirectory(themePath, { ignoreExisting: true });
    } catch (e) {
        console.error("FireStarter: Error creating theme directory", themePath, e);
    }
    writeStringToFile(starterStyle, stylePath, true);
    writeStringToFile(starterPrefs, prefPath);
    writeStringToFile(starterReadme, readmePath);

    // Check if Firestarter theme is already installed.
    var themes = await ZenThemesCommon.getThemes();

    // Construct theme
    var theme = {
        "id": id,
        "name": name,
        "description": "WIP Zen Mod",
        "homepage": "https://zen-browser.app/",
        "style": Services.io.newFileURI(new FileUtils.File(stylePath)).spec,
        "readme": Services.io.newFileURI(new FileUtils.File(readmePath)).spec,
        "author": "you",
        "version": "0.0.1a",
        "tags": [],
        "createdAt": "2025-01-01",
        "updatedAt": "2025-01-01",
        "preferences": Services.io.newFileURI(new FileUtils.File(prefPath)).spec,
        "enabled": true
    };

    // Add theme to themes object and write to zen-themes.json
    themes[id] = theme;
    try {
        await IOUtils.writeJSON(ZenThemesCommon.themesDataFile, themes);
    } catch (e) {
        console.error("FireStarter: Error writing themes data file", e);
    }

    // Trigger observer to let Zen know that themes have been updated.
    const pref = 'zen.themes.updated-value-observer';
    Services.prefs.setBoolPref(pref, !Services.prefs.getBoolPref(pref));
}
FireStarter();