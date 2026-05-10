'use client'

import type { PlanTier, ToolId } from '@/lib/types'
import { TOOL_CATALOG } from '@/lib/constants'
import styles from './audit.module.css'

export interface ToolCardState {
  toolId: ToolId
  planId: PlanTier
  monthlySpend: number
  seats: number
}

interface ToolCardProps {
  idBase: string
  value: ToolCardState
  canRemove: boolean
  onChange: (next: ToolCardState) => void
  onRemove: () => void
}

export function ToolCard({ idBase, value, canRemove, onChange, onRemove }: ToolCardProps) {
  const catalog = TOOL_CATALOG.find((t) => t.id === value.toolId) ?? TOOL_CATALOG[0]
  const planOptions = catalog.plans
  const planId = planOptions.includes(value.planId) ? value.planId : planOptions[0]

  const setTool = (toolId: ToolId) => {
    const nextCatalog = TOOL_CATALOG.find((t) => t.id === toolId) ?? TOOL_CATALOG[0]
    const nextPlan = nextCatalog.plans.includes(value.planId) ? value.planId : nextCatalog.plans[0]
    onChange({ ...value, toolId, planId: nextPlan })
  }

  const decSeats = () => onChange({ ...value, seats: Math.max(1, value.seats - 1) })
  const incSeats = () => onChange({ ...value, seats: value.seats + 1 })

  return (
    <article className={styles.toolCard}>
      {canRemove ? (
        <button type="button" className={styles.removeToolBtn} onClick={onRemove} aria-label="Remove tool">
          <span className="material-symbols-outlined" aria-hidden="true">
            close
          </span>
        </button>
      ) : null}

      <div>
        <label className={styles.sectionTitle} htmlFor={`${idBase}-tool`}>
          Tool
        </label>
        <select
          id={`${idBase}-tool`}
          className={styles.select}
          value={value.toolId}
          onChange={(e) => setTool(e.target.value as ToolId)}
        >
          {TOOL_CATALOG.map((t) => (
            <option key={t.id} value={t.id}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className={styles.sectionTitle} htmlFor={`${idBase}-plan`}>
          Plan
        </label>
        <select
          id={`${idBase}-plan`}
          className={styles.select}
          value={planId}
          onChange={(e) => onChange({ ...value, planId: e.target.value as PlanTier })}
        >
          {planOptions.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className={styles.sectionTitle} htmlFor={`${idBase}-spend`}>
          Monthly spend
        </label>
        <div className={styles.moneyWrap}>
          <span className={styles.moneyPrefix} aria-hidden="true">
            $
          </span>
          <input
            id={`${idBase}-spend`}
            className={`${styles.textInput} ${styles.moneyInput}`}
            inputMode="decimal"
            type="number"
            min={0}
            value={value.monthlySpend}
            onChange={(e) => onChange({ ...value, monthlySpend: Math.max(0, Number(e.target.value || 0)) })}
          />
        </div>
      </div>

      <div>
        <label className={styles.sectionTitle} htmlFor={`${idBase}-seats`}>
          Seats
        </label>
        <div className={styles.fieldRow}>
          <button type="button" className={styles.stepBtn} onClick={decSeats} aria-label="Decrease seats">
            <span className="material-symbols-outlined" aria-hidden="true">
              remove
            </span>
          </button>
          <input
            id={`${idBase}-seats`}
            className={styles.numInput}
            inputMode="numeric"
            type="number"
            min={1}
            value={value.seats}
            onChange={(e) => onChange({ ...value, seats: Math.max(1, Number(e.target.value || 1)) })}
          />
          <button type="button" className={styles.stepBtn} onClick={incSeats} aria-label="Increase seats">
            <span className="material-symbols-outlined" aria-hidden="true">
              add
            </span>
          </button>
        </div>
      </div>
    </article>
  )
}

