import type { NextConfig } from "next";
// const { i18n } = require("./next-i18next.config.js");

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // i18n: i18n,
  images: {
    domains: ["backend-spring2025.web-staging.eu"],
  },
};

export default nextConfig;
