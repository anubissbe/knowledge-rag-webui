// Version management utilities

interface VersionInfo {
  current: string
  latest?: string
  updateAvailable?: boolean
  releaseNotes?: string
}

export class VersionChecker {
  private static VERSION_CHECK_KEY = 'knowledge-rag-version-check'
  private static CHECK_INTERVAL = 24 * 60 * 60 * 1000 // 24 hours

  static async checkForUpdates(): Promise<VersionInfo> {
    const currentVersion = import.meta.env.VITE_APP_VERSION || '1.0.0'
    
    try {
      // Check if we should perform the check
      const lastCheck = localStorage.getItem(this.VERSION_CHECK_KEY)
      if (lastCheck) {
        const lastCheckTime = parseInt(lastCheck, 10)
        if (Date.now() - lastCheckTime < this.CHECK_INTERVAL) {
          return { current: currentVersion }
        }
      }

      // In production, this would check against GitHub releases API
      const response = await fetch('https://api.github.com/repos/anubissbe/knowledge-rag-webui/releases/latest')
      
      if (response.ok) {
        const data = await response.json()
        const latestVersion = data.tag_name.replace('v', '')
        
        localStorage.setItem(this.VERSION_CHECK_KEY, Date.now().toString())
        
        return {
          current: currentVersion,
          latest: latestVersion,
          updateAvailable: this.compareVersions(currentVersion, latestVersion) < 0,
          releaseNotes: data.body
        }
      }
    } catch (error) {
      console.error('Failed to check for updates:', error)
    }

    return { current: currentVersion }
  }

  private static compareVersions(current: string, latest: string): number {
    const currentParts = current.split('.').map(Number)
    const latestParts = latest.split('.').map(Number)

    for (let i = 0; i < Math.max(currentParts.length, latestParts.length); i++) {
      const currentPart = currentParts[i] || 0
      const latestPart = latestParts[i] || 0
      
      if (currentPart < latestPart) return -1
      if (currentPart > latestPart) return 1
    }

    return 0
  }
}