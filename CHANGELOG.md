
Changelog
=========


# 1.x release

## v1.3.5 (master)

- Fix: numeric value in style property is not casted to string properly (thx @AaronHirsch)
- Fix: saucelabs integration by removing android tests

## v1.3.4

- Fix: remove broken saucelabs integration

## v1.3.3 (skipped)

## v1.3.2

- Fix: handling aria attributes

## v1.3.1

- Fix: style property parsing due to incorrect variable reuse
- Fix: travis and saucelab integration

## v1.3.0

- Fix: changed to native css parser for inline styles (thx @AkeemMcLennon)
- Fix: do not require DOMParser to be present so that older browser won't choke. (thx @niksy)
- Fix: package dependency to workaround npm bug (thx @voronianski)
- Fix: inconsistent inline css parsing of `url()` across modern browsers
- Fix: update device testing list, limit our scope to modern browsers

## v1.2.1

- Fix: optimization introduced in v1.2.0 cause dom patching issues, removed it for now

## v1.2.0

- Enhance: skip whitespace between child nodes to minimize vdom and reduce unnecessary patching

## v1.1.0

- Feature: allow optional attribute for key lookup

## v1.0.3

- Fix: default namespace should be `null`

## v1.0.2

- Enhance: coverage 100% (though not possible with phantomjs due to lack of html support in their DOMParser API)
- Enhance: document to clarify browser support

## v1.0.1

- Enhance: browser tests and coverage

## v1.0.0

- Major: initial public release
