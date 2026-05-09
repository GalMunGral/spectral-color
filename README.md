# Spectral Color

**Live demo**: https://galmungral.github.io/spectral-color/

## Purpose

Color mixing in pigment-based systems — paints, dyes, inks — is subtractive, not additive. Mixing a cyan pigment and a yellow pigment produces green because each absorbs part of the spectrum, and what reaches the eye is what neither absorbs. The perceived color is a function of the transmitted spectrum, not a weighted average of the pigment colors. This project makes that distinction concrete through two side-by-side approximations of subtractive color mixing.

## Strategy

Method 1 models absorption physically. Each pigment is assigned a peak absorption wavelength and a Gaussian absorption profile parameterized by bandwidth σ. The combined transmittance across the visible spectrum is integrated against the CIE 1931 color matching functions to produce an XYZ tristimulus value, which is then converted to sRGB. Method 2 takes a simpler approach: it interpolates directly between the pigment colors in a chosen color space (RGB, HSL, LAB, or LCH), treating the wavelength axis as the interpolation parameter.

The two methods rarely agree. The discrepancy is the point. Comparing them across color spaces — and inspecting the paths they trace in LAB and LCH — shows why straight-line interpolation in RGB or HSL produces muddied midpoints that physical integration does not.

## Technical

The CIE 1931 color matching functions x̄(λ), ȳ(λ), z̄(λ) are tabulated at 1 nm resolution over 380–780 nm. For a given pigment mixture, transmittance at each wavelength is computed as the product of Gaussian terms centered at each pigment's absorption peak. The integral over the visible range gives XYZ, which is converted to sRGB via the standard linear transformation and gamma correction.

The interpolation path in LAB and LCH is plotted against the gamut boundary for a given lightness slice, making it visually clear where a path exits the sRGB gamut and where it stays within perceptually uniform regions.