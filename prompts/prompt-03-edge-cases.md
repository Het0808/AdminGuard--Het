# Prompt 3: Verify with Edge Cases

Test the form against these scenarios and fix any issues:

1. Name field: Enter "A" (too short), "John123" (has numbers), "" (empty)
2. Phone: Enter "1234567890" (doesn't start with 6-9), "98765" (too short)
3. Aadhaar: Enter "12345678901" (11 digits), "12345678901a" (has letter)
4. Set Interview Status to "Rejected" then try to submit
5. Set Interview Status to "Waitlisted" then set Offer Letter to "Yes" — should work
6. Set Interview Status to "Rejected" then set Offer Letter to "Yes" — should block

Make sure all edge cases are handled.
