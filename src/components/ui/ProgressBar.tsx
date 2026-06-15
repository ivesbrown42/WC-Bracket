import styles from './ProgressBar.module.css'

export interface ProgressBarProps {
  total: number
  completed: number
  label?: string
}

/** Segmented progress — one notch per step (e.g. one per group). */
export function ProgressBar({ total, completed, label }: ProgressBarProps) {
  return (
    <div className={styles.wrap}>
      {label && (
        <div className={styles.label}>
          <span className="wc-eyebrow">{label}</span>
          <span className={styles.count}>
            {completed}/{total}
          </span>
        </div>
      )}
      <div
        className={styles.track}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={completed}
      >
        {Array.from({ length: total }, (_, i) => (
          <span
            key={i}
            className={[styles.segment, i < completed && styles.filled]
              .filter(Boolean)
              .join(' ')}
          />
        ))}
      </div>
    </div>
  )
}
