/** @type {import('next').NextConfig} */
const isGithubActions = process.env.GITHUB_ACTIONS === "true";
const repositoryName = process.env.GITHUB_REPOSITORY?.split("/")[1] ?? "";
const isUserOrOrgSite = repositoryName.toLowerCase().endsWith(".github.io");
const hasRepositoryName = repositoryName.length > 0;
const basePath = isGithubActions && hasRepositoryName && !isUserOrOrgSite ? `/${repositoryName}` : "";

const nextConfig = {
  output: isGithubActions ? "export" : undefined,
  images: {
    unoptimized: true
  },
  trailingSlash: true,
  basePath,
  assetPrefix: basePath || undefined
};

export default nextConfig;
