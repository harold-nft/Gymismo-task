## Overall impression of code quality
- Some of the functions in the `QuestionController` are hard to follow due to the nested and monolithic structure - the `update` function is the largest area of concern.
- Modularising and refactoring the code seems like a key priority, as this will make it significantly more readable, making it easier to maintain and extend.
- There also seem to be issues around error handling
  - In the `list` function, it could make more sense to throw an error if `req.body.keyword` or `req.body.pageIndex` are undefined (as opposed to giving default values for `search` and `page`).
  - Some error messages are truncated or less meaningful - for example only the first error from the `validationResult` function is displayed, and many of the error messages are described as "Failed" or "Not Found" which could be changed.
- The `models` are much more readable (they are simpler by nature) however there are a few issues which need addressing
  - Logical issues:
    - Use of `allowNull` and `defaultValues` - there are instances where `allowNull` is set to `true` yet a `defaultValue` is still defined. Since the `defaultValue` is never triggered in this case, the intended result is ambiguous (although I would assume the `allowNull` is an error here).
    - Foreign keys cannot be null - there are instances where a column is an FK yet `allowNull` is set to `true`.
  - Smaller issues which will require refactoring
    - Indentation does not match that of the Controllers (4 spaces in `models` vs. 2 spaces in `Controllers`).
    - Some redundant code which could be made more concise (e.g. setting `allowNull=true` despite this being the default).

## I would address the issues in the following manner:
- Fix the models first, as the logic in the `Controller` is dependent on these being correct.
  - The issues i've identified are fairly straightforward bug fixes. Squashing these quickly will give the greatest returns for time.
- Fix the error handling in the `QuestionController`
  - This would make testing the code much easier, as we can have more confidence that the error flow is correct and it will be easier to diagnose issues since the error messages will be more meaningful.
- Modularise the `QuestionController`
  - I would identify repeated or lengthy blocks of code and create functions to replace these.
  - I would place these functions can be placed in the `Common` controller, and import them into the `QuestionController`.