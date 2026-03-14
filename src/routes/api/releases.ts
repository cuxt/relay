import { createFileRoute } from '@tanstack/react-router'
import { marked } from 'marked'

interface GitHubRelease {
  tag_name: string
  name: string | null
  body: string | null
  published_at: string
  html_url: string
  prerelease: boolean
  draft: boolean
  target_commitish: string
  author: {
    login: string
    avatar_url: string
    html_url: string
  }
}

export const Route = createFileRoute('/api/releases')({
  server: {
    handlers: {
      GET: async () => {
        const githubToken = process.env.GITHUB_TOKEN
        const githubRepo = process.env.GITHUB_REPO

        if (!githubRepo) {
          return new Response(
            JSON.stringify({ error: 'GITHUB_REPO is not configured' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } },
          )
        }

        const headers: Record<string, string> = {
          Accept: 'application/vnd.github+json',
          'User-Agent': 'tanstack-start-template',
        }

        if (githubToken) {
          headers.Authorization = `Bearer ${githubToken}`
        }

        try {
          const response = await fetch(
            `https://api.github.com/repos/${githubRepo}/releases`,
            { headers },
          )

          if (!response.ok) {
            return new Response(
              JSON.stringify({ error: `GitHub API error: ${response.status}` }),
              { status: response.status, headers: { 'Content-Type': 'application/json' } },
            )
          }

          const releases: GitHubRelease[] = await response.json()

          const data = releases
            .filter((r) => !r.draft)
            .map((release) => ({
              tag: release.tag_name,
              name: release.name || release.tag_name,
              body: release.body ? marked.parse(release.body) : '',
              date: release.published_at,
              url: release.html_url,
              prerelease: release.prerelease,
              targetBranch: release.target_commitish,
              author: {
                login: release.author.login,
                avatar: release.author.avatar_url,
                url: release.author.html_url,
              },
            }))

          return new Response(JSON.stringify(data), {
            headers: { 'Content-Type': 'application/json' },
          })
        } catch {
          return new Response(
            JSON.stringify({ error: 'Failed to fetch releases' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } },
          )
        }
      },
    },
  },
})
