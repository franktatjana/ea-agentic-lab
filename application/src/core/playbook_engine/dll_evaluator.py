"""
Decision Logic Language (DLL) Evaluator

Evaluates conditions written in DLL syntax against InfoHub context data.
This is the "brain" that determines which playbook rules fire.

Supported Syntax:
    - JSONPath expressions for data access: $.risks[?(@.severity=='HIGH')]
    - Comparison operators: >, <, >=, <=, ==, !=
    - Boolean operators: AND, OR (NOT planned)
    - Existence checks: EXISTS, NOT EXISTS
    - Pseudo-properties: .length for array/object/string length

Examples:
    "$.risks[?(@.severity=='HIGH')].length > 0"     # Has high-severity risks
    "$.horizon_1.arr_percentage > 0.80"             # H1 over 80% of ARR
    "$.swot.strengths EXISTS"                       # SWOT has strengths
    "$.account.arr >= 500000 AND $.account.days > 90"  # Strategic account

Design Notes:
    - Uses jsonpath_ng library for JSONPath parsing
    - Threshold placeholders (${thresholds.xxx}) are substituted BEFORE evaluation
      by ThresholdManager.substitute_condition()
    - Returns boolean (True/False) - no partial matches
    - Errors during evaluation are logged but don't crash the executor
"""

import re
from typing import Any, Dict
from jsonpath_ng.ext import parse as jsonpath_parse
from jsonpath_ng.exceptions import JsonPathParserError, JsonPathLexerError


