# Vue Turnstile

A Vue 2.7.14 component wrapper for [Cloudflare's Turnstile](https://developers.cloudflare.com/turnstile/)

## Installation

### NPM

```bash
npm install @gaviti/vue-turnstile
```

### Yarn

```bash
yarn add @gaviti/vue-turnstile
```

## Usage

```javascript
<template>
  <div>
    <vue-turnstile @verified="token = $event" />
    <div>Token: {{ token }}</div>
  </div>
</template>

<script>
import VueTurnstile from '@gaviti/vue-turnstile';

export default {
  components: {
    VueTurnstile
  },
  data() {
    return {
      token: null,
    };
  },
};
</script>
```

## Customization options

| Prop             | Type                          | Description                                                                               | Required | Default     |
| ---------------- | ----------------------------- | ----------------------------------------------------------------------------------------- | -------- | ----------- |
| site-key         | `String`                      | Your Turnstile sitekey - [Docs](https://developers.cloudflare.com/turnstile/get-started/) | Yes      | N/A         |
| theme            | `'light' \| 'dark' \| 'auto'` | Widget theme                                                                              | No       | `'auto'`    |
| size             | `'normal' \| 'compact'`       | Widget size                                                                               | No       | `'normal'`  |
| position         | `'left' \| 'right'`           | Widget position (fixed to left or right)                                                  | No       | `undefined` |
| auto-reset       | `Boolean`                     | Allow to refresh the token after some time (in milliseconds)                              | No       | `false`     |
| reset-timeout    | `Number`                      | Refresh the token after some time (in milliseconds) \* requires auto-reset to be true     | No       | `295000`    |
| recaptcha-compat | `Boolean`                     | Adds recaptcha compatibility layer                                                        | No       | `false`     |
| explicit-render  | `Boolean`                     | Renders the widget explicitly                                                             | No       | `false`     |
| appearance       | `String`                      | Allow to change the appearance                                                            | No       | `always`    |

## Methods

| Method         | Description          |
| -------------- | -------------------- |
| `onRender()`   | Render the widget    |
| `onReset()`    | Reset the widget     |
| `onRemove()`   | Remove the widget    |
| `onExectute()` | Generate a new token |

## Events

| Name         | Description                                    |
| ------------ | ---------------------------------------------- |
| `@verified`  | Returns the token                              |
| `@rendering` | Emitted on mounted (returns nothing)           |
| `@rendered`  | Emitted at the end of render (returns nothing) |

## Slots

| Name      | Description  |
| --------- | ------------ |
| `default` | Default slot |

## License

MIT License

Copyright (c) 2023 Gaviti
