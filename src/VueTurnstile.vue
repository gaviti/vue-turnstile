<script setup lang="ts">
import { ref, onBeforeMount, onMounted, onBeforeUnmount } from 'vue';
import type { PropType } from 'vue';

declare global {
  interface Window {
    turnstile: any;
    onloadTurnstileCallback: Function;
  }
}

type Styles = {
  position: string;
  bottom: string;
  zIndex: string;
  [key: string]: string;
}

const props = defineProps({
  siteKey: {
    type: String,
    required: true,
  },
  theme: {
    type: String as PropType<'light' | 'dark' | 'auto'>,
    required: false,
    default: 'auto',
  },
  size: {
    type: String as PropType<'compact' | 'normal'>,
    required: false,
    default: 'normal',
  },
  position: {
    type: String as PropType<'left' | 'right'>,
    required: false,
    default: undefined,
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
});

const emit = defineEmits(['verified', 'rendered']);

const widgetId = ref<string | null>(null);
const observer = ref<MutationObserver | null>(null);

const onReset = () => {
  if (widgetId.value) {
    window.turnstile.reset(widgetId.value);
  }
};

const onLoadRender = () => {
  window.onloadTurnstileCallback = () => {
    onRender();
  };
}

const initObserver = () => {
  const iframe = document.getElementById(widgetId.value as string) as HTMLIFrameElement;
  const turnstileBox: HTMLElement = iframe!.parentNode as HTMLElement;

  if (turnstileBox && iframe && !observer.value) {
    const observerConfig = {
      attributes: true,
      attributeFilter: ['style'],
    };

    const observerCallback = () => {
      const styles: Styles = {
        position: 'fixed',
        bottom: '5px',
        zIndex: '1000',
      };

      styles[props.position! as string] = '5px';

      Object.assign(iframe.style, styles);

      setTimeout(() => {
        iframe.style.display = 'none';
      }, 5000);
    };

    observer.value = new MutationObserver(observerCallback);

    observer.value.observe(iframe, observerConfig);
  }
};

const onRender = () => {
  widgetId.value = window.turnstile.render('.cf-turnstile', {
    sitekey: props.siteKey,
    theme: props.theme,
    size: props.size,
    callback: (response: any) => {
      emit('verified', response);

      setTimeout(() => {
        onReset();
      }, props.resetTimeout);
    },
    expiredCallback: () => {
      onReset();
    },
    errorCallback: (error: any) => {
      console.error(`Error callback: ${error}`);
    },
  });

  if (props.position !== undefined) {
    initObserver();
  }

  emit('rendered');
};

const initTurnstile = () => {
  const script: HTMLScriptElement = document.createElement('script');

  script.src = `https://challenges.cloudflare.com/turnstile/v0/api.js?${props.recaptchaCompat ? 'compat=recaptcha' : ''}${props.explicitRender ? '&render=explicit': ''}&onload=onloadTurnstileCallback`;
  script.async = true;
  script.defer = true;

  document.head.appendChild(script);
};

onBeforeMount(() => {
  initTurnstile();
});

onMounted(() => {
  if (window.turnstile === undefined || !window.turnstile) {
    onLoadRender();
  } else {
    onRender();
  }
});

onBeforeUnmount(() => {
  if (observer.value) {
    observer.value.disconnect();
  }
});
</script>

<template>
  <div class="cf-turnstile" :data-sitekey="siteKey" />
</template>
