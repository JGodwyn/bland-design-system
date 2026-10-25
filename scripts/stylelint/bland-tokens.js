// Stylelint plugin: bland/use-tokens.
//
// Enforces the CLAUDE.md hard rule: every color, size, space, radius, stroke, shadow and
// type value in component CSS is a var(--…) token. Each error names the token(s) that
// resolve to the hardcoded value, read from tokens/tokens.json, so an agent can fix it in
// one pass. Only Theme and scale tokens exist in tokens.json; primitives are never suggested.
// See docs/lint.md.

import { readFileSync } from 'node:fs'
import stylelint from 'stylelint'
import valueParser from 'postcss-value-parser'
import { NAMED_COLORS } from './named-colors.js'

const ruleName = 'bland/use-tokens'
const RULE = 'CLAUDE.md hard rule: component CSS uses var(--…) tokens only.'
const ASK = 'If none fits, stop and ask Godwin; do not invent a value or a token.'
const MAX_LISTED = 4

const messages = stylelint.utils.ruleMessages(ruleName, {
  rejected: (text) => `${text} ${RULE}`,
})

// Tokens

const TOKENS = JSON.parse(readFileSync(new URL('../../tokens/tokens.json', import.meta.url), 'utf8')).tokens

const group = (t) => t.name.split('/')[0]
const pxOf = (value) => (/^-?[\d.]+px$/.test(value) ? Number.parseFloat(value) : null)

const LENGTH_TOKENS = TOKENS.filter((t) => t.type === 'FLOAT' && pxOf(t.light) !== null)
const COLOR_TOKENS = TOKENS.filter((t) => t.type === 'COLOR')
const FONT_TOKENS = TOKENS.filter((t) => t.type === 'FONT')
const SHADOW_TOKENS = TOKENS.filter((t) => t.type === 'SHADOW')
const msOf = (value) => (/^[\d.]+ms$/.test(value) ? Number.parseFloat(value) : null)
const DURATION_TOKENS = TOKENS.filter((t) => t.css.startsWith('--duration-')).sort((a, b) => msOf(a.light) - msOf(b.light))
const EASING_TOKENS = TOKENS.filter((t) => t.css.startsWith('--easing-'))
const DISABLED_TOKENS = TOKENS.filter((t) => /disabled/i.test(t.name))
const BREAKPOINTS = TOKENS.filter((t) => t.collection === 'Breakpoints').sort((a, b) => pxOf(a.light) - pxOf(b.light))

// Length scales, each a filter over LENGTH_TOKENS.
const SCALES = {
  spacing: { label: 'Spacing', test: (t) => t.collection === 'Spacing' },
  radius: { label: 'Corner Radius', test: (t) => t.collection === 'Corner Radius' },
  stroke: { label: 'Stroke', test: (t) => t.collection === 'Stroke' },
  sizing: { label: 'Sizing', test: (t) => t.collection === 'Sizing' },
  // The raw type scale is a hidden primitive in Figma, so line height and letter spacing come per text style.
  lineHeight: { label: 'text style line height', test: (t) => t.css.endsWith('-line-height') },
  letterSpacing: { label: 'text style letter spacing', test: (t) => t.css.endsWith('-letter-spacing') },
}

// Semantic color groups, offered before component groups (Button/, Badge/, …).
const SEMANTIC_GROUPS = ['Text', 'Icon', 'Surface', 'Border', 'Shadow', 'Scrollbar', 'Fade']

// Property classification

