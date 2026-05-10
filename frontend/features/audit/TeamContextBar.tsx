'use client'

import type { UseCase } from '@/lib/types'
import { USE_CASE_OPTIONS } from '@/lib/constants'
import styles from './audit.module.css'

interface TeamContextBarProps {
  teamSize: number
  useCase: UseCase
  onTeamSizeChange: (value: number) => void
  onUseCaseChange: (value: UseCase) => void
}

export function TeamContextBar({
  teamSize,
  useCase,
  onTeamSizeChange,
  onUseCaseChange,
}: TeamContextBarProps) {
  const dec = () => onTeamSizeChange(Math.max(1, teamSize - 1))
  const inc = () => onTeamSizeChange(teamSize + 1)

  return (
    <section className={styles.section}>
      <h4 className={styles.sectionTitle}>Team context</h4>
      <div className={styles.grid2}>
        <div>
          <label className={styles.label} htmlFor="teamSize">
            Team size
          </label>
          <div className={styles.fieldRow}>
            <button type="button" className={styles.stepBtn} onClick={dec} aria-label="Decrease team size">
              <span className="material-symbols-outlined" aria-hidden="true">
                remove
              </span>
            </button>
            <input
              id="teamSize"
              className={styles.numInput}
              inputMode="numeric"
              type="number"
              min={1}
              value={teamSize}
              onChange={(e) => onTeamSizeChange(Math.max(1, Number(e.target.value || 1)))}
            />
            <button type="button" className={styles.stepBtn} onClick={inc} aria-label="Increase team size">
              <span className="material-symbols-outlined" aria-hidden="true">
                add
              </span>
            </button>
          </div>
        </div>
        <div>
          <span className={styles.label}>Primary use case</span>
          <div className={styles.pills} role="radiogroup" aria-label="Primary use case">
            {USE_CASE_OPTIONS.map((opt) => (
              <button
                key={opt.id}
                type="button"
                role="radio"
                aria-checked={useCase === opt.id}
                className={`${styles.pill} ${useCase === opt.id ? styles.pillActive : ''}`}
                onClick={() => onUseCaseChange(opt.id)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
