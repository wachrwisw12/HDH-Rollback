export type DBConfig = {
  db_type: string;
  host: string;
  port: number;
  database: string;
  username: string;
};

export type DBConfigWithPassword = DBConfig & {
  password: string;
};
