<script lang="ts">
import { defineComponent } from "vue";
import type { PropType } from "vue";

import type { Appearance, Size, Theme } from "./types";

declare global {
  interface Window {
    turnstile: any;
    onloadTurnstileCallback: Function;
  }
}

export default defineComponent({
  name: "VueTurnstile",
  emits: ["rendering", "rendered", "verified"],
  props: {
    siteKey: {
      type: String,
      required: true,
    },
    theme: {
      type: String as PropType<Theme>,
      required: false,
      default: "auto",
    },
    size: {
      type: String as PropType<Size>,
      required: false,
      default: "normal",
    },
    autoReset: {
      type: Boolean,
      required: false,
      default: false,
    },
    resetTimeout: {
      type: Number,
      required: false,
      default: 295 * 1000,
    },
    recaptchaCompat: {
      type: Boolean,
      required: false,
      default: false,
    },
    explicitRender: {
      type: Boolean,
      required: false,
      default: false,
    },
    appearance: {
      type: String as PropType<Appearance>,
      required: false,
      default: "always",
    },
    language: {
      type: String,
      required: false,
      default: "auto",
    },
  },
  data() {
    return {
      widgetId: null as string | null,
      tokenResolver: null as Function | null,
      isTurnstileLoaded: false,
    };
  },
  methods: {
    init() {
      if (document.querySelector("script[src*='turnstile/v0/api.js']")) return;

      const script = document.createElement("script");
      const src = "https://challenges.cloudflare.com/turnstile/v0/api.js";

      script.src = `${src}?onload=onloadTurnstileCallback&render=explicit`;
      script.async = true;
      script.defer = true;

      window.onloadTurnstileCallback = () => {
        this.isTurnstileLoaded = true;

        this.onLoadTurnstile();
      };

      document.head.appendChild(script);
    },
    reset() {
      if (window.turnstile) {
        window.turnstile.reset(this.widgetId as string);
      }
    },
    remove() {
      if (this.widgetId) {
        window.turnstile.remove(this.widgetId as string);

        this.widgetId = null;
      }
    },
    render() {
      if (!window?.turnstile) {
        this.init();

        window.onloadTurnstileCallback = this.onLoadTurnstile;
      } else {
        this.onLoadTurnstile();
      }
    },
    onLoadTurnstile() {
      if (this.widgetId) {
        this.remove();
      }

      this.$emit("rendering");

      this.widgetId = window.turnstile.render("#cf-turnstile", {
        sitekey: this.siteKey,
        theme: this.theme,
        size: this.size,
        appearance: this.appearance,
        language: this.language,
        callback: (token: string) => {
          this.$emit("verified", token);

          if (this.tokenResolver) {
            this.tokenResolver(token);

            this.tokenResolver = null;
          }

          this.remove();

          if (this.autoReset) {
            setTimeout(() => {
              this.reset();
            }, this.resetTimeout);
          }
        },
        expiredCallback: (): void => {
          this.reset();
        },
        errorCallback: (error: any): void => {
          console.error(`Error callback: ${error}`);
        },
      });

      this.$emit("rendered");
    },
    async getToken() {
      if (!this.widgetId) {
        this.render();
      }

      return new Promise((resolve) => {
        this.tokenResolver = resolve;
      });
    },
  },
  beforeMount() {
    this.init();
  },
  mounted() {
    this.render();
  },
  beforeUnmount() {
    this.remove();
  },
  watch: {
    isTurnstileLoaded(newVal) {
      if (newVal) {
        this.onLoadTurnstile();
      }
    },
  },
});
</script>

<template>
  <div id="cf-turnstile">
    <slot />
  </div>
</template>