class DLLEvaluator:
    """
    Evaluate Decision Logic Language conditions.

    The DLL is a simple DSL (Domain-Specific Language) designed to be:
    1. Human-readable in playbook YAML files
    2. Machine-evaluable without full Python execution
    3. Safe (no arbitrary code execution)
    """

    # Supported comparison operators mapped to Python lambdas
    # Order matters in evaluate(): check >= before > to avoid partial matches
    COMPARISON_OPS = {
        '>': lambda a, b: a > b,
        '<': lambda a, b: a < b,
        '>=': lambda a, b: a >= b,
        '<=': lambda a, b: a <= b,
        '==': lambda a, b: a == b,
        '!=': lambda a, b: a != b,
    }

    def __init__(self):
        """Initialize evaluator."""
        pass

    def evaluate(self, condition: str, context: Dict[str, Any]) -> bool:
        """
        Evaluate condition against context.

        Args:
            condition: DLL condition string
                Examples:
                - "$.risks[?(@.severity=='HIGH')].length > 0"
                - "$.horizon_1.arr_percentage > 0.80"
                - "$.swot.strengths EXISTS"

            context: Data to evaluate against (InfoHub data as dict)

        Returns:
            True if condition met, False otherwise

        Raises:
            ValueError: If condition syntax is invalid
        """
        condition = condition.strip()

        # Handle boolean operators FIRST (before other checks)
        # This ensures compound conditions are split correctly
        if ' AND ' in condition:
            return self._evaluate_boolean(condition, context, 'AND')
        if ' OR ' in condition:
            return self._evaluate_boolean(condition, context, 'OR')

        # Handle NOT EXISTS before EXISTS (order matters!)
        if ' NOT EXISTS' in condition:
            return self._evaluate_exists(condition, context, negate=True)
        if ' EXISTS' in condition:
            return self._evaluate_exists(condition, context, negate=False)

        # Handle comparison operators
        for op_str in ['>=', '<=', '>', '<', '==', '!=']:
            if f' {op_str} ' in condition:
                return self._evaluate_comparison(condition, context, op_str)

        raise ValueError(f"Unrecognized condition syntax: {condition}")

    def _evaluate_exists(self, condition: str, context: Dict[str, Any], negate: bool) -> bool:
        """Evaluate EXISTS or NOT EXISTS check."""
        # Extract JSONPath (everything before EXISTS)
        if negate:
            jsonpath_expr = condition.replace(' NOT EXISTS', '').strip()
        else:
            jsonpath_expr = condition.replace(' EXISTS', '').strip()

        # Execute JSONPath
        result = self._execute_jsonpath(jsonpath_expr, context)

        # EXISTS = result is not None and not empty
        exists = result is not None and (not isinstance(result, list) or len(result) > 0)

        return not exists if negate else exists

    def _evaluate_comparison(self, condition: str, context: Dict[str, Any], operator: str) -> bool:
        """Evaluate comparison expression."""
        # Split on operator
        parts = condition.split(f' {operator} ')
        if len(parts) != 2:
            raise ValueError(f"Invalid comparison: {condition}")

        left_expr, right_expr = parts[0].strip(), parts[1].strip()

        # Evaluate left side (JSONPath)
        left_value = self._execute_jsonpath(left_expr, context)

        # Evaluate right side (literal or JSONPath)
        if right_expr.startswith('$'):
            right_value = self._execute_jsonpath(right_expr, context)
        else:
            # Parse as literal (number, string, boolean)
            right_value = self._parse_literal(right_expr)

        # Apply operator
        if left_value is None or right_value is None:
            return False

        op_func = self.COMPARISON_OPS[operator]
        return op_func(left_value, right_value)

    def _evaluate_boolean(self, condition: str, context: Dict[str, Any], operator: str) -> bool:
        """Evaluate boolean expression (AND, OR) - simplified."""
        # For vertical slice, only support simple AND/OR (no parentheses)
        if operator == 'AND':
            parts = condition.split(' AND ')
            return all(self.evaluate(part.strip(), context) for part in parts)
        elif operator == 'OR':
            parts = condition.split(' OR ')
            return any(self.evaluate(part.strip(), context) for part in parts)
        else:
            raise ValueError(f"Unsupported boolean operator: {operator}")

    def _execute_jsonpath(self, expr: str, context: Dict[str, Any]) -> Any:
        """
        Execute JSONPath expression against context.

        Args:
            expr: JSONPath expression (e.g., "$.risks[?(@.severity=='HIGH')].length")
            context: Data to query

        Returns:
            Result of JSONPath query (value, list, or None if not found)

        Note on .length pseudo-property:
            JSONPath doesn't natively support .length, so we handle it specially.
            This allows conditions like "$.risks.length > 0" to count array items.
        """
        try:
            # Handle .length pseudo-property (not native to JSONPath)
            if expr.endswith('.length'):
                base_expr = expr[:-7]  # Remove '.length'
                jsonpath = jsonpath_parse(base_expr)
                matches = jsonpath.find(context)
                if not matches:
                    return 0
                # Return length of first match (assuming it's a list)
                value = matches[0].value
                return len(value) if isinstance(value, (list, dict, str)) else 0

            # Standard JSONPath evaluation
            jsonpath = jsonpath_parse(expr)
            matches = jsonpath.find(context)

            if not matches:
                return None

            # If single match, return value
            if len(matches) == 1:
                return matches[0].value

            # Multiple matches, return list of values
            return [match.value for match in matches]

        except (JsonPathParserError, JsonPathLexerError) as e:
            raise ValueError(f"Invalid JSONPath: {expr} - {e}")

    def _parse_literal(self, value_str: str) -> Any:
        """Parse literal value from string."""
        value_str = value_str.strip()

        # Boolean
        if value_str == 'true':
            return True
        if value_str == 'false':
            return False

        # Null
        if value_str == 'null':
            return None

        # Number
        try:
            # Try int first
            if '.' not in value_str:
                return int(value_str)
            # Then float
            return float(value_str)
        except ValueError:
            pass

        # String (remove quotes if present)
        if value_str.startswith('"') and value_str.endswith('"'):
            return value_str[1:-1]
        if value_str.startswith("'") and value_str.endswith("'"):
            return value_str[1:-1]

        # Return as-is (string without quotes)
        return value_str
