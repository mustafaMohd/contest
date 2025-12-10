export default () => ({
  db: {
    client: 'mssql',
    connection: {
      server: process.env.DB_HOST ?? 'localhost', // note: "server" instead of "host"
      port: parseInt(process.env.DB_PORT ?? '1433', 10),
      user: process.env.DB_USER ?? 'sa',
      password: process.env.DB_PASS ?? 'Admin@1234',
      database: process.env.DB_NAME ?? 'Contest',
      options: {
        encrypt: false,             // required for local dev
        enableArithAbort: true,     // recommended for modern SQL Server
        trustServerCertificate: true, // avoids certificate errors
      },
    },
    pool: {
      min: 1,
      max: 5,
    },
  },
});
