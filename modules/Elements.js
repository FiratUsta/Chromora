// HEX input
const HEX_INPUT     = document.getElementById("hex");
// RGB input
const R_INPUT       = document.getElementById("r");
const G_INPUT       = document.getElementById("g");
const B_INPUT       = document.getElementById("b");
// HSV input
const H_INPUT       = document.getElementById("h");
const S_INPUT       = document.getElementById("s");
const V_INPUT       = document.getElementById("v");
// Theme
const THEME_TOGGLE  = document.getElementById("themeToggle");
// Color wheel
const WHEEL         = document.getElementById("colorWheel");
const PICKER        = document.getElementById("picker");
const VALUE_SLIDER  = document.getElementById("value");
// Generator Parameters
const HUES = document.getElementById("hues");
const TONES = document.getElementById("tones");
const CHECK_RANDOM = document.getElementById("randomHues");
const CHECK_ANALOGOUS = document.getElementById("analogous");
const ANALOGOUS_ANGLE = document.getElementById("analogousAngle")
const TINT_AMOUNT = document.getElementById("tintAmount");
const TINT_COLOR = document.getElementById("tintColor");

// Buttons
const BUTTON_RANDOM = document.getElementById("randomButton");
export{
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
    // BUTTONS
    BUTTON_RANDOM
}