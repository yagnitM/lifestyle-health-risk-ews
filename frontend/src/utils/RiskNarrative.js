/**
 * RiskNarrative.js
 * Pure rule-based narrative engine.
 * Input:  extracted_features + contributing_factors + risk_level + ensemble_probability
 * Output: { headline, what_this_means, risk_dimensions, insight, cta }
 * No external API. Everything derived from backend data only.
 */

// ── Helpers ──────────────────────────────────────────────────────────────────

const HIGH_STRESS   = (ef) => ef.stress_score   > 0.45
const LOW_SLEEP     = (ef) => ef.sleep_hours     < 6
const VERY_LOW_SLEEP= (ef) => ef.sleep_hours     < 5
const SMOKING       = (ef) => ef.smoking_detected
const ALCOHOL       = (ef) => ef.alcohol_detected
const BAD_DIET      = (ef) => ef.diet_label && ef.diet_label.includes('poor')
const NO_EXERCISE   = (ef) => ef.exercise_label === 'none' || ef.exercise_label === 'sedentary'
const NEGATIVE_SENT = (ef) => ef.sentiment_label === 'negative'

function countRiskSignals(ef) {
  return [
    SMOKING(ef), ALCOHOL(ef), LOW_SLEEP(ef),
    HIGH_STRESS(ef), BAD_DIET(ef), NO_EXERCISE(ef),
  ].filter(Boolean).length
}

// ── Headline generator ────────────────────────────────────────────────────────

function buildHeadline(ef, riskLevel, prob) {
  const pct      = Math.round(prob * 100)
  const signals  = countRiskSignals(ef)
  const levelMap = {
    HIGH:     `Your lifestyle profile shows ${pct}% risk — driven by ${signals} compounding factor${signals !== 1 ? 's' : ''} acting simultaneously.`,
    MEDIUM:   `Your lifestyle profile shows ${pct}% risk — a mix of protective and concerning patterns.`,
    LOW:      `Your lifestyle profile shows ${pct}% risk — mostly healthy signals with minor areas to watch.`,
    VERY_LOW: `Your lifestyle profile shows ${pct}% risk — strong healthy lifestyle indicators detected.`,
  }
  return levelMap[riskLevel] || `Your lifestyle profile shows ${pct}% risk.`
}

// ── "What this means" narrative ───────────────────────────────────────────────
// This is the key function — it explains the COMBINATION, not individual signals.

