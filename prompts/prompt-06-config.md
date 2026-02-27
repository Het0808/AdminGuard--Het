# Prompt 6: Configurable Rules Engine

Refactor the validation logic into a separate `ADMISSION_RULES` configuration object.
- Each rule should have an `id`, `type` (STRICT/SOFT), and a `validate` function.
- The UI should dynamically render validation messages based on this config.
- This makes it easy for the operations team to update cutoffs (e.g., changing 60% to 65%) in one place.
