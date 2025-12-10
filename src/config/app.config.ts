export default () => ({
  appName: process.env.APP_NAME ?? 'Nest App',
  port: parseInt(process.env.PORT ?? '3000', 10),
});
