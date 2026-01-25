/**
 * Настройки Huntflow для пользователя (локально, отдельно на каждого).
 * Ключи и токены обновляются так же, как общие по компании;
 * в зависимости от credentialSource используются те или иные ключи
 * или не используются, если диактивация подтверждена через тост.
 */

export type HuntflowCredentialSource = 'mine' | 'company' | 'disabled'

export interface HuntflowUserSettings {
  credentialSource: HuntflowCredentialSource
  activeSystem?: 'prod' | 'sandbox'
  sandboxUrl?: string
  sandboxApiKey?: string
  prodUrl?: string
  accessToken?: string
  refreshToken?: string
}

const HUNTFLOW_USER_SETTINGS_KEY = 'huntflow_user_settings'

export function getHuntflowUserSettings(): HuntflowUserSettings | null {
  if (typeof window === 'undefined') return null
  const raw = localStorage.getItem(HUNTFLOW_USER_SETTINGS_KEY)
  if (raw) {
    try {
      const o = JSON.parse(raw)
      return {
        credentialSource: o.credentialSource === 'mine' || o.credentialSource === 'company' || o.credentialSource === 'disabled' ? o.credentialSource : 'mine',
        activeSystem: o.activeSystem === 'sandbox' || o.activeSystem === 'prod' ? o.activeSystem : 'prod',
        sandboxUrl: o.sandboxUrl,
        sandboxApiKey: o.sandboxApiKey,
        prodUrl: o.prodUrl,
        accessToken: o.accessToken,
        refreshToken: o.refreshToken,
      }
    } catch {
      return null
    }
  }
  // Миграция со старого huntflowActiveSystem
  const old = localStorage.getItem('huntflowActiveSystem')
  if (old === 'sandbox' || old === 'prod') {
    return { credentialSource: 'mine', activeSystem: old }
  }
  return null
}

/**
 * Сохраняет настройки. Переданные поля (не undefined) мержатся с текущими.
 */
export function saveHuntflowUserSettings(patch: Partial<HuntflowUserSettings>): void {
  if (typeof window === 'undefined') return
  const prev = getHuntflowUserSettings() || { credentialSource: 'mine', activeSystem: 'prod' }
  const next: Record<string, unknown> = { ...prev }
  for (const k of Object.keys(patch) as (keyof HuntflowUserSettings)[]) {
    const v = patch[k]
    if (v !== undefined) next[k] = v
  }
  localStorage.setItem(HUNTFLOW_USER_SETTINGS_KEY, JSON.stringify(next))
}