function scalesFor(prop) {
  if (/radius/.test(prop)) return ['radius']
  if (prop === 'outline-offset') return ['stroke', 'spacing']
  if (/^(border|outline|column-rule)(-[a-z]+)*-width$|^stroke-width$|^text-decoration-thickness$|^text-underline-offset$/.test(prop)) return ['stroke']
  if (/^(border|outline)(-(top|right|bottom|left|block|inline)(-(start|end))?)?$/.test(prop)) return ['stroke']
  if (/^(padding|margin|scroll-padding|scroll-margin|inset)(-|$)|^(gap|row-gap|column-gap|top|right|bottom|left)$/.test(prop)) return ['spacing']
  if (/^(min-|max-)?(width|height|block-size|inline-size)$|^flex(-basis)?$/.test(prop)) return ['sizing', 'spacing']
  if (prop === 'line-height') return ['lineHeight']
  if (prop === 'letter-spacing') return ['letterSpacing']
  if (/^(transform|translate)$/.test(prop)) return ['spacing']
  return ['spacing', 'sizing', 'radius', 'stroke']
}

function colorGroupFor(prop) {
  if (prop === 'color' || prop === 'caret-color' || prop === '-webkit-text-fill-color') return 'Text'
  if (prop === 'fill' || prop === 'stroke') return 'Icon'
  if (/^background/.test(prop)) return 'Surface'
  if (/^(border|outline|column-rule)/.test(prop)) return 'Border'
  if (/shadow$/.test(prop)) return 'Shadow'
  return null
}

// Values

