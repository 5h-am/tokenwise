'use client'

import styles from './audit.module.css'

export interface AdvancedParamsState {
  avgSessionTurns?: number
  avgSystemPromptTokens?: number
  avgInputTokensPerTurn?: number
  avgOutputTokensPerTurn?: number
  monthlyAISessions?: number
  shadowITSpendPercent?: number
  hasPromptCaching: boolean
  hasContextSummarization: boolean
}

interface AdvancedParamsProps {
  value: AdvancedParamsState
  onChange: (next: AdvancedParamsState) => void
}

function numOrUndef(raw: string): number | undefined {
  if (raw.trim() === '') return undefined
  const n = Number(raw)
  return Number.isFinite(n) ? n : undefined
}

export function AdvancedParams({ value, onChange }: AdvancedParamsProps) {
  return (
    <section className={styles.advanced}>
      <details>
        <summary className={styles.advancedSummary}>
          <span>
            <span className="material-symbols-outlined" aria-hidden="true">
              tune
            </span>{' '}
            I use the API directly and want a more detailed analysis
          </span>
          <span className="material-symbols-outlined" aria-hidden="true">
            expand_more
          </span>
        </summary>
        <div className={styles.advancedPanel}>
          <div className={styles.grid2}>
            <div>
              <label className={styles.sectionTitle} htmlFor="avgSessionTurns">
                Avg session turns
              </label>
              <input
                id="avgSessionTurns"
                className={styles.textInput}
                inputMode="numeric"
                type="number"
                placeholder="e.g. 5"
                value={value.avgSessionTurns ?? ''}
                onChange={(e) => onChange({ ...value, avgSessionTurns: numOrUndef(e.target.value) })}
              />
            </div>
            <div>
              <label className={styles.sectionTitle} htmlFor="avgSystemPromptTokens">
                Avg system prompt tokens
              </label>
              <input
                id="avgSystemPromptTokens"
                className={styles.textInput}
                inputMode="numeric"
                type="number"
                placeholder="e.g. 1500"
                value={value.avgSystemPromptTokens ?? ''}
                onChange={(e) => onChange({ ...value, avgSystemPromptTokens: numOrUndef(e.target.value) })}
              />
            </div>
            <div>
              <label className={styles.sectionTitle} htmlFor="avgInputTokensPerTurn">
                Avg input tokens / turn
              </label>
              <input
                id="avgInputTokensPerTurn"
                className={styles.textInput}
                inputMode="numeric"
                type="number"
                placeholder="e.g. 800"
                value={value.avgInputTokensPerTurn ?? ''}
                onChange={(e) => onChange({ ...value, avgInputTokensPerTurn: numOrUndef(e.target.value) })}
              />
            </div>
            <div>
              <label className={styles.sectionTitle} htmlFor="avgOutputTokensPerTurn">
                Avg output tokens / turn
              </label>
              <input
                id="avgOutputTokensPerTurn"
                className={styles.textInput}
                inputMode="numeric"
                type="number"
                placeholder="e.g. 400"
                value={value.avgOutputTokensPerTurn ?? ''}
                onChange={(e) => onChange({ ...value, avgOutputTokensPerTurn: numOrUndef(e.target.value) })}
              />
            </div>
            <div>
              <label className={styles.sectionTitle} htmlFor="monthlyAISessions">
                Monthly AI sessions
              </label>
              <input
                id="monthlyAISessions"
                className={styles.textInput}
                inputMode="numeric"
                type="number"
                placeholder="e.g. 1200"
                value={value.monthlyAISessions ?? ''}
                onChange={(e) => onChange({ ...value, monthlyAISessions: numOrUndef(e.target.value) })}
              />
            </div>
            <div>
              <label className={styles.sectionTitle} htmlFor="shadowITSpendPercent">
                Shadow IT spend %
              </label>
              <input
                id="shadowITSpendPercent"
                className={styles.textInput}
                inputMode="decimal"
                type="number"
                placeholder="e.g. 8"
                value={value.shadowITSpendPercent ?? ''}
                onChange={(e) => onChange({ ...value, shadowITSpendPercent: numOrUndef(e.target.value) })}
              />
            </div>
          </div>

          <div className={styles.grid2}>
            <div className={styles.toggleRow}>
              <div className={styles.toggleText}>
                <span className={styles.toggleTitle}>Prompt caching</span>
                <span className={styles.toggleMeta}>Reduces input costs</span>
              </div>
              <button
                type="button"
                className={`${styles.toggle} ${value.hasPromptCaching ? styles.toggleOn : ''}`}
                onClick={() => onChange({ ...value, hasPromptCaching: !value.hasPromptCaching })}
                aria-pressed={value.hasPromptCaching}
                aria-label="Toggle prompt caching"
              >
                <span className={styles.toggleKnob} />
              </button>
            </div>

            <div className={styles.toggleRow}>
              <div className={styles.toggleText}>
                <span className={styles.toggleTitle}>Context summarization</span>
                <span className={styles.toggleMeta}>Compresses history</span>
              </div>
              <button
                type="button"
                className={`${styles.toggle} ${value.hasContextSummarization ? styles.toggleOn : ''}`}
                onClick={() =>
                  onChange({ ...value, hasContextSummarization: !value.hasContextSummarization })
                }
                aria-pressed={value.hasContextSummarization}
                aria-label="Toggle context summarization"
              >
                <span className={styles.toggleKnob} />
              </button>
            </div>
          </div>
        </div>
      </details>
    </section>
  )
}

