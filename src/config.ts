export type ConfigProps = {
  Sidebar_drawer: boolean;
  Customizer_drawer: boolean;
  mini_sidebar: boolean;
  fontTheme: string;
  inputBg: boolean;
  setHorizontalLayout: boolean;
  actTheme: string;
  boxed: boolean;
};
const config: ConfigProps = {
  Sidebar_drawer: true,
  Customizer_drawer: false,
  mini_sidebar: false,
  setHorizontalLayout: false,
  actTheme: 'LightBlueTheme',
  fontTheme: 'Roboto',
  inputBg: false,
  boxed: true
};

export default config;
