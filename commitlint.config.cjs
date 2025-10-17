// Conventional Commits rules
module.exports = {
    extends: ['@commitlint/config-conventional'],
    rules: {
        // examples of useful tweaks:
        'subject-case': [2, 'never', ['sentence-case', 'start-case', 'pascal-case', 'upper-case']],
        'type-enum': [
            2,
            'always',
            [
                'feat',     // a new feature
                'fix',      // a bug fix
                'docs',     // documentation changes
                'style',    // formatting, missing semicolons, etc.
                'refactor', // code change that neither fixes a bug nor adds a feature
                'perf',     // performance improvements
                'test',     // adding/updating tests
                'build',    // build system, CI, tooling
                'chore',    // maintenance tasks
                'revert'    // revert commits
            ],
        ],
    },
};
