# Code Review & Commit

Review code changes and generate a standardized commit message using the CRC sub-agent.

The sub-agent will:
1. Check git status and examine diffs
2. Review for architecture consistency
3. Assess risks (high/medium/low)
4. Generate a standardized commit message
5. Present findings for approval

**This runs in an independent context** - the main conversation can continue while the sub-agent reviews.