function buildNarrative(ef, riskLevel) {
  const smoking  = SMOKING(ef)
  const alcohol  = ALCOHOL(ef)
  const lowSleep = LOW_SLEEP(ef)
  const stress   = HIGH_STRESS(ef)
  const badDiet  = BAD_DIET(ef)
  const noEx     = NO_EXERCISE(ef)
  const negSent  = NEGATIVE_SENT(ef)
  const signals  = countRiskSignals(ef)

  // ── Multi-factor combination narratives (most specific first) ──

  if (smoking && lowSleep && stress) {
    return `This is not about any single habit — it is about the combination. Smoking, chronic sleep deprivation (${ef.sleep_hours}h), and elevated psychological stress are three factors that amplify each other. Nicotine disrupts sleep architecture, poor sleep elevates cortisol, and high cortisol increases cravings for both nicotine and alcohol. This feedback loop, if sustained, significantly elevates cardiovascular and metabolic risk beyond what any one factor alone would suggest.`
  }

  if (smoking && alcohol && stress) {
    return `Your profile shows two substance-use signals alongside elevated stress — a pattern that clinical research consistently links to coping-driven consumption. When smoking and alcohol use co-occur with psychological stress, they tend to reinforce each other rather than act independently. The risk here is not just physical — it is the self-reinforcing nature of using substances to manage stress, which over time increases dependency and reduces the body's natural stress recovery capacity.`
  }

  if (smoking && lowSleep) {
    return `Smoking and sleep deprivation (${ef.sleep_hours}h) are a particularly harmful combination. Nicotine is a stimulant that reduces sleep quality even when you feel it is not affecting you — meaning your ${ef.sleep_hours}h may be even less restorative than the number suggests. Meanwhile, poor sleep increases inflammatory markers that smoking also elevates, creating a compounding effect on cardiovascular risk that is greater than either habit alone.`
  }

  if (alcohol && lowSleep && stress) {
    return `Alcohol use, poor sleep (${ef.sleep_hours}h), and high stress form a well-documented negative triad. Alcohol may feel like it helps with sleep or stress, but it disrupts REM sleep cycles and increases next-day cortisol. This means your ${ef.sleep_hours}h of sleep is likely lower quality than the hours suggest, and your stress levels may be partly driven by the alcohol's next-day physiological effects rather than external pressures alone.`
  }

  if (lowSleep && stress && negSent) {
    return `Your profile shows sleep deprivation (${ef.sleep_hours}h), elevated stress, and negative emotional tone — a combination that clinical literature consistently identifies as a mental health risk pattern. Chronic sleep below 6 hours significantly impairs emotional regulation, making stress harder to manage. This can create a loop: poor sleep worsens mood, worsened mood disrupts sleep. The risk here extends beyond physical health into psychological resilience.`
  }

  if (smoking && badDiet) {
    return `Smoking and poor dietary patterns together create a compounding oxidative stress load on the body. Nicotine depletes Vitamin C and other antioxidants, which a poor diet then fails to replenish. This combination accelerates arterial inflammation at a rate faster than either factor alone would suggest. The good news: dietary improvement is one of the most accessible levers to offset some of the oxidative damage from smoking.`
  }

  if (noEx && lowSleep && badDiet) {
    return `Your profile shows a sedentary lifestyle alongside poor sleep (${ef.sleep_hours}h) and dietary concerns — three metabolic risk factors that compound each other. Physical inactivity reduces insulin sensitivity, poor sleep further disrupts glucose metabolism, and a poor diet completes the metabolic risk triad. This pattern is closely associated with early-stage metabolic syndrome risk, even in the absence of obvious symptoms.`
  }

  if (lowSleep && noEx) {
    return `Sleep deprivation (${ef.sleep_hours}h) and physical inactivity together impair your body's metabolic and cardiovascular recovery processes. Exercise is one of the most effective interventions for sleep quality — meaning addressing one could significantly improve the other. Starting with even moderate physical activity (20–30 min/day) has shown measurable improvements in sleep depth and duration within 2–4 weeks.`
  }

  // ── Single-signal narratives (less specific) ──

  if (smoking) {
    return `Smoking is detected as the primary risk signal in your profile. At the frequency described, the key risks are not just long-term cancer risk — which is often how smoking is framed — but near-term cardiovascular impact. Smoking raises resting heart rate, constricts blood vessels, and elevates blood pressure within minutes of each cigarette. At 5+ cigarettes per day, these effects become chronic rather than transient.`
  }

  if (lowSleep) {
    return `Sleep deprivation (${ef.sleep_hours}h) is the dominant risk signal in your profile. Below 6 hours of sleep, the body fails to complete full restorative cycles — affecting immune function, glucose metabolism, and emotional regulation. What makes sleep risk underestimated is that it amplifies the impact of every other risk factor: a smoker who sleeps well is at lower risk than a non-smoker who consistently sleeps 4–5 hours.`
  }

  if (stress && negSent) {
    return `Elevated psychological stress with a negative emotional tone is the primary signal in your profile. Chronic stress has measurable physiological effects — elevated cortisol over sustained periods affects immune function, sleep quality, cardiovascular health, and metabolic regulation. The key concern is not acute stress (which is manageable) but whether this represents a sustained pattern.`
  }

  if (alcohol) {
    return `Alcohol use is detected as a notable signal. Moderate alcohol use is often perceived as low-risk, but the key question is pattern and context — drinking to cope with stress, drinking in combination with poor sleep or smoking, or drinking with irregular frequency carries significantly higher risk than the volume alone suggests.`
  }

  // ── Low / very low risk ──
  if (riskLevel === 'LOW' || riskLevel === 'VERY_LOW') {
    const positives = []
    if (!smoking) positives.push('no smoking detected')
    if (!alcohol) positives.push('no alcohol signals')
    if (ef.sleep_hours >= 7) positives.push(`healthy sleep (${ef.sleep_hours}h)`)
    if (!stress)  positives.push('low stress indicators')
    if (!noEx)    positives.push('active lifestyle signals')
    return `Your profile shows predominantly protective lifestyle signals${positives.length ? ': ' + positives.join(', ') : ''}. The model assigns low population-level risk based on the absence of major behavioural risk factors. Continue monitoring areas flagged below and maintain current habits.`
  }

  return `Your profile shows ${signals} lifestyle risk signal${signals !== 1 ? 's' : ''}. Review the risk dimensions below for a breakdown of what each signal means in your specific context.`
}

