[![npm](https://img.shields.io/npm/v/react-color-a11y?logo=npm)](https://www.npmjs.com/package/react-color-a11y)
[![npm bundle size](https://img.shields.io/bundlephobia/min/react-color-a11y)](https://bundlephobia.com/package/react-color-a11y)
[![Publish New Release](https://github.com/Bayer-Group/react-color-a11y/actions/workflows/publish-new-release.yml/badge.svg)](https://github.com/Bayer-Group/react-color-a11y/actions/workflows/publish-new-release.yml)

# react-color-a11y
This is a React higher-order component to automatically enforce color accessibility on given components in your application. This is useful when you are rendering colors in your application that you don't have direct control over.

For example, if you are rendering an `svg` image that comes from an external source, or some colored text, you may not know ahead of time what those colors will be. This becomes even more of a challenge if your application can switch between light and dark mode.

This wrapper allows you to easily ensure that the content in these components is readable, regardless of what colors come into your application. The live demo gives you a good visual of what that could look like.

More information on contrast and accessibility here:
[https://webaim.org/resources/contrastchecker](https://webaim.org/resources/contrastchecker)

## Live Demo

https://bayer-group.github.io/react-color-a11y/

## Installation

```sh
npm i react-color-a11y
```
```sh
yarn add react-color-a11y
```
```sh
pnpm i react-color-a11y
```

## Usage

```jsx
import ReactColorA11y from 'react-color-a11y'

const App = () => (
  <ReactColorA11y>
    <div style={{background: '#111', color: '#222'}}>
      <p>This text came from an external source, it may be hard to read... 😢</p>
      <p>Never fear, ReactColorA11y will fix it! 🎉</p>
    </div>
  </ReactColorA11y>
)

export default App
```

## Testing
If you are unit testing your app with `jest` and `jsdom` you may see errors because of the lack of standard CSS support there. If you wish to make this wrapper transparent to the tests, you can mock it by placing this line in your [jest setup file](https://jestjs.io/docs/configuration#setupfilesafterenv-array):

```js
jest.mock('react-color-a11y', () => ({ children }) => children)
```

We are using `Cypress` to test the basic functionality of this component, so you should be able to assume that the component works and not test it yourself.

## Multiple Children
It is recommended to provide a single child component inside `ReactColorA11y`. If you provide multiple children, a `div` will be added around the children so that the color adjustments can be targeted correctly, but this extra element in the DOM could affect your specific styles, so it's preferred to pass only one child.

## Options

| prop | type | default | description |
| ---- | ---- | ------- | ----------- |
| colorPaletteKey | string | '' | If you are switching between light and dark mode for example, you would want to set this to recompute colors for each state. |
| requiredContrastRatio | number | 4.5 | This is the contrast Ratio that is required. Depending on the original colors, it may not be able to be reached, but will get as close as possible. https://webaim.org/resources/contrastchecker |
| flipBlackAndWhite | bool | false | This is an edge case. Should `#000000` be flipped to `#ffffff` when lightening, or should it only lighten as much as it needs to reach the required contrast ratio? Similarly for the opposite case. |
| preserveContrastDirectionIfPossible | bool | true | Try to preserve original contrast direction. For example, if the original foreground color is lighter than the background, try to lighten the foreground. If the required contrast ratio can not be met by lightening, then darkening may occur as determined by the luminance threshold. |
| backgroundColor | string | '' | If provided, this color will be used as the effective background color for determining the foreground color. This may be necessary if autodetection of the effective background color is not working, because of absolute positioning, z-index, or other cases where determining this is complex. |