const GLOBAL_KEYWORDS = new Set(['inherit', 'initial', 'unset', 'revert', 'revert-layer'])
const ALLOWED_COLOR_WORDS = new Set(['transparent', 'currentcolor'])
// Absolute and font-relative lengths. %, viewport units, fr and angles have no tokens and pass.
// em and ch have one allowed use each (EM_PROPS, CH_PROPS); everywhere else they are rejected.
const LENGTH_UNITS = new Set(['px', 'rem', 'em', 'pt', 'pc', 'in', 'cm', 'mm', 'q', 'ch', 'ex', 'cap', 'ic', 'lh', 'rlh'])
const COLOR_FUNCTIONS = new Set(['rgb', 'rgba', 'hsl', 'hsla', 'hwb', 'lab', 'lch', 'oklab', 'oklch', 'color', 'color-mix'])
const SKIP_FUNCTIONS = new Set(['url', 'env', 'attr', 'format', 'local', 'image-set'])
const WEIGHT_KEYWORDS = { normal: 400, bold: 700 }
// em only sizes icons to the adjacent text; ch only caps a text measure.
const EM_PROPS = new Set(['width', 'height', 'inline-size', 'block-size'])
const CH_PROPS = new Set(['max-width', 'max-inline-size'])
const TIME_UNITS = { ms: 1, s: 1000 }
const EASING_KEYWORDS = new Set(['ease', 'ease-in', 'ease-out', 'ease-in-out', 'linear', 'step-start', 'step-end'])
const EASING_FUNCTIONS = new Set(['cubic-bezier', 'steps', 'linear'])
const isMotionProp = (prop) => /^(transition|animation)(-|$)/.test(prop) || prop.startsWith('--')
// Mask gradients only use alpha, so the overflow fade may write black and transparent there.
const MASK_PROPS = new Set(['mask-image', '-webkit-mask-image'])
const MASK_COLORS = new Set(['black', 'transparent'])
const DISABLED_SELECTOR = /:disabled|\[disabled|\[aria-disabled|\[data-disabled|[.-]disabled\b|is-disabled/i

/** Hardcoded length in px, or null for units that do not map to px. */
function toPx(number, unit) {
  if (unit === 'px') return number
  if (unit === 'rem' || unit === 'em') return number * 16
  return null
}

/** Color as a comparable "r g b a" key, or null when it cannot be resolved. */
function colorKey(text) {
  const s = text.trim().toLowerCase()
  if (NAMED_COLORS[s]) return colorKey(NAMED_COLORS[s])
  const hex = s.match(/^#([0-9a-f]{3,8})$/)
  if (hex) {
    let h = hex[1]
    if (h.length === 3 || h.length === 4) h = [...h].map((c) => c + c).join('')
    if (h.length !== 6 && h.length !== 8) return null
    const a = h.length === 8 ? Math.round((Number.parseInt(h.slice(6), 16) / 255) * 100) : 100
    return [0, 2, 4].map((i) => Number.parseInt(h.slice(i, i + 2), 16)).join(' ') + ` ${a}`
  }
  const rgb = s.match(/^rgba?\(\s*([\d.]+)[\s,]+([\d.]+)[\s,]+([\d.]+)\s*(?:[,/]\s*([\d.]+)(%?))?\s*\)$/)
  if (rgb) {
    const a = rgb[4] === undefined ? 100 : rgb[5] ? Number(rgb[4]) : Math.round(Number(rgb[4]) * 100)
    return `${Math.round(rgb[1])} ${Math.round(rgb[2])} ${Math.round(rgb[3])} ${a}`
  }
  return null
}

// Suggestions

const v = (t) => `var(${t.css})`
const q = (raw) => (/^["']/.test(raw) ? raw : `"${raw}"`)
const end = (s) => (/[.!?]"?$/.test(s) ? s : `${s}.`)
const describe = (t) => (t.description ? ` "${t.description.replace(/\s+/g, ' ').trim()}"` : '')

function listTokens(tokens, more) {
  const shown = tokens.slice(0, MAX_LISTED)
  const first = `${v(shown[0])}${describe(shown[0])}`
  const rest = shown.slice(1).map(v)
  const extra = tokens.length - shown.length
  return [first, ...rest].join(', ') + (extra > 0 ? `, +${extra} more${more ? ` ${more}` : ''}` : '')
}

function suggestLength(prop, raw, px, negative) {
  const scales = scalesFor(prop).map((k) => SCALES[k])
  const where = scales.map((s) => s.label).join(' or ')
  if (px === null) {
    return `${q(raw)} is hardcoded and Bland tokens are px, so nothing converts. Use a ${where} token. ${ASK}`
  }
  const wrap = negative ? (t) => `calc(${v(t)} * -1)` : v
  for (const scale of scales) {
    const exact = LENGTH_TOKENS.filter((t) => scale.test(t) && pxOf(t.light) === px)
    if (exact.length === 0) continue
    const note = raw.endsWith('px') ? '' : ` (${raw} = ${px}px at a 16px root)`
    if (exact.length === 1) {
      return end(`${q(raw)} is hardcoded${note}. Use ${wrap(exact[0])} (${scale.label} ${px}px):${describe(exact[0])}`)
    }
    const listed = negative ? exact.slice(0, MAX_LISTED).map(wrap).join(', ') : listTokens(exact, `${scale.label} tokens`)
    return `${q(raw)} is hardcoded${note}. ${scale.label} tokens of ${px}px: ${listed}. Pick the one named for this component or role.`
  }
  // No exact match: nearest step below and above in the first scale.
  const scale = scales[0]
  const steps = LENGTH_TOKENS.filter(scale.test).sort((a, b) => pxOf(a.light) - pxOf(b.light))
  const below = steps.filter((t) => pxOf(t.light) < px).at(-1)
  const above = steps.find((t) => pxOf(t.light) > px)
  const near = [below, above].filter(Boolean).map((t) => `${wrap(t)} (${pxOf(t.light)}px)`)
  return `${q(raw)} is hardcoded and no ${where} token is ${px}px. Nearest ${scale.label}: ${near.join(' or ')}. ${ASK}`
}

function suggestColor(prop, raw) {
  if (/^(-webkit-)?mask/.test(prop)) {
    return `${q(raw)} is a hardcoded color. A mask only reads alpha: write black and transparent, and only in mask-image. For the overflow fade use the shared .bland-scroll-fade class (src/components/scroll-area/scroll-fade.css).`
  }
  const key = colorKey(raw)
  const preferred = colorGroupFor(prop)
  const rank = (t) => {
    const g = group(t)
    if (g === preferred) return 0
    const i = SEMANTIC_GROUPS.indexOf(g)
    return i === -1 ? SEMANTIC_GROUPS.length + 1 : i + 1
  }
  const byRank = (a, b) => rank(a) - rank(b)
  if (key) {
    const light = COLOR_TOKENS.filter((t) => colorKey(t.light) === key).sort(byRank)
    if (light.length > 0) {
      return `${q(raw)} is a hardcoded color. Theme tokens resolving to it in Light: ${listTokens(light, 'Theme tokens')}. Pick the one named for this role (a component's own group inside that component); it also switches in Dark.`
    }
    const dark = COLOR_TOKENS.filter((t) => colorKey(t.dark) === key).sort(byRank)
    if (dark.length > 0) {
      return `${q(raw)} is a hardcoded color. It is the Dark value of: ${listTokens(dark, 'Theme tokens')}. Use the token, not the value; Dark is applied by tokens.css.`
    }
  }
  const roleGroup = preferred ?? 'Text'
  const role = COLOR_TOKENS.filter((t) => group(t) === roleGroup)
  return `${q(raw)} is a hardcoded color and no Theme token resolves to it. Pick by role, e.g. ${role.slice(0, MAX_LISTED).map(v).join(', ')} (${roleGroup}/ group in tokens/tokens.json). ${ASK}`
}

function suggestFont(raw) {
  const m = raw.match(/([\d.]+)px\s*\/\s*([\d.]+)px/)
  const weight = raw.match(/(?:^|\s)([1-9]00)\s/)
  let matches = m ? FONT_TOKENS.filter((t) => t.light.includes(`${m[1]}px/${m[2]}px`)) : []
  if (weight) {
    const same = matches.filter((t) => t.light.startsWith(`${weight[1]} `))
    if (same.length > 0) matches = same
  }
  if (matches.length > 0) {
    return `${q(raw)} is hardcoded. Text styles with that size: ${listTokens(matches, 'text styles')}. Use font: var(--type-…); -underline styles also need text-decoration: underline.`
  }
  return `${q(raw)} is hardcoded. Use a text style composite, e.g. font: var(--type-body-md), var(--type-title-md) or var(--type-code-body-md) (all in tokens/tokens.json under "Text styles"). ${ASK}`
}

function suggestShadow(raw, value) {
  const geometry = (s) => {
    const lengths = []
    valueParser(s).walk((n) => {
      if (n.type === 'function' && n.value !== 'calc') return false
      if (n.type !== 'word') return
      const u = valueParser.unit(n.value)
      if (u && (u.unit === '' ? Number(u.number) === 0 : LENGTH_UNITS.has(u.unit))) lengths.push(Number(u.number))
    })
    return lengths.join(' ')
  }
  const g = geometry(value)
  const same = SHADOW_TOKENS.filter((t) => geometry(t.light) === g)
  const key = (s) => {
    const colors = []
    valueParser(s).walk((n) => {
      if (n.type === 'function' && COLOR_FUNCTIONS.has(n.value)) colors.push(colorKey(valueParser.stringify(n)))
      if (n.type === 'word' && /^#/.test(n.value)) colors.push(colorKey(n.value))
    })
    return colors.join('|')
  }
  const exact = same.filter((t) => key(t.light) === key(value))
  const hits = exact.length > 0 ? exact : same
  if (hits.length > 0) {
    return `${q(raw)} is hardcoded. Elevation styles with that geometry: ${listTokens(hits, 'elevation styles')}. Use box-shadow: var(--elevation-{family}-{level}); its color switches in Dark.`
  }
  return `${q(raw)} is hardcoded and matches no elevation style. Use var(--elevation-{neutral,brand,danger,success,warning}-{near,mid,far}), e.g. var(--elevation-neutral-mid). ${ASK}`
}

// Families, weights and sizes are the hidden type scale in Figma: they reach components only through text styles.
const TYPE_ONLY = 'Bland sets type only through text styles (the raw type scale is not emitted).'

function suggestFamily(raw) {
  const mono = /mono|courier|consol/i.test(raw)
  const example = mono ? 'var(--type-code-body-md)' : 'var(--type-body-md)'
  return `${q(raw)} is hardcoded. ${TYPE_ONLY} Set font: ${example} or another ${mono ? 'Code' : 'text'} style instead.`
}

function suggestWeight(raw) {
  const n = WEIGHT_KEYWORDS[raw.toLowerCase()] ?? Number(raw)
  const same = FONT_TOKENS.filter((t) => t.light.startsWith(`${n} `))
  if (same.length > 0) return `${q(raw)} is hardcoded. ${TYPE_ONLY} Text styles of weight ${n}: ${listTokens(same, 'text styles')}. Use font: var(--type-…).`
  return `${q(raw)} is hardcoded and no text style has weight ${n}. ${TYPE_ONLY} ${ASK}`
}

function suggestFontSize(raw, px) {
  const same = FONT_TOKENS.filter((t) => t.light.includes(` ${px}px/`))
  if (same.length > 0) return `${q(raw)} is hardcoded. ${TYPE_ONLY} Text styles of ${px}px: ${listTokens(same, 'text styles')}. Use font: var(--type-…).`
  return `${q(raw)} is hardcoded and no text style is ${px}px. ${TYPE_ONLY} ${ASK}`
}

function suggestDuration(raw, ms) {
  const exact = DURATION_TOKENS.find((t) => msOf(t.light) === ms)
  if (exact) return end(`${q(raw)} is a hardcoded duration. Use ${v(exact)}:${describe(exact)}`)
  const below = DURATION_TOKENS.filter((t) => msOf(t.light) < ms).at(-1)
  const above = DURATION_TOKENS.find((t) => msOf(t.light) > ms)
  const near = [below, above].filter(Boolean).map((t) => `${v(t)} (${t.light})`)
  return `${q(raw)} is a hardcoded duration and no Motion token is ${ms}ms. Nearest: ${near.join(' or ')}. UI motion stays at or under var(--duration-lg); xl is Toast and 2xl is Sidebar and sheets only. ${ASK}`
}

const KEYWORD_CURVES = { ease: 'cubic-bezier(0.25, 0.1, 0.25, 1)', linear: 'linear' }
// Comparable form of an easing: cubic-bezier numbers normalized, so 0.250 equals .25.
const curveKey = (s) => {
  const lower = s.toLowerCase().trim()
  const bezier = lower.match(/^cubic-bezier\(([^)]*)\)$/)
  return bezier ? `cubic-bezier:${bezier[1].split(',').map(Number).join(',')}` : lower
}
// Keywords with no exact token, mapped to the token for the same intent.
const EASING_INTENT = { 'ease-out': '--easing-out', 'ease-in-out': '--easing-in-out' }

function suggestEasing(raw) {
  const lower = raw.toLowerCase().trim()
  const easeIn = lower === 'ease-in' || curveKey(lower) === curveKey('cubic-bezier(0.42, 0, 1, 1)')
  const out = EASING_TOKENS.find((t) => t.css === '--easing-out')
  if (easeIn) {
    return `${q(raw)} is ease-in, which Bland bans on UI: it starts slow and feels sluggish. Entering and exiting use ${v(out)}:${describe(out)}`
  }
  const key = curveKey(KEYWORD_CURVES[lower] ?? lower)
  const exact = EASING_TOKENS.find((t) => curveKey(t.light) === key)
  if (exact) return end(`${q(raw)} is a hardcoded easing. Use ${v(exact)}:${describe(exact)}`)
  const intent = EASING_TOKENS.find((t) => t.css === EASING_INTENT[lower])
  if (intent) return end(`${q(raw)} is a hardcoded easing. Use ${v(intent)}:${describe(intent)}`)
  return `${q(raw)} is a hardcoded easing. Use a Motion token: ${EASING_TOKENS.map((t) => `${v(t)}${describe(t)}`).join(' ')} ${ASK}`
}

function suggestUnitPlace(raw, unit) {
  const where = unit === 'em' ? 'width or height (icons sized to the adjacent text)' : 'max-width (a text measure)'
  return `${q(raw)} is hardcoded; ${unit} is allowed only on ${where}. Use a px token from the matching scale here. ${ASK}`
}

function suggestDisabled(raw) {
  return `${q(raw)} on a disabled state is not allowed; Bland has no disabled opacity. Use the disabled color tokens instead: ${DISABLED_TOKENS.slice(0, MAX_LISTED).map(v).join(', ')}, +${DISABLED_TOKENS.length - MAX_LISTED} more (Button/*-disabled, Toggle/*-disabled, Control/checked-disabled).`
}

function suggestBreakpoint(feature, px) {
  const list = BREAKPOINTS.map((t) => `${t.css.slice(2)} ${t.light}`).join(', ')
  if (px === null) return `${q(feature)} is not a Bland breakpoint. Media queries are mobile-first min-width on a breakpoint value: ${list}.`
  const nearest = BREAKPOINTS.reduce((a, b) => (Math.abs(pxOf(b.light) - px) < Math.abs(pxOf(a.light) - px) ? b : a))
  return `${q(feature)} is not a Bland breakpoint. Use (min-width: ${nearest.light}) (${nearest.css.slice(2)}:${describe(nearest)}). Media queries are mobile-first min-width on: ${list}.`
}

// Rule

const ruleFunction = (primary) => (root, result) => {
  if (!stylelint.utils.validateOptions(result, ruleName, { actual: primary, possible: [true] })) return

  root.walkDecls((decl) => {
    const prop = decl.prop.toLowerCase()
    const value = decl.value
    if (GLOBAL_KEYWORDS.has(value.trim().toLowerCase())) return
    const offset = decl.prop.length + (decl.raws.between ?? ':').length
    const report = (text, node) => {
      const start = offset + (node ? node.sourceIndex : 0)
      const end = node ? offset + node.sourceEndIndex : offset + value.length
      stylelint.utils.report({ result, ruleName, node: decl, index: start, endIndex: end, message: messages.rejected(`${decl.prop}: ${text}`) })
    }
    const isCustom = prop.startsWith('--')
    const parsed = valueParser(value)
    const hasVar = (nodes) => nodes.some((n) => n.type === 'function' && n.value.toLowerCase() === 'var')

    // Whole-declaration checks: one message per declaration where a composite token exists.
    if (prop === 'font' && !hasVar(parsed.nodes)) return report(suggestFont(value.trim()))
    if (prop === 'font-family') {
      const bad = parsed.nodes.filter((n) => n.type === 'string' || n.type === 'word')
      if (bad.length > 0) report(suggestFamily(valueParser.stringify(bad[0])), bad[0])
      return
    }
    const isMask = MASK_PROPS.has(prop)
    const maskColorOk = (text) => isMask && MASK_COLORS.has(text.toLowerCase())

    // Disabled states use disabled color tokens, never opacity.
    if (prop === 'opacity' && isDisabledRule(decl)) return report(suggestDisabled(value.trim()))

    const check = (nodes, flag = report) => {
      for (const node of nodes) {
        if (node.type === 'function') {
          const fn = node.value.toLowerCase()
          if (fn === 'var') {
            // var(--x, fallback): the fallback is a hardcoded value too.
            const comma = node.nodes.findIndex((n) => n.type === 'div' && n.value === ',')
            if (comma !== -1) check(node.nodes.slice(comma + 1), flag)
          } else if (COLOR_FUNCTIONS.has(fn)) {
            flag(suggestColor(prop, valueParser.stringify(node)), node)
          } else if (EASING_FUNCTIONS.has(fn) && isMotionProp(prop)) {
            flag(suggestEasing(valueParser.stringify(node)), node)
          } else if (!SKIP_FUNCTIONS.has(fn)) {
            check(node.nodes, flag)
          }
          continue
        }
        if (node.type !== 'word') continue
        const word = node.value
        const lower = word.toLowerCase()
        if (lower.startsWith('#') || NAMED_COLORS[lower]) {
          if (!ALLOWED_COLOR_WORDS.has(lower) && !maskColorOk(lower)) flag(suggestColor(prop, word), node)
          continue
        }
        if (EASING_KEYWORDS.has(lower) && isMotionProp(prop)) {
          flag(suggestEasing(word), node)
          continue
        }
        if (lower === 'all' && /^transition(-property)?$/.test(prop)) {
          flag(`${q(word)} transitions every property. Name the exact properties (e.g. background-color, transform). See docs/motion.md.`, node)
          continue
        }
        const u = valueParser.unit(word)
        if (!u) continue
        const number = Number(u.number)
        const unit = u.unit.toLowerCase()
        if (prop === 'font-weight' && unit === '' && number !== 0) {
          flag(suggestWeight(word), node)
        } else if (prop === 'font-size' && LENGTH_UNITS.has(unit) && number !== 0) {
          flag(suggestFontSize(word, toPx(number, unit)), node)
        } else if (TIME_UNITS[unit] && number !== 0) {
          flag(suggestDuration(word, Math.round(number * TIME_UNITS[unit])), node)
        } else if ((unit === 'em' && EM_PROPS.has(prop)) || (unit === 'ch' && CH_PROPS.has(prop))) {
          continue
        } else if ((unit === 'em' || unit === 'ch') && number !== 0) {
          flag(suggestUnitPlace(word, unit), node)
        } else if (LENGTH_UNITS.has(unit) && number !== 0) {
          const px = toPx(Math.abs(number), unit)
          flag(suggestLength(isCustom ? '' : prop, word, px, number < 0), node)
        }
      }
    }

    // A shadow has an elevation composite, so any hardcoded part gets one message for the whole value.
    if (prop === 'box-shadow') {
      let hardcoded = false
      check(parsed.nodes, () => (hardcoded = true))
      if (hardcoded) report(suggestShadow(value.trim(), value))
      return
    }
    if (prop === 'font-weight' && WEIGHT_KEYWORDS[value.trim().toLowerCase()]) {
      return report(suggestWeight(value.trim()))
    }
    check(parsed.nodes)
  })

  // Media queries: mobile-first min-width on a Breakpoints value only. Other features (hover, reduced motion, …) pass.
  root.walkAtRules(/^media$/i, (atRule) => {
    const offset = 1 + atRule.name.length + (atRule.raws.afterName ?? ' ').length
    const allowed = new Set(BREAKPOINTS.map((t) => pxOf(t.light)))
    const feature = /\(\s*(?:(min|max)-)?width\s*:\s*([^)]+?)\s*\)|\(\s*width\s*(>=|<=|>|<)\s*([^)]+?)\s*\)|\(\s*([^()<>=]+?)\s*(>=|<=|>|<)\s*width\b[^)]*\)/gi
    for (const m of atRule.params.matchAll(feature)) {
      const [text, minMax, colonValue, op, rangeValue, reversedValue, reversedOp] = m
      const raw = (colonValue ?? rangeValue ?? reversedValue).trim()
      const mobileFirst = minMax?.toLowerCase() === 'min' || op === '>=' || reversedOp === '<='
      const isRange = /[<>]=?\s*width/i.test(text) && /width\s*[<>]/i.test(text)
      const px = pxOf(raw)
      if (mobileFirst && !isRange && px !== null && allowed.has(px)) continue
      stylelint.utils.report({
        result,
        ruleName,
        node: atRule,
        index: offset + m.index,
        endIndex: offset + m.index + text.length,
        message: messages.rejected(`@media ${suggestBreakpoint(text, px)}`),
      })
    }
  })
}

function isDisabledRule(decl) {
  for (let node = decl.parent; node; node = node.parent) {
    if (node.type === 'rule' && DISABLED_SELECTOR.test(node.selector)) return true
  }
  return false
}

ruleFunction.ruleName = ruleName
ruleFunction.messages = messages
ruleFunction.meta = { url: 'docs/lint.md' }

export default stylelint.createPlugin(ruleName, ruleFunction)
