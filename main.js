import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

import { setSigma, integrate } from "./integrate.js";
import { setInterpolator, interpolate } from "./interpolate.js";
import { repeat, normalize, toLAB, toLCh } from "./utils.js";
import { plot, drawBackground } from "./plot.js";

const interpolators = [
  { name: "RGB", f: d3.interpolateRgb },
  { name: "HSL", f: d3.interpolateHsl },
  { name: "LAB", f: d3.interpolateLab },
  { name: "LCH", f: d3.interpolateHcl },
];

const YRMBC = [
  [450, "#FFFF00"],
  [495, "#FF0300"],
  [530, "#FF00FF"],
  [590, "#0000FF"],
  [625, "#00FFFF"],
];

const YMC = [
  [450, "#FFFF00"],
  [530, "#FF00FF"],
  [625, "#00FFFF"],
];

const LAMBDA_RANGE_MIN = 300;
const LAMBDA_RANGE_MAX = 800;

const lambdas = repeat(
  LAMBDA_RANGE_MAX - LAMBDA_RANGE_MIN + 1,
  (_, i) => LAMBDA_RANGE_MIN + i
);

sigmaControl.oninput = (e) => {
  e.target.value = Math.max(e.target.value, 1);
  setSigma(Number(e.target.value));
  render();
};

interpolators.forEach((interp) => {
  const button = document.createElement("button");
  button.textContent = interp.name;
  button.onclick = () => {
    [...colorSpaces.children].forEach((el) => (el.disabled = false));
    button.disabled = true;
    setInterpolator(interp.f);
    render();
  };
  if (interp.name == "RGB") {
    button.disabled = true;
  }
  colorSpaces.append(button);
});

colorPickerGroup.oninput = (e) => {
  if (e.target.classList.contains("lambdaInput")) {
    e.target.closest(".colorPicker").querySelector(".lambdaValue").textContent =
      e.target.value + " nm";
  }
  render();
};

presetBtn1.onclick = () => {
  presetBtn1.disabled = true;
  presetBtn2.disabled = false;
  usePreset(YRMBC);
};
presetBtn2.onclick = () => {
  presetBtn1.disabled = false;
  presetBtn2.disabled = true;
  usePreset(YMC);
};

addBtn.onclick = () => {
  colorPickerGroup.append(
    colorPickerTemplate.content.children[0].cloneNode(true)
  );
  render();
};

removeBtn.onclick = () => {
  colorPickerGroup.querySelector(".colorPicker:last-child").remove();
  render();
};

function usePreset(preset) {
  colorPickerGroup.innerHTML = "";
  preset.forEach(([peak, color]) => {
    const el = colorPickerTemplate.content.children[0].cloneNode(true);
    el.querySelector(".lambdaInput").value = peak;
    el.querySelector(".lambdaValue").textContent = peak + " nm";
    el.querySelector(".colorInput").value = color;
    colorPickerGroup.append(el);
    render();
  });
}

let lightness = 0;

for (const container of [
  absorbed,
  perceivedIntegrated,
  perceivedInterpolated,
]) {
  let n = lambdas.length;
  while (n--) {
    const el = document.createElement("div");
    el.className = "colorStep";

    container.append(el);
  }
}

function render() {
  const ColorStops = [...colorPickerGroup.children]
    .map((el) => ({
      peak: +el.querySelector(".lambdaInput").value,
      name: el.querySelector(".colorInput").value,
    }))
    .sort((a, b) => a.peak - b.peak);

  const integrated = lambdas.map((l) => integrate(l));
  const interpolated = lambdas.map(interpolate(ColorStops));

  for (const [i, color] of integrated.entries()) {
    const { r, g, b } = d3.rgb(color);
    const el = absorbed.children[i];
    el.style.backgroundColor = `rgb(${255 - r}, ${255 - g}, ${255 - b})`;
  }

  for (const [i, color] of integrated.entries()) {
    const { r, g, b } = d3.rgb(color);
    const el = perceivedIntegrated.children[i];
    el.style.backgroundColor = `rgb(${r}, ${g}, ${b})`;
  }

  for (const [i, color] of interpolated.entries()) {
    const { r, g, b } = d3.rgb(color);
    const el = perceivedInterpolated.children[i];
    el.style.backgroundColor = `rgb(${r}, ${g}, ${b})`;
  }

  if (lightnessControl.value != lightness) {
    lightness = lightnessControl.value;
    drawBackground(
      plotContainer.querySelector(".lab > canvas"),
      [-128, 127],
      [-128, 127],
      (a, b) => d3.lab(lightness, a, b),
      (x, y) => {
        const { r, g, b } = d3.rgb(d3.lab(lightness, x, y));
        return r >= 0 && r <= 255 && g >= 0 && g <= 255 && b >= 0 && b <= 255;
      }
    );

    drawBackground(
      plotContainer.querySelector(".lch > canvas"),
      [-210, 150],
      [0, 230],
      (h, c) => d3.lch(lightness, c, h),
      (x, y) => {
        const { r, g, b } = d3.rgb(d3.lch(lightness, y, x));
        return r >= 0 && r <= 255 && g >= 0 && g <= 255 && b >= 0 && b <= 255;
      }
    );
  }

  plot(
    plotContainer.querySelector(".lab > svg"),
    [-128, 127],
    [-128, 127],
    checkbox1.checked ? integrated.map(toLAB) : [],
    checkbox2.checked ? interpolated.map(toLAB) : [],
    "a* (green-red)",
    "b* (blue-yellow)"
  );

  plot(
    plotContainer.querySelector(".lch > svg"),
    [-210, 150],
    [0, 230],
    checkbox1.checked ? integrated.map(toLCh) : [],
    checkbox2.checked ? interpolated.map(toLCh) : [],
    "h (hue)",
    "C (chroma)"
  );
}

window.render = render;
presetBtn1.disabled = true;
usePreset(YRMBC);
