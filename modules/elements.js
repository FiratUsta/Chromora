// APP MISC
const LOADING_SCREEN    = document.getElementById("loader");
const VERSION_TEXT      = document.getElementById("versionText");
// HEX input
const HEX_INPUT         = document.getElementById("hex");
// RGB input
const R_INPUT           = document.getElementById("r");
const G_INPUT           = document.getElementById("g");
const B_INPUT           = document.getElementById("b");
// HSV input
const H_INPUT           = document.getElementById("h");
const S_INPUT           = document.getElementById("s");
const V_INPUT           = document.getElementById("v");
// Theme
const THEME_TOGGLE      = document.getElementById("themeToggle");
// Color wheel
const WHEEL             = document.getElementById("colorWheel");
const PICKER            = document.getElementById("picker");
const VALUE_SLIDER      = document.getElementById("value");
// Generator Parameters
const HUES              = document.getElementById("hues");
const TONES             = document.getElementById("tones");
const CHECK_RANDOM      = document.getElementById("randomHues");
const CHECK_ANALOGOUS   = document.getElementById("analogous");
const ANALOGOUS_ANGLE   = document.getElementById("analogousAngle")
const TINT_AMOUNT       = document.getElementById("tintAmount");
const TINT_COLOR        = document.getElementById("tintColor");
const CHECK_NAMING      = document.getElementById("nameColors");
// Quick Settings
const QUICK_TRIADIC     = document.getElementById("quickTriadic");
const QUICK_TETRADIC    = document.getElementById("quickTetradic");
const QUICK_MONOCHROME  = document.getElementById("quickMonochrome");
const QUICK_ANALOGOUS   = document.getElementById("quickAnalogous");
const QUICK_RANDOM      = document.getElementById("quickRandom");
const QUICK_COMPLEMENT  = document.getElementById("quickComplement");
const QUICK_BUTTONS     = [QUICK_ANALOGOUS, QUICK_COMPLEMENT, QUICK_MONOCHROME, QUICK_MONOCHROME, QUICK_RANDOM, QUICK_TETRADIC, QUICK_TRIADIC]
// Settings Tabs
const TAB_QUICK         = document.getElementById("quickTab");
const TAB_ADVANCED      = document.getElementById("advancedTab");
const OPTIONS_QUICK     = document.getElementById("quickOptions");
const OPTIONS_ADVANCED  = document.getElementById("advancedOptions");
// Swatch Display
const SWATCH_DISPLAY    = document.getElementById("display");
// Buttons
const BUTTON_RANDOM     = document.getElementById("randomButton");
const BUTTON_GENERATE   = document.getElementById("generateButton");
const BUTTON_EXPORT     = document.getElementById("exportButton");

export{
    // MISC
    LOADING_SCREEN,
    VERSION_TEXT,
    // HEX
    HEX_INPUT,
    // RGB
    R_INPUT,
    G_INPUT,
    B_INPUT,
    // HSV
    H_INPUT,
    S_INPUT,
    V_INPUT,
    // THEME
    THEME_TOGGLE,
    // COLOR WHEEL
    WHEEL,
    PICKER,
    VALUE_SLIDER,
    // PARAMETERS
    HUES,
    TONES,
    CHECK_RANDOM,
    CHECK_ANALOGOUS,
    ANALOGOUS_ANGLE,
    TINT_AMOUNT,
    TINT_COLOR,
    CHECK_NAMING,
    // SETTINGS TABS
    TAB_ADVANCED,
    TAB_QUICK,
    OPTIONS_ADVANCED,
    OPTIONS_QUICK,
    // QUICK SETTINGS
    QUICK_ANALOGOUS,
    QUICK_MONOCHROME,
    QUICK_RANDOM,
    QUICK_TETRADIC,
    QUICK_TRIADIC,
    QUICK_COMPLEMENT,
    QUICK_BUTTONS,
    // BUTTONS
    BUTTON_RANDOM,
    BUTTON_GENERATE,
    BUTTON_EXPORT
}