// ── Risk dimensions (condition-level breakdown) ───────────────────────────────

function buildRiskDimensions(ef, prob) {
  const smoking   = SMOKING(ef)
  const alcohol   = ALCOHOL(ef)
  const lowSleep  = LOW_SLEEP(ef)
  const stress    = HIGH_STRESS(ef)
  const badDiet   = BAD_DIET(ef)
  const noEx      = NO_EXERCISE(ef)
  const negSent   = NEGATIVE_SENT(ef)

  const dims = []

  // Cardiovascular
  const cardioFactors = [smoking, alcohol, lowSleep, noEx, badDiet].filter(Boolean).length
  if (cardioFactors >= 2) {
    dims.push({
      condition: 'Cardiovascular Risk',
      level:     cardioFactors >= 3 ? 'Elevated' : 'Moderate',
      color:     cardioFactors >= 3 ? '#ef4444'  : '#f59e0b',
      score:     Math.min(cardioFactors / 4, 1),
      why:       buildCardioWhy(ef),
    })
  } else if (cardioFactors === 1) {
    dims.push({
      condition: 'Cardiovascular Risk',
      level:     'Low–Moderate',
      color:     '#f59e0b',
      score:     0.3,
      why:       'One cardiovascular risk factor detected. Monitor and avoid adding further stressors.',
    })
  }

  // Metabolic
  const metaFactors = [lowSleep, badDiet, noEx, alcohol].filter(Boolean).length
  if (metaFactors >= 2) {
    dims.push({
      condition: 'Metabolic Risk',
      level:     metaFactors >= 3 ? 'Elevated' : 'Moderate',
      color:     metaFactors >= 3 ? '#ef4444'  : '#f59e0b',
      score:     Math.min(metaFactors / 4, 1),
      why:       `Sleep deprivation${lowSleep ? ` (${ef.sleep_hours}h)` : ''}, ${badDiet ? 'poor diet, ' : ''}${noEx ? 'physical inactivity' : ''} — together these disrupt glucose metabolism and insulin sensitivity.`,
    })
  }

  // Mental health / psychological
  const mentalFactors = [stress, negSent, lowSleep, alcohol, smoking].filter(Boolean).length
  if (stress || (negSent && mentalFactors >= 2)) {
    dims.push({
      condition: 'Psychological Stress Load',
      level:     mentalFactors >= 3 ? 'Elevated' : 'Moderate',
      color:     mentalFactors >= 3 ? '#ef4444'  : '#f59e0b',
      score:     Math.min(ef.stress_score + (negSent ? 0.2 : 0), 1),
      why:       buildMentalWhy(ef),
    })
  }

  // Sleep-specific
  if (lowSleep) {
    dims.push({
      condition: 'Sleep Quality Risk',
      level:     ef.sleep_hours < 5 ? 'Severe' : 'Moderate',
      color:     ef.sleep_hours < 5 ? '#ef4444' : '#f59e0b',
      score:     Math.max(0, 1 - (ef.sleep_hours / 9)),
      why:       `${ef.sleep_hours}h detected — recommended range is 7–9h. Below 6h consistently impairs immune function, emotional regulation, and metabolic health.`,
    })
  }

  // Substance use
  if (smoking && alcohol) {
    dims.push({
      condition: 'Substance Use Risk',
      level:     'Elevated',
      color:     '#ef4444',
      score:     0.75,
      why:       'Both smoking and alcohol detected. Co-occurring substance use carries compounded organ stress — particularly hepatic, pulmonary, and cardiovascular.',
    })
  } else if (smoking) {
    dims.push({
      condition: 'Substance Use Risk',
      level:     'Moderate',
      color:     '#f59e0b',
      score:     0.55,
      why:       'Smoking detected. Near-term cardiovascular and pulmonary impact — elevated resting heart rate, reduced lung capacity, increased arterial inflammation.',
    })
  } else if (alcohol) {
    dims.push({
      condition: 'Substance Use Risk',
      level:     'Low–Moderate',
      color:     '#f59e0b',
      score:     0.40,
      why:       'Alcohol use detected. Risk depends heavily on frequency and context. Coping-driven use alongside stress carries higher risk than social use.',
    })
  }

  // If no dims were triggered but risk is still medium+
  if (dims.length === 0 && prob > 0.45) {
    dims.push({
      condition: 'General Lifestyle Risk',
      level:     'Moderate',
      color:     '#f59e0b',
      score:     prob,
      why:       'Multiple mild lifestyle signals detected. No single dominant risk factor, but the overall pattern suggests room for improvement.',
    })
  }

  return dims
}

