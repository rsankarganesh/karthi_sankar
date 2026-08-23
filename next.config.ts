import type { NextConfig } from 'next';

const githubPages = process.env.GITHUB_ACTIONS === 'true';
const basePath = githubPages ? '/karthi_sankar' : '';

const nextConfig: NextConfig = {
  ...(githubPages ? { output: 'export', trailingSlash: true, basePath, assetPrefix: basePath } : {}),
};

export default nextConfig;
