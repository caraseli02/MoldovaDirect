# Asset Caching Strategy


## Overview

This document describes the optimized asset naming and long-term caching strategy implemented for Moldova Direct. The strategy is designed to maximize cache hit rates, improve performance, and ensure efficient cache invalidation when assets change.

## Problem Statement

The previous configuration had basic chunk splitting but lacked:
- Organized asset file naming by type
- Immutable cache headers for hash-based assets
- Granular vendor chunk splitting
- Optimized cache invalidation strategy