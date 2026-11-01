import { build, createServer } from "vite";
import vue from "@vitejs/plugin-vue2";
const config = {
  configFile: false,
  resolve: { alias: { vue: "vue/dist/vue.esm.js" } },
  plugins: [vue()],
  base: "./",
  server: { host: "127.0.0.1" },
};
if (process.argv.includes("--build")) await build(config);
else {
  const server = await createServer(config);
  await server.listen();
  server.printUrls();
}
