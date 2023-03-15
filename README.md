[![npm](https://img.shields.io/npm/v/react-color-a11y?logo=npm)](https://www.npmjs.com/package/react-color-a11y)
[![npm bundle size](https://img.shields.io/bundlephobia/min/react-color-a11y)](https://bundlephobia.com/package/react-color-a11y)
[![Publish New Release](https://github.com/Codenough-LLC/react-color-a11y/actions/workflows/publish-new-release.yml/badge.svg)](https://github.com/Codenough-LLC/react-color-a11y/actions/workflows/publish-new-release.yml)

# react-color-a11y
React higher-order component to automatically enforce color accessibility [https://webaim.org/resources/contrastchecker](https://webaim.org/resources/contrastchecker)

## Live Demo

https://codenough-llc.github.io/react-color-a11y/

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
      <p>This text is hard to see... 😢</p>
      <p>Never fear, ReactColorA11y will fix it! 🎉</p>
    </div>
  </ReactColorA11y>
);

export default App
```

## Options

| prop | type | default |
| ---- | ---- | ------- |
| colorPaletteKey | string | '' |
| requiredContrastRatio | number | 4.5 |
| flipBlackAndWhite | bool | false |
