import { Options } from "@mikro-orm/core";

const config: Options = {
  type: "postgresql",
  clientUrl: process.env.DB_URL,
  forceUtcTimezone: true,
  entities: ["dist/**/*.entity.js"],
  entitiesTs: ["src/**/*.entity.ts"],
  migrations: {
    path: "dist/modules/db/migrations",
    pathTs: "src/modules/db/migrations",
    snapshot: false,
    disableForeignKeys: false,
  },
  driverOptions: {
    connection: {
      ssl: {
        rejectUnauthorized: false,
      },
    },
  },
};

export default config;
