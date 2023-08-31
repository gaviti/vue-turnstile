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
    <vue-turnstile site-key="1x00000000000000000000AA" @verified="token = $event" />
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

| Prop             | Type                          | Description                                                                                      | Required | Default       |
| ---------------- | ----------------------------- | ------------------------------------------------------------------------------------------------ | -------- | ------------- |
| site-key         | `String`                      | Your Turnstile sitekey - [Docs](https://developers.cloudflare.com/turnstile/get-started/)        | Yes      | N/A           |
| theme            | `'light' \| 'dark' \| 'auto'` | Widget theme                                                                                     | No       | `'auto'`      |
| size             | `'normal' \| 'compact'`       | Widget size                                                                                      | No       | `'normal'`    |
| position         | `'left' \| 'right'`           | Widget position (fixed to left or right)                                                         | No       | `undefined`   |
| auto-reset       | `Boolean`                     | Allow to refresh the token after some time (in milliseconds)                                     | No       | `false`       |
| reset-timeout    | `Number`                      | Refresh the token after some time (in milliseconds) * requires auto-reset to be true             | No       | `295000`      |
| recaptcha-compat | `Boolean`                     | Adds recaptcha compatibility layer                                                               | No       | `false`       |
| explicit-render  | `Boolean`                     | Renders the widget explicitly                                                                    | No       | `false`       |

## Methods

| Method          | Description       |
| --------------- | ----------------- |
| `render()`      | Render the widget |
| `reset()`       | Reset the widget  |
| `remove()`      | Remove the widget |

## Events

| Name             | Description       |
| ---------------- | ----------------- |
| `@verified`      | Returns the token |

## License

MIT License

Copyright (c) 2023 Gaviti
