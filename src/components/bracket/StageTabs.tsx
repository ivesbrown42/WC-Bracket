import styles from './StageTabs.module.css'

export type StageTabState = 'current' | 'done' | 'locked' | 'default'

export interface StageTabItem {
  key: string
  label: string
  state: StageTabState
  onClick?: () => void
}

/**
 * A horizontal row of navigation tabs. `variant="pill"` is the stage-level row
 * (Groups · R32 · R16 …); `variant="text"` is the lighter group-level row.
 * Locked tabs are not clickable.
 */
export function StageTabs({
  items,
  variant = 'pill',
}: {
  items: StageTabItem[]
  variant?: 'pill' | 'text'
}) {
  return (
    <div className={styles.tabs}>
      {items.map((it) => (
        <button
          key={it.key}
          type="button"
          className={[
            variant === 'pill' ? styles.pill : styles.text,
            styles[it.state],
          ].join(' ')}
          disabled={it.state === 'locked'}
          aria-disabled={it.state === 'locked'}
          aria-current={it.state === 'current'}
          onClick={() => it.state !== 'locked' && it.onClick?.()}
        >
          {it.state === 'locked' ? `🔒 ${it.label}` : it.label}
        </button>
      ))}
    </div>
  )
}
