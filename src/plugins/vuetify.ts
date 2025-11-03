import { createVuetify } from 'vuetify';
import { aliases, mdi } from 'vuetify/iconsets/mdi-svg';
import { icons } from './mdi-icon'; // Import icons from separate file
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import { LightBlueTheme } from '@/theme/LightBlueTheme';

export default createVuetify({
  components,
  directives,
  icons: {
    defaultSet: 'mdi',
    aliases: {
      ...aliases,
      ...icons
    },
    sets: {
      mdi
    }
  },
  theme: {
    defaultTheme: 'LightBlueTheme',
    themes: {
      LightBlueTheme
    }
  },
  defaults: {
    VBtn: {
      rounded: 'sm',
      color: 'primary',
      variant: 'flat',
      elevation: '0'
    },
    VCard: {
      rounded: 'md',
      elevation: '0'
    },
    VTextField: {
      rounded: 'lg'
    },
    VTooltip: {
      location: 'top',
      elevation: '0'
    }
  }
});
