import { Octokit } from "octokit";

export const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN, // Optional: Personal Access Token for higher rate limits if needed by backend
});

/**
 * Helper to get a user's GitHub client using their access token
 * @param accessToken User's OAuth access token
 */
export const getUserOctokit = (accessToken: string) => {
  return new Octokit({
    auth: accessToken,
  });
};
