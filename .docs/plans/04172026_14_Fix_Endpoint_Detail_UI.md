# Fix: Endpoint Detail page — redundant Copy URL + stray leading slash

**Status:** COMPLETED
**Date:** 2026-04-17

## Bug Description

1. Endpoint detail page shows two Copy URL affordances: an outline button next to the page title, and a copy icon inside the URL preview bar. The top one is redundant noise.
2. "Custom Endpoint" inputs accept a leading `/`. The value is joined as `basePath + '/' + customEndpoint`, so a leading `/` produces `//…` in the final path.

## Root Cause

1. Carried over from earlier design — header had its own Copy URL button before the URL preview bar existed.
2. No sanitisation on the `customEndpoint` state setter. Users typing `/foo` end up with broken routes.

## Fix Strategy

1. Remove the header `Copy URL` `Button` in `EndpointDetailPage` — keep the icon inside the terminal preview row.
2. Strip leading `/` on input for every Custom Endpoint field. Applies to:
   - `EndpointDetailPage` — `customEndpoint` state setter
   - `AddEndpointModal` — `customEndpoint` state setter
   - `CreateResourceModal` — `baseEndpoint` custom mode (same class of field)

## Affected Files

- `frontend/src/pages/EndpointDetailPage.tsx`
- `frontend/src/components/endpoint/AddEndpointModal.tsx`
- `frontend/src/components/endpoint/CreateResourceModal.tsx`

## Tasks

- [x] Remove header Copy URL button
- [x] Sanitise `customEndpoint` input in EndpointDetailPage
- [x] Sanitise `customEndpoint` input in AddEndpointModal
- [x] Sanitise `baseEndpoint` input in CreateResourceModal (custom mode)
- [x] Frontend tsc clean