function buildCardioWhy(ef) {
  const parts = []
  if (SMOKING(ef))   parts.push('nicotine elevates resting heart rate and constricts blood vessels')
  if (ALCOHOL(ef))   parts.push('alcohol increases blood pressure over time')
  if (LOW_SLEEP(ef)) parts.push(`sleep deprivation (${ef.sleep_hours}h) raises inflammatory markers`)
  if (NO_EXERCISE(ef)) parts.push('physical inactivity reduces cardiovascular reserve')
  return parts.length > 0
    ? parts.join('; ') + '.'
    : 'Multiple cardiovascular risk factors detected in combination.'
}

function buildMentalWhy(ef) {
  if (HIGH_STRESS(ef) && LOW_SLEEP(ef) && NEGATIVE_SENT(ef)) {
    return `High stress, poor sleep (${ef.sleep_hours}h), and negative emotional tone form a documented feedback loop — each factor worsens the others.`
  }
  if (HIGH_STRESS(ef) && LOW_SLEEP(ef)) {
    return `Stress and sleep deprivation (${ef.sleep_hours}h) co-occurring — chronic sleep loss significantly impairs stress resilience and emotional regulation.`
  }
  if (HIGH_STRESS(ef)) {
    return `Elevated stress score (${Math.round(ef.stress_score * 100)}%) — if sustained, chronic stress affects immune function, sleep quality, and cardiovascular health.`
  }
  return 'Psychological stress indicators detected. Monitor for sustained patterns.'
}

// ── Key insight (the "non-obvious" finding) ───────────────────────────────────

function buildInsight(ef, riskLevel) {
  const smoking   = SMOKING(ef)
  const alcohol   = ALCOHOL(ef)
  const lowSleep  = LOW_SLEEP(ef)
  const stress    = HIGH_STRESS(ef)

  if (smoking && lowSleep) {
    return {
      icon:  '💡',
      title: 'The compounding effect',
      text:  `Smokers who sleep less than 6 hours carry disproportionately higher cardiovascular risk than the sum of both factors alone. Improving sleep quality — even without quitting smoking immediately — would measurably reduce your overall risk profile.`,
    }
  }
  if (alcohol && stress) {
    return {
      icon:  '💡',
      title: 'Stress-substance feedback loop',
      text:  `Alcohol detected alongside high stress. Research consistently shows that stress-driven drinking increases tolerance faster than social drinking, making this pattern self-reinforcing over time. The intervention point is the stress, not just the alcohol.`,
    }
  }
  if (lowSleep && stress) {
    return {
      icon:  '💡',
      title: 'Sleep is the leverage point',
      text:  `Of all detected risk factors, sleep improvement typically has the fastest measurable impact on stress levels. Even 45 extra minutes of sleep per night has been shown to reduce cortisol levels and improve stress resilience within 2 weeks.`,
    }
  }
  if (smoking) {
    return {
      icon:  '💡',
      title: 'Near-term risk is often underestimated',
      text:  `Smoking risk is typically framed as long-term (cancer). But cardiovascular effects are immediate — each cigarette temporarily raises blood pressure and heart rate for 30–60 minutes. At 5+ per day, this becomes a near-continuous cardiovascular stressor.`,
    }
  }
  if (lowSleep) {
    return {
      icon:  '💡',
      title: 'Sleep amplifies everything else',
      text:  `Sleep deprivation is unusual among risk factors because it worsens the impact of every other factor. A smoker who sleeps 7h is at lower risk than a non-smoker who consistently sleeps 4h. Addressing sleep is often higher leverage than targeting other individual habits.`,
    }
  }
  if (riskLevel === 'LOW' || riskLevel === 'VERY_LOW') {
    return {
      icon:  '✅',
      title: 'Your protective factors',
      text:  `Your current lifestyle habits are working as a protective combination. The most important thing is consistency — the benefits of healthy sleep, low stress, and no substance use are cumulative and compound over time.`,
    }
  }
  return null
}

