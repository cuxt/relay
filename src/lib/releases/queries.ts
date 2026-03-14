import { createServerFn } from '@tanstack/react-start'
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

export interface Release {
  tag: string
  name: string
  body: string
  date: string
  url: string
  prerelease: boolean
  author: {
    login: string
    avatar: string
    url: string
  }
}

export const fetchReleases = createServerFn({ method: 'GET' }).handler(
  async (): Promise<Array<Release>> => {
    const githubToken = process.env.GITHUB_TOKEN
    const githubRepo = process.env.GITHUB_REPO

    if (!githubRepo) {
      return []
    }

    const headers: Record<string, string> = {
      Accept: 'application/vnd.github+json',
      'User-Agent': 'tanstack-start-template',
    }

    if (githubToken) {
      headers.Authorization = `Bearer ${githubToken}`
    }

    try {
      const response = await fetch(`https://api.github.com/repos/${githubRepo}/releases`, {
        headers,
      })

      if (!response.ok) return []

      const releases: GitHubRelease[] = await response.json()

      return releases
        .filter((r) => !r.draft)
        .map((release) => ({
          tag: release.tag_name,
          name: release.name || release.tag_name,
          body: release.body ? (marked.parse(release.body) as string) : '',
          date: release.published_at,
          url: release.html_url,
          prerelease: release.prerelease,
          author: {
            login: release.author.login,
            avatar: release.author.avatar_url,
            url: release.author.html_url,
          },
        }))
    } catch {
      return []
    }
  }
)
