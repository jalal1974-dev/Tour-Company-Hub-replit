{
  "name": "@workspace/scripts",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "hello": "tsx ./src/hello.ts",
    "seed-from-html": "tsx ./src/seed-from-html.ts",
    "typecheck": "tsc -p tsconfig.json --noEmit"
  },
  "dependencies": {
    "@workspace/db": "workspace:*",
    "drizzle-orm": "catalog:",
    "pg": "^8.20.0"
  },
  "devDependencies": {
    "@types/node": "catalog:",
    "tsx": "catalog:"
  }
}