// ── Smart recommendations (non-obvious, specific, actionable) ─────────────────

function buildSmartRecommendations(ef, riskLevel, existingRecs) {
  const smoking   = SMOKING(ef)
  const alcohol   = ALCOHOL(ef)
  const lowSleep  = LOW_SLEEP(ef)
  const stress    = HIGH_STRESS(ef)
  const noEx      = NO_EXERCISE(ef)
  const signals   = countRiskSignals(ef)

  const recs = []

  // Priority 1: Address the highest-leverage intervention
  if (smoking && lowSleep) {
    recs.push({
      priority: 'high',
      category: 'Sleep + Smoking',
      action:   `Target sleep first, not smoking. Improving sleep to 7h has been shown to reduce nicotine cravings by reducing stress hormones. Try a fixed wake time before worrying about quit dates.`,
    })
  } else if (smoking && stress) {
    recs.push({
      priority: 'high',
      category: 'Stress + Smoking',
      action:   `Address the stress driver, not just the cigarette. Identify your top 2 stress triggers this week. Smoking cessation is 60% more successful when the underlying stress source is managed simultaneously.`,
    })
  } else if (lowSleep) {
    recs.push({
      priority: 'high',
      category: 'Sleep',
      action:   `Set a consistent wake time — not a bedtime. Wake at the same time every day (even weekends) for 2 weeks. This is the single most evidence-supported intervention for improving sleep quality quickly.`,
    })
  } else if (smoking) {
    recs.push({
      priority: 'high',
      category: 'Smoking',
      action:   `Consider tracking the context of each cigarette for one week before attempting to reduce — stress trigger, boredom, social? Pattern awareness is the foundation of effective cessation. Apps like Smoke Free make this easy.`,
    })
  }

  // Priority 2: Compounding factor management
  if (alcohol && stress) {
    recs.push({
      priority: 'medium',
      category: 'Alcohol + Stress',
      action:   `Replace one stress-driven drinking occasion per week with a 20-minute walk or structured breathing. The goal is not abstinence — it is breaking the automatic stress-to-alcohol pathway. Physical activity is clinically equivalent to alcohol for short-term stress relief.`,
    })
  }

  if (noEx && (smoking || lowSleep)) {
    recs.push({
      priority: 'medium',
      category: 'Exercise',
      action:   `10–15 minutes of walking daily is sufficient to start improving sleep quality and reducing smoking cravings. You do not need a gym — research shows brief outdoor walks produce measurable cortisol reduction within 3 days.`,
    })
  }

  if (stress && lowSleep) {
    recs.push({
      priority: 'medium',
      category: 'Stress Management',
      action:   `Try a 5-minute decompression ritual before bed — no screens, dim light, same time nightly. This is not about relaxation techniques. It is about giving your nervous system a consistent signal that the day is over.`,
    })
  }

  // Priority 3: Monitoring
  if (signals >= 3) {
    recs.push({
      priority: 'monitor',
      category: 'Medical Review',
      action:   `With ${signals} concurrent lifestyle risk factors, a routine health check-up covering blood pressure, blood glucose, and lipid panel is advisable within the next 3–6 months, regardless of current symptoms.`,
    })
  }

  // Fallback to existing recs if nothing generated
  if (recs.length === 0 && existingRecs) {
    return existingRecs.map(r => ({
      priority: 'monitor', category: 'General', action: r,
    }))
  }

  return recs
}

// ── Main export ───────────────────────────────────────────────────────────────

export function generateNarrative(result) {
  const ef = result.extracted_features
  const rl = result.risk_level
  const pr = result.ensemble_probability

  return {
    headline:        buildHeadline(ef, rl, pr),
    narrative:       buildNarrative(ef, rl),
    risk_dimensions: buildRiskDimensions(ef, pr),
    insight:         buildInsight(ef, rl),
    smart_recs:      buildSmartRecommendations(ef, rl, result.recommendations),
  }
}