# Tests

Run tests using pytest:

```bash
# From project root
python -m pytest tests/
```

Tests cover:

- User Registration (Success and Duplicate scenarios)

Configuration:

- `conftest.py`: Sets up in-memory SQLite DB and mocks operating hours check logic.
