# Docs for Health WordPress Letter Generator Plugin

[![Build Status](https://app.travis-ci.com/docsforhealth/dfh-wordpress-letter-generator-plugin.svg?branch=master)](https://app.travis-ci.com/docsforhealth/dfh-wordpress-letter-generator-plugin)

Requires the [Docs for Health WordPress Plugin](https://github.com/docsforhealth/dfh-wordpress-plugin)

## Commands

- Initial installation
    + [Set up the base styles submodule](https://git-scm.com/book/en/v2/Git-Tools-Submodules) mounted at `src/scss/base` with `git submodule update --init --recursive`
    + Install `package.json` dependencies with `yarn install`
- During development: `yarn start`

## Deploying

1. Update the `Version` field in the masthead of `dfh-wordpress-letter-generator-plugin.php` to your desired release version
2. For completeness, also update the `version` field in `package.json` to the same version you entered in the prior step
3. Commit changes with `git commit -am <message here>`
4. Create [an annotated tag](https://git-scm.com/book/en/v2/Git-Basics-Tagging) to mark the release with `git tag -a <tag version> -m <release message>`. By convention, the tag version is the same as the release version specified earlier. Note that we use [annotated tags instead of lightweight tags](https://stackoverflow.com/a/25996877) as these are intended for release.
5. Push new commit to remote origin with `git push`
6. Push new tag to remote origin with `git push --tags`. Travis CI will detect the new tag and launch into the build and release process as specified in `.travis.yml`
